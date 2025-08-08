const { EmbedBuilder } = require("discord.js");

// === Konfigurasi ===
const CHANNELS = {
  BTC: "1397169936467755151",
  ETH: "1394478754297811034",
  BNB: "1402210580466499625"
};

// === Data Sementara (Tanpa JSON) ===
let cryptoData = {
  BTC: {
    price: 64000,
    history: [64000, 64500, 64200, 64800, 65000, 64900, 65500],
    messageId: null
  },
  ETH: {
    price: 3500,
    history: [3500, 3550, 3480, 3600, 3580, 3620, 3700],
    messageId: null
  },
  BNB: {
    price: 400,
    history: [400, 410, 395, 405, 415, 408, 420],
    messageId: null
  }
};

// === Simulasi Harga Acak ===
function getPriceChange() {
  const chance = Math.random();
  if (chance < 0.4) return Math.floor(Math.random() * 50);
  if (chance < 0.7) return Math.floor(Math.random() * -50);
  if (chance < 0.85) return Math.floor(Math.random() * 150);
  return Math.floor(Math.random() * -150);
}

// === Buat Grafik Teks ===
function generateTextGraph(data) {
  const width = 20;
  const lastData = data.slice(-width);
  const min = Math.min(...lastData);
  const max = Math.max(...lastData);
  const range = max - min || 1;

  let graph = "";
  for (let i = 0; i < lastData.length; i++) {
    const normalized = (lastData[i] - min) / range;
    const height = Math.round(normalized * 7);
    graph += "▁▂▃▄▅▆▇█"[height] || " ";
  }
  return graph;
}

// === Command !grafik ===
async function handleGrafikCommand(message, client) {
  const coin = "BTC";
  const data = cryptoData[coin];

  // Hapus pesan lama dari bot (jika ada)
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

// === Loop Update Harga Otomatis ===
async function updatePrices(client) {
  for (const coin in cryptoData) {
    const last = cryptoData[coin].price;
    const change = getPriceChange();
    const next = Math.max(1, last + change);
    const data = cryptoData[coin];

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

  setTimeout(() => updatePrices(client), Math.floor(Math.random() * 10000) + 5000);
}

// === Ekspor ===
module.exports = function startCrypto(client) {
  updatePrices(client);
};

module.exports.handleGrafikCommand = handleGrafikCommand;
