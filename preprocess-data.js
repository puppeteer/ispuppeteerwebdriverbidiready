const fs = require('fs').promises;
const fetch = require('node-fetch');

const baseURL = 'https://hg.mozilla.org/mozilla-central/';

const filePaths = [
  'remote/test/puppeteer-expected.json',
  'remote/puppeteer-expected.json',
];

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
    } else {
      // tests with multiple statuses are counted as failures
      counts.failing++;
    }
  }

  counts.unsupported = counts.total - (counts.passing + counts.failing + counts.skipping);

  return counts;
}

async function getLogEntries(path) {
  const response = await fetch(`${baseURL}/json-log/tip/${path}`);
  const data = await response.json();
  return data.entries;
}

async function main() {
  const data = [];

  for (const filePath of filePaths) {
    const entries = await getLogEntries(filePath);
    for (const entry of entries) {
      const date = entry.date[0] * 1000;
      const revision = entry.node;
      const url = `${baseURL}/raw-file/${revision}/${filePath}`;
      const counts = await parseExpectations(url);
      data.push({ date, counts });
    }
  };

  data.sort((a, b) => a.date - b.date);
  fs.writeFile('data.json', JSON.stringify(data, null, 2));
  console.log(data);
}

main();
