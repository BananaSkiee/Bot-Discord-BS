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

    const chunked = hasil.join("\n\n").slice(0, 2000); // Biar ga melebihi limit

    await interaction.editReply({
      content: chunked || "❌ Gagal ambil berita apa pun.",
    });
  }
};
