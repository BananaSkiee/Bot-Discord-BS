const config = require("./config");

/**
 * Fungsi untuk update nama voice channel dengan jumlah anggota online.
 */
module.exports = async function updateOnline(guild) {
  try {
    // Fetch semua member biar data presence lengkap
    await guild.members.fetch({ withPresences: true });

    // Hitung member yang online, idle, atau dnd
    const onlineCount = guild.members.cache.filter(
      m =>
        !m.user.bot &&
        ["online", "idle", "dnd"].includes(m.presence?.status)
    ).size;

    // Ambil voice channel dari config
    const channel = guild.channels.cache.get(config.voiceChannelId);

    // Update nama voice channel
    if (channel && channel.isVoiceBased()) {
      await channel.setName(`「 Online: ${onlineCount} 」`);
      console.log(`✅ Channel rename → Online: ${onlineCount}`);
    } else {
      console.warn("⚠️ Channel tidak ditemukan atau bukan voice.");
    }

  } catch (error) {
    console.error("❌ Gagal update voice channel:", error.message);
  }
};
