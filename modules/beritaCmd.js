const fs = require("fs");
const path = require("path");
const Parser = require("rss-parser");
const { EmbedBuilder } = require("discord.js");
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

// Fungsi untuk mengambil nama sumber dan gambar berdasarkan URL feed
function getSourceInfo(url) {
  if (url.includes("kompas")) {
    return { name: "Kompas", icon: "https://asset.kompas.com/data/2017/wp/images/favicon-kompascom-new.png" };
  } else if (url.includes("detik")) {
    return { name: "Detik", icon: "https://cdn.detik.net.id/favicon.ico" };
  } else if (url.includes("cnnindonesia")) {
    return { name: "CNN Indonesia", icon: "https://cdn.cnnindonesia.com/cnnid/images/favicon.png" };
  } else if (url.includes("antaranews")) {
    return { name: "Antara News", icon: "https://www.antaranews.com/img/antaranewscom.ico" };
  } else if (url.includes("tempo")) {
    return { name: "Tempo", icon: "https://tempo.co/favicon.ico" };
  } else if (url.includes("merdeka")) {
    return { name: "Merdeka", icon: "https://www.merdeka.com/favicon.ico" };
  } else if (url.includes("republika")) {
    return { name: "Republika", icon: "https://static.republika.co.id/favicon.ico" };
  } else {
    return { name: "Berita", icon: "https://cdn-icons-png.flaticon.com/512/21/21601.png" };
  }
}

module.exports = async (message) => {
  const sentLinks = loadSentLinks();

  for (const url of rssFeeds) {
    try {
      const feed = await parser.parseURL(url);
      const source = getSourceInfo(url);

      for (const item of feed.items) {
        if (!sentLinks.includes(item.link)) {
          const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleString("id-ID") : "Waktu tidak diketahui";

          const embed = new EmbedBuilder()
            .setTitle(item.title || "Tanpa Judul")
            .setDescription(item.contentSnippet?.substring(0, 200) || "Tidak ada deskripsi.")
            .setURL(item.link)
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setAuthor({ name: `${source.name} • ${pubDate}`, iconURL: source.icon })
            .setThumbnail(source.icon)
            .setFooter({ text: "Dikirim oleh bot berita otomatis" });

          await message.reply({
            content: `[${item.title}](${item.link})`,
            embeds: [embed]
          });

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
