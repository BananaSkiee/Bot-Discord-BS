const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const express = require("express");
const config = require("./config");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Keep-alive (untuk Railway / Replit)
const app = express();
app.get("/", (_, res) => res.send("Bot aktif"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Web server hidup"));

// Load events
fs.readdirSync("./events").forEach(file => {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

client.login(config.token);
