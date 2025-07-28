const Parser = require('rss-parser');
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

const CHANNEL_ID = "1352331574376665178";
const sentNews = new Set();

module.exports = async function autoNews(client) {
  const sendNews = async () => {
    const channel = await client.channels.fetch(CHANNEL_ID);
    for (const url of rssFeeds) {
      try {
        const feed = await parser.parseURL(url);
        for (const item of feed.items.slice(0, 2)) {
          if (!sentNews.has(item.link)) {
            sentNews.add(item.link);
            await channel.send(`📰 **${item.title}**\n${item.link}`);
          }
        }
      } catch (err) {
        console.error(`Gagal ambil dari ${url}:`, err.message);
      }
    }

    // Batasi cache maksimal 100 berita
    if (sentNews.size > 100) {
      sentNews.clear();
    }
  };

  // Jam kirim: 08:00, 14:00, 20:00
  const schedule = [8, 14, 20];

  setInterval(async () => {
    const now = new Date();
    const hour = now.getHours();

    if (schedule.includes(hour) && now.getMinutes() === 0) {
      console.log(`🕒 Kirim berita jam ${hour}:00`);
      await sendNews();
    }
  }, 60 * 1000); // Cek setiap menit
};
