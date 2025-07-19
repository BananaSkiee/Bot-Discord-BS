// events/interactionCreate.js
const fs = require("fs");
const path = require("path");
const { ROLES, guildId } = require("../config");

const filePath = path.join(__dirname, "../data/taggedUsers.json");

function saveTaggedUsers(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Gagal menyimpan taggedUsers.json:", err);
  }
}

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const username = interaction.user.globalName ?? interaction.user.username;
    const guild = interaction.client.guilds.cache.get(guildId);
    if (!guild) return;

    let member;
    try {
      member = await guild.members.fetch(interaction.user.id);
    } catch (err) {
      console.error("Gagal fetch member:", err);
      return interaction.reply({
        content: "❌ Gagal mengambil data member dari server.",
        ephemeral: true,
      });
    }

    let taggedUsers = {};
    try {
      taggedUsers = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (err) {
      console.warn("Gagal baca file taggedUsers.json. Menggunakan data kosong.");
      taggedUsers = {};
    }

    // ===== REMOVE TAG =====
    if (interaction.customId === "remove_tag") {
      try {
        await member.setNickname(null);
        taggedUsers[member.id] = false;
        saveTaggedUsers(taggedUsers);
        return interaction.reply({
          content: `✅ Nama kamu dikembalikan menjadi \`${username}\``,
          ephemeral: true,
        });
      } catch (err) {
        console.error("Gagal remove tag:", err);
        return interaction.reply({
          content: "❌ Gagal menghapus tag.",
          ephemeral: true,
        });
      }
    }

    // ===== USE TAG =====
    if (interaction.customId === "use_tag") {
      const role = ROLES.find(r => member.roles.cache.has(r.id));
      if (!role) {
        return interaction.reply({
          content: "❌ Kamu tidak punya role yang cocok untuk tag ini.",
          ephemeral: true,
        });
      }

      try {
        await member.setNickname(`${role.tag} ${username}`);
        taggedUsers[member.id] = true;
        saveTaggedUsers(taggedUsers);
        return interaction.reply({
          content: `✅ Nama kamu sekarang: \`${role.tag} ${username}\``,
          ephemeral: true,
        });
      } catch (err) {
        console.error("Gagal apply tag:", err);
        return interaction.reply({
          content: "❌ Gagal menambahkan tag.",
          ephemeral: true,
        });
      }
    }

    // ===== TEST BUTTON =====
    if (
      interaction.customId.startsWith("test_use_tag_") ||
      interaction.customId.startsWith("test_remove_tag_")
    ) {
      const parts = interaction.customId.split("_");
      const action = parts[1];
      const roleId = parts[3];
      const safeTagId = parts.slice(4).join("_");

      const matched = ROLES.find(
        r => r.id === roleId && r.tag.replace(/[^\w-]/g, "").toLowerCase() === safeTagId
      );

      if (!matched) {
        return interaction.reply({
          content: "❌ Tag tidak ditemukan atau tidak valid.",
          ephemeral: true,
        });
      }

      const realTag = matched.tag;

      if (action === "use") {
        try {
          await member.setNickname(`${realTag} ${username}`);
          if (!member.roles.cache.has(matched.id)) {
            await member.roles.add(matched.id);
          }
          taggedUsers[member.id] = true;
          saveTaggedUsers(taggedUsers);
          return interaction.reply({
            content: `🧪 Nickname kamu sekarang: \`${realTag} ${username}\``,
            ephemeral: true,
          });
        } catch (err) {
          console.error("Gagal saat 'test_use_tag':", err);
          return interaction.reply({
            content: "❌ Gagal mengubah nickname/tag.",
            ephemeral: true,
          });
        }
      }

      if (action === "remove") {
        try {
          await member.setNickname(null);
          taggedUsers[member.id] = false;
          saveTaggedUsers(taggedUsers);
          return interaction.reply({
            content: `🧪 Nickname kamu dikembalikan menjadi \`${username}\``,
            ephemeral: true,
          });
        } catch (err) {
          console.error("Gagal saat 'test_remove_tag':", err);
          return interaction.reply({
            content: "❌ Gagal menghapus nickname/tag.",
            ephemeral: true,
          });
        }
      }
    }

    // ===== UNKNOWN BUTTON =====
    return interaction.reply({
      content: "⚠️ Tombol tidak dikenali.",
      ephemeral: true,
    }).catch(err => {
      console.error("Gagal mengirim pesan unknown interaction:", err);
    });
  },
};
