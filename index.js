require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const express = require("express");
const config = require("./config");

const stickyHandler = require("./sticky");
const updateOnline = require("./online"); // ðŸ”Š Update Online VC
const handleNickname = require("./modules/nicknameTag"); // âœ… Fitur DM tag nickname

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ðŸŒ Web server untuk Railway
const app = express();
app.get("/", (_, res) => res.send("Bot Akira aktif"));
app.listen(process.env.PORT || 3000, () => {
  console.log("ðŸŒ Web server hidup");
});

// ðŸ”„ Load semua event dari folder events/
fs.readdirSync("./events").forEach((file) => {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// ðŸ”” Saat bot siap
client.once("ready", async () => {
  console.log(`ðŸ¤– Bot siap sebagai ${client.user.tag}`);

  // âœ… Ambil guild
  const guild = client.guilds.cache.get(config.guildId);
  if (!guild) {
    return console.error("âŒ Gagal menemukan guild dengan ID:", config.guildId);
  }

  // ðŸ”Š Update voice channel "Online" pertama kali
  await updateOnline(guild);

  // ðŸ” Update voice channel setiap 1 menit 30 detik
  setInterval(async () => {
    await updateOnline(guild);
  }, 90000);

  // ðŸ“Œ Pasang sticky message handler
  stickyHandler(client);

  // ðŸŽ­ Jalankan fitur DM Tag Nickname otomatis
  handleNickname(client); // â¬…ï¸ Ini penting!
});

// ðŸ“¨ Auto-reply atau command lain via message
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  // Tambahkan fitur message-based di sini
});

// ðŸ’¥ Tangani error global
process.on("unhandledRejection", (err) => {
  console.error("ðŸ’¥ Unhandled Error:", err);
});

// ðŸ” Login ke bot
client.login(config.token);
