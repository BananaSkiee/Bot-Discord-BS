// modules/btc.js

const { SlashCommandBuilder } = require('discord.js');
const renderGrafik = require('./renderGrafik');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('btc')
    .setDescription('Tampilkan grafik BTC terbaru!'),
  async execute(interaction) {
    const grafik = renderGrafik();
    await interaction.reply(`\`\`\`\n${grafik}\n\`\`\``);
  },
};
