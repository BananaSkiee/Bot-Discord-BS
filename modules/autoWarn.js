const { Events, EmbedBuilder } = require("discord.js");

const bannedWords = [
  // Bahasa Indonesia kasar & singkatan
  "anjing", "anjg", "ajg", "ajgk",
  "bangsat", "bgsd", "bgst",
  "goblok", "gblk",
  "tai", "kontol", "kntl", "kontl",
  "memek", "memk", "meki", "meky", "pepek", "peler",
  "ngentot", "ngentt", "ngntd", "ngntl", "kentot", "kenthu",
  "tolol", "tll", "idiot", "setan", "brengsek", "keparat", "kampret", "pantek", "pntk", "pnjk", "jmbt", "jmbtt", "asu", "babi",

  // Bahasa Inggris kasar & variasi alay
  "fuck", "fck", "fuk", "fak", "fkn", "fkng", "fukc", "fking",
  "shit", "sh1t", "sht", "shyt",
  "bitch", "btch", "biatch",
  "asshole", "a$$", "assh0le", "jerk",
  "dick", "d1ck", "d1x", "d!ck",
  "cunt", "c*nt",
  "bastard", "retard", "stupid", "slut", "whore", "hoe", "suck", "sux"
];

// ID channel log pelanggaran
const logChannelId = "1353887827619872800";

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Abaikan pesan dari bot atau DM
    if (message.author.bot || message.channel.type !== 0) return;

    const content = message.content.toLowerCase();
    const found = bannedWords.find(word => content.includes(word));
    if (!found) return;

    try {
      // Hapus pesan
      await message.delete();

      // Kirim peringatan ke channel tempat user kirim
      await message.channel.send({
        content: `⚠️ <@${message.author.id}>, pesanmu mengandung kata terlarang: \`${found}\` dan telah dihapus.\n**Jaga sopan santun ya.**`,
        allowedMentions: { users: [message.author.id] }
      });

      // Kirim log embed ke channel log
      const logChannel = message.client.channels.cache.get(logChannelId);
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle("🚨 Peringatan Otomatis (Auto-Warn)")
          .setColor("Red")
          .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: "👤 Pengguna", value: `<@${message.author.id}> (${message.author.tag})`, inline: false },
            { name: "💬 Pesan", value: `\`${message.content}\``, inline: false },
            { name: "❗ Kata Terlarang", value: `\`${found}\``, inline: true },
            { name: "📍 Channel", value: `<#${message.channel.id}>`, inline: true },
            { name: "🕒 Waktu", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
          )
          .setFooter({ text: "Sistem Anti-Toxic Aktif ✅" });

        await logChannel.send({ embeds: [embed] });
      }

    } catch (err) {
      console.error("❌ Gagal proses auto-warn:", err);
    }
  }
};
