const { SlashCommandBuilder } = require("discord.js");
const Parser = require("rss-parser");
const parser = new Parser();

const rssFeeds = [
  "https://www.kompas.com/rss",
  "https://rss.detik.com/index.php/berita",
  "https://www.cnnindonesia.com/nasional/rss",
  "https://www.theverge.com/rss/index.xml",
  "https://rss.cnn.com/rss/edition.rss",
  "https://kotaku.com/rss",
  "https://myanimelist.net/rss/news"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("berita")
    .setDescription("📰 Ambil berita terbaru dari berbagai sumber terpercaya"),

  async execute(interaction) {
    await interaction.deferReply();

    const hasil = [];

    for (const url of rssFeeds) {
      try {
        const feed = await parser.parseURL(url);
        const item = feed.items[0];
        hasil.push(`**${item.title}**\n${item.link}`);
      } catch (err) {
        hasil.push(`⚠️ Gagal ambil dari: ${url}`);
        console.error(`Error RSS ${url}:`, err.message);
      }
    }

    if (hasil.length === 0) {
      return await interaction.editReply("❌ Gagal ambil berita apa pun.");
    }

    const combined = hasil.join("\n\n");

    // Jika terlalu panjang, potong dan kirim dalam beberapa pesan
    const chunks = combined.match(/[\s\S]{1,1900}/g); // max 2000, tapi kasih margin

    // Kirim pesan pertama
    await interaction.editReply(chunks[0]);

    // Jika ada lebih dari satu, kirim sisanya sebagai follow-up
    for (let i = 1; i < chunks.length; i++) {
      await interaction.followUp(chunks[i]);
    }
  }
};
