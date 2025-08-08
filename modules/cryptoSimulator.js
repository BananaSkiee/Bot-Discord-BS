const { EmbedBuilder } = require("discord.js");

// === Konfigurasi Channel ===
const CHANNELS = {
  BTC: "1397169936467755151",
  ETH: "1394478754297811034",
  BNB: "1402210580466499625"
};

// === Data Sementara (Tanpa JSON / DB) ===
let cryptoData = {
  BTC: { price: 64000, history: [64000, 64500, 64200, 64800, 65000, 64900, 65500], messageId: null },
  ETH: { price: 3500,  history: [3500, 3550, 3480, 3600, 3580, 3620, 3700], messageId: null },
  BNB: { price: 400,   history: [400, 410, 395, 405, 415, 408, 420], messageId: null }
};

// === Simulasi Perubahan Harga Acak ===
function getPriceChange() {
  const chance = Math.random();
  if (chance < 0.4) return Math.floor(Math.random() * 50);
  if (chance < 0.7) return Math.floor(Math.random() * -50);
  if (chance < 0.85) return Math.floor(Math.random() * 150);
  return Math.floor(Math.random() * -150);
}

// === Buat Grafik Teks (▁▂▃▄▅▆▇█) ===
function generateTextGraph(data) {
  const width = 20;
  const lastData = data.slice(-width);
  const min = Math.min(...lastData);
  const max = Math.max(...lastData);
  const range = max - min || 1;

  return lastData.map(value => {
    const height = Math.round(((value - min) / range) * 7);
    return "▁▂▃▄▅▆▇█"[height] || " ";
  }).join("");
}

// === Command !grafik (manual) ===
async function handleGrafikCommand(message, client) {
  const coin = "BTC"; // Kamu bisa bikin parsing nama coin dari command nanti
  const data = cryptoData[coin];

  // Hapus grafik lama (dari bot)
  const messages = await message.channel.messages.fetch({ limit: 10 });
  const oldMsg = messages.find(
    (msg) => msg.author.id === client.user.id && msg.embeds?.[0]?.title?.includes("Grafik")
  );
  if (oldMsg) await oldMsg.delete().catch(() => {});

  // Buat grafik baru
  const chart = generateTextGraph(data.history);
  const embed = new EmbedBuilder()
    .setTitle(`📈 Grafik ${coin}`)
    .setDescription(chart)
    .setColor("Blue")
    .setFooter({ text: `$${data.price.toLocaleString()}` });

  const newMsg = await message.channel.send({ embeds: [embed] });
  data.messageId = newMsg.id;
}

// === Update Otomatis Harga dan Grafik ===
async function updatePrices(client) {
  for (const coin in cryptoData) {
    const data = cryptoData[coin];
    const last = data.price;
    const change = getPriceChange();
    const next = Math.max(1, last + change);

    data.price = next;
    data.history.push(next);
    if (data.history.length > 20) data.history.shift();

    try {
      const channel = await client.channels.fetch(CHANNELS[coin]);
      if (!channel?.isTextBased()) continue;

      const chart = generateTextGraph(data.history);
      const embed = new EmbedBuilder()
        .setTitle(`📈 Grafik ${coin}`)
        .setDescription(chart)
        .setColor("Green")
        .setFooter({ text: `$${next.toLocaleString()}` });

      if (data.messageId) {
        try {
          const oldMsg = await channel.messages.fetch(data.messageId);
          await oldMsg.edit({ embeds: [embed] });
        } catch {
          const msg = await channel.send({ embeds: [embed] });
          data.messageId = msg.id;
        }
      } else {
        const msg = await channel.send({ embeds: [embed] });
        data.messageId = msg.id;
      }

    } catch (err) {
      console.error(`❌ Gagal update ${coin}:`, err.message);
    }
  }

  // Loop terus tiap 5-15 detik
  setTimeout(() => updatePrices(client), Math.floor(Math.random() * 10000) + 5000);
}

// === Ekspor Fungsi ===
module.exports = function startCrypto(client) {
  updatePrices(client);
};

module.exports.handleGrafikCommand = handleGrafikCommand;
