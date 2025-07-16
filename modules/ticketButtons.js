// modules/ticketButtons.js
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const TICKET_CATEGORY_ID = "1354116735594266644";
const ARCHIVE_CATEGORY_ID = "1354119154042404926";

module.exports = async function handleTicketButtons(interaction) {
  const channel = interaction.channel;

  let match = (channel.topic || "").match(/user:(\d+)/);
  let userId = match?.[1];

  if (!userId) {
    const fallback = channel.permissionOverwrites.cache.find(
      ow => ow.type === 1 &&
        ow.id !== interaction.client.user.id &&
        ow.id !== interaction.guild.roles.everyone.id
    );
    userId = fallback?.id;
  }

  if (!userId) {
    return interaction.reply({ content: "❌ Tidak ditemukan pemilik tiket.", ephemeral: true });
  }

  // Konfirmasi sebelum menutup
  if (interaction.customId === "close_ticket") {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("confirm_close_ticket").setLabel("✅ Ya").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("cancel_close_ticket").setLabel("❌ Tidak").setStyle(ButtonStyle.Secondary),
    );

    return interaction.reply({
      content: "❓ Yakin ingin menutup tiket ini?",
      components: [row],
      ephemeral: true,
    });
  }

  if (interaction.customId === "cancel_close_ticket") {
    return interaction.update({
      content: "❎ Penutupan tiket dibatalkan.",
      components: [],
    });
  }

  if (interaction.customId === "confirm_close_ticket") {
    await interaction.update({
      content: "📦 Tiket ditutup dan dipindahkan ke arsip.",
      components: [],
    });

    try {
      await channel.setParent(ARCHIVE_CATEGORY_ID, { lockPermissions: false });
      await channel.setName(channel.name.replace("ticket-", "closed-"));
      await channel.permissionOverwrites.edit(userId, {
        ViewChannel: false,
        SendMessages: false,
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("reopen_ticket").setLabel("🔓 Buka Lagi").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("delete_ticket").setLabel("🗑️ Hapus").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("save_transcript").setLabel("📋 Salin/Edit").setStyle(ButtonStyle.Secondary),
      );

      await channel.send({
        content: "✅ Tiket telah ditutup.",
        components: [row],
      });

    } catch (err) {
      console.error("❌ Gagal menutup tiket:", err);
    }
  }

  if (interaction.customId === "reopen_ticket") {
    try {
      await channel.setParent(TICKET_CATEGORY_ID, { lockPermissions: false });
      await channel.setName(channel.name.replace("closed-", "ticket-"));
      await channel.permissionOverwrites.edit(userId, {
        ViewChannel: true,
        SendMessages: true,
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("close_ticket").setLabel("❌ Tutup").setStyle(ButtonStyle.Danger),
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
      console.error("❌ Gagal buka ulang tiket:", err);
      return interaction.reply({
        content: "❌ Gagal buka ulang tiket.",
        ephemeral: true,
      });
    }
  }

  if (interaction.customId === "delete_ticket") {
    await interaction.reply({
      content: "🗑️ Menghapus channel...",
      ephemeral: true,
    });

    return channel.delete().catch(err =>
      console.error("❌ Gagal hapus tiket:", err)
    );
  }

if (interaction.customId === "save_transcript") {
  const logChannelId = "1394478754297811034";
  const logChannel = interaction.guild.channels.cache.get(logChannelId);

  if (logChannel) {
    await logChannel.send({
      content: `📝 Transcript (sementara) dari <#${channel.id}> oleh <@${interaction.user.id}>`
    });
  }

  return interaction.reply({
    content: "📋 Data tiket dikirim ke channel log.",
    ephemeral: true,
  });
}
