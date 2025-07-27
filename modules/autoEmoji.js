// modules/autoEmoji.js
module.exports = async function autoEmoji(message) {
  if (message.author.bot) return;

  const triggers = [
    // Sapaan & Emosi
    { keyword: "halo", emoji: "👋" },
    { keyword: "hi", emoji: "👋" },
    { keyword: "hai", emoji: "👋" },
    { keyword: "bye", emoji: "👋" },
    { keyword: "selamat pagi", emoji: "🌅" },
    { keyword: "selamat malam", emoji: "🌙" },
    { keyword: "senang", emoji: "😄" },
    { keyword: "sedih", emoji: "😢" },
    { keyword: "marah", emoji: "😡" },
    { keyword: "lucu", emoji: "😂" },
    { keyword: "kaget", emoji: "😲" },
    { keyword: "kasihan", emoji: "😥" },

    // Aktivitas
    { keyword: "makan", emoji: "🍔" },
    { keyword: "minum", emoji: "🥤" },
    { keyword: "tidur", emoji: "😴" },
    { keyword: "main", emoji: "🎮" },
    { keyword: "kerja", emoji: "💻" },
    { keyword: "belajar", emoji: "📚" },
    { keyword: "ngopi", emoji: "☕" },

    // Cinta / Sosial
    { keyword: "love", emoji: "❤️" },
    { keyword: "sayang", emoji: "💞" },
    { keyword: "rindu", emoji: "🥺" },
    { keyword: "friend", emoji: "🤝" },
    { keyword: "teman", emoji: "🧑‍🤝‍🧑" },

    // Reaksi & Ekspresi
    { keyword: "oke", emoji: "👌" },
    { keyword: "mantap", emoji: "👍" },
    { keyword: "bagus", emoji: "✨" },
    { keyword: "jelek", emoji: "🤢" },
    { keyword: "sakit", emoji: "🤒" },

    // Cuaca & Alam
    { keyword: "hujan", emoji: "🌧️" },
    { keyword: "panas", emoji: "☀️" },
    { keyword: "dingin", emoji: "❄️" },

    // Kata Random
    { keyword: "kucing", emoji: "🐱" },
    { keyword: "anjing", emoji: "🐶" },
    { keyword: "naga", emoji: "🐉" },
    { keyword: "api", emoji: "🔥" },
    { keyword: "air", emoji: "💧" },
    { keyword: "tanah", emoji: "🌍" },
    { keyword: "angin", emoji: "💨" },
  ];

  for (const trigger of triggers) {
    if (message.content.toLowerCase().includes(trigger.keyword)) {
      try {
        await message.react(trigger.emoji);
      } catch (err) {
        console.error("❌ Gagal react emoji:", err);
      }
      break; // React satu kali saja
    }
  }
};
