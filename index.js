const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const updateVoiceName = require("./online");  // import fitur

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates // penting
  ]
});

// server keep-alive
const app = express();
app.get("/", (req, res) => res.send("Bot Akira aktif"));
app.listen(process.env.PORT || 3000, () =>
  console.log("🌐 Server alive")
);

// jalankan fitur update voice channel
updateVoiceName(bot);

bot.login(process.env.TOKEN);
