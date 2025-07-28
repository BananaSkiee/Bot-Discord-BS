const fs = require('fs');
const path = require('path');

let animating = false;
let animationInterval;

module.exports = {
  name: 'iconanim',
  description: 'Mulai animasi icon server (simulasi GIF)',
  async execute(message, args) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ Kamu tidak punya izin.');
    }

    const command = args[0];
    const folderPath = path.join(__dirname, '../assets/icon-frames');
    const frames = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg')); // ← disesuaikan

    if (frames.length === 0) return message.reply('❌ Tidak ada frame di folder.');

    const delay = 5000; // ganti icon tiap 5 detik

    if (command === 'start') {
      if (animating) return message.reply('⚠️ Animasi sudah jalan.');

      animating = true;
      let i = 0;
      message.reply(`✅ Mulai animasi icon (${frames.length} frame).`);

      animationInterval = setInterval(async () => {
        const framePath = path.join(folderPath, frames[i]);
        const buffer = fs.readFileSync(framePath);
        try {
          await message.guild.setIcon(buffer);
          console.log(`Frame ${i + 1} applied.`);
        } catch (err) {
          console.error(err);
          message.channel.send('❌ Gagal ganti icon. Mungkin rate limit.');
          clearInterval(animationInterval);
          animating = false;
        }

        i = (i + 1) % frames.length;
      }, delay);
    }

    if (command === 'stop') {
      if (!animating) return message.reply('⚠️ Animasi belum jalan.');
      clearInterval(animationInterval);
      animating = false;
      message.reply('⏹️ Animasi icon dihentikan.');
    }
  }
};
