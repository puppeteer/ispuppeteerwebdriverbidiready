const fs = require('fs').promises;
const fetch = require('node-fetch');

async function parseExpectations(url) {
  const response = await fetch(url);
  const expectations = await response.json();
  const counts = {
    passing: 0,
    failing: 0,
    skipping: 0,
    total: 0,
  };
  for (const [name, expectation] of Object.entries(expectations)) {
    counts.total++;
    if (expectation.length === 1) {
      switch (expectation[0]) {
        case 'PASS':
          counts.passing++;
          break;
        case 'FAIL':
          counts.failing++;
          break;
        case 'SKIP':
          counts.skipping++;
          break;
      }
    }
  }
  return counts;
}

async function getLogEntries() {
  const response = await fetch('https://hg.mozilla.org/mozilla-central/json-log/tip/remote/puppeteer-expected.json');
  const data = await response.json();
  return data.entries;
}

async function main() {
  const data = [];
  const entries = await getLogEntries();
  for (const entry of entries) {
    const date = entry.date[0] * 1000;
    const revision = entry.node;
    const url = `https://hg.mozilla.org/mozilla-central/raw-file/${revision}/remote/puppeteer-expected.json`;
    const counts = await parseExpectations(url);
    data.push({ date, counts });
  }
  data.sort((a, b) => a.date - b.date);
  fs.writeFile('data.json', JSON.stringify(data, null, 2));
  console.log(data);
}

main();
