const fs = require("fs");
const path = require("path");
const { ROLES, guildId } = require("../config");

const filePath = path.join(__dirname, "../data/taggedUsers.json");

function saveTaggedUsers(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const username = interaction.user.globalName ?? interaction.user.username;
    const guild = interaction.client.guilds.cache.get(guildId);
    if (!guild) return;

    const member = await guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        content: "❌ Gagal ambil datamu dari server.",
        ephemeral: true,
      }).catch(console.error);
    }

    let taggedUsers = {};
    try {
      taggedUsers = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      taggedUsers = {};
    }

    // ========== TOMBOL ❌ UMUM ==========
    if (interaction.customId === "remove_tag") {
      await member.setNickname(null).catch(console.error);
      taggedUsers[member.id] = false;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: "✅ Nama kamu dikembalikan ke semula.",
        ephemeral: true,
      }).catch(console.error);
    }

    // ========== TOMBOL ✅ UMUM ==========
    if (interaction.customId === "use_tag") {
      const role = ROLES.find(r => member.roles.cache.has(r.id));
      if (!role) {
        return interaction.reply({
          content: "❌ Kamu tidak punya role yang cocok untuk tag ini.",
          ephemeral: true,
        }).catch(console.error);
      }

      await member.setNickname(`${role.tag} ${username}`).catch(console.error);

      taggedUsers[member.id] = true;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: `✅ Nama kamu sekarang: \`${role.tag} ${username}\``,
        ephemeral: true,
      }).catch(console.error);
    }

    // ========== TOMBOL TEST ✅ ==========
    if (interaction.customId.startsWith("test_use_tag_")) {
      const tagId = interaction.customId.replace("test_use_tag_", "");

      const matched = ROLES.find(r =>
        r.tag.replace(/[^\w-]/g, "").toLowerCase() === tagId
      );

      if (!matched) {
        return interaction.reply({
          content: "❌ Tag tidak ditemukan atau tidak valid.",
          ephemeral: true,
        }).catch(console.error);
      }

      const realTag = matched.tag;

      // Set nickname
      await member.setNickname(`${realTag} ${username}`).catch(console.error);

      // Tambahkan role jika belum ada
      if (!member.roles.cache.has(matched.id)) {
        await member.roles.add(matched.id).catch(console.error);
      }

      taggedUsers[member.id] = true;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: `🧪 Nickname kamu sekarang: \`${realTag} ${username}\`\n🆗 Role diberikan juga.`,
        ephemeral: true,
      }).catch(console.error);
    }

    // ========== TOMBOL TEST ❌ ==========
    if (interaction.customId.startsWith("test_remove_tag_")) {
      const tagId = interaction.customId.replace("test_remove_tag_", "");

      const matched = ROLES.find(r =>
        r.tag.replace(/[^\w-]/g, "").toLowerCase() === tagId
      );

      await member.setNickname(null).catch(console.error);

      // Role TIDAK DIHAPUS! Sesuai permintaan.
      // Jadi block ini gak usah remove role!

      taggedUsers[member.id] = false;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: "🧪 Nickname kamu dikembalikan ke semula. Role tetap aman.",
        ephemeral: true,
      }).catch(console.error);
    }

    // ========== UNKNOWN ==========
    return interaction.reply({
      content: "⚠️ Tombol tidak dikenali.",
      ephemeral: true,
    }).catch(console.error);
  },
};
