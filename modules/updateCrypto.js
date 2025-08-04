// updateCrypto.js
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/cryptoMessage.json");

module.exports = async function updateCryptoMessage(client, newContent) {
  if (!fs.existsSync(filePath)) {
    console.error("❌ File cryptoMessage.json belum ada, tidak bisa update pesan crypto.");
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!data.channelId || !data.messageId) {
    console.error("❌ channelId atau messageId di cryptoMessage.json kosong/undefined.");
    return;
  }

  try {
    const channel = await client.channels.fetch(data.channelId);
    const oldMsg = await channel.messages.fetch(data.messageId);
    await oldMsg.edit(newContent);
    console.log(`✅ Pesan crypto berhasil diperbarui.`);
  } catch (err) {
    console.error("❌ Gagal update pesan crypto:", err);
  }
};
