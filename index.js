// index.js — Bot Akira dengan fitur online member

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
  if (!guild) throw "Guild tidak ditemukan";
  const ch = guild.channels.cache.get(VOICE_CHANNEL_ID);
  if (!ch?.isVoiceBased()) throw "Channel voice tidak valid";

  await guild.members.fetch({ withPresences: true });  // penting agar presence tersedia 6
  const count = guild.members.cache.filter(m =>
    ["online","idle","dnd"].includes(m.presence?.status)
  ).size;

  await ch.setName(`「 Online: ${count} 」`);
  console.log(`✅ Channel rename → Online: ${count}`);
}

const app = express();
app.get("/", (_req, res) => res.send("Bot Akira aktif!"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Server alive"));

bot.on("ready", () => {
  console.log(`🤖 Bot siap sebagai ${bot.user.tag}`);
  updateVoice(bot.guilds.cache.first()).catch(console.error);
});

bot.on("messageCreate", async msg => {
  if (msg.author.bot) return;

  if (msg.content === "!ping") {
    console.log("DEBUG: ping");
    return msg.reply("Pong! Aku online 😎");
  }

  if (msg.content === "!online") {
    console.log("DEBUG: online command");
    await msg.guild.members.fetch({ withPresences: true });
    const count = msg.guild.members.cache.filter(m =>
      ["online","idle","dnd"].includes(m.presence?.status)
    ).size;
    console.log("DEBUG: online count =", count);
    return msg.reply(`🟢 Ada ${count} member aktif (online/idle/dnd).`);
  }

  if (msg.content === "!sync") {
    console.log("DEBUG: sync command");
    try {
      await msg.guild.members.fetch({ withPresences: true });
      await updateVoice(msg.guild);
      console.log("DEBUG: updateVoice done");
      return msg.reply("✅ Voice channel diperbarui!");
    } catch (e) {
      console.error("⚠️ Error di !sync:", e);
      return msg.reply("❌ Gagal memperbarui voice channel, cek log.");
    }
  }
});

bot.on("voiceStateUpdate", (o, n) => {
  if (o.channelId === VOICE_CHANNEL_ID || n.channelId === VOICE_CHANNEL_ID) {
    updateVoice(n.guild).catch(console.error);
  }
});

bot.on("presenceUpdate", (_oldP, newP) => {
  if (newP.guild) {
    updateVoice(newP.guild).catch(console.error);
  }
});

bot.login(process.env.TOKEN);
