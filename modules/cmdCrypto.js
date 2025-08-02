const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const generateTextGraph = require("./generateTextGraph");

const USERS_FILE = path.join(__dirname, "../data/cryptoUsers.json");
const PW_FILE = path.join(__dirname, "../data/cryptoPasswords.json");

// --- Helper Function ---
function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({}));
    return JSON.parse(fs.readFileSync(USERS_FILE));
}
function saveUsers(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}
function loadPasswords() {
    if (!fs.existsSync(PW_FILE)) fs.writeFileSync(PW_FILE, JSON.stringify({}));
    return JSON.parse(fs.readFileSync(PW_FILE));
}
function savePasswords(data) {
    fs.writeFileSync(PW_FILE, JSON.stringify(data, null, 2));
}
function randomPassword(len = 5) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pw = "";
    for (let i = 0; i < len; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
    return pw;
}

// --- Command Handler ---
module.exports = async function cmdCrypto(message, client) {
    const prefix = "!";
    if (!message.content.startsWith(prefix)) return;
    const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/\s+/);
    const command = cmd.toLowerCase();
    const users = loadUsers();
    const passwords = loadPasswords();
    const userId = message.author.id;

    // --- Register ---
    if (command === "register") {
        if (users[userId]) return message.reply("❌ Kamu sudah terdaftar di Crypto Game.");
        const startBalance = 500;
        const pw = randomPassword(5);
        users[userId] = { coins: startBalance, btc: 0, hacks: 0, lastDaily: 0, lastHack: 0, lastReset: 0 };
        passwords[userId] = pw;
        saveUsers(users);
        savePasswords(passwords);
        return message.reply(`🚀 Selamat datang di **Crypto Game**!\n💰 Saldo awal: **${startBalance} BS Coin**\n🔑 Password: **${pw}** (jangan kasih tau orang!)`);
    }

    // --- Help ---
    if (command === "help" && args[0] && args[0].toLowerCase() === "crypto") {
        const embed = new EmbedBuilder()
            .setColor("Gold")
            .setTitle("📜 Crypto Game Commands")
            .setDescription("Mainkan game crypto simulasi berbasis harga BTC real-time dari bot.")
            .addFields(
                { name: "💰 Dasar", value: "`!balance`, `!price`, `!buy`, `!sell`, `!portfolio`" },
                { name: "🎁 Event", value: "`!daily`, `!work`, `!hunt`" },
                { name: "🎲 Game", value: "`!guess`, `!gacha`, `!heck`, `!resetpw`" },
                { name: "🏦 Investasi", value: "`!stake`, `!loan`, `!market`" },
                { name: "🏆 Sosial", value: "`!richest`, `!achievements`, `!donate`, `!report`" }
            )
            .setFooter({ text: "Crypto Game by BananaSkiee" });
        return message.channel.send({ embeds: [embed] });
    }

    // --- Balance ---
    if (command === "balance") {
        if (!users[userId]) return message.reply("❌ Kamu belum daftar. Ketik `!register`");
        const { coins, btc, hacks } = users[userId];
        return message.reply(`💰 **Saldo BS Coin:** ${coins}\n₿ **BTC:** ${btc}\n🎟 **Hack Ticket:** ${hacks}`);
    }

    // --- Price ---
    if (command === "price") {
        const hargaData = [64000, 64500, 64200, 64800, 65000, 64900, 65500];
        const chart = generateTextGraph(hargaData, "BTC");
        return message.channel.send("```" + chart + "```");
    }

    // --- Gacha ---
    if (command === "gacha") {
        if (!users[userId]) return message.reply("❌ Daftar dulu pakai `!register`");
        const cost = 100;
        if (users[userId].coins < cost) return message.reply("❌ Coin kamu kurang buat gacha.");
        users[userId].coins -= cost;

        const rewards = [
            { type: "coin", value: Math.floor(Math.random() * 491) + 10, chance: 30 },
            { type: "btc", value: 0.01, chance: 15 },
            { type: "hack", value: 1, chance: 10 },
            { type: "nothing", value: 0, chance: 45 }
        ];
        let roll = Math.random() * 100;
        let cumulative = 0;
        for (let r of rewards) {
            cumulative += r.chance;
            if (roll <= cumulative) {
                if (r.type === "coin") users[userId].coins += r.value;
                if (r.type === "btc") users[userId].btc += r.value;
                if (r.type === "hack") users[userId].hacks += r.value;
                saveUsers(users);
                return message.reply(r.type === "nothing" ? "💨 Zonk! Gak dapet apa-apa." : `🎉 Kamu dapet **${r.value} ${r.type.toUpperCase()}**`);
            }
        }
    }

    // --- Hack ---
    if (command === "heck") {
        if (!users[userId]) return message.reply("❌ Daftar dulu pakai `!register`");
        const target = message.mentions.users.first();
        if (!target) return message.reply("❌ Tag user yang mau dihack.");
        if (!users[target.id]) return message.reply("❌ Target belum daftar Crypto Game.");
        if (userId === target.id) return message.reply("❌ Gak bisa hack diri sendiri.");

        if (users[userId].lastHack && Date.now() - users[userId].lastHack < 86400000) {
            return message.reply("❌ Kamu sudah hack hari ini. Coba lagi besok atau dapetin ticket hack dari gacha.");
        }

        const correctPw = passwords[target.id];
        const options = new Set([correctPw]);
        while (options.size < 4) options.add(randomPassword(5));
        const choiceArray = Array.from(options).sort(() => Math.random() - 0.5);

        let msg = `🛡 Hack **${target.username}**! Pilih password yang benar:\n`;
        choiceArray.forEach((pw, i) => msg += `\`${i + 1}\` ${pw}\n`);

        users[userId].lastHack = Date.now();
        saveUsers(users);

        message.reply(msg + "\nKetik nomor pilihan kamu.");
        const filter = m => m.author.id === userId && /^[1-4]$/.test(m.content.trim());
        const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on("collect", m => {
            const pick = parseInt(m.content.trim()) - 1;
            if (choiceArray[pick] === correctPw) {
                const stolen = Math.floor(users[target.id].coins * 0.25);
                users[target.id].coins -= stolen;
                users[userId].coins += stolen;
                saveUsers(users);
                return message.reply(`✅ Berhasil hack! Kamu curi **${stolen}** BS Coin dari ${target.username}`);
            } else {
                return message.reply("❌ Password salah. Hack gagal.");
            }
        });
    }

    // --- Reset Password ---
    if (command === "resetpw") {
        if (!users[userId]) return message.reply("❌ Daftar dulu pakai `!register`");
        if (users[userId].lastReset && Date.now() - users[userId].lastReset < 86400000) {
            return message.reply("❌ Kamu sudah reset password hari ini. Coba besok lagi.");
        }
        const newPw = randomPassword(5);
        passwords[userId] = newPw;
        users[userId].lastReset = Date.now();
        saveUsers(users);
        savePasswords(passwords);
        return message.reply(`🔑 Password baru kamu: **${newPw}**`);
    }
};
