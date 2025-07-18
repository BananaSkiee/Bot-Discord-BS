const translate = require("@vitalets/google-translate-api");

const LANG_CODES = {
  ind: "id", // Indonesia
  ing: "en", // Inggris
  jpn: "ja", // Jepang
  kor: "ko", // Korea
  ara: "ar", // Arab
  rus: "ru", // Rusia
  spa: "es", // Spanyol
  ger: "de", // Jerman
  fra: "fr", // Perancis
  ita: "it", // Italia
  chn: "zh-CN", // Mandarin
};

module.exports = async function handleTranslate(message) {
  const prefixMatch = message.content.match(/^(\w{3})!(.+)/);
  if (!prefixMatch) return;

  const [_, targetLangCmd, text] = prefixMatch;
  const targetLang = LANG_CODES[targetLangCmd.toLowerCase()];
  if (!targetLang) {
    return message.reply("❌ Bahasa tidak dikenali. Contoh: `ing!apa kabar`");
  }

  try {
    const result = await translate(text.trim(), { to: targetLang });
    return message.reply(`🌐 **Terjemahan (${targetLangCmd}):**\n${result.text}`);
  } catch (error) {
    console.error("Terjadi kesalahan saat translate:", error);
    return message.reply("❌ Gagal menerjemahkan pesan.");
  }
};
