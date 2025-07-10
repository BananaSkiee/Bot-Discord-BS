module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.content.toLowerCase() === '!createvoice') {
      const guild = message.guild;

      try {
        // Buat channel voice baru
        const newVoiceChannel = await guild.channels.create({
          name: 'Online Members',
          type: 2, // 2 = GUILD_VOICE (pakai angka di v14)
          reason: 'Channel voice untuk jumlah anggota online',
        });

        message.reply(`✅ Voice channel telah dibuat: ${newVoiceChannel.name}`);

        // Fungsi hitung member online
        const updateOnlineCount = async () => {
          await guild.members.fetch({ withPresences: true });

          const count = guild.members.cache.filter(member =>
            member.presence &&
            ['online', 'idle', 'dnd'].includes(member.presence.status) &&
            !member.user.bot
          ).size;

          await newVoiceChannel.setName(`「 Online: ${count} 」`);
          console.log(`✅ Updated: Online: ${count}`);
        };

        // Update pertama kali
        await updateOnlineCount();

        // Update otomatis saat presence berubah
        client.on('presenceUpdate', async () => {
          await updateOnlineCount();
        });

      } catch (err) {
        console.error('❌ Gagal membuat channel:', err);
        message.reply('❌ Gagal membuat voice channel.');
      }
    }
  });
};
