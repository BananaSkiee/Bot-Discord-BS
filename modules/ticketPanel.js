const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async function sendTicketPanel(channel) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("🎫 Buka Tiket")
      .setStyle(ButtonStyle.Primary)
  );

  await channel.send({
    content: "📩 Klik tombol di bawah ini untuk membuka tiket.",
    components: [row],
  });
};
