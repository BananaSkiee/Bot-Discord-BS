const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async (client, channel) => {
  const buttons = [
    { id: "lock", label: "🔒 Lock", style: ButtonStyle.Secondary },
    { id: "unlock", label: "🔓 Unlock", style: ButtonStyle.Secondary },
    { id: "rename", label: "✏️ Rename", style: ButtonStyle.Secondary },
    { id: "limit", label: "👥 Limit", style: ButtonStyle.Secondary },
    { id: "mute", label: "🔇 Mute", style: ButtonStyle.Secondary },
    { id: "unmute", label: "🔊 Unmute", style: ButtonStyle.Secondary },
    { id: "deafen", label: "🙉 Deafen", style: ButtonStyle.Secondary },
    { id: "undeafen", label: "👂 Undeafen", style: ButtonStyle.Secondary },
    { id: "hide", label: "🙈 Hide", style: ButtonStyle.Secondary },
    { id: "unhide", label: "👁️ Unhide", style: ButtonStyle.Secondary },
    { id: "kick", label: "🥾 Kick", style: ButtonStyle.Secondary },
    { id: "invite", label: "🔗 Invite", style: ButtonStyle.Secondary },
    { id: "bitrate", label: "🎚️ Bitrate", style: ButtonStyle.Secondary },
    { id: "clone", label: "📋 Clone", style: ButtonStyle.Secondary },
    { id: "delete", label: "🗑️ Delete", style: ButtonStyle.Danger },
    { id: "owner", label: "👑 Owner", style: ButtonStyle.Primary },
  ];

  const rows = [];
  for (let i = 0; i < buttons.length; i += 5) {
    rows.push(new ActionRowBuilder().addComponents(
      buttons.slice(i, i + 5).map(btn =>
        new ButtonBuilder()
          .setCustomId(btn.id)
          .setLabel(btn.label)
          .setStyle(btn.style)
      )
    ));
  }

  await channel.send({
    content: "**🎛️ VC Tools Panel**",
    components: rows,
  });
};
