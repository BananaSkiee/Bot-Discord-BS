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
const achievementsPath = path.join(__dirname, '../data/achievements.json');
const loansPath = path.join(__dirname, '../data/loans.json');

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
        guess: { won: 0, lost: 0 }
    },
    joinDate: Date.now(),
    level: 1,
    xp: 0
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
  let btcValue = user.crypto.btc ? user.crypto.btc * prices.BTC : 0;
  let ethValue = user.crypto.eth ? user.crypto.eth * prices.ETH : 0;
  let totalCryptoValue = btcValue + ethValue;

  const embed = new EmbedBuilder()
    .setTitle('💰 Saldo & Aset')
    .setDescription(`**BS Coin**: ${user.balance.toLocaleString()} BS Coin`)
    .addFields(
      { name: 'Aset Crypto', value: `₿ BTC: ${user.crypto.btc || 0} (≈ ${btcValue.toLocaleString()} BS Coin)\n🎟️ Hack Ticket: ${user.inventory['Hack Ticket'] || 0}`, inline: false },
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
  saveData(usersPath, users);
  
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
    saveData(usersPath, users);

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
        const value = amount * prices[coin];
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
  const lastPrice = prices[prices.length - 1];
  const newPrice = prices[prices.length - 1] + cryptoSimulator.getPriceChange();
  const actualDirection = newPrice > lastPrice ? 'naik' : 'turun';

  if (direction === actualDirection) {
    const reward = amount * 0.5;
    user.balance += reward;
    user.stats.guess.won++;
    saveData(usersPath, users);
    return { message: `🎉 Tebakan Anda benar! Harga BTC ${actualDirection}. Anda mendapatkan **${reward.toLocaleString()} BS Coin**!` };
  } else {
    user.balance -= amount;
    user.stats.guess.lost++;
    saveData(usersPath, users);
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
      user.crypto.btc = (user.crypto.btc || 0) + btcAmount;
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
      resultMessage = `💰 **JACKPOT!** Kamu mendapatkan **${jackpot.toLocaleString()} BS Coin**!`;
      break;
    case 'super_jackpot':
      const superJackpot = selectedTier.cost * rewardResult.multiplier;
      user.balance += superJackpot;
      resultMessage = `✨ **SUPER JACKPOT!** Kamu mendapatkan **${superJackpot.toLocaleString()} BS Coin**!`;
      break;
    case 'zonk':
      resultMessage = '😭 Zonk! Anda tidak mendapatkan apa-apa.';
      break;
    default:
      resultMessage = '❌ Hadiah tidak dikenali.';
  }

  saveData(usersPath, users);
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
  if (now - user.cooldowns.heck < cooldown && (user.inventory['Hack Ticket'] || 0) <= 0) {
    const remaining = Math.ceil((cooldown - (now - user.cooldowns.heck)) / (1000 * 60 * 60));
    return { error: `Anda harus menunggu **${remaining} jam** lagi untuk hack atau gunakan Hack Ticket.` };
  }

  // Choose a random user to hack
  const otherUsers = Object.keys(users).filter(id => id !== message.author.id);
  if (otherUsers.length === 0) {
    return { error: 'Tidak ada user lain yang bisa di-hack.' };
  }
  const targetId = otherUsers[Math.floor(Math.random() * otherUsers.length)];
  const target = users[targetId];
  const targetPassword = passwords[targetId];

  // Generate 4 password choices (1 correct, 3 fake)
  const choices = [targetPassword];
  while (choices.length < 4) {
    const fakePassword = Math.random().toString(36).substring(2, 7).toUpperCase();
    if (!choices.includes(fakePassword)) {
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
    const filter = i => i.user.id === message.author.id;
    const collector = msg.channel.createMessageCollector({ filter, time: 30000, max: 1 });

    collector.on('collect', async m => {
      const choice = m.content.toUpperCase();
      if (choices.includes(choice)) {
        if (choice === targetPassword) {
          // Success
          const stolenAmount = Math.floor(target.balance * 0.25);
          target.balance -= stolenAmount;
          user.balance += stolenAmount;
          user.stats.hacks.won++;
          saveData(usersPath, users);

          await message.reply(`✅ **Hack Berhasil!** Kamu berhasil mencuri **${stolenAmount.toLocaleString()} BS Coin** dari ${message.guild.members.cache.get(targetId)?.user.username || 'User Tidak Dikenal'}!`);
        } else {
          // Failure
          user.inventory['Hack Ticket'] = Math.max(0, (user.inventory['Hack Ticket'] || 0) - 1);
          user.stats.hacks.lost++;
          saveData(usersPath, users);
          await message.reply(`❌ **Hack Gagal!** Password yang kamu pilih salah. Kamu kehilangan **1 Hack Ticket**.`);
        }
      } else {
        await message.reply('Pilihan tidak valid.');
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        message.reply('Waktu habis! Hack gagal.');
      }
      user.cooldowns.heck = now;
      saveData(usersPath, users);
    });
  });

  return { success: true };
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

// ... (Lanjutan kode untuk command lainnya: !stake, !loan, !market, !richest, !achievements, !profile, !donate, dll.)
// Saya akan memberikan beberapa contoh lagi untuk membantu Anda.

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
            return `${i + 1}. **${username}** » ${u.totalAsset.toLocaleString()} BS Coin`;
        }).join('\n'))
        .setColor('Gold');
    
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

  sender.balance -= amount;
  target.balance += amount;
  saveData(usersPath, users);
  
  return { message: `✅ Berhasil mendonasikan **${amount.toLocaleString()} BS Coin** ke ${targetMention}!` };
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
    
    return { embed };
};

// ... Tambahkan logika untuk semua command lainnya di sini ...

exports.checkIfRegistered = checkIfRegistered;
