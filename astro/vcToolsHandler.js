module.exports = async function handleVcButtons(interaction) {
  const id = interaction.customId;
  const member = interaction.member;
  const channel = member.voice?.channel;

  if (!channel)
    return interaction.reply({
      content: "❌ Kamu harus ada di voice channel.",
      ephemeral: true,
    });

 case "mute_all":
      for (const [_, member] of channel.members) {
        if (!member.voice.serverMute) {
          await member.voice.setMute(true, "Mute All via Panel");
        }
      }
      return interaction.reply({
        content: "🔇 Semua member di-mute!",
        ephemeral: true,
      });

    case "unmute_all":
      for (const [_, member] of channel.members) {
        if (member.voice.serverMute) {
          await member.voice.setMute(false, "Unmute All via Panel");
        }
      }
      return interaction.reply({
        content: "🔊 Semua member di-unmute!",
        ephemeral: true,
      });

    case "disconnect_all":
      for (const [_, member] of channel.members) {
        await member.voice.disconnect("Disconnect All via Panel");
      }
      return interaction.reply({
        content: "❌ Semua member di-DC dari VC!",
        ephemeral: true,
      });

    case "lock_mic":
      await channel.permissionOverwrites.edit(member.guild.roles.everyone, {
        Speak: false,
      });
      return interaction.reply({
        content: "⛔ Mic dikunci untuk semua member!",
        ephemeral: true,
      });

    case "unlock_mic":
      await channel.permissionOverwrites.edit(member.guild.roles.everyone, {
        Speak: true,
      });
      return interaction.reply({
        content: "🔓 Mic dibuka untuk semua member!",
        ephemeral: true,
      });

    case "lock_speak":
      await channel.permissionOverwrites.edit(member.guild.roles.everyone, {
        SendMessages: false,
      });
      return interaction.reply({
        content: "📵 Permission bicara dikunci!",
        ephemeral: true,
      });

    case "unlock_speak":
      await channel.permissionOverwrites.edit(member.guild.roles.everyone, {
        SendMessages: true,
      });
      return interaction.reply({
        content: "📢 Permission bicara dibuka!",
        ephemeral: true,
      });

    case "rename_vc":
      return interaction.showModal({
        title: "Rename Voice Channel",
        custom_id: "rename_vc_modal",
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "new_vc_name",
                style: 1,
                label: "Masukkan nama baru VC",
                placeholder: "Contoh: Chill Zone",
                required: true,
              },
            ],
          },
        ],
      });

    case "clear_perms":
      await channel.permissionOverwrites.set([]);
      return interaction.reply({
        content: "🧼 Semua permission direset!",
        ephemeral: true,
      });

    case "claim_vc":
      const owner = channel.permissionOverwrites.cache.find(
        (p) => p.allow.has("ManageChannels") && p.type === "member"
      );
      if (owner && owner.id === member.id) {
        return interaction.reply({
          content: "👑 Kamu sudah jadi pemilik VC ini.",
          ephemeral: true,
        });
      }

      await channel.permissionOverwrites.edit(member.id, {
        ManageChannels: true,
        ManageRoles: true,
        MuteMembers: true,
        DeafenMembers: true,
        MoveMembers: true,
      });

      return interaction.reply({
        content: "👑 Kamu sekarang jadi pemilik VC ini!",
        ephemeral: true,
      });

    case "set_bitrate":
      return interaction.showModal({
        title: "Set VC Bitrate",
        custom_id: "set_bitrate_modal",
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "vc_bitrate",
                style: 1,
                label: "Bitrate (kbps, max 384)",
                placeholder: "Contoh: 96 atau 128",
                required: true,
              },
            ],
          },
        ],
      });

    case "close_panel":
      await interaction.update({
        content: "🛑 Panel ditutup.",
        components: [],
      });
      return;
