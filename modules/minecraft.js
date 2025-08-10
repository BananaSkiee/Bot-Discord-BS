const { Bot } = require('mineflayer');
const { EmbedBuilder } = require('discord.js');

let mcBot = null;
let reconnectAttempts = 0;

module.exports = {
    init: (client) => {
        console.log('🔄 Memulai bot Minecraft...');
        
        mcBot = new Bot({
            host: 'BananaUcok.aternos.me:14262', // Gunakan domain Aternos
            port: 14262,
            username: 'BotServer', // Pastikan sama dengan di .env
            version: '1.21.4',
            auth: 'offline',
            checkTimeoutInterval: 30000 // Penting untuk Aternos
        });

        // ===== [ EVENT HANDLERS ] =====
        mcBot.on('login', () => {
            console.log('✅ Berhasil terhubung ke server Aternos!');
            reconnectAttempts = 0;
            client.user.setActivity('Aternos', { type: 'PLAYING' });
            
            // Handle khusus Aternos:
            setTimeout(() => {
                mcBot.chat('/whitelist add BotServer'); // Auto-whitelist
                mcBot.chat('Hello from Discord Bot!'); // Pesan test
            }, 10000);
        });

        mcBot.on('error', (err) => {
            console.error(`❌ Error MC: ${err.message}`);
            if (err.code === 'ECONNREFUSED') {
                console.log('⚠️ Server mungkin mati atau port salah');
            }
        });

        mcBot.on('end', () => {
            const delay = Math.min(30000 * (reconnectAttempts + 1), 300000);
            console.log(`♻️ Akan reconnect dalam ${delay/1000} detik...`);
            
            setTimeout(() => {
                reconnectAttempts++;
                console.log(`🔗 Mencoba reconnect (Attempt ${reconnectAttempts})`);
                mcBot.connect();
            }, delay);
        });

        // ===== [ KONEKSI AWAL ] =====
        console.log(`⏳ Menghubungkan ke BananaUcok.aternos.me:14262...`);
        mcBot.connect().catch(err => {
            console.error('💥 Gagal konek awal:', err.message);
        });
    },

    // ===== [ FITUR TAMBAHAN ] =====
    isConnected: () => mcBot && mcBot.isOnline
};
