const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { createChamber, nextBullet } = require("./chamber");
const { getRandomItems } = require("./items");

let activeGames = new Map();

function startGame(channel, p1, p2, client) {
  const chamber = createChamber();
  const items = {
    [p1.id]: getRandomItems(),
    [p2.id]: getRandomItems()
  };

  const gameState = {
    players: [p1, p2],
    health: { [p1.id]: 5, [p2.id]: 5 },
    chamber,
    turn: p1.id,
    items,
  };

  activeGames.set(channel.id, gameState);
  showTurn(channel, gameState);
}

function showTurn(channel, game) {
  const currentPlayer = game.players.find(p => p.id === game.turn);
  const opponent = game.players.find(p => p.id !== game.turn);

  const embed = new EmbedBuilder()
    .setTitle("🎮 Sutgun Duels")
    .setDescription(`Giliran: **${currentPlayer.username}**`)
    .addFields(
      { name: `${game.players[0].username}`, value: `❤️ ${game.health[game.players[0].id]}`, inline: true },
      { name: `${game.players[1].username}`, value: `❤️ ${game.health[game.players[1].id]}`, inline: true },
      { name: "Peluru Info", value: `🔵 Isi: ${game.chamber.filled} | ⚪ Kosong: ${game.chamber.empty}`, inline: false }
    )
    .setColor("Blue");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("shoot_self").setLabel("🔫 Tembak Diri").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("shoot_enemy").setLabel("💥 Tembak Musuh").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("use_item").setLabel("🎲 Pakai Item").setStyle(ButtonStyle.Primary)
  );

  channel.send({ embeds: [embed], components: [row] });
}

module.exports = { startGame };
