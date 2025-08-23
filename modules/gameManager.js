// modules/gameManager.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

let games = new Map();

function isUserInGame(userId) {
  for (const game of games.values()) {
    if (game.players.some(p => p.id === userId)) return true;
  }
  return false;
}

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

function generateChamber() {
  let live = Math.floor(Math.random() * 7) + 1;
  while (live === 1 || live === 7) {
    live = Math.floor(Math.random() * 7) + 1;
  }
  const blank = 8 - live;
  const sequence = Array(live).fill("live").concat(Array(blank).fill("blank"));
  return { sequence: sequence.sort(() => Math.random() - 0.5), liveCount: live, blankCount: blank };
}

function getRandomItems() {
  const pool = ["rokok", "minum", "kater", "lup", "borgol"];
  const numItems = Math.floor(Math.random() * 4) + 1;
  return Array.from({ length: numItems }, () => pool[Math.floor(Math.random() * pool.length)]);
}

function resetPeluru(game) {
  game.chamber = generateChamber();
  game.items[game.players[0].id] = getRandomItems();
  game.items[game.players[1].id] = getRandomItems();
}

async function sendGameMessage(gameId) {
  const game = games.get(gameId);
  if (!game) return;

  const { players, hp, turn, items, channel, messageId, chamber } = game;
  const currentPlayer = players.find(p => p.id === turn);
  const opponent = players.find(p => p.id !== turn);

  const playerItemsList = items[currentPlayer.id].map(i => {
    return i === "rokok" ? "🚬 Rokok"
      : i === "minum" ? "🍺 Minum"
      : i === "kater" ? "🔪 Kater"
      : i === "lup" ? "🔎 Lup"
      : "🔗 Borgol";
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
    new ButtonBuilder().setCustomId(`shoot_${gameId}_${opponent.id}`).setLabel(`Tembak ${opponent.username}`).setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`shoot_${gameId}_${currentPlayer.id}`).setLabel("Tembak Diri").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`useitem_${gameId}`).setLabel("🎒 Gunakan Item").setStyle(ButtonStyle.Primary).setDisabled(items[currentPlayer.id].length === 0)
  );

  try {
    if (messageId) {
      const message = await channel.messages.fetch(messageId);
      await message.edit({ embeds: [embed], components: [row] });
    } else {
      const message = await channel.send({ embeds: [embed], components: [row] });
      game.messageId = message.id;
    }
  } catch (err) {
    console.error("Gagal kirim/edit pesan game:", err);
  }
}

async function handleButton(interaction) {
  await interaction.deferUpdate();
  const [action, gameId, targetId] = interaction.customId.split("_");
  const game = games.get(gameId);
  if (!game) return interaction.followUp({ content: "Game sudah selesai.", ephemeral: true });

  if (interaction.user.id !== game.turn) {
    return interaction.followUp({ content: "❌ Bukan giliranmu!", ephemeral: true });
  }

  if (action === "shoot") return handleShoot(interaction, gameId, targetId);
  if (action === "useitem") return showItemMenu(interaction, gameId);
}

async function handleShoot(interaction, gameId, targetId) {
  const game = games.get(gameId);
  const playerId = interaction.user.id;
  const bullet = game.chamber.sequence.shift();
  game.chamber.liveCount -= bullet === "live" ? 1 : 0;
  game.chamber.blankCount -= bullet === "blank" ? 1 : 0;

  const player = game.players.find(p => p.id === playerId);
  const target = game.players.find(p => p.id === targetId);

  let damage = game.flags[playerId].doubleDamage ? 2 : 1;
  game.flags[playerId].doubleDamage = false;

  let msg = "";
  if (bullet === "live") {
    game.hp[target.id] -= damage;
    msg = `💥 **BOOM!** ${target} kena **-${damage} HP**!`;
    game.turn = target.id;
  } else {
    msg = `*Klik...* Peluru kosong!`;
    game.turn = target.id;
    if (target.id === playerId) {
      msg += "\n💥 Kosong! Kamu dapat giliran ekstra!";
      game.turn = playerId;
    }
  }

  if (game.flags[playerId].borgolActive) {
    msg += "\n🔗 Borgol aktif, giliranmu lagi!";
    game.turn = playerId;
    game.flags[playerId].borgolActive = false;
  }

  if (game.hp[target.id] <= 0) {
    await interaction.channel.send(`🏆 **${player}** menang melawan **${target}**!`);
    if (game.messageId) {
      await interaction.channel.messages.fetch(game.messageId).then(m => m.delete().catch(() => {}));
    }
    games.delete(gameId);
    return;
  }

  if (game.chamber.liveCount === 0 || game.chamber.blankCount === 0) {
    resetPeluru(game);
    msg += "\n\n🔄 Chamber di-reset! Item baru!";
  }

  await interaction.followUp({ content: msg });
  sendGameMessage(gameId);
}

async function showItemMenu(interaction, gameId) {
  const game = games.get(gameId);
  const items = game.items[interaction.user.id];
  if (!items.length) return interaction.followUp({ content: "🎒 Kamu tidak punya item!", ephemeral: true });

  const menu = new StringSelectMenuBuilder()
    .setCustomId(`itemselect_${gameId}`)
    .setPlaceholder("Pilih item...")
    .addOptions(items.map(i => ({
      label: i,
      value: i,
      emoji: i === "rokok" ? "🚬" : i === "minum" ? "🍺" : i === "kater" ? "🔪" : i === "lup" ? "🔎" : "🔗"
    })));

  const row = new ActionRowBuilder().addComponents(menu);
  await interaction.followUp({ content: "Pilih item:", components: [row], ephemeral: true });
}

async function handleItem(interaction) {
  await interaction.deferUpdate();
  const [, gameId] = interaction.customId.split("_");
  const game = games.get(gameId);
  if (!game) return;

  const playerId = interaction.user.id;
  const item = interaction.values[0];
  const list = game.items[playerId];
  const idx = list.indexOf(item);
  if (idx > -1) list.splice(idx, 1);

  let msg = "";
  switch (item) {
    case "rokok":
      if (game.hp[playerId] < 5) game.hp[playerId]++;
      msg = `🚬 ${interaction.user} pakai **Rokok**, HP: ${game.hp[playerId]}`;
      break;
    case "minum":
      const discarded = game.chamber.sequence.shift();
      if (discarded) {
        game.chamber.liveCount -= discarded === "live" ? 1 : 0;
        game.chamber.blankCount -= discarded === "blank" ? 1 : 0;
      }
      msg = `🍺 ${interaction.user} buang peluru terdepan.`;
      break;
    case "kater":
      game.flags[playerId].doubleDamage = true;
      msg = `🔪 ${interaction.user} pakai **Kater**, tembakan berikutnya double!`;
      break;
    case "lup":
      const peek = game.chamber.sequence[0];
      msg = `🔎 ${interaction.user} mengintip... peluru berikutnya **${peek ? (peek === "live" ? "ISI" : "KOSONG") : "habis"}**`;
      break;
    case "borgol":
      game.flags[playerId].borgolActive = true;
      msg = `🔗 ${interaction.user} pakai **Borgol**, giliran ekstra setelah menembak!`;
      break;
  }

  await interaction.followUp({ content: msg, ephemeral: true });
  sendGameMessage(gameId);
}

module.exports = { startGame, handleButton, handleItem, isUserInGame };
