const { OpenAI } = require("openai"); // ✅ penting
const { CHANNEL_AI } = require("../config");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateResponse(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error saat generateResponse:", error);
    return "❌ Terjadi error saat menjawab.";
  }
}

module.exports = async (message) => {
  if (message.author.bot) return;

  const isAICmd = message.content.startsWith("!ai");
  const isChannelAI = message.channel.id === CHANNEL_AI;

  if (isAICmd) {
    const prompt = message.content.slice(3).trim();
    if (!prompt) return message.reply("Masukkan pertanyaan setelah `!ai`.");
    await message.channel.sendTyping();
    const reply = await generateResponse(prompt);
    return message.reply(reply);
  }

  if (isChannelAI) {
    await message.channel.sendTyping();
    const reply = await generateResponse(message.content);
    return message.reply(reply);
  }
};
