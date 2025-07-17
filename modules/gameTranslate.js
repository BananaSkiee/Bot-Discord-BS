const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const translate = require("@vitalets/google-translate-api");

module.exports = async (message, client) => {
  if (!message.author.bot || message.author.id === client.user.id) return;
  if (message.content.length < 5) return;

  try {
    // Deteksi bahasa
    const detected = await translate(message.content, { to: "en" });
    if (detected.from.language.iso !== "en") return; // hanya kalau dari English

    const translated = await translate(message.content, { to: "id" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`translate_ok`)
        .setLabel("✅ Oke")
        .setStyle(ButtonStyle.Success)
    );

    const sent = await message.channel.send({
      content: `🗨️ ${translated.text}`,
      components: [row],
      reply: { messageReference: message.id },
    });

    // Simpan ID message agar bisa dihapus nanti
    client.translatedMessages = client.translatedMessages || {};
    client.translatedMessages[sent.id] = true;

  } catch (err) {
    console.error("Translate error:", err);
  }
};
