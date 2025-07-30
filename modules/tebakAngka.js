const games = {}; // Simpan game per channelId

module.exports = async function tebakAngka(message) {
  const channelId = message.channel.id;

  if (games[channelId]) {
    return message.reply(`⚠ Game Tebak Angka sedang berlangsung! Kirim angka untuk menebak.`);
  }

  const target = Math.floor(Math.random() * 100) + 1;
  games[channelId] = { number: target, attempts: 5 };

  await message.channel.send(
    `🎯 **Tebak Angka Dimulai!**\n` +
    `Aku sudah memilih angka rahasia antara **1 - 100**.\n` +
    `📌 Semua orang di channel ini bisa menebak.\n` +
    `❤️ Kesempatan bersama: **5 kali**.\n` +
    `⏳ Waktu bermain: **5 menit**.\n` +
    `Ketik angka di chat untuk menebak!`
  );

  const filter = m => !m.author.bot && m.channel.id === channelId;
  const collector = message.channel.createMessageCollector({ filter, time: 300000 }); // 5 menit

  collector.on("collect", m => {
    const guess = parseInt(m.content);
    if (isNaN(guess)) return;

    games[channelId].attempts--;

    if (guess === games[channelId].number) {
      m.channel.send(`🏆 **${m.author.username}** berhasil menebak angka **${guess}**! 🎉`);
      delete games[channelId];
      return collector.stop();
    } 
    else if (games[channelId].attempts <= 0) {
      m.channel.send(`💀 Kesempatan habis! Angka yang benar adalah **${games[channelId].number}**.`);
      delete games[channelId];
      return collector.stop();
    } 
    else {
      m.channel.send(
        guess > games[channelId].number
          ? `🔻 Terlalu besar! Sisa kesempatan: **${games[channelId].attempts}**`
          : `🔺 Terlalu kecil! Sisa kesempatan: **${games[channelId].attempts}**`
      );
    }
  });

  collector.on("end", () => {
    if (games[channelId]) {
      message.channel.send(`⏳ Waktu habis! Angka yang benar adalah **${games[channelId].number}**.`);
      delete games[channelId];
    }
  });
};
