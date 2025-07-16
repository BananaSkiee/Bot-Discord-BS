const fs = require("fs");
const path = require("path");

const CHANNEL_ID = "1355219286502932802"; // ID channel #「1️⃣」count-list
const FILE_PATH = path.join(__dirname, "../data/countData.json");

if (!fs.existsSync("./data")) fs.mkdirSync("./data");
if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, JSON.stringify({ lastCount: 0, lastUserId: null }, null, 2));
}

module.exports = async (message) => {
  if (message.channel.id !== CHANNEL_ID) return;
  if (message.author.bot) return;

  const content = message.content.trim();
  const count = parseInt(content);
  if (isNaN(count)) return; // Bukan angka? Biarin aja

  const data = JSON.parse(fs.readFileSync(FILE_PATH));

  // Cek apakah urut dan bukan spam dari user yg sama
  if (
    count === data.lastCount + 1 &&
    message.author.id !== data.lastUserId
  ) {
    // Valid ✅
    data.lastCount = count;
    data.lastUserId = message.author.id;
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
    console.log(`✅ Count valid: ${count} oleh ${message.author.tag}`);
  } else {
    // Salah ❌
    await message.delete().catch(() => {});
    await message.channel.send({
      content: `❌ <@${message.author.id}>, angka harus **${data.lastCount + 1}** dan *bukan dari orang yang sama!*`,
    }).then((msg) => {
      setTimeout(() => msg.delete().catch(() => {}), 5000); // auto delete peringatan
    });
    console.log(`⛔ Salah hitung: ${count} oleh ${message.author.tag}`);
  }
};
