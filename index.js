// Web server untuk jaga agar bot tetap hidup
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Bot Akira aktif 24 jam!"));
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web server aktif untuk keep-alive");
});

// Bot Discord
const { Client, GatewayIntentBits } = require("discord.js");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

bot.on("ready", () => {
  console.log(`🤖 Bot Akira login sebagai ${bot.user.tag}`);
});

bot.on("messageCreate", (msg) => {
  if (msg.content === "!ping") {
    msg.reply("Pong! Aku online 😎");
  }
});

bot.login(process.env.TOKEN); // Token disimpan di Railway Environment