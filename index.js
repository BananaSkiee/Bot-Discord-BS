// index.js
require("dotenv").config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const express = require("express");
const config = require("./config");

// 🧠 Custom modules
const cmdCrypto = require("./modules/cmdCrypto");
const startCryptoSimulation = require("./modules/cryptoSimulator");
const { resetGrafik } = require("./modules/cryptoSimulator");
const stickyHandler = require("./sticky");
const updateOnline = require("./online");
const autoGreeting = require("./modules/autoGreeting");
const updateTimeChannel = require("./modules/updateTimeChannel");
const invitesTracker = require("./modules/invitesTracker");
const slashCommandSetup = require("./modules/slashCommandSetup");

require("./modules/srvName")(client);

// 📌 Init Bot
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

client.commands = new Collection();

// 📂 Prefix Commands (Crypto Game)
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
  collectstake: cmdCrypto.collectStake,
  loan: cmdCrypto.loan,
  payloan: cmdCrypto.payloan,
  insurance: cmdCrypto.insurance,
  market: cmdCrypto.market,
  leaderboard: cmdCrypto.leaderboard,
  achievements: cmdCrypto.achievements,
  progress: cmdCrypto.progress,
  profile: cmdCrypto.profile,
  donate: cmdCrypto.donate,
  report: cmdCrypto.report,
  history: cmdCrypto.history,
  wsend: cmdCrypto.wsend,
  ask: cmdCrypto.ask,
  admin: cmdCrypto.admin,
  pw: cmdCrypto.pw,
  givecoin: cmdCrypto.givecoin,
  givebtc: cmdCrypto.givebtc,
  setpw: cmdCrypto.setpw,
  setcoin: cmdCrypto.setcoin,
  setbtc: cmdCrypto.setbtc,
  seteth: cmdCrypto.seteth,
  setbnb: cmdCrypto.setbnb,
  dts: cmdCrypto.dts,
  logs: cmdCrypto.logs,
};

// 🗂️ Inisialisasi file data crypto
function initializeDataFiles() {
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  const files = [
    "cryptoUsers.json",
    "cryptoPasswords.json",
    "transactionHistory.json",
    "loans.json",
    "stakes.json",
    "reports.json",
    "owoRates.json",
    "cryptoSimulator.json"
  ];
  files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
      console.log(`[INIT] Created empty data file: ${file}`);
    }
  });
}

// 📌 Ready Event
client.once("ready", async () => {
  console.log(`✅ Bot ${client.user.tag} aktif!`);
  initializeDataFiles();
  await slashCommandSetup(client);
  startCryptoSimulation(client);
  invitesTracker(client);
  setInterval(() => {
    cmdCrypto.processStakes();
    cmdCrypto.processLoans();
  }, 60 * 60 * 1000);
});

// 📂 Load Events
fs.readdirSync("./events").forEach(file => {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// 🎯 Handler Prefix Commands
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith("!")) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = prefixCommands[commandName];
  const adminRoleId = process.env.ADMIN_ROLE_ID || "1352279577174605884";

  // 📊 Reset grafik command
  if (commandName === "grafik") {
    await resetGrafik(message.client);
    return message.reply("✅ Grafik berhasil dikirim ulang.");
  }

  // 📜 Help
  if (commandName === "help") {
    if (args[0]?.toLowerCase() === "crypto") {
      const result = cmdCrypto.help();
      return message.reply({ embeds: [result.embed] });
    }
    return message.reply("Command help tidak ditemukan. Coba `!help crypto`.");
  }

  // 📌 Kalau belum register
  if (commandName !== "register" && !cmdCrypto.checkIfRegistered(message.author.id)) {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("👋 Selamat datang di Crypto Game!")
          .setDescription("Kamu belum terdaftar. Ketik `!register` untuk memulai!")
          .setColor("#FFD700")
          .setTimestamp(),
      ],
    });
  }

  if (!command) return;

  // 🔒 Admin check
  const isAdminCommand = [
    "admin", "pw", "givecoin", "givebtc", "setpw", "setcoin", "setbtc", "seteth", "setbnb", "dts", "logs"
  ].includes(commandName);

  if (isAdminCommand) {
    const member = await message.guild.members.fetch(message.author.id);
    if (!member.roles.cache.has(adminRoleId)) {
      return message.reply("⛔ Kamu tidak punya akses ke command ini.");
    }
  }

  try {
    const result = await command(message, args);
    if (result.error) {
      await message.reply(`❌ ${result.error}`);
    } else if (result.message) {
      await message.reply(result.message);
    } else if (result.embed) {
      await message.reply({ embeds: [result.embed] });
    }
  } catch (error) {
    console.error(`❌ Error executing command ${commandName}:`, error);
    await message.reply("❌ Terjadi kesalahan tak terduga saat menjalankan perintah.");
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
client.on("presenceUpdate", () => {
  const guild = client.guilds.cache.first();
  if (guild) updateOnline(guild);
});
client.on("voiceStateUpdate", () => {
  const guild = client.guilds.cache.first();
  if (guild) updateOnline(guild);
});
setInterval(() => updateTimeChannel(client), 30 * 1000);

// 🌐 Web Server
const app = express();
app.get("/", (_, res) => res.send("✅ Bot Akira aktif"));
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Web server hidup di port 3000");
});

// 🧯 Error Handler
process.on("unhandledRejection", (err) => {
  console.error("🚨 Unhandled Error:", err);
});

// 🔐 Login
client.login(config.token);
