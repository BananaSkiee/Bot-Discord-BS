// modules/coinSystem.js
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/coins.json");

// Pastikan file coins.json ada
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
}

function getCoins(userId) {
  const coins = JSON.parse(fs.readFileSync(filePath));
  return coins[userId] || 0;
}

function addCoins(userId, amount) {
  const coins = JSON.parse(fs.readFileSync(filePath));
  coins[userId] = (coins[userId] || 0) + amount;
  fs.writeFileSync(filePath, JSON.stringify(coins, null, 2));
  return coins[userId];
}

function removeCoins(userId, amount) {
  const coins = JSON.parse(fs.readFileSync(filePath));
  coins[userId] = Math.max(0, (coins[userId] || 0) - amount);
  fs.writeFileSync(filePath, JSON.stringify(coins, null, 2));
  return coins[userId];
}

module.exports = { getCoins, addCoins, removeCoins };
