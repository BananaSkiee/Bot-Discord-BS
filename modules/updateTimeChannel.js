const moment = require("moment-timezone");
const cron = require("node-cron");

// Set zona waktu ke Asia/Jakarta
moment.tz.setDefault("Asia/Jakarta");

// Ganti dengan ID voice channel kamu
const CHANNEL_ID = "ISI_CHANNEL_ID_KAMU";

module.exports = (client) => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = moment();
      const hari = now.format("dddd"); // Senin, Selasa, dst
      const tanggal = now.format("D MMMM YYYY"); // 16 Juli 2025
      const jam = now.format("HH:mm"); // 21:45

      const namaBaru = `🕒 ${hari}, ${tanggal} | ${jam} WIB`;

      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) return;

      await channel.setName(namaBaru);
    } catch (err) {
      console.error("Gagal update nama channel waktu:", err);
    }
  });
};
