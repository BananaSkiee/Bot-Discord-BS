const Canvas = require("canvas");
const path = require("path");

// --- MEMUAT FONT JETBRAINS MONO ---
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
  const avatarSize = 100;
  const avatarX = canvasCenterX;
  const avatarY = 90;

  // --- POSISI Y DIUBAH AGAR TIDAK TERLALU KE BAWAH ---
  const welcomeTextY = 175;
  const userTextY = 215; // Jaraknya dibuat lebih dekat

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

  // --- MENGGAMBAR TEKS DENGAN UKURAN BARU ---
  ctx.textAlign = "center";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 7;
  ctx.fillStyle = "#F2D43D";

  // Tulis "WELCOME" - Ukuran diubah dari 60px menjadi 50px
  ctx.font = `50px ${fontFamily}`;
  ctx.strokeText("WELCOME", canvasCenterX, welcomeTextY);
  ctx.fillText("WELCOME", canvasCenterX, welcomeTextY);

  // Tulis nama pengguna - Ukuran diubah dari 45px menjadi 35px
  const username = member.user.username.toUpperCase();
  ctx.font = `35px ${fontFamily}`;
  ctx.strokeText(username, canvasCenterX, userTextY);
  ctx.fillText(username, canvasCenterX, userTextY);

  return canvas.toBuffer("image/png");
};
