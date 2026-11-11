"use strict";

const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";
const PAGE_SIZE = 20; // TMDB returns 20 results per page

const LANGUAGES = { ml: "Malayalam", ta: "Tamil", te: "Telugu", kn: "Kannada" };

// TMDB genre ids differ between movies and TV.
const GENRES = {
  movie: { Action: 28, Animation: 16, Comedy: 35, Crime: 80, Drama: 18, Family: 10751, Fantasy: 14, History: 36, Horror: 27, Mystery: 9648, Romance: 10749, "Sci-Fi": 878, Thriller: 53 },
  series: { Action: 10759, Animation: 16, Comedy: 35, Crime: 80, Drama: 18, Family: 10751, Mystery: 9648, "Sci-Fi": 10765 },
};
const LISTS = {
  movie: ["Popular", "Top Rated", "New Releases", "Box Office"],
  series: ["Popular", "Top Rated", "New Releases"],
};

/* One catalog per language and type; the dropdown (genre extra) switches the list. */
function buildCatalogs(langs) {
  const catalogs = [];
  for (const type of ["movie", "series"]) {
    for (const lang of langs) {
      catalogs.push({
        type,
        id: `south_${type}_${lang}`,
        name: `${LANGUAGES[lang]} ${type === "movie" ? "Movies" : "Series"}`,
        extra: [
          { name: "genre", options: [...LISTS[type], ...Object.keys(GENRES[type])], isRequired: false },
          { name: "search", isRequired: false },
          { name: "skip", isRequired: false },
        ],
      });
    }
  }
  return catalogs;
}

function parseCatalogId(id) {
  const m = /^south_(movie|series)_(ml|ta|te|kn)$/.exec(id || "");
  return m ? { type: m[1], lang: m[2] } : null;
}

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

function discoverParams(type, lang, list, page) {
  const isMovie = type === "movie";
  const today = new Date().toISOString().slice(0, 10);
  const p = { with_original_language: lang, page, include_adult: false, sort_by: "popularity.desc", "vote_count.gte": 10 };

  if (list === "Top Rated") {
    p.sort_by = "vote_average.desc";
    p["vote_count.gte"] = isMovie ? 100 : 20;
  } else if (list === "New Releases") {
    p.sort_by = isMovie ? "primary_release_date.desc" : "first_air_date.desc";
    p[isMovie ? "primary_release_date.lte" : "first_air_date.lte"] = today;
    p["vote_count.gte"] = 5;
  } else if (list === "Box Office" && isMovie) {
    p.sort_by = "revenue.desc";
    p["vote_count.gte"] = 50;
  } else if (GENRES[type][list]) {
    p.with_genres = GENRES[type][list];
  }
  return p;
}

// Stremio needs IMDb ids so Cinemeta and stream addons recognise the title.
const idCache = new Map();
const ID_TTL = 7 * 24 * 3600 * 1000;

async function imdbId(tmdbType, tmdbId, key) {
  const ck = `${tmdbType}:${tmdbId}`;
  const hit = idCache.get(ck);
  if (hit && Date.now() - hit.t < ID_TTL) return hit.v;
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

async function getCatalog({ key, type, lang, genre, skip = 0, search }) {
  const tt = type === "movie" ? "movie" : "tv";
  const page = Math.round(skip / PAGE_SIZE) + 1;

  let results;
  if (search) {
    const data = await tmdb(`/search/${tt}`, key, { query: search, page, include_adult: false });
    results = data.results.filter((r) => r.original_language === lang);
  } else {
    const data = await tmdb(`/discover/${tt}`, key, discoverParams(type, lang, genre || "Popular", page));
    results = data.results;
  }

  const metas = await Promise.all(
    results.map(async (r) => {
      const id = await imdbId(tt, r.id, key);
      return id ? toMeta(r, type, id) : null;
    })
  );
  return metas.filter(Boolean);
}

module.exports = { LANGUAGES, buildCatalogs, parseCatalogId, getCatalog };
