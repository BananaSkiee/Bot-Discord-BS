const { REST, Routes } = require("discord.js");
const fs = require("fs");
const config = require("../config");
require("dotenv").config();

const commands = [];

const commandFiles = fs
  .readdirSync("./modules")
  .filter(file => file.endsWith("Command.js"));

for (const file of commandFiles) {
  const command = require(`../modules/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🔁 Refreshing slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        config.guildId
      ),
      { body: commands }
    );
    console.log("✅ Slash commands updated!");
  } catch (error) {
    console.error(error);
  }
})();
