// updateCrypto.js
const fs = require("fs");
const path = require("path");

const folderPath = path.join(__dirname, "../data");
const filePath = path.join(folderPath, "cryptoMessage.json");

module.exports = async function updateCryptoMessage(client, newContent) {
  // Pastikan folder ada
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Pastikan file ada
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ channelId: "", messageId: "" }, null, 2));
    console.warn("⚠ cryptoMessage.json dibuat baru, silakan isi channelId & messageId.");
    return;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error("❌ Gagal membaca cryptoMessage.json:", err);
    return;
  }

  // Cek validitas
  if (!data.channelId || !data.messageId) {
    console.warn("⚠ channelId atau messageId di cryptoMessage.json kosong.");
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
