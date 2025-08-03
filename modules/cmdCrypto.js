const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path database
const usersPath = path.join(__dirname, '../data/cryptoUsers.json');
const pricesPath = path.join(__dirname, '../data/cryptoPrices.json');

// Load database
function loadUsers() {
  return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
}

function saveUsers(data) {
  fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));
}

function loadPrices() {
  return JSON.parse(fs.readFileSync(pricesPath, 'utf8'));
}

// Simulasi harga crypto (naik/turun acak)
function updateCryptoPrices() {
  const prices = loadPrices();
  for (const coin in prices) {
    const change = (Math.random() * 10) - 5; // -5% sampai +5%
    prices[coin] = Math.max(100, prices[coin] * (1 + change / 100));
  }
  fs.writeFileSync(pricesPath, JSON.stringify(prices, null, 2));
}

// Command: !register
function register(userId) {
  const users = loadUsers();
  if (users[userId]) return { error: 'Anda sudah terdaftar!' };

  users[userId] = {
    balance: 1000,
    btc: 0,
    eth: 0,
    lastDaily: 0,
    lastWork: 0
  };
  saveUsers(users);

  return { 
    success: true,
    message: '🎉 Pendaftaran berhasil! Saldo awal: **1000 BS Coin**'
  };
}

// Command: !balance
function getBalance(userId) {
  const users = loadUsers();
  const user = users[userId];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

  const embed = new EmbedBuilder()
    .setTitle('💰 Saldo Anda')
    .addFields(
      { name: 'BS Coin', value: `${user.balance}`, inline: true },
      { name: 'BTC', value: `${user.btc}`, inline: true },
      { name: 'ETH', value: `${user.eth}`, inline: true }
    );

  return { embed };
}

// Command: !buy [coin] [amount]
function buyCrypto(userId, coin, amount) {
  const users = loadUsers();
  const prices = loadPrices();
  const user = users[userId];
  if (!user) return { error: 'Anda belum terdaftar!' };

  const totalCost = amount * prices[coin];
  if (user.balance < totalCost) {
    return { error: 'Saldo tidak cukup!' };
  }

  user.balance -= totalCost;
  user[coin] += amount;
  saveUsers(users);

  return {
    success: true,
    message: `✅ Berhasil membeli **${amount} ${coin.toUpperCase()}** seharga **${totalCost} BS Coin**!`
  };
}

// Command: !daily
function claimDaily(userId) {
  const users = loadUsers();
  const user = users[userId];
  if (!user) return { error: 'Anda belum terdaftar!' };

  const now = Date.now();
  const lastDaily = user.lastDaily || 0;
  const cooldown = 24 * 60 * 60 * 1000; // 24 jam

  if (now - lastDaily < cooldown) {
    const remaining = Math.ceil((cooldown - (now - lastDaily)) / (1000 * 60 * 60));
    return { error: `Anda harus menunggu **${remaining} jam** lagi!` };
  }

  const reward = Math.floor(Math.random() * 9000) + 1000; // 1000-10000 BS Coin
  user.balance += reward;
  user.lastDaily = now;
  saveUsers(users);

  return {
    success: true,
    message: `🎁 Anda mendapatkan **${reward} BS Coin**!`
  };
}

// ==================[ GACHA SYSTEM ]==================
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

function getGachaReward(tier) {
  const rewards = gachaTiers[tier].rewards;
  const roll = Math.random();
  let cumulativeChance = 0;

  for (const reward of rewards) {
    cumulativeChance += reward.chance;
    if (roll <= cumulativeChance) {
      return reward;
    }
  }
  return rewards[rewards.length - 1]; // Fallback
}

// Command: !gacha [tier]
function gacha(userId, tier = 'basic') {
  const users = loadUsers();
  const user = users[userId];
  if (!user) return { error: 'Anda belum terdaftar! Gunakan `!register`.' };

  // Validasi tier
  if (!gachaTiers[tier]) {
    return { error: 'Tier gacha tidak valid! Pilih: basic/premium/vip' };
  }

  // Cek saldo
  if (user.balance < gachaTiers[tier].cost) {
    return { error: `Saldo tidak cukup! Butuh ${gachaTiers[tier].cost} BS Coin.` };
  }

  // Proses gacha
  user.balance -= gachaTiers[tier].cost;
  const reward = getGachaReward(tier);

  let message;
  switch (reward.type) {
    case 'coin':
      const coinAmount = Math.floor(
        reward.min + Math.random() * (reward.max - reward.min)
      );
      user.balance += coinAmount;
      message = `🎉 Anda mendapatkan **${coinAmount} BS Coin**!`;
      break;

    case 'btc':
      const btcAmount = parseFloat(
        (reward.min + Math.random() * (reward.max - reward.min)).toFixed(4)
      );
      user.btc = (parseFloat(user.btc || 0) + parseFloat(btcAmount);
      message = `🎉 Anda mendapatkan **${btcAmount} BTC**!`;
      break;

    case 'ticket':
      user.tickets = (user.tickets || 0) + reward.value;
      message = `🎫 Anda mendapatkan **${reward.value} Hack Ticket**!`;
      break;

    case 'jackpot':
      const jackpotAmount = gachaTiers[tier].cost * reward.multiplier;
      user.balance += jackpotAmount;
      message = `💰 **JACKPOT!** Anda mendapatkan **${jackpotAmount} BS Coin** (${reward.multiplier}x lipat)!`;
      break;

    case 'super_jackpot':
      const superJackpot = gachaTiers[tier].cost * reward.multiplier;
      user.balance += superJackpot;
      message = `✨ **SUPER JACKPOT!** Anda mendapatkan **${superJackpot} BS Coin** (${reward.multiplier}x lipat)!`;
      break;

    case 'zonk':
      message = '😭 Zonk! Anda tidak mendapatkan apa-apa.';
      break;

    default:
      message = '❌ Hadiah tidak dikenali.';
  }

  saveUsers(users);
  return { 
    success: true, 
    message,
    rewardType: reward.type,
    tier
  };
}

// ==================[ EXPORT ]==================
module.exports = {
  gacha,
  getGachaTiers: () => gachaTiers
};
