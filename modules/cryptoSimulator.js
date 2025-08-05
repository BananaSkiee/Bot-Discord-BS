// modules/cryptoSimulator.js
const fs = require("fs");
const path = require("path");

// === Konfigurasi ===
const DATA_FILE = path.join(__dirname, "../data/cryptoSimulator.json");
const CHANNELS = {
  BTC: "1397169936467755151",
  ETH: "1394478754297811034",
  BNB: "1402210580466499625"
};

// === Data Awal ===
let cryptoData = {
  BTC: {
    price: 64000,
    history: [64000, 64500, 64200, 64800, 65000, 64900, 65500],
    messageId: null
  },
  ETH: {
    price: 3500,
    history: [3500, 3550, 3480, 3600, 3580, 3620, 3700],
    messageId: null
  },
  BNB: {
    price: 400,
    history: [400, 410, 395, 405, 415, 408, 420],
    messageId: null
  }
};

// === Load & Save Data ===
function loadCryptoData() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    const loaded = JSON.parse(data);

    for (const coin in cryptoData) {
      if (loaded[coin]) {
        cryptoData[coin] = { ...cryptoData[coin], ...loaded[coin] };
      }
      if (!cryptoData[coin].history || cryptoData[coin].history.length === 0) {
        cryptoData[coin].history = [cryptoData[coin].price];
      }
    }
  } catch (err) {
    if (err.code === "ENOENT") saveCryptoData();
    else console.error(`❌ Gagal load data ${DATA_FILE}:`, err);
  }
}

function saveCryptoData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(cryptoData, null, 2));
}

// === Perubahan Harga Random ===
function getPriceChange() {
  const chance = Math.random();
  if (chance < 0.4) return Math.floor(Math.random() * 50);
  if (chance < 0.7) return Math.floor(Math.random() * -50);
  if (chance < 0.85) return Math.floor(Math.random() * 150);
  return Math.floor(Math.random() * -150);
}

// === Grafik ASCII ===
function generateTextGraph(data, label) {
  if (!data || data.length === 0) return "Tidak ada data grafik.";
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 8;
  const width = 20;

  const lastData = data.slice(-width);

  let graph = "";
  for (let row = height; row >= 0; row--) {
    let line = "";
    for (let value of lastData) {
      const scaled = ((value - min) / range) * height;
      line += scaled >= row && scaled < row + 1 ? "█" : " ";
    }
    graph += line + "\n";
  }

  const minLabel = min.toFixed(0);
  const maxLabel = max.toFixed(0);
  const padding = " ".repeat(width - minLabel.length - maxLabel.length - 1);
  graph += `${minLabel}${padding}${maxLabel}`;

  return `${label}\n${graph}`;
}

// === Update Harga & Kirim ke Discord ===
async function updatePrices(client) {
  for (const coin in cryptoData) {
    const last = cryptoData[coin].price;
    const change = getPriceChange();
    const next = Math.max(1, last + change);

    cryptoData[coin].price = next;
    cryptoData[coin].history.push(next);
    if (cryptoData[coin].history.length > 20) cryptoData[coin].history.shift();

    try {
      const channel = await client.channels.fetch(CHANNELS[coin]);
      if (!channel || !channel.isTextBased()) continue;

      const chart = generateTextGraph(cryptoData[coin].history, `${coin}: $${next.toLocaleString()}`);
      let message;

      if (cryptoData[coin].messageId) {
        try {
          message = await channel.messages.fetch(cryptoData[coin].messageId);
          await message.edit("```" + chart + "```");
        } catch {
          message = await channel.send("```" + chart + "```");
          cryptoData[coin].messageId = message.id;
        }
      } else {
        message = await channel.send("```" + chart + "```");
        cryptoData[coin].messageId = message.id;
      }

    } catch (err) {
      console.error(`❌ Gagal update grafik ${coin}:`, err.message);
    }
  }

  saveCryptoData();
  setTimeout(() => updatePrices(client), Math.floor(Math.random() * 10000) + 5000);
}

// === Start Simulation ===
module.exports = function startCryptoSimulation(client) {
  loadCryptoData();
  updatePrices(client);
};

// === Getter ===
module.exports.getPrices = () => {
  let prices = {};
  for (const coin in cryptoData) prices[coin] = cryptoData[coin].price;
  return prices;
};

module.exports.getPriceHistory = (coin) => cryptoData[coin]?.history || [];
module.exports.generateTextGraph = generateTextGraph;
