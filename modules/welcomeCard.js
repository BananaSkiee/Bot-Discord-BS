const Canvas = require("canvas");
const path = require("path");

// --- PENDAFTARAN FONT YANG LEBIH AMAN ---
let fontFamily = "Sans-Serif"; // Font default jika font kustom gagal
try {
  const fontPath = path.join(__dirname, "../assets/Bangers-Regular.ttf");
  // Coba daftarkan font
  Canvas.registerFont(fontPath, { family: "CustomFont" });
  // Jika berhasil, kita gunakan "CustomFont"
  fontFamily = "CustomFont";
  console.log("Font kustom 'Bangers-Regular.ttf' berhasil dimuat.");
} catch (error) {
  // Jika gagal, cetak peringatan tapi jangan hentikan aplikasi
  console.warn("PERINGATAN: Gagal memuat font kustom. Pastikan file 'Bangers-Regular.ttf' ada di folder 'assets' dan namanya benar.");
  console.warn("Aplikasi akan berjalan menggunakan font default.");
}


module.exports = async function generateWelcomeCard(member) {
  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  // Gambar Latar Belakang
  const background = await Canvas.loadImage(path.join(__dirname, "../assets/bg.jpeg"));
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // --- AVATAR PENGGUNA (dengan border) ---
  const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
  const avatar = await Canvas.loadImage(avatarURL);

  const avatarSize = 100;
  const avatarX = 120;
  const avatarY = 125;

  // Gambar border putus-putus
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, (avatarSize / 2) + 5, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.strokeStyle = '#6EEB54';
  ctx.lineWidth = 6;
  ctx.setLineDash([10, 7]);
  ctx.stroke();
  ctx.restore();

  // Gambar avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
  ctx.restore();

  // --- TEKS SELAMAT DATANG (menggunakan variabel fontFamily) ---
  ctx.textAlign = "center";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 7;
  ctx.fillStyle = "#F2D43D";

  const textX = 450;
  const textY = 150;

  // Tulis "WELCOME"
  // Perhatikan bagaimana kita menggunakan variabel `fontFamily` di sini
  ctx.font = `bold 60px ${fontFamily}`;
  ctx.strokeText("WELCOME", textX, textY);
  ctx.fillText("WELCOME", textX, textY);

  // Tulis nama pengguna
  const username = member.user.username.toUpperCase();
  ctx.font = `bold 45px ${fontFamily}`;
  ctx.strokeText(username, textX, textY + 50);
  ctx.fillText(username, textX, textY + 50);

  return canvas.toBuffer("image/png");
};
