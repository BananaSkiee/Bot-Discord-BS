const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const updateVoice = require("./online");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const app = express();
app.get("/", (req, res) => res.send("Bot Akira aktif 24 jam!"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Server alive"));

bot.on("ready", () => {
  console.log(`🤖 Bot login sebagai ${bot.user.tag}`);
  const guild = bot.guilds.cache.first();
  if (guild) updateVoice(guild);
});

bot.on("messageCreate", async msg => {
  if (msg.author.bot) return;
  if (msg.content === "!ping") return msg.reply("Pong! Aku online 😎");
  if (msg.content === "!online") {
    const guild = msg.guild;
    await guild.members.fetch();
    const count = guild.members.cache.filter(m =>
      ["online", "idle", "dnd"].includes(m.presence?.status)
    ).size;
    return msg.reply(`🟢 Ada ${count} member aktif sekarang!`);
  }
  if (msg.content === "!sync") {
    await updateVoice(msg.guild);
    return msg.reply("✅ Voice channel diperbarui!");
  }
});

bot.on("voiceStateUpdate", (oldS, newS) => {
  if (
    oldS.channelId === "1366854862608007329" ||
    newS.channelId === "1366854862608007329"
  ) updateVoice(newS.guild);
});

bot.on("presenceUpdate", (_, newP) => {
  if (newP.guild) updateVoice(newP.guild);
});

bot.login(process.env.TOKEN);
