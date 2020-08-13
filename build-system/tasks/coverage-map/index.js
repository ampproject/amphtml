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
const {buildNewServer} = require('../../server/typescript-compile');
const {cyan} = require('ansi-colors');
const {dist} = require('../dist');
const {installPackages} = require('../../common/utils');
const {startServer, stopServer} = require('../serve');

let puppeteer;
let explore;
let transform;

const coverageJsonName = argv.json || 'coverage.json';
const serverPort = argv.port || 8000;
const outHtml = argv.outputhtml || 'coverage.html';
const inputHtml = argv.inputhtml || 'everything.amp.html';
let testUrl = `http://localhost:${serverPort}/examples/${inputHtml}`;
let inputJs = argv.file || 'v0.js';

async function collectCoverage() {
  puppeteer = require('puppeteer');
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

// Source: https://github.com/chenxiaochun/blog/issues/38s
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, opt_) => {
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
    });
  });
}

async function htmlTransform() {
  transform = require('../../server/new-server/transforms/dist/transform')
    .transform;
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

async function generateMap() {
  explore = require('source-map-explorer').explore;

  // Change source map explorer to mjs file extension if needed
  if (argv.esm && inputJs.includes('.js')) {
    inputJs = inputJs.replaceAll('.js', '.mjs');
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

async function coverageMap() {
  installPackages(__dirname);
  buildNewServer();

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

module.exports = {coverageMap};

coverageMap.description =
  'Generates a code coverage "heat map" HTML visualization on v0.js based on code traversed during puppeteer test via source map explorer';

coverageMap.flags = {
  json:
    '  Customize the name of the JSON output from puppeteer (out.json by default).',
  inputhtml:
    '  Set the input HTML for puppeteer testing, by designating the path that leads to the HTML file, starting at "examples/" (everything.amp.html by default).',
  outputhtml:
    '  Customize the name of the HTML output from source map explorer (out.html by default).',
  nobuild: '  Skips dist build.',
  port:
    '  Customize the port number of the local AMP server (8000 by default).',
  file:
    '  Designate which JS (or MJS) file to view in coverage map, or *.js for all files (v0.js by default). If the JS file is not in the top level dist directory, you need to indicate the path to the JS file relative to dist.',
  esm:
    '  Perform coverage test in ESM environment. This will trigger an additional HTML transformation.',
  sxg:
    '  Perform coverage test in SxG environment. This will trigger an additional HTML transformation.',
};
