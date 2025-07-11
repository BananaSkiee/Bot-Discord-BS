module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // ⛔ Jika interaction terjadi di luar server (misalnya DM), keluarin dulu
    if (!interaction.inGuild()) return;

    // ✅ Akses aman ke member
    const member = interaction.member;

    // 🔘 Tangani Button Interaction
    if (interaction.isButton()) {
      if (interaction.customId === 'add_tag') {
        const nickname = member.nickname || member.user.username;
        const tag = '[TAG]'; // Ganti nanti dengan tag sesuai role user
        await member.setNickname(`${tag} ${nickname}`);
        return interaction.reply({ content: `✅ Nickname-mu sudah diubah menjadi \`${tag} ${nickname}\``, ephemeral: true });
      }

      if (interaction.customId === 'remove_tag') {
        await member.setNickname(null);
        return interaction.reply({ content: `🗑️ Tag di nickname-mu telah dihapus.`, ephemeral: true });
      }
    }

    // 🛠️ Kalau kamu pakai slash command (opsional)
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error("❌ Error saat menjalankan command:", err);
        await interaction.reply({ content: '❌ Terjadi kesalahan saat menjalankan perintah.', ephemeral: true });
      }
    }
  }
};
