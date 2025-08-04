// === Tambahan fungsi reset grafik ===
async function resetGrafik(client) {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;

    // Hapus pesan lama
    const messageId = loadMessageId();
    if (messageId) {
      try {
        const oldMessage = await channel.messages.fetch(messageId);
        await oldMessage.delete();
      } catch (err) {
        console.warn("⚠ Tidak bisa hapus pesan lama:", err.message);
      }
    }

    // Kirim grafik baru
    const chart = generateTextGraph(hargaData, "BTC");
    const newMessage = await channel.send("```" + chart + "```");
    saveMessageId(newMessage.id);

    console.log("✅ Grafik direset.");
  } catch (err) {
    console.error("❌ Gagal reset grafik:", err);
  }
}

module.exports.resetGrafik = resetGrafik;
