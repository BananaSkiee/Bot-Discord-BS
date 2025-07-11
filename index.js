require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const express = require("express");
const config = require("./config");

const autoChat = require("./autoChat");
const stickyHandler = require("./sticky");
const createVoiceChannel = require("./createVoiceChannel");
const handleNickname = require("./nicknameTag");
const setupSlashCommands = require("./slashCommandSetup");
const handleGacha = require("./gacha");

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

// Event handler loader
fs.readdirSync("./events").forEach((file) => {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// Saat bot siap
client.once("ready", async () => {
  console.log(`🤖 Bot siap sebagai ${client.user.tag}`);
  
  // 🔊 Update voice channel otomatis
  createVoiceChannel(client);

  // 🔧 Pasang sticky handler
  stickyHandler(client);

  // 🛠️ Pasang slash commands
  await setupSlashCommands(client);

  // 🎭 Nickname berdasarkan role
  handleNickname(client);
});

// 🔁 Auto-chat dan AI-style reply
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  autoChat(message); // auto-reply dan !ai
  handleGacha(message); // fitur gacha
});

// Error handler
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Error:", err);
});

client.login(config.token);
