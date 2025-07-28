const fs = require('fs');
const path = require('path');

let animating = false;
let animationInterval;

module.exports = {
  name: 'iconanim',
  description: 'Mulai atau hentikan animasi icon server',
  async execute(message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Kamu tidak punya izin.');
    }

    const command = args[0];
    if (!['start', 'stop'].includes(command)) {
      return message.reply('⚠️ Gunakan: `!iconanim start` atau `!iconanim stop`');
    }

    const folderPath = path.join(__dirname, '../assets/icon-frames');
    const frames = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

    if (frames.length === 0) {
      return message.reply('❌ Tidak ada frame di folder `assets/icon-frames`.');
    }

    const delay = 10000; // ganti icon setiap 10 detik (rekomendasi minimum)
    
    if (command === 'start') {
      if (animating) return message.reply('⚠️ Animasi sudah berjalan.');

      animating = true;
      let i = 0;
      message.reply(`✅ Mulai animasi icon (${frames.length} frame, delay ${delay / 1000} detik).`);

      animationInterval = setInterval(async () => {
        const frameName = frames[i];
        const framePath = path.join(folderPath, frameName);

        try {
          const buffer = fs.readFileSync(framePath);
          await message.guild.setIcon(buffer);
          console.log(`[${new Date().toLocaleTimeString()}] Frame ${i + 1}/${frames.length} (${frameName}) diterapkan.`);
        } catch (err) {
          console.error('❌ Gagal set icon:', err);
          message.channel.send('❌ Gagal ganti icon (kemungkinan rate limit). Animasi dihentikan.');
          clearInterval(animationInterval);
          animating = false;
        }

        i = (i + 1) % frames.length;
      }, delay);
    }

    if (command === 'stop') {
      if (!animating) return message.reply('⚠️ Animasi belum berjalan.');
      clearInterval(animationInterval);
      animating = false;
      message.reply('⏹️ Animasi icon dihentikan.');
    }
  }
};
