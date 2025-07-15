const { ChannelType, PermissionFlagsBits } = require("discord.js");

const TICKET_CATEGORY_ID = "1354116735594266644"; // Kategori aktif
const ARCHIVE_CATEGORY_ID = "1354119154042404926"; // Kategori arsip

module.exports = async function handleTicketInteraction(interaction) {
  const user = interaction.user;
  const guild = interaction.guild;
  const username = user.username.toLowerCase();

  const existingChannel = guild.channels.cache.find(
    c => c.name === `ticket-${username}` && c.type === ChannelType.GuildText
  );

  if (existingChannel) {
    return interaction.reply({
      content: `❌ Kamu sudah punya tiket terbuka: <#${existingChannel.id}>`,
      ephemeral: true,
    });
  }

  const ticketChannel = await guild.channels.create({
    name: `ticket-${username}`,
    type: ChannelType.GuildText,
    parent: TICKET_CATEGORY_ID,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
    ],
  });

  await ticketChannel.send({
    content: `🎫 Halo <@${user.id}>! Silakan jelaskan masalah kamu di sini.\nKlik tombol di bawah ini untuk menutup tiket jika sudah selesai.`,
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 4,
            custom_id: "close_ticket",
            label: "❌ Close Ticket",
          },
        ],
      },
    ],
  });

  await interaction.reply({
    content: `✅ Tiket kamu telah dibuka di: <#${ticketChannel.id}>`,
    ephemeral: true,
  });
};
