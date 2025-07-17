const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = async (client, voiceChannel) => {
  const controlChannelId = "1356706671220494498"; // ganti ID-nya

  const embed = new EmbedBuilder()
    .setTitle("🎛️ Voice Channel Controls")
    .setDescription(`Atur VC: **${voiceChannel.name}**`)
    .setColor("Blurple");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`lock-${voiceChannel.id}`).setLabel("🔒 Lock").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`unlock-${voiceChannel.id}`).setLabel("🔓 Unlock").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`hide-${voiceChannel.id}`).setLabel("👁️ Hide").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`unhide-${voiceChannel.id}`).setLabel("👀 Unhide").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`delete-${voiceChannel.id}`).setLabel("🗑️ Delete").setStyle(ButtonStyle.Danger)
  );

  const controlChannel = await client.channels.fetch(controlChannelId);
  if (controlChannel) controlChannel.send({ embeds: [embed], components: [row] });
};
