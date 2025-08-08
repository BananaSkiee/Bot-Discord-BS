const fs = require("fs");
const path = require("path");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, EmbedBuilder } = require("discord.js");

const countValidator = require("../modules/countValidator");
const handleHapusTag = require("../modules/hapusTagCommand");
const translateHandler = require("../modules/translate");
const memeCommand = require("../modules/memeCommand");
const autoReply = require("../modules/autoReply");
const autoChat = require("../modules/autoChat");
const generateWelcomeCard = require("../modules/welcomeCard");
const getRandomQuote = require("../modules/welcomeQuotes"); // sesuaikan path-nya
const autoEmoji = require("../modules/autoEmoji");
const autoReactEmoji = require("../modules/autoReactEmoji");
const beritaCmd = require("../modules/beritaCmd.js");
const tebakAngka = require("../modules/tebakAngka");
const coinSystem = require("../modules/coinSystem");
const rulesCommand = require("../modules/rulesCommand");
const autoWarn = require("../modules/autoWarn");
const antiLink = require("../modules/antiLink");
const { handleGrafikCommand } = require("./modules/cryptoSimulator");
const { warnUser, setWarn, checkMute, getWarn } = require("../modules/autoWarning");

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
    await autoReply(message);
    await autoChat(message);
    await autoEmoji(message);
    autoReactEmoji.execute(message);
    autoWarn.execute(message);     // Untuk toxic
    antiLink.execute(message);    
    
    const prefix = "!";
    const contentRaw = message.content.trim();
    const contentLower = contentRaw.toLowerCase();

await translateHandler(message);

if (!contentRaw.startsWith(prefix)) return;

const [commandRaw, ...args] = contentRaw.slice(prefix.length).trim().split(/ +/);
const command = commandRaw.toLowerCase();

  if (message.content === "!grafik") {
    await handleGrafikCommand(message, client);
      }
    
if (command === "rules") {
    return rulesCommand(message);
}
    
// Di dalam messageCreate:
if (command === "meme") {
  return memeCommand.execute(message);
}

  if (command === "berita") {
    await beritaCmd(message);
  }

if (command === "tebakangka") {
  return tebakAngka(message);
}

  // ====================
  // !warn @user [alasan]
  // ====================
  if (message.content.startsWith("!warn")) {
    if (!isAdmin) return;

    const args = message.content.split(" ");
    const user = message.mentions.members.first();
    const reason = args.slice(2).join(" ") || "Tidak ada alasan.";

    if (!user) return message.reply("❌ Mention user yang ingin di-warn.");

    const currentWarn = addWarn(user.id);
    message.channel.send(`⚠️ ${user} telah diberi peringatan. Total: ${currentWarn} warn. Alasan: ${reason}`);

    if (currentWarn >= MAX_WARN) {
      try {
        await user.timeout(10 * 60 * 1000, "Auto mute karena melebihi batas warn"); // timeout 10 menit
        message.channel.send(`🔇 ${user} telah di-mute otomatis karena mencapai ${currentWarn} warn.`);
      } catch (err) {
        console.error("Gagal mute user:", err);
        message.channel.send("❌ Gagal mute user.");
      }
    }
  }

  // ========================
  // !setwarn @user jumlah
  // ========================
  if (message.content.startsWith("!setwarn")) {
    if (!isAdmin) return;

    const args = message.content.split(" ");
    const user = message.mentions.members.first();
    const jumlah = parseInt(args[2]);

    if (!user || isNaN(jumlah)) return message.reply("❌ Format: !setwarn @user jumlah");

    const newWarn = setWarn(user.id, jumlah);
    message.channel.send(`✅ Jumlah warn untuk ${user} di-set menjadi ${newWarn}.`);

    if (newWarn >= MAX_WARN) {
      try {
        await user.timeout(10 * 60 * 1000, "Auto mute karena setwarn mencapai batas");
        message.channel.send(`🔇 ${user} telah di-mute otomatis karena mencapai ${newWarn} warn.`);
} catch (err) {
    console.error("Gagal mute user:", err);
  }
    }  
    
// Command cek saldo
if (command === "coin") {
  const balance = coinSystem.getCoins(message.author.id);
  return message.reply(`💰 Kamu punya **${balance}** BS Coin.`);
}
    
// ==== TEST MEMBER JOIN ====
if (command === "testjoin") {
  // Hanya admin yang bisa
  if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
    return message.reply("❌ Kamu tidak punya izin untuk menjalankan perintah ini.");
  }

  const member = message.member;
  const inviter = message.author; // Karena ini simulasi, kita anggap yang jalankan cmd sebagai pengundang

  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("👋 [TEST] Selamat Datang!")
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: "👤 Member", value: `<@${member.id}>`, inline: true },
      { name: "📩 Diundang oleh", value: `<@${inviter.id}>`, inline: true },
      { name: "🔗 Link Invite", value: "discord.gg/testcode", inline: false },
      { name: "📊 Total Invites", value: "10 (+1)", inline: true },
      { name: "👥 Total Member", value: `${member.guild.memberCount}`, inline: true }
    )
    .setFooter({ text: `Bergabung pada ${new Date().toLocaleString()}` });

  return message.channel.send({ embeds: [embed] });
}

// ==== TEST MEMBER LEAVE ====
if (command === "testleave") {
  // Hanya admin yang bisa
  if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
    return message.reply("❌ Kamu tidak punya izin untuk menjalankan perintah ini.");
  }

  const member = message.member;
  const inviter = message.author; // Simulasi pengundang

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("👋 [TEST] Selamat Tinggal!")
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: "👤 Member", value: `<@${member.id}>`, inline: true },
      { name: "📩 Diundang oleh", value: `<@${inviter.id}>`, inline: true },
      { name: "📊 Total Invites", value: "9 (-1)", inline: true },
      { name: "👥 Total Member", value: `${member.guild.memberCount}`, inline: true }
    )
    .setFooter({ text: `Keluar pada ${new Date().toLocaleString()}` });

  return message.channel.send({ embeds: [embed] });
    }

// ==== COMMAND TEST INVITES ====
const invitesPath = path.join(__dirname, "../data/invites.json");

if (command === "testinvites") {
  if (!fs.existsSync(invitesPath)) {
    return message.reply("❌ Data invite belum ada.");
  }

  const invitesData = JSON.parse(fs.readFileSync(invitesPath, "utf8"));
  const guildData = invitesData[message.guild.id];
  if (!guildData || !guildData.users) {
    return message.reply("⚠ Tidak ada data user invite di server ini.");
  }

  const desc = Object.entries(guildData.users)
    .map(([userId, count]) => `<@${userId}> — **${count}** invites`)
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("📊 Data Invite (Test)")
    .setDescription(desc || "Tidak ada data.")
    .setFooter({ text: `Total: ${Object.keys(guildData.users).length} user` });

  return message.channel.send({ embeds: [embed] });
}

if (command === "testtop") {
  if (!fs.existsSync(invitesPath)) {
    return message.reply("❌ Data invite belum ada.");
  }

  const invitesData = JSON.parse(fs.readFileSync(invitesPath, "utf8"));
  const guildData = invitesData[message.guild.id];
  if (!guildData || !guildData.users) {
    return message.reply("⚠ Tidak ada data user invite di server ini.");
  }

  const sorted = Object.entries(guildData.users)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const desc = sorted
    .map(([userId, count], i) => `**${i + 1}.** <@${userId}> — **${count}** invites`)
    .join("\n");

  const embed = new EmbedBuilder()
    .setColor("Blue")
    .setTitle("🏆 Top 10 Inviter (Test)")
    .setDescription(desc || "Tidak ada data.")
    .setFooter({ text: `Total inviter: ${Object.keys(guildData.users).length} user` });

  return message.channel.send({ embeds: [embed] });
}

if (command === "testwho") {
  const targetUser = message.mentions.users.first();
  if (!targetUser) {
    return message.reply("❌ Tag user yang mau dicek.");
  }

  if (!fs.existsSync(invitesPath)) {
    return message.reply("❌ Data invite belum ada.");
  }

  const invitesData = JSON.parse(fs.readFileSync(invitesPath, "utf8"));
  const guildData = invitesData[message.guild.id];
  if (!guildData || !guildData.joins) {
    return message.reply("⚠ Tidak ada data join di server ini.");
  }

  const invitedAccounts = Object.entries(guildData.joins)
    .filter(([memberId, inviterId]) => inviterId === targetUser.id)
    .map(([memberId]) => `<@${memberId}>`);

  const embed = new EmbedBuilder()
    .setColor("Yellow")
    .setTitle(`👥 Akun yang diundang oleh ${targetUser.username}`)
    .setDescription(invitedAccounts.length > 0 ? invitedAccounts.join("\n") : "Tidak ada yang diundang.")
    .setFooter({ text: `Total: ${invitedAccounts.length} akun` });

  return message.channel.send({ embeds: [embed] });
    }

if (command === "addcoin") {
  if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
    return message.reply("❌ Kamu tidak punya izin pakai command ini.");
  }

  const target = message.mentions.users.first();
  const amount = parseInt(args[1]);

  if (!target || isNaN(amount)) {
    return message.reply("❌ Format: `!addcoin @user jumlah`");
  }

  const newBalance = coinSystem.addCoins(target.id, amount);
  return message.reply(`✅ Berhasil menambah **${amount}** BS Coin ke ${target.username}. Saldo sekarang: **${newBalance}**`);
}    
    
if (command === 'w') { // Menggunakan 'command' dari struktur kode Anda
    if (message.author.bot) return;

    const member = message.member;
    const channel = message.channel; // Tes akan dikirim di channel saat ini

    // --- ID CHANNEL UNTUK TOMBOL ---
    const rulesChannelId   = '1352326247186694164';
    const rolesChannelId   = '1352823970054803509';
    const helpChannelId    = '1352326787367047188';
    // ------------------------------------
    
    try {
        const imageBuffer = await generateWelcomeCard(member);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-card.png' });

const { EmbedBuilder } = require('discord.js');

// Fungsi warna acak HEX
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const message = getRandomQuote(member.user.username);

const testEmbed = new EmbedBuilder()
  .setColor(getRandomColor())
  .setTitle(`${message}`)
  .setImage('attachment://welcome-card.png')
  .setFooter({
    text: '© Copyright | BananaSkiee Community',
    iconURL: 'https://i.imgur.com/RGp8pqJ.jpeg',
  })
  .setTimestamp();
      
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Rules')
                    .setEmoji('📖')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/channels/${member.guild.id}/${rulesChannelId}`),
                
                new ButtonBuilder()
                    .setLabel('Verified')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/channels/${member.guild.id}/${rolesChannelId}`),

                new ButtonBuilder()
                    .setLabel('Bantuan')
                    .setEmoji('❓')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/channels/${member.guild.id}/${helpChannelId}`)
            );
        
        // Kirim pesan tes ke channel tempat command dijalankan
        await channel.send({ 
  content: `<a:BananaSkiee:1360541400382439475> <a:rflx:1361623860205715589> <a:rflx_e:1361624001939771413> <a:rflx_l:1361624056884887673> <a:rflx_c:1361624260434591855> <a:rflx_o:1361624335126626396> <a:rflx_m:1361624355771256956> <a:rflx_e:1361624001939771413> <a:BananaSkiee:1360541400382439475>
  
Welcome           : <@${member.id}>
To Server          : ${member.guild.name}
Total Members   : ${member.guild.memberCount}`,
  embeds: [testEmbed], 
  files: [attachment], 
  components: [row] 
});

        // Hapus pesan perintah !testwelcome agar channel bersih (opsional)
        if (message.deletable) {
            await message.delete().catch(console.error);
        }

    } catch (error) {
        console.error("ERROR SAAT TES WELCOME MANUAL:", error);
        message.reply('❌ Terjadi kesalahan saat membuat kartu tes.');
    }
    return; // Hentikan eksekusi setelah perintah ini selesai
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
    }
};
