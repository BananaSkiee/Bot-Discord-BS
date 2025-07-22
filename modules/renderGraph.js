const puppeteer = require("puppeteer");
const fs = require("fs");
const generateGraphHTML = require("./generateGraphHTML");

// Simulasi data awal
let prices = [20000, 20200, 20100, 20300, 20400];
let currentPrice = 20400;

function updatePrice() {
  // Random naik-turun
  const delta = (Math.random() - 0.5) * 100;
  currentPrice += delta;
  prices.push(currentPrice);
  if (prices.length > 30) prices.shift(); // batas 30 titik
}

async function renderGraph() {
  updatePrice();

  const htmlContent = generateGraphHTML(prices, currentPrice);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
  const graphBuffer = await page.screenshot({ type: "png" });
  await browser.close();

  fs.writeFileSync("btc-graph.png", graphBuffer);
  return { prices, currentPrice };
}

module.exports = renderGraph;
