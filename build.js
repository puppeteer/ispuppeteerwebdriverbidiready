const fs = require('fs').promises;
const puppeteer = require('puppeteer');

const server = require('./server.js');

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await server.start(9001);
  await page.setViewport({
    width: 3840,
    height: 2163,
  });
  await page.goto('http://localhost:9001/');
  await page.waitForSelector('.has-chart');
  await page.evaluate(() => {
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      script.remove();
    }
  });
  const screenshot = await page.screenshot()
  await fs.writeFile('dist/static.png', screenshot);
  await browser.close();
  await server.stop();
}

main();