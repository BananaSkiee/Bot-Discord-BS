const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require("discord.js");

const TICKET_CATEGORY_ID = "1354116735594266644"; // Kategori untuk tiket aktif
const ARCHIVE_CATEGORY_ID = "1354119154042404926"; // Kategori untuk tiket tertutup / arsip

module.exports = async function handleTicketButtons(interaction) {
  const channel = interaction.channel;
  const match = (channel.topic || "").match(/user:(\d+)/);
  const userId = match?.[1];

  if (!userId) {
    return interaction.reply({
      content: "❌ Tidak ditemukan pemilik tiket.",
      ephemeral: true,
    });
  }

  // CLOSE
  if (interaction.customId === "close_ticket") {
    await interaction.reply({
      content: "📦 Tiket akan ditutup dan diarsipkan dalam 5 detik...",
      ephemeral: true,
    });

    setTimeout(async () => {
      try {
        await channel.setParent(ARCHIVE_CATEGORY_ID, { lockPermissions: false });
        await channel.setName(channel.name.replace("ticket-", "closed-"));
        await channel.permissionOverwrites.edit(userId, {
          ViewChannel: false,
          SendMessages: false,
        });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("reopen_ticket")
            .setLabel("🔓 Open Ticket")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("delete_ticket")
            .setLabel("🗑️ Delete Ticket")
            .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
          content: "📦 Tiket telah diarsipkan.",
          components: [row],
        });

        const messages = await channel.messages.fetch({ limit: 10 });
        for (const msg of messages.values()) {
          if (msg.author.id === interaction.client.user.id && msg.components.length > 0) {
            await msg.edit({ components: [] }).catch(() => {});
          }
        }
      } catch (err) {
        console.error("❌ Gagal arsipkan tiket:", err);
      }
    }, 5000);
  }

  // REOPEN
  else if (interaction.customId === "reopen_ticket") {
    try {
      const member = await interaction.guild.members.fetch(userId);
      await channel.setParent(TICKET_CATEGORY_ID, { lockPermissions: false });
      await channel.setName(`ticket-${member.user.username.toLowerCase()}`);
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

      await interaction.reply({
        content: "✅ Tiket dibuka kembali.",
        ephemeral: true,
      });

      await channel.send({
        content: `🔓 Tiket dibuka kembali oleh <@${interaction.user.id}>.`,
        components: [row],
      });

      const messages = await channel.messages.fetch({ limit: 10 });
      for (const msg of messages.values()) {
        if (msg.author.id === interaction.client.user.id && msg.components.length > 0) {
          await msg.edit({ components: [] }).catch(() => {});
        }
      }
    } catch (err) {
      console.error("❌ Gagal reopen tiket:", err);
    }
  }

  // DELETE
  else if (interaction.customId === "delete_ticket") {
    await interaction.reply({
      content: "🗑️ Tiket akan dihapus...",
      ephemeral: true,
    });
    await channel.delete().catch(console.error);
  }
};
