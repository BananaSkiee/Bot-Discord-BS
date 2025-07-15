const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");

const TICKET_CATEGORY_ID = "1354116735594266644";     // Tiket aktif
const ARCHIVE_CATEGORY_ID = "1354119154042404926";    // Tiket arsip

module.exports = async function handleTicketButtons(interaction) {
  const channel = interaction.channel;

  // Ambil user ID dari topic
  let match = (channel.topic || "").match(/user:(\d+)/);
  let userId = match?.[1];

  if (!userId) {
    const fallback = channel.permissionOverwrites.cache.find(
      ow =>
        ow.type === 1 &&
        ow.id !== interaction.client.user.id &&
        ow.id !== interaction.guild.roles.everyone.id
    );
    userId = fallback?.id;
  }

  const username = interaction.user.username;

  // Tombol: Konfirmasi Tutup
  if (interaction.customId === "close_ticket") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_close_ticket")
        .setLabel("✅ Tutup")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("cancel_close_ticket")
        .setLabel("❌ Batal")
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({
      content: "❓ Yakin ingin menutup tiket ini?",
      components: [row],
      ephemeral: true,
    });
  }

  // Tombol: Batalkan Tutup
  if (interaction.customId === "cancel_close_ticket") {
    return interaction.update({
      content: "❎ Penutupan tiket dibatalkan.",
      components: [],
    });
  }

  // Tombol: Konfirmasi Tutup Ticket
  if (interaction.customId === "confirm_close_ticket") {
    await interaction.update({
      content: "📦 Tiket ditutup dan dipindahkan ke arsip.",
      components: [],
    });

    try {
      await channel.setParent(ARCHIVE_CATEGORY_ID, { lockPermissions: false });

      const newName = channel.name.replace("ticket-", "closed-");
      await channel.setName(newName);

      await channel.permissionOverwrites.edit(userId, {
        ViewChannel: false,
        SendMessages: false,
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("reopen_ticket")
          .setLabel("🔓 Buka Lagi")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("delete_ticket")
          .setLabel("🗑️ Hapus")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("save_transcript")
          .setLabel("📋 Salin/Edit")
          .setStyle(ButtonStyle.Secondary)
      );

      await channel.send({
        content: "✅ Tiket telah ditutup.",
        components: [row],
      });

    } catch (err) {
      console.error("❌ Gagal menutup tiket:", err);
    }

    return;
  }

  // Tombol: Buka Kembali
  if (interaction.customId === "reopen_ticket") {
    try {
      await channel.setParent(TICKET_CATEGORY_ID, { lockPermissions: false });

      const fixedName = channel.name.replace("closed-", "ticket-");
      await channel.setName(fixedName);

      await channel.permissionOverwrites.edit(userId, {
        ViewChannel: true,
        SendMessages: true,
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("❌ Close Ticket")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `🔓 Tiket dibuka kembali oleh <@${interaction.user.id}>.`,
        components: [row],
      });

      return interaction.reply({
        content: "✅ Tiket berhasil dibuka kembali.",
        ephemeral: true,
      });
    } catch (err) {
      console.error("❌ Gagal membuka ulang tiket:", err);
      return interaction.reply({
        content: "❌ Gagal membuka ulang tiket.",
        ephemeral: true,
      });
    }
  }

  // Tombol: Hapus Ticket
  if (interaction.customId === "delete_ticket") {
    await interaction.reply({
      content: "⏳ Menghapus channel...",
      ephemeral: true,
    });

    return channel.delete().catch(err =>
      console.error("❌ Gagal menghapus tiket:", err)
    );
  }

  // Tombol: Save Transcript (Placeholder)
  if (interaction.customId === "save_transcript") {
    return interaction.reply({
      content: "📋 Fitur salin/edit transcript belum tersedia.",
      ephemeral: true,
    });
  }
};
