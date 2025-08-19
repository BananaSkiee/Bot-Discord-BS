const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const autoeat = require("mineflayer-auto-eat");

let mcBot = null;
let isExploring = false;
let isBotReady = false;

// Helper untuk notifikasi Discord
let sendDiscordNotification = (message) => {};

module.exports = {
  init: (client) => {
    console.log("🔄 Memulai koneksi Minecraft...");

    // Fungsi kirim pesan ke Discord
    sendDiscordNotification = (message) => {
      const channelId = "1405311668455735446"; // ganti dengan channel ID kamu
      if (client.isReady()) {
        const channel = client.channels.cache.get(channelId);
        if (channel) channel.send(message).catch(() => {});
      }
    };

    // Fungsi koneksi ke server MC
    const connect = () => {
      mcBot = mineflayer.createBot({
        host: "BananaUcok.aternos.me",
        port: 14262,
        username: "Plyer456",
        version: "1.20.1",
        auth: "offline",
        checkTimeoutInterval: 60000,
      });

      // Load plugin
      mcBot.loadPlugin(pathfinder);
      mcBot.loadPlugin(autoeat);

      // Event login
      mcBot.on("login", () => {
        console.log("✅ Bot MC terhubung!");
        sendDiscordNotification("Bot Minecraft telah terhubung ke server!");
      });

      // Event spawn
      mcBot.on("spawn", () => {
        console.log("✅ Bot telah spawn di dunia!");
        isBotReady = true;
        client.user.setActivity("Main di Aternos", { type: "PLAYING" });

        mcBot.chat("Bot aktif!");

        const movements = new Movements(mcBot);
        mcBot.pathfinder.setMovements(movements);

        startAutoTasks();
      });

      // Event disconnect
      mcBot.on("end", (reason) => {
        isBotReady = false;
        console.log(`🔌 Koneksi terputus: ${reason}`);
        sendDiscordNotification(`Bot Minecraft terputus: ${reason}`);

        // Auto reconnect setelah delay
        setTimeout(connect, 30000);
      });

      mcBot.on("error", (err) => {
        console.error("❌ Error MC:", err.message);
        sendDiscordNotification(`Error Bot Minecraft: ${err.message}`);
      });

      // Chat dari Minecraft → Discord
      mcBot.on("chat", (username, message) => {
        if (username === mcBot.username) return;
        sendDiscordNotification(`[Minecraft] <${username}> ${message}`);
      });
    };

    // Command dari Discord → Minecraft
    client.on("messageCreate", (message) => {
      if (message.author.bot || !message.content.startsWith("!")) return;

      const args = message.content.slice(1).split(/ +/);
      const command = args.shift().toLowerCase();
      const player = message.author.username;

      handleDiscordCommand(command, args, player);
    });

    connect();
  },
};

// --- Fungsi Otomatis ---
function startAutoTasks() {
  // Auto-makan
  mcBot.autoEat.options = {
    priority: "foodPoints",
    startAt: 14,
    bannedFood: [],
  };

  // Auto-explore tiap 1 menit
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
        `Bot menjelajah ke koordinat: ${randomPos.x.toFixed(
          0
        )}, ${randomPos.z.toFixed(0)}`
      );
    }
  }, 60000);
}

// --- Command Handler ---
async function handleDiscordCommand(command, args, player) {
  if (!mcBot || !isBotReady) {
    return sendDiscordNotification("Bot Minecraft belum siap!");
  }

  try {
    switch (command) {
      case "follow": {
        const targetPlayer = mcBot.players[args[0]];
        if (!targetPlayer || !targetPlayer.entity)
          return sendDiscordNotification(`Player ${args[0]} tidak ditemukan.`);
        mcBot.pathfinder.setGoal(
          new goals.GoalFollow(targetPlayer.entity, 2),
          true
        );
        sendDiscordNotification(`Bot mengikuti ${args[0]}`);
        break;
      }
      case "goto": {
        if (args.length !== 3)
          return sendDiscordNotification(`Usage: !goto <x> <y> <z>`);
        const [x, y, z] = args.map(Number);
        mcBot.pathfinder.setGoal(new goals.GoalBlock(x, y, z));
        sendDiscordNotification(`Bot menuju: ${x}, ${y}, ${z}`);
        break;
      }
      case "come": {
        const sender = mcBot.players[player];
        if (!sender || !sender.entity)
          return sendDiscordNotification(`Player ${player} tidak ditemukan.`);
        const pos = sender.entity.position;
        mcBot.pathfinder.setGoal(new goals.GoalNear(pos.x, pos.y, pos.z, 2));
        sendDiscordNotification(`Bot mendekati ${player}`);
        break;
      }
      case "stop":
        mcBot.pathfinder.stop();
        sendDiscordNotification("Bot berhenti beraktivitas.");
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
          sendDiscordNotification("Bot menebang pohon.");
        } else {
          sendDiscordNotification("Tidak ada pohon ditemukan.");
        }
        break;
      }
      case "inventory": {
        const items = mcBot.inventory.items().map(
          (item) => `${item.count}x ${item.name}`
        );
        sendDiscordNotification(`Inventory:\n${items.join("\n") || "Kosong"}`);
        break;
      }
      case "drop": {
        const itemToDrop = mcBot.inventory.items().find(
          (i) => i.name === args[0]
        );
        if (itemToDrop) {
          await mcBot.drop(itemToDrop.type, null, itemToDrop.count);
          sendDiscordNotification(
            `Bot membuang ${itemToDrop.count} ${itemToDrop.name}.`
          );
        } else {
          sendDiscordNotification(`Item ${args[0]} tidak ditemukan.`);
        }
        break;
      }
      case "explore":
        isExploring = true;
        sendDiscordNotification("Bot mulai menjelajah.");
        break;
      case "stopexplore":
        isExploring = false;
        mcBot.pathfinder.stop();
        sendDiscordNotification("Bot berhenti menjelajah.");
        break;
      case "coords":
      case "status": {
        const pos = mcBot.entity.position;
        sendDiscordNotification(
          `Status bot:\n- Posisi: x${pos.x.toFixed(1)} y${pos.y.toFixed(
            1
          )} z${pos.z.toFixed(1)}\n- Health: ${mcBot.health.toFixed(
            1
          )}/20\n- Food: ${mcBot.food}/20`
        );
        break;
      }
      case "say": {
        const msg = args.join(" ");
        if (msg) {
          mcBot.chat(msg);
          sendDiscordNotification(`Mengirim pesan: ${msg}`);
        }
        break;
      }
      case "reconnect":
        sendDiscordNotification("Bot mencoba reconnect...");
        mcBot.end();
        break;
      case "help":
        sendDiscordNotification(
          `Daftar perintah:\n!follow <player> | !goto <x> <y> <z> | !come | !stop\n!chop | !inventory | !drop <item>\n!explore | !stopexplore | !coords | !status\n!say <text> | !reconnect`
        );
        break;
      default:
        sendDiscordNotification("Command tidak dikenal.");
        break;
    }
  } catch (err) {
    console.error("❌ Command error:", err);
    sendDiscordNotification(`Terjadi error saat eksekusi command: ${err.message}`);
  }
}
