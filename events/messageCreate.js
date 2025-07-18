const fs = require("fs");
const path = require("path");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

const countValidator = require("../modules/countValidator");
const handleHapusTag = require("../modules/hapusTagCommand");

const filePath = path.join(__dirname, "../data/taggedUsers.json");
const ADMIN_ROLE_ID = "1352279577174605884";

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
  "1352286232331292814": "『💜』Sᴘᴇsɪᴀʟ",
  "1352286224420962376": "『💙』ғʀɪᴇɴᴅs",
  "1357693246268244209": "「🤝」ᴘᴀʀᴛɴᴇʀsʜɪᴘ",
  "1352286235233620108": "『〽️』ᴍᴇᴍʙᴇʀ"
};

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot) {
  return;
    }

    await countValidator(message);

    const prefix = "!";
    const content = message.content.trim().toLowerCase();
    const member = await message.guild.members.fetch(message.author.id).catch(() => null);
    const isAdmin = member?.roles.cache.has(ADMIN_ROLE_ID);

const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");

// ===== JOIN VOICE =====
if (content.startsWith("!join")) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) return message.reply("❌ Join voice channel dulu.");

  try {
    // Cek apakah ada koneksi lama (misalnya waktu bot dikeluarin dari VC)
    const oldConnection = getVoiceConnection(message.guild.id);
    if (oldConnection) oldConnection.destroy();

    // Join VC
    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    return message.reply(`✅ Bot join ke VC **${voiceChannel.name}**`);
  } catch (err) {
    console.error("❌ Gagal join VC:", err);
    return message.reply("❌ Bot gagal join VC. Coba cek permission atau restart bot.");
  }
}

    // ===== TEST DM =====
    if (content.startsWith("!testdm")) {
      if (!isAdmin) return message.reply("❌ Gak punya izin.");

      const args = message.content.trim().split(/\s+/);
      const user = message.mentions.users.first();
      const inputTagRaw = args.slice(2).join(" ").trim();
      const inputTag = inputTagRaw.toUpperCase().replace(/[\[\]]/g, "");

      if (!user || !inputTag) return message.reply("❌ Contoh: `!testdm @user MOD`");

      const matchedRole = ROLES.find(r =>
        r.tag.replace(/[\[\]]/g, "").toUpperCase() === inputTag
      );
      if (!matchedRole) return message.reply("❌ Tag tidak valid.");

      const realTag = matchedRole.tag;
      const safeTagId = realTag.replace(/[^\w-]/g, "").toLowerCase();
      const displayName = user.globalName ?? user.username;
      const roleDisplay = ROLE_DISPLAY_MAP[matchedRole.id] || "Tanpa Nama";
      const member = await message.guild.members.fetch(user.id);

      let taggedUsers = {};
      if (fs.existsSync(filePath)) {
        taggedUsers = JSON.parse(fs.readFileSync(filePath));
      }

      if (!taggedUsers[user.id]) {
        taggedUsers[user.id] = {
          originalName: member.displayName,
          usedTags: []
        };
      }

      if (!member.roles.cache.has(matchedRole.id)) {
        await member.roles.add(matchedRole.id).catch(console.error);
      }

      taggedUsers[user.id].usedTags.push(matchedRole.id);
      fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`test_use_tag_${matchedRole.id}_${safeTagId}`)
          .setLabel(`✅ Pakai Tag ${realTag}`)
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`test_remove_tag_${matchedRole.id}_${safeTagId}`)
          .setLabel(`❌ Jangan Pakai Tag`)
          .setStyle(ButtonStyle.Secondary)
      );

      try {
        await user.send({
          content: `✨ *Selamat ${displayName}!*\n\n🔰 Kamu dapat tag: \`${realTag}\`\n📛 Role: \`${roleDisplay}\`\n\nIngin pakai tag ini di nickname?\n\n👇 Pilih tombol di bawah:`,
          components: [row]
        });
        await message.reply(`✅ DM terkirim ke ${displayName}`);
      } catch (err) {
        console.error("❌ Gagal kirim DM:", err);
        return message.reply("❌ Gagal kirim DM. Cek setting user.");
      }
    }

    // ===== HAPUS TAG =====
    if (content.startsWith("!hapustag")) {
      if (!isAdmin) return message.reply("❌ Gak punya izin.");
      return handleHapusTag(message);
    }

    // ===== AUTO REPLY =====
    const autoReplies = {
      pagi: ["Pagi juga! 🌞", "Selamat pagi, semangat ya!", "Eh bangun pagi juga 😴"],
      siang: ["Siang juga! 🌤️", "Jangan lupa makan siang ya!", "Siang-siang panas bener 🥵"],
      sore: ["Sore juga! 🌇", "Selamat sore, udah capek belum?", "Sore gini enaknya rebahan 😴"],
      malam: ["Selamat malam! 🌙", "Malam juga, semangat istirahat ya!", "Udah makan malam belum?"],
      halo: ["Halo halo! 👋", "Yo halo!", "Haiii 😄"],
      makasih: ["Sama-sama 😊", "Sippp 👍", "Yok sama-sama~"],
      ngantuk: ["Ngopi dulu gih ☕", "Tidur sana jangan dipaksa 😴", "Ngantuk? Wajar 😆"],
      gabut: ["Gabut? Ketik !gacha aja!", "Mau main tebak gambar? !tebak", "Chat bot aja kalo gabut 😁"],
    };

    for (const [keyword, replies] of Object.entries(autoReplies)) {
      if (content.includes(keyword)) {
        const reply = replies[Math.floor(Math.random() * replies.length)];
        return message.reply(reply).catch(console.error);
      }
    }
  },
};
    
