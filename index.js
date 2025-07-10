const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const updateVoice = require("./online");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const app = express();
app.get("/", (req, res) => res.send("Bot Akira aktif 24 jam!"));
app.listen(process.env.PORT || 3000, () =>
  console.log("🌐 Server alive")
);

bot.on("ready", () => {
  console.log(`🤖 Bot login sebagai ${bot.user.tag}`);
  const guild = bot.guilds.cache.first();
  if (guild) updateVoice(guild);
});

bot.on("messageCreate", async msg => {
  if (msg.author.bot) return;
  if (msg.content === "!ping") return msg.reply("Pong! Aku online 😎");
  if (msg.content === "!online") {
    await msg.guild.members.fetch({ withPresences: true });
    const count = msg.guild.members.cache.filter(m =>
      ["online", "idle", "dnd"].includes(m.presence?.status)
    ).size;
    return msg.reply(`🟢 Ada ${count} member aktif sekarang!`);
  }
  if (msg.content === "!sync") {
    await updateVoice(msg.guild);
    return msg.reply("✅ Voice channel diperbarui!");
  }
});

bot.on("voiceStateUpdate", (o, n) => {
  if (
    o.channelId === "1366854862608007329" ||
    n.channelId === "1366854862608007329"
  ) updateVoice(n.guild);
});

bot.on("presenceUpdate", (_, n) => {
  if (n.guild) updateVoice(n.guild);
});

bot.login(process.env.TOKEN);
