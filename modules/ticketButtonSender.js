const { ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const TICKET_CHANNEL_ID = "1354077866895347772"; // Ganti dengan ID channel tiket kamu

module.exports = async function sendTicketButton(client) {
  const ticketChannel = client.channels.cache.get(TICKET_CHANNEL_ID);

  if (!ticketChannel || ticketChannel.type !== ChannelType.GuildText) {
    return console.warn("❌ Channel tiket tidak ditemukan atau bukan teks.");
  }

  // Hapus pesan lama dari bot (opsional)
  const messages = await ticketChannel.messages.fetch({ limit: 20 }).catch(() => null);
  const botMessages = messages?.filter(msg => msg.author.id === client.user.id);
  for (const msg of botMessages.values()) {
    await msg.delete().catch(console.error);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("🎫 Open Ticket")
      .setStyle(ButtonStyle.Primary)
  );

  await ticketChannel.send({
    content: "🛠️ Klik tombol di bawah untuk membuka tiket bantuan.",
    components: [row],
  });
};
