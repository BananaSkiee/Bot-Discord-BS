const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/cryptoMessage.json");

async function updateCryptoMessage(client, content) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const channel = await client.channels.fetch(data.channelId);
  if (!channel) return console.log("Channel tidak ditemukan.");

  try {
    const message = await channel.messages.fetch(data.messageId);
    await message.edit(content); // Update isi grafiknya
  } catch (err) {
    console.error("Gagal update pesan crypto:", err.message);
  }
}

module.exports = updateCryptoMessage;
