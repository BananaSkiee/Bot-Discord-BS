const mineflayer = require('mineflayer');

// Buat bot
const bot = mineflayer.createBot({
  host: 'BananaUcok.aternos.me', // IP Aternos kamu
  port: 14262,                    // Port Aternos kamu
  username: 'BotKu',              // Nama bot (bisa diganti)
  version: '1.21.4'                // Versi server
});

// Kalau berhasil masuk
bot.once('spawn', () => {
  console.log('✅ Bot berhasil masuk ke server!');
  
  // Anti-AFK: bergerak tiap 30 detik
  setInterval(() => {
    bot.setControlState('forward', true);
    setTimeout(() => {
      bot.setControlState('forward', false);
      bot.look(Math.random() * Math.PI * 2, 0); // Lihat ke arah acak
    }, 1000);
  }, 30000);
});

// Pesan chat dari server → tampilkan di console
bot.on('message', (message) => {
  console.log(message.toAnsi());
});

// Kalau koneksi putus → auto reconnect
bot.on('end', () => {
  console.log('⚠️ Bot terputus, mencoba reconnect...');
  setTimeout(() => {
    process.exit(); // Jalankan ulang via PM2 / npm restart
  }, 5000);
});
