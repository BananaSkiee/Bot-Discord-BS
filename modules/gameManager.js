// modules/gameManager.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

let games = new Map();

// Helper untuk memeriksa apakah user sedang dalam game
function isUserInGame(userId) {
  for (const game of games.values()) {
    if (game.players.some((p) => p.id === userId)) {
      return true;
    }
  }
  return false;
}

// Fungsi utama untuk memulai game
function startGame(channel, challenger, target) {
  const gameId = `${challenger.id}-${target.id}-${Date.now()}`;
  games.set(gameId, {
    players: [challenger, target],
    hp: { [challenger.id]: 5, [target.id]: 5 },
    turn: challenger.id,
    chamber: generateChamber(),
    items: {
      [challenger.id]: getRandomItems(),
      [target.id]: getRandomItems(),
    },
    flags: {
      [challenger.id]: {},
      [target.id]: {},
    },
    channel,
    messageId: null,
  });

  sendGameMessage(gameId);
}

// Mengatur chamber sesuai aturanmu
function generateChamber() {
  let live = Math.floor(Math.random() * 6) + 2; // Memulai dari 2 sampai 7
  if (live > 6) live = 6;
  const blank = 8 - live;

  const sequence = Array(live).fill("live").concat(Array(blank).fill("blank"));
  const shuffled = sequence.sort(() => Math.random() - 0.5);

  return { sequence: shuffled, liveCount: live, blankCount: blank };
}

// Mengatur item sesuai aturanmu
function getRandomItems() {
  const pool = ["rokok", "minum", "kater", "lup", "borgol"];
  const numItems = Math.floor(Math.random() * 4) + 1;
  const selectedItems = [];
  for (let i = 0; i < numItems; i++) {
    selectedItems.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return selectedItems;
}

// Mengirim/mengedit pesan game
async function sendGameMessage(gameId) {
  const game = games.get(gameId);
  if (!game) return;

  const { players, hp, turn, items, channel, messageId, chamber } = game;
  const currentPlayer = players.find((p) => p.id === turn);
  const opponent = players.find((p) => p.id !== turn);
  
  const playerItemsList = items[currentPlayer.id].map(i => {
    switch(i) {
      case "rokok": return "🚬 Rokok";
      case "minum": return "🍺 Minum";
      case "kater": return "🔪 Kater";
      case "lup": return "🔎 Lup";
      case "borgol": return "🔗 Borgol";
    }
  }).join(", ") || "*Tidak ada item*";

  const embed = new EmbedBuilder()
    .setTitle("🔫 Sutgun Duel")
    .setDescription(
      `Giliran: ${currentPlayer}\n` +
      `Isi: ${chamber.liveCount} | Kosong: ${chamber.blankCount}\n\n` +
      `${players[0]} ❤️ ${hp[players[0].id]}/5\n` +
      `${players[1]} ❤️ ${hp[players[1].id]}/5\n\n` +
      `**Item ${currentPlayer}:**\n${playerItemsList}`
    )
    .setColor("Red");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`shoot_${gameId}_${opponent.id}`)
      .setLabel(`Tembak ${opponent.username}`)
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`shoot_${gameId}_${currentPlayer.id}`)
      .setLabel("Tembak Diri")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`useitem_${gameId}`)
      .setLabel("🎒 Gunakan Item")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(items[currentPlayer.id].length === 0)
  );

  try {
    if (messageId) {
      const message = await channel.messages.fetch(messageId);
      await message.edit({ embeds: [embed], components: [row] });
    } else {
      const message = await channel.send({ embeds: [embed], components: [row] });
      game.messageId = message.id;
    }
  } catch (error) {
    console.error("Gagal mengirim/mengedit pesan game:", error);
  }
}

// Menangani tombol di dalam game
async function handleButton(interaction) {
  await interaction.deferUpdate();
  
  const [action, gameId, targetId] = interaction.customId.split("_");
  const game = games.get(gameId);
  if (!game) {
    return interaction.followUp({ content: "Game sudah selesai.", ephemeral: true });
  }

  const playerId = interaction.user.id;
  if (playerId !== game.turn) {
    return interaction.followUp({ content: "❌ Bukan giliranmu!", ephemeral: true });
  }
  
  if (action === "shoot") {
    await handleShoot(interaction, gameId, targetId);
  } else if (action === "useitem") {
    await showItemMenu(interaction, gameId);
  }
}

// Menangani logika tembak
async function handleShoot(interaction, gameId, targetId) {
  const game = games.get(gameId);
  const playerId = interaction.user.id;
  
  // Ambil peluru dari chamber
  const bullet = game.chamber.sequence.shift();
  game.chamber.liveCount -= bullet === "live" ? 1 : 0;
  game.chamber.blankCount -= bullet === "blank" ? 1 : 0;
  
  const player = game.players.find(p => p.id === playerId);
  const target = game.players.find(p => p.id === targetId);

  let damage = 1;
  let nextTurn = target.id;
  let followUpMessage = "";

  // Cek flag kater
  if (game.flags[playerId].doubleDamage) {
    damage = 2;
    game.flags[playerId].doubleDamage = false;
  }

  // Cek hasil tembakan
  if (bullet === "live") {
    game.hp[target.id] -= damage;
    followUpMessage = `💥 **BOOM!** ${target} kena **-${damage} HP**!`;
    nextTurn = target.id;
  } else {
    followUpMessage = `*Klik...* Peluru kosong!`;
    if (target.id === playerId) {
      nextTurn = playerId;
    } else {
      nextTurn = target.id;
    }
  }

  // Aturan bonus giliran dari Borgol atau tembak diri sendiri
  if (game.flags[playerId].borgolActive) {
    game.flags[playerId].borgolActive = false;
    followUpMessage += "\n🔗 Borgol aktif, **giliranmu lagi!**";
    nextTurn = playerId;
  } else if (bullet === "blank" && targetId === playerId) {
    followUpMessage += "\n💥 **Peluru kosong**! Kamu dapat giliran ekstra!";
    nextTurn = playerId;
  }
  
  game.turn = nextTurn;

  // Cek kondisi menang/kalah
  if (game.hp[target.id] <= 0) {
    await interaction.channel.send(`🏆 **${player}** memenangkan duel melawan **${target}**!`);
    if (game.messageId) {
        await interaction.channel.messages.fetch(game.messageId).then(m => m.delete().catch(() => {}));
    }
    games.delete(gameId);
    return;
  }
  
  // Cek kondisi reset chamber
  if (game.chamber.sequence.length === 0) {
    game.chamber = generateChamber();
    followUpMessage += "\n\n🔄 Chamber di-reset!";
    game.items[player.id] = getRandomItems();
    game.items[target.id] = getRandomItems();
    followUpMessage += " Item baru didapatkan!";
  }

  await interaction.followUp({ content: followUpMessage, ephemeral: false });
  sendGameMessage(gameId);
}

// Menampilkan menu item
async function showItemMenu(interaction, gameId) {
  const game = games.get(gameId);
  const playerId = interaction.user.id;
  const userItems = game.items[playerId];

  if (!userItems.length) {
    return interaction.followUp({ content: "🎒 Kamu tidak punya item lagi!", ephemeral: true });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId(`itemselect_${gameId}`)
    .setPlaceholder("Pilih item...")
    .addOptions(userItems.map(i => ({
      label: i.charAt(0).toUpperCase() + i.slice(1),
      value: i,
      emoji: i === "rokok" ? "🚬" : i === "minum" ? "🍺" : i === "kater" ? "🔪" : i === "lup" ? "🔎" : "🔗"
    })));

  const row = new ActionRowBuilder().addComponents(menu);
  await interaction.followUp({ content: "Pilih item untuk digunakan:", components: [row], ephemeral: true });
}

// Menangani penggunaan item
async function handleItem(interaction) {
  await interaction.deferUpdate();
  
  const [_, gameId] = interaction.customId.split("_");
  const game = games.get(gameId);
  if (!game) return;

  const playerId = interaction.user.id;
  const item = interaction.values[0];
  const items = game.items[playerId];
  const idx = items.indexOf(item);
  if (idx > -1) items.splice(idx, 1);

  let msg = "";
  switch (item) {
    case "rokok":
      if (game.hp[playerId] < 5) game.hp[playerId]++;
      msg = `🚬 ${interaction.user} menggunakan **rokok**, HP bertambah menjadi **${game.hp[playerId]}**`;
      break;
    case "minum":
      const discarded = game.chamber.sequence.shift();
      game.chamber.liveCount -= discarded === "live" ? 1 : 0;
      game.chamber.blankCount -= discarded === "blank" ? 1 : 0;
      msg = `🍺 ${interaction.user} minum, peluru pertama dibuang!`;
      break;
    case "kater":
      game.flags[playerId].doubleDamage = true;
      msg = `🔪 ${interaction.user} menggunakan **kater**, tembakan berikutnya **double damage**!`;
      break;
    case "lup":
      msg = `🔎 ${interaction.user} mengintip... peluru berikutnya adalah **${game.chamber.sequence[0] === "live" ? "ISI" : "KOSONG"}**`;
      break;
    case "borgol":
      game.flags[playerId].borgolActive = true;
      msg = `🔗 ${interaction.user} menggunakan **borgol**, dapat **giliran ekstra** setelah menembak!`;
      break;
  }

  await interaction.followUp({ content: msg, ephemeral: true });
  sendGameMessage(gameId);
}

module.exports = { startGame, handleButton, handleItem, isUserInGame };
