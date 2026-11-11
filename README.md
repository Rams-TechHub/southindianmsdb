# southindianmsdb

A high-performance, serverless Stremio and Nuvio catalog add-on built to deliver structured South Indian media metadata metadata directly into your favorite streaming interfaces. Hosted dynamically on Vercel for lightning-fast, edge-optimized responses.

## 🚀 Live Add-on URL

To install this add-on in Stremio or Nuvio, use the following production URL:
👉 **`southindianmsdb.qilabs.dev`**

---

## ✨ Features

- **Multi-Platform Support:** Fully compatible with both Stremio and Nuvio configuration layouts.
- **South Indian Focus:** Aggregated catalog specifically serving Tamil, Telugu, Malayalam, and Kannada cinematic content ecosystems.
- **Serverless & Fast:** Powered by Vercel Serverless Functions (`/api`), ensuring zero cold starts and global edge caching.
- **Lightweight Architecture:** Structured strictly around the official Stremio Add-on SDK protocol standards.

---

## 🛠️ Local Development & Setup

If you want to run this project locally, clone it and set up the node environment:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org) installed (v18 or higher recommended).

### 2. Installation
Clone the repository and install the project dependencies:
```bash
git clone https://github.com
cd southindianmsdb
npm install
```

### 3. Run Locally
Start the local serverless development environment using the Vercel CLI (or npm run script):
```bash
# Using Vercel CLI locally
vercel dev

# Or standard local node boot execution
npm start
```
Your local manifest file will be accessible at `http://localhost:3000/api/manifest` or matching local routing rules.

---

## 📦 Project Structure

```text
southindianmsdb/
├── api/
│   └── manifest.js     # Serverless endpoint exporting add-on metadata configurations
├── package.json        # Project dependencies, build hooks, and node engine specs
└── vercel.json         # Vercel deployment routes and clean URL rewrites configuration
```

---

## ☁️ Deployment

This project is configured out-of-the-box for **Vercel** serverless environments:

1. Push your latest code changes to your GitHub branch (`main`).
2. Connect your repository to your personal Vercel dashboard.
3. Vercel automatically detects the `vercel.json` deployment rules and sets up the paths natively.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
