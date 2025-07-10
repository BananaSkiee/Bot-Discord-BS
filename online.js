// features/online.js

// ID dari voice channel yang ingin diubah namanya
const VOICE_CHANNEL_ID = "1366854862608007329";

module.exports = (bot) => {
  // Saat bot siap, langsung update sekali
  bot.on("ready", () => {
    const guild = bot.guilds.cache.first();
    if (guild) updateVoiceName(guild);
  });

  // Ketika ada member join/leave/move dari voice channel target
  bot.on("voiceStateUpdate", (oldState, newState) => {
    // Cek kalau berganti dari/ke channel target
    if (
      oldState.channelId === VOICE_CHANNEL_ID ||
      newState.channelId === VOICE_CHANNEL_ID
    ) {
      updateVoiceName(newState.guild);
    }
  });

  // Ketika status presence member berubah (online/idle/dnd/offline)
  bot.on("presenceUpdate", (_oldPres, newPres) => {
    if (newPres.guild) updateVoiceName(newPres.guild);
  });

  // Tambahkan command manual untuk pengecekan
  bot.on("messageCreate", async (msg) => {
    if (msg.content === "!ping") {
      msg.reply("Pong! Aku online 😎");
    }
    if (msg.content === "!sync") {
      await updateVoiceName(msg.guild);
      msg.reply("✅ Voice channel diperbarui manual!");
    }
  });
};

// Fungsi inti: update nama channel voice
async function updateVoiceName(guild) {
  const ch = guild.channels.cache.get(VOICE_CHANNEL_ID);
  if (!ch || !ch.isVoiceBased()) return;

  await guild.members.fetch(); // pastikan data aktual
  const count = ch.members.filter((m) =>
    ["online", "idle", "dnd"].includes(m.presence?.status)
  ).size;

  try {
    await ch.setName(`「 Online: ${count} 」`);
    console.log(`✅ Voice channel rename → Online: ${count}`);
  } catch (err) {
    console.error("❌ Gagal ganti nama channel:", err);
  }
}
