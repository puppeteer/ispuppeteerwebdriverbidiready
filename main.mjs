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

function renderChart(chartData, limit) {
  google.charts.load('current', { packages: ['corechart'] });
  google.charts.setOnLoadCallback(drawChart);

  function drawChart() {
    const data = google.visualization.arrayToDataTable(chartData);

    const options = {
      vAxis: { minValue: 0, maxValue: limit },
      hAxis: { format: 'MMM d' },
      tooltip: {isHtml: true},
      colors: ['#3366cc', '#dc3912', '#ff9900', '#aaaaaa'],
      theme: 'maximized'
    };

    const chart = new google.visualization.AreaChart(document.querySelector('#chart'));
    google.visualization.events.addListener(chart, 'ready', () => {
      document.documentElement.classList.add('has-chart');
    });
    chart.draw(data, options);
  }
}

function buildTooltip(label, counts) {
  return `
    <div style="padding: 10px; font-size: 18px;">
      <h3 style="margin: 0;">${label}</h3>
      <div>Total: ${counts.total}</div>
      <div>Passing: ${counts.passing}</div>
      <div>Skipping: ${counts.skipping}</div>
      <div>Failing: ${counts.failing}</div>
    </div>
  `;
}

async function main() {
  const response = await fetch('./data.json');
  const entries = await response.json();
  const chartData = [
    ['date', 'tests passed (Firefox)', {type: 'string', role: 'tooltip', 'p': {'html': true}}, 'tests passed (Chrome)', {type: 'string', role: 'tooltip', 'p': {'html': true}}],
  ];
  let limit = 0;
  for (const entry of entries) {
    const { date, firefoxCounts, chromeCounts } = entry;
    chartData.push(
      [new Date(date), firefoxCounts.passing, buildTooltip('Firefox', firefoxCounts), chromeCounts.passing, buildTooltip('Chrome', chromeCounts)]
    );
    limit = Math.max(limit, Math.max(firefoxCounts.passing, chromeCounts.passing));
    console.log(`${ new Date(date).toUTCString() }: ${ format(firefoxCounts) } : ${ format(chromeCounts) }`);
  }
  renderChart(chartData, limit * 2);

  const elTime = document.querySelector('time');
  const date = new Date().toISOString().slice(0, 'YYYY-MM-DD'.length);
  elTime.textContent = date;
}

main();
