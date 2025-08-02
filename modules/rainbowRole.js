const COLORS = [
  "#FF0000", "#FF7F00", "#FFFF00", "#00FF00",
  "#0000FF", "#4B0082", "#9400D3"
]; // warna rainbow

module.exports = function rainbowRole(client, roleId, interval = 5000) {
  const guild = client.guilds.cache.first();
  if (!guild) return console.log("❌ Bot tidak ada di server.");

  console.log("🌈 Rainbow role aktif untuk role:", roleId);

  let index = 0;
  setInterval(async () => {
    try {
      const role = guild.roles.cache.get(roleId);
      if (!role) return console.log("❌ Role tidak ditemukan.");

      await role.setColor(COLORS[index]);
      console.log(`🎨 Warna role diubah ke ${COLORS[index]}`);

      index = (index + 1) % COLORS.length;
    } catch (err) {
      console.error("❌ Gagal mengubah warna:", err);
    }
  }, interval);
};
