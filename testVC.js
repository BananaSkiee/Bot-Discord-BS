require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const VC_ID = "1355194643754778644";

client.once("ready", async () => {
  const channel = await client.channels.fetch(VC_ID);
  if (!channel) return console.log("❌ Channel tidak ditemukan");

  joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  console.log("✅ Bot join VC berhasil");
});

client.login(process.env.TOKEN);
