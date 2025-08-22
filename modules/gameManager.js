// modules/gameManager.js
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
    bonusTurn: false
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

async function handleButton(interaction) {
  const game = activeGames.get(interaction.channel.id);
  if (!game) {
    return interaction.reply({ content: "⚠️ Tidak ada game aktif di channel ini.", ephemeral: true });
  }

  const player = interaction.user;
  if (player.id !== game.turn) {
    return interaction.reply({ content: "❌ Bukan giliranmu!", ephemeral: true });
  }

  const opponent = game.players.find(p => p.id !== player.id);

  if (interaction.customId === "shoot_self" || interaction.customId === "shoot_enemy") {
    const bullet = nextBullet(game.chamber);
    let target = interaction.customId === "shoot_self" ? player : opponent;

    if (bullet) {
      // kena isi
      game.health[target.id] -= 1;
      await interaction.reply(`💥 BOOM! ${target.username} kena tembak!\n❤️ Sisa HP: ${game.health[target.id]}`);
    } else {
      // kena kosong
      if (target.id === player.id) {
        // tembak diri + kosong = bonus turn
        game.bonusTurn = true;
        await interaction.reply(`😮 Klik! Senjata kosong! ${player.username} selamat dan dapat BONUS turn 🎁`);
      } else {
        await interaction.reply(`😮 Klik! Senjata kosong. ${opponent.username} selamat!`);
      }
    }

    // cek mati
    if (game.health[target.id] <= 0) {
      activeGames.delete(interaction.channel.id);
      return interaction.followUp(`🏆 **${target.id === player.id ? opponent.username : player.username} MENANG!**`);
    }

    // cek reset chamber
    if (game.chamber.filled === 0 || game.chamber.empty === 0) {
      game.chamber = createChamber();
      game.items[player.id] = getRandomItems();
      game.items[opponent.id] = getRandomItems();
      await interaction.followUp("♻️ Peluru & item direset ulang!");
    }

    // ganti giliran
    if (game.bonusTurn) {
      game.bonusTurn = false; // tetap di player sama
    } else {
      game.turn = opponent.id;
    }

    showTurn(interaction.channel, game);
    return;
  }

  if (interaction.customId === "use_item") {
    await interaction.reply("🎲 Item belum diimplementasi.");
    return;
  }
}

module.exports = { startGame, handleButton };
