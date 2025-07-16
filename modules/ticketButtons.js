const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const TICKET_CATEGORY_ID = "1354116735594266644";
const ARCHIVE_CATEGORY_ID = "1354119154042404926";
const TRANSCRIPT_CHANNEL_ID = "1394478754297811034";

module.exports = async function handleTicketButtons(interaction) {
  const channel = interaction.channel;
  const guild = interaction.guild;
  const client = interaction.client;

  const match = (channel.topic || "").match(/user:(\d+)/);
  const userId = match?.[1];

  if (!userId) {
    return interaction.reply({ content: "❌ Tidak ditemukan pemilik tiket.", ephemeral: true });
  }

  // Tombol konfirmasi tutup
  if (interaction.customId === "close_ticket") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("confirm_close_ticket").setLabel("✅ Ya").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("cancel_close_ticket").setLabel("❌ Tidak").setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({
      content: "Yakin tutup tiket?",
      components: [row],
      ephemeral: true,
    });
  }

  // Batalkan penutupan
  if (interaction.customId === "cancel_close_ticket") {
    return interaction.update({
      content: "❎ Penutupan tiket dibatalkan.",
      components: [],
    });
  }

  // Konfirmasi penutupan
  if (interaction.customId === "confirm_close_ticket") {
    await interaction.update({
      content: "📦 Tiket ditutup dan diarsipkan.",
      components: [],
    });

    await channel.setParent(ARCHIVE_CATEGORY_ID, { lockPermissions: false });
    await channel.setName(channel.name.replace("ticket-", "closed-"));
    await channel.permissionOverwrites.edit(userId, {
      ViewChannel: false,
      SendMessages: false,
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("reopen_ticket").setLabel("🔓 Buka Lagi").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("delete_ticket").setLabel("🗑️ Hapus").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("save_transcript").setLabel("📋 Salin/Edit").setStyle(ButtonStyle.Secondary)
    );

    await channel.send({ content: "✅ Tiket telah ditutup.", components: [row] });
  }

  // Buka kembali tiket
  if (interaction.customId === "reopen_ticket") {
    const user = await guild.members.fetch(userId).catch(() => null);
    if (!user) return interaction.reply({ content: "❌ User tidak ditemukan.", ephemeral: true });

    await channel.setParent(TICKET_CATEGORY_ID, { lockPermissions: false });
    await channel.setName(`ticket-${user.user.username.toLowerCase()}`);
    await channel.permissionOverwrites.edit(userId, {
      ViewChannel: true,
      SendMessages: true,
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("close_ticket").setLabel("❌ Tutup Tiket").setStyle(ButtonStyle.Danger)
    );

    await channel.send({ content: `🔓 Tiket dibuka kembali oleh <@${interaction.user.id}>.`, components: [row] });
    await interaction.reply({ content: "✅ Tiket berhasil dibuka ulang.", ephemeral: true });
  }

  // Hapus tiket
  if (interaction.customId === "delete_ticket") {
    await interaction.reply({ content: "🗑️ Menghapus tiket...", ephemeral: true });
    setTimeout(() => {
      channel.delete().catch(() => {});
    }, 2000);
  }

  // Placeholder salin/edit transcript
  if (interaction.customId === "save_transcript") {
    const logChannel = guild.channels.cache.get(TRANSCRIPT_CHANNEL_ID);
    if (logChannel) {
      await logChannel.send({
        content: `📋 Transcript (sementara) dari <#${channel.id}> oleh <@${interaction.user.id}>`,
      });
    }

    return interaction.reply({
      content: "📋 Data tiket dikirim ke channel log.",
      ephemeral: true,
    });
  }
};
