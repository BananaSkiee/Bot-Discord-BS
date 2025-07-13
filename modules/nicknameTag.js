const fs = require("fs");
const path = require("path");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { ROLES, ROLE_DISPLAY_MAP, guildId } = require("../config");

const filePath = path.join(__dirname, "../data/taggedUsers.json");

module.exports = async (client) => {
  const guild = await client.guilds.fetch(guildId);
  const member = await guild.members.fetch("1346964077309595658"); // Ganti dengan ID user yang ingin dites

  if (!member || member.user.bot) return;

  // Cek file tag
  let taggedUsers = {};
  if (fs.existsSync(filePath)) {
    taggedUsers = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  // Sudah pernah dikirimi DM
  if (taggedUsers[member.id] !== undefined) return;

  const displayName = member.user.globalName ?? member.user.username;

  const role = ROLES.find((r) => member.roles.cache.has(r.id));
  if (!role) return;

  const displayRole = ROLE_DISPLAY_MAP[role.id] || "📛 Tidak Dikenali";

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("use_tag")
      .setLabel(`Ya, pakai tag ${role.tag}`)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("remove_tag")
      .setLabel("Tidak, tanpa tag")
      .setStyle(ButtonStyle.Secondary)
  );

  try {
    await member.send({
      content: `✨ *Halo, ${displayName}!*

🔰 Kamu menerima tag eksklusif: **${role.tag}**  
📛 Karena kamu memiliki role: **${displayRole}**

Ingin menampilkan tag itu di nickname kamu?  
Contoh: \`${role.tag} ${displayName}\`

────────────────────────────

Silakan pilih opsi di bawah ini: 👇`,
      components: [row],
    });

    taggedUsers[member.id] = null;
    fs.writeFileSync(filePath, JSON.stringify(taggedUsers, null, 2));

    console.log(`✅ DM sukses dikirim ke ${displayName}`);
  } catch (err) {
    console.error(`❌ Gagal kirim DM ke ${displayName}:`, err.message);
  }
};
