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

      // Baca file JSON
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath);
        taggedUsers = JSON.parse(fileData);
      }

      // Tombol tambah tag
      if (interaction.customId === "tag_nickname") {
        const highestRole = ROLES.find(role =>
          member.roles.cache.has(role.id)
        );

        if (!highestRole) {
          await interaction.reply({
            content: "❌ Kamu tidak memiliki role yang valid.",
            ephemeral: true,
          });
          return;
        }

        const tag = highestRole.tag;

        // Cek jika sebelumnya sudah pernah ditag
        const currentTagData = taggedUsers[member.id];

        // Ambil nama asli dari JSON atau pakai username
        const baseName = currentTagData?.originalName || member.user.username;

        const newNickname = `${tag} ${baseName}`;
        if (newNickname.length > 32) {
          await interaction.reply({
            content: `❌ Nickname terlalu panjang (maks 32 karakter): **${newNickname}**`,
            ephemeral: true,
          });
          return;
        }

        await member.setNickname(newNickname).catch(() => null);

        taggedUsers[member.id] = {
          tag,
          originalName: baseName,
        };

        fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));

        await interaction.reply({
          content: `✅ Nickname kamu telah diubah menjadi **${newNickname}**`,
          ephemeral: true,
        });
        return;
      }

      // Tombol hapus tag
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
      try {
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
      } catch (err) {
        console.error("❌ Gagal mengirim error ke user:", err);
      }
    }
  },
};
