// modules/tebakAngka.js
const games = {}; // Simpan game per channelId

module.exports = async function tebakAngka(message) {
  const channelId = message.channel.id;

  if (games[channelId]) {
    return message.reply("⚠ Game sudah dimulai di channel ini! Kirim angka untuk menebak.");
  }

  const target = Math.floor(Math.random() * 100) + 1;
  games[channelId] = { number: target, attempts: 5 };

  message.reply("🎯 Game dimulai! Aku sudah memilih angka 1-100. Semua orang di channel ini bisa nebak! Kalian punya 5 percobaan bersama.");

  const filter = m => !m.author.bot && m.channel.id === channelId;
  const collector = message.channel.createMessageCollector({ filter, time: 30000 });

  collector.on("collect", m => {
    const guess = parseInt(m.content);
    if (isNaN(guess)) return;

    games[channelId].attempts--;

    if (guess === games[channelId].number) {
      m.reply(`✅ Benar! Angkanya adalah **${guess}** 🎉 (${m.author})`);
      delete games[channelId];
      return collector.stop();
    } 
    else if (games[channelId].attempts <= 0) {
      m.reply(`❌ Kesempatan habis! Angka yang benar adalah **${games[channelId].number}**.`);
      delete games[channelId];
      return collector.stop();
    } 
    else if (guess > games[channelId].number) {
      m.reply(`🔻 Terlalu besar! Sisa percobaan: ${games[channelId].attempts}`);
    } 
    else {
      m.reply(`🔺 Terlalu kecil! Sisa percobaan: ${games[channelId].attempts}`);
    }
  });

  collector.on("end", () => {
    if (games[channelId]) {
      message.reply(`⏳ Waktu habis! Angka yang benar adalah **${games[channelId].number}**.`);
      delete games[channelId];
    }
  });
};
