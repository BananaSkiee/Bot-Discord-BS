const { SlashCommandBuilder } = require("discord.js");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cek-kodam")
    .setDescription("🔮 Cek kodam spiritual kamu dari AI ✨"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const res = await openai.chat.completions.create({
        model: "gpt-4o",
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

      await interaction.editReply(`🔮 **Kodammu telah dibaca:**\n${res.choices[0].message.content}`);
    } catch (e) {
      console.error("❌ AI Error:", e);
      await interaction.editReply("❌ Gagal membaca kodam. Coba lagi nanti.");
    }
  }
};
