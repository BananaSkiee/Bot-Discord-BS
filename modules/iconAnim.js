let isRunning = false;
let currentIndex = 0;
let interval = null;

const fs = require("fs");
const path = require("path");

// Ambil semua gambar dari folder /assets/icons/
const iconDir = path.join(__dirname, "../assets/icon-frames");
const icons = fs.readdirSync(iconDir).filter(file => file.endsWith(".png"));

async function updateIcon(guild) {
  if (!guild) return;
  const iconPath = path.join(iconDir, icons[currentIndex]);
  const iconBuffer = fs.readFileSync(iconPath);

  try {
    await guild.setIcon(iconBuffer);
    console.log(`✅ Icon server diubah: ${icons[currentIndex]}`);
    currentIndex = (currentIndex + 1) % icons.length;
  } catch (err) {
    console.error("❌ Gagal ubah icon:", err);
  }
}

function startAutoAnimation(client) {
  if (isRunning) return;
  isRunning = true;

  const guild = client.guilds.cache.first(); // atau ambil ID spesifik
  if (!guild) return;

  interval = setInterval(() => updateIcon(guild), 5 * 60 * 1000); // 5 menit
    }

async function onMessage(message) {
  if (!message.guild || message.author.bot) return;
  await updateIcon(message.guild);
}

module.exports = {
  startAutoAnimation,
  onMessage
};
