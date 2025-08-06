if (command === "rules") {
    const rulesChannelId = "1352326247186694164"; // ID channel rules
    if (message.channel.id !== rulesChannelId) {
        return message.reply("❌ Command ini hanya bisa digunakan di channel rules.");
    }

    // Cek kalau rules sudah pernah dikirim
    const fetchedMessages = await message.channel.messages.fetch({ limit: 50 });
    const alreadySent = fetchedMessages.some(msg =>
        msg.author.id === message.client.user.id &&
        msg.embeds.length > 0 &&
        msg.embeds[0].title === "📜 Rules, Punishment & Sistem Warn"
    );

    if (alreadySent) {
        return message.reply("⚠️ Rules sudah pernah dikirim di channel ini.");
    }

    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

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
    await message.reply("✅ Rules berhasil dikirim di channel ini.");
}
