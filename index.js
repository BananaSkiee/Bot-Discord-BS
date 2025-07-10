const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const config = require("./config");
const updateOnline = require("./online");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

// Keep-alive Railway
const app = express();
app.get("/", (_, res) => res.send("Akira aktif"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Server aktif"));

bot.on("ready", () => {
  console.log(`🤖 Login sebagai ${bot.user.tag}`);
  const guild = bot.guilds.cache.first();
  if (guild) updateOnline(guild);
});

bot.on("presenceUpdate", (_, newPresence) => {
  const guild = newPresence.guild;
  if (guild) updateOnline(guild);
});

bot.login(config.token);
