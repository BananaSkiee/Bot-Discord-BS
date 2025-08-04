const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY belum diatur di environment variables!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const AI_CHANNEL_ID = "1394478754297811034";

module.exports = async (message) => {
  if (message.author.bot || message.channel.id !== AI_CHANNEL_ID) return;

  try {
    await message.channel.sendTyping();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const result = await model.generateContent(message.content);

    // Akses teks dengan benar
    const reply = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (reply.trim()) {
      await message.reply(reply.trim());
    } else {
      await message.reply("🤔 Maaf, saya tidak bisa memberikan jawaban saat ini.");
    }

  } catch (error) {
    console.error("❌ Gemini AI error:", error);
    await message.reply("⚠️ Maaf, terjadi kesalahan saat saya mencoba menjawab. Coba lagi nanti.");
  }
};
