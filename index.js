const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const cron = require("node-cron");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const VOICE_CHANNEL_ID = "1366854862608007329";

app = express();
app.get("/", (req, res) => res.send("Bot Akira aktif!"));
app.listen(process.env.PORT || 3000);

bot.on("ready", () => {
  console.log(`✅ Akira siap sebagai ${bot.user.tag}`);
  updateVoiceChannel(); // langsung update setelah login
});

async function updateVoiceChannel() {
  const guild = bot.guilds.cache.first();
  if (!guild) return;
  await guild.members.fetch();
  const count = guild.members.cache.filter(
    m => m.presence && ["online", "idle", "dnd"].includes(m.presence.status)
  ).size;

  const ch = guild.channels.cache.get(VOICE_CHANNEL_ID);
  if (ch && ch.isVoiceBased()) {
    await ch.setName(`「 Online: ${count} 」`);
    console.log(`✅ Channel rename: ${count}`);
  }
}

// update hanya 1x per 6 menit untuk hindari rate-limit
cron.schedule("*/6 * * * *", updateVoiceChannel);

bot.on("messageCreate", async msg => {
  if (msg.content === "!ping") msg.reply("Pong! Aku online 😎");
  if (msg.content === "!sync") {
    await updateVoiceChannel();
    msg.reply("✅ Channel voice diperbarui!");
  }
});

bot.login(process.env.TOKEN);
