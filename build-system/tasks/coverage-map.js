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
const fs = require('fs').promises;
const log = require('fancy-log');
const puppeteer = require('puppeteer');
const {dist} = require('./dist');
const {explore} = require('source-map-explorer');
const {startServer, stopServer} = require('./serve');

const coverageJsonName = argv.json || 'out.json';
const testUrl =
  argv.url || 'http://localhost:8000/examples/everything.amp.html';
const outHtml = argv.html || 'out.html';

async function collectCoverage() {
  log(`Opening browser and navigating to ${testUrl}...`);
  const browser = await puppeteer.launch({
    defaultViewport: {width: 1200, height: 800},
  });
  const page = await browser.newPage();

  // Enable JavaScript coverage
  await page.coverage.startJSCoverage();
  // Navigate to page
  await page.goto(testUrl);
  await page.waitFor(() => !!document.querySelector('style[amp-runtime]'));
  await page.waitFor(
    () =>
      !!document.body &&
      getComputedStyle(document.body).visibility === 'visible'
  );
  log('Scrolling to the end of the page...');
  await autoScroll(page);
  log('Testing completed.');
  const jsCoverage = await page.coverage.stopJSCoverage();
  const data = JSON.stringify(jsCoverage);
  log(`Writing to ${coverageJsonName} in dist/${coverageJsonName}...`);
  await fs.writeFile(`dist/${coverageJsonName}`, data, () => {});
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
        window./*OK*/ scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function generateMap() {
  log(
    `Generating heat map in dist/${outHtml}, based on ${coverageJsonName}...`
  );
  await explore('dist/v0.js', {
    output: {format: 'html', filename: `${outHtml}`},
    coverage: `dist/${coverageJsonName}`,
    onlyMapped: true,
  });
}

async function coverageMap() {
  await dist();
  await startServer(
    {host: 'localhost', port: 8000},
    {quiet: true},
    {compiled: true}
  );
  await collectCoverage();
  await generateMap();
  await stopServer();
}

module.exports = {coverageMap};

coverageMap.description =
  'Generates a code coverage "heat map" HTML visualization on v0.js based on code traversed during puppeteer test via source map explorer';

coverageMap.flags = {
  json:
    '  Customize the name of the JSON output from puppeteer (out.json by default).',
  url:
    '  Set the URL for puppeteer testing, starting with  "http://localhost:8000..." (http://localhost:8000/examples/everything.amp.html by default).',
  html:
    '  Customize the name of the HTML output from source map explorer (out.html by default).',
};
