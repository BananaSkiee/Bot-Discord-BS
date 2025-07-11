const { config } = require("dotenv");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { ROLES } = require("../config");
config();

const ADMIN_ROLE_ID = "1352279577174605884";

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot) return;

    const prefix = "!";
    const content = message.content.trim().toLowerCase();

    // Hanya admin yg boleh pakai command !
    if (content.startsWith(prefix)) {
      const member = await message.guild.members.fetch(message.author.id);
      if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
        return message.reply("❌ Kamu tidak punya izin untuk menggunakan perintah ini.");
      }
    }

    // ===== !testdm @user [TAG] =====
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
      .setLabel(`Pakai Tag`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`test_remove_tag_${safeTagId}`)
      .setLabel("Hapus Tag")
      .setStyle(ButtonStyle.Secondary)
  );

  try {
    const member = await message.guild.members.fetch(user.id);

    // Cari role yang cocok dari list ROLES
    const matchedRole = ROLES.find((r) => tag === r.tag);

    // Tambahkan role ke user jika cocok
    if (matchedRole) {
      await member.roles.add(matchedRole.id);
      console.log(`✅ Berhasil memberi role ${tag} ke ${user.username}`);
    } else {
      console.log("⚠️ Tidak ada role yang cocok dengan tag:", tag);
    }

    // Ambil role-display (yang paling tinggi sesuai prioritas ROLES)
    const displayRole =
      member.roles.cache
        .map((role) => ROLE_DISPLAY_MAP[role.id])
        .filter(Boolean)[0] || "Tanpa Nama";

    await user.send({
      content: `✨ *Selamat datang, ${user.username}!*  

🔰 Kamu menerima tag eksklusif: **${tag}**  
📛 Diberikan karena kamu memiliki role: **${displayRole}**

Ingin menampilkan tag itu di nickname kamu?  
Contoh: \`${tag} ${user.username}\`

───────────────────────────

Silakan pilih opsi di bawah ini: 👇`,
      components: [row],
    });

    await message.reply(`✅ DM berhasil dikirim ke ${user.username}`);
  } console.error("❌ ERROR DETAIL:", err);

return message.reply(`❌ Terjadi kesalahan saat proses pengiriman DM atau pemberian role: \`${err.message}\``);
      // ===== Auto Reply Keywords (maks 3 balasan) =====
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
