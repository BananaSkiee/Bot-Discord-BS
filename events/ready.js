const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const updateOnline = require("../online");
const stickyHandler = require("../sticky");
const autoGreeting = require("../modules/autoGreeting");
const joinvoice = require("../modules/joinvoice");
const simulateBTC = require("../modules/cryptoSimulator");
const autoSendMeme = require("../modules/autoMeme");
const slashCommandSetup = require("../modules/slashCommandSetup");
const iconAnim = require("../modules/iconAnim");
const beritaModule = require("../modules/autoNews");
const rainbowRole = require("../modules/rainbowRole");
const nickAnim = require("../modules/nickAnim");

const channelId = "1352326247186694164"; // ID channel #rules
const memeChannelId = "1352404777513783336"; // ID channel meme

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`🤖 Bot siap sebagai ${client.user.tag}`);

    // 🔹 Kirim rules embed otomatis kalau belum ada
    try {
      const channel = client.channels.cache.get(channelId);
      if (!channel) return console.error("❌ Channel rules tidak ditemukan");

      const messages = await channel.messages.fetch({ limit: 50 });
      const alreadySent = messages.some(msg =>
        msg.author.id === client.user.id &&
        msg.embeds.length > 0 &&
        msg.embeds[0].title === "📜 Rules, Punishment & Sistem Warn"
      );

      if (!alreadySent) {
        const embed = new EmbedBuilder()
          .setTitle("📜 Rules, Punishment & Sistem Warn")
          .setDescription("Sebelum berinteraksi di server, pastikan kamu membaca rules agar tidak terjadi pelanggaran.\n\n**Pilih tombol di bawah untuk melihat detail aturan.**")
          .setColor("Blue")
          .setImage("https://i.ibb.co/4wcgBZQS/6f59b29a5247.gif");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("rules_btn")
            .setLabel("📜 Rules")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("punishment_btn")
            .setLabel("⚠️ Punishment")
            .setStyle(ButtonStyle.Danger)
        );

        await channel.send({ embeds: [embed], components: [row] });
        console.log("✅ Rules otomatis dikirim ke channel rules.");
      } else {
        console.log("⚠️ Rules sudah dikirim sebelumnya. Skip.");
      }
    } catch (err) {
      console.error("❌ Error saat mengirim rules:", err);
    }

    // 🔹 Log daftar server
    console.log(`🧩 Bot berada di ${client.guilds.cache.size} server:`);
    client.guilds.cache.forEach((guild) => {
      console.log(`- ${guild.name} (ID: ${guild.id})`);
    });

    // 🔁 Fitur online VC counter
    const guild = client.guilds.cache.first();
    if (guild) {
      try {
        await updateOnline(guild);
        setInterval(() => updateOnline(guild), 60_000);
      } catch (err) {
        console.error("❌ Gagal update online VC:", err);
      }
    }

    // 🔄 Jalankan semua fitur background
    try { stickyHandler(client); } catch (err) { console.error("❌ Sticky handler error:", err); }
    try { autoGreeting(client); } catch (err) { console.error("❌ Auto greeting error:", err); }
    try { simulateBTC(client); } catch (err) { console.error("❌ Simulasi BTC error:", err); }
    try { nickAnim(client); } catch (err) { console.error("❌ Nickname anim error:", err); }
    try { rainbowRole(client, 60_000); } catch (err) { console.error("❌ Rainbow role error:", err); }

    // 🟩 Setup slash command
    try {
      await slashCommandSetup(client);
    } catch (err) {
      console.error("❌ Gagal setup slash command:", err);
    }

    // 🔁 Auto berita
    try { beritaModule(client); } catch (err) { console.error("❌ Auto berita error:", err); }

    // 💡 Status bot berganti tiap 1 menit
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

    // 📸 Auto meme tiap 3 jam
    try {
      const memeChannel = await client.channels.fetch(memeChannelId);
      setInterval(() => autoSendMeme(memeChannel), 10_800_000);
    } catch (err) {
      console.error("❌ Gagal fetch channel untuk auto meme:", err);
    }

    // 🔊 Join VC otomatis saat bot online
    try { await joinvoice(client); } catch (err) { console.error("❌ Gagal join voice channel:", err); }
  },
};
