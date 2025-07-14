const { PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async function handleTicketInteraction(interaction) {
  const guild = interaction.guild;
  const user = interaction.user;

  // Cek apakah user sudah punya tiket
  const existing = guild.channels.cache.find(c =>
    c.type === ChannelType.GuildText &&
    c.name.startsWith("ticket-") &&
    c.topic === user.id
  );
  if (existing) {
    return interaction.reply({
      content: `❗ Kamu sudah punya ticket: <#${existing.id}>`,
      ephemeral: true,
    });
  }

  // Buat channel baru
  const ticketChannel = await guild.channels.create({
    name: `ticket-${user.username}`,
    type: ChannelType.GuildText,
    topic: user.id,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
    ],
  });

  // Kirim pesan sambutan + tombol Close Ticket
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("❌ Close Ticket")
      .setStyle(ButtonStyle.Danger)
  );

  await ticketChannel.send({
    content: `🎟️ Halo <@${user.id}>, silakan jelaskan masalah kamu di sini.`,
    components: [row],
  });

  await interaction.reply({
    content: `✅ Ticket dibuat: <#${ticketChannel.id}>`,
    ephemeral: true,
  });
};
