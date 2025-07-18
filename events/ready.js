const updateOnline = require("../online");
const stickyHandler = require("../sticky");
const autoGreeting = require("../modules/autoGreeting");
const sendTicketButton = require("../modules/ticketButtonSender");
const sendVcToolsPanel = require("../astro/vcTools");
const joinvoice = require("../modules/joinvoice"); // <- Sudah benar

const CHANNEL_ID = "1356706671220494498"; // Ganti ID sesuai channel panel VC

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`🤖 Bot siap sebagai ${client.user.tag}`);

    const guild = client.guilds.cache.first();
    if (!guild) return;

    // Update online VC
    await updateOnline(guild);
    setInterval(() => updateOnline(guild), 60000);

    // Sticky Message
    stickyHandler(client);

    // Auto Greeting
    autoGreeting(client);

    // Kirim tombol tiket otomatis
    await sendTicketButton(client);

    // Kirim panel VC Tools
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (channel && channel.isTextBased()) {
        sendVcToolsPanel(channel);
      }
    } catch (err) {
      console.error("❌ Gagal kirim panel VC Tools:", err);
    }

    // 🔊 Join voice channel saat online
    try {
      await joinvoice(client);
    } catch (err) {
      console.error("❌ Gagal join voice channel:", err);
    }
  },
};
