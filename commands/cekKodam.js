// commands/cekKodam.js
const { SlashCommandBuilder } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ambil API key dari ENV, bisa banyak dipisah koma
if (!process.env.GEMINI_KEYS) {
  console.error("❌ GEMINI_KEYS belum diatur!");
  process.exit(1);
}
const apiKeys = process.env.GEMINI_KEYS.split(",").map(k => k.trim());
let currentKeyIndex = 0;

function getGenAI() {
  return new GoogleGenerativeAI(apiKeys[currentKeyIndex]);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cek-kodam")
    .setDescription("🔮 Cek kodam spiritual kamu dari AI ✨"),

  async execute(interaction) {
    await interaction.deferReply();

    async function runKodamCheck() {
      try {
        const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });

        const username = interaction.user.username;
        const prompt = `Kamu adalah dukun sakti yang rada nyeleneh tapi tetap mistis.
Pakai bahasa Indonesia santai + sedikit bahasa gaul, seperti ngobrol sama teman.
Jawaban cukup 2–4 kalimat, singkat tapi berkesan.
Jangan bilang kamu AI atau model bahasa.
Langsung bacakan "Kodam" untuk orang bernama ${username}.
Bikin seolah-olah kamu beneran meramal kodamnya: bisa hewan, makhluk gaib, atau sesuatu yang absurd.
Kadang tambahin sedikit candaan atau deskripsi aneh biar kocak.
Contoh gaya: "Hmm... gua liat di belakang lo ada macan putih nongkrong sambil nyengir."`;

        const result = await model.generateContent(prompt);
        const replyText =
          result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Hmm... gua gak bisa liat kodam lo sekarang 😅";

        await interaction.editReply(`🔮 **Kodam untuk ${username}:**\n${replyText.trim()}`);
      } catch (error) {
        if (error.status === 429 && currentKeyIndex < apiKeys.length - 1) {
          console.warn(`⚠️ API key ${currentKeyIndex + 1} limit, ganti ke key berikutnya...`);
          currentKeyIndex++;
          return runKodamCheck();
        }
        console.error("❌ Gemini Error:", error);
        await interaction.editReply("❌ Gagal membaca kodam. Coba lagi nanti.");
      }
    }

    runKodamCheck();
  },
};
