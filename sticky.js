const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  const stickyMessages = new Map();
  const cooldowns = new Map();
  const COOLDOWN_TIME = 10000; // 10 detik cooldown

  client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;

    // ✅ Command sticky (hanya admin/mod)
    if (message.member?.permissions.has("ManageMessages")) {
      if (message.content.startsWith("!setsticky")) {
        const args = message.content.slice("!setsticky".length).trim();
        if (!args) {
          return message.reply("❌ Masukkan pesan sticky-nya setelah !setsticky")
            .then(msg => setTimeout(() => msg.delete(), 5000));
        }

        // Hapus pesan command
        await message.delete().catch(() => {});

        // Kirim pesan sticky pertama kali
        const embed = new EmbedBuilder()
          .setDescription(args)
          .setColor("#2b2d31")
          .setFooter({ text: "📌 STICKY MESSAGE" });

        const sent = await message.channel.send({ embeds: [embed] });
        
        stickyMessages.set(message.channel.id, {
          content: args,
          lastMessageId: sent.id
        });

        return message.reply("✅ Sticky message berhasil disetel!")
          .then(msg => setTimeout(() => msg.delete(), 5000));
      }

      if (message.content.startsWith("!removesticky")) {
        const stickyData = stickyMessages.get(message.channel.id);
        if (stickyData?.lastMessageId) {
          try {
            const oldMsg = await message.channel.messages.fetch(stickyData.lastMessageId);
            await oldMsg.delete();
          } catch (err) {
            console.error("Gagal menghapus sticky lama:", err);
          }
        }
        stickyMessages.delete(message.channel.id);
        cooldowns.delete(message.channel.id);
        return message.reply("🗑️ Sticky message dihapus!")
          .then(msg => setTimeout(() => msg.delete(), 5000));
      }
    }

    // ✅ Jalankan sticky (kalau ada)
    const stickyData = stickyMessages.get(message.channel.id);
    if (!stickyData) return;

    // Cek cooldown
    const lastUpdate = cooldowns.get(message.channel.id) || 0;
    if (Date.now() - lastUpdate < COOLDOWN_TIME) return;

    try {
      // Hapus pesan sticky sebelumnya
      if (stickyData.lastMessageId) {
        try {
          const oldMsg = await message.channel.messages.fetch(stickyData.lastMessageId);
          await oldMsg.delete();
        } catch (err) {
          // Pesan mungkin sudah dihapus, lanjutkan
        }
      }

      // Kirim sticky baru dengan embed
      const embed = new EmbedBuilder()
        .setDescription(stickyData.content)
        .setColor("#2b2d31")
        .setFooter({ text: "📌 STICKY MESSAGE" });

      const sent = await message.channel.send({ embeds: [embed] });
      stickyData.lastMessageId = sent.id;
      cooldowns.set(message.channel.id, Date.now());

    } catch (err) {
      console.error("Error updating sticky message:", err);
    }
  });
};
