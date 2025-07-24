// modules/slashCommandSetup.js
const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
  const commands = [];
  const commandFiles = fs.readdirSync(path.join(__dirname, "../commands")).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    if (command.data) {
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command); // simpan di collection
    }
  }

  const guildId = "YOUR_GUILD_ID";
  const guild = client.guilds.cache.get(guildId);
  if (guild) {
    await guild.commands.set(commands);
    console.log("✅ Slash commands berhasil diset di guild.");
  } else {
    console.error("❌ Guild tidak ditemukan.");
  }
};
