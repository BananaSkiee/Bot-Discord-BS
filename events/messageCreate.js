
module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    // === Auto-reply keyword ===
    const autoReplies = {
      pagi: [
        "Pagi juga! 🌞",
        "Selamat pagi, semangat ya hari ini!",
        "Eh, bangun pagi juga kamu 😴",
        "Pagi! Jangan lupa ngopi ☕",
        "Pagi! Udah sarapan belum?",
        "Pagi pagi kok udah on sih? 🤔",
        "Selamat pagi duniaa~",
        "Pagi cuy, kerja lagi kerja lagi 😩",
        "Met pagiii 🌄",
        "Pagi! Semoga harimu ceria"
      ],
      siang: [
        "Siang juga! 🌤️",
        "Jangan lupa makan siang ya!",
        "Siang siang panas bener 🥵",
        "Selamat siang! Semangat terus!",
        "Waktunya ngantuk siang siang begini 😴",
        "Siang! Lagi pada ngapain?",
        "Met siang, jangan bosen ya~"
      ],
      sore: [
        "Sore juga! 🌇",
        "Selamat sore, udah capek belom?",
        "Sore gini enaknya jalan-jalan 🏃‍♂️",
        "Sore! Mau ngopi bareng? ☕",
        "Udah sore nih, waktunya santai~",
        "Mendung nggak tuh sore ini?"
      ],
      malam: [
        "Selamat malam! 🌙",
        "Malam juga, semangat istirahat ya!",
        "Udah makan malam belom?",
        "Malam! Jangan lupa tidur 😴",
        "Good night! 🌌",
        "Mimpi indah ya semua 💤"
      ],
      halo: [
        "Halo halo! 👋",
        "Yo halo!",
        "Haiii! 😄",
        "Halo juga, ada apa nih?",
        "Halo! Gimana harimu?"
      ],
      makasih: [
        "Sama-sama! 😊",
        "Sippp 👍",
        "Yok sama-sama~",
        "Gak masalah bro 😎",
        "Terima kasih kembali"
      ],
      ngantuk: [
        "Ngopi dulu gih! ☕",
        "Tidur sana jangan dipaksa 😴",
        "Ngantuk? Wajar, hidup berat 😆",
        "Bobo siang yuk",
        "Ngantuk tandanya manusia 😌"
      ],
      gabut: [
        "Gabut? Ketik !gacha aja!",
        "Mau main tebak gambar? !tebak",
        "Chat bot aja kalo gabut 😁",
        "Gabut juga... kita senasib 😭",
        "Coba cari meme lucu dah"
      ],
      hehehe: [
        "Hehe kenapa sih 🤭",
        "Ngakak sendiri ya? 😅",
        "Hehe iya iya 😏",
        "Hehehe kamu lucu juga",
        "Ketawa mulu, bagi dong lucunya!"
      ],
      anjir: [
        "Anjir parah sih 😳",
        "Anjir kenapa tuh?",
        "Wkwk anjir banget",
        "Auto shock 😵",
        "Anjir... seriusan??"
      ],
      woi: [
        "WOI kenapaa 😤",
        "Sini gua dengerin",
        "Santai dong bang",
        "Woi juga 😎",
        "Jangan kagetin lah 😭"
      ],
      bang: [
        "Siap bang 👊",
        "Kenapa bang?",
        "Tenang bang, aman 😎",
        "Dipanggil nih 😁",
        "Halo abang~"
      ],
      cape: [
        "Sini aku pijetin 😌",
        "Rebahan dulu aja...",
        "Jangan lupa istirahat ya",
        "Capek tuh tandanya kamu berjuang",
        "Minum air putih dulu"
      ],
      bosen: [
        "Main Discord dulu 😆",
        "Bosen? Coba cari konten baru~",
        "Bosen tuh bahaya, ayo ngobrol",
        "Main game yuk!",
        "Atau scroll TikTok aja 🤭"
      ],
      kangen: [
        "Kangen siapa tuh? 😏",
        "Sini pelukk 🤗",
        "Coba chat dia lagi...",
        "Wah baper ya~",
        "Kangen tuh berat..."
      ],
      bye: [
        "👋 Bye bye! Jangan lupa balik lagi ya!",
        "Sampai jumpa lagi, semoga harimu menyenangkan!",
        "Daaah~ hati-hati ya di jalan 😄",
        "Bye! Jangan lupa makan 😋",
        "Sampai ketemu lagi! 💫",
        "Yah udahan nih? Sampai jumpa lagi!",
        "Selamat tinggal sementara, sampai bertemu lagi!",
        "Bot Akira bakal kangen nih 😢",
        "Sampai nanti ya! 🌙",
        "Have a great day! 👋"
      ]
    };

    for (const [keyword, replies] of Object.entries(autoReplies)) {
      if (content.includes(keyword)) {
        const reply = replies[Math.floor(Math.random() * replies.length)];
        message.reply(reply).catch(console.error);
        break;
      }
    }

    // === ChatGPT-style chat ===
    if (
      message.mentions.has(client.user) &&
      !message.content.includes("!ai")
    ) {
      const prompt = message.content.replace(`<@${client.user.id}>`, "").trim();
      if (!prompt) return;

      const thinking = await message.reply("⏳ Sedang mikir...");
      // --- Ganti dengan API OpenAI kalau mau real AI ---
      const fakeReply = [
        "Menurutku itu menarik banget!",
        "Wah, itu topik yang dalam...",
        "Hmm, bisa jadi begitu sih!",
        "Kalau menurut kamu gimana?",
      ];
      const result = fakeReply[Math.floor(Math.random() * fakeReply.length)];

      await thinking.edit(result);
    }

    // === Command: !ai <prompt> ===
    if (content.startsWith("!ai ")) {
      const prompt = message.content.slice(4).trim();
      if (!prompt) return message.reply("Apa yang mau kamu tanyakan?");
      const thinking = await message.reply("⏳ Mikir dulu ya...");

      const fakeReply = [
        "Menurutku itu menarik banget!",
        "Wah, itu topik yang dalam...",
        "Hmm, bisa jadi begitu sih!",
        "Kalau menurut kamu gimana?",
      ];
      const result = fakeReply[Math.floor(Math.random() * fakeReply.length)];

      await thinking.edit(result);
    }
  }
};
