const fs = require("fs");
const path = require("path");
const { ROLES, guildId } = require("../config");

const filePath = path.join(__dirname, "../data/taggedUsers.json");
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}));

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

    const id = interaction.customId;

    // ===== UMUM: REMOVE TAG =====
    if (id === "remove_tag") {
      await member.setNickname(null).catch(console.error);
      taggedUsers[member.id] = false;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: "✅ Nama kamu dikembalikan ke semula.",
        ephemeral: true,
      }).catch(console.error);
    }

    // ===== UMUM: USE TAG DARI ROLE =====
    if (id === "use_tag") {
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

    // ===== TEST MODE: test_use_tag_ / test_remove_tag_ =====
    if (id.startsWith("test_use_tag_") || id.startsWith("test_remove_tag_")) {
      const isUse = id.startsWith("test_use_tag_");
      const parts = id.split("_");
      const roleId = parts[3];
      const tagId = parts.slice(4).join("_"); // support tag ada "_"

      const matched = ROLES.find(r =>
        r.id === roleId && r.tag.replace(/[^\w-]/g, "").toLowerCase() === tagId
      );

      if (!matched) {
        return interaction.reply({
          content: "❌ Tag tidak ditemukan atau tidak valid.",
          ephemeral: true,
        }).catch(console.error);
      }

      const realTag = matched.tag;

      if (isUse) {
        await member.setNickname(`${realTag} ${username}`).catch(console.error);

        if (!member.roles.cache.has(matched.id)) {
          await member.roles.add(matched.id).catch(console.error);
        }

        taggedUsers[member.id] = true;
        saveTaggedUsers(taggedUsers);

        return interaction.reply({
          content: `🧪 Nickname kamu sekarang: \`${realTag} ${username}\`\n🆗 Role diberikan juga.`,
          ephemeral: true,
        }).catch(console.error);
      } else {
        await member.setNickname(null).catch(console.error);
        taggedUsers[member.id] = false;
        saveTaggedUsers(taggedUsers);

        return interaction.reply({
          content: "🧪 Nickname kamu dikembalikan ke semula. Role tetap aman.",
          ephemeral: true,
        }).catch(console.error);
      }
    }

    // ===== TOMBOL TIDAK DIKENALI =====
    return interaction.reply({
      content: "⚠️ Tombol tidak dikenali.",
      ephemeral: true,
    }).catch(console.error);
  },
};
