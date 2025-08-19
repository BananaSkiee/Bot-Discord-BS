// modules/pinger.js
const axios = require("axios");

// 🔗 daftar URL yg mau di-ping
const urls = [
  "https://194a2c34-3a81-4098-8a43-c57019ed739e-00-je64py35b2a3.pike.replit.dev:8080/",
];

async function pingUrl(url) {
  try {
    const res = await axios.get(url);
    console.log(`[OK] ${url} → ${res.status}`);
  } catch (err) {
    console.error(`[ERR] ${url} → ${err.message}`);
  }
}

function startPing() {
  if (urls.length === 0) {
    console.warn("⚠️ Tidak ada URL untuk diping.");
    return;
  }
  urls.forEach(pingUrl);
}

module.exports = { startPing };
