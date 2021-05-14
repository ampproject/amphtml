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
const {buildNewServer} = require('../../server/typescript-compile');
const {cyan} = require('../../common/colors');
const {dist} = require('../dist');
const {log} = require('../../common/logging');
const {startServer, stopServer} = require('../serve');

const coverageJsonName = argv.json || 'coverage.json';
const serverPort = argv.port || 8000;
const outHtml = argv.outputhtml || 'coverage.html';
const inputHtml = argv.inputhtml || 'everything.amp.html';
let testUrl = `http://localhost:${serverPort}/examples/${inputHtml}`;
let inputJs = argv.file || 'v0.js';

/**
 * @return {Promise<void>}
 */
async function collectCoverage() {
  const puppeteer = require('puppeteer');
  log('Opening browser and navigating to', cyan(`${testUrl}`) + '...');
  const browser = await puppeteer.launch({
    defaultViewport: {width: 1200, height: 800},
  });
  const page = await browser.newPage();

  // Enable JavaScript coverage
  await page.coverage.startJSCoverage();
  // Navigate to page
  await page.goto(testUrl);
  await page.waitFor(
    () =>
      !!document.querySelector('style[amp-runtime]') &&
      !!document.body &&
      getComputedStyle(document.body).visibility === 'visible'
  );
  log('Scrolling to the end of the page...');
  await autoScroll(page);
  log('Testing completed.');
  const jsCoverage = await page.coverage.stopJSCoverage();
  const data = JSON.stringify(jsCoverage);
  log(
    'Writing to',
    cyan(`${coverageJsonName}`),
    'in',
    cyan(`dist/${coverageJsonName}`) + '...'
  );
  await fs.writeFile(`dist/${coverageJsonName}`, data);
  await browser.close();
}

/**
 * Source: https://github.com/chenxiaochun/blog/issues/38s
 *
 * @param {puppeteer.Page} page
 * @return {Promise<void>}
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await /** @type {Promise<void>} */ (
      new Promise((resolve) => {
        let totalHeight = 0;
        const scrollDistance = 100;
        const distance = scrollDistance;
        const timer = setInterval(() => {
          const {scrollHeight} = document.body;
          window./*OK*/ scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      })
    );
  });
}

/**
 * @return {Promise<void>}
 */
async function htmlTransform() {
  const {
    transform,
  } = require('../../server/new-server/transforms/dist/transform');
  log('Transforming', cyan(`${inputHtml}`) + '...');
  const transformed = await transform(`examples/${inputHtml}`);
  const transformedName = `transformed.${inputHtml}`;
  await fs.mkdir('dist/transformed', {recursive: true});
  await fs.writeFile(`dist/transformed/${transformedName}`, transformed);
  log(
    'Transformation complete. It can be found at',
    cyan(`dist/transformed/${transformedName}`) + '.'
  );
  testUrl = `http://localhost:${serverPort}/dist/transformed/${transformedName}`;
}

/**
 * @return {Promise<void>}
 */
async function generateMap() {
  const {explore} = require('source-map-explorer');

  // Change source map explorer to mjs file extension if needed
  if (argv.esm && inputJs.includes('.js')) {
    inputJs = inputJs.replace(/\.js/g, '.mjs');
  }

  log(
    'Generating heat map in',
    cyan(`dist/${outHtml}`),
    'of',
    cyan(`${inputJs}`),
    'based on',
    cyan(`${coverageJsonName}`) + '...'
  );
  await explore(
    {code: `dist/${inputJs}`, map: `dist/${inputJs}.map`},
    {
      output: {format: 'html', filename: `dist/${outHtml}`},
      coverage: `dist/${coverageJsonName}`,
      onlyMapped: true,
    }
  );
}

/**
 * @return {Promise<void>}
 */
async function coverageMap() {
  await buildNewServer();

  if (!argv.nobuild) {
    await dist();
  }

  if (argv.esm || argv.sxg) {
    await htmlTransform();
  }

  await startServer(
    {host: 'localhost', port: serverPort},
    {quiet: true},
    {compiled: true}
  );
  await collectCoverage();
  await generateMap();
  await stopServer();
}

module.exports = {
  coverageMap,
};

coverageMap.description =
  'Generates a code coverage heat map for v0.js via source map explorer';

coverageMap.flags = {
  json: 'JSON output filename [default: out.json]',
  inputhtml: 'Input HTML file under "examples/" [default: everything.amp.html]',
  outputhtml: 'Output HTML file [default: out.html]',
  nobuild: 'Skips dist build.',
  port: 'Port number for AMP server [default: 8000]',
  file: 'Output file(s) relative to dist/. Accepts .js, .mjs, and wildcards. [default: v0.js]',
  esm: 'Generate coverage in ESM mode. Triggers an extra HTML transformation.',
  sxg: 'Generate in SxG mode. Triggers an extra HTML transformation.',
};
