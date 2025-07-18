const translate = require("@vitalets/google-translate-api");

const languageMap = {
  ing: "en", en: "en",
  ind: "id", id: "id",
  jpn: "ja", ja: "ja",
  kor: "ko", ko: "ko",
  fr: "fr",
  de: "de",
  es: "es",
  ru: "ru",
  zh: "zh",
  ar: "ar",
  it: "it",
  pt: "pt",
};

module.exports = async (message) => {
  if (message.author.bot) return;

  const prefixRegex = /^(\w{2,4})!(.+)/i;
  const match = message.content.match(prefixRegex);

  if (!match) return;

  const code = match[1].toLowerCase();
  const text = match[2].trim();

  const lang = languageMap[code];
  if (!lang) {
    return message.reply(`❌ Kode bahasa \`${code}\` tidak dikenali.`);
  }

  try {
    const result = await translate(text, { to: lang });
    await message.reply(`🌐 (${code.toUpperCase()}) ${result.text}`);
  } catch (err) {
    console.error("❌ Translate error:", err);
    await message.reply("❌ Gagal menerjemahkan.");
  }
};
