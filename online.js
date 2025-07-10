const VOICE_CHANNEL_ID = "1366854862608007329";

module.exports = async function updateVoice(guild) {
  const ch = guild.channels.cache.get(VOICE_CHANNEL_ID);
  if (!ch?.isVoiceBased()) return;
  await guild.members.fetch();
  const count = ch.members.filter(m =>
    ["online", "idle", "dnd"].includes(m.presence?.status)
  ).size;
  try {
    await ch.setName(`「 Online: ${count} 」`);
    console.log(`✅ Voice channel rename → Online: ${count}`);
  } catch (e) {
    console.error("❌ Gagal ganti nama channel:", e);
  }
};
