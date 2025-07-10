const scheduler = require("../scheduler");

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;

    if (message.content === "!test") {
      return message.channel.send("✅ Bot aktif dan command `!test` berfungsi!");
    }

    if (message.content === "!randomchat") {
      const text = scheduler.getRandomMessage(); // Fungsi dari scheduler
      return message.channel.send(`🧠 ${text}`);
    }
  }
};
