"use strict";

/*
 * Outside sources for collections. Each fetcher returns a plain array of entries:
 *   { title, year?, imdb? }
 * Entries with an IMDb id need no TMDB lookup at all. Entries with only a title
 * are matched through TMDB by lib/tmdb.js.
 *
 *  - Wikidata   free, no key        (awards, actors, directors)
 *  - Wikipedia  free, no key        (ranked and yearly list pages)
 *  - MDBList    free key on server  (any public MDBList list)
 */

const UA = "SouthIndianCinemaHub/3.0 (https://southindianmsdb.qilabs.dev; Stremio addon)";
const TTL = 24 * 3600 * 1000;
const cache = new Map();

/* Fresh cache hit, else fetch. If the fetch fails, serve the stale copy rather than nothing. */
async function cached(key, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return hit.v;
  try {
    const v = await fn();
    if (v.length) cache.set(key, { v, t: Date.now() });
    return v;
  } catch (e) {
    if (hit) return hit.v;
    throw e;
  }
}

async function get(url, headers = {}) {
  const res = await fetch(url, { headers: { "User-Agent": UA, ...headers }, signal: AbortSignal.timeout(9000) });
  if (!res.ok) {
    const err = new Error(`${new URL(url).host} ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res;
}

/* ---------- Wikidata ---------- */

const WD_LANG = { ml: "Q36236", ta: "Q5885", te: "Q8097", kn: "Q33673" }; // Malayalam, Tamil, Telugu, Kannada
const SOUTH = Object.values(WD_LANG).map((q) => `wd:${q}`).join(" ");
const lit = (s) => String(s).replace(/[\\"\n\r]/g, " ");

function wikidataQuery(lang, spec) {
  const w = ["?film wdt:P31 wd:Q11424; wdt:P345 ?imdb.", 'FILTER(STRSTARTS(?imdb, "tt"))'];
  if (spec.actor || spec.director) {
    // A person's films, limited to the four South Indian languages.
    w.push(`?film wdt:P364 ?fl. VALUES ?fl { ${SOUTH} }`);
    w.push(`?p wdt:P31 wd:Q5; rdfs:label "${lit(spec.actor || spec.director)}"@en.`);
    w.push(`?film wdt:${spec.actor ? "P161" : "P57"} ?p.`);
  } else {
    w.push(`?film wdt:P364 wd:${WD_LANG[lang]}.`);
  }
  if (spec.awardContains) {
    w.push(`?film wdt:P166 ?aw. ?aw rdfs:label ?awl. FILTER(LANG(?awl) = "en" && CONTAINS(LCASE(STR(?awl)), "${lit(spec.awardContains)}"))`);
  }
  w.push('?film rdfs:label ?title. FILTER(LANG(?title) = "en")', "OPTIONAL { ?film wdt:P577 ?d. }");
  return `SELECT ?imdb ?title (MIN(YEAR(?d)) AS ?year) WHERE { ${w.join(" ")} } GROUP BY ?imdb ?title ORDER BY DESC(?year) LIMIT 100`;
}

async function wikidata(lang, spec) {
  const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(wikidataQuery(lang, spec));
  const data = await (await get(url, { Accept: "application/sparql-results+json" })).json();
  const seen = new Set();
  const out = [];
  for (const b of data.results.bindings) {
    const imdb = b.imdb.value;
    if (seen.has(imdb)) continue;
    seen.add(imdb);
    out.push({ title: b.title.value, year: b.year ? b.year.value : undefined, imdb });
  }
  return out;
}

/* ---------- Wikipedia ---------- */

const ENT = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&#x27;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };
const decode = (s) => s.replace(/&(?:amp|quot|#39|#x27|lt|gt|nbsp);/g, (m) => ENT[m]);

/* Film titles in Wikipedia tables are italic links: <i><a title="Drishyam (2013 film)">Drishyam</a></i> */
function wikipediaTitles(html) {
  const re = /<i>\s*<a [^>]*?title="([^"]*)"[^>]*>([^<]+)<\/a>\s*<\/i>/g;
  const seen = new Set();
  const out = [];
  let m;
  while ((m = re.exec(html))) {
    const attr = decode(m[1]).replace(/ \(page does not exist\)$/, "");
    if (/\b(TV|web|television|miniseries)\b/i.test(attr)) continue;
    const title = decode(m[2]).trim();
    const year = (/\((\d{4})[^)]*film\)/.exec(attr) || [])[1];
    const k = title.toLowerCase() + (year || "");
    if (!title || seen.has(k)) continue;
    seen.add(k);
    out.push({ title, year });
  }
  return out.slice(0, 100);
}

async function wikipedia(page) {
  const url = "https://en.wikipedia.org/w/api.php?action=parse&prop=text&format=json&formatversion=2&redirects=1&page=" + encodeURIComponent(page);
  const data = await (await get(url)).json();
  if (!data.parse) return [];
  return wikipediaTitles(data.parse.text);
}

/* ---------- MDBList ---------- */

async function mdblist(listUrl, type, key) {
  const m = /mdblist\.com\/lists\/([^/]+)\/([^/?#]+)/.exec(listUrl);
  if (!m || !key) return [];
  // Primary: the official API. Fallback: the list's public JSON page.
  let data;
  try {
    data = await (await get(`https://api.mdblist.com/lists/${m[1]}/${m[2]}/items?limit=100&apikey=${encodeURIComponent(key)}`)).json();
  } catch (e) {
    if (e.status === 401 || e.status === 403) throw e;
    data = await (await get(`https://mdblist.com/lists/${m[1]}/${m[2]}/json/`)).json();
  }
  const items = Array.isArray(data) ? data : (type === "movie" ? data.movies : data.shows) || [];
  return items
    .filter((i) => i.imdb_id && (!i.mediatype || i.mediatype === (type === "movie" ? "movie" : "show")))
    .map((i) => ({ title: i.title, year: i.release_year ? String(i.release_year) : undefined, imdb: i.imdb_id }))
    .slice(0, 100);
}

/* ---------- Entry point ---------- */

async function fetchEntries(def, lang, type) {
  if (def.kind === "wikidata") return cached(`wd:${lang}:${JSON.stringify(def.spec)}`, () => wikidata(lang, def.spec));
  if (def.kind === "wikipedia") return cached(`wp:${def.page}`, () => wikipedia(def.page));
  if (def.kind === "mdblist") return cached(`md:${type}:${def.url}`, () => mdblist(def.url, type, process.env.MDBLIST_KEY));
  return [];
}

module.exports = { fetchEntries, wikidataQuery, wikipediaTitles };
