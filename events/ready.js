const updateOnline = require("../online");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`🤖 Bot siap sebagai ${client.user.tag}`);

    const guild = client.guilds.cache.first();
    if (!guild) return;

    await updateOnline(guild); // update saat pertama login

    setInterval(() => {
      updateOnline(guild); // update tiap 1 menit
    }, 60000);
  },
};
