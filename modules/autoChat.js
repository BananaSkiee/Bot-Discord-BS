const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const CHANNEL_ID = "1352635177536327760"; // ID channel khusus AI Chat

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;
    if (message.channel.id !== CHANNEL_ID) return;

    try {
      await message.channel.sendTyping(); // animasi ngetik

      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message.content }],
      });

      const reply = completion.data.choices[0].message.content;
      message.reply(reply);
    } catch (error) {
      console.error("❌ OpenAI error:", error);
      message.reply("Maaf, ada error saat menghubungi AI.");
    }
  },
};
