// index.js — Bot Discord + fitur online member

const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

// Ganti dengan ID voice channel kamu
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
  if (!ch || !ch.isVoiceBased()) return;

  await guild.members.fetch({ withPresences: true });
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

// Web server untuk keep-alive di Railway
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

  if (msg.content === "!ping") {
    console.log("DEBUG: ping received");
    return msg.reply("Pong! Aku online 😎");
  }

  if (msg.content === "!online") {
    console.log("DEBUG: online command received");
    await msg.guild.members.fetch({ withPresences: true });
    const count = msg.guild.members.cache.filter(m =>
      ["online", "idle", "dnd"].includes(m.presence?.status)
    ).size;
    console.log("DEBUG: online count =", count);
    return msg.reply(`🟢 Saat ini ada ${count} member aktif (online/idle/dnd).`);
  }

  if (msg.content === "!sync") {
    console.log("DEBUG: sync command received");
    await updateVoice(msg.guild);
    console.log("DEBUG: updateVoice executed");
    return msg.reply("✅ Voice channel diperbarui!");
  }
});

// Event otomatis update saat ada perubahan voice atau presence
bot.on("voiceStateUpdate", (oldS, newS) => {
  if (oldS.channelId === VOICE_CHANNEL_ID || newS.channelId === VOICE_CHANNEL_ID) {
    updateVoice(newS.guild);
  }
});

bot.on("presenceUpdate", (_oldP, newP) => {
  if (newP.guild) updateVoice(newP.guild);
});

bot.login(process.env.TOKEN);
