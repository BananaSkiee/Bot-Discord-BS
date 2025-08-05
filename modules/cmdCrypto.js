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
const reportsPath = path.join(__dirname, '../data/reports.json');
const owoRatesPath = path.join(__dirname, '../data/owoRates.json');

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
      console.log(`[DATA] Created new file: ${filePath}`);
      return initialData;
    }
    console.error(`❌ [DATA] Error loading ${filePath}:`, error);
    return initialData; // Return initial data on other errors to prevent crash
  }
}

function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    // console.log(`[DATA] Saved data to: ${filePath}`); // Uncomment for debugging
  } catch (error) {
    console.error(`❌ [DATA] Error saving to ${filePath}:`, error);
  }
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
const achievements = {
  'Baby Whale': { requirement: user => user.balance >= 10000, reward: { coin: 500, badge: '🐳' }, description: 'Saldo capai 10,000 BS Coin' },
  'Crypto Apprentice': { requirement: user => user.stats.transactions >= 10, reward: { coin: 200 }, description: '10 transaksi buy/sell' },
  'Hack Newbie': { requirement: user => user.stats.hacks.won >= 1, reward: { item: 'Hack Ticket', amount: 1 }, description: 'Hack pertama sukses' },
  'Bitcoin Baron': { requirement: user => (user.crypto.BTC || 0) >= 1, reward: { btc: 0.01, badge: '₿' }, description: 'Miliki 1 BTC' },
  'Gacha God': { requirement: user => (user.stats.gachaJackpots || 0) >= 3, reward: { item: 'Free Spin', amount: 5 }, description: '3x jackpot dalam 24 jam' },
  'Loan Shark': { requirement: user => (user.stats.totalLoaned || 0) >= 100000, reward: { special: 'Bunga pinjaman 0% selama 3 hari' }, description: 'Total pinjam 100k BS Coin' },
  'Crypto Royalty': { requirement: user => false, reward: { special: 'Akses VIP Lounge', badge: '👑' }, description: 'Top 5 leaderboard 7 hari (membutuhkan fitur leaderboard historis)' },
  'Untouchable': { requirement: user => (Date.now() - (user.stats.lastHacked || user.joinDate)) >= (30 * 24 * 60 * 60 * 1000), reward: { badge: '🛡️' }, description: '30 hari tanpa kena hack' },
  'Satoshi\'s Heir': { requirement: user => user.balance >= 10000000, reward: { special: 'NFT Exclusive', btc: 1 }, description: '10 juta BS Coin' },
  'The Oracle': { requirement: user => user.stats.guess.won >= 10, reward: { special: 'Prediction Boost 2x' }, description: '10x tebak harga benar' },
};

function checkAchievements(user, message) {
  const unlockedAchievements = [];
  for (const name in achievements) {
    if (!user.achievements.includes(name) && achievements[name].requirement(user)) {
      unlockedAchievements.push(name);
      user.achievements.push(name);

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
      }

      const embed = new EmbedBuilder()
        .setTitle('🎉 [ACHIEVEMENT UNLOCKED!]')
        .setDescription(`🏆 **${name}**`)
        .addFields({ name: '✨ Hadiah', value: rewardString || 'Tidak ada hadiah spesifik.' })
        .setColor('#00FF00'); // Green
      message.author.send({ embeds: [embed] }).catch(err => console.error(`Could not send DM to ${message.author.tag}:`, err));
    }
  }
  return unlockedAchievements;
}

// Fungsi untuk menambah XP dan mengecek level up
function gainXP(user, amount, message) {
    user.xp += amount;
    const xpNeededForNextLevel = user.level * 100; // Example: 100 XP for Level 2, 200 for Level 3, etc.

    if (user.xp >= xpNeededForNextLevel) {
        user.level++;
        user.xp -= xpNeededForNextLevel; // Carry over remaining XP
        message.channel.send(`🎉 Selamat <@${user.id}>! Anda naik ke **Level ${user.level}**!`);
    }
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
    crypto: { BTC: 0, ETH: 0, BNB: 0 }, // Initialize with 0 for all supported cryptos
    inventory: { 'Hack Ticket': 0 },
    achievements: [],
    badges: [],
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
        totalLoaned: 0,
        lastHacked: 0
    },
    joinDate: Date.now(),
    level: 1,
    xp: 0,
    loan: null,
    stake: null,
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
      { name: '🪙 Ekonomi', value: '`!register`\n`!balance` / `!bl`\n`!price [coin]`\n`!buy [coin] [jumlah]`\n`!sell [coin] [jumlah]`\n`!portfolio` / `!port`\n`!market` / `!mkt`\n`!leaderboard` / `!lb`', inline: true },
      { name: '🎁 Aktivitas Harian', value: '`!daily`\n`!work`\n`!hunt`', inline: true },
      { name: '🎮 Game', value: '`!guess [naik/turun] [jumlah]`\n`!gacha [tier]`\n`!heck`\n`!resetpw`\n`!achievements` / `!achievement`\n`!progress [nama achievement]`\n`!profile` / `!prof`', inline: true },
      { name: '🏦 Investasi', value: '`!stake [jumlah]`\n`!collectstake`\n`!loan [jumlah]`\n`!payloan`\n`!insurance [type]`', inline: true },
      { name: '💌 Sosial', value: '`!donate [@user] [jumlah]`\n`!report [@user] [alasan]`\n`!history` / `!hist`\n`!wsend [jumlah OWO] @user`', inline: true },
      { name: '🤖 AI', value: '`!ask [pertanyaan]`', inline: true },
      { name: '🛡️ Admin (Role Khusus)', value: '`!admin`', inline: false }
    )
    .setColor('#1E90FF') // DodgerBlue
    .setTimestamp();
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
    .setTitle('💰 Saldo & Aset Anda')
    .setDescription(`**BS Coin**: ${user.balance.toLocaleString()} BS Coin`)
    .addFields(
      { name: 'Aset Crypto', value: `₿ BTC: ${user.crypto.BTC || 0} (≈ ${btcValue.toLocaleString()} BS Coin)\nETH: ${user.crypto.ETH || 0} (≈ ${ethValue.toLocaleString()} BS Coin)\nBNB: ${user.crypto.BNB || 0} (≈ ${bnbValue.toLocaleString()} BS Coin)\n🎟️ Hack Ticket: ${user.inventory['Hack Ticket'] || 0}`, inline: false },
      { name: 'Total Nilai Aset', value: `${(user.balance + totalCryptoValue).toLocaleString()} BS Coin`, inline: false }
    )
    .setColor('#FFD700') // Gold
    .setTimestamp();

  return { embed };
};

// Perintah: !price
exports.price = (message, args) => {
    const coin = args[0]?.toUpperCase();
    if (!coin) return { error: 'Silakan tentukan koin (`!price BTC`).' };
    
    const prices = cryptoSimulator.getPrices();
    const history = cryptoSimulator.getPriceHistory(coin);
    if (!history || history.length < 2) return { error: 'Koin tidak valid atau belum ada cukup data harga.' };

    const currentPrice = prices[coin];
    const prevPrice = history[history.length - 2];
    const change = ((currentPrice - prevPrice) / prevPrice * 100) || 0;

    const chart = cryptoSimulator.generateTextGraph(history, coin);

    const embed = new EmbedBuilder()
        .setTitle(`📈 Harga ${coin}`)
        .setDescription(`\`\`\`${chart}\`\`\``)
        .addFields(
            { name: 'Harga Saat Ini', value: `${currentPrice.toLocaleString()} BS Coin`, inline: true },
            { name: 'Perubahan Terakhir', value: `${change.toFixed(2)}%`, inline: true }
        )
        .setColor('#00CED1') // DarkTurquoise
        .setTimestamp();
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
  gainXP(user, 10, message); // Gain 10 XP per buy
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
    gainXP(user, 10, message); // Gain 10 XP per sell
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
        .setTitle('📊 Portofolio Anda')
        .setDescription(assets.join('\n') || 'Tidak ada aset crypto.')
        .setColor('#8A2BE2') // BlueViolet
        .setTimestamp();
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
    const remainingHours = Math.ceil((cooldown - (now - user.cooldowns.daily)) / (1000 * 60 * 60));
    return { error: `Anda harus menunggu **${remainingHours} jam** lagi untuk klaim harian.` };
  }
  
  const reward = Math.floor(Math.random() * 9901) + 100;
  user.balance += reward;
  user.cooldowns.daily = now;
  gainXP(user, 20, message); // Gain 20 XP per daily claim
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
    const remainingHours = Math.ceil((cooldown - (now - user.cooldowns.work)) / (1000 * 60 * 60));
    return { error: `Anda harus menunggu **${remainingHours} jam** lagi untuk bekerja.` };
  }
  
  const jobs = [
    { name: 'Penambang', reward: () => Math.floor(Math.random() * 51) + 50 },
    { name: 'Trader', reward: () => Math.floor(Math.random() * 121) + 30 },
  ];
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const reward = job.reward();
  
  user.balance += reward;
  user.cooldowns.work = now;
  gainXP(user, 15, message); // Gain 15 XP per work
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
    const remainingHours = Math.ceil((cooldown - (now - user.cooldowns.hunt)) / (1000 * 60 * 60));
    return { error: `Anda harus menunggu **${remainingHours} jam** lagi untuk berburu.` };
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
  gainXP(user, 10, message); // Gain 10 XP per hunt
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

  const pricesHistory = cryptoSimulator.getPriceHistory('BTC');
  if (pricesHistory.length < 2) {
      return { error: 'Belum ada cukup data harga untuk melakukan tebakan. Coba lagi nanti.' };
  }
  const lastPrice = pricesHistory[pricesHistory.length - 1];
  const nextPriceChange = cryptoSimulator.getPriceChange();
  const newPrice = lastPrice + nextPriceChange;
  const actualDirection = newPrice > lastPrice ? 'naik' : 'turun';

  if (direction === actualDirection) {
    const reward = amount * 0.5;
    user.balance += reward;
    user.stats.guess.won++;
    gainXP(user, 25, message); // Gain 25 XP for correct guess
    saveData(usersPath, users);
    
    checkAchievements(user, message);
    return { message: `🎉 Tebakan Anda benar! Harga BTC ${actualDirection}. Anda mendapatkan **${reward.toLocaleString()} BS Coin**!` };
  } else {
    user.balance -= amount;
    user.stats.guess.lost++;
    gainXP(user, 5, message); // Gain 5 XP even for wrong guess
    saveData(usersPath, users);
    
    checkAchievements(user, message);
    return { message: `😭 Tebakan Anda salah! Harga BTC ${actualDirection}. Anda kehilangan **${amount.toLocaleString()} BS Coin**.` };
  }
};


// Perintah: !gacha
exports.gacha = async (message, args) => {
  const tier = args[0] ? args[0].toLowerCase() : null;
  const users = loadData(usersPath);
  const user = users[message.author.id];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

const gachaTiers = {
    basic: {
        cost: 2000, // awalnya 500
        rewards: [
            { type: 'coin', min: 50, max: 600, chance: 0.45 },
            { type: 'btc', min: 0.001, max: 0.02, chance: 0.10 },
            { type: 'ticket', value: 1, chance: 0.08 },
            { type: 'multispin', value: 2, chance: 0.02 },
            { type: 'zonk', chance: 0.35 }
        ]
    },
    premium: {
        cost: 5000, // awalnya 1500
        rewards: [
            { type: 'coin', min: 200, max: 1200, chance: 0.40 },
            { type: 'btc', min: 0.003, max: 0.2, chance: 0.15 },
            { type: 'ticket', value: 2, chance: 0.05 },
            { type: 'multispin', value: 3, chance: 0.02 },
            { type: 'jackpot', multiplier: 10, chance: 0.002 }, // super langka
            { type: 'zonk', chance: 0.378 }
        ]
    },
    vip: {
        cost: 10000, // awalnya 2000
        rewards: [
            { type: 'coin', min: 300, max: 3500, chance: 0.35 },
            { type: 'btc', min: 0.01, max: 0.5, chance: 0.20 },
            { type: 'random_crypto', chance: 0.08 },
            { type: 'multispin', value: 5, chance: 0.02 },
            { type: 'super_jackpot', multiplier: 50, chance: 0.001 }, // hampir mustahil
            { type: 'zonk', chance: 0.349 }
        ]
    }
};

  if (!tier) {
    const embed = new EmbedBuilder()
      .setTitle('◈◈◈ GACHA TIERS ◈◈◈')
      .setDescription('Pilih tier gacha yang kamu inginkan:')
      .addFields(
        { name: '💰 BASIC SPIN (500 BS Coin)', value: '`!gacha basic`\n50-1000 BS Coin » 45%\n0.001-0.05 BTC » 20%\n1 Hack Ticket » 15%\n2x Free Spin » 5%\nZonk » 15%', inline: false },
        { name: '💎 PREMIUM SPIN (1,500 BS Coin)', value: '`!gacha premium`\n200-2,000 BS Coin » 40%\n0.01-0.5 BTC » 25%\n3 Hack Tickets » 10%\n5x Free Spin » 5%\nJackpot (10x) » 1%\nZonk » 19%', inline: false },
        { name: '🔥 VIP SPIN (2,000 BS Coin)', value: '`!gacha vip`\n500-5,000 BS Coin » 35%\n0.05-2.0 BTC » 30%\nRandom Crypto » 15%\n10x Free Spin » 5%\nSuper Jackpot (50x) » 0.5%\nZonk » 14.5%', inline: false }
      )
      .setColor('#FF69B4') // HotPink
      .setTimestamp();
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
  gainXP(user, 30, message); // Gain 30 XP per gacha spin
  saveData(usersPath, users);

  // Gacha Animation
  const animationFrames = ['[▪□□□□□□□□□]', '[▪▪□□□□□□□□]', '[▪▪▪□□□□□□□]', '[▪▪▪▪□□□□□□]', '[▪▪▪▪▪□□□□□]', '[▪▪▪▪▪▪□□□□]', '[▪▪▪▪▪▪▪□□□]', '[▪▪▪▪▪▪▪▪□□]', '[▪▪▪▪▪▪▪▪▪□]', '[▪▪▪▪▪▪▪▪▪▪]'];
  const loadingMessage = await message.reply('`' + animationFrames[0] + '` SPINNING...');

  for (let i = 1; i < animationFrames.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200)); // Delay for animation
      await loadingMessage.edit('`' + animationFrames[i] + '` SPINNING...');
  }
  await new Promise(resolve => setTimeout(resolve, 500)); // Final pause

  const roll = Math.random();
  let cumulativeChance = 0;
  let rewardResult = selectedTier.rewards[selectedTier.rewards.length - 1]; // Default to zonk

  for (const reward of selectedTier.rewards) {
    cumulativeChance += reward.chance;
    if (roll <= cumulativeChance) {
      rewardResult = reward;
      break;
    }
  }

  let resultMessage;
  const prices = cryptoSimulator.getPrices();

  switch (rewardResult.type) {
    case 'coin':
      const coinAmount = Math.floor(Math.random() * (rewardResult.max - rewardResult.min + 1)) + rewardResult.min;
      user.balance += coinAmount;
      resultMessage = `🎉 Selamat! Kamu mendapatkan **${coinAmount.toLocaleString()} BS Coin**!`;
      break;
    case 'btc':
      const btcAmount = parseFloat((Math.random() * (rewardResult.max - rewardResult.min) + rewardResult.min).toFixed(4));
      user.crypto.BTC = (user.crypto.BTC || 0) + btcAmount;
      const btcValue = btcAmount * (prices.BTC || 0);
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
        const availableCrypto = Object.keys(prices).filter(c => c !== 'BS Coin');
        const randomCryptoCoin = availableCrypto[Math.floor(Math.random() * availableCrypto.length)];
        const randomCryptoAmount = parseFloat((Math.random() * 0.5 + 0.1).toFixed(4));
        user.crypto[randomCryptoCoin] = (user.crypto[randomCryptoCoin] || 0) + randomCryptoAmount;
        const randomCryptoValue = randomCryptoAmount * (prices[randomCryptoCoin] || 0);
        resultMessage = `✨ Selamat! Kamu mendapatkan **${randomCryptoAmount} ${randomCryptoCoin}** (≈ ${randomCryptoValue.toLocaleString()} BS Coin)!`;
        break;
    default:
      resultMessage = '❌ Hadiah tidak dikenali.';
  }

  saveData(usersPath, users);
  checkAchievements(user, message);
  await loadingMessage.edit(resultMessage); // Edit final message
  return { success: true }; // Return success to avoid double reply
};

// Perintah: !heck
exports.heck = (message) => {
  const users = loadData(usersPath);
  const passwords = loadData(passwordsPath);
  const user = users[message.author.id];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

  const now = Date.now();
  const cooldown = 24 * 60 * 60 * 1000;
  
  const hasTicket = (user.inventory['Hack Ticket'] || 0) > 0;
  if (!hasTicket && now - user.cooldowns.heck < cooldown) {
    const remainingHours = Math.ceil((cooldown - (now - user.cooldowns.heck)) / (1000 * 60 * 60));
    return { error: `Anda harus menunggu **${remainingHours} jam** lagi untuk hack atau gunakan Hack Ticket.` };
  }

  const otherUsers = Object.keys(users).filter(id => id !== message.author.id && users[id].balance > 0);
  if (otherUsers.length === 0) {
    return { error: 'Tidak ada user lain yang bisa di-hack saat ini.' };
  }
  const targetId = otherUsers[Math.floor(Math.random() * otherUsers.length)];
  const target = users[targetId];
  const targetPassword = passwords[targetId];

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
    .setColor('#FF4500') // OrangeRed
    .setTimestamp();

  message.reply({ embeds: [embed] }).then(async msg => {
    const filter = m => m.author.id === message.author.id && choices.includes(m.content.toUpperCase());
    const collector = msg.channel.createMessageCollector({ filter, time: 30000, max: 1 });

    collector.on('collect', async m => {
      const choice = m.content.toUpperCase();
      
      if (hasTicket) {
          user.inventory['Hack Ticket']--;
      } else {
          user.cooldowns.heck = now;
      }
      saveData(usersPath, users);

      if (choice === targetPassword) {
          const stolenAmount = Math.floor(target.balance * 0.25);
          target.balance -= stolenAmount;
          user.balance += stolenAmount;
          user.stats.hacks.won++;
          target.stats.lastHacked = now;
          gainXP(user, 50, message); // Gain 50 XP for successful hack
          saveData(usersPath, users);
          checkAchievements(user, message);

          await message.reply(`✅ **Hack Berhasil!** Kamu berhasil mencuri **${stolenAmount.toLocaleString()} BS Coin** dari ${message.guild.members.cache.get(targetId)?.user.username || 'User Tidak Dikenal'}!`);
        } else {
          user.stats.hacks.lost++;
          gainXP(user, 10, message); // Gain 10 XP for failed hack attempt
          saveData(usersPath, users);
          checkAchievements(user, message);
          await message.reply(`❌ **Hack Gagal!** Password yang kamu pilih salah.`);
        }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.reply('Waktu habis! Hack gagal.');
        if (!collected.first()) {
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
    .catch(err => console.error(`Failed to send DM to ${message.author.tag}:`, err));
  
  return { message: '✅ Password baru telah dikirimkan melalui DM Anda.' };
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
        return { error: 'Anda sudah memiliki stake aktif. Tarik stake Anda terlebih dahulu dengan `!collectstake`!' };
    }

    user.balance -= amount;
    user.stake = { amount, timestamp: Date.now(), lastProcessed: Date.now() }; // Simpan di user data
    saveData(usersPath, users);

    return { message: `✅ Berhasil melakukan stake **${amount.toLocaleString()} BS Coin**! Anda akan mendapatkan bunga 1% per jam.` };
};

// Perintah: !collectstake
exports.collectStake = (message) => {
    const users = loadData(usersPath);
    const user = users[message.author.id];
    if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

    if (!user.stake || user.stake.amount === 0) {
        return { error: 'Anda tidak memiliki stake aktif.' };
    }

    const stakedAmount = user.stake.amount;
    const stakeTime = user.stake.timestamp;
    const now = Date.now();
    const hoursStaked = Math.floor((now - stakeTime) / (60 * 60 * 1000));
    
    let interest = stakedAmount * 0.01 * hoursStaked; // 1% per jam
    interest = Math.round(interest); // Round to nearest whole number

    user.balance += stakedAmount + interest;
    user.stake = null; // Reset stake
    saveData(usersPath, users);

    return { message: `🎉 Anda berhasil menarik stake **${stakedAmount.toLocaleString()} BS Coin** dengan bunga **${interest.toLocaleString()} BS Coin** (total **${(stakedAmount + interest).toLocaleString()} BS Coin**)!` };
};


// Fungsi untuk memproses bunga stake secara berkala (dipanggil dari index.js)
exports.processStakes = () => {
    const users = loadData(usersPath);
    let updated = false;
    for (const userId in users) {
        const user = users[userId];
        if (user.stake && user.stake.amount > 0) {
            const now = Date.now();
            const lastProcessed = user.stake.lastProcessed || user.stake.timestamp;
            const hoursPassed = Math.floor((now - lastProcessed) / (60 * 60 * 1000));

            if (hoursPassed >= 1) {
                const interest = user.stake.amount * 0.01 * hoursPassed;
                user.balance += Math.round(interest);
                user.stake.lastProcessed = now; // Update last processed time
                updated = true;
                // console.log(`[STAKE] User ${userId} earned ${Math.round(interest)} BS Coin from stake.`);
            }
        }
    }
    if (updated) {
        saveData(usersPath, users);
    }
};


// Perintah: !loan
exports.loan = (message, args) => {
  const users = loadData(usersPath);
  const user = users[message.author.id];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

  if (user.loan && user.loan.amount > 0) {
      const remainingTime = user.loan.dueDate - Date.now();
      const days = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));
      return { error: `Anda sudah memiliki pinjaman aktif sebesar **${user.loan.amount.toLocaleString()} BS Coin**. Lunasi pinjaman Anda terlebih dahulu dengan \`!payloan\` (jatuh tempo dalam ${days} hari).` };
  }

  const amount = parseFloat(args[0]);
  if (isNaN(amount) || amount <= 0) {
      return { error: 'Jumlah pinjaman tidak valid.' };
  }

  let tier = 'Bronze';
  let maxLoan = 1000;
  let interestRatePerDay = 0.07;
  let lateFeePerDay = 0.10;

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
  
  const loanDetails = {
      amount,
      timestamp: Date.now(),
      tier,
      interestRatePerDay,
      lateFeePerDay,
      dueDate: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 hari
  };
  user.balance += amount;
  user.loan = loanDetails;
  user.stats.totalLoaned = (user.stats.totalLoaned || 0) + amount;
  saveData(usersPath, users);
  
  checkAchievements(user, message);

  return { message: `✅ Anda berhasil meminjam **${amount.toLocaleString()} BS Coin** (Tier ${tier}). Anda memiliki 7 hari untuk mengembalikan.` };
};

// Perintah: !payloan
exports.payloan = (message) => {
    const users = loadData(usersPath);
    const user = users[message.author.id];
    if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

    if (!user.loan || user.loan.amount === 0) {
        return { error: 'Anda tidak memiliki pinjaman aktif.' };
    }

    const loanAmount = user.loan.amount;
    const loanTimestamp = user.loan.timestamp;
    const dueDate = user.loan.dueDate;
    const now = Date.now();

    let totalToPay = loanAmount;
    const daysPassed = Math.floor((now - loanTimestamp) / (24 * 60 * 60 * 1000));
    const interest = loanAmount * user.loan.interestRatePerDay * daysPassed;
    totalToPay += interest;

    if (now > dueDate) {
        const daysLate = Math.ceil((now - dueDate) / (24 * 60 * 60 * 1000));
        const lateFee = loanAmount * user.loan.lateFeePerDay * daysLate;
        totalToPay += lateFee;
    }
    totalToPay = Math.round(totalToPay);

    if (user.balance < totalToPay) {
        return { error: `Saldo BS Coin Anda tidak cukup untuk melunasi pinjaman. Anda butuh **${totalToPay.toLocaleString()} BS Coin**.` };
    }

    user.balance -= totalToPay;
    user.loan = null; // Reset loan
    saveData(usersPath, users);

    return { message: `✅ Anda berhasil melunasi pinjaman sebesar **${loanAmount.toLocaleString()} BS Coin** dengan total pembayaran **${totalToPay.toLocaleString()} BS Coin** (termasuk bunga dan denda jika ada).` };
};

// Fungsi untuk memproses pinjaman secara berkala (dipanggil dari index.js)
exports.processLoans = () => {
    const users = loadData(usersPath);
    let updated = false;
    for (const userId in users) {
        const user = users[userId];
        if (user.loan && user.loan.amount > 0 && Date.now() > user.loan.dueDate) {
            // This function primarily serves to check and could send reminders
            // Actual fees are calculated on !payloan
            // console.log(`[LOAN] User ${userId} has an overdue loan.`);
        }
    }
    // No direct balance changes here, as fees are applied on !payloan
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
        .setColor('#20B2AA') // LightSeaGreen
        .setTimestamp();
    return { embed };
};

// Perintah: !leaderboard (Renamed from !richest)
exports.leaderboard = (message) => {
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
        .setTitle('🏆 TOP PLAYERS')
        .setDescription(leaderboard.slice(0, 10).map((u, i) => {
            const member = message.guild.members.cache.get(u.id);
            const username = member ? member.user.username : 'User Tidak Dikenal';
            const userBadges = users[u.id].badges || [];
            const badgeString = userBadges.length > 0 ? ` ${userBadges.join('')}` : '';
            return `${i + 1}. **${username}** » ${u.totalAsset.toLocaleString()} BS Coin${badgeString}`;
        }).join('\n'))
        .setColor('#FFD700') // Gold
        .setTimestamp();
    
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

    const embed = new EmbedBuilder()
        .setTitle(`🎯 Daftar Achievement Crypto`)
        .setDescription('━━━━━━━━━━━━━━━━━━━━━━━')
        .addFields(
            { name: '🎖️ TIER DASAR', value: Object.keys(achievements).filter(name => ['Baby Whale', 'Crypto Apprentice', 'Hack Newbie'].includes(name)).map(name => {
                const status = achieved.includes(name) ? '✔️' : '◻️';
                return `${status} **${name}**\n   ├─ Syarat: ${achievements[name].description}\n   └─ Hadiah: ${achievements[name].reward.coin ? `${achievements[name].reward.coin.toLocaleString()} BS Coin` : ''}${achievements[name].reward.btc ? ` + ${achievements[name].reward.btc} BTC` : ''}${achievements[name].reward.item ? ` + ${achievements[name].reward.amount} ${achievements[name].reward.item}` : ''}${achievements[name].reward.badge ? ` + Badge ${achievements[name].reward.badge}` : ''}${achievements[name].reward.special ? ` + ${achievements[name].reward.special}` : ''}`;
            }).join('\n\n') || 'Tidak ada achievement di tier ini.', inline: false },
            { name: '🔮 TIER EPIK', value: Object.keys(achievements).filter(name => ['Bitcoin Baron', 'Gacha God', 'Loan Shark'].includes(name)).map(name => {
                const status = achieved.includes(name) ? '✔️' : '◻️';
                return `${status} **${name}**\n   ├─ Syarat: ${achievements[name].description}\n   └─ Hadiah: ${achievements[name].reward.coin ? `${achievements[name].reward.coin.toLocaleString()} BS Coin` : ''}${achievements[name].reward.btc ? ` + ${achievements[name].reward.btc} BTC` : ''}${achievements[name].reward.item ? ` + ${achievements[name].reward.amount} ${achievements[name].reward.item}` : ''}${achievements[name].reward.badge ? ` + Badge ${achievements[name].reward.badge}` : ''}${achievements[name].reward.special ? ` + ${achievements[name].reward.special}` : ''}`;
            }).join('\n\n') || 'Tidak ada achievement di tier ini.', inline: false },
            { name: '💎 TIER VIP', value: Object.keys(achievements).filter(name => ['Crypto Royalty', 'Untouchable'].includes(name)).map(name => {
                const status = achieved.includes(name) ? '✔️' : '◻️';
                return `${status} **${name}**\n   ├─ Syarat: ${achievements[name].description}\n   └─ Hadiah: ${achievements[name].reward.coin ? `${achievements[name].reward.coin.toLocaleString()} BS Coin` : ''}${achievements[name].reward.btc ? ` + ${achievements[name].reward.btc} BTC` : ''}${achievements[name].reward.item ? ` + ${achievements[name].reward.amount} ${achievements[name].reward.item}` : ''}${achievements[name].reward.badge ? ` + Badge ${achievements[name].reward.badge}` : ''}${achievements[name].reward.special ? ` + ${achievements[name].reward.special}` : ''}`;
            }).join('\n\n') || 'Tidak ada achievement di tier ini.', inline: false },
            { name: '🔥 TIER LEGENDARY', value: Object.keys(achievements).filter(name => ['Satoshi\'s Heir', 'The Oracle'].includes(name)).map(name => {
                const status = achieved.includes(name) ? '✔️' : '◻️';
                return `${status} **${name}**\n   ├─ Syarat: ${achievements[name].description}\n   └─ Hadiah: ${achievements[name].reward.coin ? `${achievements[name].reward.coin.toLocaleString()} BS Coin` : ''}${achievements[name].reward.btc ? ` + ${achievements[name].reward.btc} BTC` : ''}${achievements[name].reward.item ? ` + ${achievements[name].reward.amount} ${achievements[name].reward.item}` : ''}${achievements[name].reward.badge ? ` + Badge ${achievements[name].reward.badge}` : ''}${achievements[name].reward.special ? ` + ${achievements[name].reward.special}` : ''}`;
            }).join('\n\n') || 'Tidak ada achievement di tier ini.', inline: false }
        )
        .setFooter({ text: '💡 Gunakan `!progress [nama achievement]` untuk cek perkembanganmu!' })
        .setColor('#FF6347') // Tomato
        .setTimestamp();
    
    return { embed };
};

// Perintah: !progress
exports.progress = (message, args) => {
    const users = loadData(usersPath);
    const user = users[message.author.id];
    if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

    const achievementName = args.join(' ');
    const achievement = achievements[achievementName];

    if (!achievement) return { error: 'Achievement tidak valid. Cek nama achievement di `!achievements`.' };
    
    let progressString = 'Progress tidak dapat ditampilkan untuk achievement ini.';
    let currentProgress = 0;
    let requiredProgress = 1;

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
    } else if (achievementName === 'Crypto Royalty') {
        progressString = 'Achievement ini membutuhkan pelacakan leaderboard historis yang lebih kompleks.';
        currentProgress = 0;
        requiredProgress = 1;
    }

    const percentage = Math.min(100, (currentProgress / requiredProgress) * 100);
    progressString = `${achievement.description}\nProgress: [${'█'.repeat(Math.floor(percentage / 10))}${'░'.repeat(10 - Math.floor(percentage / 10))}] ${percentage.toFixed(0)}%`;


    const embed = new EmbedBuilder()
        .setTitle(`🎯 Progress: ${achievementName}`)
        .setDescription(progressString)
        .setColor('#4682B4') // SteelBlue
        .setTimestamp();
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
            { name: '💰 EKONOMI', value: `├─ 💵 BS Coin: **${user.balance.toLocaleString()}**\n├─ ₿ BTC: **${(user.crypto.BTC || 0)}** (≈ $${(user.crypto.BTC * (prices.BTC || 0)).toLocaleString()})\n├─ ETH: **${(user.crypto.ETH || 0)}** (≈ $${(user.crypto.ETH * (prices.ETH || 0)).toLocaleString()})\n├─ BNB: **${(user.crypto.BNB || 0)}** (≈ $${(user.crypto.BNB * (prices.BNB || 0)).toLocaleString()})\n└─ 🏦 Total Aset: **≈ ${totalAsset.toLocaleString()} BS Coin**`, inline: false },
            { name: '🎮 AKTIVITAS', value: `├─ 🔄 Transaksi: **${user.stats.transactions}x**\n├─ 🎰 Gacha Spin: **${user.stats.gachaSpins}x**\n├─ 🔐 Hack: **${user.stats.hacks.won}W/${user.stats.hacks.lost}L**\n└─ 📅 Bergabung: **${joinDays} Hari**`, inline: false },
            { name: '🏆 ACHIEVEMENTS', value: (user.achievements.length > 0 ? user.achievements.slice(0, 5).map(a => `✔️ ${a}`).join('\n') : 'Belum ada achievement.') + '\n' + (user.badges && user.badges.length > 0 ? `💎 Badges: ${user.badges.join('')}` : ''), inline: false },
        )
        .setColor('#9400D3') // DarkViolet
        .setTimestamp();
    
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
  
  return { message: `✅ Berhasil mendonasikan **${amount.toLocaleString()} BS Coin** ke ${message.guild.members.cache.get(targetId)?.user.username || 'User Tidak Dikenal'}!` };
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
        let desc = `[${date}] `;
        if (t.type === 'buy') desc += `Membeli ${t.amount} ${t.coin} seharga ${t.cost.toLocaleString()} BS Coin.`;
        else if (t.type === 'sell') desc += `Menjual ${t.amount} ${t.coin} seharga ${t.value.toLocaleString()} BS Coin.`;
        else if (t.type === 'donate') desc += `Mendonasikan ${t.amount.toLocaleString()} BS Coin ke <@${t.targetId}>.`;
        else if (t.type === 'wsend') desc += `Mengonversi ${t.owoAmount} OWO menjadi ${t.bsCoinAmount.toLocaleString()} BS Coin.`;
        else desc += `Transaksi tidak dikenal: ${t.type}.`;
        return desc;
    }).join('\n');

    const embed = new EmbedBuilder()
        .setTitle('📚 Riwayat Transaksi (5 Terakhir)')
        .setDescription(historyText)
        .setColor('#6A5ACD') // SlateBlue
        .setTimestamp();
    return { embed };
};

// Perintah: !wsend (OWO to BS Coin Conversion)
exports.wsend = (message, args) => {
    const users = loadData(usersPath);
    const user = users[message.author.id];
    if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

    const [owoAmountStr, targetMention] = args;
    const owoAmount = parseFloat(owoAmountStr);
    const targetId = targetMention?.match(/<@!?(\d+)>/)?.[1];

    if (isNaN(owoAmount) || owoAmount <= 0 || owoAmount < 10) {
        return { error: 'Jumlah OWO tidak valid. Minimal 10 OWO. Gunakan `!wsend [jumlah OWO] @BananaSkiee`.' };
    }

    const designatedConverterId = process.env.CONVERTER_USER_ID;
    if (!designatedConverterId) {
        console.error("CONVERTER_USER_ID not set in .env!");
        return { error: "Fitur konversi OWO belum dikonfigurasi dengan benar oleh admin bot." };
    }

    if (targetId !== designatedConverterId) {
        return { error: `Konversi OWO hanya bisa dilakukan dengan mengirim ke <@${designatedConverterId}>. Contoh: \`!wsend 100 <@${designatedConverterId}>\`` };
    }

    const owoRates = loadData(owoRatesPath, { rate: 50, lastUpdate: Date.now() });
    const currentRate = owoRates.rate;

    let bsCoinAmount = owoAmount * currentRate;
    let tax = 0;
    if (owoAmount > 100) {
        tax = bsCoinAmount * 0.05;
        bsCoinAmount -= tax;
    }

    const today = new Date();
    const isHoliday = (today.getMonth() === 11 && today.getDate() === 25); // December 25th
    let bonus = 0;
    if (isHoliday) {
        bonus = bsCoinAmount * 0.05;
        bsCoinAmount += bonus;
    }

    user.balance += bsCoinAmount;
    logTransaction('wsend', message.author.id, { owoAmount, bsCoinAmount: Math.round(bsCoinAmount), rate: currentRate, tax: Math.round(tax), bonus: Math.round(bonus) });
    saveData(usersPath, users);

    return { message: `📩 Kamu konversi **${owoAmount} OWO** → **${Math.round(bsCoinAmount).toLocaleString()} BS Coin** (Rate: 1 OWO = ${currentRate} BS Coin).\n${tax > 0 ? `Pajak: ${Math.round(tax).toLocaleString()} BS Coin. ` : ''}${bonus > 0 ? `Bonus Liburan: ${Math.round(bonus).toLocaleString()} BS Coin. ` : ''}\n💰 Saldo BS Coin sekarang: **${user.balance.toLocaleString()}**` };
};

// Perintah: !ask (Simulasi AI)
exports.ask = (message, args) => {
    const query = args.join(' ');
    if (!query) {
        return { error: 'Silakan ajukan pertanyaan setelah `!ask`.' };
    }

    let response;
    if (query.toLowerCase().includes('prediksi harga btc')) {
        response = 'Berdasarkan data simulasi, harga BTC minggu depan diprediksi akan sangat fluktuatif. Lakukan riset Anda sendiri dan kelola risiko dengan bijak!';
    } else if (query.toLowerCase().includes('jackpot')) {
        response = 'Untuk klaim jackpot, Anda perlu beruntung saat melakukan spin di tier `premium` atau `vip` dengan command `!gacha [tier]`. Hadiah jackpot akan otomatis masuk ke saldo Anda!';
    } else if (query.toLowerCase().includes('owo')) {
        response = 'Untuk konversi OWO ke BS Coin, gunakan command `!wsend [jumlah OWO] @BananaSkiee`. Bot akan otomatis mengonversi dan menambahkan ke saldo Anda. Ingat ada pajak dan bonus di hari libur!';
    } else if (query.toLowerCase().includes('level')) {
        response = 'Level Anda meningkat seiring dengan aktivitas Anda di bot, seperti melakukan transaksi, bermain game, dan berpartisipasi dalam event. Semakin aktif, semakin cepat level Anda naik!';
    } else {
        response = 'Maaf, saya tidak bisa memprediksi masa depan pasar crypto atau memberikan nasihat keuangan. Selalu lakukan riset Anda sendiri!';
    }

    const embed = new EmbedBuilder()
        .setTitle('💡 Jawaban dari AI')
        .setDescription(response)
        .setColor('#FFA500') // Orange
        .setTimestamp();
    return { embed };
};

// Perintah Admin: !admin
exports.admin = () => {
  const embed = new EmbedBuilder()
      .setTitle('🔐 COMMAND ADMIN EKSKLUSIF')
      .setDescription('━━━━━━━━━━━━━━━━━━━━━━━')
      .addFields(
          { name: '1. GIVE SYSTEM', value: '`!givecoin @user jumlah`\n`!givebtc @user jumlah`\n`!setcoin @user jumlah`\n`!setbtc @user jumlah`\n`!seteth @user jumlah`\n`!setbnb @user jumlah`', inline: false },
          { name: '2. PASSWORD CONTROL', value: '`!setpw @user passwordbaru`\n`!pw @user`', inline: false },
          { name: '3. DATABASE MANAGEMENT', value: '`!dts add @user jumlah`\n`!dts reset @user`\n`!logs [@user]`', inline: false },
      )
      .setFooter({ text: '⚠️ HANYA BISA DIPAKAI OLEH ADMIN TERVERIFIKASI' })
      .setColor('#DC143C') // Crimson
      .setTimestamp();
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

// Admin Command: !setcoin
exports.setcoin = (message, args) => {
    const users = loadData(usersPath);
    const [targetMention, amountStr] = args;
    const targetId = targetMention?.match(/<@!?(\d+)>/)?.[1];
    const amount = parseFloat(amountStr);

    if (!targetId || isNaN(amount) || amount < 0) {
        return { error: 'Format salah! Gunakan `!setcoin @user jumlah`.' };
    }

    const user = users[targetId];
    if (!user) return { error: 'User tidak terdaftar.' };

    user.balance = amount;
    saveData(usersPath, users);
    
    return { message: `[ADMIN] Saldo BS Coin <@${targetId}> diatur menjadi: **${user.balance.toLocaleString()} BS Coin**` };
};

// Admin Command: !setbtc
exports.setbtc = (message, args) => {
    const users = loadData(usersPath);
    const [targetMention, amountStr] = args;
    const targetId = targetMention?.match(/<@!?(\d+)>/)?.[1];
    const amount = parseFloat(amountStr);

    if (!targetId || isNaN(amount) || amount < 0) {
        return { error: 'Format salah! Gunakan `!setbtc @user jumlah`.' };
    }

    const user = users[targetId];
    if (!user) return { error: 'User tidak terdaftar.' };
    
    user.crypto.BTC = amount;
    saveData(usersPath, users);
    
    return { message: `[ADMIN] Aset BTC <@${targetId}> diatur menjadi: **${user.crypto.BTC} BTC**` };
};

// Admin Command: !seteth
exports.seteth = (message, args) => {
    const users = loadData(usersPath);
    const [targetMention, amountStr] = args;
    const targetId = targetMention?.match(/<@!?(\d+)>/)?.[1];
    const amount = parseFloat(amountStr);

    if (!targetId || isNaN(amount) || amount < 0) {
        return { error: 'Format salah! Gunakan `!seteth @user jumlah`.' };
    }

    const user = users[targetId];
    if (!user) return { error: 'User tidak terdaftar.' };
    
    user.crypto.ETH = amount;
    saveData(usersPath, users);
    
    return { message: `[ADMIN] Aset ETH <@${targetId}> diatur menjadi: **${user.crypto.ETH} ETH**` };
};

// Admin Command: !setbnb
exports.setbnb = (message, args) => {
    const users = loadData(usersPath);
    const [targetMention, amountStr] = args;
    const targetId = targetMention?.match(/<@!?(\d+)>/)?.[1];
    const amount = parseFloat(amountStr);

    if (!targetId || isNaN(amount) || amount < 0) {
        return { error: 'Format salah! Gunakan `!setbnb @user jumlah`.' };
    }

    const user = users[targetId];
    if (!user) return { error: 'User tidak terdaftar.' };
    
    user.crypto.BNB = amount;
    saveData(usersPath, users);
    
    return { message: `[ADMIN] Aset BNB <@${targetId}> diatur menjadi: **${user.crypto.BNB} BNB**` };
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
        .setColor('#FF6347') // Tomato
        .setTimestamp();
    
    message.author.send({ embeds: [embed] }).catch(err => {
        console.error(`Failed to send DM to admin ${message.author.tag}:`, err);
        message.reply("Gagal mengirim DM. Pastikan DM Anda aktif.");
    });

    return { message: '✅ Informasi password telah dikirimkan melalui DM Anda.' };
};

// Admin Command: !dts
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
        else if (t.type === 'heck') desc += `melakukan hack. Hasil: ${t.success ? 'Berhasil' : 'Gagal'}.`;
        else if (t.type === 'wsend') desc += `mengonversi ${t.owoAmount} OWO menjadi ${t.bsCoinAmount.toLocaleString()} BS Coin.`;
        else desc += `melakukan aksi ${t.type}.`;
        return desc;
    }).join('\n');

    const embed = new EmbedBuilder()
        .setTitle(`📜 Log Transaksi ${targetId ? `untuk ${message.guild.members.cache.get(targetId)?.user.username || 'User Tidak Dikenal'}` : 'Global'}`)
        .setDescription(logText)
        .setColor('#708090') // SlateGrey
        .setTimestamp();
    
    return { embed };
};


exports.checkIfRegistered = checkIfRegistered;

