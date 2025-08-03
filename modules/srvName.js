require("dotenv").config();

module.exports = function srvName(client) {
  const GUILD_ID = process.env.GUILD_ID;
  const FULL_NAME = "BananaSkiee Community";
  const SPEED = 1000; // jeda antar frame (ms)
  const BLINK_TIMES = 3;
  const BLINK_DELAY = 300; // kedip cepat

  client.once("ready", async () => {
    console.log("🎬 Animasi nama server aktif.");

    const guild = await client.guilds.fetch(GUILD_ID);
    if (!guild) return console.log("❌ Server tidak ditemukan!");

    async function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function animate() {
      try {
        const len = FULL_NAME.length;
        const mid = Math.floor(len / 2);

        // Stage 1: Muncul dari tengah ke dua arah
        for (let size = 2; size <= len; size++) {
          let start = Math.max(0, mid - Math.floor(size / 2));
          let end = Math.min(len, mid + Math.ceil(size / 2));
          let name = FULL_NAME.slice(start, end);
          if (name.length >= 2) {
            await guild.setName(name);
            await sleep(SPEED);
          }
        }

        // Stage 2: Kedip cepat (pakai 2 karakter blank biar valid)
        for (let i = 0; i < BLINK_TIMES; i++) {
          await guild.setName(FULL_NAME);
          await sleep(BLINK_DELAY);
          await guild.setName("⠀ ⠀"); // dua karakter blank
          await sleep(BLINK_DELAY);
        }

        // Stage 3: Hilang dari tengah ke dua arah
        for (let size = len; size >= 2; size--) {
          let start = Math.max(0, mid - Math.floor(size / 2));
          let end = Math.min(len, mid + Math.ceil(size / 2));
          let name = FULL_NAME.slice(start, end);
          if (name.length >= 2) {
            await guild.setName(name);
            await sleep(SPEED);
          }
        }

        await sleep(500); // jeda sebelum ulang
      } catch (err) {
        console.error("❌ Error animasi:", err);
      } finally {
        animate(); // ulang terus walaupun error
      }
    }

    animate();
  });
};
