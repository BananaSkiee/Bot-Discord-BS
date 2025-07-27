// File: events/guildMemberAdd.js (KODE DIPERBAIKI)

const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const generateWelcomeCard = require('../modules/welcomeCard.js');

module.exports = {
    name: 'guildMemberAdd',
    // PERBAIKAN: Tambahkan 'client' sebagai parameter di sini
    async execute(member, client) { 
        console.log(`[SELAMAT DATANG] Event terpicu untuk: ${member.user.tag}`);

        const welcomeChannelId = '1394478754297811034';
        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

        if (!welcomeChannel) {
            return console.error(`[GAGAL] Channel dengan ID ${welcomeChannelId} tidak ditemukan.`);
        }
        console.log(`[INFO] Channel ditemukan: #${welcomeChannel.name}`);

        try {
            const imageBuffer = await generateWelcomeCard(member);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-card.png' });

            const welcomeEmbed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setAuthor({ name: `SELAMAT DATANG DI ${member.guild.name.toUpperCase()}`, iconURL: member.guild.iconURL() })
                .setImage('attachment://welcome-card.png')
                .setTimestamp()
                .setFooter({ text: `Kamu adalah member ke-${member.guild.memberCount}` });

            await welcomeChannel.send({
                content: `👋 Hey ${member.user}, selamat datang!`,
                embeds: [welcomeEmbed],
                files: [attachment]
            });
            console.log(`[SUKSES] Pesan selamat datang untuk ${member.user.tag} berhasil terkirim!`);

        } catch (error) {
            console.error(`[ERROR] Terjadi kesalahan saat proses selamat datang:`, error);
        }
    },
};
