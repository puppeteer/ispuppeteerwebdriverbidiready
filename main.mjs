function renderChart(chartData) {
  google.charts.load('current', { packages: ['corechart'] });
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    const data = google.visualization.arrayToDataTable(chartData);

    const options = {
      title: 'is Puppeteer Firefox ready?',
      vAxis: { minValue: 0 },
      isStacked: true,
    };

    const chart = new google.visualization.AreaChart(document.querySelector('#chart'));
    google.visualization.events.addListener(chart, 'ready', () => {
      document.documentElement.classList.add('has-chart');
    });
    chart.draw(data, options);
  }
}

async function main() {
  const response = await fetch('./data.json');
  const entries = await response.json();
  const chartData = [
    ['date', 'passing tests', 'failing tests', 'skipping tests'],
  ];
  for (const entry of entries) {
    const { date, counts } = entry;
    chartData.push(
      [new Date(date), counts.passing, counts.failing, counts.skipping]
    );
  }
  renderChart(chartData);
}

main();
