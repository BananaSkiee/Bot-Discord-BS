require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const express = require("express");
const config = require("./config");

// 🧠 Custom modules
const stickyHandler = require("./sticky");
const updateOnline = require("./online");
const autoGreeting = require("./modules/autoGreeting");
const updateTimeChannel = require("./modules/updateTimeChannel");
const generateTextGraph = require('./modules/');

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

// 🌐 Web server (Railway)
const app = express();
app.get("/", (_, res) => res.send("✅ Bot Akira aktif"));
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web server hidup di port 3000");
});

// 📂 Load events dari folder /events
fs.readdirSync("./events").forEach((file) => {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// 🟩 Slash Commands + 🟦 Button Handler
client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction, client);
  } catch (error) {
    console.error("❌ Interaction Error:", error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Terjadi error saat menjalankan perintah.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "❌ Terjadi error saat menjalankan perintah.",
        ephemeral: true,
      });
    }
  }
});

// 💬 Command pakai prefix (!)
client.on("messageCreate", async (message) => {

  if (message.author.bot || !message.content.startsWith("!")) return;
  
  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  try {
    if (commandName === "ping") {
      return message.channel.send("🏓 Pong!");
    }
    // Tambah command manual lain di sini

  } catch (err) {
    console.error("❌ Message Command Error:", err);
  }
});

// 📌 Sticky Message Handler
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  stickyHandler(client, message);
});

// 🚀 Auto Greeting ketika user join
client.on("guildMemberAdd", async (member) => {
  autoGreeting(client, member);
});

// 🔁 Update jumlah user online di VC
client.on("presenceUpdate", () => updateOnline(client));
client.on("voiceStateUpdate", () => updateOnline(client));

// ⏱ Update waktu di voice channel tiap 30 detik
setInterval(() => {
  updateTimeChannel(client);
}, 30 * 1000);

// 🧯 Global Error Handler
process.on("unhandledRejection", (err) => {
  console.error("🚨 Unhandled Error:", err);
});

// 🔁 Auto post grafik BTC setiap 10 detik
const hargaData = [64000, 64500, 64200, 64800, 65000, 64900, 65500];
const CHANNEL_ID = "1397169936467755151"; // Ganti dengan ID channel Discord kamu

setInterval(async () => {
  const change = Math.floor(Math.random() * 600 - 300);
  const last = hargaData[hargaData.length - 1];
  hargaData.push(last + change);
  if (hargaData.length > 20) hargaData.shift();

  const chart = generateTextGraph(hargaData, "BTC");
  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel || !channel.isTextBased()) return;

  // Kirim pesan jika belum ada
  if (!messageToEdit) {
    messageToEdit = await channel.send("```" + chart + "```");
  } else {
    messageToEdit.edit("```" + chart + "```");
  }
}, 10000);

// 🔐 Login bot
client.login(config.token);
