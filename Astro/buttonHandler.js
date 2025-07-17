const {
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;

  const { customId, user, guild } = interaction;

  // Ambil data voice dari map
  const voiceData = client.voiceManager?.get(user.id);
  if (!voiceData) return interaction.reply({ content: "❌ Voice data not found!", ephemeral: true });

  const channel = guild.channels.cache.get(voiceData.channelId);
  if (!channel || channel.type !== ChannelType.GuildVoice) {
    return interaction.reply({ content: "❌ Channel tidak ditemukan!", ephemeral: true });
  }

  switch (customId) {
    case "vc_lock":
      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        Connect: false,
      });
      return interaction.reply({ content: "🔒 Voice Channel telah dikunci!", ephemeral: true });

    case "vc_unlock":
      await channel.permissionOverwrites.edit(guild.roles.everyone, {
        Connect: true,
      });
      return interaction.reply({ content: "🔓 Voice Channel telah dibuka!", ephemeral: true });

    case "vc_rename":
      await interaction.reply({
        content: "✏️ Masukkan nama baru untuk channel ini:",
        ephemeral: true,
      });

      const collector = interaction.channel.createMessageCollector({
        filter: (m) => m.author.id === user.id,
        max: 1,
        time: 15000,
      });

      collector.on("collect", async (msg) => {
        await channel.setName(`🎧 ${msg.content}`);
        await msg.delete();
        await interaction.editReply({ content: `✅ Nama channel diubah menjadi: ${msg.content}` });
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          interaction.editReply({ content: "❌ Waktu habis. Tidak ada nama yang diberikan." });
        }
      });
      break;

    case "vc_limit":
      await interaction.reply({
        content: "📌 Masukkan jumlah user limit (1 - 99):",
        ephemeral: true,
      });

      const limitCollector = interaction.channel.createMessageCollector({
        filter: (m) => m.author.id === user.id,
        max: 1,
        time: 15000,
      });

      limitCollector.on("collect", async (msg) => {
        const limit = parseInt(msg.content);
        if (isNaN(limit) || limit < 1 || limit > 99) {
          await interaction.editReply({ content: "❌ Angka tidak valid. Gunakan 1 - 99." });
          return msg.delete();
        }
        await channel.setUserLimit(limit);
        await msg.delete();
        await interaction.editReply({ content: `✅ User limit diatur ke ${limit}` });
      });

      limitCollector.on("end", (collected) => {
        if (collected.size === 0) {
          interaction.editReply({ content: "❌ Waktu habis. Tidak ada input diberikan." });
        }
      });
      break;

    case "vc_transfer":
      await interaction.reply({
        content: "👑 Mention orang yang ingin kamu jadikan owner:",
        ephemeral: true,
      });

      const transferCollector = interaction.channel.createMessageCollector({
        filter: (m) => m.author.id === user.id,
        max: 1,
        time: 15000,
      });

      transferCollector.on("collect", async (msg) => {
        const mention = msg.mentions.members.first();
        if (!mention) {
          await interaction.editReply({ content: "❌ Tidak ada user yang di-mention." });
          return msg.delete();
        }

        // Ubah permission owner baru
        await channel.permissionOverwrites.edit(mention.id, {
          Connect: true,
          MuteMembers: true,
          MoveMembers: true,
        });

        // Hapus permission lama jika perlu
        await channel.permissionOverwrites.edit(user.id, {
          MuteMembers: false,
          MoveMembers: false,
        });

        // Update voiceManager
        client.voiceManager.set(mention.id, {
          ...voiceData,
          ownerId: mention.id,
        });
        client.voiceManager.delete(user.id);

        await msg.delete();
        await interaction.editReply({ content: `👑 Kepemilikan dipindahkan ke ${mention}` });
      });

      transferCollector.on("end", (collected) => {
        if (collected.size === 0) {
          interaction.editReply({ content: "❌ Waktu habis. Tidak ada user di-mention." });
        }
      });
      break;

    default:
      return interaction.reply({ content: "❌ Tombol tidak dikenal.", ephemeral: true });
  }
};
