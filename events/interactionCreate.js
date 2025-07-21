const { ButtonInteraction } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { ROLES, ROLE_DISPLAY_MAP } = require("../config");
const filePath = path.join(__dirname, "../data/taggedUsers.json");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const { customId, member, guild } = interaction;
    const username = member.user.globalName || member.user.username;

    // Tombol umum: YA (gunakan tag)
    if (customId.startsWith("use_tag_")) {
      const roleName = customId.split("use_tag_")[1].toUpperCase();
      const role = ROLES.find((r) => r.name === roleName);
      if (!role) return;

      try {
        await member.setNickname(`${role.tag} ${username}`);
      } catch (err) {
        console.error("❌ Gagal set nickname (use_tag):", err);
        return interaction.reply({
          content: "❌ Gagal mengubah nickname. Coba lagi nanti.",
          ephemeral: true,
        });
      }

      const taggedUsers = JSON.parse(fs.readFileSync(filePath, "utf8"));
      taggedUsers[member.id] = role.name;
      fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));

      return interaction.reply({
        content: `✅ Nickname kamu telah diubah menjadi: \`${role.tag} ${username}\``,
        ephemeral: true,
      });
    }

    // Tombol umum: TIDAK (hapus tag)
    if (customId === "remove_tag") {
      try {
        await member.setNickname(username);
      } catch (err) {
        console.error("❌ Gagal hapus nickname (remove_tag):", err);
        return interaction.reply({
          content: "❌ Gagal menghapus tag. Coba lagi nanti.",
          ephemeral: true,
        });
      }

      const taggedUsers = JSON.parse(fs.readFileSync(filePath, "utf8"));
      delete taggedUsers[member.id];
      fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));

      return interaction.reply({
        content: "✅ Tag telah dihapus dari nickname kamu.",
        ephemeral: true,
      });
    }

    // Tombol TEST: YA (gunakan tag)
    if (customId.startsWith("test_use_tag_")) {
      const roleName = customId.split("test_use_tag_")[1].toUpperCase();
      const role = ROLES.find((r) => r.name === roleName);
      if (!role) return;

      const realTag = role.tag || `[${role.name}]`;

      try {
        await member.setNickname(`${realTag} ${username}`);
      } catch (err) {
        console.error("❌ Gagal set nickname (test_use_tag):", err);
        return interaction.reply({
          content: "❌ Gagal mengubah nickname. Coba lagi nanti.",
          ephemeral: true,
        });
      }

      return interaction.reply({
        content: `✅ Nickname test: \`${realTag} ${username}\``,
        ephemeral: true,
      });
    }

    // Tombol TEST: TIDAK (hapus tag)
    if (customId === "test_remove_tag") {
      try {
        await member.setNickname(username);
      } catch (err) {
        console.error("❌ Gagal hapus nickname (test_remove_tag):", err);
        return interaction.reply({
          content: "❌ Gagal menghapus tag. Coba lagi nanti.",
          ephemeral: true,
        });
      }

      return interaction.reply({
        content: "✅ Nickname test dikembalikan.",
        ephemeral: true,
      });
    }
  },
};
