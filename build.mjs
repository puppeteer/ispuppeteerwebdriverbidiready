import { writeFile } from 'fs/promises';
import { launch } from 'puppeteer';

import { start, stop } from './server.mjs';

async function createScreenshot() {
  const browser = await launch();
  const page = await browser.newPage();
  await start(9001);
  await page.setViewport({
    width: 3840,
    height: 2163,
  });
  await page.goto('http://localhost:9001/', {
    waitUntil: 'load',
  });
  await page.waitForSelector('canvas');
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await page.evaluate(() => {
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      script.remove();
    }
  });

  const screenshot = await page.screenshot();
  await writeFile('dist/static.png', screenshot);
  await browser.close();
  await stop();
}

await createScreenshot();
