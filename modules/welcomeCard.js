const Canvas = require("canvas");
const path = require("path");

// Memuat font (tidak ada perubahan di sini)
let fontFamily = "Sans-Serif";
try {
  const fontPath = path.join(__dirname, "../assets/JetBrainsMono-Bold.ttf");
  
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
  const avatarSize = 100;
  const avatarX = canvasCenterX;
  const avatarY = 90;
  const welcomeTextY = 175;
  const userTextY = 220;

  const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
  const avatar = await Canvas.loadImage(avatarURL);

  // --- MENGGAMBAR BORDER LINGKARAN ---
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, (avatarSize / 2) + 5, 0, Math.PI * 2, true);
  ctx.closePath();
  // PERUBAHAN: Warna diubah sesuai permintaan
  ctx.strokeStyle = '#2ECC71'; 
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();

  // Gambar avatar (tidak ada perubahan)
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
  ctx.restore();

  // --- MENGGAMBAR TEKS DENGAN GAYA FINAL ---
  ctx.textAlign = "center";
  ctx.strokeStyle = "#000000";
  // PERUBAHAN: Ketebalan outline disesuaikan agar lebih mirip
  ctx.lineWidth = 4; 

  // 1. Tulis "WELCOME"
  // PERUBAHAN: Warna dan ukuran disesuaikan
  ctx.fillStyle = "#F1C40F"; 
  ctx.font = `55px ${fontFamily}`;
  ctx.strokeText("WELCOME", canvasCenterX, welcomeTextY);
  ctx.fillText("WELCOME", canvasCenterX, welcomeTextY);

  // 2. Tulis nama pengguna
  // PERUBAHAN: Warna dan ukuran disesuaikan
  ctx.fillStyle = "#E67E22"; 
  const username = member.user.username.toUpperCase();
  ctx.font = `40px ${fontFamily}`;
  ctx.strokeText(username, canvasCenterX, userTextY);
  ctx.fillText(username, canvasCenterX, userTextY);

  return canvas.toBuffer("image/png");
};
