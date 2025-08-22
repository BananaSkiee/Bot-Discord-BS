// modules/gameManager.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");

let games = new Map();

function startGame(channel, challenger, target, client) {
  const gameId = `${challenger.id}-${target.id}`;
  games.set(gameId, {
    players: [challenger, target],
    hp: { [challenger.id]: 3, [target.id]: 3 },
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
    client
  });

  sendGameMessage(gameId);
}

function generateChamber() {
  const bullets = Math.floor(Math.random() * 3) + 1; // 1-3 peluru isi
  const blanks = Math.floor(Math.random() * 3) + 1;  // 1-3 peluru kosong
  const sequence = Array(bullets).fill("live").concat(Array(blanks).fill("blank"));
  return { sequence: sequence.sort(() => Math.random() - 0.5) };
}

function getRandomItems() {
  const pool = ["rokok", "minum", "kater", "lup", "borgol"];
  return [pool[Math.floor(Math.random() * pool.length)], pool[Math.floor(Math.random() * pool.length)]];
}

async function sendGameMessage(gameId) {
  const game = games.get(gameId);
  if (!game) return;

  const { players, hp, turn, items } = game;
  const opponent = players.find(p => p.id !== turn);

  const embed = new EmbedBuilder()
    .setTitle("🔫 Sutgun Duel")
    .setDescription(
      `Giliran: <@${turn}>\n\n` +
      `${players[0]} ❤️ ${hp[players[0].id]}/5\n` +
      `${players[1]} ❤️ ${hp[players[1].id]}/5`
    )
    .setColor("Red");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`shoot_${opponent.id}_${gameId}`)
      .setLabel(`Tembak ${opponent.username}`)
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`shoot_${turn}_${gameId}`)
      .setLabel("Tembak Diri")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`useitem_${gameId}`)
      .setLabel("🎒 Gunakan Item")
      .setStyle(ButtonStyle.Primary)
  );

  await game.channel.send({ embeds: [embed], components: [row] });
}

async function handleButton(interaction) {
  const [action, targetId, gameId] = interaction.customId.split("_");
  const game = games.get(gameId);
  if (!game) return interaction.reply({ content: "Game sudah selesai.", ephemeral: true });

  const playerId = interaction.user.id;
  if (playerId !== game.turn) return interaction.reply({ content: "❌ Bukan giliranmu!", ephemeral: true });

  if (action === "shoot") {
    await handleShoot(interaction, gameId, targetId);
  } else if (action === "useitem") {
    await showItemMenu(interaction, gameId);
  }
}

async function handleShoot(interaction, gameId, targetId) {
  const game = games.get(gameId);
  const playerId = interaction.user.id;
  const bullet = game.chamber.sequence.shift();
  const opponent = game.players.find(p => p.id === targetId);

  let damage = 0;
  if (bullet === "live") {
    damage = game.flags[playerId].doubleDamage ? 2 : 1;
    game.hp[targetId] -= damage;
    game.flags[playerId].doubleDamage = false;
    await interaction.reply(`💥 BOOM! <@${targetId}> kena **-${damage} HP**!`);
  } else {
    await interaction.reply(`*Klik*... kosong!`);
    if (targetId === playerId) {
      game.turn = playerId; // bonus turn
      return sendGameMessage(gameId);
    }
  }

  if (game.hp[targetId] <= 0) {
    games.delete(gameId);
    return game.channel.send(`🏆 <@${playerId}> memenangkan duel melawan <@${targetId}>!`);
  }

  // Borgol = double turn
  if (game.flags[playerId].borgolActive) {
    game.flags[playerId].borgolActive = false;
    game.turn = playerId;
  } else {
    game.turn = opponent.id;
  }

  if (game.chamber.sequence.length === 0) game.chamber = generateChamber();
  sendGameMessage(gameId);
}

async function showItemMenu(interaction, gameId) {
  const game = games.get(gameId);
  const playerId = interaction.user.id;
  const userItems = game.items[playerId];

  if (!userItems.length) return interaction.reply({ content: "🎒 Kamu tidak punya item lagi!", ephemeral: true });

  const menu = new StringSelectMenuBuilder()
    .setCustomId(`itemselect_${gameId}`)
    .setPlaceholder("Pilih item...")
    .addOptions(userItems.map(i => ({
      label: i,
      value: i,
      emoji: i === "rokok" ? "🚬" : i === "minum" ? "🍺" : i === "kater" ? "🔪" : i === "lup" ? "🔎" : "🔗"
    })));

  const row = new ActionRowBuilder().addComponents(menu);
  await interaction.reply({ content: "Pilih item untuk digunakan:", components: [row], ephemeral: true });
}

async function handleItem(interaction) {
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
      msg = "🚬 Rokok dipakai, +1 HP";
      break;
    case "minum":
      game.chamber.sequence.shift();
      msg = "🍺 Kamu minum, peluru pertama dibuang!";
      break;
    case "kater":
      game.flags[playerId].doubleDamage = true;
      msg = "🔪 Kamu mabuk, tembakan berikutnya double damage!";
      break;
    case "lup":
      msg = `🔎 Peluru berikutnya adalah **${game.chamber.sequence[0] === "live" ? "ISI" : "KOSONG"}**`;
      break;
    case "borgol":
      game.flags[playerId].borgolActive = true;
      msg = "🔗 Kamu pasang borgol, giliran tambahan!";
      break;
  }

  await interaction.reply({ content: msg, ephemeral: true });
}

module.exports = { startGame, handleButton, handleItem };
