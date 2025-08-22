const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const { ROLES, guildId } = require("../config");

const filePath = path.join(__dirname, "../data/taggedUsers.json");

function saveTaggedUsers(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {

      // ===================== SLASH COMMAND =====================
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
          return interaction.reply({ content: "❌ Command tidak ditemukan.", ephemeral: true });
        }

        try {
          await command.execute(interaction, interaction.client);
        } catch (err) {
          console.error(`❌ Error di command ${interaction.commandName}:`, err);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "❌ Terjadi error saat jalankan command.", ephemeral: true });
          } else {
            await interaction.reply({ content: "❌ Terjadi error saat jalankan command.", ephemeral: true });
          }
        }
        return; // supaya nggak lanjut ke bawah (button handler)
      }
    
  if (!interaction.isButton()) return;
    
    try {
      console.log("👉 Tombol ditekan:", interaction.customId);

      const username = interaction.user.globalName ?? interaction.user.username;
      const guild = interaction.client.guilds.cache.get(guildId);
      if (!guild) return;

      const member = await guild.members.fetch(interaction.user.id).catch(() => null);
      if (!member) {
        return interaction.reply({
          content: "❌ Gagal ambil datamu dari server.",
          ephemeral: true,
        });
      }

      const customId = interaction.customId;

      const taggedUsers = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, "utf8"))
        : {};

      // ====================== 📜 RULES ======================
      if (customId === "rules_btn") {
        const allowedEmbed = new EmbedBuilder()
          .setTitle("✅ YANG BOLEH")
          .setDescription(
            '<a:ceklis:1402332072533823640> | **Ngobrol santai** - Asal sopan dan friendly\n' +
            '<a:ceklis:1402332072533823640> | **Nge-share meme** - Yang receh tapi lucu\n' +
            '<a:ceklis:1402332072533823640> | **Nanya-nanya** - Tentang game/anime/life\n' +
            '<a:ceklis:1402332072533823640> | **Main bot** - Musik, Owo, dll (jangan spam)\n' +
            '<a:ceklis:1402332072533823640> | **Bikin event** - Tanya admin dulu\n' +
            '<a:ceklis:1402332072533823640> | **Kasih saran** - Buat server lebih baik'
          )
          .setColor("Blue");

        const notAllowedEmbed = new EmbedBuilder()
          .setTitle("❌ YANG GAK BOLEH")
          .setDescription(
            '<a:silang:1402332141047513150> | **Bahasa kasar** - Toxic = mute/ban\n' +
            '<a:silang:1402332141047513150> | **Spam mention** - @everyone/@admin tanpa penting\n' +
            '<a:silang:1402332141047513150> | **Ngebully** - Auto ban permanen\n' +
            '<a:silang:1402332141047513150> | **NSFW** - Foto/video/chat 18+\n' +
            '<a:silang:1402332141047513150> | **Promo random** - Kecuali di channel promo\n\n' +
            '**Catatan:**\n"Kalo ragu boleh nanya admin dulu~" 🔍'
          )
          .setColor("Red")
          .setFooter({
            text: "© Copyright | BananaSkiee Community",
            iconURL: "https://i.imgur.co/RGp8pqJ.jpeg",
          })
          .setImage("https://i.ibb.com/4wcgBZQS/6f59b29a5247.gif");

        return interaction.reply({ embeds: [allowedEmbed, notAllowedEmbed], ephemeral: true });
      }

      // ====================== ⚠️ PUNISHMENT ======================
      if (customId === "punishment_btn") {
        const warnEmbed = new EmbedBuilder()
          .setTitle("📜 HUKUMAN SERVER BANANASKIEE COMMUNITY ")
          .setDescription(
            '### ⚠️ SISTEM WARNING\n' +
            '<a:seru:1402337929556263002> | **Warn 1** = Peringatan\n' +
            '<a:seru:1402337929556263002> | **Warn 2** = Mute 5 menit\n' +
            '<a:seru:1402337929556263002> | **Warn 3** = Mute 10 menit\n' +
            '<a:seru:1402337929556263002> | **Warn 4** = Mute 1 jam\n' +
            '<a:seru:1402337929556263002> | **Warn 5** = Mute 1 hari\n' +
            '<a:seru:1402337929556263002> | **Warn 6** = Mute 3 hari\n' +
            '<a:seru:1402337929556263002> | **Warn 7** = Softban + Mute 1 minggu\n' +
            '<a:seru:1402337929556263002> | **Warn 8** = Ban 1 hari\n' +
            '<a:seru:1402337929556263002> | **Warn 9** = Ban 3 hari\n' +
            '<a:seru:1402337929556263002> | **Warn 10** = Ban 1 minggu\n' +
            '<a:seru:1402337929556263002> | **Warn 11** = **BAN PERMANEN**\n\n' +
            '### 🔇 PELANGGARAN AUTO-MUTE\n' +
            '- **Spam/Flood** = Mute 20 menit\n' +
            '- **Bahasa NSFW** = Mute 1 hari\n' +
            '- **Kirim NSFW/Gore** = Mute 7 hari\n' +
            '- **Link scam** = Mute 3 hari\n' +
            '- **Rasis/SARA** = Mute 5 hari\n\n' +
            '### 🔨 PELANGGARAN AUTO-SOFTBAN\n' +
            '- **Spam link scam** = Mute 4 hari\n' +
            '- **Plagiarisme** = Mute 3 hari\n\n' +
            '### 🚫 PELANGGARAN AUTO-BAN\n' +
            '- **Akun/PFP NSFW** = Ban 7 hari\n' +
            '- **Akun spam NSFW** = Ban 10 hari\n\n' +
            '**📌 CATATAN PENTING:**\n' +
            '1. Semua warn akan **hangus setelah 1 bulan**\n' +
            '2. Pelanggaran **NSFW/Rasis/SARA** tidak bisa di-reset\n' +
            '3. Admin berhak memberikan hukuman tambahan sesuai tingkat pelanggaran\n\n' +
            '"Hukuman diberikan bukan untuk menyusahkan, tapi untuk menjaga kenyamanan bersama!" 🍍'
          )
          .setColor("Yellow")
          .setFooter({
            text: "© Copyright | BananaSkiee Community",
            iconURL: "https://i.imgur.com/RGp8pqJ.jpeg",
          })
          .setImage("https://i.ibb.co.com/WvSvsVfH/standard-34.gif");

        return interaction.reply({ embeds: [warnEmbed], ephemeral: true });
      }
        
      // ========== TOMBOL ✅ UMUM ==========
      if (customId === "use_tag") {
        const role = ROLES.find(r => member.roles.cache.has(r.id));
        if (!role) {
          return interaction.reply({
            content: "❌ Kamu tidak punya role yang cocok untuk tag ini.",
            ephemeral: true,
          });
        }

        await member.setNickname(`${role.tag} ${username}`).catch(console.error);
        taggedUsers[member.id] = true;
        saveTaggedUsers(taggedUsers);

        return interaction.reply({
          content: `✅ Nama kamu sekarang: \`${role.tag} ${username}\``,
          ephemeral: true,
        });
      }

      // ========== TOMBOL ❌ HAPUS TAG UMUM ==========
      if (customId === "remove_tag") {
        await member.setNickname(username).catch(console.error);
        taggedUsers[member.id] = false;
        saveTaggedUsers(taggedUsers);

        return interaction.reply({
          content: "✅ Tag dihapus dan nickname dikembalikan.",
          ephemeral: true,
        });
      }

// ...
// ========== TOMBOL TEST ✅ / ❌ ==========
if (
  interaction.isButton() && (
    customId.startsWith("test_use_tag_") ||
    customId.startsWith("test_remove_tag_")
  )
) {
  const parts = customId.split("_");
  const action = parts[1];
  const roleId = parts[3];
  const safeTagId = parts.slice(4).join("_");

  const matched = ROLES.find(
    r =>
      r.id === roleId &&
      r.tag.replace(/[^\w-]/g, "").toLowerCase() === safeTagId
  );

  if (!matched) {
    return interaction.reply({
      content: "❌ Tag tidak ditemukan atau tidak valid.",
      ephemeral: true,
    });
  }

  const realTag = matched.tag;

  if (action === "use") {
    await member.setNickname(`${realTag} ${username}`).catch(console.error);
    if (!member.roles.cache.has(matched.id)) {
      await member.roles.add(matched.id).catch(console.error);
    }
    taggedUsers[member.id] = true;
    saveTaggedUsers(taggedUsers);

    return interaction.reply({
      content: `🧪 Nickname kamu sekarang: \`${realTag} ${username}\``,
      ephemeral: true,
    });
  }

  if (action === "remove") {
    await member.setNickname(username).catch(console.error);
    taggedUsers[member.id] = false;
    saveTaggedUsers(taggedUsers);

    return interaction.reply({
      content: `🧪 Nickname kamu dikembalikan menjadi \`${username}\``,
      ephemeral: true,
    });
  }
}

// ========== TOMBOL DUEL ==========
if (customId.startsWith("accept_duel") || customId.startsWith("decline_duel")) {
  const [action, challengerId, targetId] = customId.split("_");

  if (interaction.user.id !== targetId && interaction.user.id !== challengerId) {
    return interaction.reply({
      content: "❌ Kamu bukan bagian dari duel ini.",
      ephemeral: true,
    });
  }

  if (action === "accept") {
    return interaction.reply({
      content: `⚔️ Duel dimulai antara <@${challengerId}> dan <@${targetId}>!`,
    });
  }

  if (action === "decline") {
    return interaction.reply({
      content: `❌ <@${targetId}> menolak duel dari <@${challengerId}>.`,
    });
  }

  return; // ✅ tambahin biar nggak turun ke UNKNOWN
}

// ========== TOMBOL SHOOT ==========
if (customId.startsWith("shoot_")) {
  const [_, challengerId, targetId] = customId.split("_");

  if (interaction.user.id !== challengerId && interaction.user.id !== targetId) {
    return interaction.reply({
      content: "❌ Kamu bukan bagian dari duel ini.",
      ephemeral: true,
    });
  }

  return interaction.reply({
    content: `🔫 <@${interaction.user.id}> menembak dalam duel!`,
  });
}
    
    // ========== UNKNOWN ==========
    return interaction.reply({
      content: "⚠️ Tombol tidak dikenali.",
      ephemeral: true,
    });

} catch (err) {
    console.error("❌ ERROR GLOBAL DI INTERACTIONCREATE:", err);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "❌ Terjadi error internal.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "❌ Terjadi error internal.",
        ephemeral: true,
      });
    }
  }
} // ⬅️ Tutup fungsi execute
};   // ⬅️ Tutup module.exports
