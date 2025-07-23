const hargaList = [900000000, 905000000, 899000000, 910000000, 912000000];

const chartUrl = generateChartUrl("BTC/IDR", hargaList);

await interaction.message.edit({
  content: "💹 Grafik Harga BTC:",
  files: [chartUrl],
});
