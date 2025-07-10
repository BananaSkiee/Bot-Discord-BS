const config = require("./config");

const greetings = {
  morning: [
    "☀️ Selamat pagi semuanya! Jangan lupa sarapan ya!",
    "Pagi! Semoga harimu cerah seperti hatimu 😄",
    "Selamat pagi! Udah ngopi belum?",
    "Bangun bangun! Semangat ya hari ini!"
  ],
  afternoon: [
    "🌤️ Siang! Jangan lupa makan siang~",
    "Siang semuanya, semangat terus ya!",
    "Semangat terus meski siang ngantuk 🌞"
  ],
  night: [
    "🌙 Malam! Waktunya istirahat, jangan begadang~",
    "Selamat malam semua! Semoga mimpi indah ya~",
    "Good night! Sampai ketemu besok~"
  ],
  randomQuestions: [
    "Lagi ngapain sekarang?",
    "Ada cerita seru hari ini?",
    "Lagu favorit minggu ini apa?",
    "Pernah gabut kayak sekarang?",
    "Ada yang mau ngobrol?"
  ]
};

function getHours() {
  return new Date().getHours();
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = (client) => {
  const channel = client.channels.cache.get(config.greetingChannelId);
  if (!channel || !channel.isTextBased()) {
    console.warn("❌ Channel tidak ditemukan atau bukan text-based");
    return;
  }

  setInterval(() => {
    const hour = getHours();
    let message;

    if (hour >= 6 && hour < 10) {
      message = getRandom(greetings.morning);
    } else if (hour >= 11 && hour < 15) {
      message = getRandom(greetings.afternoon);
    } else if (hour >= 20 && hour <= 23) {
      message = getRandom(greetings.night);
    } else if (hour % 4 === 0 && Math.random() < 0.5) {
      message = getRandom(greetings.randomQuestions);
    }

    if (message) {
      channel.send(message).catch(console.error);
    }
  }, 1000 * 60 * 60); // Cek setiap 1 jam
};
