const Canvas = require("canvas");
const path = require("path");

module.exports = async function generateWelcomeCard(member) {
  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  // Load background image (JPEG bisa, tidak harus PNG)
  const background = await Canvas.loadImage(path.join(__dirname, "../assets/bg.jpeg"));
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Avatar (dibulatkan)
  const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
  const avatar = await Canvas.loadImage(avatarURL);

  ctx.save();
  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 25, 25, 200, 200);
  ctx.restore();

  // Text
  ctx.font = "bold 32px Sans";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`Welcome, ${member.user.username}!`, 250, 140);

  return canvas.toBuffer("image/png");
};
