const { Events, EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

// 1. KONFIGURASI DASAR
const config = {
  exemptRoles: ["1352279577174605884"], // Role yang bebas dari auto-warn (OWNER)
  logChannelId: "1353887827619872800", // Channel untuk log warn
  dataPath: path.join(__dirname, '../data/warns.json'), // Penyimpanan data warn
  muteRoleName: "Muted" // Nama role untuk mute
};

// 2. DAFTAR HUKUMAN SESUAI ATURAN SERVER
const punishmentRules = {
  WARN_LEVELS: {
    1: { action: "Peringatan", dmMessage: "Anda mendapat peringatan pertama" },
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
  },
  AUTO_PUNISHMENTS: {
    // Kategori pelanggaran dan hukumannya
    SPAM: { type: "MUTE", duration: 20 * 60 * 1000, reason: "Spam/Flood" },
    BAD_LANGUAGE: { type: "MUTE", duration: 24 * 60 * 60 * 1000, reason: "Bahasa NSFW" },
    NSFW_CONTENT: { type: "MUTE", duration: 7 * 24 * 60 * 60 * 1000, reason: "Kirim NSFW/Gore" },
    SCAM_LINKS: { type: "MUTE", duration: 3 * 24 * 60 * 60 * 1000, reason: "Link scam" },
    HATE_SPEECH: { type: "MUTE", duration: 5 * 24 * 60 * 60 * 1000, reason: "Rasis/SARA" },
    SEVERE_SCAM: { type: "SOFTBAN", duration: 4 * 24 * 60 * 60 * 1000, reason: "Spam link scam" },
    PLAGIARISM: { type: "SOFTBAN", duration: 3 * 24 * 60 * 60 * 1000, reason: "Plagiarisme" },
    NSFW_PROFILE: { type: "BAN", duration: 7 * 24 * 60 * 60 * 1000, reason: "Akun/PFP NSFW" },
    NSFW_SPAMMER: { type: "BAN", duration: 10 * 24 * 60 * 60 * 1000, reason: "Akun spam NSFW" }
  }
};

// 3. DAFTAR KATA TERLARANG (disensor sebagian)
const bannedWords = [
  // Bahasa Indonesia kasar & singkatan
  "anjing", "anjg", "ajg", "ajgk",
  "bangsat", "bgsd", "bgst",
  "goblok", "gblk",
  "tai", "kontol", "kntl", "kontl",
  "memek", "memk", "meki", "meky", "pepek", "peler",
  "ngentot", "ngentt", "ngntd", "ngntl", "kentot", "kenthu",
  "tolol", "tll", "idiot", "setan", "brengsek", "keparat", "kampret", "pantek", "pntk", "pnjk", "jmbt", "jmbtt", "asu", "babi",

  // Bahasa Inggris kasar & variasi alay
  "fuck", "fck", "fuk", "fak", "fkn", "fkng", "fukc", "fking",
  "shit", "sh1t", "sht", "shyt",
  "bitch", "btch", "biatch",
  "asshole", "a$$", "assh0le", "jerk",
  "dick", "d1ck", "d1x", "d!ck",
  "cunt", "c*nt",
  "bastard", "retard", "stupid", "slut", "whore", "hoe", "suck", "sux"
];

// 4. FUNGSI UTAMA
module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (this.shouldSkip(message)) return;

    const violation = this.detectViolation(message);
    if (!violation) return;

    await this.handleViolation(message, violation);
  },

  // 5. FUNGSI PENDUKUNG
  shouldSkip(message) {
    return message.author.bot || 
           !message.guild || 
           message.member.roles.cache.some(r => config.exemptRoles.includes(r.id));
  },

  detectViolation(message) {
    const content = message.content.toLowerCase();
    const badWord = bannedWords.find(word => content.includes(word));
    if (badWord) return { type: "BAD_LANGUAGE", details: badWord };

    // Deteksi pelanggaran lain bisa ditambahkan di sini
    // Contoh: detect spam, link scam, dll
    return null;
  },

  async handleViolation(message, violation) {
    try {
      await message.delete();
      const warns = await this.addWarn(message.author.id, message.guild.id, violation.type);
      await this.applyPunishment(message.member, warns.length, violation.type);
      await this.sendNotifications(message, violation, warns.length);
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
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Expire dalam 1 bulan
    };

    warnsData[guildId][userId].push(newWarn);
    this.saveWarnsData(warnsData);

    return warnsData[guildId][userId];
  },

  async applyPunishment(member, warnLevel, violationType) {
    // Hukuman berdasarkan level warn
    if (warnLevel <= 11) {
      const punishment = punishmentRules.WARN_LEVELS[warnLevel];
      if (punishment.softban) await this.softbanMember(member);
      if (punishment.banDuration) await this.tempBanMember(member, punishment.banDuration);
      if (punishment.permanent) await member.ban({ reason: "BAN PERMANEN - Auto Warn System" });
      if (punishment.duration) await this.muteMember(member, punishment.duration);
    }

    // Hukuman langsung untuk pelanggaran khusus
    const autoPunish = punishmentRules.AUTO_PUNISHMENTS[violationType];
    if (autoPunish?.type === "MUTE") await this.muteMember(member, autoPunish.duration);
    if (autoPunish?.type === "SOFTBAN") await this.softbanMember(member, autoPunish.duration);
    if (autoPunish?.type === "BAN") await this.tempBanMember(member, autoPunish.duration / (24 * 60 * 60 * 1000));
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

  async sendNotifications(message, violation, warnLevel) {
    // Notifikasi ke channel
    await message.channel.send({
      content: `⚠️ <@${message.author.id}>, Anda melanggar aturan: ${violation.type}`,
      allowedMentions: { users: [message.author.id] }
    });

    // Kirim log
    const logChannel = message.guild.channels.cache.get(config.logChannelId);
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle("🚨 PELANGGARAN TERDETEKSI")
        .setColor("#FF0000")
        .addFields(
          { name: "👤 User", value: `${message.author.tag} (${message.author.id})` },
          { name: "📛 Jenis Pelanggaran", value: violation.type },
          { name: "🔍 Detail", value: violation.details || "N/A" },
          { name: "📈 Level Warn", value: `${warnLevel}/11` },
          { name: "📌 Hukuman", value: punishmentRules.WARN_LEVELS[warnLevel]?.action || "Peringatan" }
        )
        .setFooter({ text: "Sistem Auto-Warn • BananaSkiee Community" });

      await logChannel.send({ embeds: [embed] });
    }
  },

  loadWarnsData() {
    return fs.existsSync(config.dataPath) 
      ? JSON.parse(fs.readFileSync(config.dataPath))
      : {};
  },

  saveWarnsData(data) {
    fs.writeFileSync(config.dataPath, JSON.stringify(data, null, 2));
  }
};
