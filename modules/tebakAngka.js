const { EmbedBuilder } = require("discord.js");

const games = {}; // Simpan data game per channel

// List emoji untuk variasi efek
const emojisWin = ["🎉", "🏆", "🔥", "💯", "🥳", "🎊"];
const emojisLose = ["❌", "😢", "💀", "☠️"];
const emojisStart = ["🎯", "🚀", "✨", "📢"];

function randomEmoji(list) {
  return list[Math.floor(Math.random() * list.length)];
}

module.exports = async function tebakAngka(message) {
  const channelId = message.channel.id;

  // Cegah double game di channel yang sama
  if (games[channelId]) {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#ffcc00")
          .setTitle(`${randomEmoji(emojisLose)} Game Sedang Berlangsung`)
          .setDescription("Sudah ada game **Tebak Angka** di channel ini!\nKetik angka untuk menebak.")
      ]
    });
  }

  // Pilih angka rahasia
  const target = Math.floor(Math.random() * 100) + 1;
  games[channelId] = { number: target, attempts: {} };

  // Kirim pesan mulai
  const startEmbed = new EmbedBuilder()
    .setColor("#00ff88")
    .setTitle(`${randomEmoji(emojisStart)} Tebak Angka Dimulai!`)
    .setDescription(
      `Aku sudah memilih angka antara **1** - **100**.\n\n` +
      `📌 Semua orang di channel ini bisa ikut\n` +
      `❤️ Tiap orang punya **5 kesempatan pribadi**\n` +
      `⏳ Waktu bermain: **5 menit**`
    )
    .setFooter({ text: "Ketik angka di chat untuk menebak" })
    .setTimestamp();

  await message.channel.send({ embeds: [startEmbed] });

  // Kolektor pesan
  const filter = m => !m.author.bot && m.channel.id === channelId;
  const collector = message.channel.createMessageCollector({ filter, time: 300000 });

  collector.on("collect", m => {
    const guess = parseInt(m.content);
    if (isNaN(guess)) return;

    // Inisialisasi kesempatan user
    if (!games[channelId].attempts[m.author.id]) {
      games[channelId].attempts[m.author.id] = 5;
    }

    // Kalau kesempatan habis → keluar
    if (games[channelId].attempts[m.author.id] <= 0) {
      return m.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#ff0000")
            .setTitle(`${randomEmoji(emojisLose)} Kesempatan Habis`)
            .setDescription("Kamu sudah tidak bisa ikut menebak lagi di game ini.")
        ]
      });
    }

    // Kurangi kesempatan
    games[channelId].attempts[m.author.id]--;

    // Kalau benar
    if (guess === games[channelId].number) {
      const winEmbed = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle(`${randomEmoji(emojisWin)} Tebak Angka`)
        .setDescription(
          `${randomEmoji(emojisWin)} **${m.author}** berhasil menebak angka yang benar!\n\n` +
          `🎯 Angka: **${guess}**\n` +
          `${randomEmoji(emojisWin)} Selamat!`
        )
        .setFooter({ text: "Permainan selesai" })
        .setTimestamp();

      m.channel.send({ content: `${randomEmoji(emojisWin)} **Pemenang ditemukan!**`, embeds: [winEmbed] });
      delete games[channelId];
      return collector.stop();
    } 
    // Kalau salah
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
          { name: "Sisa Kesempatan Kamu", value: `${games[channelId].attempts[m.author.id]}`, inline: true }
        )
        .setFooter({ text: "Lanjutkan menebak..." });

      m.channel.send({ embeds: [hintEmbed] });
    }
  });

  // Kalau waktu habis
  collector.on("end", () => {
    if (games[channelId]) {
      const timeoutEmbed = new EmbedBuilder()
        .setColor("#5555ff")
        .setTitle(`${randomEmoji(emojisLose)} Waktu Habis!`)
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
