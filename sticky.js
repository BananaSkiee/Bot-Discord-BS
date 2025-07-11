module.exports = (client) => {
  const stickyMessages = new Map();

  client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;

    const stickyData = stickyMessages.get(message.channel.id);
    if (!stickyData) return;

    // Hapus sticky sebelumnya
    if (stickyData.lastMessageId) {
      try {
        const oldMsg = await message.channel.messages.fetch(stickyData.lastMessageId);
        await oldMsg.delete();
      } catch (e) {}
    }

    // Kirim ulang sticky message
    const sent = await message.channel.send(stickyData.content);
    stickyData.lastMessageId = sent.id;
  });

  client.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return;
    if (!message.member.permissions.has('ManageMessages')) return;

    if (message.content.startsWith('!setsticky')) {
      const args = message.content.slice('!setsticky'.length).trim();
      if (!args) return message.reply('❌ Masukkan isi sticky message-nya.');

      stickyMessages.set(message.channel.id, {
        content: args,
        lastMessageId: null
      });

      message.reply('✅ Sticky message telah disetel.');
    }

    if (message.content.startsWith('!removesticky')) {
      stickyMessages.delete(message.channel.id);
      message.reply('🗑️ Sticky message dihapus.');
    }
  });
};
