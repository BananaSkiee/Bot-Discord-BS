// File: events/interactionCreate.js

const fs = require("fs"); const path = require("path"); const { ButtonInteraction } = require("discord.js"); const ROLES = require("../config/roles"); const filePath = path.join(__dirname, "../data/taggedUsers.json");

// Pastikan file JSON ada if (!fs.existsSync(filePath)) { fs.writeFileSync(filePath, JSON.stringify({})); }

module.exports = { name: "interactionCreate", async execute(interaction) { if (!interaction.isButton()) return;

const { customId, user, guild } = interaction;
const member = guild.members.cache.get(user.id);
if (!member) return interaction.reply({ content: "❌ Gagal menemukan member.", ephemeral: true });

const taggedData = JSON.parse(fs.readFileSync(filePath, "utf8"));

const userId = user.id;
const originalName = member.displayName.replace(/^[^]+\]\s?/, "").trim();

if (customId === "add_tag") {
  const highestRole = ROLES.find((r) => member.roles.cache.has(r.id));
  if (!highestRole) return interaction.reply({ content: "❌ Tidak ditemukan role khusus.", ephemeral: true });

  const newName = `${highestRole.tag} ${originalName}`;
  await member.setNickname(newName).catch(() => {});

  taggedData[userId] = true;
  fs.writeFileSync(filePath, JSON.stringify(taggedData, null, 2));

  await interaction.reply({ content: `✅ Nickname kamu diubah menjadi **${newName}**`, ephemeral: true });

} else if (customId === "remove_tag") {
  await member.setNickname(originalName).catch(() => {});

  delete taggedData[userId];
  fs.writeFileSync(filePath, JSON.stringify(taggedData, null, 2));

  await interaction.reply({ content: `🗑️ Tag dihapus. Nama kamu kembali ke **${originalName}**`, ephemeral: true });
}

} };

