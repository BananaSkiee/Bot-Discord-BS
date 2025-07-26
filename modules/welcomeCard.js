const Canvas = require("canvas");
const path = require("path");

// --- LANGKAH PENTING: MENAMBAHKAN FONT KUSTOM ---
// 1. Unduh file font yang Anda suka (format .ttf). Anda bisa cari di Google Fonts, misalnya font bernama "Bangers".
// 2. Simpan file font tersebut di dalam folder 'assets' Anda.
// 3. Ganti 'YourCustomFont.ttf' di bawah ini dengan nama file font yang Anda unduh.
//    Contoh: jika nama file-nya Bangers-Regular.ttf, tulis "Bangers-Regular.ttf".

try {
  Canvas.registerFont(path.join(__dirname, "../assets/Bangers-Regular.ttf"), { family: "CustomFont" });
  // 'CustomFont' adalah nama yang akan kita panggil nanti. Anda bisa ganti jika mau.
} catch (error) {
  console.error("Gagal memuat font kustom. Pastikan file font ada di folder assets dan namanya benar. Menggunakan font default.");
  // Jika font gagal dimuat, kita akan tetap menggunakan font standar agar tidak error.
  Canvas.registerFont(path.join(__dirname, "../assets/Bangers-Regular.ttf"), { family: "CustomFont", weight: "bold" });
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

  const avatarSize = 100; // Ukuran avatar lebih kecil
  const avatarX = 120;    // Posisi X avatar (lebih ke kiri)
  const avatarY = 125;    // Posisi Y avatar (di tengah vertikal)

  // 1. Gambar border putus-putus
  ctx.save();
  ctx.beginPath();
  // Lingkaran untuk border dibuat sedikit lebih besar dari avatar
  ctx.arc(avatarX, avatarY, (avatarSize / 2) + 5, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.strokeStyle = '#6EEB54'; // Warna hijau neon seperti di contoh
  ctx.lineWidth = 6;
  ctx.setLineDash([10, 7]); // Atur pola garis [panjang garis, panjang spasi]
  ctx.stroke();
  ctx.restore();

  // 2. Gambar avatar di dalamnya
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip(); // Potong canvas jadi bentuk lingkaran
  ctx.drawImage(avatar, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
  ctx.restore();

  // --- TEKS SELAMAT DATANG (dengan gaya kustom) ---
  ctx.textAlign = "center"; // Teks akan rata tengah dari titik X yang kita tentukan

  // Tentukan gaya teks (outline hitam, isi kuning)
  const welcomeFont = "bold 60px CustomFont";
  const userFont = "bold 45px CustomFont";
  ctx.strokeStyle = "#000000"; // Warna garis luar (outline)
  ctx.lineWidth = 7;           // Ketebalan garis luar
  ctx.fillStyle = "#F2D43D";   // Warna isi teks

  // Atur posisi blok teks
  const textX = 450;
  const textY = 150;

  // Tulis "WELCOME"
  ctx.font = welcomeFont;
  ctx.strokeText("WELCOME", textX, textY); // Tulis outline-nya dulu
  ctx.fillText("WELCOME", textX, textY);    // Tulis isinya setelah itu

  // Tulis nama pengguna (dibuat jadi huruf besar)
  const username = member.user.username.toUpperCase();
  ctx.font = userFont;
  ctx.strokeText(username, textX, textY + 50); // Tulis outline nama
  ctx.fillText(username, textX, textY + 50);   // Tulis isi nama

  return canvas.toBuffer("image/png");
};
