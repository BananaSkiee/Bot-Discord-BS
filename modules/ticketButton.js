// modules/ticketButtons.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { guildId, LOG_CHANNEL_ID } = require("../config");

const ACTIVE_CATEGORY = "1354116735594266644";
const ARCHIVE_CATEGORY = "1354119154042404926";

module.exports = async function handleTicketButtons(interaction) {
  const guild = interaction.client.guilds.cache.get(guildId);
  const channel = interaction.channel;

  const match = (channel.topic || "").match(/user:(\d+)/);
  let userId = match?.[1];

  if (!userId) {
    const fallback = channel.permissionOverwrites.cache.find(
      ow => ow.type === 1 && ow.id !== interaction.client.user.id && ow.id !== interaction.guild.roles.everyone.id
    );
    userId = fallback?.id;
  }

  if (!userId) {
    return interaction.reply({ content: "❌ Tidak ditemukan pemilik tiket.", ephemeral: true });
  }

  // ========== CLOSE ==========
  if (interaction.customId === "close_ticket") {
    await interaction.reply({ content: "📦 Tiket akan ditutup dalam 5 detik...", ephemeral: true });

    setTimeout(async () => {
      try {
        await channel.setParent(ARCHIVE_CATEGORY, { lockPermissions: false });
        await channel.setName(channel.name.replace("ticket-", "closed-"));
        await channel.setTopic(null);

        await channel.permissionOverwrites.edit(userId, {
          ViewChannel: false,
          SendMessages: false,
        });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("reopen_ticket").setLabel("🔓 Open Ticket").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("delete_ticket").setLabel("🗑️ Delete Ticket").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId("save_transcript").setLabel("📋 Salin atau Edit").setStyle(ButtonStyle.Secondary)
        );

        const tombolBaru = await channel.send({ content: "📦 Tiket telah diarsipkan.", components: [row] });

        const messages = await channel.messages.fetch({ limit: 10 });
        for (const msg of messages.values()) {
          if (msg.id !== tombolBaru.id && msg.author.id === interaction.client.user.id && msg.components.length > 0) {
            await msg.edit({ components: [] }).catch(() => {});
          }
        }
      } catch (err) {
        console.error("❌ Gagal mengarsipkan tiket:", err);
      }
    }, 5000);
  }

  // ========== REOPEN ==========
  if (interaction.customId === "reopen_ticket") {
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return interaction.reply({ content: "❌ Tidak bisa ambil user.", ephemeral: true });

    await interaction.deferReply({ ephemeral: true });

    try {
      await channel.setParent(ACTIVE_CATEGORY, { lockPermissions: false });
      await channel.setName(`ticket-${member.user.username.toLowerCase()}`);
      await channel.setTopic(`user:${userId}`);

      await channel.permissionOverwrites.edit(userId, {
        ViewChannel: true,
        SendMessages: true,
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("close_ticket").setLabel("❌ Close Ticket").setStyle(ButtonStyle.Danger)
      );

      await channel.send({ content: `🔓 Tiket dibuka kembali oleh <@${interaction.user.id}>`, components: [row] });
      await interaction.editReply({ content: "✅ Tiket berhasil dibuka kembali." });
    } catch (err) {
      console.error("❌ Gagal reopen tiket:", err);
      await interaction.editReply({ content: "❌ Terjadi kesalahan saat membuka tiket kembali." });
    }
  }

  // ========== DELETE ==========
  if (interaction.customId === "delete_ticket") {
    return interaction.channel.delete().catch(console.error);
  }

  // ========== TRANSCRIPT ==========
  if (interaction.customId === "save_transcript") {
    const logChannel = interaction.client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel || !logChannel.isTextBased()) return;

    await interaction.deferReply({ ephemeral: true });

    let allMessages = [];
    let lastId;

    while (true) {
      const options = { limit: 100 };
      if (lastId) options.before = lastId;
      const messages = await channel.messages.fetch(options);
      if (messages.size === 0) break;
      allMessages.push(...messages.map(m => m));
      lastId = messages.last().id;
      if (messages.size < 100) break;
    }

    const sorted = allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    let transcript = `📄 Transcript Tiket #${channel.name}\n\n`;

    for (const msg of sorted) {
      const time = msg.createdAt.toLocaleString("id-ID");
      const author = msg.author?.tag || "Unknown";
      const content = msg.cleanContent || "[Kosong]";
      const attach = msg.attachments.map(a => a.url).join(", ");
      transcript += `[${time}] ${author}: ${content}${attach ? ` [Attachment: ${attach}]` : ""}\n`;
    }

    const buffer = Buffer.from(transcript, "utf-8");
    await logChannel.send({ content: `📋 Transcript dari <#${channel.id}>`, files: [{ attachment: buffer, name: `transcript-${channel.name}.txt` }] });

    return interaction.editReply({ content: "✅ Transcript berhasil dikirim ke log." });
  }
};
