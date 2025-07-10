// index.js - Akira Bot fitur auto update online member voice channel

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

// Web server Railway
const app = express();
app.get("/", (_, res) => res.send("Akira aktif!"));
app.listen(process.env.PORT || 3000, () =>
  console.log("🌐 Web server aktif")
);

// Fungsi update nama voice channel
async function updateVoice(guild) {
  if (!guild) return;
  const channel = guild.channels.cache.get(VOICE_CHANNEL_ID);
  if (!channel?.isVoiceBased()) return;

  await guild.members.fetch({ withPresences: true });

  const count = guild.members.cache.filter(
    m => ["online", "idle", "dnd"].includes(m.presence?.status)
  ).size;

  try {
    await channel.setName(`「 Online: ${count} 」`);
    console.log(`✅ Channel rename → Online: ${count}`);
  } catch (err) {
    console.error("❌ Gagal rename channel:", err);
  }
}

// Saat bot online
bot.on("ready", () => {
  console.log(`🤖 Bot login sebagai ${bot.user.tag}`);
  const guild = bot.guilds.cache.first();
  updateVoice(guild);
});

// Perintah Discord
bot.on("messageCreate", async msg => {
  if (msg.author.bot) return;

  if (msg.content === "!ping") {
    return msg.reply("Pong! Aku online 😎");
  }

  if (msg.content === "!online") {
    await msg.guild.members.fetch({ withPresences: true });
    const count = msg.guild.members.cache.filter(
      m => ["online", "idle", "dnd"].includes(m.presence?.status)
    ).size;
    return msg.reply(`🟢 ${count} member sedang aktif (online/idle/dnd).`);
  }

  if (msg.content === "!sync") {
    await msg.guild.members.fetch({ withPresences: true });
    await updateVoice(msg.guild);
    return msg.reply("✅ Voice channel diperbarui!");
  }
});

// ⏱️ Update otomatis saat member online/offline
bot.on("presenceUpdate", async (_oldPresence, newPresence) => {
  if (!newPresence.guild) return;
  await updateVoice(newPresence.guild);
});

// Juga update saat member join/leave voice channel
bot.on("voiceStateUpdate", (_oldState, newState) => {
  updateVoice(newState.guild);
});

bot.login(process.env.TOKEN);
