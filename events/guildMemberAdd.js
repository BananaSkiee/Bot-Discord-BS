// File: events/guildMemberAdd.js (KODE FINAL DAN LENGKAP)

const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const generateWelcomeCard = require('../modules/welcomeCard.js'); // Pastikan path ini benar

module.exports = {
    name: 'guildMemberAdd',
    // Terima 'member' dan 'client' dari event handler utama
    async execute(member, client) { 
        console.log(`[SELAMAT DATANG] Event guildMemberAdd terpicu untuk: ${member.user.tag}`);

        // Ganti dengan ID channel selamat datang Anda
        const welcomeChannelId = '1394478754297811034';
        
        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (!welcomeChannel) {
            return console.error(`[GAGAL] Channel selamat datang dengan ID ${welcomeChannelId} tidak ditemukan.`);
        }
        console.log(`[INFO] Channel selamat datang ditemukan: #${welcomeChannel.name}`);

        try {
            // 1. Buat gambar kartu selamat datang
            console.log(`[INFO] Membuat gambar untuk ${member.user.tag}...`);
            const imageBuffer = await generateWelcomeCard(member);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-card.png' });
            console.log(`[INFO] Gambar berhasil dibuat.`);

            // 2. Buat embed
            console.log(`[INFO] Membuat embed...`);
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setAuthor({ name: `SELAMAT DATANG DI ${member.guild.name.toUpperCase()}`, iconURL: member.guild.iconURL() })
                .setDescription(`Halo ${member.user}, selamat bergabung! Semoga betah ya!`)
                .setThumbnail(member.user.displayAvatarURL())
                .setImage('attachment://welcome-card.png') // Ini menampilkan gambar di dalam embed
                .setTimestamp()
                .setFooter({ text: `Kamu adalah member ke-${member.guild.memberCount}` });
            console.log(`[INFO] Embed berhasil dibuat.`);

            // 3. Kirim pesan ke channel
            console.log(`[INFO] Mencoba mengirim pesan ke #${welcomeChannel.name}...`);
            await welcomeChannel.send({
                // content: `👋 Hey ${member.user}, selamat datang!`, // Opsional, bisa diaktifkan jika mau ada teks di atas embed
                embeds: [welcomeEmbed],
                files: [attachment]
            });
            console.log(`[SUKSES] Pesan selamat datang untuk ${member.user.tag} berhasil terkirim!`);

        } catch (error) {
            console.error(`[ERROR] Terjadi kesalahan fatal saat proses selamat datang:`, error);
        }
    },
};
