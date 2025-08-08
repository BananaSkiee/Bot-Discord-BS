const { generateTextGraph } = require("../modules/cryptoSimulator");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/cryptoSimulator.json");
const CHANNELS = {
  BTC: "1397169936467755151",
  ETH: "1394478754297811034",
  BNB: "1402210580466499625"
};

// Load data
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

// Save data
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Handle !grafik command
module.exports = async function handleGrafikCommand(message) {
  const args = message.content.trim().split(" ");
  const coin = (args[1] || "BTC").toUpperCase();

  const data = loadData();
  const coinData = data[coin];
  if (!coinData || !CHANNELS[coin]) {
    return message.reply("❌ Coin tidak ditemukan atau belum didukung.");
  }

  const chart = generateTextGraph(coinData.history, `${coin}: $${coinData.price.toLocaleString()}`);

  // Hapus pesan lama (jika ada)
  if (coinData.messageId) {
    try {
      const oldMsg = await message.channel.messages.fetch(coinData.messageId);
      await oldMsg.delete();
    } catch (err) {
      console.warn(`⚠️ Gagal hapus pesan lama ${coin}: ${err.message}`);
    }
  }

  // Kirim grafik baru
  const newMsg = await message.channel.send("```" + chart + "```");

  // Simpan ID baru
  coinData.messageId = newMsg.id;
  data[coin] = coinData;
  saveData(data);
};
