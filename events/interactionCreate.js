const fs = require("fs");
const path = require("path");
const { ROLES, guildId } = require("../config");

const filePath = path.join(__dirname, "../data/taggedUsers.json");

// Load tagged user data
function loadTaggedUsers() {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

// Save tagged user data
function saveTaggedUsers(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    if (!interaction.isButton()) return;

    const member = interaction.member;
    if (!member) return;

    const username = member.user.globalName || member.user.username;
    const taggedUsers = loadTaggedUsers();

    // === Handle tombol Pakai Tag ===
    if (interaction.customId.startsWith("test_use_tag_")) {
      const tagId = interaction.customId.replace("test_use_tag_", "");

      const matched = ROLES.find((r) =>
        r.tag.replace(/[^\w-]/g, "").toLowerCase() === tagId
      );

      if (!matched) {
        return interaction.reply({
          content: "❌ Tag tidak ditemukan atau tidak valid.",
          ephemeral: true,
        });
      }

      const realTag = matched.tag;
      await member.setNickname(`${realTag} ${username}`).catch(console.error);

      taggedUsers[member.id] = true;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: `🧪 Nickname kamu sekarang : \`${realTag} ${username}\``,
        ephemeral: true,
      });
    }

    // === Handle tombol Hapus Tag ===
    if (interaction.customId.startsWith("test_remove_tag_")) {
      await member.setNickname(null).catch(console.error);

      taggedUsers[member.id] = false;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: "🧪 Nickname kamu dikembalikan ke semula.",
        ephemeral: true,
      });
    }

    // === Tombol lain (fallback) ===
    return interaction.reply({
      content: "⚠️ Tombol tidak dikenali.",
      ephemeral: true,
    });
  },
};
