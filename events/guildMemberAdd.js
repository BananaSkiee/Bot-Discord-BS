// File: events/guildMemberAdd.js (VERSI FINAL DENGAN TOMBOL LINK)

// PERUBAHAN: Tambahkan ActionRowBuilder, ButtonBuilder, dan ButtonStyle
const { AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const generateWelcomeCard = require('../modules/welcomeCard.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        // --- PENGATURAN ID (GANTI SESUAI SERVER ANDA) ---
        const welcomeChannelId = '1394478754297811034';
        const rulesChannelId   = '1352326247186694164';
        const rolesChannelId   = '1352823970054803509';
        const helpChannelId    = '1352326787367047188';
        // --------------------------------------------------

        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
        if (!welcomeChannel) return;

        try {
            const imageBuffer = await generateWelcomeCard(member);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-card.png' });

            // PERUBAHAN: Embed diubah agar mirip contoh VoxRegn
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#2ECC71') // Anda bisa ganti warna ini jika mau
                .setAuthor({ name: `Welcome, ${member.user.username}`, iconURL: member.user.displayAvatarURL() })
                .setDescription(
                    `Welcome <@${member.id}> to **${member.guild.name}**!\n\n` +
                    `>>> ››› Read the rules in <#${rulesChannelId}>\n` +
                    `>>> ››› Choose your roles in <#${rolesChannelId}>\n` +
                    `>>> ››› Need assistance? Visit <#${helpChannelId}>`
                )
                .setImage('attachment://welcome-card.png');

            // BARU: Membuat baris tombol link
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Rules')
                        .setEmoji('📖') // Emoji bisa diganti atau dihapus
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/channels/${member.guild.id}/${rulesChannelId}`),
                    
                    new ButtonBuilder()
                        .setLabel('Verified')
                        .setEmoji('🎭')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/channels/${member.guild.id}/${rolesChannelId}`),

                    new ButtonBuilder()
                        .setLabel('Bantuan')
                        .setEmoji('❓')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/channels/${member.guild.id}/${helpChannelId}`)
                );

            // PERUBAHAN: Mengirim pesan lengkap dengan tombol
            await welcomeChannel.send({
                embeds: [welcomeEmbed],
                files: [attachment],
                components: [row] // Menambahkan tombol ke pesan
            });

        } catch (error) {
            console.error("ERROR SAAT MEMBUAT WELCOME EMBED DENGAN TOMBOL:", error);
        }
    },
};
