import { readdirSync, readFileSync, existsSync, writeFileSync } from 'fs';

function getParts(file) {
  const parts = file.split('-');
  if (parts.length === 1) {
    parts.unshift('firefox');
  }
  parts[1] = parts[1].split('.').shift();
  return parts;
}

const ignoredTests = new Set(
  JSON.parse(readFileSync('ignored-tests.json', 'utf-8')),
);
const filterIgnored = (result) => !ignoredTests.has(result.fullTitle);

const files = readdirSync('./data');
const data = files
  .filter(
    (file) =>
      file.endsWith('.json') &&
      file.includes('firefox') &&
      !file.includes('cdp'),
  )
  .sort()
  .map((file, index) => {
    const [browser, timestamp] = getParts(file);
    const cdpFile = `./data/${browser}-cdp-${timestamp}.json`;
    if (!existsSync(cdpFile)) {
      return null;
    }

    const cdpPassBiDiFailTest = [];
    const cdpFailBiDiPassTest = [];

    const biDiTests = JSON.parse(
      readFileSync(`./data/${browser}-${timestamp}.json`, 'utf-8'),
    ).tests;
    const passingBiDiTests = new Set(
      JSON.parse(
        readFileSync(`./data/${browser}-${timestamp}.json`, 'utf-8'),
      ).passes.map((p) => p.fullTitle),
    );
    const passingCdpTests = new Set(
      JSON.parse(readFileSync(cdpFile, 'utf-8')).passes.map((p) => p.fullTitle),
    );

    for (const test of biDiTests) {
      if (
        passingCdpTests.has(test.fullTitle) &&
        !passingBiDiTests.has(test.fullTitle)
      ) {
        cdpPassBiDiFailTest.push(test.fullTitle);
      }
      if (
        !passingCdpTests.has(test.fullTitle) &&
        passingBiDiTests.has(test.fullTitle)
      ) {
        cdpFailBiDiPassTest.push(test.fullTitle);
      }
    }

    return {
      failing: cdpPassBiDiFailTest.length,
      failingTests: cdpPassBiDiFailTest,
      passing: cdpFailBiDiPassTest.length,
      date: Number(timestamp) * 1000,
      passingTests: cdpFailBiDiPassTest,
    };
  })
  .filter((item) => item !== null);

const { failingTests, passingTests, date } = data.at(-1);
const filteredFailingTests = failingTests.filter(
  (test) => !ignoredTests.has(test),
);
const filteredPassingTests = passingTests.filter(
  (test) => !ignoredTests.has(test),
);
const onlyRequiredData = {
  failing: filteredFailingTests.length,
  failingTests: filteredFailingTests,
  passing: filteredPassingTests.length,
  date,
  passingTests: filteredPassingTests,
};

writeFileSync('firefox-delta.json', JSON.stringify(onlyRequiredData, null, 2));

const latestFirefox = files
  .filter(
    (file) =>
      file.endsWith('.json') &&
      file.includes('firefox') &&
      !file.includes('cdp'),
  )
  .sort()
  .at(-1);

const defaultStats = {
    "stats": {
        "suites": 0,
        "tests": 0,
        "passes": 0,
        "pending": 0,
        "failures": 0,
        "start": "never",
        "end": "never",
        "duration": 0
    },
    "tests": [],
    "failures": [],
    "passes": [],
    "pending": []
}

const timestamp = getParts(latestFirefox)[1];
const latestFirefoxTests = JSON.parse(
  readFileSync(`./data/firefox-${timestamp}.json`, 'utf-8'),
);

const chromeFilePath = `./data/chrome-${timestamp}.json`;
const latestChromeTests = existsSync(chromeFilePath)
  ? JSON.parse(readFileSync(chromeFilePath, 'utf-8'))
  : defaultStats;

const chromeBidiOnlyFilePath = `./data/chromeBidiOnly-${timestamp}.json`;
const latestChromeBidiOnlyTests = existsSync(chromeBidiOnlyFilePath)
  ? JSON.parse(readFileSync(chromeBidiOnlyFilePath, 'utf-8'))
  : defaultStats;


writeFileSync(
  'firefox-failing.json',
  JSON.stringify(
    {
      failing: latestFirefoxTests.failures
        .filter(filterIgnored)
        .map((t) => t.fullTitle),
      pending: latestFirefoxTests.pending
        .filter(filterIgnored)
        .map((t) => t.fullTitle),
    },
    null,
    2,
  ),
);

writeFileSync(
  'chrome-failing.json',
  JSON.stringify(
    {
      failing: latestChromeTests.failures
        .filter(filterIgnored)
        .map((t) => t.fullTitle),
      pending: latestChromeTests.pending
        .filter(filterIgnored)
        .map((t) => t.fullTitle),
    },
    null,
    2,
  ),
);

writeFileSync(
  'chromeBidiOnly-failing.json',
  JSON.stringify(
    {
      failing: latestChromeBidiOnlyTests.failures
        .filter(filterIgnored)
        .map((t) => t.fullTitle),
      pending: latestChromeBidiOnlyTests.pending
        .filter(filterIgnored)
        .map((t) => t.fullTitle),
    },
    null,
    2,
  ),
);

writeFileSync(
  'firefox-failing-all.json',
  JSON.stringify(
    {
      failing: latestFirefoxTests.failures.map((t) => t.fullTitle),
      pending: latestFirefoxTests.pending.map((t) => t.fullTitle),
    },
    null,
    2,
  ),
);

writeFileSync(
  'chrome-failing-all.json',
  JSON.stringify(
    {
      failing: latestChromeTests.failures.map((t) => t.fullTitle),
      pending: latestChromeTests.pending.map((t) => t.fullTitle),
    },
    null,
    2,
  ),
);
writeFileSync(
  'chromeBidiOnly-failing-all.json',
  JSON.stringify(
    {
      failing: latestChromeBidiOnlyTests.failures.map((t) => t.fullTitle),
      pending: latestChromeBidiOnlyTests.pending.map((t) => t.fullTitle),
    },
    null,
    2,
  ),
);
