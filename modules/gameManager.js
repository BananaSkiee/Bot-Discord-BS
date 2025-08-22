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
    if (game.players.some(p => p.id === userId)) {
      return true;
    }
  }
  return false;
}

function startGame(channel, challenger, target, client) {
  // Gunakan timestamp untuk gameId agar unik
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
    client,
    messageId: null, // Kita akan menyimpan message ID untuk update
  });

  sendGameMessage(gameId);
}

function generateChamber() {
  let live = Math.floor(Math.random() * 6) + 1;
  const blank = 8 - live;

  // Aturan larangan 1 live / 7 live
  if (live === 1 || live === 7) {
    live = (live === 1) ? 2 : 6;
  }
  
  const sequence = Array(live).fill("live").concat(Array(blank).fill("blank"));
  const shuffled = sequence.sort(() => Math.random() - 0.5);

  return { sequence: shuffled, liveCount: live, blankCount: blank };
}

function getRandomItems() {
  const pool = ["rokok", "minum", "kater", "lup", "borgol"];
  const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 item
  const selectedItems = [];
  for (let i = 0; i < numItems; i++) {
    selectedItems.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return selectedItems;
}

async function sendGameMessage(gameId, interaction = null) {
  const game = games.get(gameId);
  if (!game) return;

  const { players, hp, turn, items, channel, messageId, chamber } = game;
  const currentPlayer = players.find((p) => p.id === turn);
  const opponent = players.find((p) => p.id !== turn);
  
  const embed = new EmbedBuilder()
    .setTitle("🔫 Sutgun Duel")
    .setDescription(
      `Giliran: ${currentPlayer}\n` +
      `Isi: ${chamber.liveCount} | Kosong: ${chamber.blankCount}\n\n` +
      `${players[0]} ❤️ ${hp[players[0].id]}/5\n` +
      `${players[1]} ❤️ ${hp[players[1].id]}/5`
    )
    .setColor("Red");

  // Tombol aksi
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
  );

  try {
    if (interaction && interaction.isRepliable()) {
      // Jika interaksi ada dan belum direspon, lakukan defer atau reply
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferUpdate();
      }
    }

    if (messageId) {
      const message = await channel.messages.fetch(messageId);
      await message.edit({ embeds: [embed], components: [row] });
    } else {
      const message = await channel.send({ embeds: [embed], components: [row] });
      game.messageId = message.id; // Simpan message ID untuk update berikutnya
    }
  } catch (error) {
    console.error("Gagal mengirim/mengedit pesan game:", error);
  }
}

async function handleButton(interaction) {
  // Cepat tanggapi interaksi untuk menghindari timeout
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

async function handleShoot(interaction, gameId, targetId) {
  const game = games.get(gameId);
  const playerId = interaction.user.id;
  const bullet = game.chamber.sequence.shift();
  game.chamber.liveCount -= bullet === "live" ? 1 : 0;
  game.chamber.blankCount -= bullet === "blank" ? 1 : 0;
  
  const player = game.players.find(p => p.id === playerId);
  const target = game.players.find(p => p.id === targetId);

  let damage = 0;
  let followUpMessage = "";
  
  if (bullet === "live") {
    damage = game.flags[playerId].doubleDamage ? 2 : 1;
    game.hp[targetId] -= damage;
    game.flags[playerId].doubleDamage = false; // Reset kater
    followUpMessage = `💥 BOOM! ${target} kena **-${damage} HP**!`;
  } else {
    followUpMessage = `*Klik*... kosong!`;
    if (targetId === playerId) {
      game.turn = playerId; // Bonus turn
    } else {
      game.turn = target.id;
    }
  }

  // Handle Borgol (tambahan turn)
  if (game.flags[playerId].borgolActive) {
    game.flags[playerId].borgolActive = false; // Reset borgol
    game.turn = playerId;
    followUpMessage += "\n🔗 **Borgol** aktif, kamu dapat giliran ekstra!";
  } else if (bullet === "blank" && targetId === playerId) {
    followUpMessage += "\n💥 **Peluru kosong**! Kamu dapat giliran ekstra!";
  } else {
    game.turn = target.id;
  }

  // Periksa kondisi akhir game
  if (game.hp[targetId] <= 0) {
    await interaction.channel.send(`🏆 ${player} memenangkan duel melawan ${target}!`);
    games.delete(gameId);
    // Hapus pesan lama
    await interaction.channel.messages.fetch(game.messageId).then(m => m.delete());
    return;
  }
  
  // Periksa reset chamber
  if (game.chamber.sequence.length === 0) {
    game.chamber = generateChamber();
    followUpMessage += "\n🔄 **Peluru habis**, chamber di-reset!";
    game.items[playerId] = getRandomItems();
    game.items[target.id] = getRandomItems();
    followUpMessage += "\n🎒 **Item baru** didapatkan!";
  }

  await interaction.followUp({ content: followUpMessage });
  await sendGameMessage(gameId);
}

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
    .addOptions(
      userItems.map((i) => ({
        label: i,
        value: i,
        emoji:
          i === "rokok"
            ? "🚬"
            : i === "minum"
            ? "🍺"
            : i === "kater"
            ? "🔪"
            : i === "lup"
            ? "🔎"
            : "🔗",
      }))
    );

  const row = new ActionRowBuilder().addComponents(menu);
  await interaction.followUp({ content: "Pilih item untuk digunakan:", components: [row], ephemeral: true });
}

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
      msg = `🔗 ${interaction.user} menggunakan **borgol**, dapat **2 giliran** setelah menembak!`;
      break;
  }

  await interaction.followUp({ content: msg, ephemeral: true });
  // Kita tidak pindah giliran setelah menggunakan item
  await sendGameMessage(gameId);
}

module.exports = { startGame, handleButton, handleItem, isUserInGame };
