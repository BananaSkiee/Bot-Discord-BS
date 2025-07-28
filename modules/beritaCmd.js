const fs = require("fs");
const path = require("path");
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

const sentFilePath = path.join(__dirname, "../sentNews.json");

// Load atau inisialisasi file penyimpanan berita terkirim
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

module.exports = async (message) => {
  const sentLinks = loadSentLinks();

  for (const url of rssFeeds) {
    try {
      const feed = await parser.parseURL(url);

      for (const item of feed.items) {
        if (!sentLinks.includes(item.link)) {
          // Kirim berita pertama yang belum pernah dikirim
          await message.reply(`**${item.title}**\n${item.link}`);

          sentLinks.push(item.link);
          saveSentLinks(sentLinks);
          return; // Stop setelah kirim 1 berita
        }
      }
    } catch (err) {
      console.error(`❌ Error ambil RSS ${url}:`, err.message);
      // Lanjut ke feed berikutnya
    }
  }

  await message.reply("❌ Tidak ada berita baru yang bisa dikirim saat ini.");
};
