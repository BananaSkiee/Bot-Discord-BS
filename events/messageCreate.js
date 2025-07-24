const fs = require("fs");
const path = require("path");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const countValidator = require("../modules/countValidator");
const handleHapusTag = require("../modules/hapusTagCommand");
const translateHandler = require("../modules/translate");
const memeCommand = require("../modules/memeCommand");
const textCounter = require("../modules/textCounter");
const autoDeleteCrypto = require("../modules/autoDeleteCryptoMessages.js");
const autoReply = require("../modules/autoReply");

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
    if (message.author.bot) return;
 // Panggil fungsi-fungsinya saat ada pesan baru
    await countValidator(message);
    await textCounter(message);
    await autoDeleteCrypto(message);

    const prefix = "!";
    const contentRaw = message.content.trim();
    const contentLower = contentRaw.toLowerCase();

await translateHandler(message);

if (!contentRaw.startsWith(prefix)) return;

const [commandRaw, ...args] = contentRaw.slice(prefix.length).trim().split(/ +/);
const command = commandRaw.toLowerCase();

// Di dalam messageCreate:
if (command === "meme") {
  return memeCommand.execute(message);
}
    
// ====== !testdm command ======
if (contentLower.startsWith("!testdm")) {
  const memberAuthor = await message.guild.members.fetch(message.author.id);
  if (!memberAuthor.roles.cache.has(ADMIN_ROLE_ID)) {
    return message.reply("❌ Kamu tidak punya izin pakai command ini.");
  }

    // ========== 2. JOIN VC ==============
    if (contentLower === "!join") {
      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel) return message.reply("❌ Join voice channel dulu.");

      try {
        const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
        const oldConnection = getVoiceConnection(message.guild.id);
        if (oldConnection) oldConnection.destroy();

        joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          selfDeaf: false,
        });

        return message.reply(`✅ Bot join ke VC **${voiceChannel.name}**`);
      } catch (err) {
        console.error("❌ Gagal join VC:", err);
        return message.reply("❌ Bot gagal join VC. Cek permission.");
      }
    }
  
  const args = contentRaw.split(/\s+/);
  const user = message.mentions.users.first();
  const inputTagRaw = args.slice(2).join(" ").trim();
  const inputTag = inputTagRaw.toUpperCase().replace(/[\[\]]/g, "");

  if (!user || !inputTag) {
    return message.reply("❌ Format salah. Contoh: `!testdm @user MOD`");
  }

  const matchedRole = ROLES.find(r =>
    r.tag.replace(/[\[\]]/g, "").toUpperCase() === inputTag
  );

  if (!matchedRole) {
    return message.reply("❌ Tag tidak valid.");
  }

  const member = await message.guild.members.fetch(user.id);
  const realTag = matchedRole.tag;
  const safeTagId = realTag.replace(/[^\w-]/g, "").toLowerCase();
  const displayName = user.globalName ?? user.username;
  const roleDisplay = ROLE_DISPLAY_MAP[matchedRole.id] || "Tanpa Nama";

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

  // ======= LANGSUNG KASIH ROLE =======
  if (!member.roles.cache.has(matchedRole.id)) {
    await member.roles.add(matchedRole.id).catch(console.error);
  }
  // ===================================

  taggedUsers[user.id].usedTags.push(matchedRole.id);
  fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`test_use_tag_${matchedRole.id}_${safeTagId}`)
      .setLabel("Ya, pakai tag ${roleTag}")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`test_remove_tag_${matchedRole.id}_${safeTagId}`)
      .setLabel("Tidak, tanpa tag")
      .setStyle(ButtonStyle.Secondary)
  );

  try {
    await user.send({
      content: `✨ *Selamat kepada ${displayName}!*

🔰 Kamu menerima tag khusus: \`${realTag}\`
📛 Diberikan karena kamu memiliki role: \`${roleDisplay}\`

Ingin menampilkan tag itu di nickname kamu?
Contoh: \`${realTag} ${displayName}\`

─────────────────────────────
Pilih salah satu opsi di bawah ini: 👇`,
      components: [row]
    });

    await message.reply(`✅ DM berhasil dikirim ke ${displayName}`);
  } catch (err) {
    console.error("❌ Gagal kirim DM:", err);
    if (err.code === 50007) {
      return message.reply("❌ DM gagal. User matiin DM dari server.");
    }
    return message.reply("❌ Terjadi kesalahan saat kirim DM.");
  }
}

    // ========== 4. HAPUS TAG ============
if (contentLower.startsWith("!hapustag")) {
return handleHapusTag(message);
}
