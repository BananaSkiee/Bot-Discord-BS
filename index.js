// index.js
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const VOICE_CHANNEL_ID = "1366854862608007329";

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

async function updateVoice(guild) {
  if (!guild) return;
  const ch = guild.channels.cache.get(VOICE_CHANNEL_ID);
  if (!ch?.isVoiceBased()) return;

  await guild.members.fetch({ withPresences: true }); // wajib untuk presence
  const count = guild.members.cache.filter(m =>
    ["online", "idle", "dnd"].includes(m.presence?.status)
  ).size;

  try {
    await ch.setName(`「 Online: ${count} 」`);
    console.log(`✅ Channel rename → Online: ${count}`);
  } catch (e) {
    console.error("❌ Gagal ganti nama channel:", e);
  }
}

const app = express();
app.get("/", (_req, res) => res.send("Bot Akira aktif!"));
app.listen(process.env.PORT || 3000, () =>
  console.log("🌐 Server alive")
);

bot.on("ready", () => {
  console.log(`🤖 Bot siap sebagai ${bot.user.tag}`);
  const guild = bot.guilds.cache.first();
  updateVoice(guild);
});

bot.on("messageCreate", async msg => {
  if (msg.author.bot) return;
  if (msg.content === "!ping") return msg.reply("Pong! Aku online 😎");
  if (msg.content === "!online") {
    await msg.guild.members.fetch({ withPresences: true });
    const count = msg.guild.members.cache.filter(m =>
      ["online", "idle", "dnd"].includes(m.presence?.status)
    ).size;
    return msg.reply(`🟢 Ada ${count} member aktif saat ini!`);
  }
  if (msg.content === "!sync") {
    await updateVoice(msg.guild);
    return msg.reply("✅ Voice channel diperbarui!");
  }
});

bot.on("voiceStateUpdate", (oldS, newS) => {
  if (
    oldS.channelId === VOICE_CHANNEL_ID ||
    newS.channelId === VOICE_CHANNEL_ID
  ) updateVoice(newS.guild);
});

bot.on("presenceUpdate", (_, n) => {
  if (n.guild) updateVoice(n.guild);
});

bot.login(process.env.TOKEN);
