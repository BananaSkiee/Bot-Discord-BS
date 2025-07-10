module.exports = {
  name: "online",
  execute(message, args) {
    const count = message.guild.members.cache.filter(
      m => m.presence && ["online", "idle", "dnd"].includes(m.presence.status) && !m.user.bot
    ).size;
    message.reply(`👥 Jumlah member online: ${count}`);
  }
};
