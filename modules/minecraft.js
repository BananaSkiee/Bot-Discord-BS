const mineflayer = require('mineflayer');
const { EmbedBuilder } = require('discord.js');

let mcBot = null;
let reconnectInterval = null;

module.exports = {
    init: (client) => {
        console.log('🔄 Memulai koneksi Minecraft...');
        
        const connect = () => {
            mcBot = mineflayer.createBot({
                host: 'BananaUcok.aternos.me',
                port: 14262,
                username: 'BotServer',
                version: '1.20.1',
                auth: 'offline',
                checkTimeoutInterval: 60000 // Tambah waktu timeout
            });

            mcBot.on('login', () => {
                console.log('✅ Bot MC terhubung!');
                client.user.setActivity('Main di Aternos', { type: 'PLAYING' });
                
                // Auto-whitelist dan ping periodik
                setTimeout(() => {
                    mcBot.chat('/whitelist add BotServer');
                    mcBot.chat('Bot aktif!');
                }, 5000);
            });

            mcBot.on('error', err => {
                console.error('❌ Error MC:', err.message);
                scheduleReconnect();
            });

            mcBot.on('end', reason => {
                console.log(`🔌 Koneksi terputus: ${reason}`);
                scheduleReconnect();
            });

            mcBot.on('kicked', reason => {
                console.log(`🚪 Dikick: ${reason}`);
                scheduleReconnect();
            });
        };

        const scheduleReconnect = () => {
            if (reconnectInterval) clearInterval(reconnectInterval);
            console.log('⏳ Akan reconnect dalam 30 detik...');
            reconnectInterval = setTimeout(() => {
                console.log('♻️ Mencoba reconnect...');
                connect();
            }, 30000);
        };

        // Mulai koneksi pertama
        connect();
    }
};
