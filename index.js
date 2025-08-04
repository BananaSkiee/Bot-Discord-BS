// index.js
require("dotenv").config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const express = require("express");
const config = require("./config");

// 🧠 Custom modules
const cmdCrypto = require("./modules/cmdCrypto");
const startCryptoSimulation = require("./modules/cryptoSimulator");
const stickyHandler = require("./sticky");
const updateOnline = require("./online");
const autoGreeting = require("./modules/autoGreeting");
const updateTimeChannel = require("./modules/updateTimeChannel");
const invitesTracker = require("./modules/invitesTracker");
const slashCommandSetup = require("./modules/slashCommandSetup");
const { resetGrafik } = require("./modules/cryptoSimulator");

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
client.once("ready", async () => {
  console.log(`✅ Bot ${client.user.tag} aktif!`);
  await slashCommandSetup(client); // Jalankan slash command di sini
  startCryptoSimulation(client);
  invitesTracker(client);
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

  // 📊 Kalau command !grafik → reset grafik
  if (commandName === "grafik") {
    await resetGrafik(message.client); // Gunakan fungsi yang ada
    return message.reply("✅ Grafik berhasil dikirim ulang.");
  }

  if (!command) {
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

// 🔐 Login Bot
client.login(config.token);
