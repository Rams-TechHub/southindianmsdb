"use strict";

/*
 * All row definitions live here.
 *  - AUTO lists are rules (genre, decade, rating...) that TMDB re-evaluates on its own,
 *    so they stay fresh without any editing.
 *  - CURATED lists are hand-picked titles. Add a line like "Kaithi (2019)" and it
 *    is matched automatically. Nothing else to maintain.
 */

const LANGUAGES = { ml: "Malayalam", ta: "Tamil", te: "Telugu", kn: "Kannada" };

const DAY = 864e5;
const iso = (offsetDays = 0) => new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 10);
const dateKey = (type) => (type === "movie" ? "primary_release_date" : "first_air_date");
const range = (type, from, to) => {
  const k = dateKey(type);
  const o = {};
  if (from) o[`${k}.gte`] = from;
  if (to) o[`${k}.lte`] = to;
  return o;
};

/* ---------- AUTO lists (rules) ---------- */

const MOVIE_AUTO = [
  { name: "Popular", build: () => ({}) },
  { name: "Top Rated", build: () => ({ sort_by: "vote_average.desc", "vote_count.gte": 100 }) },
  { name: "New Releases", build: (t) => ({ sort_by: `${dateKey(t)}.desc`, ...range(t, null, iso()), "vote_count.gte": 5 }) },
  { name: "Fresh in Theatres", build: (t) => ({ ...range(t, iso(-45), iso()), "vote_count.gte": 0 }) },
  { name: "Coming Soon", build: (t) => ({ ...range(t, iso(1), iso(120)), "vote_count.gte": 0 }) },
  { name: "Box Office Titans", build: () => ({ sort_by: "revenue.desc", "vote_count.gte": 50 }) },
  { name: "Hidden Gems", build: () => ({ sort_by: "vote_average.desc", "vote_average.gte": 7, "vote_count.gte": 20, "vote_count.lte": 400 }) },
  { name: "Edge of the Seat", build: () => ({ with_genres: "53", "vote_average.gte": 6.3, "vote_count.gte": 30 }) },
  { name: "Mass Entertainers", build: () => ({ with_genres: "28", "vote_count.gte": 100 }) },
  { name: "Laugh Riot", build: () => ({ with_genres: "35", "vote_average.gte": 6, "vote_count.gte": 30 }) },
  { name: "Heartstrings", build: () => ({ with_genres: "10749", "vote_average.gte": 6.5, "vote_count.gte": 30 }) },
  { name: "Powerhouse Dramas", build: () => ({ with_genres: "18", sort_by: "vote_average.desc", "vote_average.gte": 7, "vote_count.gte": 50 }) },
  { name: "Crime Files", build: () => ({ with_genres: "80", "vote_count.gte": 30 }) },
  { name: "Whodunits and Mysteries", build: () => ({ with_genres: "9648", "vote_count.gte": 20 }) },
  { name: "Spine Chillers", build: () => ({ with_genres: "27" }) },
  { name: "Beyond Imagination", build: () => ({ with_genres: "878|14" }) },
  { name: "Legends and Legacies", build: () => ({ with_genres: "36|10752" }) },
  { name: "Family Movie Night", build: () => ({ with_genres: "10751|16" }) },
  { name: "Evergreen Classics", build: (t) => ({ ...range(t, null, "1999-12-31"), sort_by: "vote_average.desc", "vote_count.gte": 15 }) },
  { name: "2000s Nostalgia", build: (t) => ({ ...range(t, "2000-01-01", "2009-12-31"), sort_by: "vote_average.desc", "vote_count.gte": 20 }) },
  { name: "The 2010s Wave", build: (t) => ({ ...range(t, "2010-01-01", "2019-12-31"), sort_by: "vote_average.desc", "vote_count.gte": 50 }) },
];

const SERIES_AUTO = [
  { name: "Popular", build: () => ({}) },
  { name: "Top Rated", build: () => ({ sort_by: "vote_average.desc", "vote_count.gte": 20 }) },
  { name: "New Releases", build: (t) => ({ sort_by: `${dateKey(t)}.desc`, ...range(t, null, iso()), "vote_count.gte": 5 }) },
  { name: "Binge-Worthy", build: () => ({ "vote_average.gte": 7.3, "vote_count.gte": 15 }) },
  { name: "Crime and Courtroom", build: () => ({ with_genres: "80", "vote_count.gte": 10 }) },
  { name: "Mystery Box", build: () => ({ with_genres: "9648", "vote_count.gte": 10 }) },
  { name: "Laugh Track", build: () => ({ with_genres: "35", "vote_count.gte": 10 }) },
  { name: "Drama Hours", build: () => ({ with_genres: "18", "vote_average.gte": 6.5, "vote_count.gte": 10 }) },
  { name: "Action and Adventure", build: () => ({ with_genres: "10759", "vote_count.gte": 10 }) },
  { name: "Sci-Fi and Fantasy", build: () => ({ with_genres: "10765", "vote_count.gte": 5 }) },
  { name: "Family and Animation", build: () => ({ with_genres: "10751|16", "vote_count.gte": 5 }) },
];

/* ---------- CURATED lists (hand-picked, movies) ----------
 * Format: "Title (Year)". Optional IMDb id at the end to force an exact match:
 *   "Kaithi (2019) tt9900782"
 * Add, remove or reorder freely. Titles that cannot be matched are skipped.
 */

const CURATED = {
  ml: [
    {
      name: "Mollywood Masterpieces",
      titles: [
        "Manichitrathazhu (1993)", "Kireedam (1989)", "Devasuram (1993)", "Thanmathra (2005)",
        "Premam (2015)", "Kumbalangi Nights (2019)", "Maheshinte Prathikaaram (2016)",
        "Angamaly Diaries (2017)", "Bangalore Days (2014)", "Ustad Hotel (2012)", "Spadikam (1995)",
        "Nadodikkattu (1987)", "Sandesham (1991)", "Thoovanathumbikal (1987)", "Kilukkam (1991)",
      ],
    },
    {
      name: "Malayalam Mind-Benders",
      titles: [
        "Drishyam (2013)", "Memories (2013)", "Joseph (2018)", "Anjaam Pathiraa (2020)", "Nayattu (2021)",
        "Forensic (2020)", "Kooman (2022)", "Iratta (2023)", "Ee Adutha Kaalathu (2012)", "Trance (2020)",
        "Aavasavyuham (2022)", "Kuruthi (2021)", "Cold Case (2020)",
      ],
    },
  ],
  ta: [
    {
      name: "Kollywood Cult Classics",
      titles: [
        "Nayakan (1987)", "Thalapathi (1991)", "Mouna Ragam (1986)", "Anbe Sivam (2003)",
        "Vinnaithaandi Varuvaayaa (2010)", "Aayirathil Oruvan (2010)", "Asuran (2019)", "Vada Chennai (2018)",
        "Soorarai Pottru (2020)", "Ratsasan (2018)", "Super Deluxe (2019)", "Pariyerum Perumal (2018)",
        "Jai Bhim (2021)", "96 (2018)", "Visaranai (2015)", "Aaranya Kaandam (2010)", "Autograph (2004)",
      ],
    },
    {
      name: "Tamil Mass Moments",
      titles: [
        "Vikram (2022)", "Master (2021)", "Theri (2016)", "Mersal (2017)", "Thuppakki (2012)", "Kaithi (2019)",
        "Vettaiyaadu Vilaiyaadu (2006)", "Singam (2010)", "Jailer (2023)", "Leo (2023)",
      ],
    },
  ],
  te: [
    {
      name: "Tollywood Titans",
      titles: [
        "Baahubali: The Beginning (2015)", "Baahubali 2: The Conclusion (2017)", "RRR (2022)", "Magadheera (2009)",
        "Eega (2012)", "Sita Ramam (2022)", "Jersey (2019)", "Mahanati (2018)", "Arjun Reddy (2017)",
        "Pelli Choopulu (2016)", "Goodachari (2018)", "Agent Sai Srinivasa Athreya (2019)",
        "C/o Kancharapalem (2018)", "Kshanam (2016)", "Shiva (1989)", "Mayabazar (1957)",
      ],
    },
    {
      name: "Telugu Mass Mania",
      titles: [
        "Pokiri (2006)", "Athadu (2005)", "Pushpa: The Rise (2021)", "Ala Vaikunthapurramuloo (2020)",
        "Akhanda (2021)", "Temper (2015)", "Simhadri (2003)", "Khaidi No. 150 (2017)", "Gabbar Singh (2012)",
        "Dookudu (2011)", "Waltair Veerayya (2023)",
      ],
    },
  ],
  kn: [
    {
      name: "Sandalwood Spotlight",
      titles: [
        "K.G.F: Chapter 1 (2018)", "K.G.F: Chapter 2 (2022)", "Kantara (2022)", "Ulidavaru Kandanthe (2014)",
        "Lucia (2013)", "Kirik Party (2016)", "U Turn (2016)", "Garuda Gamana Vrishabha Vahana (2021)",
        "777 Charlie (2022)", "Mungaru Male (2006)", "Rangitaranga (2015)", "Sapta Sagaradaache Ello (2023)",
        "Gaalipata (2008)",
      ],
    },
    {
      name: "Kannada Hidden Treasures",
      titles: [
        "Thithi (2015)", "Ondu Motteya Kathe (2017)", "Godhi Banna Sadharana Mykattu (2016)", "Kavaludaari (2019)",
        "Dia (2020)", "Rama Rama Re (2016)", "Pushpaka Vimana (2017)", "Humble Politician Nograj (2018)",
        "Operation Alamelamma (2017)", "Bell Bottom (2019)", "Act 1978 (2020)",
      ],
    },
  ],
};

/* ---------- OUTSIDE SOURCES ----------
 * Wikidata and Wikipedia need no key. MDBList needs MDBLIST_KEY on the server.
 */

// Wikidata: award rows per language, plus people. Names must match Wikidata's English label.
const WIKIDATA_THEMES = [
  { name: "National Award Winners", spec: { awardContains: "national film award" } },
  { name: "Festival Favourites", spec: { awardContains: "festival" } },
];
const PEOPLE = {
  ml: [
    { name: "The Mohanlal Files", spec: { actor: "Mohanlal" } },
    { name: "Mammootty Marathon", spec: { actor: "Mammootty" } },
    { name: "Fahadh Faasil Spotlight", spec: { actor: "Fahadh Faasil" } },
    { name: "Lijo Jose Pellissery Cinema", spec: { director: "Lijo Jose Pellissery" } },
  ],
  ta: [
    { name: "Thalaivar Time", spec: { actor: "Rajinikanth" } },
    { name: "Ulaganayagan Files", spec: { actor: "Kamal Haasan" } },
    { name: "Vijay Sethupathi Showcase", spec: { actor: "Vijay Sethupathi" } },
    { name: "Mani Ratnam Magic", spec: { director: "Mani Ratnam" } },
  ],
  te: [
    { name: "Allu Arjun Anthology", spec: { actor: "Allu Arjun" } },
    { name: "Mahesh Babu Marathon", spec: { actor: "Mahesh Babu" } },
    { name: "Rebel Star Rewind", spec: { actor: "Prabhas" } },
    { name: "Rajamouli Universe", spec: { director: "S. S. Rajamouli" } },
  ],
  kn: [
    { name: "Puneeth Rajkumar Remembered", spec: { actor: "Puneeth Rajkumar" } },
    { name: "Rishab Shetty Rewind", spec: { actor: "Rishab Shetty" } },
    { name: "Kichcha Sudeep Specials", spec: { actor: "Sudeep" } },
    { name: "Prashanth Neel Power", spec: { director: "Prashanth Neel" } },
  ],
};

// Wikipedia: ranked and yearly list pages. A page that doesn't exist just shows an empty row.
const wikipediaLists = (label) => [
  { name: "Box Office Kings", page: `List of highest-grossing ${label} films` },
  { name: "Filmfare Best Film Winners", page: `Filmfare Award for Best Film \u2013 ${label}` },
  { name: `Class of ${new Date().getFullYear() - 1}`, page: `List of ${label} films of ${new Date().getFullYear() - 1}` },
];

// MDBList: paste public list URLs here. Needs MDBLIST_KEY in Vercel (free key from mdblist.com/preferences).
//   { name: "Row name", url: "https://mdblist.com/lists/<user>/<list>", type: "movie" }   (type: "movie" or "series")
const MDBLIST = { ml: [], ta: [], te: [], kn: [] };

/* ---------- Home rows (shown as their own rows on the Stremio/Nuvio home screen) ---------- */

const FEATURED_AUTO = { movie: ["Hidden Gems"], series: ["Binge-Worthy"] };
const FEATURED_SOURCE = ["National Award Winners", "Box Office Kings"];

/* ---------- Helpers ---------- */

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const ENTRY_RE = /^(.*?)\s*\((\d{4})\)(?:\s+(tt\d+))?$/;
function parseEntry(s) {
  const m = ENTRY_RE.exec(s.trim());
  return m ? { title: m[1], year: m[2], imdb: m[3] } : { title: s.trim() };
}

/* Every list available for a language and type, in dropdown order. */
function sourceLists(type, lang) {
  const out = [];
  if (type === "movie") {
    for (const t of WIKIDATA_THEMES) out.push({ kind: "wikidata", name: t.name, spec: t.spec });
    for (const w of wikipediaLists(LANGUAGES[lang])) out.push({ kind: "wikipedia", name: w.name, page: w.page });
    for (const p of PEOPLE[lang] || []) out.push({ kind: "wikidata", name: p.name, spec: p.spec });
  }
  if (process.env.MDBLIST_KEY) {
    for (const m of MDBLIST[lang] || []) if ((m.type || "movie") === type) out.push({ kind: "mdblist", name: m.name, url: m.url });
  }
  return out.map((l) => ({ ...l, slug: slug(l.name) }));
}

function getLists(type, lang) {
  const auto = (type === "movie" ? MOVIE_AUTO : SERIES_AUTO).map((l) => ({ kind: "auto", name: l.name, slug: slug(l.name), build: l.build }));
  const curated = type === "movie" ? (CURATED[lang] || []).map((l) => ({ kind: "curated", name: l.name, slug: slug(l.name), titles: l.titles })) : [];
  const core = auto.slice(0, 3);
  return [...core, ...curated, ...sourceLists(type, lang), ...auto.slice(3)];
}

function findList(type, lang, nameOrSlug) {
  if (!nameOrSlug) return getLists(type, lang)[0];
  return getLists(type, lang).find((l) => l.name === nameOrSlug || l.slug === nameOrSlug);
}

/* One main catalog per language and type (dropdown with every list), plus featured home rows. */
function buildCatalogs(langs, opts = {}) {
  const featured = opts.featured !== false;
  const catalogs = [];
  for (const type of ["movie", "series"]) {
    for (const lang of langs) {
      const label = LANGUAGES[lang];
      const lists = getLists(type, lang);
      catalogs.push({
        type,
        id: `south_${type}_${lang}`,
        name: `${label} ${type === "movie" ? "Movies" : "Series"}`,
        extra: [
          { name: "genre", options: lists.map((l) => l.name), isRequired: false },
          { name: "search", isRequired: false },
          { name: "skip", isRequired: false },
        ],
      });
      if (!featured) continue;
      const rows = [
        ...lists.filter((l) => l.kind === "curated").slice(0, 1),
        ...lists.filter((l) => l.kind === "auto" && FEATURED_AUTO[type].includes(l.name)),
        ...lists.filter((l) => l.kind !== "auto" && l.kind !== "curated" && FEATURED_SOURCE.includes(l.name)),
      ];
      for (const l of rows) {
        catalogs.push({
          type,
          id: `south_${type}_${lang}__${l.slug}`,
          name: l.kind === "curated" ? l.name : `${label} ${l.name}`,
          extra: [{ name: "skip", isRequired: false }],
        });
      }
    }
  }
  return catalogs;
}

function parseCatalogId(id) {
  const m = /^south_(movie|series)_(ml|ta|te|kn)(?:__([a-z0-9-]+))?$/.exec(id || "");
  return m ? { type: m[1], lang: m[2], list: m[3] } : null;
}

/* Names of every collection per language, for the landing page. */
function collectionsFor(lang) {
  const movie = getLists("movie", lang);
  return {
    curated: movie.filter((l) => l.kind === "curated").map((l) => l.name),
    community: movie.filter((l) => l.kind === "wikidata" || l.kind === "wikipedia").map((l) => l.name),
    movies: MOVIE_AUTO.map((l) => l.name),
    series: SERIES_AUTO.map((l) => l.name),
  };
}

module.exports = { LANGUAGES, getLists, findList, buildCatalogs, parseCatalogId, parseEntry, collectionsFor };
