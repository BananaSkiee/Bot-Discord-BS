const OpenAI = require("openai");
const openai = OpenAI(process.env.OPENAI_API_KEY); // ✅ TANPA "new"

// ID channel tempat AI aktif
const AI_CHANNEL_ID = "1352635177536327760";

module.exports = async function autoChat(client) {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== AI_CHANNEL_ID) return;

    try {
      await message.channel.sendTyping();

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Kamu adalah AI ramah di server Discord." },
          { role: "user", content: message.content },
        ],
      });

      const reply = response.choices?.[0]?.message?.content;
      message.reply(reply || "❌ Tidak bisa menjawab.");
    } catch (err) {
      console.error("❌ Error AI:", err);
      message.reply("⚠️ Gagal mengakses AI.");
    }
  });
};
