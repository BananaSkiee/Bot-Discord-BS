const { SlashCommandBuilder } = require("discord.js");
const { Configuration, OpenAIApi } = require("openai"); // ✅ pakai kurung kurawal

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration); // ✅ Bukan 'new OpenAI'

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cek-kodam")
    .setDescription("🔮 Cek kodam spiritual kamu dari AI ✨"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const res = await openai.createChatCompletion({
        model: "gpt-4o", // atau gpt-3.5-turbo jika akun kamu tidak punya akses gpt-4o
        messages: [
          {
            role: "system",
            content: "Kamu adalah dukun sakti nan mistis. Jawabanmu harus gaib, puitis, dan spiritual. Hanya 2–4 kalimat.",
          },
          {
            role: "user",
            content: "Tolong bacakan kodamku.",
          },
        ],
        temperature: 1,
        max_tokens: 150,
      });

      const reply = res.data.choices?.[0]?.message?.content || "❌ Gagal membaca kodam.";
      await interaction.editReply(`🔮 **Kodammu telah dibaca:**\n${reply}`);
    } catch (error) {
      console.error("❌ AI Error:", error.response?.data || error.message);
      await interaction.editReply("❌ Gagal membaca kodam. Coba lagi nanti.");
    }
  },
};
