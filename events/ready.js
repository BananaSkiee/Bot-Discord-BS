const updateOnline = require("../online");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`🤖 Bot siap sebagai ${client.user.tag}`);
    const guild = client.guilds.cache.first();
    if (guild) await updateOnline(guild);
  }
};
