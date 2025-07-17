require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const express = require("express");
const config = require("./config");

const stickyHandler = require("./sticky");
const updateOnline = require("./online");
const autoGreeting = require("./modules/autoGreeting");
const updateTimeChannel = require("./modules/updateTimeChannel"); // ⏰ Update waktu VC
const createVoice = require("./Astro/createVoice"); // Pastikan folder bernama "Astro"

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// 🌐 Web server untuk Railway
const app = express();
app.get("/", (_, res) => res.send("Bot Akira aktif"));
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web server hidup");
});

// 📦 Load event dari folder events/
fs.readdirSync("./events").forEach((file) => {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// 📦 Load command dari folder commands/
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// 💬 Handle slash command
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error("❌ Slash Command Error:", error);
    await interaction.reply({
      content: "❌ Terjadi error saat menjalankan perintah.",
      ephemeral: true,
    });
  }
});

// 💬 Handle message-based command (!prefix)
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith("!")) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  try {
    // Tambahkan perintah manual di sini
    if (commandName === "ping") {
      return message.channel.send("🏓 Pong!");
    }

    if (commandName === "testdm") {
      return message.author.send("📩 Ini adalah test DM dari Akira.");
    }

    // Tambahkan lagi sesuai kebutuhan
  } catch (err) {
    console.error("❌ Message Command Error:", err);
  }
});

// 🛠 Auto sticky message handler
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  stickyHandler(client, message); // sticky.js harus pakai `module.exports = function(client, message)`
});

// 🚀 Auto Greeting
client.on("guildMemberAdd", async (member) => {
  autoGreeting(client, member); // modules/autoGreeting.js
});

// 🔁 Update VC Online Count
client.on("presenceUpdate", (oldPresence, newPresence) => {
  updateOnline(client);
});
client.on("voiceStateUpdate", () => {
  updateOnline(client);
});

// 🛰️ Auto Voice Channel (ASTRO)
client.on("voiceStateUpdate", (oldState, newState) => {
  createVoice(client, oldState, newState);
});

// 🕒 Update VC waktu tiap 30 detik
setInterval(() => {
  updateTimeChannel(client);
}, 30 * 1000);

// ⚠️ Global Error Handler
process.on("unhandledRejection", (err) => {
  console.error("🚨 Unhandled Error:", err);
});

// 🔐 Login
client.login(config.token);
