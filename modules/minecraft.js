const { Bot } = require('mineflayer');
const { EmbedBuilder } = require('discord.js');

let mcBot = null;

module.exports = {
    init: (client) => {
        try {
            mcBot = new Bot({
                host: process.env.MC_HOST || 'BananaUcok.aternos.me',
                port: parseInt(process.env.MC_PORT) || 14262,
                username: process.env.MC_USERNAME || 'DiscordBotMC',
                version: process.env.MC_VERSION || '1.20.1',
                auth: process.env.MC_AUTH_TYPE || 'offline'
            });

            // Event handlers
            mcBot.on('login', () => {
                console.log('✅ Bot Minecraft terhubung!');
                client.user.setActivity('MC: Online', { type: 'PLAYING' });
                
                // Auto login jika perlu
                if (process.env.MC_PASSWORD) {
                    mcBot.chat(`/login ${process.env.MC_PASSWORD}`);
                }
                
                // Auto whitelist jika perlu
                if (process.env.MC_WHITELIST_CMD) {
                    mcBot.chat(process.env.MC_WHITELIST_CMD);
                }
            });

            mcBot.on('chat', (username, message) => {
                if (username !== mcBot.username) {
                    const channel = client.channels.cache.get(process.env.MC_CHANNEL_ID);
                    if (channel) {
                        channel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(`💬 Chat Minecraft`)
                                    .setDescription(`**${username}**: ${message}`)
                                    .setColor('#00AA00')
                                    .setFooter({ text: 'Dari server BananaUcok' })
                            ]
                        });
                    }
                }
            });

            mcBot.on('end', () => {
                console.log('❌ Koneksi terputus, mencoba reconnect...');
                client.user.setActivity('MC: Offline', { type: 'PLAYING' });
                setTimeout(() => mcBot.connect(), 30000);
            });

            mcBot.on('error', err => {
                console.error('🚨 Error MC:', err);
                client.user.setActivity('MC: Error', { type: 'PLAYING' });
            });

            mcBot.connect();
        } catch (err) {
            console.error('Gagal memulai bot Minecraft:', err);
        }
        
        return client; // Untuk chaining seperti modul lainnya
    },

    handleCommand: (message, args) => {
        if (!mcBot || !mcBot.isOnline) {
            return { error: "Bot Minecraft sedang offline!" };
        }

        const command = args.join(' ');
        mcBot.chat(command);

        // Log command ke file
        if (process.env.LOG_MC_COMMANDS === 'true') {
            const logEntry = `[${new Date().toISOString()}] ${message.author.tag}: ${command}\n`;
            fs.appendFileSync('./data/mc_commands.log', logEntry);
        }

        return { 
            message: `📤 Pesan dikirim ke Minecraft: ${command}`,
            embed: new EmbedBuilder()
                .setDescription(`**Command dikirim:**\n${command}`)
                .setColor('#00FF00')
        };
    },

    getStatus: () => {
        return mcBot ? {
            online: mcBot.isOnline,
            players: mcBot.players ? Object.keys(mcBot.players) : [],
            ping: mcBot.player?.ping
        } : null;
    }
};
