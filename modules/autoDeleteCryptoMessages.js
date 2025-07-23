const { Events } = require("discord.js");
const fs = require("fs");
const path = require("path");

const CRYPTO_CHANNEL_ID = "1397169936467755151"; // ID channel cripto

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Abaikan jika dari bot
    if (message.author.bot) return;

    // Hanya berlaku di channel crypto
    if (message.channel.id !== CRYPTO_CHANNEL_ID) return;

    // Simpan pesan untuk dihapus nanti
    setTimeout(async () => {
      try {
        await message.delete();
      } catch (error) {
        console.error("Gagal hapus pesan:", error.message);
      }
    }, 10 * 1000); // 30 menit
  },
};
