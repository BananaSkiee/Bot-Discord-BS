const { EmbedBuilder, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");

const invitesPath = path.join(__dirname, "../data/invites.json");
let invitesData = {};

// Baca file invites.json saat start
if (fs.existsSync(invitesPath)) {
    invitesData = JSON.parse(fs.readFileSync(invitesPath, "utf8"));
} else {
    fs.writeFileSync(invitesPath, JSON.stringify({}));
}

function saveInvites() {
    fs.writeFileSync(invitesPath, JSON.stringify(invitesData, null, 2));
}

function getRandomColor() {
    return Math.floor(Math.random() * 16777215);
}

module.exports = (client) => {
    // Simpan data invites saat bot ready
    client.on(Events.ClientReady, async () => {
        client.guilds.cache.forEach(async (guild) => {
            const firstInvites = await guild.invites.fetch();
            invitesData[guild.id] = new Map(firstInvites.map((invite) => [invite.code, invite.uses]));
        });
        saveInvites();
        console.log("✅ Invite Tracker siap!");
    });

    // Event Member Join
    client.on(Events.GuildMemberAdd, async (member) => {
        const newInvites = await member.guild.invites.fetch();
        const oldInvites = invitesData[member.guild.id] || new Map();
        const inviteUsed = newInvites.find((inv) => oldInvites.get(inv.code) < inv.uses);
        invitesData[member.guild.id] = new Map(newInvites.map((invite) => [invite.code, invite.uses]));
        saveInvites();

        let inviter = inviteUsed ? inviteUsed.inviter : null;
        let inviteCode = inviteUsed ? `discord.gg/${inviteUsed.code}` : "Vanity / Tidak diketahui";

        if (inviter) {
            if (!invitesData.users) invitesData.users = {};
            if (!invitesData.users[inviter.id]) invitesData.users[inviter.id] = 0;
            invitesData.users[inviter.id] += 1;
            saveInvites();
        }

        const embed = new EmbedBuilder()
            .setColor(getRandomColor())
            .setTitle("🎉 Selamat Datang!")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "👤 Member", value: `<@${member.id}>`, inline: true },
                { name: "📩 Diundang oleh", value: inviter ? `<@${inviter.id}>` : "Tidak diketahui", inline: true },
                { name: "🔗 Link Invite", value: inviteCode, inline: false },
                { name: "📊 Total Invites", value: inviter ? `${invitesData.users[inviter.id]} (+1)` : "-", inline: true },
                { name: "👥 Total Member", value: `${member.guild.memberCount}`, inline: true }
            )
            .setFooter({ text: `Bergabung pada ${new Date().toLocaleString()}` });

        const welcomeChannel = member.guild.systemChannel || member.guild.channels.cache.find(c => c.isTextBased());
        if (welcomeChannel) welcomeChannel.send({ embeds: [embed] });
    });

    // Event Member Leave
    client.on(Events.GuildMemberRemove, async (member) => {
        let inviterId = null;

        // Cari siapa yang dulu ngundang
        for (let [id, invites] of Object.entries(invitesData.users || {})) {
            // Tidak ada cara langsung untuk tahu pengundang saat leave, jadi butuh database join
        }

        const embed = new EmbedBuilder()
            .setColor(getRandomColor())
            .setTitle("👋 Selamat Tinggal!")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "👤 Member", value: `<@${member.id}>`, inline: true },
                { name: "📩 Diundang oleh", value: inviterId ? `<@${inviterId}>` : "Tidak diketahui", inline: true },
                { name: "📊 Total Invites", value: inviterId ? `${invitesData.users[inviterId]} (-1)` : "-", inline: true },
                { name: "👥 Total Member", value: `${member.guild.memberCount}`, inline: true }
            )
            .setFooter({ text: `Keluar pada ${new Date().toLocaleString()}` });

        const goodbyeChannel = member.guild.systemChannel || member.guild.channels.cache.find(c => c.isTextBased());
        if (goodbyeChannel) goodbyeChannel.send({ embeds: [embed] });
    });

    // Command test !tw (welcome) dan !tg (goodbye)
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;

        if (message.content === "!tw") {
            const embed = new EmbedBuilder()
                .setColor(getRandomColor())
                .setTitle("🎉 Selamat Datang! (Test)")
                .addFields(
                    { name: "👤 Member", value: `<@${message.author.id}>`, inline: true },
                    { name: "📩 Diundang oleh", value: `<@${message.author.id}>`, inline: true },
                    { name: "🔗 Link Invite", value: "discord.gg/test", inline: false },
                    { name: "📊 Total Invites", value: "5 (+1)", inline: true },
                    { name: "👥 Total Member", value: "100", inline: true }
                )
                .setFooter({ text: "Simulasi bergabung" });

            message.channel.send({ embeds: [embed] });
        }

        if (message.content === "!tg") {
            const embed = new EmbedBuilder()
                .setColor(getRandomColor())
                .setTitle("👋 Selamat Tinggal! (Test)")
                .addFields(
                    { name: "👤 Member", value: `<@${message.author.id}>`, inline: true },
                    { name: "📩 Diundang oleh", value: `<@${message.author.id}>`, inline: true },
                    { name: "📊 Total Invites", value: "5 (-1)", inline: true },
                    { name: "👥 Total Member", value: "99", inline: true }
                )
                .setFooter({ text: "Simulasi keluar" });

            message.channel.send({ embeds: [embed] });
        }
    });
};
