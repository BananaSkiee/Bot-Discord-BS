const mineflayer = require('mineflayer'); // Perhatikan perubahan di sini
const { EmbedBuilder } = require('discord.js');

let mcBot = null;

module.exports = {
    init: (client) => {
        console.log('🔄 Memulai koneksi Minecraft...');
        
        // Gunakan mineflayer.createBot() bukan new Bot()
        mcBot = mineflayer.createBot({
            host: 'BananaUcok.aternos.me',
            port: 14262,
            username: 'BotServer',
            version: '1.20.1',
            auth: 'offline'
        });

        mcBot.on('login', () => {
            console.log('✅ Bot MC terhubung!');
            client.user.setActivity('Main di Aternos', { type: 'PLAYING' });
        });

        mcBot.on('error', err => {
            console.error('❌ Error MC:', err.message);
        });

        mcBot.on('end', () => {
            console.log('🔌 Koneksi terputus, mencoba reconnect...');
            setTimeout(() => mcBot.connect(), 30000);
        });
    }
};
