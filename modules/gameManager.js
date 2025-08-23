// modules/gameManager.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

let games = new Map();

// Cek apakah user lagi di game
function isUserInGame(userId) {
  for (const game of games.values()) {
    if (game.players.some(p => p.id === userId)) return true;
  }
  return false;
}

// Mulai game baru
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

// 🔫 Bikin chamber (8 slot) dengan larangan 1–7 atau 7–1
function generateChamber() {
  let live = Math.floor(Math.random() * 7) + 1; // 1–7
  while (live === 1 || live === 7) {
    live = Math.floor(Math.random() * 7) + 1; // ulang kalau 1/7
  }
  const blank = 8 - live;

  const sequence = Array(live).fill("live").concat(Array(blank).fill("blank"));
  const shuffled = sequence.sort(() => Math.random() - 0.5);

  return { sequence: shuffled, liveCount: live, blankCount: blank };
}

// 🎲 Gacha item 1–4 random
function getRandomItems() {
  const pool = ["rokok", "minum", "kater", "lup", "borgol"];
  const numItems = Math.floor(Math.random() * 4) + 1; // 1–4
  const selectedItems = [];
  for (let i = 0; i < numItems; i++) {
    selectedItems.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return selectedItems;
}

// Reset chamber & item baru
function resetPeluru(game) {
  game.chamber = generateChamber();
  game.items[game.players[0].id] = getRandomItems();
  game.items[game.players[1].id] = getRandomItems();
}

// 📤 Kirim / update pesan game
async function sendGameMessage(gameId) {
  const game = games.get(gameId);
  if (!game) return;

  const { players, hp, turn, items, channel, messageId, chamber } = game;
  const currentPlayer = players.find(p => p.id === turn);
  const opponent = players.find(p => p.id !== turn);

  const playerItemsList = items[currentPlayer.id].map(i => {
    switch (i) {
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
    console.error("Gagal kirim/edit pesan game:", error);
  }
}

// 🔘 Handler tombol
async function handleButton(interaction) {
  await interaction.deferUpdate();

  const [action, gameId, targetId] = interaction.customId.split("_");
  const game = games.get(gameId);
  if (!game) return interaction.followUp({ content: "Game sudah selesai.", ephemeral: true });

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

// 🔫 Logika tembak
async function handleShoot(interaction, gameId, targetId) {
  const game = games.get(gameId);
  const playerId = interaction.user.id;

  // Ambil peluru
  const bullet = game.chamber.sequence.shift();
  game.chamber.liveCount -= bullet === "live" ? 1 : 0;
  game.chamber.blankCount -= bullet === "blank" ? 1 : 0;

  const player = game.players.find(p => p.id === playerId);
  const target = game.players.find(p => p.id === targetId);

  let damage = game.flags[playerId].doubleDamage ? 2 : 1;
  game.flags[playerId].doubleDamage = false;

  let followUpMessage = "";

  if (bullet === "live") {
    game.hp[target.id] -= damage;
    followUpMessage = `💥 **BOOM!** ${target} kena **-${damage} HP**!`;
    game.turn = target.id;
  } else {
    followUpMessage = `*Klik...* Peluru kosong!`;
    game.turn = target.id;
    // Bonus giliran → tembak diri sendiri kosong
    if (target.id === playerId) {
      followUpMessage += "\n💥 **Peluru kosong**! Kamu dapat giliran ekstra!";
      game.turn = playerId;
    }
  }

  // Bonus turn Borgol
  if (game.flags[playerId].borgolActive) {
    followUpMessage += "\n🔗 Borgol aktif, **giliranmu lagi!**";
    game.turn = playerId;
    game.flags[playerId].borgolActive = false;
  }

  // Cek menang
  if (game.hp[target.id] <= 0) {
    await interaction.channel.send(`🏆 **${player}** memenangkan duel melawan **${target}**!`);
    if (game.messageId) {
      await interaction.channel.messages.fetch(game.messageId).then(m => m.delete().catch(() => {}));
    }
    games.delete(gameId);
    return;
  }

  // Reset chamber kalau isi/kosong habis
  if (game.chamber.liveCount === 0 || game.chamber.blankCount === 0) {
    resetPeluru(game);
    followUpMessage += "\n\n🔄 Chamber di-reset! Item baru didapatkan!";
  }

  await interaction.followUp({ content: followUpMessage });
  sendGameMessage(gameId);
}

// 🎒 Menu pilih item
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

// 🎒 Handler item
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
      msg = `🚬 ${interaction.user} menggunakan **Rokok**, HP jadi **${game.hp[playerId]}**`;
      break;
    case "minum":
      const discarded = game.chamber.sequence.shift();
      game.chamber.liveCount -= discarded === "live" ? 1 : 0;
      game.chamber.blankCount -= discarded === "blank" ? 1 : 0;
      msg = `🍺 ${interaction.user} membuang peluru terdepan.`;
      break;
    case "kater":
      game.flags[playerId].doubleDamage = true;
      msg = `🔪 ${interaction.user} menggunakan **Kater**, tembakan berikutnya **double damage**!`;
      break;
    case "lup":
      msg = `🔎 ${interaction.user} mengintip... peluru berikutnya adalah **${game.chamber.sequence[0] === "live" ? "ISI" : "KOSONG"}**`;
      break;
    case "borgol":
      game.flags[playerId].borgolActive = true;
      msg = `🔗 ${interaction.user} menggunakan **Borgol**, akan dapat giliran ekstra setelah menembak!`;
      break;
  }

  await interaction.followUp({ content: msg, ephemeral: true });
  sendGameMessage(gameId);
}

module.exports = { startGame, handleButton, handleItem, isUserInGame };
