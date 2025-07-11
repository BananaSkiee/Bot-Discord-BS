const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config");

module.exports = async function setupSlashCommands(client) {
  const commands = [];
  client.commands = new Map();

  const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith("Command.js"));

  for (const file of commandFiles) {
    const command = require(`./${file}`);
    if (command.data && command.execute) {
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
    }
  }

  const rest = new REST({ version: "10" }).setToken(config.token);

  try {
    console.log("🚀 Uploading slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, config.guildId),
      { body: commands }
    );
    console.log("✅ Slash command berhasil diupload!");
  } catch (error) {
    console.error("❌ Gagal upload slash command:", error);
  }
};
