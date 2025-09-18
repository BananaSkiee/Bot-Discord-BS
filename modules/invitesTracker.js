// modules/inviteTracker.js
const { EmbedBuilder, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config"); // ✅ Panggil config

const invitesPath = path.join(__dirname, "../data/invites.json");
let invitesData = fs.existsSync(invitesPath)
    ? JSON.parse(fs.readFileSync(invitesPath, "utf8"))
    : {};

function saveInvites() {
    fs.writeFileSync(invitesPath, JSON.stringify(invitesData, null, 2));
}

function formatDateIndo(date) {
    return new Date(date).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
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

        const isVerified = member.roles.cache.has(config.ROLES.member);
        const verifiedStatus = isVerified ? "✅ Verified" : "❌ Belum Verified";

        const embed = new EmbedBuilder()
            .setColor("Green")
            // ✅ PERBAIKAN: Judul yang lebih pendek
            .setTitle(`Selamat datang di ${member.guild.name}!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `👤 **Member** : <@${member.id}>\n` +
                `🏠 **Server** : ${member.guild.name}\n` +
                `🎁 **Invited by** : ${inviter ? `<@${inviter.id}>` : "Tidak diketahui"}\n` +
                `🔗 **Link Invite** : ${inviteCode}\n` +
                `📈 **Total Invites** : ${inviter ? `${invitesData[member.guild.id].users[inviter.id]} (+1)` : "-"}\n` +
                `👥 **Total Members** : ${member.guild.memberCount}\n` +
                `🛡 **Status** : ${verifiedStatus}\n` +
                `📅 **Bergabung** : ${formatDateIndo(Date.now())}\n`
            )
            .setFooter({
                text: "© Copyright | BananaSkiee Community",
                iconURL: "https://i.imgur.com/RGp8pqJ.jpeg"
            });
            
        // ✅ Perbaikan: Mengganti process.env dengan config.CHANNELS
        const welcomeChannel = member.guild.channels.cache.get(config.CHANNELS.welcome);
        if (welcomeChannel) {
            welcomeChannel.send({ embeds: [embed] })
                .then(msg => msg.react("👋").catch(() => {}));
        }
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
            // ✅ PERBAIKAN: Judul yang lebih pendek
            .setTitle(`Sampai jumpa dari ${member.guild.name}!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `👤 **Member** : <@${member.id}>\n` +
                `🎁 **Invited by** : ${inviterId ? `<@${inviterId}>` : "Tidak diketahui"}\n` +
                `📉 **Total Invites** : ${inviterId ? `${guildData.users[inviterId]} (-1)` : "-"}\n` +
                `👥 **Total Members** : ${member.guild.memberCount}\n` +
                `📅 **Keluar** : ${formatDateIndo(Date.now())}\n`
            )
            .setFooter({
                text: "© Copyright | BananaSkiee Community",
                iconURL: "https://i.imgur.com/RGp8pqJ.jpeg"
            });

        // ✅ Perbaikan: Mengganti process.env dengan config.CHANNELS
        const goodbyeChannel = member.guild.channels.cache.get(config.CHANNELS.goodbye);
        if (goodbyeChannel) goodbyeChannel.send({ embeds: [embed] });
    });

    // Commands
    client.on(Events.MessageCreate, (message) => {
        if (message.author.bot) return;
        const args = message.content.trim().split(/\s+/);

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
