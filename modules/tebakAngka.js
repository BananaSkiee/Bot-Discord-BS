const { EmbedBuilder } = require("discord.js");
const games = {}; // Simpan game per channelId

module.exports = async function tebakAngka(message) {
  const channelId = message.channel.id;

  if (games[channelId]) {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#ffcc00")
          .setTitle("⚠ Game Sedang Berlangsung")
          .setDescription("Sudah ada game **Tebak Angka** di channel ini!\nKetik angka untuk menebak.")
      ]
    });
  }

  const target = Math.floor(Math.random() * 100) + 1;
  games[channelId] = {
    number: target,
    attempts: 5,
    starterId: message.author.id
  };

  // Embed Pembukaan
  const startEmbed = new EmbedBuilder()
    .setColor("#00ff88")
    .setTitle("🎯 Tebak Angka Dimulai!")
    .setDescription(
      `Aku sudah memilih **angka rahasia** antara \`1\` - \`100\`.\n\n` +
      `📌 **Semua orang di channel ini bisa menebak!**\n` +
      `❤️ Kesempatan bersama: **5 kali**\n` +
      `⏳ Waktu bermain: **5 menit**`
    )
    .setFooter({ text: `Game dimulai oleh ${message.author.username}` })
    .setTimestamp();

  await message.channel.send({ embeds: [startEmbed] });

  const filter = m => !m.author.bot && m.channel.id === channelId;
  const collector = message.channel.createMessageCollector({ filter, time: 300000 }); // 5 menit

  collector.on("collect", m => {
    const guess = parseInt(m.content);
    if (isNaN(guess)) return;

    games[channelId].attempts--;

    if (guess === games[channelId].number) {
      const winEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("🏆 Tebak Angka")
        .setDescription(
          `**${m.author.username}** berhasil menebak angka yang benar!\n\n` +
          `🎯 Angka: **${guess}**\n` +
          `🎉 Selamat!`
        )
        .setFooter({ text: "Permainan selesai" })
        .setTimestamp();

      m.reply({ embeds: [winEmbed] });
      delete games[channelId];
      return collector.stop();
    } 
    else if (games[channelId].attempts <= 0) {
      const loseEmbed = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle("💀 Game Over")
        .setDescription(
          `Kesempatan habis!\n` +
          `🎯 Angka yang benar adalah: **${games[channelId].number}**`
        )
        .setFooter({ text: "Permainan selesai" })
        .setTimestamp();

      m.reply({ embeds: [loseEmbed] });
      delete games[channelId];
      return collector.stop();
    } 
    else {
      const hintEmbed = new EmbedBuilder()
        .setColor("#ffaa00")
        .setTitle("🤔 Tebak Lagi!")
        .setDescription(
          guess > games[channelId].number
            ? `🔻 **Terlalu besar!**`
            : `🔺 **Terlalu kecil!**`
        )
        .addFields(
          { name: "Sisa Kesempatan", value: `${games[channelId].attempts}`, inline: true }
        )
        .setFooter({ text: "Lanjutkan menebak..." });

      m.reply({ embeds: [hintEmbed] });
    }
  });

  collector.on("end", () => {
    if (games[channelId]) {
      const starterId = games[channelId].starterId;
      const timeoutEmbed = new EmbedBuilder()
        .setColor("#5555ff")
        .setTitle("⏳ Waktu Habis!")
        .setDescription(
          `Tidak ada yang berhasil menebak dalam waktu 5 menit.\n` +
          `🎯 Angka yang benar adalah: **${games[channelId].number}**`
        )
        .setFooter({ text: "Permainan selesai" })
        .setTimestamp();

      message.reply({ embeds: [timeoutEmbed] }); // Balas ke orang yang mulai game
      delete games[channelId];
    }
  });
};
