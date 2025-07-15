// modules/ticketButtons.js
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

const TICKET_CATEGORY_ID = "1354116735594266644"; // kategori aktif
const ARCHIVE_CATEGORY_ID = "1354119154042404926"; // kategori arsip

module.exports = async function handleTicketButtons(interaction) {
  const channel = interaction.channel;
  const guild = interaction.guild;
  const client = interaction.client;

  const match = (channel.topic || "").match(/user:(\d+)/);
  const userId = match?.[1];

  if (!userId) {
    return interaction.reply({ content: "❌ Tidak ditemukan pemilik tiket.", ephemeral: true });
  }

  const username = interaction.user.username;

  if (interaction.customId === "close_ticket") {
    await interaction.reply({ content: "📦 Tiket akan diarsipkan dalam 5 detik...", ephemeral: true });

    setTimeout(async () => {
      await channel.setParent(ARCHIVE_CATEGORY_ID, { lockPermissions: false });
      await channel.setName(channel.name.replace("ticket-", "closed-"));
      await channel.permissionOverwrites.edit(userId, {
        ViewChannel: false,
        SendMessages: false,
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("reopen_ticket").setLabel("🔓 Open Ticket").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("delete_ticket").setLabel("🗑️ Delete Ticket").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("save_transcript").setLabel("📋 Salin atau Edit").setStyle(ButtonStyle.Secondary)
      );

      const tombolBaru = await channel.send({
        content: "📦 Tiket telah diarsipkan.",
        components: [row],
      });

      const messages = await channel.messages.fetch({ limit: 10 });
      for (const msg of messages.values()) {
        if (
          msg.id !== tombolBaru.id &&
          msg.author.id === client.user.id &&
          msg.components.length > 0
        ) {
          await msg.edit({ components: [] }).catch(() => {});
        }
      }
    }, 5000);
  }

  if (interaction.customId === "reopen_ticket") {
    const user = await guild.members.fetch(userId).catch(() => null);
    if (!user) return interaction.reply({ content: "❌ User tidak ditemukan.", ephemeral: true });

    await interaction.deferReply({ ephemeral: true });
    await channel.setParent(TICKET_CATEGORY_ID, { lockPermissions: false });
    await channel.setName(`ticket-${user.user.username.toLowerCase()}`);
    await channel.permissionOverwrites.edit(userId, {
      ViewChannel: true,
      SendMessages: true,
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("close_ticket").setLabel("❌ Close Ticket").setStyle(ButtonStyle.Danger)
    );

    await channel.send({ content: `🔓 Tiket dibuka kembali oleh <@${interaction.user.id}>.`, components: [row] });
    await interaction.editReply({ content: "✅ Tiket berhasil dibuka ulang." });
  }

  if (interaction.customId === "delete_ticket") {
    await interaction.reply({ content: "🗑️ Menghapus tiket...", ephemeral: true });
    setTimeout(() => {
      channel.delete().catch(() => {});
    }, 2000);
  }

  if (interaction.customId === "save_transcript") {
    return interaction.reply({
      content: "📋 Fitur salin/edit transcript belum dibuat.",
      ephemeral: true,
    });
  }
};
