const { Configuration, OpenAIApi } = require("openai");
const { CHANNEL_AI } = require("../config");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Masukin API key OpenAI kamu di .env
});

const openai = new OpenAIApi(configuration);

async function generateResponse(prompt) {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });
  return completion.data.choices[0].message.content;
}

module.exports = async (message) => {
  // Kalau command !ai
  if (message.content.startsWith("!ai")) {
    const prompt = message.content.slice(4).trim();
    if (!prompt) return message.reply("Masukkan pertanyaan setelah `!ai`.");

    await message.channel.sendTyping();
    const reply = await generateResponse(prompt);
    return message.reply(reply);
  }

  // Kalau di channel khusus
  if (message.channel.id === CHANNEL_AI && !message.author.bot) {
    await message.channel.sendTyping();
    const reply = await generateResponse(message.content);
    return message.reply(reply);
  }
};
