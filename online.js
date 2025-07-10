module.exports = (client) => {
  const channelId = '1366854862608007329';

  async function updateVoiceChannel(guild) {
    await guild.members.fetch();
    const onlineCount = guild.members.cache.filter(
      m => !m.user.bot && ['online', 'idle', 'dnd'].includes(m.presence?.status)
    ).size;

    const channel = guild.channels.cache.get(channelId);
    if (channel) {
      await channel.setName(`「 Online: ${onlineCount} 」`);
      console.log(`✅ Channel rename → Online: ${onlineCount}`);
    }
  }

  client.on('ready', async () => {
    const guild = client.guilds.cache.first();
    if (guild) {
      await updateVoiceChannel(guild);
      setInterval(() => updateVoiceChannel(guild), 60 * 1000); // per menit
    }
  });

  client.on('presenceUpdate', async () => {
    const guild = client.guilds.cache.first();
    if (guild) await updateVoiceChannel(guild);
  });
};
