// index.js
require("dotenv").config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const express = require("express");
const config = require("./config");

// 🧠 Custom modules
const cmdCrypto = require("./modules/cmdCrypto");
const startCryptoSimulation = require("./modules/cryptoSimulator"); // Sudah termasuk generateTextGraph di dalamnya
const stickyHandler = require("./sticky");
const updateOnline = require("./online");
const autoGreeting = require("./modules/autoGreeting");
const updateTimeChannel = require("./modules/updateTimeChannel");
const welcomecard = require("./modules/welcomeCard");
const iconanim = require("./modules/iconAnim");
const invitesTracker = require("./modules/invitesTracker");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

require("./modules/srvName")(client);

// 📂 Load Slash Commands
require("./modules/slashCommandSetup")(client);
client.commands = new Collection();

// 📂 Command prefix "!" untuk crypto game
const prefixCommands = {
  register: cmdCrypto.register,
  balance: cmdCrypto.balance,
  help: cmdCrypto.help,
  price: cmdCrypto.price,
  buy: cmdCrypto.buy,
  sell: cmdCrypto.sell,
  portfolio: cmdCrypto.portfolio,
  daily: cmdCrypto.daily,
  work: cmdCrypto.work,
  hunt: cmdCrypto.hunt,
  guess: cmdCrypto.guess,
  gacha: cmdCrypto.gacha,
  heck: cmdCrypto.heck,
  resetpw: cmdCrypto.resetpw,
  stake: cmdCrypto.stake,
  loan: cmdCrypto.loan,
  market: cmdCrypto.market,
  richest: cmdCrypto.richest,
  achievements: cmdCrypto.achievements,
  progress: cmdCrypto.progress,
  profile: cmdCrypto.profile,
  donate: cmdCrypto.donate,
  report: cmdCrypto.report,
  history: cmdCrypto.history,
  ask: cmdCrypto.ask,
  admin: cmdCrypto.admin,
  pw: cmdCrypto.pw,
  givecoin: cmdCrypto.givecoin,
  givebtc: cmdCrypto.givebtc,
  setpw: cmdCrypto.setpw,
};

// 📌 Event Ready
client.once("ready", () => {
  console.log(`✅ Bot ${client.user.tag} aktif!`);
  startCryptoSimulation(client); // Jalankan simulasi crypto
  invitesTracker(client); // Jalankan invite tracker
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

// 🎯 Handler untuk command prefix "!"
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith("!")) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = prefixCommands[commandName];
  const adminRoleId = process.env.ADMIN_ROLE_ID || "1352279577174605884";

  if (!command) {
    // Jika command tidak dikenal dan user belum register
    const isRegistered = cmdCrypto.checkIfRegistered(message.author.id);
    if (!isRegistered) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("👋 Selamat datang di Crypto Game!")
            .setDescription("Kamu belum terdaftar. Ketik `!register` untuk memulai!")
            .setColor("Random"),
        ],
      });
    }
    return;
  }

  // Cek command admin
  const isAdminCommand = ["admin", "pw", "givecoin", "givebtc", "setpw"].includes(commandName);
  const member = await message.guild.members.fetch(message.author.id);

  if (isAdminCommand && !member.roles.cache.has(adminRoleId)) {
    return message.reply("⛔ Kamu tidak punya akses ke command ini.");
  }

  try {
    const result = await command(message, args);
    if (result.error) {
      await message.reply(result.error);
    } else if (result.message) {
      await message.reply(result.message);
    } else if (result.embed) {
      await message.reply({ embeds: [result.embed] });
    }
  } catch (error) {
    console.error("❌ Error executing command:", error);
    await message.reply("❌ Terjadi kesalahan saat menjalankan perintah.");
  }
});

// 📌 Slash Command & Interaction
client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    await command.execute(interaction, client);
  } catch (error) {
    console.error("❌ Interaction Error:", error);
    const replyOptions = {
      content: "❌ Terjadi error saat menjalankan perintah.",
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions);
    } else {
      await interaction.reply(replyOptions);
    }
  }
});

// 📌 Sticky Message
client.on("messageCreate", (message) => {
  if (!message.author.bot) stickyHandler(client, message);
});

// 📌 Welcome Greeting
client.on("guildMemberAdd", (member) => {
  autoGreeting(client, member);
});

// 🔁 Update jumlah online & waktu
client.on("presenceUpdate", () => updateOnline(client));
client.on("voiceStateUpdate", () => updateOnline(client));
setInterval(() => updateTimeChannel(client), 30 * 1000);

// 🌐 Web Server (Railway Ping)
const app = express();
app.get("/", (_, res) => res.send("✅ Bot Akira aktif"));
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web server hidup di port 3000");
});

// 🧯 Error Handler
process.on("unhandledRejection", (err) => {
  console.error("🚨 Unhandled Error:", err);
});

// 🔐 Login Bot
client.login(config.token);
