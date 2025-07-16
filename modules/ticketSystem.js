// modules/ticketSystem.js
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");

const TICKET_CATEGORY_ID = "1354116735594266644"; // Aktif
const ARCHIVE_CATEGORY_ID = "1354119154042404926"; // Arsip

module.exports = async function handleTicketInteraction(interaction) {
  const user = interaction.user;
  const guild = interaction.guild;

  await interaction.deferReply({ ephemeral: true }); // FIXED: untuk "This interaction failed"

  // Cek apakah user sudah punya channel dengan topic "user:ID"
  const existingChannel = guild.channels.cache.find(
    ch =>
      ch.type === ChannelType.GuildText &&
      ch.topic === `user:${user.id}` &&
      ch.parentId === TICKET_CATEGORY_ID
  );

  if (existingChannel) {
    // Periksa apakah user masih bisa lihat channelnya
    const perms = existingChannel.permissionsFor(user.id);
    const canSee = perms?.has("ViewChannel");

    if (!canSee) {
      await existingChannel.permissionOverwrites.edit(user.id, {
        ViewChannel: true,
        SendMessages: true,
      });

      return interaction.editReply({
        content: `✅ Tiket lama kamu telah dibuka kembali: <#${existingChannel.id}>`,
      });
    }

    return interaction.editReply({
      content: `❌ Kamu sudah punya tiket terbuka: <#${existingChannel.id}>`,
    });
  }

  // Bikin channel tiket baru
  const ticketChannel = await guild.channels.create({
    name: `ticket-${user.username.toLowerCase()}`,
    type: ChannelType.GuildText,
    parent: TICKET_CATEGORY_ID,
    topic: `user:${user.id}`, // FIXED: ini jadi cara kita lacak tiket
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] },
    ],
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("❌ Tutup")
      .setStyle(ButtonStyle.Danger)
  );

  await ticketChannel.send({
    content: `🎫 Halo <@${user.id}>! Silakan jelaskan masalah kamu di sini.\nKlik tombol di bawah ini jika ingin menutup tiket.`,
    components: [row],
  });

  await interaction.editReply({
    content: `✅ Tiket kamu telah dibuat di <#${ticketChannel.id}>`,
  });
};
