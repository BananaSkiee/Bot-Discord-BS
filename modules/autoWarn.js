const { Events, EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

const config = {
  exemptRoles: ["1352279577174605884"], // Role bebas warn
  logChannelId: "1353887827619872800",
  dataPath: path.join(__dirname, "../data/warns.json"),
  muteRoleName: "Muted"
};

const punishmentRules = {
  WARN_LEVELS: {
    1: { action: "Peringatan", dmMessage: "⚠️ Anda mendapat peringatan pertama." },
    2: { action: "Mute 5 menit", duration: 5 * 60 * 1000 },
    3: { action: "Mute 10 menit", duration: 10 * 60 * 1000 },
    4: { action: "Mute 1 jam", duration: 60 * 60 * 1000 },
    5: { action: "Mute 1 hari", duration: 24 * 60 * 60 * 1000 },
    6: { action: "Mute 3 hari", duration: 3 * 24 * 60 * 60 * 1000 },
    7: { action: "Softban + Mute 1 minggu", duration: 7 * 24 * 60 * 60 * 1000, softban: true },
    8: { action: "Ban 1 hari", banDuration: 1 },
    9: { action: "Ban 3 hari", banDuration: 3 },
    10: { action: "Ban 1 minggu", banDuration: 7 },
    11: { action: "BAN PERMANEN", permanent: true }
  }
};

const bannedWords = [
  "anjing","anjg","ajg","ajgk","bangsat","bgsd","bgst","goblok","gblk",
  "tai","kontol","kntl","kontl","memek","memk","meki","meky","pepek","peler",
  "ngentot","ngentt","ngntd","ngntl","kentot","kenthu","tolol","tll","idiot",
  "setan","brengsek","keparat","kampret","pantek","pntk","pnjk","jmbt","jmbtt",
  "asu","babi","fuck","fck","fuk","fak","fkn","fkng","fukc","fking","shit",
  "sh1t","sht","shyt","bitch","btch","biatch","asshole","a$$","assh0le","jerk",
  "dick","d1ck","d1x","d!ck","cunt","c*nt","bastard","retard","stupid","slut",
  "whore","hoe","suck","sux"
];

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (this.shouldSkip(message)) return;

    const violation = this.detectViolation(message);
    if (!violation) return;

    await this.handleViolation(message, violation);
  },

  shouldSkip(message) {
    return message.author.bot ||
           !message.guild ||
           message.member.roles.cache.some(r => config.exemptRoles.includes(r.id));
  },

  detectViolation(message) {
    const content = message.content.toLowerCase();
    const badWord = bannedWords.find(word => content.includes(word));
    if (badWord) return { type: "BAD_LANGUAGE", details: badWord };
    return null;
  },

  async handleViolation(message, violation) {
    try {
      await message.delete();

      const warns = await this.addWarn(message.author.id, message.guild.id, violation.type);
      const warnLevel = warns.length;

      await this.applyPunishment(message.member, warnLevel);

      // Kirim DM
      try {
        await message.author.send(
          `⚠️ Anda melanggar aturan di **${message.guild.name}**.\n` +
          `Jenis pelanggaran: **${violation.type}**\n` +
          `Detail: **${violation.details}**\n` +
          `Level peringatan: **${warnLevel}/11**\n` +
          `Hukuman: **${punishmentRules.WARN_LEVELS[warnLevel]?.action || "Peringatan"}**`
        );
      } catch {
        console.log(`Tidak bisa kirim DM ke ${message.author.tag}`);
      }

      await this.sendLog(message, violation, warnLevel);
    } catch (error) {
      console.error("Error handling violation:", error);
    }
  },

  async addWarn(userId, guildId, reason) {
    let warnsData = this.loadWarnsData();
    if (!warnsData[guildId]) warnsData[guildId] = {};
    if (!warnsData[guildId][userId]) warnsData[guildId][userId] = [];

    const newWarn = {
      reason,
      date: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    warnsData[guildId][userId].push(newWarn);
    this.saveWarnsData(warnsData);
    return warnsData[guildId][userId];
  },

  async applyPunishment(member, warnLevel) {
    const punishment = punishmentRules.WARN_LEVELS[warnLevel];
    if (!punishment) return;

    if (punishment.softban) await this.softbanMember(member);
    if (punishment.banDuration) await this.tempBanMember(member, punishment.banDuration);
    if (punishment.permanent) await member.ban({ reason: "BAN PERMANEN - Auto Warn System" });
    if (punishment.duration) await this.muteMember(member, punishment.duration);
  },

  async muteMember(member, duration) {
    const muteRole = member.guild.roles.cache.find(r => r.name === config.muteRoleName);
    if (!muteRole) return;
    await member.roles.add(muteRole);
    setTimeout(() => member.roles.remove(muteRole).catch(() => {}), duration);
  },

  async softbanMember(member) {
    await member.ban({ reason: "SOFTBAN - Auto Warn System", days: 1 });
    await member.guild.members.unban(member.id);
  },

  async tempBanMember(member, days) {
    await member.ban({ reason: `Temp Ban ${days} hari - Auto Warn System`, days });
  },

  async sendLog(message, violation, warnLevel) {
    const logChannel = message.guild.channels.cache.get(config.logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
      .setTitle("🚨 Pelanggaran Terdeteksi")
      .setColor("Red")
      .setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
        url: message.author.displayAvatarURL({ dynamic: true })
      })
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setImage(message.author.bannerURL({ dynamic: true, size: 1024 }) || null)
      .addFields(
        { name: "👤 User", value: `<@${message.author.id}> (${message.author.id})`, inline: false },
        { name: "💬 Pesan", value: `\`${message.content}\``, inline: false },
        { name: "❗ Kata Terlarang", value: `\`${violation.details}\``, inline: true },
        { name: "📍 Channel", value: `<#${message.channel.id}>`, inline: true },
        { name: "📈 Level Warn", value: `${warnLevel}/11`, inline: true },
        { name: "📌 Hukuman", value: punishmentRules.WARN_LEVELS[warnLevel]?.action || "Peringatan" }
      )
      .setFooter({ text: "Sistem Auto-Warn • BananaSkiee Community" });

    await logChannel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
  },

  loadWarnsData() {
    return fs.existsSync(config.dataPath) ? JSON.parse(fs.readFileSync(config.dataPath)) : {};
  },

  saveWarnsData(data) {
    fs.writeFileSync(config.dataPath, JSON.stringify(data, null, 2));
  }
};
