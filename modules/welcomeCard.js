const Canvas = require("canvas");
const path = require("path");

module.exports = async function generateWelcomeCard(member) {
  const canvas = Canvas.createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  // Load background
  const background = await Canvas.loadImage(path.join(__dirname, "../assets/bg.jpeg"));
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Draw circle avatar
  const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 256 });
  const avatar = await Canvas.loadImage(avatarURL);

  const avatarX = 25;
  const avatarY = 25;
  const avatarSize = 200;

  ctx.save();
  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2, // center X
    avatarY + avatarSize / 2, // center Y
    avatarSize / 2,           // radius
    0,
    Math.PI * 2,
    true
  );
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();

  // Draw text
  ctx.font = "bold 32px Sans";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(`Welcome, ${member.user.username}!`, 250, 140);

  return canvas.toBuffer("image/png");
};
