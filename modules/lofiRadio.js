const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const VC_ID = "1355194643754778644"; // ganti ini

const Lofi_URL = "https://www.youtube.com/watch?v=jfKfPfyJRdk"; // lofi chill radio - beats to relax/study to

module.exports = async (client) => {
  try {
    const channel = await client.channels.fetch(VC_ID);
    if (!channel || channel.type !== 2) return console.error("❌ Voice channel tidak ditemukan.");

    const connection = joinVoiceChannel({
      channelId: VC_ID,
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

    player.on(AudioPlayerStatus.Idle, () => {
      console.log("🔁 Restarting lofi stream...");
      require("./lofiRadio")(client); // Restart ulang saat stream selesai
    });

    console.log("🎶 Bot lofi radio siap dan nyala!");
  } catch (err) {
    console.error("❌ Gagal nyalain lofi radio:", err);
  }
};
