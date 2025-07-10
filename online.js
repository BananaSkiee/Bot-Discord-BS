const VOICE_CHANNEL_ID = "1366854862608007329";

module.exports = async function updateVoice(guild) {
  const ch = guild.channels.cache.get(VOICE_CHANNEL_ID);
  if (!ch?.isVoiceBased()) return;

  await guild.members.fetch({ withPresences: true });
  const count = guild.members.cache.filter(m =>
    ["online", "idle", "dnd"].includes(m.presence?.status)
  ).size;

  try {
    await ch.setName(`「 Online: ${count} 」`);
    console.log(`✅ Channel rename → Online: ${count}`);
  } catch (err) {
    console.error("❌ Gagal ganti nama channel:", err);
  }
};
