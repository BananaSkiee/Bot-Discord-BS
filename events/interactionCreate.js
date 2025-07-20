const fs = require("fs");
const path = require("path");
const {
  ROLE_DISPLAY_MAP,
  ROLES,
  guildId,
  ADMIN_ROLE_ID,
} = require("../config");

const filePath = path.join(__dirname, "../data/taggedUsers.json");

module.exports = async (interaction) => {
  if (!interaction.isButton()) return;

  const { customId, user, guild } = interaction;

  // Validasi guild dan member
  const member = guild?.members.cache.get(user.id);
  if (!member) return;

  // Handle tombol hapus tag
  if (customId === "remove_tag") {
    try {
      await member.setNickname(null);
      const data = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, "utf8"))
        : {};
      delete data[user.id];
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      await interaction.reply({
        content: "✅ Tag dihapus dari nickname kamu.",
        ephemeral: true,
      });
    } catch (err) {
      console.error("Gagal hapus tag:", err);
      await interaction.reply({
        content: "❌ Gagal menghapus tag. Pastikan bot punya izin mengubah nickname.",
        ephemeral: true,
      });
    }
    return;
  }

  // Handle tombol pakai tag
  if (customId === "use_tag") {
    try {
      const userRoles = member.roles.cache.map((r) => r.id);
      const found = ROLES.find((r) => userRoles.includes(r.id));
      if (!found) {
        return interaction.reply({
          content: "❌ Kamu tidak memiliki role untuk tag nickname.",
          ephemeral: true,
        });
      }

      const newName = `${found.tag} ${member.user.username}`.slice(0, 32);
      await member.setNickname(newName);

      const data = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, "utf8"))
        : {};
      data[user.id] = found.tag;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      await interaction.reply({
        content: `✅ Nickname kamu sekarang: \`${newName}\``,
        ephemeral: true,
      });
    } catch (err) {
      console.error("Gagal atur nickname:", err);
      await interaction.reply({
        content: "❌ Gagal menambahkan tag. Pastikan bot punya izin mengubah nickname.",
        ephemeral: true,
      });
    }
    return;
  }

  // Handle tombol admin untuk tes tag
  if (customId.startsWith("test_")) {
    const roleId = customId.split("_")[1];
    if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
      return interaction.reply({
        content: "❌ Kamu tidak punya izin untuk mengetes tombol ini.",
        ephemeral: true,
      });
    }

    const display = ROLE_DISPLAY_MAP[roleId];
    if (!display) {
      return interaction.reply({
        content: "❌ Role ID tidak ditemukan di config.",
        ephemeral: true,
      });
    }

    const newName = `${display} ${member.user.username}`.slice(0, 32);
    try {
      await member.setNickname(newName);
      await interaction.reply({
        content: `✅ Nickname tes: \`${newName}\``,
        ephemeral: true,
      });
    } catch (err) {
      console.error("Gagal set nickname test:", err);
      await interaction.reply({
        content: "❌ Gagal mengganti nickname saat tes.",
        ephemeral: true,
      });
    }
    return;
  }

  // Handle tombol ya_paketag_...
  if (customId.startsWith("ya_paketag_")) {
    const parts = customId.split("_");

    // Tambahkan validasi agar tidak error
    if (parts.length < 5) {
      return interaction.reply({
        content: "❌ Tombol tidak valid.",
        ephemeral: true,
      });
    }

    const roleId = parts[3];
    const safeTag = parts.slice(4).join("_");

    const matched = ROLES.find((r) => {
      return (
        r.id === roleId &&
        r.tag &&
        r.tag.replace(/[^\w-]/g, "").toLowerCase() === safeTag.toLowerCase()
      );
    });

    if (!matched) {
      return interaction.reply({
        content: "❌ Gagal mengenali tag dari tombol.",
        ephemeral: true,
      });
    }

    const newName = `${matched.tag} ${member.user.username}`.slice(0, 32);

    try {
      await member.setNickname(newName);
      const data = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, "utf8"))
        : {};
      data[user.id] = matched.tag;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      await interaction.reply({
        content: `✅ Nickname kamu sekarang: \`${newName}\``,
        ephemeral: true,
      });
    } catch (err) {
      console.error("Gagal set nickname:", err);
      await interaction.reply({
        content: "❌ Gagal mengubah nickname.",
        ephemeral: true,
      });
    }
    return;
  }
};
