const cron = require("node-cron");
const config = require("./config");

const greetings = {
  morning: [
    "☀️ Selamat pagi semuanya! Jangan lupa sarapan ya!",
    "Pagi! Semoga harimu cerah seperti hatimu 😄",
    "Selamat pagi! Udah ngopi belum?",
    "Pagi! Hari ini semoga menyenangkan~",
    "Bangun bangun! Semangat ya hari ini!"
  ],
  afternoon: [
    "🌤️ Siang! Jangan lupa makan siang~",
    "Siang semuanya, semangat terus ya!",
    "Siang yang panas cocok buat tidur siang... tapi kerja dulu 😅",
    "Semangat terus meski siang ngantuk 🌞",
    "Kalian lagi ngapain di siang hari gini?"
  ],
  night: [
    "🌙 Malam! Waktunya istirahat, jangan begadang~",
    "Selamat malam semua! Semoga mimpi indah ya~",
    "Malam! Jangan lupa cuci kaki sebelum tidur 😴",
    "Good night! Sampai ketemu besok~",
    "Udah makan malam belum? 🍽️"
  ],
  randomQuestions: [
    "Lagi ngapain sekarang?",
    "Ada cerita seru hari ini?",
    "Kalo boleh milih, kamu pengen liburan ke mana?",
    "Lagu yang kamu putar terus minggu ini apa?",
    "Apa makanan favorit kamu?",
    "Pernah nggak sih ngerasa gabut kayak sekarang?",
    "Ada yang mau ngobrol?"
  ]
};

module.exports = (client) => {
  const channelId = config.logChannelId; // channel buat kirim chat otomatis
  const sendMessage = (messages) => {
    const channel = client.channels.cache.get(channelId);
    if (channel && channel.isTextBased()) {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      channel.send(msg).catch(console.error);
    }
  };

  // Jam 7 pagi
  cron.schedule("0 7 * * *", () => {
    sendMessage(greetings.morning);
  });

  // Jam 12 siang
  cron.schedule("0 12 * * *", () => {
    sendMessage(greetings.afternoon);
  });

  // Jam 9 malam
  cron.schedule("0 21 * * *", () => {
    sendMessage(greetings.night);
  });

  // Tiap 4 jam: pertanyaan acak (50% kemungkinan)
  cron.schedule("0 */4 * * *", () => {
    if (Math.random() < 0.5) {
      sendMessage(greetings.randomQuestions);
    }
  });
};
