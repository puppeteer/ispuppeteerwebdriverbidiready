async function main() {
  const response = await fetch('./expectations.json');
  const expectations = await response.json();
  const results = new Map([
    ['PASS', 0],
    ['SKIP', 0],
    ['TIMEOUT', 0],
    ['FAIL', 0],
    ['testCount', 0],
  ]);
  for (const [name, expectation] of Object.entries(expectations)) {
    for (const status of expectation) {
      results.set(status, results.get(status) + 1);
    }
    results.set('testCount', results.get('testCount') + 1);
  }
  const output = [];
  for (const [result, count] of results) {
    output.push(`<li>${result}: ${count}`);
  }
  document.querySelector('#output').innerHTML = `<ul>${output.join('')}</ul>`;
}

main();
