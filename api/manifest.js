const { addonBuilder } = require("stremio-addon-sdk");
const fetch = globalThis.fetch;

// Configurable builder setup
const builder = new addonBuilder({
    id: "org.southindiancinema.addon",
    version: "1.6.0",
    name: "South Indian Cinema Hub Pro",
    description: "Curated catalogs with personalized API integrations for trailers, summaries, and tracks.",
    resources: ["catalog", "meta", "stream"],
    types: ["movie"],
    catalogs: [
        { type: "movie", id: "malayalam_classics", name: "🏆 Malayalam Cult Classics" },
        { type: "movie", id: "tamil_classics", name: "⚡ Tamil Blockbusters" },
        { type: "movie", id: "telugu_classics", name: "🔥 Tollywood Mass Epics" },
        { type: "movie", id: "kannada_classics", name: "💥 Sandalwood Masterpieces" }
    ]
});

// Dummy database matching the catalog router logic
catalogs: [
    { type: "movie", id: "malayalam_classics", name: "🏆 Malayalam Cult Classics" },
    { type: "movie", id: "tamil_classics", name: "⚡ Tamil Blockbusters" },
    { type: "movie", id: "telugu_classics", name: "🔥 Tollywood Mass Epics" },
    { type: "movie", id: "kannada_classics", name: "💥 Sandalwood Masterpieces" },
    
    // Your new curated IMDb rows
    { type: "movie", id: "imdb_top_tamil", name: "⭐ IMDb Top Rated Tamil" },
    { type: "movie", id: "imdb_top_telugu", name: "💎 IMDb Top Rated Telugu" },
    { type: "movie", id: "imdb_malayalam_comedy", name: "😂 Ultimate Malayalam Comedies" },
    { type: "movie", id: "imdb_south_thrillers", name: "👁️ South Indian Masterpiece Thrillers" }
]


builder.defineCatalogHandler((args) => {
    const list = manualLists[args.id];
    return Promise.resolve({ metas: list || [] });
});

builder.defineMetaHandler((args) => Promise.resolve({ meta: {} }));
builder.defineStreamHandler((args) => Promise.resolve({ streams: [] }));

const addonInterface = builder.getInterface();

// ==========================================
// CONFIGURATION PAGE UI TEXT (HTML/CSS)
// ==========================================
const htmlLandingPage = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configure South Indian Cinema Hub</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0e0e1a; color: white; text-align: center; padding: 40px 20px; }
        .box { max-width: 450px; margin: 0 auto; background: #1a1a2e; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
        h2 { margin-top: 0; color: #8a2be2; }
        input { width: 100%; padding: 12px; margin: 15px 0; border-radius: 6px; border: 1px solid #333; background: #0f0f1f; color: white; box-sizing: border-box; text-align: center; }
        button { background: #8a2be2; color: white; border: none; padding: 12px 25px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; font-size: 16px; }
        button:hover { background: #9d4edd; }
    </style>
</head>
<body>
    <div class="box">
        <h2>South Indian Hub Setup</h2>
        <p>Enter your TMDB API Key below to experience high-speed metadata resolutions and custom poster generation.</p>
        <input type="text" id="apikey" placeholder="Paste TMDB API Key Here..." />
        <button onclick="installAddon()">Install Addon</button>
    </div>

    <script>
        function installAddon() {
            var key = document.getElementById('apikey').value.trim();
            if (!key) { alert('Please enter a valid API Key first.'); return; }
            
            // Build the dynamic manifest URL path
            var manifestUrl = window.location.origin.replace('https://', '') + '/' + key + '/manifest.json';
            window.location.href = 'stremio://' + manifestUrl;
        }
    </script>
</body>
</html>
`;

// ==========================================
// SERVERLESS ROUTER ENGINE
// ==========================================
module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    // 1. If hitting the base domain root path, display the HTML Configuration Form
    if (req.url === "/" || req.url === "/api/manifest") {
        res.setHeader("Content-Type", "text/html");
        res.status(200).end(htmlLandingPage);
        return;
    }

    res.setHeader("Content-Type", "application/json");

    // 2. Parse out the API key parameter hidden inside the path
    const urlParts = req.url.split("/");
    const apiKey = urlParts[1]; // Extracts your input string parameter directly from the route

    // Clean up request path so Stremio SDK can parse it normally
    const cleanPath = req.url.replace(`/${apiKey}`, "").replace("/api/manifest", "");

    addonInterface.handle(cleanPath, (err, response) => {
        if (err) {
            res.status(500).end(JSON.stringify(err));
        } else {
            res.status(200).end(JSON.stringify(response));
        }
    });
};
