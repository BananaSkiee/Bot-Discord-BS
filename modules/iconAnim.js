const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, '../assets/icon-frames');
const frames = fs.readdirSync(folderPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

let currentIndex = 0;
const cooldown = 5 * 1000; // 5 detik

function getNextIcon() {
  const framePath = path.join(folderPath, frames[currentIndex]);
  const buffer = fs.readFileSync(framePath);
  currentIndex = (currentIndex + 1) % frames.length;
  return buffer;
}

async function updateIcon(guild) {
  if (!guild || !frames.length) return;
  const buffer = getNextIcon();
  try {
    await guild.setIcon(buffer);
    console.log(`[Icon Updated] ${frames[currentIndex - 1]}`);
  } catch (e) {
    console.error('❌ Gagal update icon:', e.message);
  }
}

// Fungsi otomatis mulai animasi saat bot ready
function startAutoAnimation(client) {
  client.on('ready', async () => {
    const guild = client.guilds.cache.first(); // Ubah kalau kamu punya banyak server
    if (!guild) return console.log("❌ Guild tidak ditemukan.");

    console.log(`🔁 Memulai animasi icon setiap ${cooldown / 1000} detik`);
    setInterval(() => updateIcon(guild), cooldown);
  });
}

module.exports = { startAutoAnimation };
