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
  return `
    <span class="passing">${ formatNumber(passing) }</span>
    out of
    <span class="total">${ formatNumber(total) }</span>
    tests are passing.
    (${ formatPercentage(passing / total) })
  `;
}

async function main() {
  const response = await fetch('./expectations.json');
  const expectations = await response.json();
  const counts = {
    passing: 0,
    total: 0,
  };
  for (const [name, expectation] of Object.entries(expectations)) {
    counts.total++;
    if (expectation.length === 1 && expectation[0] === 'PASS') {
      counts.passing++;
    }
  }
  document.querySelector('#output').innerHTML = format(counts);
}

main();
