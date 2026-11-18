"use strict";

const { LANGUAGES, buildCatalogs, parseCatalogId, collectionsFor } = require("../lib/catalogs");
const { getCatalog } = require("../lib/tmdb");
const { landingPage } = require("../lib/landing");

const ALL_LANGS = Object.keys(LANGUAGES);

// Install paths (all work):
//   /manifest.json                  every language, shared key
//   /ml-ta/manifest.json            chosen languages, shared key
//   /<32-char key>_ml-ta/manifest.json   chosen languages, your own TMDB key (optional)
const CONFIG_RE = /^(?:([a-f0-9]{32})(?:_|$))?((?:ml|ta|te|kn)(?:-(?:ml|ta|te|kn))*)?$/i;

function parseConfig(seg) {
  const m = CONFIG_RE.exec(seg || "");
  if (!seg || !m || (!m[1] && !m[2])) return null;
  const langs = m[2] ? [...new Set(m[2].toLowerCase().split("-"))].filter((l) => LANGUAGES[l]) : [];
  return { key: m[1] || null, langs: langs.length ? langs : ALL_LANGS };
}

function buildManifest(cfg, origin) {
  return {
    id: "org.southindiancinema.addon",
    version: "3.0.0",
    name: "South Indian Cinema Hub",
    description: "Malayalam, Tamil, Telugu and Kannada movies and series, with hand-picked collections like Mollywood Masterpieces and Sandalwood Spotlight. Free, no keys needed.",
    logo: `${origin}/logo.png`,
    background: `${origin}/banner.jpg`,
    // Catalog only: titles use IMDb ids, so Cinemeta supplies the details
    // and your stream addons match them as usual.
    resources: ["catalog"],
    types: ["movie", "series"],
    catalogs: buildCatalogs(cfg ? cfg.langs : ALL_LANGS),
    behaviorHints: { configurable: true, configurationRequired: false },
  };
}

// Vercel values pasted with stray spaces, newlines or quotes are cleaned up here.
const cleanKey = (v) => String(v || "").trim().replace(/^["']+|["']+$/g, "").trim();

async function status() {
  const key = cleanKey(process.env.TMDB_KEY);
  const out = {
    tmdbKeySet: key.length > 0,
    tmdbKeyLength: key.length, // a v3 API key is 32
    looksLikeReadAccessToken: key.startsWith("eyJ"), // wrong key type if true
    mdblistKeySet: cleanKey(process.env.MDBLIST_KEY).length > 0,
  };
  if (key) {
    try {
      const r = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(8000) });
      out.tmdbStatus = r.status; // 200 = key works, 401 = TMDB rejected it
    } catch (e) {
      out.tmdbStatus = `unreachable: ${e.message}`;
    }
  }
  return out;
}

function send(res, status, type, body, cache) {
  res.statusCode = status;
  res.setHeader("Content-Type", type);
  res.setHeader("Cache-Control", cache || "no-store");
  res.end(body);
}
const json = (res, status, obj, cache) => send(res, status, "application/json; charset=utf-8", JSON.stringify(obj), cache);

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return send(res, 204, "text/plain", "");

  const { pathname } = new URL(req.url, "http://localhost");
  const host = req.headers["x-forwarded-host"] || req.headers.host || "southindianmsdb.qilabs.dev";
  const origin = `${req.headers["x-forwarded-proto"] || "https"}://${host}`;
  const segs = pathname.split("/").filter(Boolean);
  const cfg = parseConfig(segs[0]);
  const rest = cfg ? segs.slice(1) : segs;
  const last = rest[rest.length - 1];

  if (rest[0] === "status") return json(res, 200, await status());

  // Landing / configure page
  if (rest.length === 0 || last === "configure" || (rest.length === 2 && rest[0] === "api" && rest[1] === "manifest")) {
    const collections = {};
    for (const l of ALL_LANGS) collections[l] = collectionsFor(l);
    return send(res, 200, "text/html; charset=utf-8", landingPage({ languages: LANGUAGES, collections, origin }), "public, max-age=300");
  }

  if (last === "manifest.json") {
    return json(res, 200, buildManifest(cfg, origin), "public, max-age=300");
  }

  if (rest[0] === "catalog") {
    // /catalog/<type>/<id>.json  or  /catalog/<type>/<id>/<extra>.json  (extra e.g. genre=Hidden%20Gems&skip=20)
    const id = (rest[2] || "").replace(/\.json$/, "");
    const extra = new URLSearchParams((rest[3] || "").replace(/\.json$/, ""));
    const target = parseCatalogId(id);
    const langs = cfg ? cfg.langs : ALL_LANGS;
    if (!target || target.type !== rest[1] || !langs.includes(target.lang)) {
      return json(res, 200, { metas: [] });
    }
    const key = (cfg && cfg.key) || cleanKey(process.env.TMDB_KEY) || undefined;
    try {
      const metas = await getCatalog({
        key,
        type: target.type,
        lang: target.lang,
        list: target.list || extra.get("genre") || undefined,
        skip: parseInt(extra.get("skip"), 10) || 0,
        search: extra.get("search") || undefined,
      });
      // Don't let a failed or empty answer stick in the CDN for hours.
      const cache = metas.length ? "public, s-maxage=21600, stale-while-revalidate=86400" : "public, s-maxage=60";
      return json(res, 200, { metas }, cache);
    } catch (err) {
      console.error(`catalog ${id} failed:`, err.message);
      return json(res, 200, { metas: [] });
    }
  }

  return json(res, 404, { error: "Not found" });
};
