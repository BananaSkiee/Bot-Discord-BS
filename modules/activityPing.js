// modules/activityPing.js
const lastActivity = {
  time: Date.now()
};

module.exports = {
  handlePing: (message) => {
    if (message.content.toLowerCase() === "ping") {
      lastActivity.time = Date.now();
      message.reply("✅ Aktif! Bot tetap hidup!");
    }
  },

  startActivityCheck: (client) => {
    setInterval(() => {
      const now = Date.now();
      const diffMinutes = (now - lastActivity.time) / (1000 * 60);

      if (diffMinutes >= 15) {
        console.log("⚠️ Tidak ada aktivitas selama 15 menit. Bot bisa tertidur di hosting gratis.");
      } else {
        console.log("✅ Bot masih aktif. Ada aktivitas dalam 15 menit terakhir.");
      }
    }, 60_000 * 5); // cek setiap 5 menit
  }
};
