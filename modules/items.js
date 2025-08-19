function getRandomItems() {
  const all = ["🚬 Rokok", "🍺 Minum", "🔪 Kater", "🔎 Lup", "🔗 Borgol"];
  let count = Math.floor(Math.random() * 4) + 1; // 1-4 item
  let items = [];
  for (let i = 0; i < count; i++) {
    items.push(all[Math.floor(Math.random() * all.length)]);
  }
  return items;
}

module.exports = { getRandomItems };
