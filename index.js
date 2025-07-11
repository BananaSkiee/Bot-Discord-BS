require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const express = require("express");
const config = require("./config");

const stickyHandler = require("./sticky");
const updateOnline = require("./online"); // 🔊 Update Online VC

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 🌐 Web server untuk Railway
const app = express();
app.get("/", (_, res) => res.send("Bot Akira aktif"));
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web server hidup");
});

// 🔄 Load semua event dari folder events/
fs.readdirSync("./events").forEach((file) => {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// 🔔 Saat bot siap
client.once("ready", async () => {
  console.log(`🤖 Bot siap sebagai ${client.user.tag}`);

  // ✅ Ambil guild
  const guild = client.guilds.cache.get(config.guildId);
  if (!guild) {
    return console.error("❌ Gagal menemukan guild dengan ID:", config.guildId);
  }

  // 🔊 Update voice channel "Online" pertama kali
  await updateOnline(guild);

  // 🔁 Update voice channel setiap 1 menit 30 detik
  setInterval(async () => {
    await updateOnline(guild);
  }, 90000);

  // 📌 Pasang sticky message handler
  stickyHandler(client);
});

// 📨 Auto-reply atau command lain via message
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  // Tambahkan fitur message-based di sini
});

// 💥 Tangani error global
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Error:", err);
});

// 🔐 Login ke bot
client.login(config.token);
