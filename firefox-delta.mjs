import { readdirSync, readFileSync, existsSync, writeFileSync } from 'fs';

function getParts(file) {
  const parts = file.split('-');
  if (parts.length === 1) {
    parts.unshift('firefox');
  }
  parts[1] = parts[1].split('.').shift();
  return parts;
}

const files = readdirSync('./data');
const firefoxLatest = files
  .filter(
    (file) =>
      file.endsWith('.json') &&
      file.includes('firefox') &&
      !file.includes('cdp')
  )
  .sort()
  .at(-1);
const [browser, timestamp] = getParts(firefoxLatest);
const cdpFile = `./data/${browser}-cdp-${timestamp}.json`;
if (!existsSync(cdpFile)) {
  process.exit(0);
}

const cdpPassBiDiFailTest = [];
const cdpFailBiDiPassTest = [];

const biDiTests = JSON.parse(readFileSync(`./data/${browser}-${timestamp}.json`, 'utf-8')).tests;
const passingBiDiTests = new Set(JSON.parse(readFileSync(`./data/${browser}-${timestamp}.json`, 'utf-8')).passes.map(p => p.fullTitle));
const passingCdpTests = new Set(JSON.parse(readFileSync(cdpFile, 'utf-8')).passes.map(p => p.fullTitle));

for (const test of biDiTests) {
  if (passingCdpTests.has(test.fullTitle) && !passingBiDiTests.has(test.fullTitle)) {
    cdpPassBiDiFailTest.push(test.fullTitle);
  }
  if (!passingCdpTests.has(test.fullTitle) && passingBiDiTests.has(test.fullTitle)) {
    cdpFailBiDiPassTest.push(test.fullTitle);
  }
}

const firefoxDelta = {
  failing: cdpPassBiDiFailTest.length,
  failingTests: cdpPassBiDiFailTest,
  passing: cdpFailBiDiPassTest.length,
  passingTests: cdpFailBiDiPassTest
};

writeFileSync('firefox-delta.json', JSON.stringify(firefoxDelta, null, 2));

const latestFirefoxTests = JSON.parse(readFileSync(`./data/firefox-${timestamp}.json`, 'utf-8'));
const latestChromeTests = JSON.parse(readFileSync(`./data/chrome-${timestamp}.json`, 'utf-8'));

writeFileSync('firefox-failing.json', JSON.stringify({
  failing: latestFirefoxTests.failures.map(t => t.fullTitle),
  pending: latestFirefoxTests.pending.map(t => t.fullTitle),
}, null, 2));

writeFileSync('chrome-failing.json', JSON.stringify({
  failing: latestChromeTests.failures.map(t => t.fullTitle),
  pending: latestChromeTests.pending.map(t => t.fullTitle),
}, null, 2));