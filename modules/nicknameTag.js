const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
require("dotenv").config();

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

const used = new Set();

module.exports = async (client) => {
  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    if (newMember.user.bot || used.has(newMember.id)) return;

    const role = ROLES.find(r => newMember.roles.cache.has(r.id));
    if (!role) return;

    used.add(newMember.id);

    try {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("use_tag")
          .setLabel("✅ Gunakan Tag")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("remove_tag")
          .setLabel("❌ Hapus Tag")
          .setStyle(ButtonStyle.Danger)
      );

      const embed = new EmbedBuilder()
        .setTitle("🔔 Notifikasi Role Khusus")
        .setDescription(`Hai **${newMember.user.username}**, kamu punya role khusus di server **${newMember.guild.name}**.\n\nIngin pakai tag \`${role.tag}\` di nickname kamu?`)
        .setColor("Blue");

      await newMember.send({
        embeds: [embed],
        components: [row]
      });
    } catch (err) {
      console.log("❌ Gagal kirim DM:", err.message);
    }

    setTimeout(() => used.delete(newMember.id), 30000); // reset 30 detik
  });
};
