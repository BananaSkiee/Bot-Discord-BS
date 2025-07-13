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

    // === Handle tombol asli ===
    const role = ROLES.find((r) => member.roles.cache.has(r.id));
    if (interaction.customId === "use_tag" && role) {
      await member.setNickname(`${role.tag} ${username}`).catch(console.error);
      taggedUsers[member.id] = true;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: `✅ Nama kamu sekarang: \`${role.tag} ${username}\``,
        ephemeral: true,
      }).catch(console.error);
    }

    if (interaction.customId === "remove_tag") {
      await member.setNickname(null).catch(console.error);
      taggedUsers[member.id] = false;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: "✅ Nama kamu dikembalikan ke semula.",
        ephemeral: true,
      }).catch(console.error);
    }

    // === Handle tombol TEST (✅ Pakai Tag) ===
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
      await member.setNickname(`${realTag} ${username}`).catch(console.error);

      taggedUsers[member.id] = true;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: `🧪 Nickname kamu sekarang : \`${realTag} ${username}\``,
        ephemeral: true,
      }).catch(console.error);
    }

    // === Handle tombol TEST (❌ Hapus Tag) ===
    if (interaction.customId.startsWith("test_remove_tag_")) {
      await member.setNickname(null).catch(console.error);

      taggedUsers[member.id] = false;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: "🧪 Nickname kamu dikembalikan ke semula.",
        ephemeral: true,
      }).catch(console.error);
    }

    // Fallback kalau tombol tidak dikenal
    return interaction.reply({
      content: "⚠️ Tombol tidak dikenali.",
      ephemeral: true,
    }).catch(console.error);
  },
};
