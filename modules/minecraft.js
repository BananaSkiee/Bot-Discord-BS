init: (client) => {
    console.log('🔄 Mencoba menghubungkan ke MC...'); // Debug 1
    discordClient = client;
    
    mcBot = new Bot({
        host: 'BananaUcok.aternos.me',
        port: 14262,
        username: 'DiscordBotMC',
        version: '1.20.1',
        auth: 'offline'
    });

    mcBot.on('login', () => {
        console.log('✅ Bot MC terhubung!');
        console.log('📌 Server MOTD:', mcBot.motd); // Debug info server
        client.user.setActivity('Main di Aternos', { type: 'PLAYING' });
        mcBot.chat('/whitelist add DiscordBotMC'); // Auto-whitelist
    });

    mcBot.on('error', err => {
        console.error('❌ Koneksi MC gagal:', err.message);
        console.error('🔍 Detail error:', err.stack); // Debug detail
    });

    mcBot.on('end', (reason) => {
        console.log(`🔌 Koneksi terputus: ${reason}`);
        setTimeout(() => {
            console.log('♻️ Mencoba reconnect...');
            mcBot.connect();
        }, 30000);
    });

    console.log('⏳ Menghubungkan...'); // Debug 2
    mcBot.connect().catch(err => {
        console.error('💥 Gagal connect awal:', err);
    });
}
