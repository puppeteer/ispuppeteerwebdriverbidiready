const pf = new Intl.NumberFormat('en', {
  style: 'unit',
  unit: 'percent',
  maximumFractionDigits: 2,
});

const searchParams = new URLSearchParams(window.location.search);

const startDate = searchParams.has('start-date')
  ? Date.parse(searchParams.get('start-date'))
  : new Date(new Date().getFullYear(), 0, 1);

function formatPercentage(number) {
  return pf.format(number * 100);
}

function formatDate(date) {
  return date.toISOString().slice(0, 'yyyy-mm-dd'.length);
}

function buildTooltip(label, counts) {
  return `
    <div style="padding: 10px; font-size: 18px;">
      <h3 style="margin: 0;">${label}</h3>
      <div>Total: ${counts.total}</div>
      <div>Passing: ${counts.passing} (${formatPercentage(
        counts.passing / counts.total,
      )})</div>
      <div>Skipping: ${counts.skipping}</div>
      <div>Failing: ${counts.failing}</div>
    </div>
  `;
}

async function createMainChart(showAllTests = false) {
  const response = await fetch(
    showAllTests ? './data-all.json' : './data.json',
  );
  const entries = await response.json();

  const chartData = [];
  let prev = [];

  for (const entry of entries.reverse()) {
    const { date, firefoxCounts, chromeCounts } = entry;
    if (prev[0] === chromeCounts.passing && prev[1] === firefoxCounts.passing) {
      continue;
    }
    prev = [chromeCounts.passing, firefoxCounts.passing];
    chartData.push([
      new Date(date),
      (firefoxCounts.passing / firefoxCounts.total) * 100,
      (chromeCounts.passing / chromeCounts.total) * 100,
      buildTooltip(
        'Firefox ' + new Date(date).toLocaleDateString(),
        firefoxCounts,
      ),
      buildTooltip(
        'Chrome ' + new Date(date).toLocaleDateString(),
        chromeCounts,
      ),
    ]);
    if (new Date(date) < startDate) {
      break;
    }
  }

  chartData.reverse();

  const ctx = document.getElementById('chart');

  const getOrCreateTooltip = (chart) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div');

    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.style.background = 'rgb(0 0 0 / 70%)';
      tooltipEl.style.borderRadius = '3px';
      tooltipEl.style.color = 'white';
      tooltipEl.style.opacity = 1;
      tooltipEl.style.pointerEvents = 'none';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.transform = 'translate(-50%, 0)';
      tooltipEl.style.transition = 'all .1s ease';

      const table = document.createElement('table');
      table.style.margin = '0px';

      tooltipEl.appendChild(table);
      chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
  };

  const externalTooltipHandler = (context) => {
    // Tooltip Element
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart);

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0;
      return;
    }

    // Set Text
    if (tooltip.body) {
      const dataPoints = tooltip.dataPoints;
      const dataPoint = dataPoints[0];
      const dataIndex = dataPoint.dataIndex;
      const datasetIndex = dataPoint.datasetIndex;
      tooltipEl.innerHTML = chartData[dataIndex][3 + datasetIndex];
    }

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = Math.max(positionY + tooltip.caretY - 200, 0) + 'px';
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding =
      tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
  };

  if (window.innerWidth > 2000) {
    Chart.defaults.font.size = 38;
  }

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.map((item) => formatDate(item[0])),
      datasets: [
        {
          label: '% tests passed (Firefox)',
          data: chartData.map((item) => item[1]),
          borderWidth: 1,
        },
        {
          label: '% tests passed (Chrome)',
          data: chartData.map((item) => item[2]),
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        tooltip: {
          enabled: false,
          external: externalTooltipHandler,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
          max: 100,
          ticks: {
            callback: function (value, index, ticks) {
              return value + '%';
            },
          },
        },
      },
    },
  });
}

async function createFirefoxDeltaChart() {
  const response = await fetch('./firefox-delta-count.json');
  const entries = await response.json();

  const chartData = [];

  for (const entry of entries.reverse()) {
    if (!entry) {
      continue;
    }
    const { date, failing, passing } = entry;
    chartData.push([new Date(date), failing, passing]);
    if (new Date(date) < startDate) {
      break;
    }
  }

  chartData.reverse();

  const ctx = document.getElementById('chart');

  if (window.innerWidth > 2000) {
    Chart.defaults.font.size = 38;
  }

  const datasets = [
    {
      label: 'Tests failing with Firefox BiDi but passing with Firefox CDP',
      shortLabel: 'Tests failing',
      data: chartData.map((item) => item[1]),
      borderWidth: 1,
    },
  ];

  if (searchParams.has('firefox-delta-all')) {
    // Optionally show the new tests passing with BiDi but not with CDP
    datasets.push({
      label: 'Tests passing with Firefox BiDi but failing with Firefox CDP',
      shortLabel: 'Tests passing',
      data: chartData.map((item) => item[2]),
      borderWidth: 1,
    });
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.map((item) => formatDate(item[0])),
      datasets,
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) =>
              context.dataset.shortLabel + ': ' + context.parsed.y,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
        },
      },
    },
  });
}

async function main() {
  const allTests = searchParams.has('all');
  // Add ?firefox-delta to the URL to see data focused on Firefox BiDi vs
  // Firefox CDP.
  if (searchParams.has('firefox-delta')) {
    await createFirefoxDeltaChart();
  } else {
    await createMainChart(allTests);
  }

  for (const link of document.querySelectorAll('.json-link')) {
    let filename = link.dataset.name;
    if (allTests) {
      filename += '-all';
    }
    link.href = `https://puppeteer.github.io/ispuppeteerwebdriverbidiready/${filename}.json`
  }

  if (allTests) {
    document.querySelector('#ready').style.display = 'none';
    document.querySelector('[href="#ready"]').style.display = 'none';
  }

  const timeEl = document.querySelector('time');
  const date = formatDate(new Date());
  timeEl.textContent = date;

  document.querySelector('#delta').textContent = (
    await fetch(
      allTests
        ? './firefox-delta-all.json'
        : './firefox-delta.json',
    )
      .then((res) => res.json())
      .catch(() => {
        return {
          failing: 'X',
        };
      })
  ).failing;

  const firefoxFailing = await fetch(
    allTests
      ? './firefox-failing-all.json'
      : './firefox-failing.json',
  )
    .then((res) => res.json())
    .catch(() => {
      return {
        failing: [],
        pending: [],
      };
    });
  document.querySelector('#firefox-failing').textContent =
    firefoxFailing.failing.length + firefoxFailing.pending.length;

  const chromeFailing = await fetch(
    allTests
      ? './chrome-failing-all.json'
      : './chrome-failing.json',
  )
    .then((res) => res.json())
    .catch(() => {
      return {
        failing: [],
        pending: [],
      };
    });
  document.querySelector('#chrome-failing').textContent =
    chromeFailing.failing.length + chromeFailing.pending.length;
}

main();
