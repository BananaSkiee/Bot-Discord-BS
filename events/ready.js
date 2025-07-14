const updateOnline = require("../online");
const stickyHandler = require("../sticky");
const autoGreeting = require("../modules/autoGreeting");
const { ChannelType } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`🤖 Bot siap sebagai ${client.user.tag}`);

    const guild = client.guilds.cache.first();
    if (!guild) return;

    await updateOnline(guild); // update voice online awal

    setInterval(() => {
      updateOnline(guild); // update tiap 1 menit
    }, 60000);

    stickyHandler(client);
    autoGreeting(client);

    // === TIKET SYSTEM - BERSIHIN DAN KIRIM ULANG ===
    const ticketChannelId = "1354077866895347772"; // <== GANTI
    const ticketChannel = await client.channels.fetch(ticketChannelId).catch(() => null);

    if (!ticketChannel || ticketChannel.type !== ChannelType.GuildText) {
      return console.warn("❌ Channel tiket tidak ditemukan atau bukan teks.");
    }

    // Hapus semua pesan lama dari bot
    const messages = await ticketChannel.messages.fetch({ limit: 20 });
    const botMessages = messages.filter(msg => msg.author.id === client.user.id);
    for (const msg of botMessages.values()) {
      await msg.delete().catch(console.error);
    }

    // Kirim ulang tombol open tiket
    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("open_ticket")
        .setLabel("🎫 Open Ticket")
        .setStyle(ButtonStyle.Primary)
    );

    await ticketChannel.send({
      content: "🛠️ Klik tombol di bawah untuk membuka tiket bantuan.",
      components: [row],
    });
  },
};
