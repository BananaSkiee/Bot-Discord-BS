const OpenAI = require("openai");
const openai = new OpenAI(process.env.OPENAI_API_KEY); // versi 3.2.1

const AI_CHANNEL_ID = "1352635177536327760"; // Ganti dengan ID channel kamu

module.exports = async function autoChat(client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== AI_CHANNEL_ID) return;

    try {
      await message.channel.sendTyping();

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Kamu adalah AI asisten pintar dan ramah di Discord.",
          },
          {
            role: "user",
            content: message.content,
          },
        ],
      });

      const reply = response.choices?.[0]?.message?.content;
      if (reply) {
        message.reply(reply);
      } else {
        message.reply("❌ Gagal mendapatkan jawaban dari AI.");
      }
    } catch (error) {
      console.error("❌ Error AI:", error);
      message.reply("⚠️ Ada masalah saat mengakses AI.");
    }
  });
};
