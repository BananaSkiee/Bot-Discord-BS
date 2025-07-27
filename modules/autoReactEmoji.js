module.exports = async function autoReactEmoji(message) {
  if (message.author.bot) return;

  const allowedChannelIds = ["1352331574376665178"]; // Ganti dengan ID channel announcements kamu

  if (!allowedChannelIds.includes(message.channel.id)) return;

  // Daftar emoji untuk random react
  const emojiList = ["🔥", "💯", "🎉", "✨", "👏", "👍", "😍", "😎", "🫡", "🚀"];

  // Pilih emoji random
  const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];

  try {
    await message.react(randomEmoji);
  } catch (error) {
    console.error("Gagal react:", error);
  }
};
