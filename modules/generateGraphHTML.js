// modules/generateGraphHTML.js

module.exports = function generateGraphHTML(prices, priceNow) {
  const graph = prices.map((p, i) => {
    const height = Math.round(p / 100); // skala tinggi
    return `<div style="width: 2px; height: ${height}px; background: lime; margin: 0 1px;"></div>`;
  }).join("");

  return `
    <html>
      <head>
        <style>
          body {
            margin: 0;
            background: black;
            color: white;
            font-family: monospace;
            font-size: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .price {
            color: lime;
            margin: 4px;
          }
          .graph {
            display: flex;
            align-items: flex-end;
            height: 100px;
            width: 100%;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <div class="price">BTC: $${priceNow.toFixed(2)}</div>
        <div class="graph">${graph}</div>
      </body>
    </html>
  `;
};
