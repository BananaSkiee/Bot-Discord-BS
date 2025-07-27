const Canvas = require("canvas");
const path = require("path");

// Memuat font (tidak ada perubahan)
let fontFamily = "Sans-Serif";
try {
  const fontPath = path.join(__dirname, "../assets/JetBrainsMono-ExtraBold.ttf");
  
  Canvas.registerFont(fontPath, { family: "CustomFont" });
  fontFamily = "CustomFont";
  console.log("Font 'JetBrainsMono-ExtraBold.ttf' berhasil dimuat.");
} catch (error) {
  console.error("GAGAL MEMUAT FONT: Pastikan file 'JetBrainsMono-ExtraBold.ttf' ada di dalam folder 'assets'.");
  console.error(error); 
}


module.exports = async function generateWelcomeCard(member) {
  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  const background = await Canvas.loadImage(path.join(__dirname, "../assets/bg.jpeg"));
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const canvasCenterX = canvas.width / 2;

  // --- PERUBAHAN: UKURAN DAN POSISI DISESUAIKAN ---
  const avatarSize = 111;    // Avatar dibuat lebih besar
  const avatarY = 85;       // Posisi avatar digeser sedikit ke atas
  const welcomeTextY = 170; // Posisi teks disesuaikan
  const userTextY = 200;    // Jarak nama user dibuat lebih dekat ke "WELCOME"

  const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
  const avatar = await Canvas.loadImage(avatarURL);

  // Menggambar border lingkaran
  ctx.save();
  ctx.beginPath();
  ctx.arc(canvasCenterX, avatarY, (avatarSize / 2) + 5, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.strokeStyle = '#2ECC71'; 
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();

  // Gambar avatar di dalamnya
  ctx.save();
  ctx.beginPath();
  ctx.arc(canvasCenterX, avatarY, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, canvasCenterX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
  ctx.restore();

  // --- MENGGAMBAR TEKS DENGAN UKURAN FINAL ---
  ctx.textAlign = "center";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4; 

  // 1. Tulis "WELCOME"
  ctx.fillStyle = "#F1C40F"; 
  // PERUBAHAN: Font dikecilkan agar proporsional dengan avatar baru
  ctx.font = `40px ${fontFamily}`;
  ctx.strokeText("WELCOME", canvasCenterX, welcomeTextY);
  ctx.fillText("WELCOME", canvasCenterX, welcomeTextY);

  // 2. Tulis nama pengguna
  ctx.fillStyle = "#E67E22"; 
  const username = member.user.username.toUpperCase();
  // PERUBAHAN: Font dikecilkan secara signifikan agar lebih mirip contoh
  ctx.font = `20px ${fontFamily}`;
  ctx.strokeText(username, canvasCenterX, userTextY);
  ctx.fillText(username, canvasCenterX, userTextY);

  return canvas.toBuffer("image/png");
};
