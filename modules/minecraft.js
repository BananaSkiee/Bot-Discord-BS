const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const autoeat = require("mineflayer-auto-eat");
const config = require("../config"); // ✅ Panggil config

let mcBot = null;
let isExploring = false;
let isBotReady = false;
let isGuarding = false;
let guardPos = null;

let sendDiscordNotification = (message) => {};

module.exports = {
  init: (client) => {
    console.log("🔄 Memulai koneksi Minecraft...");

    sendDiscordNotification = (message) => {
      if (client.isReady()) {
        const channel = client.channels.cache.get(config.CHANNELS.minecraft);
        if (channel) channel.send(message).catch(() => {});
      }
    };

    const connect = () => {
      try {
        // ✅ Menggunakan konfigurasi dari config.js
        mcBot = mineflayer.createBot({
          host: config.MINECRAFT.host,
          port: Number(config.MINECRAFT.port),
          username: config.MINECRAFT.username,
          version: config.MINECRAFT.version,
          auth: "offline",
          checkTimeoutInterval: 60000,
        });

        mcBot.loadPlugin(pathfinder);
        mcBot.loadPlugin(autoeat);

        // ✅ Event 'login'
        mcBot.on("login", () => {
          console.log("✅ Bot MC terhubung!");
          sendDiscordNotification("✅ Bot Minecraft sudah login ke server!");
        });

        // ✅ Event 'spawn'
        mcBot.on("spawn", () => {
          isBotReady = true;
          client.user.setActivity("Main di Aternos", { type: "PLAYING" });
          mcBot.chat("Bot aktif!");
          const movements = new Movements(mcBot);
          mcBot.pathfinder.setMovements(movements);
          startAutoTasks();
        });

        // ✅ Event 'death'
        mcBot.on("death", () => {
          sendDiscordNotification("☠️ Bot mati! Respawn otomatis...");
          setTimeout(() => mcBot.emit("respawn"), 3000);
        });

        // ✅ Event 'end'
        mcBot.on("end", (reason) => {
          isBotReady = false;
          console.log(`🔌 Bot terputus: ${reason}`);
          sendDiscordNotification(`⚠️ Bot terputus: ${reason}, reconnect 30s...`);
          setTimeout(connect, 30000);
        });

        // ✅ Event 'error'
        mcBot.on("error", (err) => {
          console.error("❌ Error MC:", err.message);
          sendDiscordNotification(`❌ Error: ${err.message}`);
        });

        // ✅ Event 'chat'
        mcBot.on("chat", (username, message) => {
          if (username === mcBot.username) return;
          sendDiscordNotification(`[MC] <${username}> ${message}`);
        });
      } catch (err) {
        console.error("❌ Gagal connect:", err.message);
        sendDiscordNotification(`❌ Error connect: ${err.message}`);
        setTimeout(connect, 30000);
      }
    };

    client.on("messageCreate", (message) => {
      if (message.author.bot || !message.content.startsWith("!")) return;
      const args = message.content.slice(1).split(/ +/);
      const command = args.shift().toLowerCase();
      const player = message.author.username;
      handleDiscordCommand(command, args, player);
    });

    // ✅ Mulai koneksi
    connect();
  },
};

// --- Auto Tasks ---
function startAutoTasks() {
  mcBot.autoEat.options = {
    priority: "foodPoints",
    startAt: 14,
    bannedFood: [],
  };

  // ✅ Interval untuk eksplorasi
  setInterval(() => {
    if (isExploring && isBotReady) {
      const randomPos = mcBot.entity.position.offset(
        Math.random() * 50 - 25,
        0,
        Math.random() * 50 - 25
      );
      mcBot.pathfinder.setGoal(
        new goals.GoalBlock(randomPos.x, mcBot.entity.position.y, randomPos.z)
      );
      sendDiscordNotification(
        `🧭 Bot menjelajah ke koordinat: ${randomPos.x.toFixed(0)}, ${randomPos.z.toFixed(0)}`
      );
    }
  }, 60000);
}

// --- Command Handler ---
async function handleDiscordCommand(command, args, player) {
  if (!mcBot || !isBotReady) {
    return sendDiscordNotification("⚠️ Bot Minecraft belum siap!");
  }

  try {
    switch (command) {
      case "follow": {
        const targetPlayer = mcBot.players[args[0]];
        if (!targetPlayer || !targetPlayer.entity)
          return sendDiscordNotification(`❌ Player ${args[0]} tidak ditemukan.`);
        mcBot.pathfinder.setGoal(
          new goals.GoalFollow(targetPlayer.entity, 2), true
        );
        sendDiscordNotification(`👣 Bot mengikuti ${args[0]}`);
        break;
      }
      case "goto": {
        if (args.length !== 3)
          return sendDiscordNotification("❌ Penggunaan: !goto <x> <y> <z>");
        const [x, y, z] = args.map(Number);
        mcBot.pathfinder.setGoal(new goals.GoalBlock(x, y, z));
        sendDiscordNotification(`➡️ Bot menuju: ${x}, ${y}, ${z}`);
        break;
      }
      case "come": {
        const sender = mcBot.players[player];
        if (!sender || !sender.entity)
          return sendDiscordNotification(`❌ Player ${player} tidak ditemukan.`);
        const pos = sender.entity.position;
        mcBot.pathfinder.setGoal(new goals.GoalNear(pos.x, pos.y, pos.z, 2));
        sendDiscordNotification(`🤖 Bot mendekati ${player}`);
        break;
      }
      case "stop":
        mcBot.pathfinder.stop();
        sendDiscordNotification("⛔ Bot berhenti beraktivitas.");
        break;
      case "chop": {
        const tree = mcBot.findBlock({
          matching: (block) => block.name.includes("log"),
          maxDistance: 64,
        });
        if (tree) {
          await mcBot.pathfinder.goto(
            new goals.GoalNear(tree.position.x, tree.position.y, tree.position.z, 1)
          );
          await mcBot.dig(tree);
          sendDiscordNotification("🌳 Bot menebang pohon.");
        } else {
          sendDiscordNotification("🌲 Tidak ada pohon terdekat.");
        }
        break;
      }
      case "fish": {
        mcBot.chat("/fish");
        sendDiscordNotification("🎣 Bot mulai memancing.");
        break;
      }
      case "equip": {
        const itemName = args[0];
        const item = mcBot.inventory.items().find((i) => i.name.includes(itemName));
        if (!item) return sendDiscordNotification(`❌ Item ${itemName} tidak ada.`);
        await mcBot.equip(item, "hand");
        sendDiscordNotification(`🛡️ Bot memakai ${item.name}.`);
        break;
      }
      case "inventory": {
        const items = mcBot.inventory.items().map(
          (item) => `${item.count}x ${item.name}`
        );
        sendDiscordNotification(`🎒 Inventory:\n${items.join("\n") || "Kosong"}`);
        break;
      }
      case "drop": {
        const itemToDrop = mcBot.inventory.items().find(
          (i) => i.name === args[0]
        );
        if (itemToDrop) {
          await mcBot.drop(itemToDrop.type, null, itemToDrop.count);
          sendDiscordNotification(`🗑️ Membuang ${itemToDrop.count} ${itemToDrop.name}.`);
        } else {
          sendDiscordNotification(`❌ Item ${args[0]} tidak ditemukan.`);
        }
        break;
      }
      case "explore":
        isExploring = true;
        sendDiscordNotification("🧭 Bot mulai menjelajah.");
        break;
      case "stopexplore":
        isExploring = false;
        mcBot.pathfinder.stop();
        sendDiscordNotification("🛑 Bot berhenti menjelajah.");
        break;
      case "guard": {
        guardPos = mcBot.entity.position.clone();
        isGuarding = true;
        sendDiscordNotification(`🛡️ Bot menjaga area di ${guardPos.toString()}`);
        break;
      }
      case "stopguard":
        isGuarding = false;
        guardPos = null;
        sendDiscordNotification("🛑 Bot berhenti menjaga area.");
        break;
      case "coords":
      case "status": {
        const pos = mcBot.entity.position;
        sendDiscordNotification(
          `📊 Status bot:\n- Posisi: x${pos.x.toFixed(1)} y${pos.y.toFixed(1)} z${pos.z.toFixed(1)}\n- Health: ${mcBot.health.toFixed(1)}/20\n- Food: ${mcBot.food}/20`
        );
        break;
      }
      case "say": {
        const msg = args.join(" ");
        if (msg) {
          mcBot.chat(msg);
          sendDiscordNotification(`💬 Bot berkata: ${msg}`);
        }
        break;
      }
      case "respawn":
        mcBot.emit("respawn");
        sendDiscordNotification("🔄 Bot respawn manual.");
        break;
      case "reconnect":
        sendDiscordNotification("🔌 Reconnect Minecraft...");
        mcBot.end();
        break;
      case "help":
        sendDiscordNotification(
          `📜 Command list:\n!follow <player> | !goto <x> <y> <z> | !come | !stop\n!chop | !fish | !equip <item> | !inventory | !drop <item>\n!explore | !stopexplore | !guard | !stopguard\n!coords | !status | !say <text> | !respawn | !reconnect`
        );
        break;
      default:
        sendDiscordNotification("❓ Command tidak dikenal.");
        break;
    }
  } catch (err) {
    console.error("❌ Command error:", err);
    sendDiscordNotification(`❌ Error eksekusi: ${err.message}`);
  }
}
