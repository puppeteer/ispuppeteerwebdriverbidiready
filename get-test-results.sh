#!/bin/bash

CWD=$(pwd)

cd $(mktemp -d)

timestamp=$(date +%s)

git clone --depth 1 https://github.com/puppeteer/puppeteer.git
cd puppeteer
npm ci
npm run build
npm ci
PUPPETEER_PRODUCT=firefox npm ci

npm run test -- --test-suite firefox-bidi --no-coverage --save-stats-to ./stats.json
cp ./stats.json $CWD/data/firefox-$timestamp.json

npm run test -- --test-suite chrome-bidi --no-coverage --save-stats-to ./stats.json
cp ./stats.json $CWD/data/chrome-$timestamp.json
