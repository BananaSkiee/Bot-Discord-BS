// File: events/guildMemberAdd.js (KODE FINAL DENGAN KATA-KATA)

const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const generateWelcomeCard = require('../modules/welcomeCard.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const welcomeChannelId = '1394478754297811034';
        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (!welcomeChannel) return;

        try {
            const imageBuffer = await generateWelcomeCard(member);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-card.png' });

            // MEMBUAT EMBED DENGAN LENGKAP
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#2ECC71')
                // MENAMBAHKAN KEMBALI JUDUL DAN DESKRIPSI
                .setAuthor({ name: `SELAMAT DATANG, ${member.user.username.toUpperCase()}!`, iconURL: member.user.displayAvatarURL() })
                .setDescription(`Halo ${member.user}, selamat bergabung di **${member.guild.name}**! Semoga betah ya!`)
                .setImage('attachment://welcome-card.png')
                .setTimestamp()
                .setFooter({ text: `Kamu adalah member ke-${member.guild.memberCount}` });

            // Mengirim pesan dengan teks dan embed
            await welcomeChannel.send({
                content: `👋 Hey ${member.user}!`, // Teks mention di atas embed
                embeds: [welcomeEmbed],
                files: [attachment]
            });

        } catch (error) {
            console.error("ERROR SAAT MEMBUAT WELCOME EMBED OTOMATIS:", error);
        }
    },
};
