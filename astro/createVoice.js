const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const settingVoiceChannelId = "1395293477595643995"; // <-- GANTI

module.exports = async (client, oldState, newState) => {
  const user = newState.member;

  // Cek kalau user join CREATE VOICE
  if (
    newState.channelId &&
    newState.channel.name === "➕ . ᴄʀᴇᴀᴛᴇ ᴠᴏɪᴄᴇ" &&
    newState.channel.parent?.name === "Voice Room"
  ) {
    // Buat VC baru
    const channel = await newState.guild.channels.create({
      name: `🎧 ${user.displayName}'s Room`,
      type: ChannelType.GuildVoice,
      parent: newState.channel.parent,
      permissionOverwrites: [
        {
          id: user.id,
          allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.MoveMembers],
        },
        {
          id: newState.guild.roles.everyone,
          allow: [PermissionFlagsBits.Connect],
        },
      ],
    });

    // Pindah user ke VC yang baru
    await user.voice.setChannel(channel);

    // Kirim interface ke #SETTING-VOICE
    const embed = new EmbedBuilder()
      .setTitle("🎛️ Astro Interface")
      .setDescription(`You can use this interface to manage your voice channel.`)
      .setColor("Blurple");

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("vc_lock").setLabel("🔒 Lock").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_unlock").setLabel("🔓 Unlock").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_rename").setLabel("✏️ Rename").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_limit").setLabel("📌 Limit").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("vc_transfer").setLabel("👑 Transfer").setStyle(ButtonStyle.Secondary),
    );

    const interfaceMessage = await client.channels.cache
      .get(settingVoiceChannelId)
      .send({ embeds: [embed], components: [row1] });

    // Simpan ID VC & User Owner untuk keperluan tombol
    client.voiceManager = client.voiceManager || new Map();
    client.voiceManager.set(user.id, {
      channelId: channel.id,
      messageId: interfaceMessage.id,
      ownerId: user.id,
    });
  }
};
