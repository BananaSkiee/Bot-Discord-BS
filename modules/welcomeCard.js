const Canvas = require("canvas");
const path = require("path");

// KITA TIDAK AKAN MENCOBA MEMUAT FONT KUSTOM SAMA SEKALI UNTUK TES INI

module.exports = async function generateWelcomeCard(member) {
  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  // Gambar Latar Belakang
  const background = await Canvas.loadImage(path.join(__dirname, "../assets/bg.jpeg"));
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  const canvasCenterX = canvas.width / 2;

  // --- MENGGAMBAR TEKS DIAGNOSTIK ---
  // Kita akan menggambar teks yang sangat sederhana dengan font sistem
  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF"; // Teks putih sederhana
  ctx.strokeStyle = "#000000"; // Outline hitam sederhana
  ctx.lineWidth = 4;
  
  // Gunakan font sistem yang paling umum: "Arial"
  // Jika Arial gagal, semua font kustom juga pasti akan gagal.
  ctx.font = `60px Arial`; 

  ctx.strokeText("TES FONT", canvasCenterX, 180); // Gambar outline
  ctx.fillText("TES FONT", canvasCenterX, 180); // Gambar isi

  const username = member.user.username.toUpperCase();
  ctx.font = `45px Arial`;
  ctx.strokeText(username, canvasCenterX, 225);
  ctx.fillText(username, canvasCenterX, 225);


  return canvas.toBuffer("image/png");
};
