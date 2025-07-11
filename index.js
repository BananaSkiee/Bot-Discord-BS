require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const express = require("express");
const config = require("./config");

const stickyHandler = require("./sticky");
const setupSlashCommands = require("./slashCommandSetup");
const updateOnline = require("./createVoiceChannel"); // ← Ini fungsimu
const handleNickname = require("./modules/nicknameTag");

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

  // ✅ Ambil guild
  const guild = client.guilds.cache.get(config.guildId);
  if (!guild) {
    return console.error("❌ Gagal menemukan guild dengan ID:", config.guildId);
  }

  // 🔊 Update voice channel online langsung saat bot aktif
  await updateOnline(guild);

  // 🔁 Update online setiap 1 menit 30 detik (90000 ms)
  setInterval(async () => {
    await updateOnline(guild);
  }, 90000);

  // 🔧 Pasang sticky handler
  stickyHandler(client);

  // 🛠️ Pasang slash commands
  await setupSlashCommands(client);

  // 🎭 Nickname berdasarkan role
  handleNickname(client);
});

// Tambahkan fitur messageCreate lain di sini jika perlu
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  // Fitur auto-reply atau lainnya bisa ditambahkan di sini nanti
});

// Error handler
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Error:", err);
});

client.login(config.token);
