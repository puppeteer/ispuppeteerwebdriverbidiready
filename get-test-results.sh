#!/bin/bash

CWD=$(pwd)

cd $(mktemp -d)

timestamp=$(date +%s)

git clone --depth 1 https://github.com/puppeteer/puppeteer.git
cd puppeteer
PUPPETEER_SKIP_DOWNLOAD=true npm ci
npm run build -w @puppeteer-test/test

PUPPETEER_PRODUCT=firefox node packages/puppeteer/install.js

npm run test -- --test-suite firefox-bidi --no-coverage --save-stats-to ./stats.json
cp ./stats.json $CWD/data/firefox-$timestamp.json

export PUPPETEER_EXECUTABLE_PATH=$(node tools/download_chrome_bidi.mjs ~/.cache/puppeteer/chrome-canary | tail -1)

npm run test -- --test-suite chrome-bidi --no-coverage --save-stats-to ./stats.json
cp ./stats.json $CWD/data/chrome-$timestamp.json
