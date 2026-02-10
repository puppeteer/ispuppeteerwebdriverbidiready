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

bidi-firefox() {
  echo "Running bidi-firefox"
  npm run test -- --test-suite firefox-headless --no-coverage --save-stats-to $CWD/data/firefox-$timestamp.json --no-cdp-tests
}

bidi-chrome() {
  echo "Running bidi-chrome"
  npm run test -- --test-suite chrome-bidi --no-coverage --save-stats-to $CWD/data/chrome-$timestamp.json
}

bidi-only-chrome() {
  echo "Running bidi-only-chrome"
  npm run test -- --test-suite chrome-bidi-only --no-coverage --save-stats-to $CWD/data/chromeBidiOnly-$timestamp.json
}

cdp-chrome() {
  echo "Running cdp-chrome"
  npm run test -- --test-suite chrome-headless --no-coverage --save-stats-to $CWD/data/chrome-cdp-$timestamp.json
}

bidi-firefox
bidi-chrome
bidi-only-chrome
cdp-chrome

exit 0
