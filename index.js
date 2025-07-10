
// Web server untuk menjaga Railway tetap hidup
const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Akira bot online!"));
app.listen(process.env.PORT || 3000, () => {
  console.log("ðŸŒ Web server aktif untuk keep-alive");
});

// Bot Discord
const { Client, GatewayIntentBits } = require("discord.js");
const cron = require("node-cron");

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

const VOICE_CHANNEL_ID = "1366854862608007329"; // ID channel voice kamu

bot.on("ready", () => {
  console.log(`ðŸ¤– Akira siap sebagai ${bot.user.tag}`);
});

bot.on("messageCreate", async (msg) => {
  if (msg.content === "!ping") {
    msg.reply("Pong! Aku online ðŸ˜Ž");
  }

  if (msg.content === "!sync") {
    const guild = msg.guild;
    await guild.members.fetch();
    const onlineMembers = guild.members.cache.filter(
      m => m.presence && ["online", "idle", "dnd"].includes(m.presence.status)
    );
    const channel = guild.channels.cache.get(VOICE_CHANNEL_ID);
    if (channel) {
      channel.setName(`ã€Œ Online: ${onlineMembers.size} ã€`);
      msg.reply("âœ… Nama voice channel diperbarui!");
    }
  }
});

// Auto-update nama voice channel tiap 1 menit
cron.schedule("*/1 * * * *", async () => {
  const guild = bot.guilds.cache.first();
  if (!guild) return;
  await guild.members.fetch();
  const onlineMembers = guild.members.cache.filter(
    m => m.presence && ["online", "idle", "dnd"].includes(m.presence.status)
  );

  const channel = guild.channels.cache.get(VOICE_CHANNEL_ID);
  if (channel) {
    channel.setName(`ã€Œ Online: ${onlineMembers.size} ã€`)
      .then(() => console.log(`âœ… Nama channel diupdate jadi: Online: ${onlineMembers.size}`))
      .catch(console.error);
  }
});

bot.login(process.env.TOKEN);
