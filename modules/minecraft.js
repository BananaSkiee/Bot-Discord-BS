const mineflayer = require('mineflayer');
const util = require('minecraft-server-util');

const serverName = 'BananaUcok.aternos.me'; // Host default Aternos
const serverPort = 14262; // Port default

let bot;

async function connectBot() {
    try {
        // Cek status server
        const status = await util.status(serverName, serverPort, { timeout: 5000 });
        console.log(`🌐 Server online: ${status.host}:${status.port}`);
        
        bot = mineflayer.createBot({
            host: status.host,
            port: status.port,
            username: 'BotServer1',
            version: '1.20.1',
            auth: 'offline'
        });

        bot.once('spawn', () => {
            console.log('✅ Bot berhasil masuk!');
            bot.chat('Bot aktif!');
        });

        bot.on('end', () => {
            console.log('🔌 Bot terputus, mencoba reconnect dalam 30 detik...');
            setTimeout(connectBot, 30000);
        });

        bot.on('error', (err) => {
            console.error('❌ Error:', err.message);
        });

    } catch (err) {
        console.log('⚠️ Server offline, cek lagi dalam 30 detik...');
        setTimeout(connectBot, 30000);
    }
}

connectBot();
