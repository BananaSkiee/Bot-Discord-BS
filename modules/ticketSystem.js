const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async function handleTicketInteraction(interaction) {
  const user = interaction.user;
  const guild = interaction.guild;

  const existing = guild.channels.cache.find(c => c.name === `ticket-${user.id}`);
  if (existing) {
    return interaction.reply({ content: `❌ Kamu sudah punya ticket aktif: <#${existing.id}>`, ephemeral: true });
  }

  const channel = await guild.channels.create({
    name: `ticket-${user.id}`,
    type: ChannelType.GuildText,
    parent: null, // opsional: masukin ID kategori kalau mau
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: "1352279577174605884", // Ganti dengan ID role admin/mod
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
    ],
  });

  await channel.send({
    content: `🎫 Halo <@${user.id}>! Silakan jelaskan masalah atau pertanyaan kamu. Staff akan segera membantu.`,
  });

  interaction.reply({ content: `✅ Ticket dibuat: <#${channel.id}>`, ephemeral: true });
    }
