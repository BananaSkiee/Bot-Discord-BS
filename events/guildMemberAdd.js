// File: events/guildMemberAdd.js (INI KODE YANG BENAR)

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

            const welcomeEmbed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setImage('attachment://welcome-card.png');

            await welcomeChannel.send({ embeds: [welcomeEmbed], files: [attachment] });

        } catch (error) {
            console.error("ERROR SAAT MEMBUAT WELCOME CARD/EMBED:", error);
        }
    },
};
