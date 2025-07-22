const updateOnline = require("../online");
const stickyHandler = require("../sticky");
const autoGreeting = require("../modules/autoGreeting");
const joinvoice = require("../modules/joinvoice");
const countValidator = require("../modules/countValidator");
const textCountr = require("../modules/textCountr");

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

    //Countr
    textCounter(client);
    
    // 🔊 Join voice channel saat online
    try {
      await joinvoice(client);
    } catch (err) {
      console.error("❌ Gagal join voice channel:", err);
    }
  },
};
