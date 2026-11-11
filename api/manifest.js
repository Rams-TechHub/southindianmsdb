const { addonBuilder } = require("stremio-addon-sdk");
const cheerio = require("cheerio");
const fetch = globalThis.fetch;

// ==========================================================
// 1. ADDON MANIFEST CONFIGURATION (Comprehensive Groupings)
// ==========================================================
const builder = new addonBuilder({
    id: "org.southindiancinema.addon",
    version: "1.8.0",
    name: "South Indian Cinema Hub Pro",
    description: "Fully automated, real-time live charts and handpicked masterpieces for South Indian cinema.",
    resources: ["catalog", "meta", "stream"],
    types: ["movie"],
    catalogs: [
        // 🏆 Main Blockbusters & Mega Collections
        { type: "movie", id: "best_south_indian_movies", name: "🏆 Best South Indian Movies (All-Time)" },
        { type: "movie", id: "top_250_south_cinema", name: "🎬 Top 250 South Indian Cinema Collection" },
        { type: "movie", id: "hidden_gems_south", name: "💎 Hidden Gems & Underrated Masterpieces" },
        { type: "movie", id: "modern_new_age_cinema", name: "🚀 New Age / Modern Cult Classics" },

        // ⚡ Live Top Rated Charts (Scraper-Driven)
        { type: "movie", id: "live_malayalam", name: "⚡ Top Rated Malayalam (Live)" },
        { type: "movie", id: "live_tamil", name: "⚡ Top Rated Tamil (Live)" },
        { type: "movie", id: "live_telugu", name: "⚡ Top Rated Telugu (Live)" },
        { type: "movie", id: "live_kannada", name: "⚡ Top Rated Kannada (Live)" },

        // 💰 Box Office Heavyweights (Highest Grossing)
        { type: "movie", id: "highest_grossing_malayalam", name: "💰 Highest Grossing Malayalam Worldwide" },
        { type: "movie", id: "highest_grossing_tamil", name: "💰 Highest Grossing Tamil Worldwide" },
        { type: "movie", id: "highest_grossing_telugu", name: "💰 Highest Grossing Telugu Worldwide" },
        { type: "movie", id: "highest_grossing_kannada", name: "💰 Highest Grossing Kannada Worldwide" },

        // ⚔️ Action & Psychological Thrillers
        { type: "movie", id: "top_30_action_movies", name: "⚔️ Top 30 South Indian Action Movies" },
        { type: "movie", id: "imdb_south_action", name: "👊 South Indian Blockbuster Masala" },
        { type: "movie", id: "top_30_thriller_movies", name: "🔍 Top 30 South Indian Thrillers" },
        { type: "movie", id: "imdb_south_thrillers", name: "🕵️ South Indian Masterpiece Thrillers" },
        { type: "movie", id: "top_20_mystery_movies", name: "🧩 Mind-Bending South Indian Mysteries" },
        { type: "movie", id: "top_30_crime_movies", name: "🔪 Gritty South Indian Crime Sagas" },

        // 😂 Ultimate Regional Comedy Collections
        { type: "movie", id: "imdb_malayalam_comedy", name: "🤣 Malayalam Comedy Classics" },
        { type: "movie", id: "imdb_tamil_comedy", name: "🤣 Tamil Comedy Classics" },
        { type: "movie", id: "imdb_telugu_comedy", name: "🤣 Telugu Comedy Classics" },
        { type: "movie", id: "imdb_kannada_comedy", name: "🤣 Kannada Comedy Classics" },

        // 👁️ Regional Industry Thriller Showcases
        { type: "movie", id: "malayalam_thrillers", name: "👁️ Pulse-Pounding Malayalam Thrillers" },
        { type: "movie", id: "tamil_thrillers", name: "👁️ Suspenseful Tamil Thrillers" },
        { type: "movie", id: "telugu_thrillers", name: "👁️ High-Voltage Telugu Thrillers" },
        { type: "movie", id: "kannada_thrillers", name: "👁️ Sandalwood Mystery Thrillers" },

        // 🎭 Curated Genre Dramas (Romance, Horror, Period)
        { type: "movie", id: "top_30_drama_movies", name: "🎭 Intense South Indian Emotional Dramas" },
        { type: "movie", id: "top_30_horror_movies", name: "👻 Bone-Chilling South Horror & Folklore" },
        { type: "movie", id: "top_30_romantic_movies", name: "💖 Soulful South Indian Romance Chronicles" },
        { type: "movie", id: "period_mythological_south", name: "🛡️ Epic Period & Mythological Sagas" },

        // 📱 Modern Formats & Streaming Originals
        { type: "movie", id: "web_series_south_india", name: "📺 Premium Web Series from South India" },
        { type: "movie", id: "live_ott_exclusives", name: "📱 Direct-to-OTT South Exclusives" },
        { type: "movie", id: "streaming_originals_collection", name: "🔥 Streaming Originals Collection" }
    ]
});

// ==========================================================
// 2. UNIVERSAL AUTOMATED URL MAPPING TABLE
// ==========================================================
const urlRouteMap = {
    // ⚡ Top Rated Real-time Links
    "live_malayalam": "https://imdb.com",
    "live_tamil": "https://imdb.com",
    "live_telugu": "https://imdb.com",
    "live_kannada": "https://imdb.com", 

    // 💰 Box Office & Highest Grossing Trackers
    "highest_grossing_malayalam": "https://imdb.com", 
    "highest_grossing_tamil": "https://imdb.com", 
    "highest_grossing_telugu": "https://imdb.com",
    "highest_grossing_kannada": "https://imdb.com" 
};

// ==========================================================
// 3. STATIC MANUAL DATABASE COLLECTIONS
// ==========================================================
const manualLists = {
    "best_south_indian_movies": [
        { id: "tt11658274", name: "RRR (2022)", type: "movie" },
        { id: "tt0107504", name: "Manichitrathazhu (1993)", type: "movie" },
        { id: "tt2932994", name: "Baahubali: The Beginning (2015)", type: "movie" }
    ],
    "top_250_south_cinema": [
        { id: "tt0093603", name: "Nayagan (1987)", type: "movie" },
        { id: "tt1509144", name: "Anbe Sivam (2003)", type: "movie" }
    ],
    "hidden_gems_south": [
        { id: "tt6741496", name: "C/o Kancharapalem (2018)", type: "movie" },
        { id: "tt1506890", name: "Lucia (2013)", type: "movie" }
    ],
    "modern_new_age_cinema": [
        { id: "tt13854728", name: "Minnal Murali (2021)", type: "movie" },
        { id: "tt1214319", name: "Aavesham (2024)", type: "movie" }
    ],
    "top_30_action_movies": [
        { id: "tt5051914", name: "K.G.F: Chapter 1 (2018)", type: "movie" },
        { id: "tt8360104", name: "Vikram (2022)", type: "movie" }
    ],
    "imdb_south_action": [
        { id: "tt21334812", name: "Leo (2023)", type: "movie" },
        { id: "tt10332302", name: "Jailer (2023)", type: "movie" }
    ],
    "top_30_thriller_movies": [
        { id: "tt7060344", name: "Ratsasan (2018)", type: "movie" },
        { id: "tt4161640", name: "Kshanam (2016)", type: "movie" }
    ],
    "imdb_south_thrillers": [
        { id: "tt2559534", name: "Drishyam (2013)", type: "movie" },
        { id: "tt11790718", name: "Drishyam 2 (2021)", type: "movie" }
    ],
    "top_20_mystery_movies": [
        { id: "tt5782012", name: "Evaru (2019)", type: "movie" },
        { id: "tt5623040", name: "Kavaludaari (2019)", type: "movie" }
    ],
    "top_30_crime_movies": [
        { id: "tt4844648", name: "Vada Chennai (2018)", type: "movie" },
        { id: "tt4450374", name: "Vikram Vedha (2017)", type: "movie" }
    ],
    "imdb_malayalam_comedy": [
        { id: "tt0104956", name: "Nadodikkattu (1987)", type: "movie" },
        { id: "tt0102161", name: "Kilukkam (1991)", type: "movie" },
        { id: "tt0134057", name: "Ramji Rao Speaking (1989)", type: "movie" }
    ],
    "imdb_tamil_comedy": [
        { id: "tt2531070", name: "Jigarthanda (2014)", type: "movie" }
    ],
    "imdb_telugu_comedy": [
        { id: "tt5918714", name: "Agent Sai Srinivasa Athreya (2019)", type: "movie" }
    ],
    "imdb_kannada_comedy": [
        { id: "tt4458856", name: "Kirik Party (2016)", type: "movie" }
    ],
    "malayalam_thrillers": [
        { id: "tt12144362", name: "Bramayugam (2024)", type: "movie" }
    ],
    "tamil_thrillers": [
        { id: "tt3013658", name: "Kaithi (2019)", type: "movie" }
    ],
    "telugu_thrillers": [
        { id: "tt5025732", name: "Goodachari (2018)", type: "movie" }
    ],
    "kannada_thrillers": [
        { id: "tt9166058", name: "Kantara (2022)", type: "movie" }
    ],
    "top_30_drama_movies": [
        { id: "tt11516084", name: "Manjummel Boys (2024)", type: "movie" },
        { id: "tt5051756", name: "Kumbalangi Nights (2019)", type: "movie" }
    ],
    "top_30_horror_movies": [
        { id: "tt12144362", name: "Bramayugam (2024)", type: "movie" }
    ],
    "top_30_romantic_movies": [
        { id: "tt5260170", name: "96 (2018)", type: "movie" },
        { id: "tt8283830", name: "Sita Ramam (2022)", type: "movie" }
    ],
    "period_mythological_south": [
        { id: "tt3503120", name: "Baahubali 2: The Conclusion (2017)", type: "movie" }
    ],
    "web_series_south_india": [
        { id: "tt12361178", name: "The Family Man Season 2", type: "movie" }
    ],
    "live_ott_exclusives": [
        { id: "tt13854728", name: "Minnal Murali (Netflix)", type: "movie" }
    ],
    "streaming_originals_collection": [
        { id: "tt6185882", name: "Jai Bhim (Prime Video)", type: "movie" }
    ]
};

// ==========================================================
// 4. THE UNIVERSAL AUTOMATED SCRAPER ENGINE
// ==========================================================
async function scrapeIMDbChart(targetUrl) {
    try {
        const response = await fetch(targetUrl, {
            headers: { 
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9"
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        const movies = [];

        $("a[href*='/title/tt']").each((index, element) => {
            const href = $(element).attr("href");
            const match = href.match(/(tt\d+)/);
            const titleText = $(element).text().trim();

            if (match && titleText && !movies.some(m => m.id === match[1])) {
                if (titleText.length > 1 && !titleText.startsWith("See more") && !titleText.startsWith("Back to top")) {
                    movies.push({
                        id: match[1], // Extracts 'tt0000000' cleanly via regex index
                        name: titleText,
                        type: "movie"
                    });
                }
            }
        });

        return movies.slice(0, 25);
    } catch (error) {
        console.error(`Scraping failed for target ${targetUrl}:`, error);
        return [];
    }
}

// ==========================================================
// 5. STREMIO ROUTING CONNECTOR HOOK
// ==========================================================
builder.defineCatalogHandler(async (args) => {
    console.log("Requested row:", args.id);

    if (urlRouteMap[args.id]) {
        const scrapedMovies = await scrapeIMDbChart(urlRouteMap[args.id]);
        return { metas: scrapedMovies };
    }

    const staticList = manualLists[args.id];
    return { metas: staticList || [] };
});

builder.defineMetaHandler((args) => Promise.resolve({ meta: {} }));
builder.defineStreamHandler((args) => Promise.resolve({ streams: [] }));

const addonInterface = builder.getInterface();

// ==========================================================
// 6. UI USER FRONTEND LAYOUT VIEW
// ==========================================================
// ==========================================================
// 6. UI USER FRONTEND LAYOUT VIEW
// ==========================================================
const htmlLandingPage = `<!DOCTYPE html> 
<html> 
<head> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
    <title>Configure South Indian Cinema Hub Pro</title> 
    <style> 
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            background: #09090e; 
            color: white; 
            text-align: center; 
            padding: 0;
            margin: 0;
        } 
        /* 1. PASTE YOUR IMGBB HORIZONTAL BANNER HERE */
        .banner {
            width: 100%;
            height: 180px;
            background: linear-gradient(135deg, #1a1a2e, #09090e);
            background-image: url('https://i.ibb.co/DPfvmwms/IMG-0402.jpg'); 
            background-size: cover;
            background-position: center;
            border-bottom: 3px solid #8a2be2;
        }
        /* 2. PASTE YOUR IMGBB SQUARE LOGO HERE */
        .logo {
            width: 90px;
            height: 90px;
            border-radius: 20px;
            margin-top: -45px;
            border: 4px solid #1a1a2e;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            background-image: url('https://i.ibb.co/JRFxHJTn/IMG-0403.jpg');
            background-size: cover;
            display: inline-block;
        }
        .box { max-width: 450px; margin: 20px auto; background: #1a1a2e; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); box-sizing: border-box; } 
        h2 { margin: 10px 0; color: #a25bf2; font-size: 24px; } 
        .subtitle { color: #8e8e9f; font-size: 13px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
        input { width: 100%; padding: 12px; margin: 15px 0; border-radius: 6px; border: 1px solid #333; background: #0f0f1f; color: white; box-sizing: border-box; text-align: center; } 
        button { background: #8a2be2; color: white; border: none; padding: 12px 25px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%; font-size: 16px; } 
        button:hover { background: #9d4edd; } 
    </style> 
</head> 
<body> 
    <!-- Visual structural frames rendering your hosted assets -->
    <div class="banner"></div>
    <div class="logo"></div>

    <div class="box"> 
        <h2>South Indian Hub Setup</h2> 
        <div class="subtitle">Powered by QiLabs.dev</div>
        <p>Your custom subdomain is ready. Enter your TMDB API Key below to inject automated live catalogs directly into your streaming device feed rows.</p> 
        <input type="text" id="apikey" placeholder="Paste TMDB API Key Here..." /> 
        <button onclick="installAddon()">🚀 Install Addon</button> 
    </div> 
    
    <script>
        function installAddon() {
            var key = document.getElementById('apikey').value.trim();
            if (!key) { 
                alert('Please enter a valid TMDB API Key first.'); 
                return; 
            }
            
            // 1. Build the clean, permanent web manifest address string
            var cleanManifestUrl = window.location.origin + '/' + key + '/manifest.json';
            
            // 2. Build the deep-linking app protocol trigger
            var appProtocolUrl = 'stremio://' + window.location.host + '/' + key + '/manifest.json';
            
            // 3. Prompt a custom alert fallback window so you can manually copy it if the app doesn't trigger
            var confirmBox = confirm("Attempting to open Stremio application directly...\\n\\nIf nothing happens or the app doesn't open, click OK to copy your custom Manifest URL to your clipboard for manual pasting into Nuvio or Stremio!");
            
            if (confirmBox) {
                // Copy destination directly to clipboard
                navigator.clipboard.writeText(cleanManifestUrl).then(function() {
                    alert("Copied to clipboard successfully!\\n\\nPaste this URL directly into Nuvio or Stremio's Addon search field:\\n" + cleanManifestUrl);
                }, function() {
                    // Fallback alert input text box reveal if browser blocks clipboard access permissions
                    alert("Clipboard access blocked. Please manually select and copy this exact URL to paste into your app:\\n\\n" + cleanManifestUrl);
                });
            }
            
            // 4. Fire the protocol handler to trigger Stremio locally
            window.location.href = appProtocolUrl;
        }
    </script>
</body> 
</html>`;
// ==========================================================
// 7. VERCEL LAMBDA RUNTIME PROCESSOR
// ==========================================================
module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (req.url === "/" || req.url === "/api/manifest") {
        res.setHeader("Content-Type", "text/html");
        res.status(200).end(htmlLandingPage);
        return;
    }

    res.setHeader("Content-Type", "application/json");

    const urlParts = req.url.split("/");
    const apiKey = urlParts[1]; 
    const cleanPath = req.url.replace(`/${apiKey}`, "").replace("/api/manifest", "");

    addonInterface.handle(cleanPath, (err, response) => {
        if (err) {
            res.status(500).end(JSON.stringify(err));
        } else {
            res.status(200).end(JSON.stringify(response));
        }
    });
};
