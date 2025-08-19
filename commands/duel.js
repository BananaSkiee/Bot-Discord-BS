const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { startGame } = require("../modules/gameManager");

module.exports = {
  name: "duel",
  description: "Tantang seseorang dalam Sutgun Duel",
  async execute(message, args, client) {
    const target = message.mentions.users.first();
    if (!target) return message.reply("❌ Tag orang yang mau kamu tantang!");
    if (target.id === message.author.id) return message.reply("❌ Tidak bisa duel diri sendiri!");

    const embed = new EmbedBuilder()
      .setTitle("🔫 Sutgun Duels Challenge")
      .setDescription(`${message.author} menantang ${target} untuk duel shotgun!\n\nApakah kamu berani?`)
      .setColor("Red");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("accept_duel").setLabel("✅ Terima").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("decline_duel").setLabel("❌ Tolak").setStyle(ButtonStyle.Danger)
    );

    const duelMsg = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = (i) => i.user.id === target.id;
    const collector = duelMsg.createMessageComponentCollector({ filter, time: 15000 });

    collector.on("collect", async (i) => {
      if (i.customId === "accept_duel") {
        await i.update({ content: `🔥 Duel dimulai antara ${message.author} vs ${target}!`, embeds: [], components: [] });
        startGame(message.channel, message.author, target, client);
      } else if (i.customId === "decline_duel") {
        await i.update({ content: `${target} menolak duel 😢`, embeds: [], components: [] });
      }
    });

    collector.on("end", collected => {
      if (collected.size === 0) {
        duelMsg.edit({ content: "⏳ Waktu habis, duel dibatalkan.", embeds: [], components: [] });
      }
    });
  }
};
