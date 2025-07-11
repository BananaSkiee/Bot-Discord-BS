const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testdm")
    .setDescription("Tes kirim DM dengan tag simulasi")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("User yang ingin dikirimi DM")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("tag")
        .setDescription("Tag yang ingin ditampilkan (misal: [MOD])")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const tag = interaction.options.getString("tag");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("use_tag_fake")
        .setLabel("Pakai Tag")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("remove_tag_fake")
        .setLabel("Hapus Tag")
        .setStyle(ButtonStyle.Secondary)
    );

    try {
      await user.send({
        content:
`✨ *Selamat datang, ${user.username}!*

🔰 *Kamu telah menerima tag eksklusif ${tag} di server BananaSkiee Community.*

*Ingin menampilkan tag itu di nickname kamu?*
*Contoh:* \`${tag} ${user.username}\`

──────────────────────

*Pilih opsi di bawah ini 👇*`,
        components: [row],
      });

      await interaction.reply({ content: `✅ DM berhasil dikirim ke ${user.username}!`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "❌ Gagal mengirim DM.", ephemeral: true });
    }
  }
};
