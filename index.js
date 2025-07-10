// index.js — server + bot login + import fitur online
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const app = express();
app.get("/", (req, res) => res.send("Bot Akira aktif 24 jam!"));
app.listen(process.env.PORT || 3000, () =>
  console.log("🌐 Web server aktif"));

require("./features/online")(bot); // import fitur online

bot.login(process.env.TOKEN);
