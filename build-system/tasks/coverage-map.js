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
const fs = require('fs');
const log = require('fancy-log');
const puppeteer = require('puppeteer');

async function coverageMap() {
  log('Opening browser and navigating to everything.amp.html...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Enable both JavaScript and CSS coverage
  await Promise.all([page.coverage.startJSCoverage()]);
  // Navigate to page
  await page.goto('http://localhost:8000/examples/everything.amp.html');
  // Wait 10 seconds
  await page.waitFor(10000);
  // Scroll down by 10000 CSS pixels
  await page.mouse.wheel({deltaY: -10000});
  // Disable JavaScript coverage
  log('Testing completed.');
  const [jsCoverage] = await Promise.all([page.coverage.stopJSCoverage()]);
  const data = JSON.stringify(jsCoverage);
  log('Writing to test.json in working directory...');
  fs.writeFileSync('test.json', data);
  await browser.close();
}

module.exports = {coverageMap};

coverageMap.description =
  'Generates a code coverage "heat map" on v0.js based on code traversed during puppeteer test via source map explorer';
