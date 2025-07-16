const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
} = require("@discordjs/voice");

const VC_ID = "1355194643754778644"; // Ganti sesuai ID VC kamu
const STREAM_URL = "https://reyfm.stream37.radiohost.de/reyfm-lofi_mp3-128";

module.exports = (client) => {
  client.once("ready", async () => {
    try {
      const channel = await client.channels.fetch(VC_ID);
      if (!channel || channel.type !== 2) {
        return console.error("❌ Voice channel tidak ditemukan atau bukan VC.");
      }

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play,
        },
      });

      const resource = createAudioResource(STREAM_URL);
      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Playing, () => {
        console.log("🎶 Lofi ReyFM sedang diputar!");
      });

      player.on("error", (err) => {
        console.error("❌ Error audio:", err.message);
      });

      player.on(AudioPlayerStatus.Idle, () => {
        console.log("🔁 Stream idle, coba restart...");
        player.play(createAudioResource(STREAM_URL));
      });
    } catch (err) {
      console.error("❌ Gagal join VC atau memutar audio:", err.message);
    }
  });
};
