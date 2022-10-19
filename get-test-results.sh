#!/bin/bash

CWD=$(pwd)

cd $(mktemp -d)

git clone --depth 1 https://github.com/puppeteer/puppeteer.git
cd puppeteer
git pull
git checkout save-test-stats
npm ci
npm run build
npm run test -- --test-suite firefox-bidi --no-coverage --save-stats-to ./stats.json

timestamp=$(date +%s)

cp ./stats.json $CWD/data/$timestamp.json
