const axios = require("axios");

const urls = [
  "https://194a2c34-3a81-4098-8a43-c57019ed739e-00-je64py35b2a3.pike.replit.dev/",
  // kalau ada Replit lain tinggal tambah ke array ini
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

// langsung ping sekali
startPing();
// lalu ping ulang tiap 5 menit
setInterval(startPing, 5 * 60 * 1000);
