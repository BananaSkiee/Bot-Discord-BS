const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/taggedUsers.json");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (!interaction.guild) return;

    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: "❌ Tidak bisa menemukan member kamu.", ephemeral: true });
    }

    const username = member.user.username;

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
      { id: process.env.ROLE_15_ID, tag: '[MEM]' },
    ];

    let taggedUsers = {};
    if (fs.existsSync(filePath)) {
      taggedUsers = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    const role = ROLES.find(r => member.roles.cache.has(r.id));
    if (!role) {
      return interaction.reply({ content: "❌ Kamu tidak punya role prioritas.", ephemeral: true });
    }

    if (interaction.customId === "use_tag") {
      const newName = `${role.tag} ${username}`;

      try {
        await member.setNickname(newName);
        taggedUsers[member.id] = {
          status: "yes",
          original: username
        };
        fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));
        return interaction.reply({
          content: `✅ Nama kamu sekarang: \`${newName}\``,
          ephemeral: true
        });
      } catch (err) {
        return interaction.reply({ content: "❌ Gagal mengganti nickname.", ephemeral: true });
      }
    }

    if (interaction.customId === "remove_tag") {
      const original = taggedUsers[member.id]?.original || username;

      try {
        await member.setNickname(original);
        taggedUsers[member.id] = {
          status: "no",
          original
        };
        fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));
        return interaction.reply({
          content: `✅ Nama kamu dikembalikan ke: \`${original}\``,
          ephemeral: true
        });
      } catch (err) {
        return interaction.reply({ content: "❌ Gagal menghapus tag.", ephemeral: true });
      }
    }
  }
};
