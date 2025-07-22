// Dalam updateCrypto.js
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/cryptoMessage.json");

module.exports = async function updateCryptoMessage(client, newContent) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const channel = await client.channels.fetch(data.channelId);

  try {
    // Hapus pesan lama
    const oldMsg = await channel.messages.fetch(data.messageId);
    await oldMsg.delete().catch(() => {});

    // Kirim pesan baru
    const newMsg = await channel.send(newContent);

    // Simpan ID baru
    data.messageId = newMsg.id;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Gagal update pesan crypto:", err);
  }
};
