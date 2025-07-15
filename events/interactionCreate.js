const fs = require("fs");
const path = require("path");
const { ChannelType, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { ROLES, guildId, LOG_CHANNEL_ID } = require("../config");
const handleTicketInteraction = require("../modules/ticketSystem");

const filePath = path.join(__dirname, "../data/taggedUsers.json");

function saveTaggedUsers(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const username = interaction.user.globalName ?? interaction.user.username;
    const guild = interaction.client.guilds.cache.get(guildId);
    if (!guild) return;

    const member = await guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        content: "❌ Gagal ambil datamu dari server.",
        ephemeral: true,
      }).catch(console.error);
    }

    let taggedUsers = {};
    try {
      taggedUsers = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      taggedUsers = {};
    }

    // ========== OPEN TICKET ==========
    if (interaction.customId === "open_ticket") {
      return handleTicketInteraction(interaction);
    }

    // ========== CLOSE TICKET ==========
if (interaction.customId === "close_ticket") {
  const channel = interaction.channel;

  if (channel.type !== ChannelType.GuildText) {
    return interaction.reply({
      content: "❌ Channel ini bukan channel tiket.",
      ephemeral: true,
    });
  }

  await interaction.reply({
    content: "🛠️ Ticket akan ditutup dan diarsipkan dalam 5 detik...",
    ephemeral: true,
  });

  setTimeout(async () => {
    try {
      await channel.setParent("1354119154042404926", { lockPermissions: false });
      await channel.setName(`closed-${username}`);

      // Hapus semua tombol lama (optional)
      const messages = await channel.messages.fetch({ limit: 10 });
      for (const msg of messages.values()) {
        if (msg.author.id === interaction.client.user.id && msg.components.length > 0) {
          await msg.edit({ components: [] }).catch(() => {});
        }
      }

      // Kirim tombol baru setelah close
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("reopen_ticket")
          .setLabel("🔓 Open Ticket")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("delete_ticket")
          .setLabel("🗑️ Delete Ticket")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("save_transcript")
          .setLabel("📋 Salin atau Edit")
          .setStyle(ButtonStyle.Secondary)
      );

      await channel.send({
        content: "📦 Tiket ini telah diarsipkan. Gunakan tombol di bawah ini jika perlu.",
        components: [row],
      });
    } catch (err) {
      console.error("❌ Gagal pindahkan channel:", err);
    }
  }, 5000);

  return;
            }
// ========== TOMBOL SALIN / EDIT ==========
if (interaction.customId === "save_transcript") {
  const channel = interaction.channel;
  const logChannel = interaction.client.channels.cache.get("1394478754297811034");

  if (!logChannel || !logChannel.isTextBased()) {
    return interaction.reply({
      content: "❌ Gagal menemukan channel log.",
      ephemeral: true,
    });
  }

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

  let transcript = `📄 Transkrip Tiket: #${channel.name} (${channel.id})\nServer: ${channel.guild.name}\n\n`;

  for (const msg of sorted) {
    const time = msg.createdAt.toLocaleString("id-ID");
    const author = `${msg.author?.tag || "Unknown"}`;
    let content = msg.cleanContent || "";

    if (msg.attachments.size > 0) {
      const attachments = msg.attachments.map(a => a.url).join(", ");
      content += ` [Attachment: ${attachments}]`;
    }

    if (!content.trim()) content = "[Tidak ada isi]";
    transcript += `[${time}] ${author}: ${content}\n`;
  }

  const buffer = Buffer.from(transcript, "utf-8");
  const fileName = `transcript-${channel.name}.txt`;

  await logChannel.send({
    content: `📩 Transkrip tiket dari <#${channel.id}>`,
    files: [{ attachment: buffer, name: fileName }],
  });

  return interaction.editReply({
    content: "✅ Transkrip berhasil dikirim ke channel log.",
  });
}
    // ========== DELETE TICKET ==========
    if (interaction.customId === "delete_ticket") {
      return interaction.channel.delete().catch(console.error);
    }

    // ========== REOPEN TICKET ==========
    if (interaction.customId === "reopen_ticket") {
      try {
        await interaction.channel.setParent("1354116735594266644"); // Kategori aktif
        await interaction.channel.setName(`ticket-${username}`);
        await interaction.channel.send("🔓 Tiket dibuka kembali.");
        await interaction.reply({ content: "✅ Tiket berhasil dibuka ulang.", ephemeral: true });
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // ========== REMOVE TAG ==========
    if (interaction.customId === "remove_tag") {
      await member.setNickname(null).catch(console.error);
      taggedUsers[member.id] = false;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: `✅ Nama kamu dikembalikan menjadi \`${username}\``,
        ephemeral: true,
      }).catch(console.error);
    }

    // ========== USE TAG ==========
    if (interaction.customId === "use_tag") {
      const role = ROLES.find(r => member.roles.cache.has(r.id));
      if (!role) {
        return interaction.reply({
          content: "❌ Kamu tidak punya role yang cocok untuk tag ini.",
          ephemeral: true,
        }).catch(console.error);
      }

      await member.setNickname(`${role.tag} ${username}`).catch(console.error);
      taggedUsers[member.id] = true;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: `✅ Nama kamu sekarang: \`${role.tag} ${username}\``,
        ephemeral: true,
      }).catch(console.error);
    }

    // ========== TEST BUTTON ==========
    if (
      interaction.customId.startsWith("test_use_tag_") ||
      interaction.customId.startsWith("test_remove_tag_")
    ) {
      const parts = interaction.customId.split("_");
      const action = parts[1];
      const roleId = parts[3];
      const safeTagId = parts.slice(4).join("_");

      const matched = ROLES.find(
        r =>
          r.id === roleId &&
          r.tag.replace(/[^\w-]/g, "").toLowerCase() === safeTagId
      );

      if (!matched) {
        return interaction.reply({
          content: "❌ Tag tidak ditemukan atau tidak valid.",
          ephemeral: true,
        }).catch(console.error);
      }

      const realTag = matched.tag;

      if (action === "use") {
        await member.setNickname(`${realTag} ${username}`).catch(console.error);
        if (!member.roles.cache.has(matched.id)) {
          await member.roles.add(matched.id).catch(console.error);
        }

        taggedUsers[member.id] = true;
        saveTaggedUsers(taggedUsers);

        return interaction.reply({
          content: `🧪 Nickname kamu sekarang: \`${realTag} ${username}\``,
          ephemeral: true,
        }).catch(console.error);
      }

      if (action === "remove") {
        await member.setNickname(null).catch(console.error);
        taggedUsers[member.id] = false;
        saveTaggedUsers(taggedUsers);

        return interaction.reply({
          content: `🧪 Nickname kamu dikembalikan menjadi \`${username}\``,
          ephemeral: true,
        }).catch(console.error);
      }
    }

    // ========== UNKNOWN ==========
    return interaction.reply({
      content: "⚠️ Tombol tidak dikenali.",
      ephemeral: true,
    }).catch(console.error);
  },
};
        
