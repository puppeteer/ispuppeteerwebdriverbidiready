import { readdirSync, readFileSync, writeFileSync } from 'fs';

function getParts(file) {
  let browser = 'firefox';
  let timestamp = file.replace('.json', '');

  const parts = file.replace('.json', '').split('-');
  if (parts.length === 1) {
    timestamp = parts[0];
  } else if (parts.length === 2) {
    browser = parts[0];
    timestamp = parts[1];
  } else if (parts.length >= 3) {
    browser = parts.slice(0, -1).join('-');
    timestamp = parts[parts.length - 1];
  }

  return [browser, timestamp];
}

function mapData(filterFnFactory) {
  const files = readdirSync('./data');
  const data = files
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => {
      const [browser, timestamp] = getParts(file);
      const isCdpBrowser = browser.includes('cdp');
      let { pending, passes, failures, stats } = JSON.parse(
        readFileSync(`./data/${file}`, 'utf-8'),
      );
      // Since few tests are supported we don't report the skipped tests to make
      // sure the chart is readable.

      let counts = {
        passing: stats.passes,
        failing: stats.failures,
        skipping: stats.pending,
        total: stats.tests,
      };
      
      const filter = filterFnFactory ? filterFnFactory(browser) : null;
      if (filter) {
        passes = passes.filter(filter);
        failures = failures.filter(filter);
        pending = pending.filter(filter);
        counts = {
          passing: passes.length,
          failing: failures.length,
          skipping: pending.length,
          total: passes.length + failures.length + pending.length,
        };
      }
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
      },
      chromeBidiOnlyCounts: groupByDate
        .get(date)
        .find((item) => item.browser === 'chromeBidiOnly')?.counts || {
        passing: 0,
        failing: 0,
        skipping: 0,
        total: 0,
      },
      firefoxCounts: groupByDate
        .get(date)
        .find((item) => item.browser === 'firefox')?.counts || {
        passing: 0,
        failing: 0,
        skipping: 0,
        total: 0,
      },
      firefoxCdpCounts: groupByDate
        .get(date)
        .find((item) => item.browser === 'firefox-cdp')?.counts || {
        passing: 0,
        failing: 0,
        skipping: 0,
        total: 0,
      },
      chromeCdpCounts: groupByDate
        .get(date)
        .find((item) => item.browser === 'chrome-cdp')?.counts || null,
    });
  }
  return mappedData;
}

const filterIgnoredFactory = (browser) => {
  if (browser.includes('cdp')) {
     return (result) => true;
  }
  return (result) => !result.file?.includes('/cdp/');
};

writeFileSync('data.json', JSON.stringify(mapData(filterIgnoredFactory), null, 2));
writeFileSync('data-all.json', JSON.stringify(mapData(null), null, 2));
