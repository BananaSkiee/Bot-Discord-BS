const { config } = require("dotenv");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
config();

const ALLOWED_ROLE_ID = "1352279577174605884"; // Hanya role admin ini yg bisa pakai command (!)

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();
    const prefix = "!";

    // ✅ Hanya role admin yang bisa pakai command (!)
    if (content.startsWith(prefix)) {
      const member = await message.guild.members.fetch(message.author.id);
      if (!member.roles.cache.has(ALLOWED_ROLE_ID)) {
        return message.reply("❌ Kamu tidak punya izin untuk menggunakan perintah ini.");
      }
    }

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

    // ===== Command: !testdm @user [TAG] =====
    if (content.startsWith("!testdm")) {
      const args = message.content.trim().split(/\s+/);
      const user = message.mentions.users.first();
      const tag = args.slice(2).join(" ").trim();

      if (!user || !tag) {
        return message.reply("❌ Format salah. Contoh: `!testdm @user [TAG]`");
      }

      const safeTagId = tag.replace(/[^\w-]/g, "");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`test_use_tag_${safeTagId}`)
          .setLabel("Pakai Tag ${role.tag}")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`test_remove_tag_${safeTagId}`)
          .setLabel("Hapus Tag")
          .setStyle(ButtonStyle.Secondary)
      );

      try {
        await user.send({
          content:
`✨ *Selamat datang, ${user.username}!*

🔰 *Kamu telah menerima tag eksklusif ${tag} dari server BananaSkiee Community.*

Ingin menampilkan tag itu di nickname kamu?
Contoh: \`${tag} ${user.username}\`

──────────────────────

Pilih opsi di bawah ini 👇`,
          components: [row],
        });

        await message.reply(`✅ DM berhasil dikirim ke ${user.username}`);
      } catch (err) {
        console.error(err);
        await message.reply("❌ Gagal mengirim DM. Pastikan user mengaktifkan DM dari server.");
      }
    }

    // ===== Auto-Reply Keyword (max 3 per keyword) =====
    const autoReplies = {
      pagi: ["Pagi juga! 🌞", "Selamat pagi, semangat ya hari ini!", "Eh, bangun pagi juga kamu 😴"],
      siang: ["Siang juga! 🌤️", "Jangan lupa makan siang ya!", "Siang siang panas bener 🥵"],
      sore: ["Sore juga! 🌇", "Selamat sore, udah capek belom?", "Sore gini enaknya jalan-jalan 🏃‍♂️"],
      malam: ["Selamat malam! 🌙", "Malam juga, semangat istirahat ya!", "Udah makan malam belom?"],
      halo: ["Halo halo! 👋", "Yo halo!", "Haiii! 😄"],
      makasih: ["Sama-sama! 😊", "Sippp 👍", "Yok sama-sama~"],
      ngantuk: ["Ngopi dulu gih! ☕", "Tidur sana jangan dipaksa 😴", "Ngantuk? Wajar, hidup berat 😆"],
      gabut: ["Gabut? Ketik !gacha aja!", "Mau main tebak gambar? !tebak", "Chat bot aja kalo gabut 😁"],
      hehehe: ["Hehe kenapa sih 🤭", "Ngakak sendiri ya? 😅", "Hehe iya iya 😏"],
      anjir: ["Anjir parah sih 😳", "Anjir kenapa tuh?", "Wkwk anjir banget"],
      woi: ["WOI kenapaa 😤", "Sini gua dengerin", "Santai dong bang"],
      bang: ["Siap bang 👊", "Kenapa bang?", "Tenang bang, aman 😎"],
      cape: ["Sini aku pijetin 😌", "Rebahan dulu aja...", "Jangan lupa istirahat ya"],
      bosen: ["Main Discord dulu 😆", "Bosen? Coba cari konten baru~", "Main game yuk!"],
      kangen: ["Kangen siapa tuh? 😏", "Sini pelukk 🤗", "Kangen tuh berat..."],
      bye: ["👋 Bye bye! Jangan lupa balik lagi ya!", "Daaah~ hati-hati ya di jalan 😄", "Sampai ketemu lagi! 💫"],
    };

    for (const [keyword, replies] of Object.entries(autoReplies)) {
      if (content.includes(keyword)) {
        const reply = replies[Math.floor(Math.random() * replies.length)];
        return message.reply(reply).catch(console.error);
      }
    }
  },
};
