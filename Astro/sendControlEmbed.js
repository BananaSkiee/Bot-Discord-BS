const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

const sendControlEmbed = async (channel, ownerId) => {
  const embed = new EmbedBuilder()
    .setTitle("🎛️ Voice Channel Controls")
    .setDescription("Gunakan tombol di bawah untuk mengatur VC-mu")
    .setColor("Blurple");

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("vc-lock").setLabel("🔒 Lock").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("vc-unlock").setLabel("🔓 Unlock").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("vc-rename").setLabel("📝 Rename").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("vc-bitrate").setLabel("🎚️ Bitrate").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("vc-limit").setLabel("👥 Limit").setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("vc-hide").setLabel("👁️ Hide").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("vc-unhide").setLabel("👁️‍🗨️ Unhide").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("vc-permit").setLabel("🙋 Permit").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("vc-reject").setLabel("🙅 Reject").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("vc-claim").setLabel("🏠 Claim").setStyle(ButtonStyle.Secondary)
  );

  await channel.send({
    content: `<@${ownerId}>`,
    embeds: [embed],
    components: [row1, row2]
  });
};

module.exports = sendControlEmbed;
