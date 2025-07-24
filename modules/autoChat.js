const { Events } = require("discord.js");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = function (client) {
  const channelId = process.env.AUTO_CHAT_CHANNEL_ID;

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== channelId) return;

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: message.content }],
        model: "gpt-3.5-turbo",
      });

      const reply = completion.choices[0]?.message?.content;
      if (reply) {
        message.reply(reply);
      }
    } catch (err) {
      console.error("❌ Gagal generate AI response:", err);
    }
  });
};
