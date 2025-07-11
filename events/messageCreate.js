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

// Jika belum di-import:
const ROLES = [
  { id: "1352279577174605884", tag: "[OWNER]" },
  { id: "1352282368043389069", tag: "[ADMIN]" },
  { id: "1352282892935368787", tag: "[MOD]" },
  { id: "1358311584681693324", tag: "[BOOST]" },
  { id: "1352285051521601618", tag: "[CREATOR]" },
  { id: "1354161955669147649", tag: "[ALUMNI]" },
  { id: "1354196993680867370", tag: "[100]" },
  { id: "1354197284476420106", tag: "[80]" },
  { id: "1354197417754628176", tag: "[70]" },
  { id: "1354197527582212106", tag: "[60]" },
  { id: "1354197530010976521", tag: "[55]" },
  { id: "1352286232331292814", tag: "[VIP]" },
  { id: "1352286224420962376", tag: "[FRIEND]" },
  { id: "1357693246268244209", tag: "[PARTNER]" },
  { id: "1352286235233620108", tag: "[MEM]" }
];

const ROLE_DISPLAY_MAP = {
  "1352279577174605884": "「 👑 」sᴇʀᴠᴇʀ ᴏᴡɴᴇʀ",
  "1352282368043389069": "「 ❗ 」ᴀᴅᴍɪɴɪsᴛʀᴀᴛᴏʀ",
  "1352282892935368787": "「 ❓ 」ᴍᴏᴅᴇʀᴀᴛᴏʀ",
  "1358311584681693324": "「🚀」ʙᴏᴏsᴛ",
  "1352285051521601618": "「📸」ᴄᴏɴᴛᴇɴᴛ ᴄʀᴇᴀᴛᴏʀ",
  "1354161955669147649": "『 👨‍🎓』ᴀʟᴜᴍɴɪ",
  "1354196993680867370": "「100」ᴘᴇᴇʀʟᴇꜱꜱ",
  "1354197284476420106": "「80」ᴛʀᴀɴꜱᴄᴇɴᴅᴇɴᴛ",
  "1354197417754628176": "「70」ꜱᴜᴘʀᴇᴍᴇ",
  "1354197527582212106": "「60」ʟᴏʀᴅ",
  "1354197530010976521": "「55」ᴇᴍᴘᴇʀᴏʀ",
  "1352286232331292814": "『💛』VIP",
  "1352286224420962376": "『💙』ғʀɪᴇɴᴅs",
  "1357693246268244209": "「🤝」ᴘᴀʀᴛɴᴇʀsʜɪᴘ",
  "1352286235233620108": "『〽️』ᴍᴇᴍʙᴇʀ"
};

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
      .setLabel("Pakai Tag")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`test_remove_tag_${safeTagId}`)
      .setLabel("Hapus Tag")
      .setStyle(ButtonStyle.Secondary)
  );

  try {
    const member = await message.guild.members.fetch(user.id);

    // ✅ Tambahkan role jika tag cocok
    const matchedRole = ROLES.find(r => r.tag === tag);
    if (matchedRole) {
      await member.roles.add(matchedRole.id).catch(() => null);
      console.log(`✅ Role ${tag} berhasil ditambahkan ke ${user.username}`);
    } else {
      console.warn(`⚠️ Tidak ada role yang cocok dengan tag ${tag}`);
    }

    // ✅ Ambil role display tertinggi dari member
    const userDisplayRole = ROLES.find(r => member.roles.cache.has(r.id));
    const roleDisplayText = userDisplayRole
      ? ROLE_DISPLAY_MAP[userDisplayRole.id] || "Tanpa Nama"
      : "Tanpa Nama";

    await user.send({
      content: `✨ *Selamat datang, ${user.username}!*  

🔰 Kamu menerima tag eksklusif: **${tag}**  
📛 Diberikan karena kamu memiliki role: **${roleDisplayText}**

Ingin menampilkan tag itu di nickname kamu?  
Contoh: \`${tag} ${user.username}\`

───────────────────────────

Silakan pilih opsi di bawah ini: 👇`,
      components: [row],
    });

    await message.reply(`✅ DM berhasil dikirim ke ${user.username}`);
  } catch (err) {
    console.error("❌ Gagal:", err);

    if (err.code === 50007) {
      return message.reply("❌ Tidak bisa mengirim DM. User mungkin menonaktifkan DM dari server.");
    }

    if (err.code === 50013) {
      return message.reply("❌ Bot tidak punya izin untuk memberi role. Cek urutan role dan permission.");
    }

    return message.reply("❌ Terjadi kesalahan saat proses pengiriman DM atau pemberian role.");
  }
}
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
