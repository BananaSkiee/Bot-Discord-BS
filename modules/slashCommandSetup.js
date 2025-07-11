const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.TOKEN;

// Ambil semua command dari folder modules/
const commands = [];
const commandFiles = fs
  .readdirSync(path.join(__dirname))
  .filter(file => file.endsWith("Command.js"));

for (const file of commandFiles) {
  const command = require(`./${file}`);
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("🚀 Mengupdate slash commands (guild)...");

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Berhasil update slash commands (guild)");
  } catch (error) {
    console.error("❌ Gagal update slash commands:", error);
  }
})();
