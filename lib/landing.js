"use strict";

const ASSETS = {
  banner: "https://i.ibb.co/DPfvmwms/IMG-0402.jpg",
  logo: "https://i.ibb.co/JRFxHJTn/IMG-0403.jpg",
  backdrop: "https://i.ibb.co/LDpPXv9w/Gemini-Generated-Image-ga4cngga4cngga4c.jpg",
};

function landingPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>South Indian Cinema Hub: set up</title>
<style>
:root{--ink:#0d0b14;--panel:#17131f;--line:#2b2438;--text:#ece8f4;--muted:#a39cb4;--plum:#8a2be2;--saffron:#f0a93b;--bad:#ff7a7a}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;color:var(--text);background:linear-gradient(rgba(13,11,20,.82),var(--ink) 520px),url('${ASSETS.backdrop}') center top/cover fixed;font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans","Noto Sans Malayalam","Noto Sans Tamil","Noto Sans Telugu","Noto Sans Kannada",sans-serif}
.banner{height:220px;background:url('${ASSETS.banner}') center/cover;border-bottom:3px solid var(--plum)}
main{max-width:600px;margin:0 auto;padding:0 20px 48px}
.logo{display:block;width:96px;height:96px;margin-top:-48px;border-radius:22px;border:4px solid var(--panel);object-fit:cover;background:var(--panel)}
h1{margin:18px 0 8px;font-size:clamp(28px,6vw,38px);line-height:1.1;letter-spacing:-.02em}
.lede{margin:0 0 32px;color:var(--muted);max-width:52ch}
section{margin-bottom:28px}
h2{margin:0 0 4px;font-size:17px}
.hint{margin:0 0 12px;font-size:14px;color:var(--muted)}
.langs{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.lang{font:inherit;color:var(--text);text-align:left;padding:14px 16px;border-radius:12px;border:1px solid var(--line);background:var(--panel);cursor:pointer;transition:border-color .15s,background .15s}
.lang b{display:block;font-size:26px;line-height:1.25;font-weight:600}
.lang span{font-size:13px;color:var(--muted)}
.lang[aria-pressed=true]{border-color:var(--saffron);background:rgba(240,169,59,.1)}
.lang[aria-pressed=true] span{color:var(--saffron)}
input[type=text]{width:100%;padding:14px 16px;font:15px ui-monospace,Menlo,Consolas,monospace;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:10px}
input[type=text]::placeholder{color:#6c6580}
#status{min-height:1.5em;margin:8px 0 0;font-size:14px;color:var(--muted)}
#status.bad{color:var(--bad)}
.actions{display:flex;gap:10px;flex-wrap:wrap}
button.cta{flex:1 1 200px;padding:15px 20px;font:inherit;font-weight:700;color:#fff;border:0;border-radius:10px;cursor:pointer;background:var(--plum)}
button.alt{background:transparent;border:1px solid var(--plum);color:#c79cf5}
button:disabled{opacity:.4;cursor:not-allowed}
#link{margin-top:12px;font-size:13px}
.note{font-size:13px;color:var(--muted);margin-top:28px;border-top:1px solid var(--line);padding-top:16px}
:focus-visible{outline:2px solid var(--saffron);outline-offset:2px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="banner" role="img" aria-label="South Indian Cinema Hub banner"></div>
<main>
  <img class="logo" src="${ASSETS.logo}" alt="">
  <h1>South Indian Cinema Hub</h1>
  <p class="lede">Malayalam, Tamil, Telugu and Kannada movies and series as browsable rows in Stremio and Nuvio. Choose your languages, add a free TMDB key, then install.</p>

  <section>
    <h2>1. Choose your languages</h2>
    <p class="hint">Each language gets its own movie and series rows.</p>
    <div class="langs" role="group" aria-label="Languages">
      <button type="button" class="lang" data-lang="ml" aria-pressed="true"><b>മലയാളം</b><span>Malayalam</span></button>
      <button type="button" class="lang" data-lang="ta" aria-pressed="true"><b>தமிழ்</b><span>Tamil</span></button>
      <button type="button" class="lang" data-lang="te" aria-pressed="true"><b>తెలుగు</b><span>Telugu</span></button>
      <button type="button" class="lang" data-lang="kn" aria-pressed="true"><b>ಕನ್ನಡ</b><span>Kannada</span></button>
    </div>
  </section>

  <section>
    <h2>2. Add your TMDB API key</h2>
    <p class="hint">Get one free at themoviedb.org under Settings, then API. Use the 32-character API Key, not the Read Access Token.</p>
    <input type="text" id="key" placeholder="32-character API key" autocomplete="off" spellcheck="false" aria-describedby="status">
    <p id="status" role="status" aria-live="polite"></p>
  </section>

  <section>
    <h2>3. Install</h2>
    <p class="hint">Stremio opens directly. In Nuvio, copy the link and paste it into Addons.</p>
    <div class="actions">
      <button type="button" class="cta" id="open" disabled>Open in Stremio</button>
      <button type="button" class="cta alt" id="copy" disabled>Copy link</button>
    </div>
    <input type="text" id="link" readonly aria-label="Install link" hidden>
  </section>

  <p class="note">Your key is part of the install link, so treat the link like a password and only share your own key with yourself. &copy; 2026 QiLabs</p>
</main>
<script>
(function () {
  var KEY_RE = /^[a-f0-9]{32}$/i;
  var chips = Array.prototype.slice.call(document.querySelectorAll(".lang"));
  var keyEl = document.getElementById("key"), statusEl = document.getElementById("status");
  var openBtn = document.getElementById("open"), copyBtn = document.getElementById("copy"), linkEl = document.getElementById("link");

  // Re-opened from Stremio's Configure button: restore the saved settings.
  var pre = /^([a-f0-9]{32})(?:_([a-z-]+))?$/i.exec(location.pathname.split("/")[1] || "");
  if (pre) {
    keyEl.value = pre[1];
    if (pre[2]) {
      var want = pre[2].toLowerCase().split("-");
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(want.indexOf(c.dataset.lang) > -1)); });
    }
  }

  function langs() {
    return chips.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; }).map(function (c) { return c.dataset.lang; });
  }
  function path() {
    var l = langs(), seg = keyEl.value.trim();
    if (l.length < chips.length) seg += "_" + l.join("-");
    return "/" + seg + "/manifest.json";
  }
  function say(msg, bad) { statusEl.textContent = msg; statusEl.className = bad ? "bad" : ""; }

  function refresh() {
    var ok = KEY_RE.test(keyEl.value.trim());
    openBtn.disabled = copyBtn.disabled = !ok;
    linkEl.hidden = !ok;
    if (ok) linkEl.value = location.origin + path();
    say(keyEl.value && !ok ? "That doesn't look like a TMDB API key. It should be 32 letters and numbers." : "", !!keyEl.value && !ok);
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var on = c.getAttribute("aria-pressed") === "true";
      if (on && langs().length === 1) { say("Keep at least one language selected.", true); return; }
      c.setAttribute("aria-pressed", String(!on));
      refresh();
    });
  });
  keyEl.addEventListener("input", refresh);

  // Returns true (valid), false (rejected) or null (couldn't check).
  function verify() {
    say("Checking your key with TMDB\u2026");
    return fetch("https://api.themoviedb.org/3/configuration?api_key=" + encodeURIComponent(keyEl.value.trim()))
      .then(function (r) { return r.status === 401 ? false : r.ok ? true : null; })
      .catch(function () { return null; });
  }
  function gate() {
    return verify().then(function (ok) {
      if (ok === false) { say("TMDB rejected this key. Check that you copied the API Key (v3).", true); return false; }
      say(ok === null ? "Couldn't reach TMDB to check the key, installing anyway." : "Key accepted.");
      return true;
    });
  }

  openBtn.addEventListener("click", function () {
    gate().then(function (ok) { if (ok) location.href = "stremio://" + location.host + path(); });
  });
  copyBtn.addEventListener("click", function () {
    gate().then(function (ok) {
      if (!ok) return;
      var done = function () { say("Link copied. Paste it into Nuvio or Stremio under Addons."); };
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
