module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === "!test") {
      message.channel.send("✅ Bot aktif dan command `!test` berfungsi!");
    }
  }
};
