// events/interactionCreate.js
const fs = require("fs");
const path = require("path");
const { ROLES, guildId } = require("../config");

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
      return interaction.reply({ content: "❌ Server tidak ditemukan.", ephemeral: true });
    }

    let member;
    try {
      member = await guild.members.fetch(interaction.user.id);
    } catch (err) {
      console.error("❌ Gagal fetch member:", err);
      return interaction.reply({
        content: "❌ Gagal mengambil data member.",
        ephemeral: true,
      });
    }

    // REMOVE TAG
    if (customId === "remove_tag" || customId === "test_remove_tag") {
      try {
        await member.setNickname(null);
        taggedUsers[member.id] = false;
        saveTaggedUsers(taggedUsers);

        return interaction.reply({
          content: `✅ Nama kamu dikembalikan menjadi \`${username}\``,
          ephemeral: true,
        });
      } catch (err) {
        console.error("❌ Gagal hapus nickname:", err);
        return interaction.reply({
          content: "❌ Gagal menghapus tag.",
          ephemeral: true,
        });
      }
    }

    // USE TAG (use_tag / ya_pakai_tag)
    if (customId === "use_tag" || customId === "ya_pakai_tag") {
      const role = ROLES.find(r => member.roles.cache.has(r.id));
      if (!role) {
        return interaction.reply({
          content: "❌ Kamu tidak memiliki role yang cocok.",
          ephemeral: true,
        });
      }

      try {
        const newName = `${role.tag} ${username}`.slice(0, 32);
        await member.setNickname(newName);

        taggedUsers[member.id] = true;
        saveTaggedUsers(taggedUsers);

        return interaction.reply({
          content: `✅ Nama kamu sekarang: \`${newName}\``,
          ephemeral: true,
        });
      } catch (err) {
        console.error("❌ Gagal set nickname (use_tag):", err);
        return interaction.reply({
          content: "❌ Gagal mengatur nama.",
          ephemeral: true,
        });
      }
    }

    // TEST BUTTONS
    if (customId.startsWith("test_use_tag_") || customId.startsWith("test_remove_tag_")) {
      const parts = customId.split("_");
      const action = parts[1];
      const roleId = parts[3];
      const safeTag = parts.slice(4).join("_");

      const matched = ROLES.find(r =>
        r.id === roleId &&
        r.tag.replace(/[^\w-]/g, "").toLowerCase() === safeTag
      );

      if (!matched) {
        return interaction.reply({
          content: "❌ Tag tidak valid atau tidak ditemukan.",
          ephemeral: true,
        });
      }

      const realTag = matched.tag;

      if (action === "use") {
        try {
          const newName = `${realTag} ${username}`.slice(0, 32);
          await member.setNickname(newName);

          if (!member.roles.cache.has(matched.id)) {
            await member.roles.add(matched.id);
          }

          taggedUsers[member.id] = true;
          saveTaggedUsers(taggedUsers);

          return interaction.reply({
            content: `🧪 Nickname kamu sekarang: \`${newName}\``,
            ephemeral: true,
          });
        } catch (err) {
          console.error("❌ Gagal set nickname / role test:", err);
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
          console.error("❌ Gagal reset nickname test:", err);
          return interaction.reply({
            content: "❌ Gagal menghapus nickname/tag.",
            ephemeral: true,
          });
        }
      }
    }

    // UNKNOWN BUTTON
    return interaction.reply({
      content: "⚠️ Tombol tidak dikenali.",
      ephemeral: true,
    }).catch(err => {
      console.error("❌ Gagal kirim fallback:", err);
    });
  },
};
