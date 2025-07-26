const Canvas = require("canvas");
const path = require("path");

// Logika untuk memuat font kustom (tidak diubah)
let fontFamily = "Sans-Serif";
try {
  const fontPath = path.join(__dirname, "../assets/Bangers-Regular.ttf");
  Canvas.registerFont(fontPath, { family: "CustomFont" });
  fontFamily = "CustomFont";
  console.log("Font kustom 'Bangers-Regular.ttf' berhasil dimuat.");
} catch (error) {
  console.warn("PERINGATAN: Gagal memuat font kustom. Menggunakan font default.");
}


module.exports = async function generateWelcomeCard(member) {
  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  // Gambar Latar Belakang
  const background = await Canvas.loadImage(path.join(__dirname, "../assets/bg.jpeg"));
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Pengaturan Posisi Tengah (tidak diubah)
  const canvasCenterX = canvas.width / 2;
  const avatarSize = 100;
  const avatarX = canvasCenterX;
  const avatarY = 90;
  const welcomeTextY = 180;
  const userTextY = 225;

  // Memuat Avatar
  const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
  const avatar = await Canvas.loadImage(avatarURL);

  // --- MENGGAMBAR AVATAR PENGGUNA ---

  // 1. Gambar border hijau SOLID
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, (avatarSize / 2) + 5, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.strokeStyle = '#6EEB54';
  ctx.lineWidth = 6;
  // baris di bawah ini dihapus untuk membuat garis menjadi solid
  // ctx.setLineDash([10, 7]); 
  ctx.stroke(); // Sekarang akan menggambar garis yang menyambung
  ctx.restore();

  // 2. Gambar avatar di dalamnya
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
  ctx.restore();

  // --- MENGGAMBAR TEKS SELAMAT DATANG ---
  ctx.textAlign = "center";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 7;
  ctx.fillStyle = "#F2D43D";

  // Tulis "WELCOME" (di atas)
  ctx.font = `bold 60px ${fontFamily}`;
  ctx.strokeText("WELCOME", canvasCenterX, welcomeTextY);
  ctx.fillText("WELCOME", canvasCenterX, welcomeTextY);

  // Tulis nama pengguna (di bawahnya)
  const username = member.user.username.toUpperCase();
  ctx.font = `bold 45px ${fontFamily}`;
  ctx.strokeText(username, canvasCenterX, userTextY);
  ctx.fillText(username, canvasCenterX, userTextY);

  return canvas.toBuffer("image/png");
};
