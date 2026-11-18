"use strict";

// Self-hosted in /public so the addon never depends on an outside image host.
const ASSETS = { logo: "/logo.png", banner: "/banner.jpg", logoSvg: "/logo.svg", appIcon: "/apple-touch-icon.png", share: "/og.jpg" };

const SCRIPT = { ml: "മലയാളം", ta: "தமிழ்", te: "తెలుగు", kn: "ಕನ್ನಡ" };
const INDUSTRY = { ml: "Mollywood", ta: "Kollywood", te: "Tollywood", kn: "Sandalwood" };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function landingPage({ languages, collections, origin = "" }) {
  const langs = Object.keys(languages);

  const tiles = langs
    .map(
      (l) => `<button type="button" class="tile" data-lang="${l}" aria-pressed="true">
        <svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11"/><path d="M7 12.5l3.2 3.2L17 9"/></svg>
        <span class="script">${SCRIPT[l]}</span>
        <span class="name">${esc(languages[l])}</span>
        <span class="ind">${INDUSTRY[l]}</span>
      </button>`
    )
    .join("");

  const picks = langs
    .map(
      (l) => `<div class="pick" data-lang="${l}">
        <h3>${esc(languages[l])}</h3>
        <ul class="chips">${collections[l].curated.map((n) => `<li class="chip hot">${esc(n)}</li>`).join("")}${collections[l].community.map((n) => `<li class="chip">${esc(n)}</li>`).join("")}</ul>
      </div>`
    )
    .join("");

  const sample = collections[langs[0]];
  const movieChips = sample.movies.map((n) => `<li class="chip">${esc(n)}</li>`).join("");
  const seriesChips = sample.series.map((n) => `<li class="chip">${esc(n)}</li>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#100b1a">
<meta name="description" content="Malayalam, Tamil, Telugu and Kannada movies and series for Stremio and Nuvio, in hand-picked rows. Free, no keys needed.">
<link rel="icon" type="image/svg+xml" href="${ASSETS.logoSvg}">
<link rel="apple-touch-icon" href="${ASSETS.appIcon}">
<meta property="og:type" content="website">
<meta property="og:title" content="South Indian Cinema Hub">
<meta property="og:description" content="Malayalam, Tamil, Telugu and Kannada movies and series for Stremio and Nuvio. Free, no keys needed.">
<meta property="og:image" content="${origin}${ASSETS.share}">
<meta name="twitter:card" content="summary_large_image">
<title>South Indian Cinema Hub: install</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anek+Latin:wght@400;600;800&family=Anek+Malayalam:wght@600;800&family=Anek+Tamil:wght@600;800&family=Anek+Telugu:wght@600;800&family=Anek+Kannada:wght@600;800&display=swap">
<style>
:root{
  --ink:#100b1a;--panel:#1a1327;--raise:#241a35;--line:#352950;
  --text:#f3ecdf;--muted:#a99fbe;--saffron:#f2a93b;--plum:#8a2be2;--bad:#ff8585;
  --ml:#2dc2a0;--ml-soft:rgba(45,194,160,.16);
  --ta:#e4476b;--ta-soft:rgba(228,71,107,.16);
  --te:#f2a93b;--te-soft:rgba(242,169,59,.16);
  --kn:#7b7cf6;--kn-soft:rgba(123,124,246,.16);
  --font:"Anek Latin","Anek Malayalam","Anek Tamil","Anek Telugu","Anek Kannada","Noto Sans","Noto Sans Malayalam","Noto Sans Tamil","Noto Sans Telugu","Noto Sans Kannada",system-ui,sans-serif;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;min-height:100vh;color:var(--text);background:var(--ink);font:400 16px/1.55 var(--font);
  padding-bottom:env(safe-area-inset-bottom,0px)}
.hero{position:relative;height:300px;background:linear-gradient(180deg,rgba(16,11,26,.15) 0%,rgba(16,11,26,.55) 60%,var(--ink) 100%),url('${ASSETS.banner}') 72% center/cover}
.wrap{max-width:720px;margin:0 auto;padding:0 20px}
.head{margin-top:-84px;position:relative}
.logo{display:block;width:88px;height:88px;border-radius:22px;border:3px solid var(--ink);object-fit:cover;background:var(--panel)}
h1{margin:16px 0 8px;font-weight:800;font-size:clamp(32px,8vw,48px);line-height:1.05;letter-spacing:-.02em}
.lede{margin:0;max-width:46ch;color:var(--muted);font-size:17px}
section{margin-top:40px}
h2{margin:0 0 4px;font-weight:800;font-size:21px;letter-spacing:-.01em}
h3{margin:0 0 8px;font-weight:600;font-size:15px}
.hint{margin:0 0 16px;color:var(--muted);font-size:15px;max-width:52ch}

/* language tiles */
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.tile{--a:var(--ml);--s:var(--ml-soft);position:relative;display:flex;flex-direction:column;align-items:flex-start;text-align:left;
  min-height:150px;padding:16px;border-radius:22px;border:1.5px solid var(--line);background:var(--panel);color:var(--text);font:inherit;cursor:pointer;
  transition:background .2s,border-color .2s,transform .12s}
.tile[data-lang=ta]{--a:var(--ta);--s:var(--ta-soft)}
.tile[data-lang=te]{--a:var(--te);--s:var(--te-soft)}
.tile[data-lang=kn]{--a:var(--kn);--s:var(--kn-soft)}
.tile:active{transform:scale(.98)}
.tile .script{margin-top:auto;font-weight:800;font-size:clamp(34px,9.5vw,48px);line-height:1.2;color:var(--muted);transition:color .2s}
.tile .name{font-weight:600;font-size:16px;margin-top:2px}
.tile .ind{font-size:13px;color:var(--muted)}
.tile .tick{position:absolute;top:14px;right:14px;width:26px;height:26px;fill:none;stroke:var(--line);stroke-width:1.6;transition:stroke .2s,fill .2s}
.tile .tick path{stroke:transparent;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.tile[aria-pressed=true]{border-color:var(--a);background:linear-gradient(155deg,var(--s),var(--panel) 75%)}
.tile[aria-pressed=true] .script{color:var(--a)}
.tile[aria-pressed=true] .tick{fill:var(--a);stroke:var(--a)}
.tile[aria-pressed=true] .tick path{stroke:var(--ink)}

/* install */
.install{padding:20px;border-radius:22px;background:var(--raise);border:1px solid var(--line)}
.btns{display:flex;gap:10px;flex-wrap:wrap}
.btn{flex:1 1 180px;padding:15px 20px;border-radius:14px;border:1.5px solid transparent;font:inherit;font-weight:800;font-size:16px;cursor:pointer;text-align:center;text-decoration:none;color:var(--ink);background:var(--saffron);transition:transform .12s,opacity .2s}
.btn:active{transform:scale(.98)}
.btn.alt{background:transparent;color:var(--text);border-color:var(--plum)}
.btn:disabled{opacity:.4;cursor:not-allowed}
.link{width:100%;margin-top:14px;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:var(--ink);color:var(--muted);font:13px ui-monospace,Menlo,Consolas,monospace}
.more{margin:12px 0 0;font-size:14px;color:var(--muted)}
.more a{color:#c79cf5}
#status{min-height:1.5em;margin:10px 0 0;font-size:14px;color:var(--muted)}
#status.bad{color:var(--bad)}

details.adv{margin-top:16px;border-top:1px solid var(--line);padding-top:12px}
details.adv summary{cursor:pointer;font-weight:600;font-size:15px;color:var(--muted)}
details.adv p{margin:10px 0;font-size:14px;color:var(--muted)}
details.adv input{width:100%;padding:13px 14px;border-radius:12px;border:1px solid var(--line);background:var(--ink);color:var(--text);font:14px ui-monospace,Menlo,Consolas,monospace}

/* collections */
.picks{display:grid;gap:14px}
.pick{padding:16px;border-radius:18px;background:var(--panel);border-left:4px solid var(--a,var(--ml));transition:opacity .2s}
.pick[data-lang=ta]{--a:var(--ta)}.pick[data-lang=te]{--a:var(--te)}.pick[data-lang=kn]{--a:var(--kn)}
.pick.off{opacity:.3}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.chip{padding:6px 13px;border-radius:999px;border:1px solid var(--line);font-size:14px;color:var(--muted)}
.chip.hot{border-color:var(--a);color:var(--text);background:rgba(255,255,255,.04);font-weight:600}
details.all{margin-top:16px;border-radius:18px;background:var(--panel);padding:14px 16px}
details.all summary{cursor:pointer;font-weight:600}
details.all h3{margin:16px 0 8px;color:var(--muted)}

footer{margin:48px 0 32px;padding-top:18px;border-top:1px solid var(--line);font-size:13px;color:var(--muted)}
footer p{margin:0 0 6px;max-width:60ch}

:focus-visible{outline:2px solid var(--saffron);outline-offset:3px}
@media (min-width:720px){.tiles{grid-template-columns:repeat(4,1fr)}.hero{height:340px}.picks{grid-template-columns:1fr 1fr}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="hero" role="img" aria-label="South Indian Cinema Hub banner"></div>
<div class="wrap">
  <header class="head">
    <img class="logo" src="${ASSETS.logo}" alt="">
    <h1>South Indian Cinema Hub</h1>
    <p class="lede">Malayalam, Tamil, Telugu and Kannada movies and series, sorted into rows worth browsing. Free to use, with no keys to set up.</p>
  </header>

  <section>
    <h2>Choose your languages</h2>
    <p class="hint">Each one adds its own movie and series rows to Stremio and Nuvio.</p>
    <div class="tiles" role="group" aria-label="Languages">${tiles}</div>
  </section>

  <section>
    <h2>Install</h2>
    <div class="install">
      <div class="btns">
        <button type="button" class="btn" id="open">Install in Stremio</button>
        <button type="button" class="btn alt" id="copy">Copy link</button>
      </div>
      <input class="link" id="link" readonly aria-label="Install link">
      <p class="more">In Nuvio, copy the link and paste it into Addons. <a id="web" href="#" target="_blank" rel="noopener">Open in Stremio Web</a></p>
      <p id="status" role="status" aria-live="polite"></p>
      <details class="adv">
        <summary>Advanced: use your own TMDB key</summary>
        <p>Not needed. Add your own free key only if rows stop loading for you. It becomes part of your install link, so keep that link private.</p>
        <input type="text" id="key" placeholder="32-character TMDB API key" autocomplete="off" spellcheck="false">
      </details>
    </div>
  </section>

  <section>
    <h2>What's inside</h2>
    <p class="hint">Hand-picked collections, award and star rows from Wikidata and Wikipedia, plus rows that refresh on their own.</p>
    <div class="picks">${picks}</div>
    <details class="all">
      <summary>Rows every language also gets</summary>
      <h3>Movies</h3>
      <ul class="chips">${movieChips}</ul>
      <h3>Series</h3>
      <ul class="chips">${seriesChips}</ul>
    </details>
  </section>

  <footer>
    <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
    <p>&copy; 2026 QiLabs</p>
  </footer>
</div>
<script>
(function () {
  var KEY_RE = /^[a-f0-9]{32}$/i;
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".tile"));
  var picks = Array.prototype.slice.call(document.querySelectorAll(".pick"));
  var keyEl = document.getElementById("key"), statusEl = document.getElementById("status");
  var linkEl = document.getElementById("link"), openBtn = document.getElementById("open");
  var copyBtn = document.getElementById("copy"), webEl = document.getElementById("web");

  // Re-opened from Stremio's Configure button: restore the saved settings.
  var pre = /^(?:([a-f0-9]{32})(?:_|$))?((?:ml|ta|te|kn)(?:-(?:ml|ta|te|kn))*)?$/i.exec(location.pathname.split("/")[1] || "");
  if (pre) {
    if (pre[1]) { keyEl.value = pre[1]; document.querySelector("details.adv").open = true; }
    if (pre[2]) {
      var want = pre[2].toLowerCase().split("-");
      tiles.forEach(function (t) { t.setAttribute("aria-pressed", String(want.indexOf(t.dataset.lang) > -1)); });
    }
  }

  function langs() {
    return tiles.filter(function (t) { return t.getAttribute("aria-pressed") === "true"; }).map(function (t) { return t.dataset.lang; });
  }
  function say(msg, bad) { statusEl.textContent = msg; statusEl.className = bad ? "bad" : ""; }
  function keyOk() { return KEY_RE.test(keyEl.value.trim()); }

  function path() {
    var l = langs(), partial = l.length < tiles.length, key = keyOk() ? keyEl.value.trim() : "";
    var seg = key ? key + (partial ? "_" + l.join("-") : "") : (partial ? l.join("-") : "");
    return "/" + (seg ? seg + "/" : "") + "manifest.json";
  }
  function refresh() {
    var url = location.origin + path();
    linkEl.value = url;
    webEl.href = "https://web.stremio.com/#/addons?addon=" + encodeURIComponent(url);
    var on = langs();
    picks.forEach(function (p) { p.classList.toggle("off", on.indexOf(p.dataset.lang) < 0); });
    if (keyEl.value && !keyOk()) say("That doesn't look like a TMDB key. It should be 32 letters and numbers.", true);
    else say("");
  }

  tiles.forEach(function (t) {
    t.addEventListener("click", function () {
      var on = t.getAttribute("aria-pressed") === "true";
      if (on && langs().length === 1) { say("Keep at least one language selected.", true); return; }
      t.setAttribute("aria-pressed", String(!on));
      refresh();
    });
  });
  keyEl.addEventListener("input", refresh);

  function gate() {
    if (keyEl.value && !keyOk()) { say("Fix or clear the TMDB key first.", true); return Promise.resolve(false); }
    if (!keyOk()) return Promise.resolve(true);
    say("Checking your key with TMDB\u2026");
    return fetch("https://api.themoviedb.org/3/configuration?api_key=" + encodeURIComponent(keyEl.value.trim()))
      .then(function (r) { return r.status === 401 ? false : true; })
      .catch(function () { return true; })
      .then(function (ok) { if (!ok) say("TMDB rejected this key. Use the API Key (v3), or clear the field.", true); return ok; });
  }

  openBtn.addEventListener("click", function () {
    gate().then(function (ok) { if (ok) location.href = "stremio://" + location.host + path(); });
  });
  copyBtn.addEventListener("click", function () {
    gate().then(function (ok) {
      if (!ok) return;
      var done = function () { say("Link copied. Paste it into Addons in Nuvio or Stremio."); };
      if (navigator.clipboard) navigator.clipboard.writeText(linkEl.value).then(done, function () { linkEl.select(); say("Select the link above and copy it manually.", true); });
      else { linkEl.select(); document.execCommand("copy"); done(); }
    });
  });
  refresh();
})();
</script>
</body>
</html>`;
}

module.exports = { landingPage, ASSETS };
