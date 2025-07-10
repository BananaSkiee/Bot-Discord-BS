// Akira Bot: Update otomatis jumlah member online (online, idle, dnd)
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const VOICE_CHANNEL_ID = "1366854862608007329";

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
  ]
});

// Web server agar Railway tetap hidup
const app = express();
app.get("/", (_, res) => res.send("Akira bot aktif 24/7!"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Server aktif"));

async function updateVoice(guild) {
  if (!guild) return;
  const ch = guild.channels.cache.get(VOICE_CHANNEL_ID);
  if (!ch?.isVoiceBased()) return;

  try {
    await guild.members.fetch({ withPresences: true });

    const count = guild.members.cache.filter(m =>
      m.presence && ["online", "idle", "dnd"].includes(m.presence.status)
    ).size;

    await ch.setName(`「 Online: ${count} 」`);
    console.log(`✅ Voice channel diperbarui → Online: ${count}`);
  } catch (err) {
    console.error("❌ Gagal update channel:", err);
  }
}

bot.on("ready", () => {
  console.log(`🤖 Akira login sebagai ${bot.user.tag}`);
  const guild = bot.guilds.cache.first();
  if (guild) updateVoice(guild);
});

// Oto update saat presence berubah
bot.on("presenceUpdate", async (_, newPresence) => {
  if (!newPresence.guild) return;
  await updateVoice(newPresence.guild);
});

// Command manual (opsional)
bot.on("messageCreate", async msg => {
  if (msg.author.bot) return;

  if (msg.content === "!online") {
    await msg.guild.members.fetch({ withPresences: true });
    const count = msg.guild.members.cache.filter(
      m => m.presence && ["online", "idle", "dnd"].includes(m.presence.status)
    ).size;
    msg.reply(`🟢 ${count} member sedang aktif (online/idle/dnd).`);
  }

  if (msg.content === "!ping") {
    msg.reply("Pong! Aku online 😎");
  }
});

bot.login(process.env.TOKEN);
