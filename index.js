// server dan bot login
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Bot Akira aktif 24 jam!"));
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web server aktif untuk keep-alive");
});

const { Client, GatewayIntentBits } = require("discord.js");
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// import modul fitur secara modular
require("./features/online")(bot);

bot.login(process.env.TOKEN);
