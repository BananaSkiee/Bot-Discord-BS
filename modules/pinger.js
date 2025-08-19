// modules/pinger.js
const axios = require("axios");

// 🔗 daftar URL yg mau di-ping
const urls = [
  "https://replit.com/@bananaskiee/Anjayiribilangbis",
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
