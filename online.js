const config = require("./config");

module.exports = async function updateOnline(guild) {
  try {
    await guild.members.fetch({ withPresences: true });

    const count = guild.members.cache.filter(
      m => m.presence && ["online", "idle", "dnd"].includes(m.presence.status) && !m.user.bot
    ).size;

    const channel = guild.channels.cache.get(config.voiceChannelId);
    if (channel && channel.isVoiceBased()) {
      await channel.setName(`「 Online: ${count} 」`);
      console.log(`✅ Voice channel updated: Online: ${count}`);
    }
  } catch (err) {
    console.error("❌ Failed to update online:", err.message);
  }
};
