import { readdirSync, readFileSync, writeFileSync } from 'fs';

function getParts(file) {
  const parts = file.split('-');
  if (parts.length === 1) {
    parts.unshift('firefox');
  }
  parts[1] = parts[1].split('.').shift();
  return parts;
}

const ignoredTests = new Set(JSON.parse(readFileSync('ignored-tests.json', 'utf-8')));

const files = readdirSync('./data');
const data = files
  .filter((file) => file.endsWith('.json') && !file.includes('cdp'))
  .sort()
  .map((file) => {
    const [browser, timestamp] = getParts(file);
    let { pending, passes, failures } = JSON.parse(readFileSync(`./data/${file}`, 'utf-8'));
    // Since few tests are supported we don't report the skipped tests to make
    // sure the chart is readable.

    const filterIgnored = (result) => !ignoredTests.has(result.fullTitle);
    passes = passes.filter(filterIgnored);
    failures = failures.filter(filterIgnored);
    pending = pending.filter(filterIgnored);
    const counts = {
      passing: passes.length,
      failing: failures.length,
      skipping: pending.length,
      total: passes.length + failures.length + pending.length,
    };
    counts.unsupported = 0; // counts.total - (counts.passing + counts.failing + counts.skipping);
    return {
      browser,
      date: Number(timestamp) * 1000,
      counts,
    };
  });
const groupByDate = new Map();
for (const item of data) {
  if (!groupByDate.has(item.date)) {
    groupByDate.set(item.date, []);
  }
  groupByDate.get(item.date).push(item);
}
const mappedData = [];
for (const date of Array.from(groupByDate.keys()).sort()) {
  mappedData.push({
    date,
    chromeCounts: groupByDate
      .get(date)
      .find((item) => item.browser === 'chrome')?.counts || {
      passing: 0,
      failing: 0,
      skipping: 0,
      total: 0,
      unsupported: 0,
    },
    firefoxCounts: groupByDate
      .get(date)
      .find((item) => item.browser === 'firefox')?.counts || {
      passing: 0,
      failing: 0,
      skipping: 0,
      total: 0,
      unsupported: 0,
    },
    // TODO: extend the object here for more browsers.
  });
}

writeFileSync('data.json', JSON.stringify(mappedData, null, 2));
// console.log(mappedData);
