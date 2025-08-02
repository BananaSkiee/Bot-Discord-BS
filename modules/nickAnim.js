require("dotenv").config();

module.exports = function animatedNickname(client) {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) return console.log("❌ Guild tidak ditemukan.");

  const memberId = process.env.MEMBER_ID; // ID user target
  const animationText = "Member"; // kata yang dianimasikan
  const perLetterDelay = 1000; // 1 detik per huruf
  const fullNameDuration = 5 * 60 * 1000; // 5 menit

  const member = guild.members.cache.get(memberId);
  if (!member) return console.log("❌ Member tidak ditemukan.");

  const originalName = member.displayName;

  async function runAnimation() {
    try {
      // animasi huruf per huruf
      for (let i = 1; i <= animationText.length; i++) {
        const nickname = animationText.substring(0, i);
        await member.setNickname(nickname).catch(() => {});
        await new Promise(r => setTimeout(r, perLetterDelay));
      }

      // ganti ke nama asli + tag selama 5 menit
      await member.setNickname(`${originalName} [Member]`).catch(() => {});
      await new Promise(r => setTimeout(r, fullNameDuration));

      // balik ke nama asli
      await member.setNickname(originalName).catch(() => {});
    } catch (err) {
      console.error("❌ Gagal mengubah nickname:", err);
    }

    // Ulang animasi
    runAnimation();
  }

  runAnimation();
};
