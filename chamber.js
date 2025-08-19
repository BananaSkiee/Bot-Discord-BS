function createChamber() {
  let filled = Math.floor(Math.random() * 7) + 1; // 1-7 isi
  if (filled === 1 || filled === 7) filled = 4;  // aturan larangan
  let empty = 8 - filled;
  return { filled, empty, sequence: shuffle([...Array(filled).fill(1), ...Array(empty).fill(0)]) };
}

function nextBullet(chamber) {
  return chamber.sequence.shift();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

module.exports = { createChamber, nextBullet };
