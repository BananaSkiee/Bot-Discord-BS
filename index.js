// Akira Bot - Update jumlah member online otomatis (online, idle, dnd)

const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

// ID voice channel yang mau diubah namanya
const VOICE_CHANNEL_ID = "1366854862608007329";

// Buat web server biar Railway tetap hidup
const app = express();
app.get("/", (_, res) => res.send("Akira aktif 24/7!"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Web server aktif"));

// Buat bot client
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

// Fungsi untuk update jumlah online
async function updateVoiceChannel(guild) {
  try {
    await guild.members.fetch({ withPresences: true }); // Ambil semua member dengan presence (status)

    const count = guild.members.cache.filter(m =>
      m.presence &&
      ["online", "idle", "dnd"].includes(m.presence.status) &&
      !m.user.bot
    ).size;

    const channel = guild.channels.cache.get(VOICE_CHANNEL_ID);
    if (channel && channel.isVoiceBased()) {
      await channel.setName(`「 Online: ${count} 」`);
      console.log(`✅ Update channel: Online: ${count}`);
    } else {
      console.warn("⚠️ Channel tidak ditemukan atau bukan voice.");
    }
  } catch (err) {
    console.error("❌ Gagal update:", err);
  }
}

// Saat bot online
bot.on("ready", () => {
  console.log(`🤖 Akira login sebagai ${bot.user.tag}`);
  const guild = bot.guilds.cache.first();
  if (guild) updateVoiceChannel(guild);
});

// Saat status member berubah
bot.on("presenceUpdate", async (_oldPresence, newPresence) => {
  if (newPresence.guild) {
    updateVoiceChannel(newPresence.guild);
  }
});

bot.login(process.env.TOKEN); // Isi TOKEN dari environment Railway
