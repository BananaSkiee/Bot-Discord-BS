const { joinVoiceChannel } = require("@discordjs/voice");

module.exports = async (client) => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const channel = guild.channels.cache.get(process.env.VC_ID);

  if (!channel || channel.type !== 2) {
    return console.error("❌ Voice channel tidak ditemukan atau bukan voice channel biasa.");
  }

  joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: false,
  });

  console.log(`🔊 Akira telah join ke voice channel: ${channel.name}`);
};
