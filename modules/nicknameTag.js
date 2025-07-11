const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

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

const notifiedUsers = new Map(); // <userId, lastTag>

module.exports = async function handleNickname(client) {
  client.guilds.cache.forEach(async (guild) => {
    await guild.members.fetch(); // ambil semua member

    guild.members.cache.forEach(async (member) => {
      if (member.user.bot) return;

      const userRoles = member.roles.cache;
      const matching = ROLES.find(role => userRoles.has(role.id));
      if (!matching) return;

      const current = notifiedUsers.get(member.id);
      if (current === matching.tag) return; // Sudah pernah DM dengan tag ini

      // Kirim DM tanya mau ganti nickname
      try {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("set_tag").setLabel("✅ Pakai Tag").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("remove_tag").setLabel("❌ Hapus Tag").setStyle(ButtonStyle.Danger)
        );

        await member.send({
          content: `👋 Hai ${member.user.username}, kamu punya role khusus di server **${guild.name}**.\nIngin mengubah nickname kamu menjadi **${matching.tag} ${member.user.username}**?`,
          components: [row],
        });

        notifiedUsers.set(member.id, matching.tag);
      } catch (err) {
        console.warn(`⚠️ Tidak bisa kirim DM ke ${member.user.tag}`);
      }
    });
  });

  // Handle tombol interaksi
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member) return;

    const tag = notifiedUsers.get(member.id) || "";

    if (interaction.customId === "set_tag") {
      const newNick = `${tag} ${interaction.user.username}`;
      try {
        await member.setNickname(newNick);
        await interaction.reply({ content: `✅ Nickname kamu telah diubah jadi **${newNick}**`, ephemeral: true });
      } catch {
        await interaction.reply({ content: "❌ Gagal mengubah nickname.", ephemeral: true });
      }
    }

    if (interaction.customId === "remove_tag") {
      try {
        await member.setNickname(null);
        notifiedUsers.delete(member.id); // Supaya bisa ditanya lagi nanti
        await interaction.reply({ content: `✅ Nickname kamu sudah dikembalikan ke semula.`, ephemeral: true });
      } catch {
        await interaction.reply({ content: "❌ Gagal menghapus tag nickname.", ephemeral: true });
      }
    }
  });
};
