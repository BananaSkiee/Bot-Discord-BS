const fs = require("fs");
const path = require("path");
const { ROLES, guildId } = require("../config");

const filePath = path.join(__dirname, "../data/taggedUsers.json");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const { member, customId, client } = interaction;
    if (!member || !member.user) return;

    const displayName = member.nickname || member.user.globalName || member.user.username;

    // Cek role tertinggi dari daftar ROLES
    const role = ROLES.find((r) => member.roles.cache.has(r.id));
    if (!role) {
      return interaction.reply({
        content: "❌ Kamu tidak memiliki role yang valid untuk tag nickname.",
        ephemeral: true,
      });
    }

    // Baca data taggedUsers.json
    let taggedUsers = {};
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf8");
        taggedUsers = JSON.parse(raw);
      } catch (e) {
        console.error("❌ Gagal membaca file taggedUsers.json:", e);
      }
    }

    // === USE TAG ===
    if (customId === "use_tag") {
      try {
        const newNick = `${role.tag} ${displayName}`;

        // Cek jika nickname sudah sama
        if (member.nickname === newNick) {
          return interaction.reply({
            content: "⚠️ Nickname kamu sudah menggunakan tag ini.",
            ephemeral: true,
          });
        }

        await member.setNickname(newNick);
        taggedUsers[member.id] = role.tag;

        fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));
        return interaction.reply({
          content: `✅ Nickname kamu telah diubah menjadi **${newNick}**`,
          ephemeral: true,
        });
      } catch (err) {
        console.error("❌ Error set nickname:", err);
        return interaction.reply({
          content: `❌ Gagal mengubah nickname: ${err.message}\nPastikan bot punya izin "Manage Nicknames" dan rolenya di atas member.`,
          ephemeral: true,
        });
      }
    }

    // === REMOVE TAG ===
    if (customId === "remove_tag") {
      try {
        await member.setNickname(null); // Kembali ke default
        delete taggedUsers[member.id];

        fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));
        return interaction.reply({
          content: "✅ Nickname kamu sudah dikembalikan seperti semula.",
          ephemeral: true,
        });
      } catch (err) {
        console.error("❌ Error hapus nickname:", err);
        return interaction.reply({
          content: `❌ Gagal menghapus tag: ${err.message}`,
          ephemeral: true,
        });
      }
    }
  },
};
