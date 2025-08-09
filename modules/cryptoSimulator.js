const { EmbedBuilder } = require("discord.js");

// Konfigurasi Channel
const CHANNELS = {
  BTC: "1397169936467755151",
  ETH: "1394478754297811034",
  BNB: "1402210580466499625"
};

// Data Cryptocurrency
let cryptoData = {
  BTC: { 
    price: 64000, 
    history: [64000, 64500, 64200, 64800, 65000, 64900, 65500, 65800, 66200, 66500, 66300, 66700, 67100, 67500, 68000], 
    messageId: null,
    color: "#F7931A",
    name: "Bitcoin" 
  },
  ETH: { 
    price: 3500,  
    history: [3500, 3550, 3480, 3600, 3580, 3620, 3700, 3750, 3720, 3800, 3850, 3820, 3900, 3950, 4000], 
    messageId: null,
    color: "#627EEA",
    name: "Ethereum" 
  },
  BNB: { 
    price: 400,   
    history: [400, 410, 395, 405, 415, 408, 420, 425, 430, 435, 440, 445, 450, 455, 460], 
    messageId: null,
    color: "#F3BA2F",
    name: "Binance Coin" 
  }
};

// Fungsi untuk simulasi perubahan harga
function getPriceChange() {
  const chance = Math.random();
  if (chance < 0.4) return Math.floor(Math.random() * 50);
  if (chance < 0.7) return Math.floor(Math.random() * -50);
  if (chance < 0.85) return Math.floor(Math.random() * 150);
  return Math.floor(Math.random() * -150);
}

// Fungsi untuk membuat grafik ASCII yang lebih baik
function generateTextGraph(data) {
  const width = 30;
  const height = 10;
  const lastData = data.slice(-width);
  const min = Math.min(...lastData);
  const max = Math.max(...lastData);
  const range = max - min || 1;
  
  // Buat grid grafik
  let grid = Array(height).fill().map(() => Array(width).fill(' '));
  
  // Isi grid dengan data
  lastData.forEach((value, x) => {
    const y = Math.floor(((value - min) / range) * (height - 1));
    grid[height - 1 - y][x] = '█';
    
    // Tambahkan garis vertikal untuk koneksi
    for (let i = height - y; i < height; i++) {
      if (grid[i][x] === ' ') {
        grid[i][x] = '│';
      }
    }
  });
  
  // Gabungkan menjadi string
  let graph = grid.map(row => `\`${row.join('')}\``).join('\n');
  graph += `\n‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾`;
  
  return graph;
}

// Command !grafik
async function handleGrafikCommand(message, client) {
  const coin = "BTC"; // Default ke BTC
  const data = cryptoData[coin];

  // Hapus pesan lama dari bot
  const messages = await message.channel.messages.fetch({ limit: 10 });
  const oldMsg = messages.find(
    (msg) => msg.author.id === client.user.id && msg.embeds?.[0]?.title?.includes("Grafik")
  );
  if (oldMsg) await oldMsg.delete().catch(() => {});

  // Buat embed baru
  const chart = generateTextGraph(data.history);
  const currentPrice = data.price;
  const previousPrice = data.history[data.history.length - 2] || currentPrice;
  const change = currentPrice - previousPrice;
  const changeText = change >= 0 ? `+${change}` : change;

  const embed = new EmbedBuilder()
    .setTitle(`📊 Grafik ${data.name} (${coin})`)
    .setDescription(chart)
    .addFields(
      { name: 'Harga Saat Ini', value: `$${currentPrice.toLocaleString()}`, inline: true },
      { name: 'Perubahan', value: `$${changeText.toLocaleString()}`, inline: true }
    )
    .setColor(data.color)
    .setFooter({
      text: "© Copyright | BananaSkiee Community",
      iconURL: "https://i.imgur.com/RGp8pqJ.jpeg"
    });

  const newMsg = await message.channel.send({ embeds: [embed] });
  data.messageId = newMsg.id;
}

// Update harga otomatis
async function updatePrices(client) {
  for (const coin in cryptoData) {
    const data = cryptoData[coin];
    const last = data.price;
    const change = getPriceChange();
    const next = Math.max(1, last + change);

    data.price = next;
    data.history.push(next);
    if (data.history.length > 30) data.history.shift();

    try {
      const channel = await client.channels.fetch(CHANNELS[coin]);
      if (!channel?.isTextBased()) continue;

      const chart = generateTextGraph(data.history);
      const previousPrice = data.history[data.history.length - 2] || next;
      const priceChange = next - previousPrice;
      const changeText = priceChange >= 0 ? `+${priceChange}` : priceChange;

      const embed = new EmbedBuilder()
        .setTitle(`📊 Grafik ${data.name} (${coin})`)
        .setDescription(chart)
        .addFields(
          { name: 'Harga Saat Ini', value: `$${next.toLocaleString()}`, inline: true },
          { name: 'Perubahan', value: `$${changeText.toLocaleString()}`, inline: true }
        )
        .setColor(data.color)
        .setFooter({
          text: "© Copyright | BananaSkiee Community",
          iconURL: "https://i.imgur.com/RGp8pqJ.jpeg"
        });

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

  // Loop setiap 5-15 detik
  setTimeout(() => updatePrices(client), Math.floor(Math.random() * 10000) + 5000);
}

// Ekspor fungsi
module.exports = function startCrypto(client) {
  updatePrices(client);
};

module.exports.handleGrafikCommand = handleGrafikCommand;
