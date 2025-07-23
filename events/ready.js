const updateOnline = require("../online");
const stickyHandler = require("../sticky");
const autoGreeting = require("../modules/autoGreeting");
const joinvoice = require("../modules/joinvoice");
const countValidator = require("../modules/countValidator");
const textCounter = require("../modules/textCounter");
const simulateBTC = require("../modules/cryptoSimulator");
const updateCryptoMessage = require("../modules/updateCrypto");
const autoSendMeme = require("../modules/autoMeme");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`🤖 Bot siap sebagai ${client.user.tag}`);

    const guild = client.guilds.cache.first();
    if (!guild) return;

    // Update online VC
    await updateOnline(guild);
    setInterval(() => updateOnline(guild), 10000);

    // Sticky Message
    stickyHandler(client);

    // Auto Greeting
    autoGreeting(client);

    // 🔢 Counter
    countValidator(client);

    simulateBTC(client);

    setInterval(() => {
  const newContent = "📈 BTC: $65,000 (+0.4%)"; // atau generate dari API grafikmu
  updateCryptoMessage(client, newContent);
}, 60_000);

  const channel = await client.channels.fetch("1352404777513783336");
  setInterval(() => autoSendMeme(channel), 3600000); // tiap 1 jam
});
    
    // 🔊 Join voice channel saat online
    try {
      await joinvoice(client);
    } catch (err) {
      console.error("❌ Gagal join voice channel:", err);
    }
  },
};
