const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const translate = require("@vitalets/google-translate-api");
const { BOT_ID_LIST } = require("../config");

module.exports = async (message, client) => {
  // Hanya lanjut kalau pengirim adalah bot dan termasuk dalam daftar BOT_ID_LIST
  if (!message.author.bot || !BOT_ID_LIST.includes(message.author.id)) return;

  // Skip pesan pendek
  if (message.content.length < 5) return;

  try {
    // Deteksi bahasa asli
    const detectRes = await translate(message.content, { to: "id" });
    const detectedLang = detectRes.from.language.iso;

    // Hanya translate kalau dari bahasa Inggris (en)
    if (detectedLang !== "en") return;

    const translatedText = detectRes.text;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`translate_ok_${message.id}`)
        .setLabel("✅ Oke")
        .setStyle(ButtonStyle.Success)
    );

    await message.channel.send({
      content: `🗨️ ${translatedText}`,
      components: [row],
      reply: { messageReference: message.id },
    });

  } catch (err) {
    console.error("Translate error:", err);
  }
};
