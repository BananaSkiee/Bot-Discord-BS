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

    const highestRole = ROLES.find((r) => member.roles.cache.has(r.id));
    const userRole = ROLES.find((r) => member.roles.cache.has(r.id)) || ROLES.find((r) => r.id); // fallback

    // === ✅ Pakai Tag ===
    if (interaction.customId === "use_tag" && userRole) {
      await member.setNickname(`${userRole.tag} ${username}`).catch(console.error);
      await member.roles.add(userRole.id).catch(console.error);
      taggedUsers[member.id] = true;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: `✅ Nama kamu sekarang: \`${userRole.tag} ${username}\`\n🎉 Role juga sudah diberikan.`,
        ephemeral: true,
      }).catch(console.error);
    }

    // === ❌ Hapus Tag (TETAP DAPAT ROLE) ===
    if (interaction.customId === "remove_tag" && userRole) {
      await member.setNickname(null).catch(console.error);
      await member.roles.add(userRole.id).catch(console.error); // tetap dikasih role
      taggedUsers[member.id] = false;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: `✅ Nama kamu dikembalikan ke semula.\n🎉 Tapi kamu tetap mendapatkan role: \`${userRole.tag}\``,
        ephemeral: true,
      }).catch(console.error);
    }

    // === 🧪 TEST - Pakai Tag ===
    if (interaction.customId.startsWith("test_use_tag_")) {
      const tag = interaction.customId.replace("test_use_tag_", "");
      await member.setNickname(`${tag} ${username}`).catch(console.error);

      return interaction.reply({
        content: `🧪 Nickname kamu sekarang : \`${tag} ${username}\`\n🎉 Role juga sudah diberikan.`,
        ephemeral: true,
      }).catch(console.error);
    }

    // === 🧪 TEST - Hapus Tag ===
    if (interaction.customId.startsWith("test_remove_tag_")) {
      await member.setNickname(null).catch(console.error);

      return interaction.reply({
        content: "🧪 Nickname kamu dikembalikan ke semula.\n🎉 Tapi kamu tetap mendapatkan role: \`${userRole.tag}\`",
        ephemeral: true,
      }).catch(console.error);
    }

    // Fallback
    return interaction.reply({
      content: "⚠️ Tombol tidak dikenali.",
      ephemeral: true,
    }).catch(console.error);
  },
};
