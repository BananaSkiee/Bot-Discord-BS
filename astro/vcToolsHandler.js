module.exports = async function handleVcButtons(interaction) {
  const { customId, member, guild } = interaction;

  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    return interaction.reply({
      content: "❌ Kamu harus berada di voice channel terlebih dahulu.",
      ephemeral: true,
    });
  }

  switch (customId) {
    case "lock_vc":
      await voiceChannel.permissionOverwrites.edit(guild.roles.everyone, {
        Connect: false,
      });
      return interaction.reply({ content: "🔒 Voice channel telah dikunci.", ephemeral: true });

    case "unlock_vc":
      await voiceChannel.permissionOverwrites.edit(guild.roles.everyone, {
        Connect: true,
      });
      return interaction.reply({ content: "🔓 Voice channel telah dibuka.", ephemeral: true });

    case "hide_vc":
      await voiceChannel.permissionOverwrites.edit(guild.roles.everyone, {
        ViewChannel: false,
      });
      return interaction.reply({ content: "🙈 Voice channel disembunyikan.", ephemeral: true });

    case "unhide_vc":
      await voiceChannel.permissionOverwrites.edit(guild.roles.everyone, {
        ViewChannel: true,
      });
      return interaction.reply({ content: "👀 Voice channel ditampilkan kembali.", ephemeral: true });

    default:
      return; // tombol lain yang tidak ditangani
  }
};
