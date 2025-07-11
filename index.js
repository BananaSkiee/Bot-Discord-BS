require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const express = require("express");
const config = require("./config");

const stickyHandler = require("./sticky");
const updateOnline = require("./online");
const handleNickname = require("./modules/nicknameTag");
const autoGreeting = require("./modules/autoGreeting");

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

// 📦 Load semua event dari folder events/
fs.readdirSync("./events").forEach((file) => {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// ✅ Saat bot siap
client.once("ready", async () => {
  console.log(`🤖 Bot siap sebagai ${client.user.tag}`);

  const guild = client.guilds.cache.get(config.guildId);
  if (!guild) {
    return console.error("❌ Gagal menemukan guild dengan ID:", config.guildId);
  }

  await updateOnline(guild); // Update pertama
  setInterval(async () => {
    await updateOnline(guild); // Update tiap 1,5 menit
  }, 90000);

  stickyHandler(client);
  handleNickname(client); // Fitur DM tag nickname
  autoGreeting(client);   // 🔔 Ucapan pagi/siang/sore/malam otomatis
});

// 🎯 Jalankan Slash Command
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "❌ Terjadi error saat menjalankan perintah.",
      ephemeral: true,
    });
  }
});

// 💬 Auto-reply atau command biasa
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  // Tambahkan auto-reply manual di sini
});

// 🚨 Tangani error global
process.on("unhandledRejection", (err) => {
  console.error("🚨 Unhandled Error:", err);
});

// 🔐 Login ke bot
client.login(config.token);
