const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async function sendTicketButton(channel) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("🎫 Buka Ticket")
      .setStyle(ButtonStyle.Primary)
  );

  channel.send({
    content: "**Butuh bantuan? Klik tombol di bawah untuk buka ticket.**",
    components: [row]
  });
};
