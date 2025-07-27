const Canvas = require("canvas");
const path = require("path");

// --- MEMUAT FONT GG SANS (FONT ASLI DISCORD) ---
let fontFamily = "Sans-Serif";
try {
  // Pastikan nama file ini yang ada di folder assets Anda
  const fontPath = path.join(__dirname, "../assets/ggsans-ExtraBold.ttf");
  
  Canvas.registerFont(fontPath, { family: "DiscordFont" });
  fontFamily = "DiscordFont";
  console.log("Font Discord 'ggsans-ExtraBold.ttf' berhasil dimuat.");
} catch (error) {
  console.error("GAGAL MEMUAT FONT: Pastikan file 'ggsans-ExtraBold.ttf' ada di dalam folder 'assets'.");
  console.error(error); 
}


module.exports = async function generateWelcomeCard(member) {
  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  const background = await Canvas.loadImage(path.join(__dirname, "../assets/bg.jpeg"));
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const canvasCenterX = canvas.width / 2;

  // --- PERUBAHAN FINAL: UKURAN & POSISI DISESUAIKAN TOTAL ---
  const avatarSize = 115;    // Avatar diperbesar agar jadi fokus
  const avatarY = 90;        // Posisi Y avatar disesuaikan
  const welcomeTextY = 180;  // Teks diturunkan agar tidak kena avatar
  const userTextY = 215;     // Posisi nama user di bawahnya

  const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
  const avatar = await Canvas.loadImage(avatarURL);

  // Menggambar border lingkaran (warna sudah benar)
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

  // --- MENGGAMBAR TEKS DENGAN GAYA FINAL ---
  ctx.textAlign = "center";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 4; 

  // 1. Tulis "WELCOME"
  ctx.fillStyle = "#F1C40F"; 
  // PERUBAHAN: Ukuran dikecilkan agar proporsional
  ctx.font = `45px ${fontFamily}`;
  ctx.strokeText("WELCOME", canvasCenterX, welcomeTextY);
  ctx.fillText("WELCOME", canvasCenterX, welcomeTextY);

  // 2. Tulis nama pengguna
  ctx.fillStyle = "#E67E22"; 
  const username = member.user.username.toUpperCase();
  // PERUBAHAN: Ukuran dikecilkan secara signifikan agar mirip contoh
  ctx.font = `28px ${fontFamily}`;
  ctx.strokeText(username, canvasCenterX, userTextY);
  ctx.fillText(username, canvasCenterX, userTextY);

  return canvas.toBuffer("image/png");
};
