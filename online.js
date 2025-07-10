const cron = require("node-cron");
const { GatewayIntentBits } = require("discord.js");

module.exports = (bot) => {
  const VOICE_CHANNEL_ID = "1366854862608007329";

  // subscribe intents jika belum
  bot.intentKeys = [GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences];

  // setelah bot siap
  bot.on("ready", () => {
    console.log("🔁 Online feature siap");
    updateOnlineCount(bot);
    cron.schedule("*/6 * * * *", () => updateOnlineCount(bot));
  });
};

async function updateOnlineCount(bot) {
  const guild = bot.guilds.cache.first();
  if (!guild) return;
  await guild.members.fetch();
  const count = guild.members.cache.filter(m =>
    m.presence && ["online", "idle", "dnd"].includes(m.presence.status)
  ).size;

  const channel = guild.channels.cache.get("1366854862608007329");
  if (channel && channel.isVoiceBased()) {
    channel.setName(`「 Online: ${count} 」`)
      .then(() => console.log(`✅ Voice channel diubah → Online: ${count}`))
      .catch(console.error);
  }
}
