// modules/ticketButton.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = async function sendTicketButton(channel) {
  const embed = new EmbedBuilder()
    .setTitle("🎫 Tiket")
    .setDescription(
      "Silakan klik di bawah ini untuk bertanya, report, atau lainnya dengan chat privasi.\n**Pastikan chat dengan sopan.**"
    )
    .setColor("Green")
    .setFooter({ text: "TicketTool.xyz – Ticketing without clutter" });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("Open")
      .setStyle(ButtonStyle.Primary)
  );

  await channel.send({ embeds: [embed], components: [row] });
};
