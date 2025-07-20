// events/interactionCreate.js
const fs = require("fs");
const path = require("path");
const { ROLES, guildId } = require("../config");

const filePath = path.join(__dirname, "../data/taggedUsers.json");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const { member, customId, client } = interaction;
    const displayName = member.user.globalName || member.displayName;

    // Ambil role tertinggi dari list ROLES
    const role = ROLES.find((r) => member.roles.cache.has(r.id));
    if (!role) {
      return interaction.reply({ content: "❌ Role tidak ditemukan.", ephemeral: true });
    }

    // Update file tag
    let taggedUsers = {};
    if (fs.existsSync(filePath)) {
      taggedUsers = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    // Handle tombol tag
    if (customId === "use_tag") {
      try {
        const newNick = `${role.tag} ${displayName}`;
        await member.setNickname(newNick);
        taggedUsers[member.id] = role.tag;
        fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));

        await interaction.reply({
          content: `✅ Nickname kamu sudah diubah menjadi **${newNick}**`,
          ephemeral: true,
        });
      } catch (err) {
        await interaction.reply({
          content: `❌ Gagal mengubah nickname: ${err.message}`,
          ephemeral: true,
        });
      }
    }

    if (customId === "remove_tag") {
      try {
        await member.setNickname(null); // Hapus nickname (kembali ke default)
        taggedUsers[member.id] = null;
        fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));

        await interaction.reply({
          content: "✅ Nickname kamu dikembalikan seperti semula tanpa tag.",
          ephemeral: true,
        });
      } catch (err) {
        await interaction.reply({
          content: `❌ Gagal menghapus tag: ${err.message}`,
          ephemeral: true,
        });
      }
    }
  },
};
