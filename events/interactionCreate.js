// events/interactionCreate.js
const fs = require("fs");
const path = require("path");
const { ROLES, ROLE_DISPLAY_MAP, guildId } = require("../config");

const filePath = path.join(__dirname, "../data/taggedUsers.json");

function saveTaggedUsers(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Gagal menyimpan taggedUsers.json:", err);
  }
}

function loadTaggedUsers() {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const { customId } = interaction;
    const username = interaction.user.globalName ?? interaction.user.username;
    const taggedUsers = loadTaggedUsers();

    const guild = interaction.client.guilds.cache.get(guildId);
    if (!guild) {
      console.error("❌ Guild tidak ditemukan.");
      return interaction.reply({ content: "❌ Server tidak ditemukan.", ephemeral: true }).catch(() => {});
    }

    let member;
    try {
      member = await guild.members.fetch(interaction.user.id);
    } catch (err) {
      console.error("❌ Gagal fetch member:", err);
      return interaction.reply({
        content: "❌ Gagal mengambil data member.",
        ephemeral: true,
      }).catch(() => {});
    }

    // ===== REMOVE TAG =====
    if (customId === "remove_tag" || customId === "test_remove_tag") {
      try {
        await member.setNickname(null).catch(() => {});
        taggedUsers[member.id] = false;
        saveTaggedUsers(taggedUsers);

        return interaction.reply({
          content: `✅ Nama kamu dikembalikan menjadi \`${username}\``,
          ephemeral: true,
        }).catch(() => {});
      } catch (err) {
        console.error("❌ Gagal menghapus tag:", err);
        return interaction.reply({
          content: "❌ Gagal menghapus tag.",
          ephemeral: true,
        }).catch(() => {});
      }
    }

    // ===== APPLY TAG (use_tag / ya_pakai_tag) =====
    if (customId === "use_tag" || customId === "ya_pakai_tag") {
      const role = ROLES.find(r => member.roles.cache.has(r.id));
      if (!role) {
        return interaction.reply({
          content: "❌ Kamu tidak memiliki role yang cocok.",
          ephemeral: true,
        }).catch(() => {});
      }

      try {
        const newName = `${role.tag} ${username}`.slice(0, 32);
        await member.setNickname(newName).catch(() => {});
        taggedUsers[member.id] = true;
        saveTaggedUsers(taggedUsers);

        return interaction.reply({
          content: `✅ Nama kamu sekarang: \`${newName}\``,
          ephemeral: true,
        }).catch(() => {});
      } catch (err) {
        console.error("❌ Gagal set nickname:", err);
        return interaction.reply({
          content: "❌ Gagal mengatur nama.",
          ephemeral: true,
        }).catch(() => {});
      }
    }

    // ===== TEST BUTTONS (test_use_tag_ & test_remove_tag_) =====
    if (customId.startsWith("test_use_tag_") || customId.startsWith("test_remove_tag_")) {
      const parts = customId.split("_");
      const action = parts[1];
      const roleId = parts[3];
      const safeTag = parts.slice(4).join("_");

      const matched = ROLES.find(r =>
        r.id === roleId && r.tag.replace(/[^\w-]/g, "").toLowerCase() === safeTag
      );

      if (!matched) {
        return interaction.reply({
          content: "❌ Tag tidak valid atau tidak ditemukan.",
          ephemeral: true,
        }).catch(() => {});
      }

      const realTag = matched.tag;

      if (action === "use") {
        try {
          const newName = `${realTag} ${username}`.slice(0, 32);
          await member.setNickname(newName).catch(() => {});

          if (!member.roles.cache.has(matched.id)) {
            await member.roles.add(matched.id).catch(() => {});
          }

          taggedUsers[member.id] = true;
          saveTaggedUsers(taggedUsers);

          return interaction.reply({
            content: `🧪 Nickname kamu sekarang: \`${newName}\``,
            ephemeral: true,
          }).catch(() => {});
        } catch (err) {
          console.error("❌ Gagal set nickname test:", err);
          return interaction.reply({
            content: "❌ Gagal mengubah nickname/tag.",
            ephemeral: true,
          }).catch(() => {});
        }
      }

      if (action === "remove") {
        try {
          await member.setNickname(null).catch(() => {});
          taggedUsers[member.id] = false;
          saveTaggedUsers(taggedUsers);

          return interaction.reply({
            content: `🧪 Nickname kamu dikembalikan menjadi \`${username}\``,
            ephemeral: true,
          }).catch(() => {});
        } catch (err) {
          console.error("❌ Gagal reset nickname test:", err);
          return interaction.reply({
            content: "❌ Gagal menghapus nickname/tag.",
            ephemeral: true,
          }).catch(() => {});
        }
      }
    }

    // ===== DEFAULT: UNKNOWN BUTTON =====
    return interaction.reply({
      content: "⚠️ Tombol tidak dikenali.",
      ephemeral: true,
    }).catch(err => {
      console.error("❌ Gagal mengirim fallback unknown interaction:", err);
    });
  },
};
