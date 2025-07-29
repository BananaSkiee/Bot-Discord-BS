const { EmbedBuilder, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");

const invitesPath = path.join(__dirname, "../data/invites.json");
let invitesData = fs.existsSync(invitesPath)
    ? JSON.parse(fs.readFileSync(invitesPath, "utf8"))
    : {};

// Simpan file
function saveInvites() {
    fs.writeFileSync(invitesPath, JSON.stringify(invitesData, null, 2));
}

module.exports = (client) => {
    client.on(Events.ClientReady, async () => {
        for (const guild of client.guilds.cache.values()) {
            const guildInvites = await guild.invites.fetch();
            invitesData[guild.id] = invitesData[guild.id] || { codes: {}, users: {}, joins: {} };
            guildInvites.forEach(inv => invitesData[guild.id].codes[inv.code] = inv.uses);
        }
        saveInvites();
        console.log("✅ Invite Tracker Siap!");
    });

    // Member Join
    client.on(Events.GuildMemberAdd, async (member) => {
        const newInvites = await member.guild.invites.fetch();
        const oldInvites = invitesData[member.guild.id]?.codes || {};
        const inviteUsed = newInvites.find(inv => (oldInvites[inv.code] || 0) < inv.uses);

        invitesData[member.guild.id] = invitesData[member.guild.id] || { codes: {}, users: {}, joins: {} };
        invitesData[member.guild.id].codes = {};
        newInvites.forEach(inv => invitesData[member.guild.id].codes[inv.code] = inv.uses);

        let inviter = inviteUsed ? inviteUsed.inviter : null;
        let inviteCode = inviteUsed ? `discord.gg/${inviteUsed.code}` : "Vanity / Tidak diketahui";

        if (inviter) {
            invitesData[member.guild.id].users[inviter.id] = (invitesData[member.guild.id].users[inviter.id] || 0) + 1;
            invitesData[member.guild.id].joins[member.id] = inviter.id;
        }
        saveInvites();

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("👋 Selamat Datang!")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "👤 Member", value: `<@${member.id}>`, inline: true },
                { name: "📩 Diundang oleh", value: inviter ? `<@${inviter.id}>` : "Tidak diketahui", inline: true },
                { name: "🔗 Link Invite", value: inviteCode, inline: false },
                { name: "📊 Total Invites", value: inviter ? `${invitesData[member.guild.id].users[inviter.id]} (+1)` : "-", inline: true },
                { name: "👥 Total Member", value: `${member.guild.memberCount}`, inline: true }
            )
            .setFooter({ text: `Bergabung pada ${new Date().toLocaleString()}` });

        const welcomeChannel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
        if (welcomeChannel) welcomeChannel.send({ embeds: [embed] });
    });

    // Member Leave
    client.on(Events.GuildMemberRemove, async (member) => {
        const guildData = invitesData[member.guild.id];
        let inviterId = guildData?.joins[member.id];

        if (inviterId) {
            guildData.users[inviterId] = (guildData.users[inviterId] || 1) - 1;
            delete guildData.joins[member.id];
        }
        saveInvites();

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("👋 Selamat Tinggal!")
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "👤 Member", value: `<@${member.id}>`, inline: true },
                { name: "📩 Diundang oleh", value: inviterId ? `<@${inviterId}>` : "Tidak diketahui", inline: true },
                { name: "📊 Total Invites", value: inviterId ? `${guildData.users[inviterId]} (-1)` : "-", inline: true },
                { name: "👥 Total Member", value: `${member.guild.memberCount}`, inline: true }
            )
            .setFooter({ text: `Keluar pada ${new Date().toLocaleString()}` });

        const goodbyeChannel = member.guild.channels.cache.get(process.env.GOODBYE_CHANNEL_ID);
        if (goodbyeChannel) goodbyeChannel.send({ embeds: [embed] });
    });

    // Commands
    client.on(Events.MessageCreate, (message) => {
        if (message.author.bot) return;
        const args = message.content.trim().split(/\s+/);

        // Leaderboard
        if (args[0] === "!topinvites") {
            const guildData = invitesData[message.guild.id]?.users || {};
            const sorted = Object.entries(guildData).sort((a, b) => b[1] - a[1]).slice(0, 10);
            const desc = sorted.map(([id, count], i) => `**${i + 1}.** <@${id}> — ${count} invites`).join("\n") || "Tidak ada data.";

            const embed = new EmbedBuilder()
                .setColor("Blue")
                .setTitle("🏆 Top 10 Pengundang")
                .setDescription(desc);
            message.channel.send({ embeds: [embed] });
        }

        // Cek user
        if (args[0] === "!invites") {
            const user = message.mentions.users.first() || message.author;
            const count = invitesData[message.guild.id]?.users[user.id] || 0;
            const embed = new EmbedBuilder()
                .setColor("Blue")
                .setTitle(`📊 Invites untuk ${user.username}`)
                .setDescription(`<@${user.id}> memiliki **${count}** invites.`);
            message.channel.send({ embeds: [embed] });
        }
    });
};
