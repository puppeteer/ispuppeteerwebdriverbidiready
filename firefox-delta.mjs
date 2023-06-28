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

const BiDiTests = JSON.parse(
  readFileSync(`./data/${browser}-${timestamp}.json`, 'utf-8')
).tests;
const CdpTests = JSON.parse(readFileSync(cdpFile, 'utf-8')).tests;
const tests = new Map();
for (const test of CdpTests) {
  tests.set(test.fullTitle, Object.keys(test.err).length === 0);
}

for (const test of BiDiTests) {
  const passesInBiDi = tests.get(test.fullTitle);
  if (passesInBiDi && Object.keys(test.err).length !== 0) {
    cdpPassBiDiFailTest.push(test.fullTitle);
  }
}
const firefoxDelta = {
  delta: cdpPassBiDiFailTest.length,
  tests: cdpPassBiDiFailTest,
};

writeFileSync('firefox-delta.json', JSON.stringify(firefoxDelta, null, 2));
