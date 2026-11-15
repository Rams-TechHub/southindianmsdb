# southindianmsdb

Stremio and Nuvio catalog add-on for Malayalam, Tamil, Telugu and Kannada movies and series.
Users install it with one tap. No API key needed on their side.

## Setup (once)

1. Create a free TMDB API key (themoviedb.org, Settings, API, use the 32-character v3 key).
2. In Vercel: Project, Settings, Environment Variables, add `TMDB_KEY` with that key.
3. Redeploy.

Users can still add their own key under "Advanced" on the install page. That is optional.

Optional: add `MDBLIST_KEY` (free, from mdblist.com/preferences) to enable MDBList rows.

## Project structure

```text
api/manifest.js    router: install page, manifest.json, catalog responses
lib/catalogs.js    every row: rule-based lists, hand-picked collections, home rows
lib/tmdb.js        TMDB client, title matching, IMDb ids
lib/sources.js     Wikidata, Wikipedia and MDBList fetchers (cached 24 hours)
lib/landing.js     install page
vercel.json        rewrites everything to api/manifest.js
```

## Adding collections

Open `lib/catalogs.js`.

**Hand-picked collection** (never changes unless you edit it): add an entry under `CURATED`:

```js
{ name: "Mollywood Masterpieces", titles: ["Kireedam (1989)", "Kaithi (2019) tt9900782"] }
```

Write `Title (Year)`. Add an IMDb id at the end only if a title matches the wrong film.
The first collection of each language also shows as its own row on the home screen.

**Rule-based row** (refreshes by itself): add a line to `MOVIE_AUTO` or `SERIES_AUTO`:

```js
{ name: "Edge of the Seat", build: () => ({ with_genres: "53", "vote_average.gte": 6.3, "vote_count.gte": 30 }) }
```

Home screen rows are picked in `FEATURED_AUTO` and `FEATURED_SOURCE`.

## Outside sources

All in `lib/catalogs.js`, fetched by `lib/sources.js`. Results are cached for 24 hours, and if a source is down the last good copy is served.

- **Wikidata (no key):** award rows (`WIKIDATA_THEMES`) and people rows (`PEOPLE`). Use the person's exact English name as Wikidata spells it. Films come with IMDb ids, so no TMDB call is needed.
- **Wikipedia (no key):** `wikipediaLists` names the pages to read (box office rankings, Filmfare winners, last year's films). Italic film links in the tables become titles, which are then matched through TMDB. A page that doesn't exist gives an empty row.
- **MDBList (needs `MDBLIST_KEY`):** paste public list URLs into `MDBLIST`. Rows only appear once the key is set.

## Install paths

- `/manifest.json` all languages
- `/ml-ta/manifest.json` chosen languages (ml, ta, te, kn)
- `/<32-char key>_ml-ta/manifest.json` chosen languages with the user's own TMDB key

Responses are cached 6 hours at the Vercel edge, so TMDB is rarely called.

This product uses the TMDB API but is not endorsed or certified by TMDB.
