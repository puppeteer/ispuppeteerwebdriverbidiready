const fs = require('fs');

async function main() {
  const files = fs.readdirSync('./data');
  const data = files.filter(file => file.endsWith('.json')).sort().map(file => {
    const stats = JSON.parse(fs.readFileSync('./data/' + file, 'utf-8')).stats;
    const counts = {
      passing: stats.passes,
      failing: stats.failures,
      skipping: stats.pending,
      total: stats.tests,
    }
    counts.unsupported = counts.total - (counts.passing + counts.failing + counts.skipping);
    return {
      date: Number(file.split('.').shift()) * 1000,
      counts,
    }
  });
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  console.log(data);
}

main();
