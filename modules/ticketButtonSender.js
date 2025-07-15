const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const PANEL_CHANNEL_ID = "1354077866895347772"; // ← Ganti dengan channel ID tempat panel tiket dikirim

module.exports = async function sendTicketButton(client) {
  try {
    const channel = await client.channels.fetch(PANEL_CHANNEL_ID);
    if (!channel) return console.warn("❌ Channel tiket tidak ditemukan.");

    const messages = await channel.messages.fetch({ limit: 10 });
    const sudahAdaPanel = messages.some(msg =>
      msg.author.id === client.user.id &&
      msg.components.length > 0 &&
      msg.components[0].components.some(btn => btn.customId === "open_ticket")
    );

    if (sudahAdaPanel) {
      console.log("✅ Panel tiket sudah ada. Tidak dikirim ulang.");
      return;
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_ticket")
        .setLabel("🎫 Buka Tiket")
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({
      content: "📩 Klik tombol di bawah untuk membuka tiket bantuan.",
      components: [row],
    });

    console.log("✅ Panel tiket berhasil dikirim.");
  } catch (err) {
    console.error("❌ Gagal kirim panel tiket:", err);
  }
};
