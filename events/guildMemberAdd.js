const { AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const generateWelcomeCard = require('../modules/welcomeCard.js');
const getRandomQuote = require("../modules/welcomeQuotes");

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        // --- CHANNEL ID (ganti sesuai servermu) ---
        const welcomeChannelId = '1352311290432983182';
        const rulesChannelId   = '1352326247186694164';
        const rolesChannelId   = '1352823970054803509';
        const helpChannelId    = '1352326787367047188';
        // ------------------------------------------

        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (!welcomeChannel) return;

        // Debug log biar ketahuan event masuk
        console.log(`[DEBUG] ${member.user.tag} baru join ${member.guild.name}`);

        try {
            const imageBuffer = await generateWelcomeCard(member);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-card.png' });

            // Warna acak HEX
            function getRandomColor() {
                const letters = '0123456789ABCDEF';
                let color = '#';
                for (let i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }

            const message = getRandomQuote(member.user.username);

            const embed = new EmbedBuilder()
                .setColor(getRandomColor())
                .setTitle(message)
                .setImage('attachment://welcome-card.png')
                .setFooter({
                    text: '© BananaSkiee Community',
                    iconURL: 'https://i.imgur.com/RGp8pqJ.jpeg',
                })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Rules')
                        .setEmoji('📖')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/channels/${member.guild.id}/${rulesChannelId}`),

                    new ButtonBuilder()
                        .setLabel('Verified')
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/channels/${member.guild.id}/${rolesChannelId}`),

                    new ButtonBuilder()
                        .setLabel('Bantuan')
                        .setEmoji('❓')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/channels/${member.guild.id}/${helpChannelId}`)
                );

            await welcomeChannel.send({
                content: `<a:BananaSkiee:1360541400382439475> Selamat datang <@${member.id}> di **BananaSkiee Community** 🎉\nSekarang total member: **${member.guild.memberCount}**`,
                embeds: [embed],
                files: [attachment],
                components: [row]
            });

        } catch (error) {
            console.error("❌ ERROR WELCOME:", error);
        }
    },
};
