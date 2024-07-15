#!/bin/bash

CWD=$(pwd)

cd $(mktemp -d)

timestamp=$(date +%s)

git clone --depth 1 https://github.com/puppeteer/puppeteer.git
cd puppeteer
npm ci
npm run build -w @puppeteer-test/test

PUPPETEER_PRODUCT=chrome node packages/puppeteer/install.mjs
PUPPETEER_PRODUCT=firefox node packages/puppeteer/install.mjs
export CI=true

cdp-firefox() {
    npm run test -- --test-suite firefox-headless --no-coverage --save-stats-to $CWD/data/firefox-cdp-$timestamp.json --no-cdp-tests
}

bidi-firefox() {
  npm run test -- --test-suite firefox-bidi --no-coverage --save-stats-to $CWD/data/firefox-$timestamp.json --no-cdp-tests
}

bidi-chrome() {
  npm run test -- --test-suite chrome-bidi --no-coverage --save-stats-to $CWD/data/chrome-$timestamp.json
}

cdp-firefox
bidi-firefox
bidi-chrome

exit 0