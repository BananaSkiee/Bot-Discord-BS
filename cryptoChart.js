function generateChartUrl(label = "BTC/IDR", hargaArray = []) {
  const waktu = Array.from({ length: hargaArray.length }, (_, i) => {
    const menit = i * 5;
    const jam = 10 + Math.floor(menit / 60);
    const mnt = menit % 60;
    return `${String(jam).padStart(2, "0")}:${String(mnt).padStart(2, "0")}`;
  });

  const chart = {
    type: "line",
    data: {
      labels: waktu,
      datasets: [
        {
          label,
          data: hargaArray,
          fill: false,
          borderColor: "orange",
          tension: 0.2,
        },
      ],
    },
    options: {
      scales: {
        y: { beginAtZero: false },
      },
    },
  };

  return `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify(chart)
  )}`;
}
