// modules/slashCommandSetup.js
require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname)).filter(file => file.endsWith("Command.js"));

for (const file of commandFiles) {
  const command = require(`./${file}`);
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🚀 Mendaftarkan slash command...");
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log("✅ Slash command berhasil didaftarkan.");
  } catch (error) {
    console.error("❌ Gagal mendaftar:", error);
  }
})();
