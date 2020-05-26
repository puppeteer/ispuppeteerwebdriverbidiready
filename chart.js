const fs = require('fs').promises;
const puppeteer = require('puppeteer');

function stringifyEntry({ date, passing, failing, skipping, total }) {
  return `[new Date(${date}), ${passing}, ${failing}, ${skipping}]`;
}

function prepareDrawingPage({ chartData, svgWidth, svgHeight }) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <script src="https://www.gstatic.com/charts/loader.js"></script>
    <script>
      google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        const data = google.visualization.arrayToDataTable(${chartData});

        const options = {
          title: 'is Puppeteer Firefox ready?',
          hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
          vAxis: {minValue: 0},
          isStacked: true,
        };

        const chart = new google.visualization.AreaChart(document.getElementById('chart'));
        google.visualization.events.addListener(chart, 'ready', () => {
          const readyIndicator = document.createElement('div');
          readyIndicator.classList.add('ready');
          document.body.appendChild(readyIndicator);
        });
        chart.draw(data, options);
      }
    </script>
  </head>
  <body>
    <div id="chart" style="width: ${svgWidth}; height: ${svgHeight};"></div>
  </body>
</html>
  `;
}

async function generateChartSVG() {
  const entries = require('./data.json');
  const stringifiedEntries = [];
  for (const entry of entries) {
    const {
      date,
      counts: {
        passing,
        failing,
        skipping,
        total,
      },
    } = entry;
    stringifiedEntries.push(stringifyEntry({ date, passing, failing, skipping, total }));
  }
  const chartData = `[
    ['date', 'passing', 'failing', 'skipping'],
    ${stringifiedEntries.join(',')},
  ]`;

  // use Puppeteer to run Google Chart in browser and generate chart svg locally
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const drawingPage = prepareDrawingPage({
    chartData,
    svgWidth: '1000px',
    svgHeight: '500px',
  });
  page.setContent(drawingPage);
  await page.waitForSelector('.ready');
  const chartFragment = await page.$('#chart');
  const chartFragmentContent = await chartFragment.evaluate(e => e.innerHTML);
  await fs.writeFile('dist/chart.html', chartFragmentContent);
  await browser.close();
  return chartFragmentContent;
}

exports.generateChartSVG = generateChartSVG;
