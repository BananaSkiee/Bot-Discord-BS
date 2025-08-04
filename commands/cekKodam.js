const { SlashCommandBuilder } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
Gunakan bahasa Indonesia santai + sedikit bahasa gaul, seperti ngobrol sama teman.
Jangan jawab panjang, cukup 2–4 kalimat.
Jangan bilang kamu AI atau model bahasa.
Langsung bacakan "Kodam" untuk orang bernama ${username}.
Buat seolah-olah kamu beneran meramal kodamnya, bisa ada hewan, makhluk gaib, atau sesuatu yang unik.
Contoh gaya: "Hmm... gua liat di belakang lo ada macan putih nongkrong sambil nyengir."
`;

      const result = await model.generateContent(prompt);
      const replyText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "Hmm... gua gak bisa liat kodam lo sekarang 😅";

      await interaction.editReply(`🔮 **Kodam untuk ${username}:**\n${replyText.trim()}`);
    } catch (error) {
      console.error("❌ Gemini Error:", error);
      await interaction.editReply("❌ Gagal membaca kodam. Coba lagi nanti.");
    }
  },
};
