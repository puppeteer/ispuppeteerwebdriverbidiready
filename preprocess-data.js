const fs = require('fs');

async function main() {
  const files = fs.readdirSync('./data');
  const data = files.filter(file => file.endsWith('.json')).sort().map(file => {
    const stats = JSON.parse(fs.readFileSync('./data/' + file, 'utf-8')).stats;
    // Since few tests are supported we don't report the skipped tests to make
    // sure the chart is readable.
    const counts = {
      passing: stats.passes,
      failing: stats.failures,
      skipping: 0, // stats.pending,
      total: stats.tests,
    }
    counts.unsupported = 0; // counts.total - (counts.passing + counts.failing + counts.skipping);
    return {
      date: Number(file.split('.').shift()) * 1000,
      counts,
    }
  });
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  console.log(data);
}

main();
