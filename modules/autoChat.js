// SINTAKS YANG BENAR UNTUK OPENAI VERSI 3.2.1
const { Configuration, OpenAIApi } = require("openai");

// Langkah 1: Buat konfigurasi dengan API Key Anda dari environment variable
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Langkah 2: Buat instance API utama dengan konfigurasi tersebut.
// Ini adalah "constructor" yang benar untuk v3.
const openai = new OpenAIApi(configuration);

// Ganti dengan ID channel kamu yang benar
const AI_CHANNEL_ID = "1394478754297811034";

module.exports = async (message) => {
  // Jangan proses pesan dari bot lain atau dari channel yang salah
  if (message.author.bot || message.channel.id !== AI_CHANNEL_ID) return;

  try {
    // Kirim status "sedang mengetik..." untuk feedback ke user
    await message.channel.sendTyping();

    // Panggil API menggunakan method `createChatCompletion` (ini cara v3)
    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Kamu adalah asisten AI yang ramah dan membantu di server Discord ini." },
        { role: "user", content: message.content }
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    // Ambil balasan dari path response yang benar untuk v3
    const reply = response.data.choices[0].message.content;

    if (reply) {
      // Balas pesan user
      await message.reply(reply);
    }
  } catch (error) {
    // Tangani error. Error di v3 sering ada di dalam object `response.data`
    console.error("❌ AI error:", error.response?.data?.error || error.message || error);
    await message.reply("⚠️ Maaf, terjadi kesalahan saat saya mencoba berpikir. Coba lagi nanti.");
  }
};
