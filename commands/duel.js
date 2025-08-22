// commands/duel.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { startGame } = require("../modules/gameManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("duel")
    .setDescription("Tantang seseorang dalam Sutgun Duel")
    .addUserOption(option =>
      option.setName("target")
        .setDescription("Orang yang mau kamu tantang")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const target = interaction.options.getUser("target");
    const challenger = interaction.user;

    if (target.id === challenger.id)
      return interaction.reply({ content: "❌ Tidak bisa duel diri sendiri!", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle("🔫 Sutgun Duels Challenge")
      .setDescription(`${challenger} menantang ${target} untuk duel shotgun!\n\nApakah kamu berani?`)
      .setColor("Red");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`accept_duel_${challenger.id}_${target.id}`)
        .setLabel("✅ Terima")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`decline_duel_${challenger.id}_${target.id}`)
        .setLabel("❌ Tolak")
        .setStyle(ButtonStyle.Danger)
    );

    const duelMsg = await interaction.reply({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === target.id;
    const collector = duelMsg.createMessageComponentCollector({ filter, time: 15000 });

    collector.on("collect", async i => {
      if (i.customId.startsWith("accept_duel")) {
        await i.update({ content: `🔥 Duel dimulai antara ${challenger} vs ${target}!`, embeds: [], components: [] });
        startGame(interaction.channel, challenger, target, client);
      } else if (i.customId.startsWith("decline_duel")) {
        await i.update({ content: `${target} menolak duel 😢`, embeds: [], components: [] });
      }
    });

    collector.on("end", collected => {
      if (collected.size === 0) {
        duelMsg.edit({ content: "⏳ Waktu habis, duel dibatalkan.", embeds: [], components: [] });
      }
    });
  }
};
