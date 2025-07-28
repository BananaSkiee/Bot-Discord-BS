const { EmbedBuilder } = require("discord.js");
const Parser = require("rss-parser");
const fs = require("fs");
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

function loadSentLinks() {
  try {
    return JSON.parse(fs.readFileSync("sentLinks.json"));
  } catch (e) {
    return [];
  }
}

function saveSentLinks(links) {
  fs.writeFileSync("sentLinks.json", JSON.stringify(links, null, 2));
}

module.exports = async function beritaCmd(message) {
  const sentLinks = loadSentLinks();

  for (const feedUrl of rssFeeds) {
    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items) {
        if (!sentLinks.includes(item.link)) {
          // Cari gambar
          let image = null;
          if (item.enclosure?.url) {
            image = item.enclosure.url;
          } else {
            const match = (item.content || item.contentSnippet || "").match(/<img[^>]+src="([^">]+)"/);
            if (match?.[1]) {
              image = match[1];
            }
          }

          // Jika ada gambar → pakai embed
          if (image) {
            const embed = new EmbedBuilder()
              .setTitle(item.title || "Berita")
              .setURL(item.link)
              .setDescription(item.contentSnippet?.slice(0, 200) + "..." || "Klik untuk baca selengkapnya.")
              .setImage(image)
              .setColor(Math.floor(Math.random() * 0xffffff))
              .setTimestamp(new Date(item.pubDate || Date.now()));

            await message.reply({ embeds: [embed] });
          } else {
            // Tanpa embed → reply teks dengan format markdown
            await message.reply(`[📰 ${item.title}](${item.link})`);
          }

          sentLinks.push(item.link);
          saveSentLinks(sentLinks);
          return;
        }
      }
    } catch (err) {
      console.error(`Gagal fetch RSS dari ${feedUrl}:`, err.message);
    }
  }

  await message.reply("Tidak ada berita baru untuk saat ini.");
};
