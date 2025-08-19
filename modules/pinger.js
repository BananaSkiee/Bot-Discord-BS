// modules/pinger.js
const axios = require("axios");

const urls = [
  "https://194a2c34-3a81-4098-8a43-c57019ed739e-00-je64py35b2a3.pike.replit.dev:8080/",
  // tambah replit lain kalau perlu
];

function startPing() {
  urls.forEach(async (url) => {
    try {
      const res = await axios.get(url);
      console.log(`[OK] ${url} → ${res.status}`);
    } catch (err) {
      console.error(`[ERR] ${url} → ${err.message}`);
    }
  });
}

// export supaya bisa dipakai di index.js
module.exports = { startPing };
