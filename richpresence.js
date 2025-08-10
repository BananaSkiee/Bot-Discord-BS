// richpresence.js
const RPC = require("discord-rpc");
const clientId = "1364631032363749628"; // dari Developer Portal aplikasi kamu

// Register client RPC
RPC.register(clientId);

const rpc = new RPC.Client({ transport: "ipc" });

rpc.on("ready", () => {
    console.log("🎮 Rich Presence aktif!");

    rpc.setActivity({
        details: "Takemi Store | Top Up Game !!", // Judul utama
        state: "Teraman, Terpercaya dan Cepat !!", // Sub teks
        startTimestamp: new Date(),
        largeImageKey: "1000039682", // KEY gambar dari Rich Presence > Art Assets
        largeImageText: "Join Sekarang !!",
        buttons: [
            { label: "Order Sekarang !!", url: "https://discord.gg/5asgbezyR6" }
        ],
        instance: false
    });
});

// Login ke RPC
rpc.login({ clientId }).catch(console.error);
