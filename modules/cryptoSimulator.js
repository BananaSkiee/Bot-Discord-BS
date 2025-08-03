// modules/cryptoSimulator.js
const fs = require("fs");
const path = require("path");

// === Konfigurasi ===
const CHANNEL_ID = "1397169936467755151"; // Ganti dengan ID channel grafik
const DATA_FILE = path.join(__dirname, "../data/cryptoMessage.json");

let hargaData = [64000, 64500, 64200, 64800, 65000, 64900, 65500];

// === Fungsi Generate Grafik ASCII ===
function generateTextGraph(data, symbol = "BTC") {
  const height = 10; // tinggi grafik
  const width = data.length;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Normalisasi data ke tinggi grafik
  const normalized = data.map((val) =>
    Math.round(((val - min) / range) * (height - 1))
  );

  // Buat grafik baris demi baris dari atas ke bawah
  let lines = [];
  for (let row = height - 1; row >= 0; row--) {
    let line = "";
    for (let col = 0; col < width; col++) {
      line += normalized[col] >= row ? " █" : "  ";
    }
    lines.push(line);
  }

  // Tambahkan garis dasar dan info harga
  const current = data[data.length - 1];
  const previous = data[data.length - 2] || current;
  const delta = current - previous;
  const deltaStr = delta >= 0 ? `+${delta}` : `${delta}`;

  lines.push("‾".repeat(width * 2));
  lines.push(`${symbol}: $${current.toLocaleString()} (${deltaStr})`);

  return lines.join("\n");
}

// === Utility ===
function getNextDelay() {
  return Math.floor(Math.random() * 10000) + 5000;
}

function getPriceChange() {
  const chance = Math.random();
  if (chance < 0.4) return Math.floor(Math.random() * 50);
  if (chance < 0.7) return Math.floor(Math.random() * -50);
  if (chance < 0.85) return Math.floor(Math.random() * 150);
  return Math.floor(Math.random() * -150);
}

function saveMessageId(id) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ messageId: id }, null, 2));
}

function loadMessageId() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(data).messageId;
  } catch {
    return null;
  }
}

// === Update Harga & Kirim Grafik ===
async function updateHarga(client) {
  const last = hargaData[hargaData.length - 1];
  const change = getPriceChange();
  const next = Math.max(100, last + change);

  hargaData.push(next);
  if (hargaData.length > 20) hargaData.shift();

  const chart = generateTextGraph(hargaData, "BTC");

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;

    const messageId = loadMessageId();
    let message;

    if (messageId) {
      try {
        message = await channel.messages.fetch(messageId);
        await message.edit("```" + chart + "```");
      } catch {
        message = await channel.send("```" + chart + "```");
        saveMessageId(message.id);
      }
    } else {
      message = await channel.send("```" + chart + "```");
      saveMessageId(message.id);
    }
  } catch (err) {
    console.error("❌ Gagal kirim/edit grafik:", err);
  }

  setTimeout(() => updateHarga(client), getNextDelay());
}

// === Export ===
module.exports = function startCryptoSimulation(client) {
  updateHarga(client);
};

module.exports.getPrices = () => {
  return { BTC: hargaData[hargaData.length - 1] };
};

module.exports.getPriceHistory = () => {
  return hargaData;
};
