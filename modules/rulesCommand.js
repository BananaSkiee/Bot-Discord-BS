// modules/rulesCommand.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'rules',
    description: 'Kirim embed rules, punishment, dan sistem warn ke channel target',
    execute: async (message) => {
        const targetChannelId = '1352326247186694164';
        const channel = message.client.channels.cache.get(targetChannelId);

        if (!channel) {
            return message.reply('❌ Channel target tidak ditemukan.');
        }

        const mainEmbed = new EmbedBuilder()
            .setTitle('📜 Rules, Punishment & Sistem Warn')
            .setDescription(
                'Sebelum berinteraksi di server, pastikan kamu membaca rules agar tidak terjadi pelanggaran.\n\n' +
                '**Pilih tombol di bawah untuk melihat detail aturan.**'
            )
            .setColor('Blue')
            .setImage('https://i.ibb.co/4wcgBZQS/6f59b29a5247.gif');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('rules_btn')
                .setLabel('✅ Yang Boleh')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('punishment_btn')
                .setLabel('❌ Yang Gak Boleh')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('warn_btn')
                .setLabel('⚠️ Sistem Warn')
                .setStyle(ButtonStyle.Secondary)
        );

        await channel.send({ embeds: [mainEmbed], components: [row] });
        await message.reply('✅ Rules berhasil dikirim ke channel target.');
    }
};
