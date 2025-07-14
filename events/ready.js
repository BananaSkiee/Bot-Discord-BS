const updateOnline = require("../online");
const stickyHandler = require("../sticky");
const autoGreeting = require("../modules/autoGreeting");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`🤖 Bot siap sebagai ${client.user.tag}`);

    const guild = client.guilds.cache.first();
    if (!guild) {
      console.warn("⚠️ Guild tidak ditemukan.");
      return;
    }

    // ⏫ Auto Update Member Online VC
    await updateOnline(guild); // Pertama kali saat bot online
    setInterval(() => {
      updateOnline(guild); // Update setiap 60 detik
    }, 60_000);

    // 📌 Sticky Message Handler
    stickyHandler(client);

    // 👋 Auto Greeting System
    autoGreeting(client);
  },
};
