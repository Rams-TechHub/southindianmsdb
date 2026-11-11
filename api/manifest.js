"use strict";

const { LANGUAGES, buildCatalogs, parseCatalogId, getCatalog } = require("../lib/tmdb");
const { landingPage, ASSETS } = require("../lib/landing");

const ALL_LANGS = Object.keys(LANGUAGES);
// Install path: /<32-char TMDB key>[_<ml-ta-te-kn>]/manifest.json
const CONFIG_RE = /^([a-f0-9]{32})(?:_([a-z]{2}(?:-[a-z]{2})*))?$/i;

function parseConfig(seg) {
  const m = CONFIG_RE.exec(seg || "");
  if (!m) return null;
  const picked = m[2] ? m[2].toLowerCase().split("-").filter((l) => LANGUAGES[l]) : [];
  return { key: m[1], langs: picked.length ? picked : ALL_LANGS };
}

function buildManifest(cfg) {
  return {
    id: "org.southindiancinema.addon",
    version: "2.0.0",
    name: "South Indian Cinema Hub",
    description: "Malayalam, Tamil, Telugu and Kannada movies and series: popular, top rated, new releases, box office and genre rows.",
    logo: ASSETS.logo,
    background: ASSETS.backdrop,
    // Catalog only: titles use IMDb ids, so Cinemeta supplies the details
    // and your stream addons match them as usual.
    resources: ["catalog"],
    types: ["movie", "series"],
    catalogs: buildCatalogs(cfg ? cfg.langs : ALL_LANGS),
    behaviorHints: { configurable: true, configurationRequired: !cfg },
  };
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
  const segs = pathname.split("/").filter(Boolean);
  const cfg = parseConfig(segs[0]);
  const rest = cfg ? segs.slice(1) : segs;
  const last = rest[rest.length - 1];

  // Landing / configure page
  if (rest.length === 0 || last === "configure" || (rest.length === 2 && rest[0] === "api" && rest[1] === "manifest")) {
    return send(res, 200, "text/html; charset=utf-8", landingPage(), "public, max-age=300");
  }

  if (last === "manifest.json") {
    return json(res, 200, buildManifest(cfg), "public, max-age=300");
  }

  if (rest[0] === "catalog") {
    // /catalog/<type>/<id>.json  or  /catalog/<type>/<id>/<extra>.json  (extra e.g. genre=Top%20Rated&skip=20)
    const id = (rest[2] || "").replace(/\.json$/, "");
    const extra = new URLSearchParams((rest[3] || "").replace(/\.json$/, ""));
    const target = parseCatalogId(id);
    if (!cfg || !target || target.type !== rest[1] || !cfg.langs.includes(target.lang)) {
      return json(res, 200, { metas: [] });
    }
    try {
      const metas = await getCatalog({
        key: cfg.key,
        type: target.type,
        lang: target.lang,
        genre: extra.get("genre") || undefined,
        skip: parseInt(extra.get("skip"), 10) || 0,
        search: extra.get("search") || undefined,
      });
      return json(res, 200, { metas }, "public, s-maxage=3600, stale-while-revalidate=86400");
    } catch (err) {
      console.error(`catalog ${id} failed:`, err.message);
      return json(res, 200, { metas: [] });
    }
  }

  return json(res, 404, { error: "Not found" });
};
