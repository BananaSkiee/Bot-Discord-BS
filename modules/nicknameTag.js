const fs = require("fs");
const path = require("path");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const filePath = path.join(__dirname, "../data/taggedUsers.json");

// List role prioritas
const ROLES = [
  { id: process.env.ROLE_1_ID, tag: '[OWNER]' },
  { id: process.env.ROLE_2_ID, tag: '[ADMIN]' },
  { id: process.env.ROLE_3_ID, tag: '[MOD]' },
  { id: process.env.ROLE_4_ID, tag: '[BOOST]' },
  { id: process.env.ROLE_5_ID, tag: '[CREATOR]' },
  { id: process.env.ROLE_6_ID, tag: '[ALUMNI]' },
  { id: process.env.ROLE_7_ID, tag: '[100]' },
  { id: process.env.ROLE_8_ID, tag: '[80]' },
  { id: process.env.ROLE_9_ID, tag: '[70]' },
  { id: process.env.ROLE_10_ID, tag: '[60]' },
  { id: process.env.ROLE_11_ID, tag: '[55]' },
  { id: process.env.ROLE_12_ID, tag: '[VIP]' },
  { id: process.env.ROLE_13_ID, tag: '[FRIEND]' },
  { id: process.env.ROLE_14_ID, tag: '[PARTNER]' },
  { id: process.env.ROLE_15_ID, tag: '[MEM]' },
];

module.exports = async (client) => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const member = await guild.members.fetch("1346964077309595658"); // 👈 hanya kamu

  if (!member || member.user.bot) return;

  let taggedUsers = {};
  const fileExists = fs.existsSync(filePath);
  if (fileExists) {
    taggedUsers = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  if (taggedUsers[member.id] !== undefined) return;

  const role = ROLES.find(r => member.roles.cache.has(r.id));
  if (!role) return;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("use_tag")
      .setLabel(`Ya, pakai tag ${role.tag}`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("remove_tag")
      .setLabel("Tidak, tanpa tag")
      .setStyle(ButtonStyle.Secondary)
  );

  try {
    await member.send({
      content: `👋 Hai **${member.user.username}**, kamu punya role khusus **${role.tag}** di server **BananaSkiee Community**.\n\nMau pakai tag itu di nickname kamu?\nContoh: \`${role.tag} ${member.user.username}\``,
      components: [row],
    });

    taggedUsers[member.id] = null;
    fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));
    console.log("✅ DM terkirim ke kamu (test)");
  } catch (err) {
    console.error(`❌ Gagal DM kamu: ${err.message}`);
  }
};
