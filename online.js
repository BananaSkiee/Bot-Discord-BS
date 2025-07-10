const config = require("./config");

module.exports = async function updateOnline(guild) {
  try {
    await guild.members.fetch({ withPresences: true });

    const onlineCount = guild.members.cache.filter(
      (m) =>
        !m.user.bot &&
        ["online", "idle", "dnd"].includes(m.presence?.status)
    ).size;

    const channel = guild.channels.cache.get(config.voiceChannelId);
    if (channel && channel.isVoiceBased()) {
      await channel.setName(`「 Online: ${onlineCount} 」`);
      console.log(`✅ Channel rename → Online: ${onlineCount}`);
    } else {
      console.warn("⚠️ Channel tidak ditemukan atau bukan voice.");
    }
  } catch (err) {
    console.error("❌ Gagal update:", err.message);
  }
};
