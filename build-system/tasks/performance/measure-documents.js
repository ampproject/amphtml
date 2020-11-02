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

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const log = require('fancy-log');
const {
  CDN_URL,
  CONTROL,
  DEFAULT_EXTENSIONS,
  EXPERIMENT,
  RESULTS_PATH,
  urlToCachePath,
  getFileFromAbsolutePath,
  getLocalPathFromExtension,
  localFileToCachePath,
} = require('./helpers');
const {
  setupAnalyticsHandler,
  getAnalyticsMetrics,
} = require('./analytics-handler');
const {cyan, green} = require('ansi-colors');
const {setupAdRequestHandler} = require('./ads-handler');

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
 * Intecepts requests for default extensions made by runtime,
 * and returns cached version (master and local).
 * @param {Request} interceptedRequest
 * @param {string} version
 * @return {!Promise<boolean>}
 */
const defaultExtensionsHandler = async (interceptedRequest, version) => {
  const interceptedUrl = interceptedRequest.url();
  for (let i = 0; i < DEFAULT_EXTENSIONS.length; i++) {
    const extension = DEFAULT_EXTENSIONS[i];
    if (interceptedUrl.endsWith(extension)) {
      const localPath = getLocalPathFromExtension(extension);
      const jsonString = await getFileFromAbsolutePath(
        version === CONTROL
          ? urlToCachePath(CDN_URL + localPath)
          : localFileToCachePath(localPath)
      );
      interceptedRequest.respond({
        status: 200,
        contentType: 'script; charset=utf-8',
        body: jsonString,
      });
      return true;
    }
  }
  return false;
};

/**
 * Create a promise that will resolve after a setTimeout,
 * unless it has been resolved before then.
 * @param {?Object} handlerOptions
 * @return {!Object}
 */
function setupDelayBasedOnHandlerOptions(handlerOptions) {
  let resolve;
  const timeoutPromise = new Promise((r) => {
    resolve = r;
    setTimeout(
      resolve,
      handlerOptions && handlerOptions.timeout ? handlerOptions.timeout : 0
    );
  });
  return {
    timeoutPromise,
    resolve,
  };
}

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

    return {
      largestContentfulPaint: window.largestContentfulPaint,
      maxFirstInputDelay: getMaxFirstInputDelay(),
      cumulativeLayoutShift: window.cumulativeLayoutShift * 100,
    };
  });

/**
 * Set up defaults handlers for docs that will be requested
 * that are not explicted stated as script tags and not
 * handled by the 'additionalHandlers'.
 *
 * @param {!Array<function>} handlersList
 * @param {string} version
 */
function setupDefaultHandlers(handlersList, version) {
  // Handle requests made by runtime for default extensions
  handlersList.push((interceptedRequest) =>
    defaultExtensionsHandler(interceptedRequest, version)
  );
}

/**
 * Set up appropriate handlers based upon handlerOptions
 *
 * @param {!Array<function>} handlersList
 * @param {?Object} handlerOptions
 * @param {!Puppeteer.page} page
 * @param {!function} resolve
 * @param {string} version
 */
async function setupAdditionalHandlers(
  handlersList,
  handlerOptions,
  page,
  resolve,
  version
) {
  switch (handlerOptions.handlerName) {
    case 'adsHandler':
      setupAdRequestHandler(handlersList, version);
      setupAnalyticsHandler(handlersList, handlerOptions, resolve);
      break;
    case 'analyticsHandler':
      setupAnalyticsHandler(handlersList, handlerOptions, resolve);
      break;
    case 'defaultHandler':
    default:
      await setupMeasurement(page);
      break;
  }
}

/**
 * Send each intercepted request to all handlers in list.
 * Takes care of continuing the request, if none of the
 * handlers respond/abort the request.
 *
 * @param {!Array<function>} handlersList
 * @param {Puppeteer.page} page
 */
function startRequestListener(handlersList, page) {
  page.on('request', async (interceptedRequest) => {
    let requestHandled = false;
    for (let i = 0; i < handlersList.length; i++) {
      const curr = await handlersList[i](interceptedRequest);
      requestHandled = requestHandled || curr;
    }
    if (!requestHandled) {
      interceptedRequest.continue();
    }
  });
}

/**
 * Return metrics based on handler
 *
 * @param {?Object} handlerOptions
 * @param {Puppeteer.page} page
 * @return {!Promise<!Object>}
 */
async function addHandlerMetric(handlerOptions, page) {
  switch (handlerOptions.handlerName) {
    case 'adsHandler':
    case 'analyticsHandler':
      return getAnalyticsMetrics(handlerOptions);
    case 'defaultHandler':
    default:
      return readMetrics(page);
  }
}

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
 * @param {!Object} config
 * @return {Promise}
 */
async function measureDocument(url, version, config) {
  const browser = await puppeteer.launch({
    headless: config.headless,
    devtools: config.devtools,
    args: [
      '--allow-file-access-from-files',
      '--enable-blink-features=LayoutInstabilityAPI',
      '--disable-web-security',
    ],
  });

  const page = await browser.newPage();
  const handlerOptionsForUrl = {...config.urlToHandlers[url]};
  const handlersList = [];
  const {timeoutPromise, resolve} = setupDelayBasedOnHandlerOptions(
    handlerOptionsForUrl
  );
  await page.setCacheEnabled(false);
  await page.setRequestInterception(true);
  setupDefaultHandlers(handlersList, version);
  await setupAdditionalHandlers(
    handlersList,
    handlerOptionsForUrl,
    page,
    resolve,
    version
  );
  startRequestListener(handlersList, page);
  try {
    await page.goto(`file:${urlToCachePath(url, version)}`, {
      waitUntil: 'networkidle0',
    });
  } catch {
    // site did not load
    await browser.close();
    return;
  }

  await timeoutPromise;
  const metrics = await addHandlerMetric(handlerOptionsForUrl, page);
  writeMetrics(url, version, metrics);
  await browser.close();
}

/**
 * Loads cached local copies of the URLs in Chrome with Puppeteer and
 * runs a script on the page to collect performance metrics. Saves
 * performance metrics to results.json in this directory.
 *
 * @param {!Array<string>} urls
 * @param {!Object} config
 * @return {Promise} Fulfills when all URLs have been measured
 */
async function measureDocuments(urls, config) {
  requirePuppeteer_();

  try {
    fs.unlinkSync(RESULTS_PATH);
  } catch {} // file does not exist (first run)

  // Make an array of tasks to be executed
  const tasks = urls.flatMap((url) =>
    Array.from({length: config.runs}).flatMap(() => [
      measureDocument.bind(null, url, CONTROL, config),
      measureDocument.bind(null, url, EXPERIMENT, config),
    ])
  );

  const startTime = Date.now();
  function timeLeft() {
    const elapsed = (Date.now() - startTime) / 1000;
    const secondsPerTask = elapsed / i;
    return Math.floor(secondsPerTask * (tasks.length - i));
  }

  log(
    green('Taking performance measurements'),
    cyan(tasks.length),
    green('times...')
  );

  // Excecute the tasks serially
  let i = 0;
  for (const task of tasks) {
    if (!argv.quiet) {
      log(`Progress: ${i++}/${tasks.length}. ${timeLeft()} seconds left.`);
    } else {
      process.stdout.write('.');
    }
    await task();
  }
}

module.exports = measureDocuments;
