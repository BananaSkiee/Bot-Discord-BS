const Canvas = require("canvas");
const path = require("path");

// --- MEMUAT FONT NOTO SANS YANG LEBIH LENGKAP ---
let fontFamily = "Sans-Serif"; // Font default jika gagal
try {
  // Ganti nama file font menjadi NotoSans-Bold.ttf
  const fontPath = path.join(__dirname, "../assets/NotoSans-Bold.ttf");
  // Daftarkan font dengan nama keluarga "CompleteFont"
  Canvas.registerFont(fontPath, { family: "CompleteFont" });
  fontFamily = "CompleteFont";
  console.log("Font lengkap 'NotoSans-Bold.ttf' berhasil dimuat.");
} catch (error) {
  console.warn("PERINGATAN: Gagal memuat font NotoSans-Bold.ttf. Pastikan file sudah ada di folder 'assets'.");
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
  const welcomeTextY = 180;
  const userTextY = 225;

  const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
  const avatar = await Canvas.loadImage(avatarURL);

  // Gambar border hijau solid
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, (avatarSize / 2) + 5, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.strokeStyle = '#6EEB54';
  ctx.lineWidth = 6;
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

  // --- MENGGAMBAR TEKS DENGAN FONT LENGKAP ---
  ctx.textAlign = "center";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 7;
  ctx.fillStyle = "#F2D43D";

  // Tulis "WELCOME"
  // Gunakan variabel fontFamily yang sekarang merujuk ke "CompleteFont" (Noto Sans)
  ctx.font = `60px ${fontFamily}`; // Ukuran font sudah diatur oleh file 'Bold'
  ctx.strokeText("WELCOME", canvasCenterX, welcomeTextY);
  ctx.fillText("WELCOME", canvasCenterX, welcomeTextY);

  // Tulis nama pengguna
  const username = member.user.username.toUpperCase();
  ctx.font = `45px ${fontFamily}`;
  ctx.strokeText(username, canvasCenterX, userTextY);
  ctx.fillText(username, canvasCenterX, userTextY);

  return canvas.toBuffer("image/png");
};
