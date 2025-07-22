const puppeteer = require("puppeteer");
const path = require("path");

async function renderGraph() {
  const browser = await puppeteer.launch({
    headless: "new", // gunakan 'true' kalau kamu deploy di server
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  await page.goto(`file:${path.join(__dirname, "graph.html")}`);
  const graphElement = await page.$("#graph-container"); // Pastikan ada ID ini

  const buffer = await graphElement.screenshot({ omitBackground: true });
  await browser.close();

  return buffer; // Kembalikan sebagai buffer
}

module.exports = renderGraph;
