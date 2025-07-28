const updateOnline = require("../online");
const stickyHandler = require("../sticky");
const autoGreeting = require("../modules/autoGreeting");
const joinvoice = require("../modules/joinvoice");
const countValidator = require("../modules/countValidator");
const textCounter = require("../modules/textCounter");
const simulateBTC = require("../modules/cryptoSimulator");
const updateCryptoMessage = require("../modules/updateCrypto");
const autoSendMeme = require("../modules/autoMeme");
const autoDelete = require("../modules/autoDeleteCryptoMessages.js");
const slashCommandSetup = require("../modules/slashCommandSetup");
const autoChat = require("../modules/autoChat");
const iconAnim = require("../modules/iconAnim");
const autoNews = require('../modules/autoNews');

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`🤖 Bot siap sebagai ${client.user.tag}`);

    console.log(`🧩 Bot berada di ${client.guilds.cache.size} server:`);
    client.guilds.cache.forEach((guild) => {
      console.log(`- ${guild.name} (ID: ${guild.id})`);
    });

    const guild = client.guilds.cache.first();
    if (!guild) return;

    // 🔁 Update jumlah online VC setiap 1 menit
    await updateOnline(guild);
    setInterval(() => updateOnline(guild), 60_000);

    // 📌 Sticky Message
    stickyHandler(client);

    // 👋 Auto Greeting
    autoGreeting(client);

    // 🔢 Counter validator
    countValidator(client);

    // 🪙 Simulasi Bitcoin
    simulateBTC(client);

    // 💬 Auto Chat
    autoChat(client);

    // aktifkan auto berita
    autoNews(client);

    // 🟩 Setup slash command
    await slashCommandSetup(client);

    // 📈 Update pesan grafik BTC (1 menit)
    setInterval(() => {
      const newContent = "📈 BTC: $65,000 (+0.4%)";
      updateCryptoMessage(client, newContent);
    }, 60_000);

    // 💡 Status ganti setiap 1 menit
    const statuses = [
      "🌌 Menembus batas kemungkinan",
      "📖 Membaca alur takdir",
      "🎧 Mendengarkan suara hati server",
      "🧠 Belajar tanpa akhir",
      "🗝️ Menjaga kedamaian digital",
      "🕊️ Menyebar aura positif",
      "⚙️ Melayani tanpa lelah",
      "🌙 Diam tapi ada",
      "🔮 Menerawang masa depan",
      "🌟 Jadi cahaya di kegelapan",
      "🛡️ Mengamankan dunia maya",
      "📡 Terhubung dengan dimensi lain",
      "⏳ Waktu terus berjalan... dan aku tetap di sini",
    ];

    let index = 0;
    const updateStatus = () => {
      const status = statuses[index % statuses.length];
      client.user.setActivity(status, { type: 0 });
      index++;
    };
    updateStatus();
    setInterval(updateStatus, 60_000);

    // 🔄 Mulai animasi icon server setiap 5 menit
    iconAnim.startAnimation(guild);

    // 📸 Auto meme setiap 3 jam
    try {
      const channel = await client.channels.fetch("1352404777513783336");
      setInterval(() => autoSendMeme(channel), 10_800_000); // 3 jam
    } catch (err) {
      console.error("❌ Gagal fetch channel untuk auto meme:", err);
    }

    // 🔊 Join voice channel saat online
    try {
      await joinvoice(client);
    } catch (err) {
      console.error("❌ Gagal join voice channel:", err);
    }
  },
};
