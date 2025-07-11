const { config } = require("dotenv");
config();

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();
    const prefix = "!";

    // ===== Command: !testucapan pagi/siang/sore/malam =====
    if (content.startsWith(`${prefix}testucapan`)) {
      const args = content.split(" ");
      const waktu = args[1];
      const channelId = process.env.AUTO_CHAT_CHANNEL_ID;
      const targetChannel = client.channels.cache.get(channelId);

      if (!waktu || !["pagi", "siang", "sore", "malam"].includes(waktu)) {
        return message.reply("❌ Format salah. Gunakan: `!testucapan pagi/siang/sore/malam`");
      }

      const ucapanMap = {
        pagi: "🌤️ Selamat pagi semua! Semangat menjalani harinya ya~",
        siang: "☀️ Selamat siang! Jangan lupa makan siang 🍱",
        sore: "🌇 Selamat sore! Istirahat sejenak yuk~",
        malam: "🌙 Selamat malam! Waktunya tidur nyenyak 😴",
      };

      if (!targetChannel) return message.reply("❌ Channel ucapan tidak ditemukan.");

      try {
        await targetChannel.send(ucapanMap[waktu]);
        await message.reply(`✅ Ucapan ${waktu} berhasil dikirim ke <#${channelId}>`);
      } catch (err) {
        console.error(err);
        await message.reply("❌ Gagal mengirim ucapan.");
      }
      return;
    }

    // ===== Auto-Reply Keyword (max 3 per keyword) =====
    const autoReplies = {
      pagi: [
        "Pagi juga! 🌞",
        "Selamat pagi, semangat ya hari ini!",
        "Eh, bangun pagi juga kamu 😴",
      ],
      siang: [
        "Siang juga! 🌤️",
        "Jangan lupa makan siang ya!",
        "Siang siang panas bener 🥵",
      ],
      sore: [
        "Sore juga! 🌇",
        "Selamat sore, udah capek belom?",
        "Sore gini enaknya jalan-jalan 🏃‍♂️",
      ],
      malam: [
        "Selamat malam! 🌙",
        "Malam juga, semangat istirahat ya!",
        "Udah makan malam belom?",
      ],
      halo: [
        "Halo halo! 👋",
        "Yo halo!",
        "Haiii! 😄",
      ],
      makasih: [
        "Sama-sama! 😊",
        "Sippp 👍",
        "Yok sama-sama~",
      ],
      ngantuk: [
        "Ngopi dulu gih! ☕",
        "Tidur sana jangan dipaksa 😴",
        "Ngantuk? Wajar, hidup berat 😆",
      ],
      gabut: [
        "Gabut? Ketik !gacha aja!",
        "Mau main tebak gambar? !tebak",
        "Chat bot aja kalo gabut 😁",
      ],
      hehehe: [
        "Hehe kenapa sih 🤭",
        "Ngakak sendiri ya? 😅",
        "Hehe iya iya 😏",
      ],
      anjir: [
        "Anjir parah sih 😳",
        "Anjir kenapa tuh?",
        "Wkwk anjir banget",
      ],
      woi: [
        "WOI kenapaa 😤",
        "Sini gua dengerin",
        "Santai dong bang",
      ],
      bang: [
        "Siap bang 👊",
        "Kenapa bang?",
        "Tenang bang, aman 😎",
      ],
      cape: [
        "Sini aku pijetin 😌",
        "Rebahan dulu aja...",
        "Jangan lupa istirahat ya",
      ],
      bosen: [
        "Main Discord dulu 😆",
        "Bosen? Coba cari konten baru~",
        "Main game yuk!",
      ],
      kangen: [
        "Kangen siapa tuh? 😏",
        "Sini pelukk 🤗",
        "Kangen tuh berat...",
      ],
      bye: [
        "👋 Bye bye! Jangan lupa balik lagi ya!",
        "Daaah~ hati-hati ya di jalan 😄",
        "Sampai ketemu lagi! 💫",
      ]
    };

    for (const [keyword, replies] of Object.entries(autoReplies)) {
      if (content.includes(keyword)) {
        const reply = replies[Math.floor(Math.random() * replies.length)];
        return message.reply(reply).catch(console.error);
      }
    }

    // ❌ Bagian mention bot/chat AI dihapus sesuai permintaan.
  },
};
