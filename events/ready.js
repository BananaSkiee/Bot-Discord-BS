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
const beritaModule = require("../modules/autoNews"); // ⬅️ Gunakan ini

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

    // 🟩 Setup slash command DULUAN
    await slashCommandSetup(client);

    // 🔁 Aktifkan auto berita SETELAH slash command siap
    beritaModule(client);

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
    iconAnim.startAutoAnimation(client);

    // 📸 Auto meme setiap 3 jam
    try {
      const memeChannel = await client.channels.fetch("1352404777513783336");
      setInterval(() => autoSendMeme(memeChannel), 10_800_000); // 3 jam
    } catch (err) {
      console.error("❌ Gagal fetch channel untuk auto meme:", err);
    }

    // 🔊 Join voice channel saat online
    try {
      await joinvoice(client);
    } catch (err) {
      console.error("❌ Gagal join voice channel:", err);
    }

    // 📰 Kirim berita setiap 8 jam
    const beritaChannel = await client.channels.fetch("1352331574376665178");
    const kirimBerita = async () => {
      const berita = await beritaModule.getBeritaEmbed();
      if (!berita) return;

      const embed = {
        title: berita.title,
        url: berita.url,
        description: berita.contentSnippet,
        color: Math.floor(Math.random() * 0xffffff),
        footer: {
          text: `Sumber: ${berita.source}`
        },
        timestamp: berita.date
      };

      beritaChannel.send({ embeds: [embed] });
    };

    kirimBerita(); // kirim di awal
    setInterval(kirimBerita, 8 * 60 * 60 * 1000); // setiap 8 jam
  },
};
