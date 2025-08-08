// modules/rulesCommand.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async function (message, options = { checkDuplicate: false }) {
    try {
        if (options.checkDuplicate) {
            const fetchedMessages = await message.channel.messages.fetch({ limit: 50 });
            const alreadySent = fetchedMessages.some(msg =>
                msg.author.id === message.client.user.id &&
                msg.embeds.length > 0 &&
                msg.embeds[0].title === "📜 Rules, Punishment & Sistem Warn"
            );

            if (alreadySent) {
                return message.reply("⚠️ Rules sudah pernah dikirim di channel ini.");
            }
        }

        const mainEmbed = new EmbedBuilder()
            .setTitle("📜 Rules, Punishment & Sistem Warn")
            .setDescription(
                "Sebelum berinteraksi di server, pastikan kamu membaca rules agar tidak terjadi pelanggaran.\n\n" +
                "**Pilih tombol di bawah untuk melihat detail aturan.**"
            )
            .setColor("Blue")
            .setImage("https://i.ibb.co/4wcgBZQS/6f59b29a5247.gif");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("rules_btn")
                .setLabel("📜 Rules")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("punishment_btn")
                .setLabel("⚠️ Punishment")
                .setStyle(ButtonStyle.Danger)
        );

        await message.channel.send({ embeds: [mainEmbed], components: [row] });
        if (options.checkDuplicate) {
            await message.reply("✅ Rules berhasil dikirim di channel ini.");
        }

    } catch (err) {
        console.error("❌ Error saat menjalankan cmdRules:", err);
        return message.reply("❌ Terjadi error saat mengirim rules.");
    }
};
