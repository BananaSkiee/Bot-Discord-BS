const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const VOICE_CHANNEL_ID = "1366854862608007329";

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

const app = express();
app.get("/", (_, res) => res.send("Akira aktif 24/7!"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Server aktif"));

async function updateOnlineCount(guild) {
  try {
    await guild.members.fetch({ withPresences: true });

    const onlineCount = guild.members.cache.filter(member =>
      member.presence && ["online", "idle", "dnd"].includes(member.presence.status) && !member.user.bot
    ).size;

    const channel = guild.channels.cache.get(VOICE_CHANNEL_ID);
    if (channel && channel.isVoiceBased()) {
      await channel.setName(`「 Online: ${onlineCount} 」`);
      console.log(`✅ Voice channel diupdate: ${onlineCount}`);
    }
  } catch (err) {
    console.error("❌ ERROR update:", err);
  }
}

bot.on("ready", () => {
  console.log(`🤖 Akira login sebagai ${bot.user.tag}`);
  const guild = bot.guilds.cache.first();
  if (guild) updateOnlineCount(guild);
});

bot.on("presenceUpdate", async (_, newPresence) => {
  const guild = newPresence.guild;
  if (guild) updateOnlineCount(guild);
});

bot.login(process.env.TOKEN);
