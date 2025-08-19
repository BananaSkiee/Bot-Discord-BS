const axios = require("axios");

const url = "https://194a2c34-3a81-4098-8a43-c57019ed739e-00-je64py35b2a3.pike.replit.dev/";

function startPinger() {
  async function ping() {
    try {
      const res = await axios.get(url);
      console.log("Ping success:", res.status);
    } catch (err) {
      console.error("Ping failed:", err.message);
    }
  }

  // langsung jalan sekali
  ping();
  // lalu ping setiap 5 menit
  setInterval(ping, 5 * 60 * 1000);
}

module.exports = { startPinger };
