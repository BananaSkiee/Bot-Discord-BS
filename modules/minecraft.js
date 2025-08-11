const mineflayer = require('mineflayer');
const { EmbedBuilder } = require('discord.js');
const mc = require('minecraft-protocol');

let mcBot = null;
let reconnectInterval = null;

module.exports = {
    init: (client) => {
        console.log('🔄 Memulai koneksi Minecraft...');

        const connect = (host, port) => {
            mcBot = mineflayer.createBot({
                host,
                port,
                username: 'BotServer',
                version: false, // auto detect versi server
                auth: 'offline',
                checkTimeoutInterval: 60000
            });

            mcBot.on('login', () => {
                console.log(`✅ Bot MC terhubung ke ${host}:${port}!`);
                client.user.setActivity('Main di Aternos', { type: 'PLAYING' });

                setTimeout(() => {
                    mcBot.chat('/whitelist add BotServer');
                    mcBot.chat('Bot aktif!');
                }, 5000);

                // Anti AFK
                setInterval(() => {
                    mcBot.setControlState('jump', true);
                    setTimeout(() => mcBot.setControlState('jump', false), 500);
                }, 10000);
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
            if (reconnectInterval) clearTimeout(reconnectInterval);
            console.log('⏳ Akan reconnect dalam 30 detik...');
            reconnectInterval = setTimeout(() => {
                console.log('♻️ Mencoba reconnect...');
                getDynamicIP();
            }, 30000);
        };

        const getDynamicIP = () => {
            console.log('🔍 Mencari IP Dinamis Aternos...');
            mc.ping({ host: 'BananaUcok.aternos.me', port: 14262 }, (err, res) => {
                if (err) {
                    console.error('⚠️ Gagal ping server:', err.message);
                    scheduleReconnect();
                } else {
                    const host = res.host || 'BananaUcok.aternos.me';
                    const port = res.port || 14262;
                    console.log(`🌐 Dapat IP: ${host}:${port}`);
                    connect(host, port);
                }
            });
        };

        // Start
        getDynamicIP();
    }
};
