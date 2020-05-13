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
  const response = await fetch('./data.json');
  const entries = await response.json();
  const buffer = [];
  for (const entry of entries) {
    const { date, counts } = entry;
    const html = `${ new Date(date).toUTCString() }: ${ format(counts) }`;
    buffer.push(html);
  }
  const html = buffer.join('<br>');
  document.querySelector('#output').innerHTML = html;
}

main();
