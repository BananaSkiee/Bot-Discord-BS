// File: events/guildMemberAdd.js (KODE FINAL YANG PALING BENAR)

const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const generateWelcomeCard = require('../modules/welcomeCard.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // Ganti dengan ID channel welcome Anda
        const welcomeChannelId = '1394478754297811034';
        
        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (!welcomeChannel) {
            return console.error(`GAGAL: Channel dengan ID ${welcomeChannelId} tidak ditemukan.`);
        }

        try {
            // 1. Buat gambar kartu
            const imageBuffer = await generateWelcomeCard(member);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-card.png' });

            // 2. Buat embed
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setAuthor({ name: `SELAMAT DATANG DI ${member.guild.name.toUpperCase()}`, iconURL: member.guild.iconURL() })
                .setDescription(`Halo ${member.user}, semoga betah ya!`)
                .setThumbnail(member.user.displayAvatarURL())
                .setImage('attachment://welcome-card.png') // Ini menampilkan gambar di dalam embed
                .setTimestamp()
                .setFooter({ text: `Kamu adalah member ke-${member.guild.memberCount}` });

            // 3. Kirim pesan dengan embed dan file
            // Pastikan formatnya seperti ini: { embeds: [...], files: [...] }
            await welcomeChannel.send({
                embeds: [welcomeEmbed],
                files: [attachment]
            });
            console.log(`Pesan embed selamat datang untuk ${member.user.tag} berhasil terkirim.`);

        } catch (error) {
            console.error(`TERJADI ERROR SAAT MENGIRIM EMBED:`, error);
        }
    },
};
