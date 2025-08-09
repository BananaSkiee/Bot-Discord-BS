const { ChannelType, EmbedBuilder } = require("discord.js");
const moment = require("moment-timezone");

// Konfigurasi ucapan sesuai waktu WIB (UTC+7)
const greetings = [
  { 
    hour: 5, // Jam 5 pagi WIB
    title: "🌄 Selamat Pagi Buta",
    message: "Fajar mulai menyingsing, saatnya bangun dan memulai hari dengan semangat baru!",
    color: "#4B6CB7",
    image: "https://i.imgur.com/JiWyXzT.jpg",
    footer: "Jangan lupa sarapan ya!"
  },
  { 
    hour: 7, // Jam 7 pagi WIB
    title: "🌅 Selamat Pagi",
    message: "Semoga hari ini membawa kebahagiaan dan kesuksesan untuk kita semua!",
    color: "#FFD700",
    image: "https://i.imgur.com/5mQzFi9.jpg",
    footer: "Awali hari dengan senyuman :)"
  },
  { 
    hour: 12, // Jam 12 siang WIB
    title: "🍛 Selamat Siang",
    message: "Waktunya istirahat sejenak dan mengisi energi dengan makan siang!",
    color: "#FF7F50",
    image: "https://i.imgur.com/LvZqM7b.jpg",
    footer: "Makan yang bergizi ya!"
  },
  { 
    hour: 15, // Jam 3 sore WIB
    title: "☕ Selamat Sore",
    message: "Saatnya coffee break untuk mengembalikan fokus dan semangat!",
    color: "#E25822",
    image: "https://i.imgur.com/8QZQZQz.jpg",
    footer: "Jangan lupa minum air putih"
  },
  { 
    hour: 18, // Jam 6 sore WIB
    title: "🌇 Selamat Petang",
    message: "Waktunya pulang dan beristirahat setelah seharian beraktivitas!",
    color: "#FF8C00",
    image: "https://i.imgur.com/9QZQZQz.jpg",
    footer: "Hati-hati di jalan!"
  },
  { 
    hour: 21, // Jam 9 malam WIB
    title: "🌙 Selamat Malam",
    message: "Saatnya beristirahat untuk memulihkan energi hari ini!",
    color: "#1E3A8A",
    image: "https://i.imgur.com/7mQzFi9.jpg",
    footer: "Tidur yang nyenyak!"
  }
];

module.exports = (client) => {
  const channelId = process.env.GREETING_CHANNEL;

  // Cek setiap menit untuk akurasi waktu
  setInterval(async () => {
    try {
      // Dapatkan waktu sekarang di zona waktu WIB
      const now = moment().tz('Asia/Jakarta');
      const currentHour = now.hour();
      const currentMinute = now.minute();

      // Kirim hanya pada jam tepat (menit 0) untuk menghindari spam
      if (currentMinute !== 0) return;

      const greeting = greetings.find(g => g.hour === currentHour);
      if (!greeting) return;

      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel || channel.type !== ChannelType.GuildText) return;

      // Buat embed yang cantik
      const embed = new EmbedBuilder()
        .setTitle(greeting.title)
        .setDescription(greeting.message)
        .setColor(greeting.color)
        .setImage(greeting.image)
        .setFooter({ 
          text: greeting.footer + " | Waktu Server: " + now.format('HH:mm') + ' WIB',
          iconURL: "https://i.imgur.com/RGp8pqJ.jpeg"
        })
        .setTimestamp();

      channel.send({ embeds: [embed] }).catch(console.error);

    } catch (error) {
      console.error("Error dalam greeting module:", error);
    }
  }, 60 * 1000); // Cek setiap 1 menit
};
