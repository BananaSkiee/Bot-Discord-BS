const { SlashCommandBuilder } = require("discord.js");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cek-kodam")
    .setDescription("Cek kodam spiritual kamu dari AI ✨"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Kamu adalah dukun spiritual sakti yang membaca kodam orang. Jawabanmu harus mistis, puitis, penuh aura gaib. Gunakan gaya bahasa halus, hanya 2–4 kalimat.",
          },
          {
            role: "user",
            content: "Tolong bacakan kodamku.",
          },
        ],
        temperature: 1,
        max_tokens: 150,
      });

      const hasil = response.choices[0].message.content;
      await interaction.editReply(`🔮 **Kodammu telah dibaca:**\n${hasil}`);
    } catch (err) {
      console.error("❌ Gagal channeling AI:", err);
      await interaction.editReply("❌ Gagal membaca kodam kamu. Coba lagi nanti.");
    }
  }
};
