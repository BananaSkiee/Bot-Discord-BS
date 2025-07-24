const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
  client.commands = new Map();

  const commands = [];
  const commandsPath = path.join(__dirname, "../commands");
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`${commandsPath}/${file}`);
    if (command?.data && command?.execute) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    }
  }

  const guild = client.guilds.cache.first();
  if (guild) await guild.commands.set(commands);
};
