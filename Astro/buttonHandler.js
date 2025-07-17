module.exports = async (interaction) => {
  const [action, vcId] = interaction.customId.split("-");
  const member = interaction.guild.members.cache.get(interaction.user.id);
  const vc = interaction.guild.channels.cache.get(vcId);

  if (!vc || vc.type !== 2) return interaction.reply({ content: "VC nggak ditemukan.", ephemeral: true });

  try {
    if (action === "lock") {
      await vc.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: false });
      return interaction.reply({ content: "🔒 VC dikunci.", ephemeral: true });
    }

    if (action === "unlock") {
      await vc.permissionOverwrites.edit(interaction.guild.roles.everyone, { Connect: true });
      return interaction.reply({ content: "🔓 VC dibuka.", ephemeral: true });
    }

    if (action === "hide") {
      await vc.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: false });
      return interaction.reply({ content: "👁️ VC disembunyikan.", ephemeral: true });
    }

    if (action === "unhide") {
      await vc.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: true });
      return interaction.reply({ content: "👀 VC ditampilkan.", ephemeral: true });
    }

    if (action === "delete") {
      await vc.delete();
      return interaction.reply({ content: "🗑️ VC dihapus.", ephemeral: true });
    }
  } catch (err) {
    console.error(err);
    return interaction.reply({ content: "❌ Gagal jalankan aksi.", ephemeral: true });
  }
};
