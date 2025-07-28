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
const targetChannelId = "1352331574376665178";

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

async function kirimBerita(client) {
  const channel = client.channels.cache.get(targetChannelId);
  if (!channel) return console.error("❌ Channel tidak ditemukan.");

  const sentLinks = loadSentLinks();

  for (const url of rssFeeds) {
    try {
      const feed = await parser.parseURL(url);

      for (const item of feed.items) {
        if (!sentLinks.includes(item.link)) {
          await channel.send(`**${item.title}**\n${item.link}`);
          sentLinks.push(item.link);
          saveSentLinks(sentLinks);
          return;
        }
      }
    } catch (err) {
      console.error(`❌ Error ambil RSS ${url}:`, err.message);
    }
  }

  channel.send("❌ Tidak ada berita baru yang bisa dikirim saat ini.");
}

module.exports = {
  startBeritaSchedule(client) {
    const waktuKirim = ["08:00", "13:00", "19:00"]; // Jam kirim dalam format HH:mm (UTC)

    setInterval(() => {
      const now = new Date();
      const jam = now.getUTCHours().toString().padStart(2, "0");
      const menit = now.getUTCMinutes().toString().padStart(2, "0");
      const currentTime = `${jam}:${menit}`;

      if (waktuKirim.includes(currentTime)) {
        console.log(`📰 Kirim berita otomatis jam ${currentTime}`);
        kirimBerita(client);
      }
    }, 60 * 1000); // Cek setiap menit
  }
};
