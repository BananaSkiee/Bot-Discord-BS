const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, '../assets/icon-frames');
const frames = fs.readdirSync(folderPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

let interval;
let currentIndex = 0;
let isRunning = false;
let lastChange = 0;
const cooldown = 5 * 60 * 1000; // 5 menit

function getNextIcon() {
  const framePath = path.join(folderPath, frames[currentIndex]);
  const buffer = fs.readFileSync(framePath);
  currentIndex = (currentIndex + 1) % frames.length;
  lastChange = Date.now();
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

function startAnimation(guild) {
  if (isRunning || !guild) return;
  isRunning = true;

  // Update tiap 5 menit
  interval = setInterval(() => {
    updateIcon(guild);
  }, cooldown);
}

function stopAnimation() {
  isRunning = false;
  if (interval) clearInterval(interval);
}

async function onMessage(message) {
  if (
    !isRunning || 
    !message.guild || 
    message.author.bot || 
    Date.now() - lastChange < cooldown
  ) return;

  await updateIcon(message.guild);
}

module.exports = {
  startAnimation,
  stopAnimation,
  onMessage,
};
