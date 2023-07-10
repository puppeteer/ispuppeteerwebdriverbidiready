#!/bin/bash

CWD=$(pwd)

cd $(mktemp -d)

timestamp=$(date +%s)

git clone --depth 1 https://github.com/puppeteer/puppeteer.git
cd puppeteer
PUPPETEER_SKIP_DOWNLOAD=true npm ci
npm run build -w @puppeteer-test/test

PUPPETEER_PRODUCT=firefox node packages/puppeteer/install.js
export CI=true

cdp-firefox() {
    npm run test -- --test-suite firefox-headless --no-coverage --save-stats-to $CWD/data/firefox-cdp-$timestamp.json
}

bidi-firefox() {
  npm run test -- --test-suite firefox-bidi --no-coverage --save-stats-to $CWD/data/firefox-$timestamp.json
}

bidi-chrome() {
  export PUPPETEER_EXECUTABLE_PATH=$(node tools/download_chrome_bidi.mjs ~/.cache/puppeteer/chrome-canary --shell)
  npm run test -- --test-suite chrome-bidi --no-coverage --save-stats-to $CWD/data/chrome-$timestamp.json
}

cdp-firefox
bidi-firefox
bidi-chrome

exit 0