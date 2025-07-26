const Canvas = require("canvas");
const path = require("path");

module.exports = async function generateWelcomeCard(member) {
  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  // Background
  const background = await Canvas.loadImage(path.join(__dirname, "../background.png"));
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Avatar
  const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: "png" }));
  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 25, 25, 200, 200);

  // Username
  ctx.font = "bold 30px Sans";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`Welcome, ${member.user.username}!`, 250, 150);

  return canvas.toBuffer();
};
