const updateOnline = require("../online");
const stickyHandler = require("../sticky");
const autoGreeting = require("../modules/autoGreeting");
const joinvoice = require("../modules/joinvoice");
const countValidator = require("../modules/countValidator");
const textCounter = require("../modules/textCounter");
const simulateBTC = require("../modules/cryptoSimulator");
const updateCryptoMessage = require("../modules/updateCrypto");
const autoSendMeme = require("../modules/autoMeme");
const autoDelete = require("../modules/autoDeleteCryptoMessages");
const slashCommandSetup = require("../modules/slashCommandSetup");
const autoChat = require("../modules/autoChat");
const iconAnim = require("../modules/iconAnim");
const beritaModule = require("../modules/autoNews");
const rainbowRole = require("../modules/rainbowRole");
const nickAnim = require("../modules/nickAnim");

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

    try {
      // 🔁 Update jumlah online VC setiap 1 menit
      await updateOnline(guild);
      setInterval(() => updateOnline(guild), 60_000);
    } catch (err) {
      console.error("❌ Gagal update online VC:", err);
    }

    try { stickyHandler(client); } catch (err) { console.error("❌ Sticky handler error:", err); }
    try { autoGreeting(client); } catch (err) { console.error("❌ Auto greeting error:", err); }
    try { countValidator(client); } catch (err) { console.error("❌ Count validator error:", err); }
    try { textCounter(client); } catch (err) { console.error("❌ Text counter error:", err); }
    try { simulateBTC(client); } catch (err) { console.error("❌ Simulasi BTC error:", err); }
    try { autoChat(client); } catch (err) { console.error("❌ Auto chat error:", err); }
    try { nickAnim(client); } catch (err) { console.error("❌ Nickname anim error:", err); }
    try { rainbowRole(client, 60_000); } catch (err) { console.error("❌ Rainbow role error:", err); }
    try { autoDelete(client); } catch (err) { console.error("❌ Auto delete crypto messages error:", err); }

    // 🟩 Setup slash command
    try {
      await slashCommandSetup(client);
    } catch (err) {
      console.error("❌ Gagal setup slash command:", err);
    }

    // 🔁 Auto berita
    try { beritaModule(client); } catch (err) { console.error("❌ Auto berita error:", err); }

    // 📈 Update pesan grafik BTC
    setInterval(() => {
      try {
        const newContent = "📈 BTC: $65,000 (+0.4%)";
        updateCryptoMessage(client, newContent);
      } catch (err) {
        console.error("❌ Update crypto message error:", err);
      }
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
      try {
        const status = statuses[index % statuses.length];
        client.user.setActivity(status, { type: 0 });
        index++;
      } catch (err) {
        console.error("❌ Update status error:", err);
      }
    };
    updateStatus();
    setInterval(updateStatus, 60_000);

    // 🔄 Icon server animasi
    try { iconAnim.startAutoAnimation(client); } catch (err) { console.error("❌ Icon anim error:", err); }

    // 📸 Auto meme setiap 3 jam
    try {
      const memeChannel = await client.channels.fetch("1352404777513783336");
      setInterval(() => autoSendMeme(memeChannel), 10_800_000);
    } catch (err) {
      console.error("❌ Gagal fetch channel untuk auto meme:", err);
    }

    // 🔊 Join voice channel saat online
    try { await joinvoice(client); } catch (err) { console.error("❌ Gagal join voice channel:", err); }
  },
};
