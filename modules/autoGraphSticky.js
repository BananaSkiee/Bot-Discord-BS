const renderGraph = require("./renderGraph");
const fs = require("fs");
const path = require("path");

const MESSAGE_ID_PATH = path.join(__dirname, "../data/graphMessageId.txt"); // simpan ID-nya

async function startAutoGraph(client) {
  const guild = client.guilds.cache.get("GUILD_ID_KAMU");
  const channel = guild.channels.cache.get("CHANNEL_ID_KAMU");

  // Coba ambil ID pesan lama kalau ada
  let messageId = null;
  if (fs.existsSync(MESSAGE_ID_PATH)) {
    messageId = fs.readFileSync(MESSAGE_ID_PATH, "utf8");
  }

  let message;

  try {
    if (messageId) {
      message = await channel.messages.fetch(messageId);
    }
  } catch (err) {
    console.warn("❌ Gagal ambil pesan lama, bikin baru");
  }

  // Kalau pesan belum ada, kirim baru
  if (!message) {
    const buffer = await renderGraph();
    message = await channel.send({
      content: "**📈 Grafik BTC Live (auto update tiap 1 menit)**",
      files: [{ attachment: buffer, name: "btc-graph.png" }],
    });
    fs.writeFileSync(MESSAGE_ID_PATH, message.id);
  }

  // Update terus setiap menit
  setInterval(async () => {
    try {
      const buffer = await renderGraph();
      await message.edit({
        content: "**📈 Grafik BTC Live (auto update tiap 1 menit)**",
        files: [{ attachment: buffer, name: "btc-graph.png" }],
      });
    } catch (err) {
      console.error("❌ Gagal update grafik:", err.message);
    }
  }, 60 * 1000); // tiap 1 menit
}

module.exports = startAutoGraph;
