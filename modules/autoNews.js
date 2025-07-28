const Parser = require("rss-parser");
const fs = require("fs");
const path = require("path");
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

const SENT_FILE = path.join(__dirname, "../data/sentNews.json");

function loadSentLinks() {
  if (!fs.existsSync(SENT_FILE)) return [];
  return JSON.parse(fs.readFileSync(SENT_FILE));
}

function saveSentLink(link) {
  const sent = loadSentLinks();
  sent.push(link);
  fs.writeFileSync(SENT_FILE, JSON.stringify(sent, null, 2));
}

function getRandomColor() {
  return Math.floor(Math.random() * 0xffffff);
}

async function getBerita() {
  const sentLinks = loadSentLinks();

  for (const feedUrl of rssFeeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const beritaBaru = feed.items.find(item => !sentLinks.includes(item.link));
      if (beritaBaru) {
        saveSentLink(beritaBaru.link);
        return {
          title: beritaBaru.title,
          url: beritaBaru.link,
          source: feed.title,
          date: new Date(beritaBaru.pubDate || beritaBaru.isoDate || Date.now()),
          contentSnippet: beritaBaru.contentSnippet || "Tidak ada ringkasan."
        };
      }
    } catch (err) {
      console.error("Gagal ambil RSS:", feedUrl, err);
    }
  }

  return null;
}

module.exports = {
  name: "berita",
  description: "📢 Kirim 1 berita terbaru dari media Indonesia",
  async execute(message) {
    const berita = await getBerita();
    if (!berita) {
      return message.channel.send("⚠️ Tidak ada berita baru untuk saat ini.");
    }

    const embed = {
      title: berita.title,
      url: berita.url,
      description: berita.contentSnippet,
      color: getRandomColor(),
      footer: {
        text: `Sumber: ${berita.source}`
      },
      timestamp: berita.date
    };

    message.channel.send({ embeds: [embed] });
  },
  getBeritaEmbed: getBerita // biar bisa dipakai scheduler otomatis
};
