const generateTextGraph = require("./generateTextGraph");

let hargaData = [64000, 64500, 64200, 64800, 65000, 64900, 65500];
let messageToEdit = null;
const CHANNEL_ID = "1397169936467755151"; // Ganti ke channel kamu

function getNextDelay() {
  // Delay antara 5–15 detik biar mirip pasar asli
  return Math.floor(Math.random() * 10000) + 5000;
}

function getPriceChange() {
  // Simulasi naik turun halus dan probabilistik
  const chance = Math.random();
  if (chance < 0.4) return Math.floor(Math.random() * 50);    // Naik kecil
  if (chance < 0.7) return Math.floor(Math.random() * -50);   // Turun kecil
  if (chance < 0.85) return Math.floor(Math.random() * 150);  // Naik besar
  return Math.floor(Math.random() * -150);                    // Turun besar
}

async function updateHarga(client) {
  const last = hargaData[hargaData.length - 1];
  const change = getPriceChange();
  const next = last + change;

  hargaData.push(next);
  if (hargaData.length > 20) hargaData.shift();

  const chart = generateTextGraph(hargaData, "BTC");

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;

    if (!messageToEdit) {
      messageToEdit = await channel.send("```" + chart + "```");
    } else {
      await messageToEdit.edit("```" + chart + "```");
    }
  } catch (err) {
    console.error("❌ Gagal kirim grafik crypto:", err);
  }

  // Jadwalkan update selanjutnya
  setTimeout(() => updateHarga(client), getNextDelay());
}

module.exports = function startCryptoSimulation(client) {
  updateHarga(client); // Mulai simulasi
};
