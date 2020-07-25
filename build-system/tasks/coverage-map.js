/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const log = require('fancy-log');
const puppeteer = require('puppeteer');
const {exec} = require('../common/exec');

const coverageJsonName = argv.json || 'out.json';
const testUrl =
  argv.url || 'http://localhost:8000/examples/everything.amp.html';

async function compile() {
  await exec(`gulp dist`);
  // The question: How to cd to 'amphtml/dist' from anywhere in 'amphtml'?
  await exec(`gulp serve --compiled`);
}

async function test() {
  log('Opening browser and navigating to everything.amp.html...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Enable JavaScript coverage
  await Promise.all([page.coverage.startJSCoverage()]);
  // Navigate to page
  await page.goto(testUrl);
  await page.setViewport({
    width: 1200,
    height: 800,
  });
  log('Scrolling to the end of the page...');
  await autoScroll(page);
  log('Testing completed.');
  const [jsCoverage] = await Promise.all([page.coverage.stopJSCoverage()]);
  const data = JSON.stringify(jsCoverage);
  log('Writing to test.json in working directory...');
  fs.writeFileSync(coverageJsonName, data);
  await browser.close();
}

// Source: https://github.com/chenxiaochun/blog/issues/38s
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, opt_) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const {scrollHeight} = document.body;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function generateHeatMap() {
  await exec(
    `source-map-explorer v0.js v0.js.map -m --coverage ${coverageJsonName}`
  );
  // Maybe I can ask the user to Control+C?
}

async function coverageMap() {
  await compile();
  // I did this in another terminal, so that means I'll have to spawn another terminal...?
  await test();
  await generateHeatMap();
}

module.exports = {coverageMap};

coverageMap.description =
  'Generates a code coverage "heat map" on v0.js based on code traversed during puppeteer test via source map explorer';

coverageMap.flags = {
  json: '  Customize the name of the JSON output (test.json by default).',
  url:
    "  Set the URL for puppeteer testing, starting with  'http://localhost:8000...' (http://localhost:8000/examples/everything.amp.html by default).",
};
