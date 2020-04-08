/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
const {CONTROL, EXPERIMENT, RESULTS_PATH} = require('./helpers');

// Require Puppeteer dynamically to prevent throwing error in Travis
let puppeteer;

function requirePuppeteer_() {
  puppeteer = require('puppeteer');
}

/**
 * Setup measurement on page before navigating to the URL. Performance
 * observers need to be initialized before content begins to load to take
 * measurements.
 *
 * @param {Puppeteer.page} page
 * @return {Promise} Resolves when script is evaluated
 */
const setupMeasurement = (page) =>
  page.evaluateOnNewDocument(() => {
    window.longTasks = [];
    window.cumulativeLayoutShift = 0;
    window.measureStarted = Date.now();
    window.largestContentfulPaint = 0;

    const longTaskObserver = new PerformanceObserver((list) =>
      list.getEntries().forEach((entry) => window.longTasks.push(entry))
    );

    longTaskObserver.observe({entryTypes: ['longtask']});

    const layoutShiftObserver = new PerformanceObserver((list) =>
      list
        .getEntries()
        .forEach((entry) => (window.cumulativeLayoutShift += entry.value))
    );

    layoutShiftObserver.observe({entryTypes: ['layout-shift']});

    const largestContentfulPaintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const entry = entries[entries.length - 1];
      window.largestContentfulPaint = entry.renderTime || entry.loadTime;
    });

    largestContentfulPaintObserver.observe({
      entryTypes: ['largest-contentful-paint'],
    });
  });

/**
 * Evaluate script on the page to collect and calculate metrics
 *
 * @param {Puppeteer.page} page
 * @return {Promise<object>} Resolves with page load metrics
 */
const readMetrics = (page) =>
  page.evaluate(() => {
    const entries = performance.getEntries();

    function getMetric(name) {
      const entry = entries.find((entry) => entry.name === name);
      return entry ? entry.startTime : 0;
    }

    const firstPaint = getMetric('first-paint');
    const firstContentfulPaint = getMetric('first-contentful-paint');

    function getMaxFirstInputDelay() {
      let longest = 0;

      window.longTasks.forEach((longTask) => {
        if (
          longTask.startTime > firstContentfulPaint &&
          longTask.duration > longest
        ) {
          longest = longTask.duration;
        }
      });

      return longest;
    }

    function getTimeToInteractive() {
      return Date.now() - window.measureStarted;
    }

    return {
      visible: getMetric('visible'),
      firstPaint,
      firstContentfulPaint,
      largestContentfulPaint: window.largestContentfulPaint,
      timeToInteractive: getTimeToInteractive(),
      maxFirstInputDelay: getMaxFirstInputDelay(),
      cumulativeLayoutShift: window.cumulativeLayoutShift * 100,
    };
  });

/**
 * Writes measurements to ./results.json
 *
 * @param {Array<string>} urls
 * @param {Object} results
 */
function writeMetrics(urls, results) {
  try {
    fs.unlinkSync(RESULTS_PATH);
  } catch {} // file does not exist (first run)

  const writtenResults = {};
  urls.forEach((url) => {
    writtenResults[url] = {
      [CONTROL]: results[CONTROL][url],
      [EXPERIMENT]: results[EXPERIMENT][url],
    };
  });
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(writtenResults));
}

/**
 * Opens Chrome, loads the URL from local file cache, and collects
 * metrics for the specified URL.
 *
 * @param {string} url
 * @param {Object} options
 * @return {Promise}
 */
async function measureDocument(url, {headless}) {
  const browser = await puppeteer.launch({
    headless,
    args: [
      '--allow-file-access-from-files',
      '--enable-blink-features=LayoutInstabilityAPI',
    ],
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await setupMeasurement(page);

  try {
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });
  } catch {
    // site did not load
    await browser.close();
    return;
  }

  const metrics = await readMetrics(page);
  await browser.close();
  return {url, metrics};
}

/**
 * Navigates to locally served pages in Chrome with Puppeteer and
 * runs a script to collect performance metrics. Returns results
 * as an object with url as key, and array of metrics as value.
 *
 * @param {Array<string>} urls
 * @param {string} version "control" or "experiment"
 * @param {{headless:boolean, runs:number}} options
 * @return {Promise<Objects>} Metric results
 */
async function measureDocuments(urls, version, {headless, runs}) {
  log(`Getting metrics for version: ${version}`);
  requirePuppeteer_();

  const results = {};
  urls.forEach((url) => {
    results[url] = [];
  });

  // Make an array of tasks to be executed
  const tasks = urls.flatMap((url) =>
    Array.from({length: runs}).flatMap(() => [
      measureDocument.bind(null, url, {headless}),
    ])
  );

  const startTime = Date.now();
  function timeLeft() {
    const elapsed = (Date.now() - startTime) / 1000;
    const secondsPerTask = elapsed / i;
    return Math.floor(secondsPerTask * (tasks.length - i));
  }

  // Excecute the tasks serially
  let i = 0;
  for (const task of tasks) {
    log(`Progress: ${i++}/${tasks.length}. ${timeLeft()} seconds left.`);
    const {url, metrics} = await task();
    results[url].push(metrics);
  }

  return results;
}

module.exports = {measureDocuments, writeMetrics};
