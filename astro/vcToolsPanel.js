const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async function sendVcToolsPanel(channel) {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("mute_all").setLabel("🔇 Mute Semua").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("unmute_all").setLabel("🔊 Unmute Semua").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("lock_vc").setLabel("🔒 Kunci VC").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("unlock_vc").setLabel("🔓 Buka VC").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("kick_all").setLabel("🦵 Kick Semua").setStyle(ButtonStyle.Danger)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("move_afk").setLabel("🛏️ Pindah ke AFK").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("deafen_all").setLabel("🚫 Deafen Semua").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("undeafen_all").setLabel("👂 Undeafen Semua").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("disconnect_all").setLabel("❌ DC Semua").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("start_recording").setLabel("🎥 Start Rekam").setStyle(ButtonStyle.Primary)
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("stop_recording").setLabel("🛑 Stop Rekam").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("lock_mic").setLabel("🔐 Lock Mic").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("unlock_mic").setLabel("🔓 Unlock Mic").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("hide_vc").setLabel("🙈 Sembunyi VC").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("unhide_vc").setLabel("👀 Tampilkan VC").setStyle(ButtonStyle.Primary)
  );

  const row4 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("allow_ss").setLabel("📺 Izinkan Share").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("block_ss").setLabel("⛔ Blokir Share").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("bitrate_high").setLabel("📶 Bitrate Tinggi").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("bitrate_low").setLabel("📉 Bitrate Rendah").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("refresh_panel").setLabel("🔁 Refresh").setStyle(ButtonStyle.Secondary)
  );

  await channel.send({
    content: "**🎙️ Voice Channel Tools**\nGunakan tombol berikut untuk mengatur VC:",
    components: [row1, row2, row3, row4],
  });
};
