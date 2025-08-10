const { Bot } = require('mineflayer');
const { EmbedBuilder } = require('discord.js');

let mcBot = null;

module.exports = {
    init: (client) => {
        mcBot = new Bot({
            host: 'BananaUcok.aternos.me',
            port: 14262,
            username: 'DiscordBotMC',
            version: '1.20.1'
        });

        mcBot.on('login', () => console.log('✅ Bot MC Terhubung!'));
        mcBot.on('error', err => console.error('❌ Error MC:', err));
        mcBot.connect();
    }
};
