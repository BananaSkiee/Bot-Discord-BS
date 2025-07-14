const updateOnline = require("../online");
const stickyHandler = require("../sticky");
const autoGreeting = require("../modules/autoGreeting");
const sendTicketButton = require("../modules/ticketButtonSender");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`🤖 Bot siap sebagai ${client.user.tag}`);

    const guild = client.guilds.cache.first();
    if (!guild) return;

    await updateOnline(guild);
    setInterval(() => updateOnline(guild), 60000);

    stickyHandler(client);
    autoGreeting(client);

    // Kirim tombol tiket otomatis
    await sendTicketButton(client);
  },
};
