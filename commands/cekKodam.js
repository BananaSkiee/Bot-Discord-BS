// commands/cekKodam.js
const { SlashCommandBuilder } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ambil 1 API key dari env
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Tidak ada API key Gemini ditemukan!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cek-kodam")
    .setDescription("🔮 Cek kodam spiritual kamu dari AI ✨"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
      console.error("❌ Gemini Error:", error);
      await interaction.editReply("❌ Gagal membaca kodam. Coba lagi nanti.");
    }
  },
};
