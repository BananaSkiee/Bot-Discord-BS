// --- BAGIAN INI UNTUK MENGGANTIKAN KODE LAMA ANDA DI INDEX.JS ---

// Impor AttachmentBuilder dan EmbedBuilder di bagian paling atas index.js
const { Client, GatewayIntentBits, Collection, AttachmentBuilder, EmbedBuilder } = require("discord.js"); 

// ... (kode Anda yang lain biarkan saja) ...

// 🚀 Pesan Selamat Datang (Welcome Card + Embed)
client.on("guildMemberAdd", async (member) => {
    // ===================================================================
    // PENTING: Ganti dengan ID channel selamat datang Anda yang sebenarnya
    const welcomeChannelId = '1394478754297811034';
    // ===================================================================

    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
    if (!welcomeChannel) {
        return console.error(`[WELCOME] GAGAL: Channel dengan ID ${welcomeChannelId} tidak ditemukan.`);
    }

    try {
        // 1. Panggil fungsi untuk membuat gambar kartunya
        const imageBuffer = await welcomecard(member);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-card.png' });

        // 2. Buat embed yang akan dikirim
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setAuthor({ name: `SELAMAT DATANG DI ${member.guild.name.toUpperCase()}`, iconURL: member.guild.iconURL() })
            .setImage('attachment://welcome-card.png') // Menampilkan gambar di dalam embed
            .setTimestamp()
            .setFooter({ text: `Kamu adalah member ke-${member.guild.memberCount}` });

        // 3. Kirim pesan yang berisi embed dan gambar
        await welcomeChannel.send({
            content: `👋 Hey ${member.user}, selamat datang!`,
            embeds: [welcomeEmbed],
            files: [attachment]
        });

    } catch (error) {
        console.error(`[WELCOME] GAGAL mengirim pesan selamat datang:`, error);
    }
});

// ... (sisa kode Anda yang lain biarkan saja) ...
