// modules/vcTools.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async function sendVcToolsPanel(channel) {
  const rows = [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("vc_lock").setLabel("🔒 Lock").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_unlock").setLabel("🔓 Unlock").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_hide").setLabel("🙈 Hide").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_unhide").setLabel("👁️ Unhide").setStyle(ButtonStyle.Secondary),
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("vc_muteall").setLabel("🔇 Mute All").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_unmuteall").setLabel("🔊 Unmute All").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_disconnectall").setLabel("❌ Kick All").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_lockmic").setLabel("⛔ Lock Mic").setStyle(ButtonStyle.Secondary),
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("vc_unlockmic").setLabel("🔓 Unlock Mic").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_lockspeak").setLabel("📵 Lock Speak").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_unlockspeak").setLabel("📢 Unlock Speak").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_rename").setLabel("🔁 Rename").setStyle(ButtonStyle.Secondary),
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("vc_clearperms").setLabel("🧼 Clear Perms").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_claim").setLabel("👥 Claim").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_bitrate").setLabel("🏷️ Bitrate").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_close").setLabel("🛑 Close").setStyle(ButtonStyle.Danger),
    )
  ];

  await channel.send({
    content: "**🎛️ VC Tools Panel**",
    components: rows,
  });
};
