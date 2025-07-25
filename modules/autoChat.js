const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_CHANNEL_ID = "1352635177536327760";

module.exports = async (message) => {
  if (message.author.bot || message.channel.id !== AI_CHANNEL_ID) return;

  try {
    await message.channel.sendTyping();

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // atau "gpt-3.5-turbo"
      messages: [
        { role: "system", content: "Kamu adalah asisten AI ramah di Discord server ini." },
        { role: "user", content: message.content }
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    const reply = response.choices?.[0]?.message?.content;
    if (reply) {
      await message.reply(reply);
    }
  } catch (error) {
    console.error("❌ AI error:", error.response?.data || error.message);
    await message.reply("⚠️ Terjadi kesalahan saat menjawab.");
  }
};
