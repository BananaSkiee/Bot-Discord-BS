// modules/autoMeme.js
const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = async function autoSendMeme(channel) {
  try {
    const res = await axios.get("https://meme-api.com/gimme/memeIndonesia"); // bebas pakai API lain
    const meme = res.data;

    const embed = new EmbedBuilder()
      .setTitle(meme.title)
      .setImage(meme.url)
      .setURL(meme.postLink)
      .setFooter({ text: `Dari: ${meme.subreddit}` });

    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error("❌ Gagal ambil meme:", err);
  }
};
