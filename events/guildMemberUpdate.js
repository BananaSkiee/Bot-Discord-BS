const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config');

const ROLES = [
  { id: process.env.ROLE_1_ID, tag: '[OWNER]' },
  { id: process.env.ROLE_2_ID, tag: '[ADMIN]' },
  { id: process.env.ROLE_3_ID, tag: '[MOD]' },
  { id: process.env.ROLE_4_ID, tag: '[BOOST]' },
  { id: process.env.ROLE_5_ID, tag: '[CREATOR]' },
  { id: process.env.ROLE_6_ID, tag: '[ALUMNI]' },
  { id: process.env.ROLE_7_ID, tag: '[100]' },
  { id: process.env.ROLE_8_ID, tag: '[80]' },
  { id: process.env.ROLE_9_ID, tag: '[70]' },
  { id: process.env.ROLE_10_ID, tag: '[60]' },
  { id: process.env.ROLE_11_ID, tag: '[55]' },
  { id: process.env.ROLE_12_ID, tag: '[VIP]' },
  { id: process.env.ROLE_13_ID, tag: '[FRIEND]' },
  { id: process.env.ROLE_14_ID, tag: '[PARTNER]' },
  { id: process.env.ROLE_15_ID, tag: '[MEM]' }
];

module.exports = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const matchingRole = ROLES.find(r => addedRoles.has(r.id));

    if (!matchingRole) return;

    const user = newMember.user;
    const currentName = newMember.nickname || user.username;
    const tag = matchingRole.tag;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('apply_tag')
        .setLabel(`Gunakan Tag ${tag}`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('remove_tag')
        .setLabel('Hapus Tag')
        .setStyle(ButtonStyle.Secondary)
    );

    try {
     await member.send({
      content: `✨ *Selamat datang, ${member.user.username}!*

🔰 *Kami melihat kamu telah menerima role eksklusif ${role.tag} di server BananaSkiee Community.*

*Ingin menampilkan tag itu di nickname kamu?*  
*Contoh:* \`${role.tag} ${member.user.username}\`

──────────────────────

*Pilih opsi di bawah ini 👇*`,
      components: [row],
    });
    } catch (err) {
      console.error('Gagal mengirim DM:', err.message);
    }
  }
};
