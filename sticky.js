module.exports = (client) => {
  const stickyMessages = new Map();

  client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    const isAdmin = message.member.permissions.has("ManageMessages");

    // ==== 🔧 SET STICKY ====
    if (isAdmin && message.content.startsWith("!setsticky")) {
      const args = message.content.slice("!setsticky".length).trim();
      if (!args)
        return message.reply("❌ Masukkan isi pesan sticky-nya setelah `!setsticky`.");

      stickyMessages.set(message.channel.id, {
        content: args,
        lastMessageId: null,
      });

      return message.reply("✅ Sticky message disetel di channel ini.");
    }

    // ==== 🗑 REMOVE STICKY ====
    if (isAdmin && message.content.startsWith("!removesticky")) {
      if (stickyMessages.has(message.channel.id)) {
        stickyMessages.delete(message.channel.id);
        return message.reply("🗑 Sticky message berhasil dihapus.");
      } else {
        return message.reply("⚠️ Tidak ada sticky message di channel ini.");
      }
    }

    // ==== 🔁 TRIGGER STICKY ====
    const stickyData = stickyMessages.get(message.channel.id);
    if (!stickyData) return;

    // Hapus sticky sebelumnya
    if (stickyData.lastMessageId) {
      try {
        const oldMsg = await message.channel.messages.fetch(
          stickyData.lastMessageId
        );
        await oldMsg.delete();
      } catch (err) {
        // Mungkin sudah dihapus manual, abaikan
      }
    }

    // Kirim ulang sticky
    const sent = await message.channel.send(stickyData.content);
    stickyData.lastMessageId = sent.id;
  });
};
