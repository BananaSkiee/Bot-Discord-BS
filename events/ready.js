const updateOnline = require("../online");
const stickyHandler = require("../sticky");
const autoGreeting = require("../modules/autoGreeting");
const joinvoice = require("../modules/joinvoice");
const autoSendMeme = require("../modules/autoMeme"); // ✅ Tambahkan ini

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`🤖 Bot siap sebagai ${client.user.tag}`);

    const guild = client.guilds.cache.first();
    if (!guild) return;

    // Update online VC
    await updateOnline(guild);
    setInterval(() => updateOnline(guild), 60000);

    // Sticky Message
    stickyHandler(client);

    // Auto Greeting
    autoGreeting(client);

    // 🔊 Join voice channel saat online
    try {
      await joinvoice(client);
    } catch (err) {
      console.error("❌ Gagal join voice channel:", err);
    }

// 📤 Auto kirim meme tiap 2 jam
const memeChannel = client.channels.cache.get("1352404777513783336"); // 🔁 Ganti dengan ID channel-mu
if (memeChannel) {
  autoSendMeme(memeChannel); // Kirim saat bot ready
  setInterval(() => autoSendMeme(memeChannel), 7200000); // Kirim tiap 2 jam (7200000 ms)
} else {
  console.warn("⚠️ Channel meme tidak ditemukan. Cek ID_CHANNEL_MEME");
    }
  },
};
