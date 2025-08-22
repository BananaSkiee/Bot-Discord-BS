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

    if (target.id === challenger.id) {
      return interaction.reply({
        content: "❌ Kamu tidak bisa menantang dirimu sendiri!",
        ephemeral: true,
      });
    }

    // Cek apakah target sudah dalam duel lain
    if (gameManager.isUserInGame(target.id)) {
      return interaction.reply({
        content: `❌ ${target} sudah dalam duel lain!`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🔫 Shotgun Duels Challenge")
      .setDescription(`${challenger} menantang ${target} untuk duel shotgun!\n\nApakah kamu berani?`)
      .setColor("Red");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`duel_accept_${challenger.id}_${target.id}`)
        .setLabel("✅ Terima")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`duel_decline_${challenger.id}_${target.id}`)
        .setLabel("❌ Tolak")
        .setStyle(ButtonStyle.Danger)
    );

    const message = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === target.id,
      time: 60000, // Waktu respons 60 detik
    });

    collector.on("collect", async (i) => {
      // Deferring the update to prevent interaction timeout
      await i.deferUpdate();

      if (i.customId.startsWith("duel_accept")) {
        // Hapus tombol-tombol tantangan
        await i.editReply({
          content: `${target} menerima tantangan! Duel akan dimulai.`,
          embeds: [],
          components: [],
        });

        // Panggil gameManager untuk memulai game
        gameManager.startGame(i.channel, challenger, target, i.client);
      } else if (i.customId.startsWith("duel_decline")) {
        await i.editReply({
          content: `${target} menolak tantangan dari ${challenger}.`,
          embeds: [],
          components: [],
        });
      }

      collector.stop();
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        // Edit pesan jika waktu habis dan belum ada yang merespons
        await message.edit({
          content: `${target} tidak merespon tantangan duel.`,
          embeds: [],
          components: [],
        }).catch(err => console.error("Failed to edit message:", err));
      }
    });
  },
};
