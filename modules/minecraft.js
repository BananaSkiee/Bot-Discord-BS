const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { Vec3 } = require('vec3');
const autoeat = require('mineflayer-auto-eat').plugin;

let mcBot = null;
let reconnectInterval = null;
let isExploring = false;

// Helper function to send Discord notifications
let sendDiscordNotification = (message) => {};

// --- Inisialisasi Bot & Koneksi ---
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
            username: 'Plyer456',  
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

        // Chat Bridge: Minecraft to Discord  
        mcBot.on('chat', (username, message) => {  
            if (username === mcBot.username) return;  
            sendDiscordNotification(`[Minecraft] <${username}> ${message}`);  
        });  

        // Command handler: Discord to Minecraft  
        client.on('messageCreate', (message) => {  
            if (message.author.bot || !message.content.startsWith('!')) return;  
              
            const args = message.content.slice(1).split(/ +/);  
            const command = args.shift().toLowerCase();  
            const player = message.author.username;  
              
            handleDiscordCommand(command, args, player);  
        });  
    };  

    connect();  
}

};

// --- Fungsi Otomatis Bot ---
function startAutoTasks() {
// Auto-eat (Survival)
mcBot.autoEat.options = {
priority: 'foodPoints',
startAt: 14,
bannedFood: [],
};

// Auto-sleep (Survival)  
mcBot.on('time', () => {  
    if (mcBot.isDaytime === false && !mcBot.isSleeping) {  
        const bed = mcBot.findBlock({ matching: block => block.name.includes('bed') });  
        if (bed) {  
            mcBot.pathfinder.goto(new goals.GoalNear(bed.position.x, bed.position.y, bed.position.z, 1));  
        }  
    }  
});  

// Auto-explore (Exploration)  
setInterval(() => {  
    if (isExploring) {  
        const randomPos = mcBot.entity.position.offset(Math.random() * 50 - 25, 0, Math.random() * 50 - 25);  
        mcBot.pathfinder.goto(new goals.GoalBlock(randomPos.x, mcBot.entity.position.y, randomPos.z));  
        sendDiscordNotification(`Bot sedang menjelajah ke koordinat: ${randomPos.x.toFixed(0)}, ${randomPos.z.toFixed(0)}`);  
    }  
}, 60000);

}

// --- Fungsi Perintah Manual ---
async function handleDiscordCommand(command, args, player) {
if (!mcBot) return sendDiscordNotification("Bot belum terhubung!");

switch (command) {  
    // --- Movement ---  
    case 'follow':  
        const targetPlayer = mcBot.players[args[0]];  
        if (!targetPlayer || !targetPlayer.entity) return sendDiscordNotification(`Player ${args[0]} tidak ditemukan.`);  
        mcBot.pathfinder.setGoal(new goals.GoalFollow(targetPlayer.entity, 2), true);  
        sendDiscordNotification(`Bot sekarang mengikuti ${args[0]}`);  
        break;  
    case 'goto':  
        if (args.length !== 3) return sendDiscordNotification(`Usage: !goto <x> <y> <z>`);  
        const [x, y, z] = args.map(Number);  
        mcBot.pathfinder.goto(new goals.GoalBlock(x, y, z));  
        sendDiscordNotification(`Bot menuju: ${x}, ${y}, ${z}`);  
        break;  
    case 'come':  
        const sender = mcBot.players[player];  
        if (!sender || !sender.entity) return sendDiscordNotification(`Player ${player} tidak ditemukan.`);  
        const pos = sender.entity.position;  
        mcBot.pathfinder.goto(new goals.GoalNear(pos.x, pos.y, pos.z, 2));  
        sendDiscordNotification(`Bot mendekati ${player}`);  
        break;  
    case 'stop':  
        mcBot.pathfinder.stop();  
        mcBot.look(mcBot.entity.yaw, 0, true);  
        sendDiscordNotification(`Bot berhenti beraktivitas.`);  
        break;  

    // --- Resource Gathering (Contoh Implementasi) ---  
    case 'chop':  
        const tree = mcBot.findBlock({  
            matching: (block) => block.name.includes('log'),  
            maxDistance: 64  
        });  

        if (tree) {  
            await mcBot.pathfinder.goto(new goals.GoalNear(tree.position.x, tree.position.y, tree.position.z, 1));  
            await mcBot.dig(tree, true);  
            sendDiscordNotification(`Bot berhasil menebang pohon.`);  
        } else {  
            sendDiscordNotification(`Tidak ada pohon yang ditemukan.`);  
        }  
        break;  

    // --- Inventory & Items (Contoh Implementasi) ---  
    case 'inventory':  
        const items = mcBot.inventory.items().map(item => `${item.count}x ${item.name}`);  
        sendDiscordNotification(`Inventory bot:\n${items.join('\n') || 'Kosong'}`);  
        break;  
    case 'drop':  
        const itemToDrop = mcBot.inventory.find(item => item.name === args[0]);  
        if (itemToDrop) {  
            await mcBot.drop(itemToDrop.type, null, itemToDrop.count);  
            sendDiscordNotification(`Bot membuang ${itemToDrop.count} ${itemToDrop.name}.`);  
        } else {  
            sendDiscordNotification(`Item ${args[0]} tidak ditemukan.`);  
        }  
        break;  
    case 'craft':  
        // TODO: Implementasi crafting item  
        sendDiscordNotification(`Command ini belum diimplementasikan.`);  
        break;  

    // --- Combat ---  
    case 'pvp':  
        // TODO: Implementasi PvP  
        sendDiscordNotification(`Command ini belum diimplementasikan.`);  
        break;  

    // --- Exploration & Utility ---  
    case 'explore':  
        isExploring = true;  
        sendDiscordNotification(`Bot mulai menjelajah dunia. Ketik !stopexplore untuk berhenti.`);  
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
        sendDiscordNotification(`Status bot:\n- Posisi: x${botPos.x.toFixed(1)} y${botPos.y.toFixed(1)} z${botPos.z.toFixed(1)}\n- Health: ${health}/20\n- Food: ${food}/20`);  
        break;  
    case 'say':  
        const message = args.join(' ');  
        mcBot.chat(message);  
        sendDiscordNotification(`Mengirim pesan ke Minecraft: ${message}`);  
        break;  
    case 'reconnect':  
        sendDiscordNotification(`Mencoba reconnect...`);  
        mcBot.end();  
        break;  
    case 'help':  
        const helpMessage = `Daftar perintah:\n` +  
            `!follow <player> | !goto <x> <y> <z> | !come | !stop\n` +  
            `!chop | !inventory | !drop <item>\n` +  
            `!explore | !stopexplore | !coords | !status\n` +  
            `!say <text> | !reconnect`;  
        sendDiscordNotification(helpMessage);  
        break;  

    default:  
        sendDiscordNotification(`Command tidak valid atau belum diimplementasikan.`);  
        break;  
}  
                                                                                                                      }

Gw mau ganti file minecraft.js gw jadi gitu, tapi gw blm npm install yg itu

    
