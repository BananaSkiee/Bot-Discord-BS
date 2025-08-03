require("dotenv").config();

module.exports = function srvName(client) {
  const GUILD_ID = process.env.GUILD_ID;
  const FULL_NAME = "BananaSkiee Community";
  const SPEED = 700; // kecepatan tiap frame (ms) untuk nama server
  const BLINK_TIMES = 3;
  const BLINK_DELAY = 300; // kedip agak cepat

  client.once("ready", async () => {
    console.log("🎬 Animasi nama server aktif.");

    const guild = await client.guilds.fetch(GUILD_ID);
    if (!guild) {
      console.log("❌ Server tidak ditemukan!");
      return;
    }

    async function sleep(ms) {
      return new Promise(r => setTimeout(r, ms));
    }

    async function animate() {
      const len = FULL_NAME.length;
      const mid = Math.floor(len / 2);

      // Stage 1: Muncul dari tengah ke dua arah
      for (let size = 1; size <= len; size++) {
        let start = Math.max(0, mid - Math.floor(size / 2));
        let end = Math.min(len, mid + Math.ceil(size / 2));
        await guild.setName(FULL_NAME.slice(start, end));
        await sleep(SPEED);
      }

      // Stage 2: Kedip cepat
      for (let i = 0; i < BLINK_TIMES; i++) {
        await guild.setName("");
        await sleep(BLINK_DELAY);
        await guild.setName(FULL_NAME);
        await sleep(BLINK_DELAY);
      }

      // Stage 3: Hapus dari tengah ke dua arah
      for (let size = len; size >= 0; size--) {
        let start = Math.max(0, mid - Math.floor(size / 2));
        let end = Math.min(len, mid + Math.ceil(size / 2));
        await guild.setName(FULL_NAME.slice(start, end));
        await sleep(SPEED);
      }

      await sleep(500);
      animate();
    }

    animate();
  });
};
