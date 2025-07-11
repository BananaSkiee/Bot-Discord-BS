const { REST, Routes } = require("discord.js");
const fs = require("fs");
const config = require("../config");
require("dotenv").config();

const commands = [];

// Ambil semua command dari folder modules/
const commandFiles = fs.readdirSync("./modules").filter(file => file.endsWith("Command.js"));

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
      Routes.applicationGuildCommands(process.env.CLIENT_ID, config.guildId),
      { body: commands }
    );

    console.log("✅ Slash command berhasil didaftarkan.");
  } catch (error) {
    console.error("❌ Gagal daftar command:", error);
  }
})();
