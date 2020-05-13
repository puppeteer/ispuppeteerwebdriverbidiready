const fs = require('fs').promises;
const fetch = require('node-fetch');
const parseExpectations = require('./parse-expectations.js');

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
