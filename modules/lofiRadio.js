const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const VC_ID = "1355194643754778644"; // ✅ ID VC kamu
const Lofi_URL = "https://www.youtube.com/watch?v=jfKfPfyJRdk"; // ✅ Lofi Girl Live

module.exports = async (client) => {
  try {
    const channel = await client.channels.fetch(VC_ID);
    if (!channel || channel.type !== 2) {
      console.log("❌ Voice Channel tidak ditemukan atau bukan tipe voice.");
      return;
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    const stream = ytdl(Lofi_URL, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    });

    const resource = createAudioResource(stream);
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    });

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Playing, () => {
      console.log("🎵 Lofi radio mulai diputar di voice channel.");
    });

    player.on("error", (error) => {
      console.error("❌ Error audio player:", error.message);
    });

    player.on(AudioPlayerStatus.Idle, () => {
      console.log("🔁 Restarting stream...");
      module.exports(client); // restart kalau stream selesai
    });
  } catch (err) {
    console.error("❌ Gagal join VC atau stream:", err.message);
  }
};
