// modules/autoReactEmoji.js

const allowedChannelIds = [
  "1352339757660635197", // Ganti dengan ID channel yang diizinkan
  "1352331574376665178"
];

// Daftar emoji yang akan direact (sebanyak apapun)
const emojiList = ["🔥", "💯", "😎", "🚀", "🎉", "👏", "✨", "🤖", "👍", "❤️"];

// Fungsi delay
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  name: "autoReactEmoji",

  async execute(message) {
    // Hanya reaksi di channel tertentu dan bukan dari bot
    if (message.author.bot || !allowedChannelIds.includes(message.channel.id)) return;

    for (const emoji of emojiList) {
      try {
        await message.react(emoji);
        await wait(300); // Delay agar tidak dianggap spam
      } catch (err) {
        console.warn(`⚠️ Gagal react emoji ${emoji}:`, err.message);
      }
    }
  }
};

// Fungsi delay
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
