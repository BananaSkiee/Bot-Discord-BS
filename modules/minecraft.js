const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { Vec3 } = require('vec3');
const autoeat = require('mineflayer-auto-eat').plugin;

let mcBot = null;
let sendDiscordNotification = (message) => {};
let reconnectInterval = null;

module.exports = {
    init: (client) => {
        console.log('🔄 Memulai koneksi Minecraft...');

        sendDiscordNotification = (message) => {
            const channelId = '1405311668455735446'; // Ganti dengan ID channel Discord kamu
            const channel = client.channels.cache.get(channelId);
            if (channel) {
                channel.send(message);
            }
        };

        const connect = () => {
            mcBot = mineflayer.createBot({
                host: 'BananaUcok.aternos.me',
                port: 14262,
                username: 'BotServer',
                version: '1.20.1',
                auth: 'offline',
                checkTimeoutInterval: 60000,
                reconnect: true,
                reconnectTime: 30000
            });

            // Load plugins
            mcBot.loadPlugin(pathfinder);
            mcBot.loadPlugin(autoeat);

            mcBot.on('login', () => {
                console.log('✅ Bot MC terhubung!');
                sendDiscordNotification('Bot Minecraft telah terhubung ke server!');
            });

            mcBot.on('spawn', () => {
                console.log('✅ Bot telah spawn di dunia!');
                client.user.setActivity('Main di Aternos', { type: 'PLAYING' });
                
                // Auto-whitelist dan ping otomatis
                mcBot.chat('/whitelist add BotServer');
                mcBot.chat('Bot aktif!');

                // Initialize pathfinder movements
                const movements = new Movements(mcBot);
                mcBot.pathfinder.setMovements(movements);

                // Start automatic tasks
                startAutoTasks();
            });

            mcBot.on('end', reason => {
                console.log(`🔌 Koneksi terputus: ${reason}`);
                sendDiscordNotification(`Bot Minecraft terputus dari server: ${reason}`);
            });
            
            mcBot.on('error', err => {
                console.error('❌ Error MC:', err.message);
                sendDiscordNotification(`Error pada Bot Minecraft: ${err.message}`);
            });

            // Chat Bridge from Minecraft to Discord
            mcBot.on('chat', (username, message) => {
                if (username === mcBot.username) return;
                sendDiscordNotification(`[Minecraft] <${username}> ${message}`);
            });

            // Command handler from Discord
            client.on('messageCreate', (message) => {
                if (message.author.bot) return;
                if (!message.content.startsWith('!')) return;
                
                const args = message.content.slice(1).split(/ +/);
                const command = args.shift().toLowerCase();
                const player = message.author.username;
                
                handleDiscordCommand(command, args, player);
            });
        };

        const startAutoTasks = () => {
            // Auto-eat (Survival)
            mcBot.autoEat.options = {
                priority: 'foodPoints',
                startAt: 14,
                bannedFood: [],
            };

            // Auto-sleep (Survival)
            mcBot.on('time', () => {
                if (mcBot.time.timeOfDay > 13000 && mcBot.isRaining === false && !mcBot.isSleeping) {
                    const bed = mcBot.findBlock({ matching: block => block.name.includes('bed') });
                    if (bed) {
                        mcBot.pathfinder.goto(new goals.GoalNear(bed.position.x, bed.position.y, bed.position.z, 1));
                    }
                }
            });

            // Auto-explore (Exploration)
            let isExploring = false;
            setInterval(() => {
                if (isExploring) {
                    const randomPos = mcBot.entity.position.offset(Math.random() * 20 - 10, 0, Math.random() * 20 - 10);
                    mcBot.pathfinder.goto(new goals.GoalBlock(randomPos.x, randomPos.y, randomPos.z));
                }
            }, 60000); // Jalan-jalan random setiap 1 menit
        };

        const handleDiscordCommand = async (command, args, player) => {
            if (!mcBot) return sendDiscordNotification(`Bot belum terhubung!`);

            switch (command) {
                // Movement
                case 'follow':
                    const targetPlayer = mcBot.players[args[0]];
                    if (!targetPlayer || !targetPlayer.entity) return sendDiscordNotification(`Player ${args[0]} tidak ditemukan di server!`);
                    mcBot.pathfinder.setGoal(new goals.GoalFollow(targetPlayer.entity, 2), true);
                    sendDiscordNotification(`Bot sekarang mengikuti ${args[0]}`);
                    break;
                case 'goto':
                    if (args.length !== 3) return sendDiscordNotification(`Usage: !goto <x> <y> <z>`);
                    const [x, y, z] = args.map(Number);
                    mcBot.pathfinder.goto(new goals.GoalBlock(x, y, z));
                    sendDiscordNotification(`Bot sedang menuju koordinat: ${x}, ${y}, ${z}`);
                    break;
                case 'come':
                    const sender = mcBot.players[player];
                    if (!sender || !sender.entity) return sendDiscordNotification(`Player ${player} tidak ditemukan di server!`);
                    const pos = sender.entity.position;
                    mcBot.pathfinder.goto(new goals.GoalNear(pos.x, pos.y, pos.z, 2));
                    sendDiscordNotification(`Bot sedang mendekati ${player}`);
                    break;
                case 'stop':
                    mcBot.pathfinder.stop();
                    sendDiscordNotification(`Bot berhenti bergerak dan beraktivitas`);
                    break;
                case 'wander':
                    // Implementasi wander
                    break;

                // Resource Gathering
                case 'chop':
                    // Implementasi tebang pohon
                    break;
                case 'mine':
                    // Implementasi mining blok
                    break;

                // Combat
                case 'pvp':
                    // Implementasi pvp
                    break;

                // Inventory & Item
                case 'inventory':
                    const items = mcBot.inventory.items().map(item => `${item.count}x ${item.name}`);
                    sendDiscordNotification(`Inventory bot:\n${items.join('\n') || 'Kosong'}`);
                    break;
                case 'drop':
                    const itemToDrop = mcBot.inventory.find(item => item.name === args[0]);
                    if (itemToDrop) {
                        await mcBot.drop(itemToDrop.type, null, itemToDrop.count);
                        sendDiscordNotification(`Bot membuang ${itemToDrop.count} ${itemToDrop.name}`);
                    } else {
                        sendDiscordNotification(`Item ${args[0]} tidak ditemukan di inventory.`);
                    }
                    break;
                case 'equip':
                    try {
                        const itemToEquip = mcBot.inventory.find(item => item.name === args[0]);
                        await mcBot.equip(itemToEquip, args[1]); // args[1] bisa 'hand', 'head', 'torso', 'legs', 'feet'
                        sendDiscordNotification(`Bot memakai ${itemToEquip.name} di ${args[1]}`);
                    } catch (err) {
                        sendDiscordNotification(`Gagal memakai item. Pastikan item ada dan slot valid.`);
                    }
                    break;

                // Survival
                case 'eat':
                    // Fitur ini sudah otomatis dengan plugin auto-eat
                    sendDiscordNotification(`Bot akan makan otomatis saat lapar.`);
                    break;
                case 'sleep':
                    // Fitur ini sudah otomatis
                    sendDiscordNotification(`Bot akan tidur otomatis saat malam.`);
                    break;

                // Exploration & Utility
                case 'explore':
                    isExploring = true;
                    sendDiscordNotification(`Bot mulai menjelajah dunia.`);
                    break;
                case 'stopexplore':
                    isExploring = false;
                    mcBot.pathfinder.stop();
                    sendDiscordNotification(`Bot berhenti menjelajah.`);
                    break;
                case 'coords':
                case 'status':
                    const botPos = mcBot.entity.position;
                    const health = mcBot.health.toFixed(1);
                    const food = mcBot.food;
                    sendDiscordNotification(`Status bot:\n- Koordinat: x${botPos.x.toFixed(1)} y${botPos.y.toFixed(1)} z${botPos.z.toFixed(1)}\n- Health: ${health}\n- Food: ${food}`);
                    break;
                case 'say':
                    const message = args.join(' ');
                    mcBot.chat(message);
                    sendDiscordNotification(`Mengirim pesan ke Minecraft: ${message}`);
                    break;
                case 'reconnect':
                    sendDiscordNotification(`Mencoba reconnect secara manual...`);
                    mcBot.end();
                    break;
                case 'help':
                    sendDiscordNotification(`Daftar command dasar:\n!goto <x> <y> <z>, !come, !stop, !follow <player>, !inventory, !say <text>, !coords, !status, !reconnect`);
                    break;

                default:
                    sendDiscordNotification(`Command tidak valid atau belum diimplementasikan: !${command}`);
                    break;
            }
        };

        // Mulai koneksi pertama
        connect();
    }
};
                                              
