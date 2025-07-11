module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const username = interaction.user.username;

    const fs = require("fs");
    const path = require("path");

    const filePath = path.join(__dirname, "../data/taggedUsers.json");
    const ROLES = [
      { id: process.env.ROLE_1_ID, tag: "[OWNER]" },
      { id: process.env.ROLE_2_ID, tag: "[ADMIN]" },
      { id: process.env.ROLE_3_ID, tag: "[MOD]" },
      { id: process.env.ROLE_4_ID, tag: "[BOOST]" },
      { id: process.env.ROLE_5_ID, tag: "[CREATOR]" },
      { id: process.env.ROLE_6_ID, tag: "[ALUMNI]" },
      { id: process.env.ROLE_7_ID, tag: "[100]" },
      { id: process.env.ROLE_8_ID, tag: "[80]" },
      { id: process.env.ROLE_9_ID, tag: "[70]" },
      { id: process.env.ROLE_10_ID, tag: "[60]" },
      { id: process.env.ROLE_11_ID, tag: "[55]" },
      { id: process.env.ROLE_12_ID, tag: "[VIP]" },
      { id: process.env.ROLE_13_ID, tag: "[FRIEND]" },
      { id: process.env.ROLE_14_ID, tag: "[PARTNER]" },
      { id: process.env.ROLE_15_ID, tag: "[MEM]" },
    ];

    function saveTaggedUsers(data) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }

    // 🛡️ HARUS CEK GUILD DULU (karena DM tidak punya guild)
    const guild = interaction.client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return;

    const member = await guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        content: "❌ Gagal ambil datamu dari server.",
        ephemeral: true,
      }).catch(console.error);
    }

    let taggedUsers = {};
    try {
      taggedUsers = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      taggedUsers = {};
    }

    const role = ROLES.find((r) => member.roles.cache.has(r.id));
    if (!role) {
      return interaction.reply({
        content: "❌ Kamu tidak punya role prioritas.",
        ephemeral: true,
      }).catch(console.error);
    }

    if (interaction.customId === "use_tag") {
      await member.setNickname(`${role.tag} ${username}`).catch(console.error);
      taggedUsers[member.id] = true;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: `✅ Nama kamu sekarang: \`${role.tag} ${username}\``,
        ephemeral: true,
      }).catch(console.error);
    }

    if (interaction.customId === "remove_tag") {
      await member.setNickname(null).catch(console.error);
      taggedUsers[member.id] = false;
      saveTaggedUsers(taggedUsers);

      return interaction.reply({
        content: "✅ Nama kamu dikembalikan ke semula.",
        ephemeral: true,
      }).catch(console.error);
    }
  },
};
