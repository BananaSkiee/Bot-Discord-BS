const { EmbedBuilder } = require("discord.js");

const games = {}; // Simpan game per channelId

module.exports = async function tebakAngka(message) {
  const channelId = message.channel.id;

  // Cek kalau game udah ada di channel
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

  // Pilih angka rahasia
  const target = Math.floor(Math.random() * 100) + 1;
  games[channelId] = {
    number: target,
    attempts: {} // Simpan kesempatan tiap user
  };

  // Embed Pembukaan
  const startEmbed = new EmbedBuilder()
    .setColor("#00ff88")
    .setTitle("🎯 Tebak Angka Dimulai!")
    .setDescription(
      `Aku sudah memilih **angka rahasia** antara \`1\` - \`100\`.\n\n` +
      `📌 **Semua orang di channel ini bisa ikut menebak!**\n` +
      `❤️ Tiap orang punya **5 kesempatan pribadi**\n` +
      `⏳ Waktu bermain: **5 menit**`
    )
    .setFooter({ text: "Ketik angka di chat untuk menebak" })
    .setTimestamp();

  await message.channel.send({ embeds: [startEmbed] });

  const filter = m => !m.author.bot && m.channel.id === channelId;
  const collector = message.channel.createMessageCollector({ filter, time: 300000 }); // 5 menit

  collector.on("collect", m => {
    const guess = parseInt(m.content);
    if (isNaN(guess)) return;

    // Inisialisasi kesempatan user (hanya kalau belum ada)
    if (games[channelId].attempts[m.author.id] === undefined) {
      games[channelId].attempts[m.author.id] = 5;
    }

    // Kalau kesempatan sudah habis
    if (games[channelId].attempts[m.author.id] <= 0) {
      return m.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle("🚫 Kesempatan Habis")
            .setDescription("Kamu sudah tidak bisa ikut menebak lagi di game ini.")
        ]
      });
    }

    // Kurangi kesempatan
    games[channelId].attempts[m.author.id]--;

    // Cek jawaban benar
    if (guess === games[channelId].number) {
      const winEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle("🏆 Tebak Angka")
        .setDescription(
          `🎉 **${m.author}** berhasil menebak angka yang benar!\n\n` +
          `🎯 Angka: **${guess}**`
        )
        .setFooter({ text: "Permainan selesai" })
        .setTimestamp();

      m.channel.send({ embeds: [winEmbed] });
      delete games[channelId];
      return collector.stop();
    }

    // Kalau salah
    const hintEmbed = new EmbedBuilder()
      .setColor("#ffaa00")
      .setTitle("🤔 Tebak Lagi!")
      .setDescription(
        guess > games[channelId].number
          ? `🔻 **Terlalu besar!**`
          : `🔺 **Terlalu kecil!**`
      )
      .addFields(
        { name: "Sisa Kesempatan Kamu", value: `${games[channelId].attempts[m.author.id]}`, inline: true }
      )
      .setFooter({ text: "Lanjutkan menebak..." });

    m.channel.send({ embeds: [hintEmbed] });
  });

  // Kalau waktu habis
  collector.on("end", () => {
    if (games[channelId]) {
      const timeoutEmbed = new EmbedBuilder()
        .setColor("#5555ff")
        .setTitle("⏳ Waktu Habis!")
        .setDescription(
          `Tidak ada yang berhasil menebak dalam waktu 5 menit.\n` +
          `🎯 Angka yang benar adalah: **${games[channelId].number}**`
        )
        .setFooter({ text: "Permainan selesai" })
        .setTimestamp();

      message.channel.send({ embeds: [timeoutEmbed] });
      delete games[channelId];
    }
  });
};
