const allowedChannelIds = [
  "1352339757660635197", // ganti dengan channel announcement atau channel target
  "1352331574376665178"
];

// List emoji (bebas mau berapa banyak)
const emojiList = ["🔥", "💯", "😎", "🚀", "🎉", "👏", "✨", "🤖", "👍", "❤️"];

module.exports = {
  name: "autoReactEmoji",
  async execute(message) {
    ...
  }
};
  async execute(message) {
    // Filter: hanya channel tertentu & bukan bot sendiri
    if (message.author.bot || !allowedChannelIds.includes(message.channel.id)) return;

    for (const emoji of emojiList) {
      try {
        await message.react(emoji);
        await wait(300); // kasih delay dikit biar gak dianggap spam (300ms)
      } catch (err) {
        console.warn(`Gagal react emoji ${emoji}:`, err.message);
      }
    }
  },
};

// Fungsi delay
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
