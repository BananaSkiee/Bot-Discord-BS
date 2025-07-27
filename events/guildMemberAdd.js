// File: events/guildMemberAdd.js (KODE LENGKAP UNTUK SELAMAT DATANG)

// Impor semua yang kita butuhkan
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const generateWelcomeCard = require('../modules/welcomeCard.js'); // Impor fungsi pembuat gambar kita

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // ===================================================================
        // PENTING: Ganti dengan ID channel selamat datang Anda yang sebenarnya
        const welcomeChannelId = '1394478754297811034';
        // ===================================================================

        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (!welcomeChannel) {
            return console.error(`Error: Channel dengan ID ${welcomeChannelId} tidak ditemukan.`);
        }

        // 1. Buat gambar kartu selamat datang
        const imageBuffer = await generateWelcomeCard(member);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-card.png' });

        // 2. Buat embed yang akan dikirim
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2ECC71') // Warna strip di samping embed
            .setTitle(`Selamat Datang, ${member.user.username}!`)
            .setDescription(`Halo ${member.user}, selamat bergabung di **${member.guild.name}**!\n\nSemoga betah ya! Jangan lupa untuk membaca peraturan server.`)
            .setThumbnail(member.user.displayAvatarURL()) // Foto profil user di pojok kanan atas
            .addFields(
                { name: 'Total Member Saat Ini', value: `${member.guild.memberCount} orang`, inline: true }
            )
            .setImage('attachment://welcome-card.png') // Ini yang membuat gambar kita muncul di dalam embed
            .setTimestamp()
            .setFooter({ text: `Kamu adalah member ke-${member.guild.memberCount}` });

        // 3. Kirim pesan yang berisi embed dan gambar sekaligus
        try {
            await welcomeChannel.send({ 
                content: `👋 Hey ${member.user}, selamat datang!`, // Teks kecil di atas embed
                embeds: [welcomeEmbed], 
                files: [attachment] 
            });
            console.log(`Pesan selamat datang berhasil dikirim untuk ${member.user.tag}`);
        } catch (error) {
            console.error(`Gagal mengirim pesan selamat datang: ${error}`);
        }
    },
};
