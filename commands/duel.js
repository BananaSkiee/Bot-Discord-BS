const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("duel")
    .setDescription("Tantang seseorang untuk duel shotgun!")
    .addUserOption((option) =>
      option.setName("target").setDescription("Orang yang ingin ditantang").setRequired(true)
    ),

  async execute(interaction) {
    const challenger = interaction.user;
    const target = interaction.options.getUser("target");

    if (target.id === challenger.id) {
      return interaction.reply({ content: "❌ Kamu tidak bisa menantang dirimu sendiri!", ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle("🔫 Shotgun Duels Challenge")
      .setDescription(`${challenger} menantang ${target} untuk duel shotgun!\n\nApakah kamu berani?`)
      .setColor("Red");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("accept_duel").setLabel("Terima").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("decline_duel").setLabel("Tolak").setStyle(ButtonStyle.Danger)
    );

    const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    // Collector: hanya target yang bisa accept/decline
    const collector = message.createMessageComponentCollector({ time: 30000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== target.id) {
        // orang lain pencet → balas ephemeral
        return i.reply({ content: "❌ Kamu bukan bagian dari duel ini.", ephemeral: true });
      }

      // Target beneran pencet
      if (i.customId === "accept_duel") {
        await i.update({
          embeds: [
            new EmbedBuilder()
              .setTitle("🔥 Duel Dimulai!")
              .setDescription(`${challenger} 🆚 ${target}\n\nBersiaplah menembak!`)
              .setColor("Green"),
          ],
          components: [],
        });

        // Contoh simulasi game
        setTimeout(() => {
          const winner = Math.random() < 0.5 ? challenger : target;
          const loser = winner.id === challenger.id ? target : challenger;

          message.edit({
            embeds: [
              new EmbedBuilder()
                .setTitle("🏆 Hasil Duel")
                .setDescription(`💥 ${winner} lebih cepat dari ${loser}!\n\n🔥 ${winner} MENANG!`)
                .setColor("Gold"),
            ],
          });
        }, 5000);
      }

      if (i.customId === "decline_duel") {
        await i.update({
          embeds: [
            new EmbedBuilder()
              .setTitle("🚫 Duel Ditolak")
              .setDescription(`${target} menolak tantangan dari ${challenger}.`)
              .setColor("Grey"),
          ],
          components: [],
        });
      }

      collector.stop(); // biar ga dobel trigger
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await message.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle("⌛ Waktu Habis")
              .setDescription(`${target} tidak merespon tantangan duel.`)
              .setColor("Grey"),
          ],
          components: [],
        });
      }
    });
  },
};
