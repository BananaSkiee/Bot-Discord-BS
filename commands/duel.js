// commands/duel.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const gameManager = require("../modules/gameManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("duel")
    .setDescription("Tantang seseorang untuk duel shotgun!")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Orang yang ingin ditantang")
        .setRequired(true)
    ),

  async execute(interaction) {
    const challenger = interaction.user;
    const target = interaction.options.getUser("target");

    // ❌ Cegah duel diri sendiri
    if (target.id === challenger.id) {
      return interaction.reply({
        content: "❌ Kamu tidak bisa menantang dirimu sendiri!",
        ephemeral: true,
      });
    }

    // ❌ Cegah kalau salah satu udah dalam duel
    if (
      gameManager.isUserInGame(target.id) ||
      gameManager.isUserInGame(challenger.id)
    ) {
      return interaction.reply({
        content: `❌ Salah satu dari kalian sudah dalam duel lain!`,
        ephemeral: true,
      });
    }

    // 📩 Embed tantangan duel
    const embed = new EmbedBuilder()
      .setTitle("🔫 Shotgun Duels Challenge")
      .setDescription(
        `${challenger} menantang ${target} untuk duel shotgun!\n\nApakah kamu berani?`
      )
      .setColor("Red");

    // ✅❌ Tombol terima/tolak dengan ID unik
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

    // Kirim pesan tantangan
    const message = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    // Kolektor tombol hanya untuk target
    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === target.id,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();

      if (i.customId === `accept_duel_${challenger.id}_${target.id}`) {
        // Duel diterima
        await i.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("🔥 Duel Dimulai!")
              .setDescription(`${challenger} 🆚 ${target}\n\nBersiaplah menembak!`)
              .setColor("Green"),
          ],
          components: [],
        });

        gameManager.startGame(i.channel, challenger, target);
      } else if (i.customId === `decline_duel_${challenger.id}_${target.id}`) {
        // Duel ditolak
        await i.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("🚫 Duel Ditolak")
              .setDescription(`${target} menolak tantangan dari ${challenger}.`)
              .setColor("Grey"),
          ],
          components: [],
        });
      }

      collector.stop();
    });

    // Timeout kalau target ga respon
    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await message
          .edit({
            embeds: [
              new EmbedBuilder()
                .setTitle("⌛ Waktu Habis")
                .setDescription(`${target} tidak merespon tantangan duel.`)
                .setColor("Grey"),
            ],
            components: [],
          })
          .catch((err) =>
            console.error("Gagal edit pesan setelah timeout:", err)
          );
      }
    });
  },
};
