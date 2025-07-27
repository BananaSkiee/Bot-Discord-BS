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
                  content: `<a:BananaSkiee:1360541400382439475> <a:rflx:1361623860205715589> <a:rflx_e:1361624001939771413> <a:rflx_l:1361624056884887673> <a:rflx_c:1361624260434591855> <a:rflx_o:1361624335126626396> <a:rflx_m:1361624355771256956> <a:rflx_e:1361624001939771413> <a:BananaSkiee:1360541400382439475>
  
  Welcome       : <@${member.id}>
To Server     : ${member.guild.name}
Total Members : ${member.guild.memberCount}`,
  embeds: [testEmbed], 
  files: [attachment], 
  components: [row] 
});

        } catch (error) {
            console.error("ERROR SAAT MEMBUAT WELCOME EMBED DENGAN TOMBOL:", error);
        }
    },
};
