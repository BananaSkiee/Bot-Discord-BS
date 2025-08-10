const { Bot } = require('mineflayer');
const { EmbedBuilder } = require('discord.js');

let mcBot = null;
let isConnecting = false;

module.exports = {
    init: (client) => {
        console.log('🔄 Memulai koneksi Minecraft...'); // Debug 1
        
        mcBot = new Bot({
            host: 'BananaUcok.aternos.me',
            port: 14262,
            username: 'BotServer',
            version: '1.20.1',
            auth: 'offline'
        });

        mcBot.on('login', () => {
            console.log(`✅ Terhubung ke ${mcBot.server.host}`);
            client.user.setActivity('Main di Aternos', { type: 'PLAYING' });
            mcBot.chat('/whitelist add BotServer');
        });

        mcBot.on('error', (err) => {
            console.error('❌ Error MC:', err.message);
        });

        mcBot.on('end', (reason) => {
            console.log(`🔌 Koneksi putus: ${reason}`);
            setTimeout(connectMC, 30000);
        });

        function connectMC() {
            if (!isConnecting) {
                isConnecting = true;
                console.log('⏳ Mencoba reconnect...');
                mcBot.connect()
                    .then(() => isConnecting = false)
                    .catch(err => {
                        console.error('💥 Gagal reconnect:', err.message);
                        isConnecting = false;
                    });
            }
        }

        console.log('⏳ Menghubungkan ke server MC...'); // Debug 2
        connectMC();
    }
};
