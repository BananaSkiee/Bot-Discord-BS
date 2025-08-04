const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY belum diatur di environment variables!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const AI_CHANNEL_ID = "1352635177536327760";

module.exports = async (message) => {
  if (message.author.bot || message.channel.id !== AI_CHANNEL_ID) return;

  try {
    await message.channel.sendTyping();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Tambahkan instruksi ke prompt biar bahasa gaul dan santai
    const prompt = `
Kamu adalah AI yang selalu menjawab dengan bahasa Indonesia santai dan gaul seperti ngobrol sama teman, 
hindari bahasa kaku atau formal, jangan kaku seperti robot. 
Gunakan emotikon secukupnya biar asik.
Jawab pertanyaan ini:
${message.content}
    `.trim();

    const result = await model.generateContent(prompt);

    const reply = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (reply.trim()) {
      await message.reply(reply.trim());
    } else {
      await message.reply("🤔 Maaf, aku lagi blank nih. Coba tanya yang lain deh 😅");
    }

  } catch (error) {
    console.error("❌ Gemini AI error:", error);
    await message.reply("⚠️ Waduh, ada masalah nih. Coba tanya lagi nanti ya 🙏");
  }
};
