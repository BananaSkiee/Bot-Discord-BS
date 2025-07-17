// events/interactionCreate.js
const fs = require("fs");
const path = require("path");
const { ROLES, guildId } = require("../config");
const handleTicketInteraction = require("../modules/ticketSystem");
const handleTicketButtons = require("../modules/ticketButtons");
const handleAstroButton = require('../Astro/buttonHandler.js');

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

    // ========== OPEN TICKET ==========
    if (interaction.customId === "open_ticket") {
      return handleTicketInteraction(interaction);
    }

    // ========== TICKET BUTTON HANDLER ==========
    const ticketCustomIds = [
  "close_ticket",
  "confirm_close_ticket",
  "cancel_close_ticket",
  "reopen_ticket",
  "delete_ticket",
  "save_transcript"
];

if (ticketCustomIds.includes(interaction.customId)) {
  return handleTicketButtons(interaction);
}

    // ========== REMOVE TAG ==========
    if (interaction.customId === "remove_tag") {
      await member.setNickname(null).catch(console.error);
      taggedUsers[member.id] = false;
      saveTaggedUsers(taggedUsers);
      return interaction.reply({
        content: `✅ Nama kamu dikembalikan menjadi \`${username}\``,
        ephemeral: true,
      }).catch(console.error);
    }

    // ========== USE TAG ==========
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

    // ========== TEST BUTTON ==========
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
        }).catch(console.error);
      }

      const realTag = matched.tag;
      if (action === "use") {
        await member.setNickname(`${realTag} ${username}`).catch(console.error);
        if (!member.roles.cache.has(matched.id)) {
          await member.roles.add(matched.id).catch(console.error);
        }
        taggedUsers[member.id] = true;
        saveTaggedUsers(taggedUsers);
        return interaction.reply({
          content: `🧪 Nickname kamu sekarang: \`${realTag} ${username}\``,
          ephemeral: true,
        }).catch(console.error);
      }

      if (action === "remove") {
        await member.setNickname(null).catch(console.error);
        taggedUsers[member.id] = false;
        saveTaggedUsers(taggedUsers);
        return interaction.reply({
          content: `🧪 Nickname kamu dikembalikan menjadi \`${username}\``,
          ephemeral: true,
        }).catch(console.error);
      }
    }

    // ========== ASTRO VC BUTTONS ==========
try {
  const astroResult = await handleAstroButtons(interaction.client, interaction);
  if (astroResult === true) return;
} catch (err) {
  console.error("❌ Error handleAstroButtons:", err);
}

    // ========== UNKNOWN ==========
    return interaction.reply({
      content: "⚠️ Tombol tidak dikenali.",
      ephemeral: true,
    }).catch(console.error);
  }
};
