const fs = require("fs");
const path = require("path");
const ms = require("ms");

const warnsPath = path.join(__dirname, "../data/warnedUsers.json");

if (!fs.existsSync(warnsPath)) {
  fs.writeFileSync(warnsPath, JSON.stringify({}));
}

module.exports = async function warnUser(member, reason, client) {
  if (!member || !member.guild) return;

  const userId = member.id;
  const guild = member.guild;
  const logChannel = guild.channels.cache.get("1353887827619872800");
  const mutedRole = process.env.MUTED_ROLE_ID ? guild.roles.cache.get(process.env.MUTED_ROLE_ID) : null;
  const warnedUsers = JSON.parse(fs.readFileSync(warnsPath, "utf8"));

  // Simpan data warn
  if (!warnedUsers[userId]) warnedUsers[userId] = [];
  warnedUsers[userId].push({ reason, date: new Date().toISOString() });
  fs.writeFileSync(warnsPath, JSON.stringify(warnedUsers, null, 2));

  const warnCount = warnedUsers[userId].length;

  const muteDurations = {
    2: "5m",
    3: "10m",
    4: "1h",
    5: "1d",
    6: "3d",
    7: "7d",   // softban
    8: "1d",   // ban
    9: "3d",   // ban
    10: "7d",  // ban
  };

  // DM User
  try {
    await member.send(`⚠️ Kamu mendapatkan **Warn ke-${warnCount}** karena: **${reason}**`);
  } catch {
    console.log(`❌ Gagal kirim DM ke ${member.user.tag}`);
  }

  // Log ke channel
  if (logChannel) {
    logChannel.send(`📛 ${member.user.tag} mendapatkan Warn ke-${warnCount}.\n📝 Alasan: ${reason}`);
  }

  // Warn 1 cuma peringatan
  if (warnCount === 1) return;

  // Mute otomatis untuk warn 2–6
  if (warnCount >= 2 && warnCount <= 6) {
    if (!mutedRole) return console.log("⚠️ Muted role tidak ditemukan.");
    const duration = muteDurations[warnCount];
    if (!duration) return;
    await member.roles.add(mutedRole, `Auto Mute - Warn ${warnCount}`);
    setTimeout(() => {
      if (member.roles.cache.has(mutedRole.id)) {
        member.roles.remove(mutedRole, `Unmute otomatis - Warn ${warnCount}`);
      }
    }, ms(duration));
  }

  // Warn 7 = Softban
  if (warnCount === 7) {
    try {
      await member.send("⚠️ Kamu terkena **softban** & **mute 1 minggu** karena warn ke-7.");
    } catch {}
    await member.ban({ deleteMessageDays: 1, reason: "Warn 7 - Softban" });
    await guild.members.unban(userId, "Softban selesai");

    // Mute setelah join kembali
    client.once("guildMemberAdd", async (joinMember) => {
      if (joinMember.id === userId && mutedRole) {
        await joinMember.roles.add(mutedRole, "Mute setelah softban (1 minggu)");
        setTimeout(() => {
          joinMember.roles.remove(mutedRole, "Unmute otomatis - Warn 7");
        }, ms("7d"));
      }
    });
  }

  // Warn 8–10 = Ban sementara
  if (warnCount >= 8 && warnCount <= 10) {
    const duration = muteDurations[warnCount];
    if (!duration) return;
    try {
      await member.send(`⛔ Kamu terkena **ban ${duration}** karena warn ke-${warnCount}.`);
    } catch {}
    await member.ban({ reason: `Warn ${warnCount} - Ban ${duration}` });
    setTimeout(() => {
      guild.members.unban(userId, `Auto Unban - Warn ${warnCount}`);
    }, ms(duration));
  }

  // Warn 11+ = Ban permanen
  if (warnCount >= 11) {
    try {
      await member.send("🚫 Kamu terkena **BAN PERMANEN** karena mencapai Warn ke-11.");
    } catch {}
    await member.ban({ reason: "Warn 11 - Ban Permanen" });
  }
};
