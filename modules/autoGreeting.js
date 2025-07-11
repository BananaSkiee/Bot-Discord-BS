const { ChannelType } = require("discord.js");

const greetings = [
  { time: 5, message: "🌅 Selamat pagi semua! Semoga harimu menyenangkan!" },
  { time: 12, message: "☀️ Selamat siang! Jangan lupa makan siang ya!" },
  { time: 17, message: "🌇 Selamat sore! Istirahat dulu yuk~" },
  { time: 20, message: "🌙 Selamat malam semua! Jangan tidur terlalu malam ya!" }
];

// Untuk mencatat jam yang sudah dikirim
let sentHours = new Set();

module.exports = async function startAutoGreeting(client) {
  setInterval(async () => {
    const now = new Date();
    const hour = now.getHours();
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return;

    const channel = guild.channels.cache.get(process.env.LOG_CHANNEL_ID); // atau channel id khusus chat
    if (!channel || channel.type !== ChannelType.GuildText) return;

    const matched = greetings.find(g => g.time === hour);
    if (matched && !sentHours.has(hour)) {
      await channel.send(matched.message).catch(console.error);
      sentHours.add(hour);

      // Reset setiap jam
      setTimeout(() => {
        sentHours.delete(hour);
      }, 60 * 60 * 1000); // 1 jam
    }
  }, 60 * 1000); // cek setiap 1 menit
};
