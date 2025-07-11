// modules/slashCommandSetup.js
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick member dari server')
    .addUserOption(option => option.setName('target').setDescription('Member yang mau di-kick').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban member dari server')
    .addUserOption(option => option.setName('target').setDescription('Member yang mau di-ban').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Atur slowmode channel ini')
    .addIntegerOption(option => option.setName('detik').setDescription('Jumlah detik (0-21600)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Kunci channel ini')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Buka kunci channel ini')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
]
.map(command => command.toJSON());

module.exports = async (client) => {
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    console.log('📡 Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered');
  } catch (err) {
    console.error('❌ Gagal register slash command:', err);
  }
};
