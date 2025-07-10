// online.js — fitur update nama voice otomatis
const VOICE_CHANNEL_ID = "1366854862608007329";

module.exports = (bot) => {
  bot.on("ready", () => {
    const guild = bot.guilds.cache.first();
    if (guild) updateVoice(guild);
  });

  bot.on("voiceStateUpdate", (oldS, newS) => {
    if (oldS.channelId === VOICE_CHANNEL_ID || newS.channelId === VOICE_CHANNEL_ID) {
      updateVoice(newS.guild);
    }
  });

  bot.on("presenceUpdate", (_, newP) => {
    if (newP.guild) updateVoice(newP.guild);
  });

  bot.on("messageCreate", async (msg) => {
    if (msg.content === "!ping") msg.reply("Pong! Aku online 😎");
    if (msg.content === "!sync") {
      updateVoice(msg.guild);
      msg.reply("✅ Voice channel diperbarui!");
    }
  });
};

async function updateVoice(guild) {
  const ch = guild.channels.cache.get(VOICE_CHANNEL_ID);
  if (!ch?.isVoiceBased()) return;
  await guild.members.fetch();
  const count = ch.members.filter(m =>
    ["online", "idle", "dnd"].includes(m.presence?.status)
  ).size;
  ch.setName(`「 Online: ${count} 」`).catch(console.error);
}
