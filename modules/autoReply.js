module.exports = async (message) => {
  if (message.author.bot) return;

  // ❌ Blacklist channel tertentu
  const blacklistedChannels = ["1352635177536327760"];
  if (blacklistedChannels.includes(message.channel.id)) return;

  const contentLower = message.content.toLowerCase();

  const autoReplies = {
    pagi: [
      "Pagi juga! 🌞",
      "Selamat pagi, semangat ya!",
      "Eh bangun pagi juga 😴",
      "Pagi boskuhh ✨",
      "Pagi, jangan lupa sarapan 🍞"
    ],
    siang: [
      "Siang juga! 🌤️",
      "Jangan lupa makan siang ya!",
      "Siang-siang panas bener 🥵",
      "Siang bosss 😎",
      "Waktunya lunch break 🍜"
    ],
    sore: [
      "Sore juga! 🌇",
      "Selamat sore, udah capek belum?",
      "Sore gini enaknya rebahan 😴",
      "Sore, jangan lupa nyemil 🥟",
      "Sunset vibes 🌅"
    ],
    malam: [
      "Selamat malam! 🌙",
      "Malam juga, semangat istirahat ya!",
      "Udah makan malam belum?",
      "Malam vibes 🌌",
      "Waktunya santai sambil rebahan 🛌"
    ],
    halo: [
      "Halo halo! 👋",
      "Yo halo!",
      "Haiii 😄",
      "Halo boskuhh 😎",
      "Halo, gimana kabarnya?"
    ],
    makasih: [
      "Sama-sama 😊",
      "Sippp 👍",
      "Yok sama-sama~",
      "No problemo ✌️",
      "Oke gas 🔥"
    ],
    ngantuk: [
      "Ngopi dulu gih ☕",
      "Tidur sana jangan dipaksa 😴",
      "Ngantuk? Wajar 😆",
      "Ngantuk? Coba minum teh 🍵",
      "Ngantuk tanda kurang rebahan 🛏️"
    ],
    gabut: [
      "Gabut? Ketik !gacha aja!",
      "Mau main tebak gambar? !tebak",
      "Chat bot aja kalo gabut 😁",
      "Gabut? Ayo ngobrol sini 👀",
      "Gabut mulu, gas cari hiburan 🎮"
    ],
    hehehe: [
      "Hehe kenapa 🤭",
      "Ngakak sendiri ya? 😅",
      "Hehe iya iya 😏",
      "Hehe ketahuan deh 🤣",
      "Hehe mode on 😜"
    ],
    anjir: [
      "Anjir parah 😳",
      "Anjir kenapa tuh?",
      "Wkwk anjir banget",
      "Anjir asli ngakak 🤣",
      "Anjir bikin kaget 😲"
    ],
    woi: [
      "WOI kenapaa 😤",
      "Sini gua dengerin",
      "Santai dong bang",
      "Woi, apa kabar?",
      "Woiii, kaget gw 😅"
    ],
    bang: [
      "Siap bang 👊",
      "Kenapa bang?",
      "Tenang bang, aman 😎",
      "Santuy bang ✌️",
      "Gaskeun bang 🔥"
    ],
    cape: [
      "Sini aku pijetin 😌",
      "Rebahan dulu aja...",
      "Jangan lupa istirahat ya",
      "Capek tanda berjuang 💪",
      "Santai sebentar, bangkit lagi 🚀"
    ],
    bosen: [
      "Main Discord dulu 😆",
      "Bosen? Cari konten baru~",
      "Main game yuk!",
      "Bosen? Ayo ngobrol 🗨️",
      "Coba cari meme lucu 🤣"
    ],
    kangen: [
      "Kangen siapa tuh? 😏",
      "Sini pelukk 🤗",
      "Kangen tuh berat...",
      "Kangen? Chat aja 📩",
      "Kangen tapi gengsi 😅"
    ],
    bye: [
      "👋 Bye bye! Jangan lupa balik lagi ya!",
      "Daaah~ hati-hati ya 😄",
      "Sampai ketemu lagi 💫",
      "Goodbye, see you soon ✨",
      "Bye bye, jaga diri ya ❤️"
    ],
    welcome: [
      "<a:letterw:947444887412944966><a:E_:1361677660421492736><a:letterl:1361678206842699777><a:letterc:1361677899299819560><a:lettero:1361677987954688000><a:letterm:1361678310714904646><a:E_:1361677660421492736>"
    ]
  };

  for (const [keyword, replies] of Object.entries(autoReplies)) {
    if (contentLower.includes(keyword)) {
      const reply = replies[Math.floor(Math.random() * replies.length)];
      return message.reply(reply).catch(console.error);
    }
  }
};
