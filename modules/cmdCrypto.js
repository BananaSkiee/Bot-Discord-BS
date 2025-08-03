const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const cryptoSimulator = require('./cryptoSimulator'); // Import simulator untuk harga

// =====================================
//      LOKASI FILE DATABASE
// =====================================
const usersPath = path.join(__dirname, '../data/cryptoUsers.json');
const passwordsPath = path.join(__dirname, '../data/cryptoPasswords.json');
const historyPath = path.join(__dirname, '../data/transactionHistory.json');
const achievementsPath = path.join(__dirname, '../data/achievements.json'); // Belum digunakan sepenuhnya, hanya sebagai referensi
const loansPath = path.join(__dirname, '../data/loans.json');
const stakesPath = path.join(__dirname, '../data/stakes.json');
const reportsPath = path.join(__dirname, '../data/reports.json');
const owoRatesPath = path.join(__dirname, '../data/owoRates.json'); // Untuk konversi OWO

// =====================================
//      FUNGSI UTILITY (I/O File)
// =====================================
function loadData(filePath, initialData = {}) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    console.error(`❌ Error loading ${filePath}:`, error);
    return initialData;
  }
}

function saveData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function checkIfRegistered(userId) {
  const users = loadData(usersPath);
  return !!users[userId];
}

function logTransaction(type, userId, details) {
    const history = loadData(historyPath, { transactions: [] });
    history.transactions.push({
        timestamp: new Date().toISOString(),
        type,
        userId,
        ...details
    });
    saveData(historyPath, history);
}

// Achievement definitions
// Anda bisa menambahkan badge dan level di sini jika ingin lebih detail
const achievements = {
  'Baby Whale': { requirement: user => user.balance >= 10000, reward: { coin: 500, badge: '🐳' }, description: 'Saldo capai 10,000 BS Coin' },
  'Crypto Apprentice': { requirement: user => user.stats.transactions >= 10, reward: { coin: 200 }, description: '10 transaksi buy/sell' },
  'Hack Newbie': { requirement: user => user.stats.hacks.won >= 1, reward: { item: 'Hack Ticket', amount: 1 }, description: 'Hack pertama sukses' },
  'Bitcoin Baron': { requirement: user => (user.crypto.BTC || 0) >= 1, reward: { btc: 0.01, badge: '₿' }, description: 'Miliki 1 BTC' },
  'Gacha God': { requirement: user => (user.stats.gachaJackpots || 0) >= 3, reward: { item: 'Free Spin', amount: 5 }, description: '3x jackpot dalam 24 jam' },
  'Loan Shark': { requirement: user => (user.stats.totalLoaned || 0) >= 100000, reward: { special: 'bunga_pinjaman_0_persen_3_hari' }, description: 'Total pinjam 100k BS Coin' },
  'Crypto Royalty': { requirement: user => false, reward: { special: 'VIP Lounge Access', badge: '👑' }, description: 'Top 5 leaderboard 7 hari (membutuhkan fitur leaderboard historis)' }, // Placeholder
  'Untouchable': { requirement: user => (Date.now() - (user.lastHacked || user.joinDate)) >= (30 * 24 * 60 * 60 * 1000), reward: { badge: '🛡️' }, description: '30 hari tanpa kena hack' }, // Membutuhkan lastHacked timestamp
  'Satoshi\'s Heir': { requirement: user => user.balance >= 10000000, reward: { special: 'NFT Exclusive', btc: 1 }, description: '10 juta BS Coin' },
  'The Oracle': { requirement: user => user.stats.guess.won >= 10, reward: { special: 'Prediction Boost 2x' }, description: '10x tebak harga benar' },
  // Tambahkan achievement lain sesuai kebutuhan
};

// Fungsi untuk memeriksa dan memberikan achievement
function checkAchievements(user, message) {
  const unlockedAchievements = [];
  for (const name in achievements) {
    if (!user.achievements.includes(name) && achievements[name].requirement(user)) {
      unlockedAchievements.push(name);
      user.achievements.push(name); // Tambahkan ke daftar achievement user

      const reward = achievements[name].reward;
      let rewardString = '';
      if (reward.coin) {
        user.balance += reward.coin;
        rewardString += `• ${reward.coin.toLocaleString()} BS Coin\n`;
      }
      if (reward.btc) {
        user.crypto.BTC = (user.crypto.BTC || 0) + reward.btc;
        rewardString += `• ${reward.btc} BTC\n`;
      }
      if (reward.item) {
        user.inventory[reward.item] = (user.inventory[reward.item] || 0) + reward.amount;
        rewardString += `• ${reward.amount} ${reward.item}\n`;
      }
      if (reward.badge) {
        user.badges = (user.badges || []).concat(reward.badge);
        rewardString += `• Badge "${reward.badge}"\n`;
      }
      if (reward.special) {
        rewardString += `• ${reward.special}\n`;
        // Implementasi logika reward spesial (misal: bunga 0%, akses VIP)
        // Ini mungkin perlu penanganan lebih lanjut di command terkait
      }

      // Kirim DM ke user
      const embed = new EmbedBuilder()
        .setTitle('🎉 [ACHIEVEMENT UNLOCKED!]')
        .setDescription(`🏆 **${name}**`)
        .addFields({ name: '✨ Hadiah', value: rewardString || 'Tidak ada hadiah spesifik.' })
        .setColor('Green');
      message.author.send({ embeds: [embed] }).catch(err => console.error(`Could not send DM to ${message.author.tag}:`, err));
    }
  }
  return unlockedAchievements;
}

// =====================================
//      LOGIKA UTAMA PERINTAH
// =====================================

// Perintah: !register
exports.register = (message) => {
  const users = loadData(usersPath);
  if (users[message.author.id]) {
    return { error: 'Anda sudah terdaftar!' };
  }

  const generateRandomPassword = () => {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
  };
  const newPassword = generateRandomPassword();
  const passwords = loadData(passwordsPath);
  passwords[message.author.id] = newPassword;
  saveData(passwordsPath, passwords);

  users[message.author.id] = {
    balance: 1000,
    crypto: {},
    inventory: { 'Hack Ticket': 0 },
    achievements: [],
    badges: [], // Untuk menyimpan badge yang didapat
    cooldowns: {
      daily: 0,
      work: 0,
      hunt: 0,
      heck: 0,
      resetpw: 0,
    },
    stats: {
        transactions: 0,
        gachaSpins: 0,
        hacks: { won: 0, lost: 0 },
        guess: { won: 0, lost: 0 },
        gachaJackpots: 0,
        totalLoaned: 0, // Untuk achievement Loan Shark
        lastHacked: 0 // Untuk achievement Untouchable
    },
    joinDate: Date.now(),
    level: 1,
    xp: 0,
    loan: null, // Untuk menyimpan detail pinjaman aktif
    stake: null, // Untuk menyimpan detail stake aktif
  };
  saveData(usersPath, users);

  return {
    success: true,
    message: `🎉 **Pendaftaran berhasil!** Saldo awal: **1000 BS Coin**. Gunakan \`!help crypto\` untuk melihat daftar command.`
  };
};

// Perintah: !help crypto
exports.help = () => {
  const embed = new EmbedBuilder()
    .setTitle('📖 Panduan Crypto Game')
    .setDescription('Berikut adalah daftar command yang tersedia:')
    .addFields(
      { name: '🪙 Ekonomi', value: '`!register`, `!balance`, `!price [coin]`, `!buy [coin] [jumlah]`, `!sell [coin] [jumlah]`, `!portfolio`, `!market`, `!richest`', inline: false },
      { name: '🎁 Aktivitas Harian', value: '`!daily`, `!work`, `!hunt`', inline: false },
      { name: '🎮 Game', value: '`!guess [naik/turun] [jumlah]`, `!gacha [tier]`, `!heck`, `!resetpw`, `!achievements`, `!profile [@user]`', inline: false },
      { name: '🏦 Investasi', value: '`!stake [jumlah]`, `!loan [jumlah]`, `!insurance [type]`', inline: false },
      { name: '💌 Sosial', value: '`!donate [@user] [jumlah]`, `!report [@user] [alasan]`, `!history`', inline: false },
      { name: '🤖 AI', value: '`!ask [pertanyaan]`', inline: false },
      { name: '🛡️ Admin (Role Khusus)', value: '`!admin`', inline: false }
    )
    .setColor('Random');
  return { embed };
};

// Perintah: !balance
exports.balance = (message) => {
  const users = loadData(usersPath);
  const user = users[message.author.id];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

  const prices = cryptoSimulator.getPrices();
  let btcValue = (user.crypto.BTC || 0) * (prices.BTC || 0);
  let ethValue = (user.crypto.ETH || 0) * (prices.ETH || 0);
  let bnbValue = (user.crypto.BNB || 0) * (prices.BNB || 0);
  let totalCryptoValue = btcValue + ethValue + bnbValue;
  
  const embed = new EmbedBuilder()
    .setTitle('💰 Saldo & Aset')
    .setDescription(`**BS Coin**: ${user.balance.toLocaleString()} BS Coin\n₿ BTC: ${user.crypto.BTC || 0} (≈ ${btcValue.toLocaleString()} BS Coin)\n🎟️ Hack Ticket: ${user.inventory['Hack Ticket'] || 0}`)
    .addFields(
      { name: 'Total Nilai Aset', value: `${(user.balance + totalCryptoValue).toLocaleString()} BS Coin`, inline: false }
    )
    .setColor('Random');

  return { embed };
};

// Perintah: !price
exports.price = (message, args) => {
    const coin = args[0]?.toUpperCase();
    if (!coin) return { error: 'Silakan tentukan koin (`!price BTC`).' };
    
    const prices = cryptoSimulator.getPrices();
    const history = cryptoSimulator.getPriceHistory(coin);
    if (!history) return { error: 'Koin tidak valid.' };

    const currentPrice = prices[coin];
    const prevPrice = history[history.length - 2] || currentPrice;
    const change = (currentPrice - prevPrice) / prevPrice * 100;

    const chart = cryptoSimulator.generateTextGraph(history, coin);

    const embed = new EmbedBuilder()
        .setTitle(`Harga ${coin}`)
        .setDescription(`\`\`\`${chart}\`\`\``)
        .addFields(
            { name: 'Harga Saat Ini', value: `${currentPrice.toLocaleString()} BS Coin`, inline: true },
            { name: 'Perubahan Terakhir', value: `${change.toFixed(2)}%`, inline: true }
        )
        .setColor('Random');
    return { embed };
};

// Perintah: !buy
exports.buy = (message, args) => {
  const [coin, amountStr] = args;
  const users = loadData(usersPath);
  const user = users[message.author.id];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };
  
  const prices = cryptoSimulator.getPrices();
  const coinToBuy = coin?.toUpperCase();
  const amount = parseFloat(amountStr);

  if (!coinToBuy || !prices[coinToBuy] || isNaN(amount) || amount <= 0) {
    return { error: 'Format salah! Gunakan `!buy [coin] [jumlah]`. Contoh: `!buy BTC 0.5`' };
  }

  const cost = amount * prices[coinToBuy];
  if (user.balance < cost) {
    return { error: `Saldo BS Coin tidak cukup! Anda butuh ${cost.toLocaleString()} BS Coin.` };
  }
  
  user.balance -= cost;
  user.crypto[coinToBuy] = (user.crypto[coinToBuy] || 0) + amount;
  user.stats.transactions++;
  logTransaction('buy', message.author.id, { coin: coinToBuy, amount, cost });
  saveData(usersPath, users);
  
  checkAchievements(user, message);

  return { message: `✅ Berhasil membeli **${amount} ${coinToBuy}** seharga **${cost.toLocaleString()} BS Coin**!` };
};

// Perintah: !sell
exports.sell = (message, args) => {
    const [coin, amountStr] = args;
    const users = loadData(usersPath);
    const user = users[message.author.id];
    if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

    const prices = cryptoSimulator.getPrices();
    const coinToSell = coin?.toUpperCase();
    const amount = parseFloat(amountStr);

    if (!coinToSell || !user.crypto[coinToSell] || isNaN(amount) || amount <= 0 || user.crypto[coinToSell] < amount) {
        return { error: 'Format salah atau aset tidak cukup! Gunakan `!sell [coin] [jumlah]`. Contoh: `!sell ETH 2`' };
    }

    const value = amount * prices[coinToSell];
    user.balance += value;
    user.crypto[coinToSell] -= amount;
    if (user.crypto[coinToSell] <= 0) delete user.crypto[coinToSell];
    user.stats.transactions++;
    logTransaction('sell', message.author.id, { coin: coinToSell, amount, value });
    saveData(usersPath, users);
    
    checkAchievements(user, message);

    return { message: `✅ Berhasil menjual **${amount} ${coinToSell}** dan mendapatkan **${value.toLocaleString()} BS Coin**!` };
};

// Perintah: !portfolio
exports.portfolio = (message) => {
    const users = loadData(usersPath);
    const user = users[message.author.id];
    if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

    const prices = cryptoSimulator.getPrices();
    const assets = Object.keys(user.crypto).map(coin => {
        const amount = user.crypto[coin];
        const value = amount * (prices[coin] || 0);
        return `₿ ${coin.toUpperCase()}: ${amount} (Senilai ${value.toLocaleString()} BS Coin)`;
    });

    const embed = new EmbedBuilder()
        .setTitle('📊 Portofolio')
        .setDescription(assets.join('\n') || 'Tidak ada aset crypto.')
        .setColor('Random');
    return { embed };
};

// Perintah: !daily
exports.daily = (message) => {
  const users = loadData(usersPath);
  const user = users[message.author.id];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };
  
  const now = Date.now();
  const cooldown = 24 * 60 * 60 * 1000;
  if (now - user.cooldowns.daily < cooldown) {
    const remaining = Math.ceil((cooldown - (now - user.cooldowns.daily)) / (1000 * 60 * 60));
    return { error: `Anda harus menunggu **${remaining} jam** lagi untuk klaim harian.` };
  }
  
  const reward = Math.floor(Math.random() * 9901) + 100;
  user.balance += reward;
  user.cooldowns.daily = now;
  saveData(usersPath, users);
  
  checkAchievements(user, message);

  return { message: `🎁 Anda mendapatkan **${reward.toLocaleString()} BS Coin** dari hadiah harian!` };
};

// Perintah: !work
exports.work = (message) => {
  const users = loadData(usersPath);
  const user = users[message.author.id];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };
  
  const now = Date.now();
  const cooldown = 12 * 60 * 60 * 1000;
  if (now - user.cooldowns.work < cooldown) {
    const remaining = Math.ceil((cooldown - (now - user.cooldowns.work)) / (1000 * 60 * 60));
    return { error: `Anda harus menunggu **${remaining} jam** lagi untuk bekerja.` };
  }
  
  const jobs = [
    { name: 'Penambang', reward: () => Math.floor(Math.random() * 51) + 50 },
    { name: 'Trader', reward: () => Math.floor(Math.random() * 121) + 30 },
  ];
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const reward = job.reward();
  
  user.balance += reward;
  user.cooldowns.work = now;
  saveData(usersPath, users);
  
  checkAchievements(user, message);

  return { message: `🔨 Anda bekerja sebagai **${job.name}** dan mendapatkan **${reward} BS Coin**!` };
};

// Perintah: !hunt
exports.hunt = (message) => {
  const users = loadData(usersPath);
  const user = users[message.author.id];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

  const now = Date.now();
  const cooldown = 6 * 60 * 60 * 1000;
  if (now - user.cooldowns.hunt < cooldown) {
    const remaining = Math.ceil((cooldown - (now - user.cooldowns.hunt)) / (1000 * 60 * 60));
    return { error: `Anda harus menunggu **${remaining} jam** lagi untuk berburu.` };
  }

  const success = Math.random() < 0.7;
  let resultMessage;
  if (success) {
    const reward = Math.floor(Math.random() * 71) + 30;
    user.balance += reward;
    resultMessage = `🎉 Anda berhasil berburu dan mendapatkan **${reward} BS Coin**!`;
  } else {
    const loss = Math.floor(Math.random() * 41) + 10;
    user.balance -= loss;
    resultMessage = `😭 Anda gagal berburu dan kehilangan **${loss} BS Coin**!`;
  }

  user.cooldowns.hunt = now;
  saveData(usersPath, users);
  
  checkAchievements(user, message);

  return { message: resultMessage };
};

// Perintah: !guess
exports.guess = (message, args) => {
  const [direction, amountStr] = args;
  const users = loadData(usersPath);
  const user = users[message.author.id];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

  const amount = parseFloat(amountStr);
  if (!['naik', 'turun'].includes(direction) || isNaN(amount) || amount <= 0 || user.balance < amount) {
    return { error: 'Format salah atau saldo tidak cukup! Gunakan `!guess [naik/turun] [jumlah]`. Contoh: `!guess naik 200`' };
  }

  const prices = cryptoSimulator.getPriceHistory('BTC');
  if (prices.length < 2) {
      return { error: 'Belum ada cukup data harga untuk melakukan tebakan.' };
  }
  const lastPrice = prices[prices.length - 1];
  const nextPriceChange = cryptoSimulator.getPriceChange(); // Get a new random change
  const newPrice = lastPrice + nextPriceChange;
  const actualDirection = newPrice > lastPrice ? 'naik' : 'turun';

  if (direction === actualDirection) {
    const reward = amount * 0.5;
    user.balance += reward;
    user.stats.guess.won++;
    saveData(usersPath, users);
    
    checkAchievements(user, message);
    return { message: `🎉 Tebakan Anda benar! Harga BTC ${actualDirection}. Anda mendapatkan **${reward.toLocaleString()} BS Coin**!` };
  } else {
    user.balance -= amount;
    user.stats.guess.lost++;
    saveData(usersPath, users);
    
    checkAchievements(user, message);
    return { message: `😭 Tebakan Anda salah! Harga BTC ${actualDirection}. Anda kehilangan **${amount.toLocaleString()} BS Coin**.` };
  }
};


// Perintah: !gacha
exports.gacha = (message, args) => {
  const tier = args[0] ? args[0].toLowerCase() : null;
  const users = loadData(usersPath);
  const user = users[message.author.id];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

  const gachaTiers = {
    basic: {
        cost: 500,
        rewards: [
            { type: 'coin', min: 50, max: 1000, chance: 0.45 },
            { type: 'btc', min: 0.001, max: 0.05, chance: 0.20 },
            { type: 'ticket', value: 1, chance: 0.15 },
            { type: 'multispin', value: 2, chance: 0.05 },
            { type: 'zonk', chance: 0.15 }
        ]
    },
    premium: {
        cost: 1500,
        rewards: [
            { type: 'coin', min: 200, max: 2000, chance: 0.40 },
            { type: 'btc', min: 0.01, max: 0.5, chance: 0.25 },
            { type: 'ticket', value: 3, chance: 0.10 },
            { type: 'multispin', value: 5, chance: 0.05 },
            { type: 'jackpot', multiplier: 10, chance: 0.01 },
            { type: 'zonk', chance: 0.19 }
        ]
    },
    vip: {
        cost: 2000,
        rewards: [
            { type: 'coin', min: 500, max: 5000, chance: 0.35 },
            { type: 'btc', min: 0.05, max: 2.0, chance: 0.30 },
            { type: 'random_crypto', chance: 0.15 },
            { type: 'multispin', value: 10, chance: 0.05 },
            { type: 'super_jackpot', multiplier: 50, chance: 0.005 },
            { type: 'zonk', chance: 0.145 }
        ]
    }
  };

  if (!tier) {
    const embed = new EmbedBuilder()
      .setTitle('◈◈◈ GACHA TIERS ◈◈◈')
      .setDescription('Pilih tier gacha yang kamu inginkan:')
      .addFields(
        { name: '💰 BASIC SPIN', value: 'Harga: 500 BS Coin\n`!gacha basic`', inline: false },
        { name: '💎 PREMIUM SPIN', value: 'Harga: 1,500 BS Coin\n`!gacha premium`', inline: false },
        { name: '🔥 VIP SPIN', value: 'Harga: 2,000 BS Coin\n`!gacha vip`', inline: false }
      )
      .setColor('Random');
    return { embed };
  }

  const selectedTier = gachaTiers[tier];
  if (!selectedTier) {
    return { error: 'Tier gacha tidak valid! Pilih: `basic`, `premium`, atau `vip`.' };
  }

  if (user.balance < selectedTier.cost) {
    return { error: `Saldo tidak cukup! Butuh ${selectedTier.cost.toLocaleString()} BS Coin untuk spin.` };
  }
  
  user.balance -= selectedTier.cost;
  user.stats.gachaSpins++;
  saveData(usersPath, users);
  
  const roll = Math.random();
  let cumulativeChance = 0;
  let rewardResult;

  for (const reward of selectedTier.rewards) {
    cumulativeChance += reward.chance;
    if (roll <= cumulativeChance) {
      rewardResult = reward;
      break;
    }
  }

  let resultMessage;
  switch (rewardResult.type) {
    case 'coin':
      const coinAmount = Math.floor(Math.random() * (rewardResult.max - rewardResult.min + 1)) + rewardResult.min;
      user.balance += coinAmount;
      resultMessage = `🎉 Selamat! Kamu mendapatkan **${coinAmount.toLocaleString()} BS Coin**!`;
      break;
    case 'btc':
      const btcAmount = parseFloat((Math.random() * (rewardResult.max - rewardResult.min) + rewardResult.min).toFixed(4));
      user.crypto.BTC = (user.crypto.BTC || 0) + btcAmount;
      const btcValue = btcAmount * cryptoSimulator.getPrices().BTC;
      resultMessage = `🎉 Selamat! Kamu mendapatkan **${btcAmount} BTC** (≈ ${btcValue.toLocaleString()} BS Coin)!`;
      break;
    case 'ticket':
      user.inventory['Hack Ticket'] = (user.inventory['Hack Ticket'] || 0) + rewardResult.value;
      resultMessage = `🎟️ Selamat! Kamu mendapatkan **${rewardResult.value} Hack Ticket**!`;
      break;
    case 'multispin':
      resultMessage = `🔄 Selamat! Kamu mendapatkan **${rewardResult.value}x Free Spin** untuk tier ini! (Fitur ini belum diimplementasikan)`;
      break;
    case 'jackpot':
      const jackpot = selectedTier.cost * rewardResult.multiplier;
      user.balance += jackpot;
      user.stats.gachaJackpots = (user.stats.gachaJackpots || 0) + 1;
      resultMessage = `💰 **JACKPOT!** Kamu mendapatkan **${jackpot.toLocaleString()} BS Coin**!`;
      break;
    case 'super_jackpot':
      const superJackpot = selectedTier.cost * rewardResult.multiplier;
      user.balance += superJackpot;
      user.stats.gachaJackpots = (user.stats.gachaJackpots || 0) + 1;
      resultMessage = `✨ **SUPER JACKPOT!** Kamu mendapatkan **${superJackpot.toLocaleString()} BS Coin**!`;
      break;
    case 'zonk':
      resultMessage = '😭 Zonk! Anda tidak mendapatkan apa-apa.';
      break;
    case 'random_crypto':
        const availableCrypto = Object.keys(cryptoSimulator.getPrices()).filter(c => c !== 'BS Coin');
        const randomCryptoCoin = availableCrypto[Math.floor(Math.random() * availableCrypto.length)];
        const randomCryptoAmount = parseFloat((Math.random() * 0.5 + 0.1).toFixed(4)); // Example range
        user.crypto[randomCryptoCoin] = (user.crypto[randomCryptoCoin] || 0) + randomCryptoAmount;
        const randomCryptoValue = randomCryptoAmount * (cryptoSimulator.getPrices()[randomCryptoCoin] || 0);
        resultMessage = `✨ Selamat! Kamu mendapatkan **${randomCryptoAmount} ${randomCryptoCoin}** (≈ ${randomCryptoValue.toLocaleString()} BS Coin)!`;
        break;
    default:
      resultMessage = '❌ Hadiah tidak dikenali.';
  }

  saveData(usersPath, users);
  checkAchievements(user, message);
  return { message: `[||||||||||] SPINNING...\n${resultMessage}` };
};

// Perintah: !heck
exports.heck = (message) => {
  const users = loadData(usersPath);
  const passwords = loadData(passwordsPath);
  const user = users[message.author.id];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

  const now = Date.now();
  const cooldown = 24 * 60 * 60 * 1000;
  
  // Check if user has a ticket or is on cooldown
  const hasTicket = (user.inventory['Hack Ticket'] || 0) > 0;
  if (!hasTicket && now - user.cooldowns.heck < cooldown) {
    const remaining = Math.ceil((cooldown - (now - user.cooldowns.heck)) / (1000 * 60 * 60));
    return { error: `Anda harus menunggu **${remaining} jam** lagi untuk hack atau gunakan Hack Ticket.` };
  }

  // Choose a random user to hack
  const otherUsers = Object.keys(users).filter(id => id !== message.author.id && users[id].balance > 0); // Only hack users with balance
  if (otherUsers.length === 0) {
    return { error: 'Tidak ada user lain yang bisa di-hack saat ini.' };
  }
  const targetId = otherUsers[Math.floor(Math.random() * otherUsers.length)];
  const target = users[targetId];
  const targetPassword = passwords[targetId];

  // Generate 4 password choices (1 correct, 3 fake)
  const choices = [targetPassword];
  while (choices.length < 4) {
    const fakePassword = Math.random().toString(36).substring(2, 7).toUpperCase();
    if (!choices.includes(fakePassword) && fakePassword !== targetPassword) {
      choices.push(fakePassword);
    }
  }
  choices.sort(() => Math.random() - 0.5);

  const embed = new EmbedBuilder()
    .setTitle(`🔐 Hack Akun ${message.guild.members.cache.get(targetId)?.user.username || 'User Tidak Dikenal'}`)
    .setDescription(`Pilih password yang benar dalam 30 detik untuk mencuri 25% saldo mereka.`)
    .addFields(
      { name: 'Pilihan Password', value: choices.map((p, i) => `${i + 1}. \`${p}\``).join('\n'), inline: false }
    )
    .setColor('Red');

  message.reply({ embeds: [embed] }).then(async msg => {
    const filter = m => m.author.id === message.author.id;
    const collector = msg.channel.createMessageCollector({ filter, time: 30000, max: 1 });

    collector.on('collect', async m => {
      const choice = m.content.toUpperCase();
      
      // Consume ticket/apply cooldown regardless of choice validity, once input is given
      if (hasTicket) {
          user.inventory['Hack Ticket']--;
      } else {
          user.cooldowns.heck = now;
      }
      saveData(usersPath, users); // Save user data after ticket/cooldown update

      if (choices.includes(choice)) {
        if (choice === targetPassword) {
          // Success
          const stolenAmount = Math.floor(target.balance * 0.25);
          target.balance -= stolenAmount;
          user.balance += stolenAmount;
          user.stats.hacks.won++;
          target.stats.lastHacked = now; // Update target's last hacked time
          saveData(usersPath, users);
          checkAchievements(user, message);

          await message.reply(`✅ **Hack Berhasil!** Kamu berhasil mencuri **${stolenAmount.toLocaleString()} BS Coin** dari ${message.guild.members.cache.get(targetId)?.user.username || 'User Tidak Dikenal'}!`);
        } else {
          // Failure
          user.stats.hacks.lost++;
          saveData(usersPath, users);
          checkAchievements(user, message);
          await message.reply(`❌ **Hack Gagal!** Password yang kamu pilih salah.`);
        }
      } else {
        await message.reply('Pilihan tidak valid. Hack gagal.');
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.reply('Waktu habis! Hack gagal.');
        // If time runs out and no choice was made, still apply cooldown/consume ticket if applicable
        if (!collected.first()) { // If no message was collected at all
            if (hasTicket) {
                user.inventory['Hack Ticket']--;
            } else {
                user.cooldowns.heck = now;
            }
            saveData(usersPath, users);
        }
      }
    });
  });

  return { success: true, message: 'Menunggu pilihan password...' };
};


// Perintah: !resetpw
exports.resetpw = (message) => {
  const users = loadData(usersPath);
  if (!users[message.author.id]) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

  const passwords = loadData(passwordsPath);
  const generateRandomPassword = () => {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
  };
  const newPassword = generateRandomPassword();
  
  passwords[message.author.id] = newPassword;
  saveData(passwordsPath, passwords);

  message.author.send(`🔑 Password baru Anda adalah: \`${newPassword}\``)
    .catch(() => message.reply("Gagal mengirim DM. Pastikan DM Anda aktif."));
  
  return { message: '✅ Password baru telah dikirimkan melalui DM.' };
};

// Perintah: !stake
exports.stake = (message, args) => {
    const users = loadData(usersPath);
    const user = users[message.author.id];
    if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

    const amount = parseFloat(args[0]);
    if (isNaN(amount) || amount <= 0 || user.balance < amount) {
        return { error: 'Jumlah stake tidak valid atau saldo tidak cukup.' };
    }

    if (user.stake && user.stake.amount > 0) {
        return { error: 'Anda sudah memiliki stake aktif. Tarik stake Anda terlebih dahulu!' };
    }

    const stakes = loadData(stakesPath, {});
    stakes[message.author.id] = { amount, timestamp: Date.now() };
    saveData(stakesPath, stakes);

    user.balance -= amount;
    user.stake = { amount, timestamp: Date.now() }; // Simpan di user data juga
    saveData(usersPath, users);

    return { message: `✅ Berhasil melakukan stake **${amount.toLocaleString()} BS Coin**! Anda akan mendapatkan bunga 1% per jam.` };
};

// Perintah: !loan
exports.loan = (message, args) => {
  const users = loadData(usersPath);
  const user = users[message.author.id];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

  if (user.loan && user.loan.amount > 0) {
      return { error: 'Anda sudah memiliki pinjaman aktif. Lunasi pinjaman Anda terlebih dahulu!' };
  }

  const amount = parseFloat(args[0]);
  if (isNaN(amount) || amount <= 0) {
      return { error: 'Jumlah pinjaman tidak valid.' };
  }

  let tier = 'Bronze';
  let maxLoan = 1000;
  let interestRatePerDay = 0.07; // 7% per hari
  let lateFeePerDay = 0.10; // 10% per hari

  // Leveling system for loan tiers (simplified, assuming XP translates to level)
  if (user.level >= 11 && user.level <= 30) {
      tier = 'Silver';
      maxLoan = 10000;
      interestRatePerDay = 0.05;
      lateFeePerDay = 0.08;
  } else if (user.level > 30) {
      tier = 'Gold';
      maxLoan = 50000;
      interestRatePerDay = 0.03;
      lateFeePerDay = 0.05;
  }

  if (amount > maxLoan) {
      return { error: `Pinjaman maksimal untuk tier Anda (${tier}, Level ${user.level}) adalah **${maxLoan.toLocaleString()} BS Coin**.` };
  }
  
  const loans = loadData(loansPath, {});
  const loanDetails = {
      amount,
      timestamp: Date.now(),
      tier,
      interestRatePerDay,
      lateFeePerDay,
      dueDate: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 hari
  };
  loans[message.author.id] = loanDetails;
  saveData(loansPath, loans);

  user.balance += amount;
  user.loan = loanDetails; // Simpan di user data juga
  user.stats.totalLoaned = (user.stats.totalLoaned || 0) + amount; // Untuk achievement
  saveData(usersPath, users);
  
  checkAchievements(user, message);

  return { message: `✅ Anda berhasil meminjam **${amount.toLocaleString()} BS Coin** (Tier ${tier}). Anda memiliki 7 hari untuk mengembalikan.` };
};

// Perintah: !insurance (Placeholder)
exports.insurance = () => {
    return { error: 'Fitur asuransi masih dalam pengembangan.' };
};

// Perintah: !market
exports.market = () => {
    const prices = cryptoSimulator.getPrices();
    const marketList = Object.keys(prices).map(coin => {
        return `${coin}: ${prices[coin].toLocaleString()} BS Coin`;
    });

    const embed = new EmbedBuilder()
        .setTitle('🏪 MARKET')
        .setDescription(marketList.join('\n'))
        .setColor('Blurple');
    return { embed };
};

// Perintah: !richest
exports.richest = (message) => {
    const users = loadData(usersPath);
    const prices = cryptoSimulator.getPrices();

    const leaderboard = Object.keys(users).map(id => {
        const user = users[id];
        let totalAsset = user.balance;
        for (const coin in user.crypto) {
            totalAsset += (user.crypto[coin] || 0) * (prices[coin] || 0);
        }
        return { id, totalAsset };
    });

    leaderboard.sort((a, b) => b.totalAsset - a.totalAsset);

    const embed = new EmbedBuilder()
        .setTitle('🏆 Top 10 Player Terkaya')
        .setDescription(leaderboard.slice(0, 10).map((u, i) => {
            const member = message.guild.members.cache.get(u.id);
            const username = member ? member.user.username : 'User Tidak Dikenal';
            // Menampilkan badge jika ada
            const userBadges = users[u.id].badges || [];
            const badgeString = userBadges.length > 0 ? ` ${userBadges.join('')}` : '';
            return `${i + 1}. **${username}** » ${u.totalAsset.toLocaleString()} BS Coin${badgeString}`;
        }).join('\n'))
        .setColor('Gold');
    
    return { embed };
};

// Perintah: !achievements
exports.achievements = (message, args) => {
    const users = loadData(usersPath);
    const targetMention = args[0];
    const targetId = targetMention ? targetMention.match(/<@!?(\d+)>/)?.[1] : message.author.id;
    const user = users[targetId];

    if (!user) {
      return { error: 'Pengguna tidak terdaftar!' };
    }

    const achieved = user.achievements;
    const progress = Object.keys(achievements).filter(name => !achieved.includes(name));

    const embed = new EmbedBuilder()
        .setTitle(`🎯 Daftar Achievement Crypto`)
        .setDescription('━━━━━━━━━━━━━━━━━━━━━━━')
        .addFields(
            { name: '🎖️ TIER DASAR', value: Object.keys(achievements).filter(name => name === 'Baby Whale' || name === 'Crypto Apprentice' || name === 'Hack Newbie').map(name => {
                const status = achieved.includes(name) ? '✔️' : '◻️';
                return `${status} **${name}**\n   ├─ Syarat: ${achievements[name].description}\n   └─ Hadiah: ${achievements[name].reward.coin ? `${achievements[name].reward.coin} BS Coin` : ''}${achievements[name].reward.btc ? ` + ${achievements[name].reward.btc} BTC` : ''}${achievements[name].reward.item ? ` + ${achievements[name].reward.amount} ${achievements[name].reward.item}` : ''}${achievements[name].reward.badge ? ` + Badge ${achievements[name].reward.badge}` : ''}`;
            }).join('\n\n'), inline: false },
            { name: '🔮 TIER EPIK', value: Object.keys(achievements).filter(name => name === 'Bitcoin Baron' || name === 'Gacha God' || name === 'Loan Shark').map(name => {
                const status = achieved.includes(name) ? '✔️' : '◻️';
                return `${status} **${name}**\n   ├─ Syarat: ${achievements[name].description}\n   └─ Hadiah: ${achievements[name].reward.coin ? `${achievements[name].reward.coin} BS Coin` : ''}${achievements[name].reward.btc ? ` + ${achievements[name].reward.btc} BTC` : ''}${achievements[name].reward.item ? ` + ${achievements[name].reward.amount} ${achievements[name].reward.item}` : ''}${achievements[name].reward.badge ? ` + Badge ${achievements[name].reward.badge}` : ''}${achievements[name].reward.special ? ` + ${achievements[name].reward.special}` : ''}`;
            }).join('\n\n'), inline: false },
            { name: '💎 TIER VIP', value: Object.keys(achievements).filter(name => name === 'Crypto Royalty' || name === 'Untouchable').map(name => {
                const status = achieved.includes(name) ? '✔️' : '◻️';
                return `${status} **${name}**\n   ├─ Syarat: ${achievements[name].description}\n   └─ Hadiah: ${achievements[name].reward.coin ? `${achievements[name].reward.coin} BS Coin` : ''}${achievements[name].reward.btc ? ` + ${achievements[name].reward.btc} BTC` : ''}${achievements[name].reward.item ? ` + ${achievements[name].reward.amount} ${achievements[name].reward.item}` : ''}${achievements[name].reward.badge ? ` + Badge ${achievements[name].reward.badge}` : ''}${achievements[name].reward.special ? ` + ${achievements[name].reward.special}` : ''}`;
            }).join('\n\n'), inline: false },
            { name: '🔥 TIER LEGENDARY', value: Object.keys(achievements).filter(name => name === 'Satoshi\'s Heir' || name === 'The Oracle').map(name => {
                const status = achieved.includes(name) ? '✔️' : '◻️';
                return `${status} **${name}**\n   ├─ Syarat: ${achievements[name].description}\n   └─ Hadiah: ${achievements[name].reward.coin ? `${achievements[name].reward.coin} BS Coin` : ''}${achievements[name].reward.btc ? ` + ${achievements[name].reward.btc} BTC` : ''}${achievements[name].reward.item ? ` + ${achievements[name].reward.amount} ${achievements[name].reward.item}` : ''}${achievements[name].reward.badge ? ` + Badge ${achievements[name].reward.badge}` : ''}${achievements[name].reward.special ? ` + ${achievements[name].reward.special}` : ''}`;
            }).join('\n\n'), inline: false }
        )
        .setFooter({ text: '💡 Gunakan `!progress [nama achievement]` untuk cek perkembanganmu!' })
        .setColor('Green');
    
    return { embed };
};

// Perintah: !progress
exports.progress = (message, args) => {
    const users = loadData(usersPath);
    const user = users[message.author.id];
    if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

    const achievementName = args.join(' ');
    const achievement = achievements[achievementName];

    if (!achievement) return { error: 'Achievement tidak valid.' };
    
    let progressString = 'Progress tidak dapat ditampilkan untuk achievement ini.';
    let currentProgress = 0;
    let requiredProgress = 1; // Default

    if (achievementName === 'Baby Whale') {
        currentProgress = user.balance;
        requiredProgress = 10000;
    } else if (achievementName === 'Crypto Apprentice') {
        currentProgress = user.stats.transactions;
        requiredProgress = 10;
    } else if (achievementName === 'Hack Newbie') {
        currentProgress = user.stats.hacks.won;
        requiredProgress = 1;
    } else if (achievementName === 'Bitcoin Baron') {
        currentProgress = user.crypto.BTC || 0;
        requiredProgress = 1;
    } else if (achievementName === 'Gacha God') {
        currentProgress = user.stats.gachaJackpots || 0;
        requiredProgress = 3;
    } else if (achievementName === 'Loan Shark') {
        currentProgress = user.stats.totalLoaned || 0;
        requiredProgress = 100000;
    } else if (achievementName === 'Untouchable') {
        const lastHackedTime = user.stats.lastHacked || user.joinDate;
        currentProgress = Math.floor((Date.now() - lastHackedTime) / (24 * 60 * 60 * 1000));
        requiredProgress = 30;
    } else if (achievementName === 'Satoshi\'s Heir') {
        currentProgress = user.balance;
        requiredProgress = 10000000;
    } else if (achievementName === 'The Oracle') {
        currentProgress = user.stats.guess.won;
        requiredProgress = 10;
    }

    const percentage = Math.min(100, (currentProgress / requiredProgress) * 100);
    progressString = `${achievement.description}\nProgress: [${'█'.repeat(Math.floor(percentage / 10))}${'░'.repeat(10 - Math.floor(percentage / 10))}] ${percentage.toFixed(0)}%`;


    const embed = new EmbedBuilder()
        .setTitle(`🎯 Progress: ${achievementName}`)
        .setDescription(progressString)
        .setColor('Blue');
    return { embed };
};

// Perintah: !profile
exports.profile = (message, args) => {
    const users = loadData(usersPath);
    const prices = cryptoSimulator.getPrices();
    const targetMention = args[0];
    const targetId = targetMention ? targetMention.match(/<@!?(\d+)>/)?.[1] : message.author.id;
    const user = users[targetId];

    if (!user) return { error: 'Pengguna tidak terdaftar!' };

    const member = message.guild.members.cache.get(targetId);
    const username = member?.user.username || 'User Tidak Dikenal';
    const totalCryptoValue = Object.keys(user.crypto).reduce((sum, coin) => sum + ((user.crypto[coin] || 0) * (prices[coin] || 0)), 0);
    const totalAsset = user.balance + totalCryptoValue;
    const joinDays = Math.floor((Date.now() - user.joinDate) / (1000 * 60 * 60 * 24));
    
    // Level Tiers
    let levelTier = '🏅 Newbie';
    if (user.level >= 11 && user.level <= 30) levelTier = '🎖️ Trader';
    else if (user.level >= 31 && user.level <= 50) levelTier = '💍 Whale';
    else if (user.level > 50) levelTier = '👑 King';

    const embed = new EmbedBuilder()
        .setTitle(`▄▀▄▀▄ PROFIL EKSKLUSIF ▄▀▄▀▄`)
        .setDescription(`**${levelTier} ${username}**\n**🏆 Level ${user.level}** [${'█'.repeat(Math.floor(user.xp / 10))}${'░'.repeat(10 - Math.floor(user.xp / 10))}] ${user.xp}%`)
        .addFields(
            { name: '💰 EKONOMI', value: `├─ 💵 BS Coin: **${user.balance.toLocaleString()}**\n├─ ₿ BTC: **${(user.crypto.BTC || 0)}** (≈ $${(user.crypto.BTC * prices.BTC).toLocaleString()})\n└─ 🏦 Total Aset: **≈ ${totalAsset.toLocaleString()} BS Coin**`, inline: false },
            { name: '🎮 AKTIVITAS', value: `├─ 🔄 Transaksi: **${user.stats.transactions}x**\n├─ 🎰 Gacha Spin: **${user.stats.gachaSpins}x**\n├─ 🔐 Hack: **${user.stats.hacks.won}W/${user.stats.hacks.lost}L**\n└─ 📅 Bergabung: **${joinDays} Hari**`, inline: false },
            { name: '🏆 ACHIEVEMENTS', value: (user.achievements.length > 0 ? user.achievements.slice(0, 5).map(a => `✔️ ${a}`).join('\n') : 'Belum ada achievement.') + '\n' + (user.badges && user.badges.length > 0 ? `💎 Badges: ${user.badges.join('')}` : ''), inline: false },
            // Placeholder for latest achievement DM - ini perlu disimpan di user data jika ingin ditampilkan
        )
        .setColor('Purple');
    
    return { embed };
};

// Perintah: !donate
exports.donate = (message, args) => {
  const users = loadData(usersPath);
  const [targetMention, amountStr] = args;
  const targetId = targetMention?.match(/<@!?(\d+)>/)?.[1];
  const amount = parseFloat(amountStr);

  if (!targetId || isNaN(amount) || amount <= 0) {
      return { error: 'Format salah! Gunakan `!donate [@user] [jumlah]`. Contoh: `!donate @BananaSkiee 100`' };
  }
  
  const senderId = message.author.id;
  const sender = users[senderId];
  const target = users[targetId];
  
  if (!sender || !target) {
      return { error: 'Pengirim atau penerima belum terdaftar.' };
  }

  if (sender.balance < amount) {
      return { error: 'Saldo BS Coin Anda tidak cukup untuk donasi.' };
  }
  
  if (senderId === targetId) {
    return { error: 'Anda tidak bisa donasi ke diri sendiri.' };
  }

  sender.balance -= amount;
  target.balance += amount;
  logTransaction('donate', senderId, { amount, targetId });
  saveData(usersPath, users);
  
  return { message: `✅ Berhasil mendonasikan **${amount.toLocaleString()} BS Coin** ke ${targetMention}!` };
};

// Perintah: !report
exports.report = (message, args) => {
    const [targetMention, ...reasonArr] = args;
    const targetId = targetMention?.match(/<@!?(\d+)>/)?.[1];
    const reason = reasonArr.join(' ');
    
    if (!targetId || !reason) {
        return { error: 'Format salah! Gunakan `!report [@user] [alasan]`. Contoh: `!report @Scammer mencoba hack`' };
    }

    const reports = loadData(reportsPath, { reports: [] });
    reports.reports.push({
        reporterId: message.author.id,
        targetId,
        reason,
        timestamp: new Date().toISOString()
    });
    saveData(reportsPath, reports);

    return { message: '✅ Laporan Anda telah kami terima dan akan segera ditinjau oleh admin.' };
};

// Perintah: !history
exports.history = (message) => {
    const transactions = loadData(historyPath, { transactions: [] }).transactions;
    const userTransactions = transactions.filter(t => t.userId === message.author.id);

    if (userTransactions.length === 0) {
        return { error: 'Anda tidak memiliki riwayat transaksi.' };
    }

    const historyText = userTransactions.slice(-5).map(t => { // Ambil 5 transaksi terakhir
        const date = new Date(t.timestamp).toLocaleString();
        if (t.type === 'buy') return `[${date}] Membeli ${t.amount} ${t.coin} seharga ${t.cost.toLocaleString()} BS Coin.`;
        if (t.type === 'sell') return `[${date}] Menjual ${t.amount} ${t.coin} seharga ${t.value.toLocaleString()} BS Coin.`;
        if (t.type === 'donate') return `[${date}] Mendonasikan ${t.amount.toLocaleString()} BS Coin ke <@${t.targetId}>.`;
        return `[${date}] Transaksi tidak dikenal.`;
    }).join('\n');

    const embed = new EmbedBuilder()
        .setTitle('📚 Riwayat Transaksi (5 Terakhir)')
        .setDescription(historyText)
        .setColor('Grey');
    return { embed };
};


// Perintah: !ask (Simulasi AI)
exports.ask = (message, args) => {
    const query = args.join(' ');
    if (!query) {
        return { error: 'Silakan ajukan pertanyaan setelah `!ask`.' };
    }

    // Ini adalah respons simulasi, bisa diganti dengan integrasi AI asli
    let response;
    if (query.toLowerCase().includes('prediksi harga btc')) {
        response = 'Berdasarkan data simulasi, harga BTC minggu depan diprediksi akan sangat fluktuatif. Siapkan diri Anda!';
    } else if (query.toLowerCase().includes('jackpot')) {
        response = 'Untuk klaim jackpot, Anda perlu beruntung saat melakukan spin di tier `premium` atau `vip`. Hadiah jackpot akan otomatis masuk ke saldo Anda!';
    } else if (query.toLowerCase().includes('owo')) {
        response = 'Untuk konversi OWO ke BS Coin, gunakan command `!wsend` dengan format `!wsend [jumlah OWO] @BananaSkiee`. Bot akan otomatis mengonversi dan menambahkan ke saldo Anda. Ingat ada pajak dan bonus di hari libur!';
    }
    else {
        response = 'Maaf, saya tidak bisa memprediksi masa depan pasar crypto. Lakukan riset Anda sendiri!';
    }

    const embed = new EmbedBuilder()
        .setTitle('💡 Jawaban dari AI')
        .setDescription(response)
        .setColor('Gold');
    return { embed };
};

// Perintah Admin: !admin
exports.admin = () => {
  const embed = new EmbedBuilder()
      .setTitle('🔐 COMMAND ADMIN EKSKLUSIF')
      .setDescription('━━━━━━━━━━━━━━━━━━━━━━━')
      .addFields(
          { name: '1. GIVE SYSTEM', value: '`!givecoin @user jumlah`\n`!givebtc @user jumlah`', inline: false },
          { name: '2. PASSWORD CONTROL', value: '`!setpw @user passwordbaru`\n`!pw @user`', inline: false },
          { name: '3. DATABASE MANAGEMENT', value: '`!dts add @user jumlah`\n`!dts reset @user`\n`!logs [@user]`', inline: false },
      )
      .setFooter({ text: '⚠️ HANYA BISA DIPAKAI OLEH ADMIN TERVERIFIKASI' })
      .setColor('Red');
  return { embed };
};

// Admin Command: !givecoin
exports.givecoin = (message, args) => {
    const users = loadData(usersPath);
    const [targetMention, amountStr] = args;
    const targetId = targetMention?.match(/<@!?(\d+)>/)?.[1];
    const amount = parseFloat(amountStr);

    if (!targetId || isNaN(amount) || amount <= 0) {
        return { error: 'Format salah! Gunakan `!givecoin @user jumlah`.' };
    }

    const user = users[targetId];
    if (!user) return { error: 'User tidak terdaftar.' };

    user.balance += amount;
    saveData(usersPath, users);
    
    return { message: `[ADMIN] Berhasil memberikan **${amount.toLocaleString()} BS Coin** ke <@${targetId}>.\nSaldo baru: **${user.balance.toLocaleString()} BS Coin**` };
};

// Admin Command: !givebtc
exports.givebtc = (message, args) => {
    const users = loadData(usersPath);
    const [targetMention, amountStr] = args;
    const targetId = targetMention?.match(/<@!?(\d+)>/)?.[1];
    const amount = parseFloat(amountStr);

    if (!targetId || isNaN(amount) || amount <= 0) {
        return { error: 'Format salah! Gunakan `!givebtc @user jumlah`.' };
    }

    const user = users[targetId];
    if (!user) return { error: 'User tidak terdaftar.' };
    
    user.crypto.BTC = (user.crypto.BTC || 0) + amount;
    saveData(usersPath, users);
    
    return { message: `[ADMIN] Berhasil memberikan **${amount} BTC** ke <@${targetId}>.` };
};

// Admin Command: !setpw
exports.setpw = (message, args) => {
    const users = loadData(usersPath);
    const passwords = loadData(passwordsPath);
    const [targetMention, newPassword] = args;
    const targetId = targetMention?.match(/<@!?(\d+)>/)?.[1];
    
    if (!targetId || !newPassword) {
        return { error: 'Format salah! Gunakan `!setpw @user passwordbaru`.' };
    }
    
    if (!users[targetId]) return { error: 'User tidak terdaftar.' };

    passwords[targetId] = newPassword;
    saveData(passwordsPath, passwords);

    return { message: `[ADMIN] Password <@${targetId}> diubah menjadi: \`${newPassword}\`` };
};

// Admin Command: !pw
exports.pw = (message, args) => {
    const users = loadData(usersPath);
    const passwords = loadData(passwordsPath);
    const targetMention = args[0];
    const targetId = targetMention?.match(/<@!?(\d+)>/)?.[1];

    if (!targetId || !users[targetId]) {
        return { error: 'User tidak valid atau tidak terdaftar.' };
    }
    
    const password = passwords[targetId] || 'Tidak ada password';
    const embed = new EmbedBuilder()
        .setTitle('🔑 Informasi Password')
        .setDescription(`User: <@${targetId}>\nPassword: \`${password}\``)
        .setColor('Red');
    
    // Send to admin via DM for security
    message.author.send({ embeds: [embed] }).catch(() => {
        message.reply("Gagal mengirim DM. Pastikan DM Anda aktif.");
    });

    return { message: '✅ Informasi password telah dikirimkan melalui DM.' };
};

// Admin Command: !dts (Placeholder)
exports.dts = (message, args) => {
    const [action, targetMention, amountStr] = args;
    const targetId = targetMention?.match(/<@!?(\d+)>/)?.[1];
    const amount = parseFloat(amountStr);

    if (!action || !targetId) {
        return { error: 'Format salah! Gunakan `!dts add @user jumlah` atau `!dts reset @user`.' };
    }
    
    const users = loadData(usersPath);
    const user = users[targetId];
    if (!user) return { error: 'User tidak terdaftar.' };

    if (action === 'add') {
        if (isNaN(amount) || amount <= 0) return { error: 'Jumlah DTS tidak valid.' };
        user.stats.dts = (user.stats.dts || 0) + amount;
        saveData(usersPath, users);
        return { message: `[ADMIN] Berhasil menambahkan **${amount} DTS** ke <@${targetId}>. DTS baru: **${user.stats.dts}**` };
    } else if (action === 'reset') {
        user.stats.dts = 0;
        saveData(usersPath, users);
        return { message: `[ADMIN] Berhasil mereset DTS <@${targetId}> menjadi **0**.` };
    } else {
        return { error: 'Aksi DTS tidak valid. Pilih `add` atau `reset`.' };
    }
};

// Admin Command: !logs
exports.logs = (message, args) => {
    const transactions = loadData(historyPath, { transactions: [] }).transactions;
    const targetMention = args[0];
    const targetId = targetMention?.match(/<@!?(\d+)>/)?.[1];

    let filteredLogs = transactions;
    if (targetId) {
        filteredLogs = transactions.filter(t => t.userId === targetId || t.targetId === targetId);
    }

    if (filteredLogs.length === 0) {
        return { error: 'Tidak ada log transaksi ditemukan.' };
    }

    const logText = filteredLogs.slice(-10).map(t => { // Ambil 10 log terakhir
        const date = new Date(t.timestamp).toLocaleString();
        let desc = `[${date}] User <@${t.userId}> `;
        if (t.type === 'buy') desc += `membeli ${t.amount} ${t.coin} seharga ${t.cost.toLocaleString()} BS Coin.`;
        else if (t.type === 'sell') desc += `menjual ${t.amount} ${t.coin} seharga ${t.value.toLocaleString()} BS Coin.`;
        else if (t.type === 'donate') desc += `mendonasikan ${t.amount.toLocaleString()} BS Coin ke <@${t.targetId}>.`;
        else if (t.type === 'heck') desc += `melakukan hack. Hasil: ${t.success ? 'Berhasil' : 'Gagal'}.`; // Perlu log detail heck
        else desc += `melakukan aksi ${t.type}.`;
        return desc;
    }).join('\n');

    const embed = new EmbedBuilder()
        .setTitle(`📜 Log Transaksi ${targetId ? `untuk ${message.guild.members.cache.get(targetId)?.user.username || 'User Tidak Dikenal'}` : 'Global'}`)
        .setDescription(logText)
        .setColor('DarkGrey');
    
    return { embed };
};


exports.checkIfRegistered = checkIfRegistered;

