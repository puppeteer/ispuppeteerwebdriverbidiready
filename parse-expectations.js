const fetch = require('node-fetch');

async function parseExpectations(url) {
  const response = await fetch(url);
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
  return counts;
}

module.exports = parseExpectations;
