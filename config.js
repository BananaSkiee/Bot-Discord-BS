// config.js
// Tidak perlu dotenv di sini jika sudah ada di index.js
// require("dotenv").config(); 

module.exports = {
  // ✅ Ambil data utama dari .env
  TOKEN: process.env.TOKEN || null,
  GUILD_ID: process.env.GUILD_ID || null,
  CLIENT_ID: process.env.CLIENT_ID || null,

  // ✅ Kelompokkan semua ID channel dalam satu objek
  CHANNELS: {
    voice: process.env.VOICE_CHANNEL_ID || null,
    log: process.env.LOG_CHANNEL_ID || null,
    autoChat: process.env.AUTO_CHAT_CHANNEL_ID || null,
    greeting: process.env.GREETING_CHANNEL_ID || null,
    main: process.env.CHANNEL_ID || null,
    welcome: process.env.WELCOME_CHANNEL_ID || null,
    goodbye: process.env.GOODBYE_CHANNEL_ID || null,
    minecraft: process.env.MINECRAFT_CHANNEL_ID || null, // ✅ Tambahan untuk MC
  },

  // ✅ Kelompokkan semua ID role dalam satu objek
  ROLES: {
    // Role umum
    admin: process.env.ADMIN_ROLE_ID || null,
    muted: process.env.MUTED_ROLE_ID || null,
    member: process.env.MEMBER_ID || null,
    rainbow: process.env.RAINBOW_ROLE_ID || null, // ✅ Menggunakan singular ID
    
    // Role level (sebagai array untuk kemudahan)
    levelRoles: [
      process.env.ROLE_1_ID,
      process.env.ROLE_2_ID,
      process.env.ROLE_3_ID,
      process.env.ROLE_4_ID,
      process.env.ROLE_5_ID,
      process.env.ROLE_6_ID,
      process.env.ROLE_7_ID,
      process.env.ROLE_8_ID,
      process.env.ROLE_9_ID,
      process.env.ROLE_10_ID,
      process.env.ROLE_11_ID,
      process.env.ROLE_12_ID,
      process.env.ROLE_13_ID,
      process.env.ROLE_14_ID,
      process.env.ROLE_15_ID,
    ].filter(id => id), // ✅ Filter null atau undefined
  },
  
  // ✅ Peta untuk nama role (akses dengan config.ROLE_DISPLAY_MAP['ID_ROLE_NYA'])
  ROLE_DISPLAY_MAP: {
    [process.env.ROLE_1_ID]: "「 👑 」sᴇʀᴠᴇʀ ᴏᴡɴᴇʀ",
    [process.env.ROLE_2_ID]: "「 ❗ 」ᴀᴅᴍɪɴɪsᴛʀᴀᴛᴏʀ",
    [process.env.ROLE_3_ID]: "「 ❓ 」ᴍᴏᴅᴇʀᴀᴛᴏʀ",
    [process.env.ROLE_4_ID]: "「🚀」ʙᴏᴏsᴛ",
    [process.env.ROLE_5_ID]: "「📸」ᴄᴏɴᴛᴇɴᴛ ᴄʀᴇᴀᴛᴏʀ",
    [process.env.ROLE_6_ID]: "『 👨‍🎓』ᴀʟᴜᴍɴɪ",
    [process.env.ROLE_7_ID]: "「100」ᴘᴇᴇʀʟᴇꜱꜱ",
    [process.env.ROLE_8_ID]: "「80」ᴛʀᴀɴꜱᴄᴇɴᴅᴇɴᴛ",
    [process.env.ROLE_9_ID]: "「70」ꜱᴜᴘʀᴇᴍᴇ",
    [process.env.ROLE_10_ID]: "「60」ʟᴏʀᴅ",
    [process.env.ROLE_11_ID]: "「55」ᴇᴍᴘᴇʀᴏʀ",
    [process.env.ROLE_12_ID]: "『💜』Sᴘᴇsɪᴀʟ",
    [process.env.ROLE_13_ID]: "『💙』ғʀᴇɪɴᴅs",
    [process.env.ROLE_14_ID]: "「🤝」ᴘᴀʀᴛɴᴇʀsʜɪᴘ",
    [process.env.ROLE_15_ID]: "『〽️』ᴍᴇᴍʙᴇʀ",
  },
  
  // ✅ Kelompokkan konfigurasi Minecraft
  MINECRAFT: {
    host: process.env.MC_HOST || null,
    port: process.env.MC_PORT || null,
    username: process.env.MC_USERNAME || null,
    version: process.env.MINECRAFT_VERSION || "1.20.1", // ✅ Tambahkan ini
  },
  
  // URL untuk ping
  SELF_URL: process.env.SELF_URL || null,
};
