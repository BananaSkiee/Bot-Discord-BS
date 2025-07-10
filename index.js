const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const express = require("express");
const config = require("./config");
const scheduler = require("./scheduler"); // <-- Auto chat tiap jam

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Keep-alive server (buat Railway)
const app = express();
app.get("/", (_, res) => res.send("Bot Akira aktif"));
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web server hidup");
});

// Load event handler (dari folder /events)
fs.readdirSync("./events").forEach((file) => {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// Jalankan scheduler saat bot siap
client.once("ready", () => {
  console.log(`🤖 Bot siap sebagai ${client.user.tag}`);
  scheduler(client); // ← auto chat mulai jalan
});

// Handle error global
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Error:", err);
});

client.login(config.token);
