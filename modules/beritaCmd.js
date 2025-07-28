const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const Parser = require("rss-parser");
const parser = new Parser();

const rssFeeds = [
  "https://www.kompas.com/rss",
  "https://rss.detik.com/index.php/berita",
  "https://www.cnnindonesia.com/nasional/rss",
  "https://www.antaranews.com/rss/nasional.xml",
  "https://tempo.co/rss/nasional",
  "https://www.merdeka.com/feed/",
  "https://republika.co.id/rss/nasional"
];

const sentFilePath = path.join(__dirname, "../sentNews.json");

function loadSentLinks() {
  try {
    return JSON.parse(fs.readFileSync(sentFilePath, "utf8"));
  } catch {
    return [];
  }
}

function saveSentLinks(data) {
  fs.writeFileSync(sentFilePath, JSON.stringify(data, null, 2));
}

function getRandomColor() {
  return Math.floor(Math.random() * 0xffffff);
}

module.exports = async (message) => {
  const sentLinks = loadSentLinks();

  for (const url of rssFeeds) {
    try {
      const feed = await parser.parseURL(url);

      for (const item of feed.items) {
        if (!sentLinks.includes(item.link)) {
          const embed = new EmbedBuilder()
            .setTitle(item.title || "Berita")
            .setDescription(item.contentSnippet || item.content || "Tidak ada deskripsi.")
            .setURL(item.link)
            .setColor(getRandomColor())
            .setTimestamp(new Date(item.isoDate || Date.now()))
            .setFooter({ text: feed.title || "Berita Terkini" });

          await message.reply({ embeds: [embed] });

          sentLinks.push(item.link);
          saveSentLinks(sentLinks);
          return;
        }
      }
    } catch (err) {
      console.error(`❌ Error ambil RSS ${url}:`, err.message);
    }
  }

  await message.reply("❌ Tidak ada berita baru yang bisa dikirim saat ini.");
};
