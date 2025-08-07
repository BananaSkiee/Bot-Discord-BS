const { Events } = require("discord.js");

const whitelist = [
  "discord.com", "discord.gg", "youtube.com", "youtu.be", "github.com",
  "tiktok.com", "instagram.com", "twitter.com", "x.com", "facebook.com",
  "google.com", "spotify.com", "roblox.com", "open.spotify.com",
  "tenor.com", "media.discordapp.net", "cdn.discordapp.com"
];

const regexURL = /https?:\/\/[^\s]+/gi;

// Deteksi apakah link itu mencurigakan (bukan whitelist)
function isPhishing(link) {
  try {
    const url = new URL(link);
    return !whitelist.some(domain => url.hostname.includes(domain));
  } catch {
    return true;
  }
}

const phishingLogChannel = "1352800131933802547";
const suspiciousLinkLogChannel = "1352800131933802547";

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const links = message.content.match(regexURL);
    if (!links) return;

    for (const link of links) {
      const isPhish = isPhishing(link);

      // Jika link phising / domain mencurigakan
      if (isPhish) {
        await message.delete().catch(() => {});
        await message.author.send("⚠️ Pesan kamu mengandung link mencurigakan dan telah dihapus.");

        const logChannel = message.guild.channels.cache.get(phishingLogChannel);
        if (logChannel) {
          await logChannel.send({
            content: `🚨 **Link phising terdeteksi**\n👤 Dari: ${message.author.tag} (${message.author.id})\n📩 Isi:\n\`\`\`${message.content}\`\`\``
          });
        }

        return;
      }

      // Link tidak phising tapi juga bukan whitelist → log ke suspiciousLinkLogChannel
      const url = new URL(link);
      const domainOK = whitelist.some(domain => url.hostname.includes(domain));
      if (!domainOK) {
        const suspiciousLog = message.guild.channels.cache.get(suspiciousLinkLogChannel);
        if (suspiciousLog) {
          await suspiciousLog.send({
            content: `⚠️ **Link mencurigakan dibagikan**\n👤 Dari: ${message.author.tag} (${message.author.id})\n📍 Channel: <#${message.channel.id}>\n📩 Isi:\n\`\`\`${message.content}\`\`\``
          });
        }

        await message.delete().catch(() => {});
        return;
      }

      // Jika link aman (whitelist), suppress banner kalau ada
      if (message.embeds.length > 0) {
        try {
          await message.suppressEmbeds(true); // Sembunyikan banner
          await message.channel.send({
            content: `ℹ️ ${message.author}, tampilan banner dari link kamu disembunyikan demi kenyamanan channel.`
          });
        } catch (err) {
          console.error("Gagal suppress embed:", err);
        }
      }
    }
  }
};
