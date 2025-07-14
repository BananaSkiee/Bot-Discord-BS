const { ChannelType, PermissionFlagsBits } = require("discord.js");

const TICKET_CATEGORY_ID = "1354116735594266644";      // Kategori tiket aktif
const ARCHIVE_CATEGORY_ID = "1354119154042404926";     // Kategori tiket arsip

module.exports = async function handleTicketInteraction(interaction) {
  const user = interaction.user;
  const guild = interaction.guild;

  // Cek apakah user sudah punya channel tiket
  const existingChannel = guild.channels.cache.find(
    c =>
      c.name === `ticket-${user.username.toLowerCase()}` &&
      c.type === ChannelType.GuildText
  );

  if (existingChannel) {
    return interaction.reply({
      content: "❌ Kamu sudah punya tiket terbuka: <#" + existingChannel.id + ">",
      ephemeral: true,
    });
  }

  // Buat channel tiket baru
  const ticketChannel = await guild.channels.create({
    name: `ticket-${user.username.toLowerCase()}`,
    type: ChannelType.GuildText,
    parent: TICKET_CATEGORY_ID,
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
      {
        id: interaction.client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageChannels,
        ],
      },
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
