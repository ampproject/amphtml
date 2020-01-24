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
const {
  CONTROL,
  EXPERIMENT,
  RESULTS_PATH,
  urlToCachePath,
} = require('./helpers');

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
const setupMeasurement = page =>
  page.evaluateOnNewDocument(() => {
    window.longTasks = [];
    window.cumulativeLayoutShift = 0;
    window.measureStarted = Date.now();
    window.largestContentfulPaint = 0;

    const longTaskObserver = new PerformanceObserver(list =>
      list.getEntries().forEach(entry => window.longTasks.push(entry))
    );

    longTaskObserver.observe({entryTypes: ['longtask']});

    const layoutShiftObserver = new PerformanceObserver(list =>
      list
        .getEntries()
        .forEach(entry => (window.cumulativeLayoutShift += entry.value))
    );

    layoutShiftObserver.observe({entryTypes: ['layout-shift']});

    const largestContentfulPaintObserver = new PerformanceObserver(list => {
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
const readMetrics = page =>
  page.evaluate(() => {
    const entries = performance.getEntries();

    function getMetric(name) {
      const entry = entries.find(entry => entry.name === name);
      return entry ? entry.startTime : 0;
    }

    const firstPaint = getMetric('first-paint');
    const firstContentfulPaint = getMetric('first-contentful-paint');

    function getMaxFirstInputDelay() {
      let longest = 0;

      window.longTasks.forEach(longTask => {
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
 * @param {string} url
 * @param {string} version
 * @param {*} metrics
 */
function writeMetrics(url, version, metrics) {
  let results = {};

  if (fs.existsSync(RESULTS_PATH)) {
    results = JSON.parse(fs.readFileSync(RESULTS_PATH));
  }

  if (!results[url]) {
    results[url] = {[CONTROL]: [], [EXPERIMENT]: []};
  }

  results[url][version].push(metrics);

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results));
}

/**
 * Opens Chrome, loads the URL from local file cache, and collects
 * metrics for the specified URL and version
 *
 * @param {string} url
 * @param {string} version "control" or "experiment"
 * @param {Object} options
 * @return {Promise}
 */
async function measureDocument(url, version, {headless}) {
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
    await page.goto(`file:${urlToCachePath(url, version)}`, {
      waitUntil: 'networkidle0',
    });
  } catch {
    // site did not load
    await browser.close();
    return;
  }

  const metrics = await readMetrics(page);
  writeMetrics(url, version, metrics);
  await browser.close();
}

/**
 * Loads cached local copies of the URLs in Chrome with Puppeteer and
 * runs a script on the page to collect performance metrics. Saves
 * performance metrics to results.json in this directory.
 *
 * @param {Array<string>} urls
 * @param {{headless:boolean, runs:number}} options
 * @return {Promise} Fulfills when all URLs have been measured
 */
async function measureDocuments(urls, {headless, runs}) {
  requirePuppeteer_();

  try {
    fs.unlinkSync(RESULTS_PATH);
  } catch {} // file does not exist (first run)

  // Make an array of tasks to be executed
  const tasks = urls.flatMap(url =>
    Array.from({length: runs}).flatMap(() => [
      measureDocument.bind(null, url, CONTROL, {headless}),
      measureDocument.bind(null, url, EXPERIMENT, {headless}),
    ])
  );

  // Excecute the tasks serially
  const [first, ...rest] = tasks;
  await rest.reduce((prev, task) => prev.then(task), first());
}

module.exports = measureDocuments;
