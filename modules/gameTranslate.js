const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const translate = require("@vitalets/google-translate-api");

module.exports = async (message, client) => {
  // Deteksi jika bukan dari bot lain (hindari looping)
  if (!message.author.bot) return;

  // Cek panjang teks agar tidak translate yang terlalu pendek/aneh
  if (message.content.length < 5) return;

  try {
    // Translate ke Bahasa Indonesia
    const res = await translate(message.content, { to: "id" });

    // Kirim pesan hasil translate + tombol
    const translatedText = res.text;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`translate_ok_${message.id}`)
        .setLabel("✅ Oke")
        .setStyle(ButtonStyle.Success)
    );

    const sent = await message.channel.send({
      content: `🗨️ ${translatedText}`,
      components: [row],
      reply: { messageReference: message.id },
    });

    // Auto delete setelah 5 menit
    setTimeout(() => {
      sent.delete().catch(() => {});
    }, 5 * 60 * 1000); // 5 menit

  } catch (err) {
    console.error("Translate error:", err);
  }
};
