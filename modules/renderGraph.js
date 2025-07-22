const puppeteer = require("puppeteer");
const path = require("path");

async function renderGraph() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(`file:${path.join(__dirname, "grafik.html")}`);

  const chartElement = await page.$("#chart");
  const buffer = await chartElement.screenshot({ omitBackground: true });

  await browser.close();
  return buffer;
}

module.exports = renderGraph;
