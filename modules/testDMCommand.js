const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const taggedUsersPath = require("path").join(__dirname, "../data/taggedUsers.json");
const fs = require("fs");

function saveTaggedUsers(data) {
  fs.writeFileSync(taggedUsersPath, JSON.stringify(data, null, 2));
}

function loadTaggedUsers() {
  try {
    return JSON.parse(fs.readFileSync(taggedUsersPath, "utf8"));
  } catch {
    return {};
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testdm")
    .setDescription("Mengirim DM simulasi dan mengganti nickname user dengan tag manual")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("User yang ingin dikirimi DM dan diganti nicknamenya")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("tag")
        .setDescription("Tag yang akan digunakan, contoh: [MOD]")
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = await interaction.guild.members.fetch(interaction.options.getUser("user"));
    const tag = interaction.options.getString("tag").trim();
    const username = member.user.username;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("test_use_tag")
        .setLabel(`Ya, pakai tag ${tag}`)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("test_remove_tag")
        .setLabel("Tidak, tanpa tag")
        .setStyle(ButtonStyle.Secondary)
    );

    try {
      await member.send({
        content: `✨ *Selamat datang, ${username}!*

🔰 *Kamu telah menerima tag eksklusif ${tag} di server BananaSkiee Community.*

*Ingin menampilkan tag itu di nickname kamu?*  
*Contoh:* \`${tag} ${username}\`

──────────────────────

*Pilih opsi di bawah ini 👇*`,
        components: [row],
      });

      await interaction.reply({ content: `✅ DM terkirim ke ${member.user.tag}`, ephemeral: true });

      // Listener tombol sementara
      const filter = i => (i.customId === "test_use_tag" || i.customId === "test_remove_tag") && i.user.id === member.id;

      const collector = member.dmChannel.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

      collector.on("collect", async i => {
        const taggedUsers = loadTaggedUsers();

        if (i.customId === "test_use_tag") {
          await member.setNickname(`${tag} ${username}`).catch(console.error);
          taggedUsers[member.id] = true;
          saveTaggedUsers(taggedUsers);
          await i.reply({ content: `✅ Nama kamu sekarang: \`${tag} ${username}\``, ephemeral: true });
        }

        if (i.customId === "test_remove_tag") {
          await member.setNickname(null).catch(console.error);
          taggedUsers[member.id] = false;
          saveTaggedUsers(taggedUsers);
          await i.reply({ content: "✅ Nama kamu dikembalikan ke semula.", ephemeral: true });
        }

        collector.stop(); // Stop setelah 1 klik
      });

    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "❌ Gagal mengirim DM ke user tersebut.", ephemeral: true });
    }
  }
};
