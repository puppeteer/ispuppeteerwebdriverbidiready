const nf = new Intl.NumberFormat('en');
function formatNumber(number) {
  return nf.format(number);
}

const pf = new Intl.NumberFormat('en', {
  style: 'unit',
  unit: 'percent',
  maximumFractionDigits: 0,
});
function formatPercentage(number) {
  return pf.format(number * 100);
}

function format({ passing, total }) {
  return `${ formatNumber(passing) } out of ${ formatNumber(total) } tests are passing. (${ formatPercentage(passing / total) })`;
}

function renderChart(chartData) {
  google.charts.load('current', { packages: ['corechart'] });
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    const data = google.visualization.arrayToDataTable(chartData);

    const options = {
      curveType: 'function',
      vAxis: { minValue: 0 },
      hAxis: { format: 'MMM d' },
      isStacked: true,
      colors: ['#3366cc', '#dc3912', '#ff9900', '#aaaaaa'],
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
    ['date', 'tests passed', 'tests failed', 'tests skipped', 'out of scope'],
  ];
  for (const entry of entries) {
    const { date, counts } = entry;
    chartData.push(
      [new Date(date), counts.passing, counts.failing, counts.skipping, counts.unsupported]
    );
    console.log(`${ new Date(date).toUTCString() }: ${ format(counts) }`);
  }
  renderChart(chartData);

  const elTime = document.querySelector('time');
  const date = new Date().toISOString().slice(0, 'YYYY-MM-DD'.length);
  elTime.textContent = date;
}

main();
