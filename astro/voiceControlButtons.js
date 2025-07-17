const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Events,
} = require("discord.js");

const CHANNEL_ID = ""; // Channel target

module.exports = (client) => {
  client.once(Events.ClientReady, async () => {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("mute")
        .setLabel("🔇 Mute")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("unmute")
        .setLabel("🔊 Unmute")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("disconnect")
        .setLabel("❌ Kick VC")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: "🎧 Kontrol Voice Channel (Join dulu baru bisa pakai)",
      components: [row],
    });
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const member = interaction.member;
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        content: "⚠️ Kamu harus join Voice Channel dulu!",
        ephemeral: true,
      });
    }

    if (interaction.customId === "mute") {
      await member.voice.setMute(true);
      await interaction.reply({ content: "🔇 Dimute", ephemeral: true });
    } else if (interaction.customId === "unmute") {
      await member.voice.setMute(false);
      await interaction.reply({ content: "🔊 Dibuka mute", ephemeral: true });
    } else if (interaction.customId === "disconnect") {
      await member.voice.disconnect();
      await interaction.reply({ content: "❌ Kamu dikeluarkan dari VC", ephemeral: true });
    }
  });
};
