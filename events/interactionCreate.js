const {
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const { ROLES, ROLE_DISPLAY_MAP } = require("../config");

const filePath = path.join(__dirname, "../data/taggedUsers.json");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    try {
      if (!interaction.isButton()) return;

      const member = await interaction.guild.members.fetch(interaction.user.id);
      let taggedUsers = {};

      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath);
        taggedUsers = JSON.parse(fileData);
      }

      if (interaction.customId === "tag_nickname") {
        const highestRole = ROLES.find(role =>
          member.roles.cache.has(role.id)
        );

        if (!highestRole) {
          await interaction.reply({ content: "❌ Kamu tidak memiliki role yang valid.", ephemeral: true });
          return;
        }

        const tag = highestRole.tag;
        const originalName = member.nickname || member.user.username;
        const newNickname = originalName.startsWith(tag)
          ? originalName
          : `${tag} ${originalName}`;

        await member.setNickname(newNickname).catch(() => null);

        taggedUsers[member.id] = {
          tag,
          originalName,
        };

        fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));

        await interaction.reply({
          content: `✅ Nickname kamu telah diubah menjadi **${newNickname}**`,
          ephemeral: true,
        });
        return;
      }

      if (interaction.customId === "remove_tag") {
        const userTagData = taggedUsers[member.id];

        if (!userTagData) {
          await interaction.reply({
            content: "❌ Kamu belum memiliki tag yang aktif.",
            ephemeral: true,
          });
          return;
        }

        await member.setNickname(userTagData.originalName).catch(() => null);

        delete taggedUsers[member.id];
        fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));

        await interaction.reply({
          content: `✅ Tag nickname telah dihapus. Nama kamu sekarang: **${userTagData.originalName}**`,
          ephemeral: true,
        });
        return;
      }
    } catch (error) {
      console.error("❌ Error di interactionCreate:", error);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: "❌ Terjadi error saat menjalankan perintah.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "❌ Terjadi error saat menjalankan perintah.",
          ephemeral: true,
        });
      }
    }
  },
};
