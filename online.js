const config = require("./config");

module.exports = async function updateOnline(guild) {
  try {
    await guild.members.fetch({ withPresences: true });

    const count = guild.members.cache.filter(m =>
      m.presence &&
      ["online", "idle", "dnd"].includes(m.presence.status) &&
      !m.user.bot
    ).size;

    const channel = guild.channels.cache.get(config.voiceChannelId);
    if (channel && channel.isVoiceBased()) {
      await channel.setName(`「 Online: ${count} 」`);
      console.log(`✅ Channel diupdate jadi: Online: ${count}`);
    } else {
      console.warn("⚠️ Channel voice tidak ditemukan atau bukan voice channel.");
    }
  } catch (err) {
    console.error("❌ Gagal update:", err.message);
  }
};
