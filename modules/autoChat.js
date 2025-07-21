const { Configuration, OpenAIApi } = require("openai");
const { CHANNEL_AI } = require("../config");

// Konfigurasi OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Fungsi untuk menghasilkan respon AI
async function generateResponse(prompt) {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    return completion.data.choices[0].message.content;
  } catch (error) {
    console.error("Error saat generateResponse:", error);
    return "❌ Terjadi error saat menjawab.";
  }
}

// Export fungsi utama
module.exports = async (message) => {
  if (message.author.bot) return;

  // Command !ai
  if (message.content.startsWith("!ai")) {
    const prompt = message.content.slice(4).trim();
    if (!prompt) return message.reply("Masukkan pertanyaan setelah `!ai`.");

    await message.channel.sendTyping();
    const reply = await generateResponse(prompt);
    return message.reply(reply);
  }

  // Auto-reply di channel AI khusus
  if (message.channel.id === CHANNEL_AI) {
    await message.channel.sendTyping();
    const reply = await generateResponse(message.content);
    return message.reply(reply);
  }
};
