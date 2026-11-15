"use strict";

const { findList, parseEntry } = require("./catalogs");
const { fetchEntries } = require("./sources");

const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";
const PAGE_SIZE = 20; // TMDB returns 20 results per page
const DAY = 24 * 3600 * 1000;

async function tmdb(path, key, params = {}) {
  const url = new URL(API + path);
  url.searchParams.set("api_key", key);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, v);
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    const err = new Error(`TMDB ${res.status} for ${path}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Stremio needs IMDb ids so Cinemeta and stream addons recognise the title.
const idCache = new Map();

async function imdbId(tmdbType, tmdbId, key) {
  const ck = `${tmdbType}:${tmdbId}`;
  const hit = idCache.get(ck);
  if (hit && Date.now() - hit.t < 7 * DAY) return hit.v;
  try {
    const data = await tmdb(`/${tmdbType}/${tmdbId}/external_ids`, key);
    const v = data.imdb_id || null;
    idCache.set(ck, { v, t: Date.now() });
    return v;
  } catch (e) {
    if (e.status === 401) throw e; // bad key: surface it
    return null; // transient: skip this title, don't cache
  }
}

function toMeta(item, type, id) {
  const date = item.release_date || item.first_air_date || "";
  return {
    id,
    type,
    name: item.title || item.name,
    poster: item.poster_path ? `${IMG}/w342${item.poster_path}` : `https://images.metahub.space/poster/medium/${id}/img`,
    background: item.backdrop_path ? `${IMG}/w780${item.backdrop_path}` : undefined,
    description: item.overview || undefined,
    releaseInfo: date.slice(0, 4) || undefined,
  };
}

/* Turn a list's rule into TMDB discover parameters. */
function discoverParams(type, lang, list, page) {
  const base = { with_original_language: lang, page, include_adult: false, sort_by: "popularity.desc", "vote_count.gte": 10 };
  return { ...base, ...(list.build ? list.build(type) : {}) };
}

/* Match one hand-picked "Title (Year)" entry to a TMDB item, then to an IMDb id. */
const entryCache = new Map();

async function resolveEntry(entry, type, lang, key) {
  const tt = type === "movie" ? "movie" : "tv";
  const ck = `${type}:${lang}:${entry.imdb || entry.title + entry.year}`;
  const hit = entryCache.get(ck);
  if (hit && Date.now() - hit.t < 7 * DAY) return hit.v;

  let item = null;
  let id = entry.imdb || null;
  try {
    if (id) {
      const found = await tmdb(`/find/${id}`, key, { external_source: "imdb_id" });
      item = (found[`${tt}_results`] || [])[0] || null;
    } else {
      const q = { query: entry.title, include_adult: false };
      if (entry.year) q[type === "movie" ? "year" : "first_air_date_year"] = entry.year;
      const data = await tmdb(`/search/${tt}`, key, q);
      const rs = data.results || [];
      item = rs.find((r) => r.original_language === lang) || (entry.year ? rs[0] : null) || null;
    }
    if (!item) return null;
    id = id || (await imdbId(tt, item.id, key));
  } catch (e) {
    if (e.status === 401) throw e;
    return null;
  }
  const v = id ? toMeta(item, type, id) : null;
  if (v) entryCache.set(ck, { v, t: Date.now() });
  return v;
}

/* Entries that already carry an IMDb id (Wikidata, MDBList) need no lookup. */
function liteMeta(e, type) {
  return { id: e.imdb, type, name: e.title, poster: `https://images.metahub.space/poster/medium/${e.imdb}/img`, releaseInfo: e.year || undefined };
}

async function withIds(results, tt, type, key) {
  const metas = await Promise.all(
    results.map(async (r) => {
      const id = await imdbId(tt, r.id, key);
      return id ? toMeta(r, type, id) : null;
    })
  );
  return metas.filter(Boolean);
}

async function getCatalog({ key, type, lang, list, skip = 0, search }) {
  const tt = type === "movie" ? "movie" : "tv";
  const page = Math.floor(skip / PAGE_SIZE) + 1;

  // Outside-source lists (Wikidata, Wikipedia, MDBList)
  const ext = !search && findList(type, lang, list);
  if (ext && ["wikidata", "wikipedia", "mdblist"].includes(ext.kind)) {
    const entries = (await fetchEntries(ext, lang, type)).slice(skip, skip + PAGE_SIZE);
    const metas = await Promise.all(entries.map((e) => (e.imdb ? liteMeta(e, type) : key ? resolveEntry(e, type, lang, key) : null)));
    return metas.filter(Boolean);
  }

  if (!key) throw new Error("TMDB_KEY is not set");

  // Search within the language's titles
  if (search) {
    const data = await tmdb(`/search/${tt}`, key, { query: search, page, include_adult: false });
    return withIds(data.results.filter((r) => r.original_language === lang), tt, type, key);
  }

  const def = findList(type, lang, list);
  if (!def) return [];

  // Hand-picked list: resolve this page of titles
  if (def.kind === "curated") {
    const slice = def.titles.slice(skip, skip + PAGE_SIZE).map(parseEntry);
    const metas = await Promise.all(slice.map((e) => resolveEntry(e, type, lang, key)));
    return metas.filter(Boolean);
  }

  // Rule-based list
  const data = await tmdb(`/discover/${tt}`, key, discoverParams(type, lang, def, page));
  return withIds(data.results, tt, type, key);
}

module.exports = { getCatalog };
