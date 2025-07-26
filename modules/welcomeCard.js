const Canvas = require("canvas");
const path = require("path");

module.exports = async function generateWelcomeCard(member) {
  // Menggunakan dimensi canvas asli Anda
  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  // Memuat gambar latar belakang 'bg.jpeg'
  const background = await Canvas.loadImage(path.join(__dirname, "../assets/bg.jpeg"));
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Memuat avatar pengguna
  const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
  const avatar = await Canvas.loadImage(avatarURL);

  // Kode untuk menggambar avatar (tidak diubah dari kode asli Anda)
  ctx.save();
  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 25, 25, 200, 200);
  ctx.restore();

  // --- PERBAIKAN POSISI DAN GAYA TEKS ---

  // Mengatur warna dan perataan teks
  ctx.fillStyle = "#ffffff"; // Warna putih
  ctx.textAlign = "left";   // Teks rata kiri dari titik koordinat

  // 1. Teks "WELCOME"
  // Dibuat lebih besar dan tebal
  ctx.font = "bold 55px Sans";
  // Ditempatkan di sebelah kanan avatar, sedikit di atas titik tengah vertikal
  ctx.fillText("WELCOME", 270, 130);

  // 2. Teks nama pengguna
  // Dibuat lebih kecil dari "WELCOME"
  ctx.font = "35px Sans";
  // Ditempatkan di bawah teks "WELCOME"
  ctx.fillText(member.user.username, 270, 175);

  return canvas.toBuffer("image/png");
};
