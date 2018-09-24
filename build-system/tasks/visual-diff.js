/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const BBPromise = require('bluebird');
const colors = require('ansi-colors');
const fancyLog = require('fancy-log');
const fs = require('fs');
const gulp = require('gulp-help')(require('gulp'));
const JSON5 = require('json5');
const path = require('path');
const puppeteer = require('puppeteer');
const request = BBPromise.promisify(require('request'));
const sleep = require('sleep-promise');
const tryConnect = require('try-net-connect');
const {execScriptAsync} = require('../exec');
const {FileSystemAssetLoader, Percy} = require('@percy/puppeteer');
const {gitBranchName, gitCommitterEmail} = require('../git');

// CSS widths: iPhone: 375, Pixel: 411, Desktop: 1400.
const DEFAULT_SNAPSHOT_OPTIONS = {widths: [375, 411, 1400]};
const SNAPSHOT_EMPTY_BUILD_OPTIONS = {widths: [375]};
const VIEWPORT_WIDTH = 1400;
const VIEWPORT_HEIGHT = 100000;
const HOST = 'localhost';
const PORT = 8000;
const BASE_URL = `http://${HOST}:${PORT}`;
const WEBSERVER_TIMEOUT_RETRIES = 10;
const NAVIGATE_TIMEOUT_MS = 3000;
const CSS_SELECTOR_RETRY_MS = 100;
const CSS_SELECTOR_RETRY_ATTEMPTS = 50;
const CSS_SELECTOR_TIMEOUT_MS =
    CSS_SELECTOR_RETRY_MS * CSS_SELECTOR_RETRY_ATTEMPTS;
const BUILD_STATUS_URL = 'https://amphtml-percy-status-checker.appspot.com/status';
const BUILD_PROCESSING_POLLING_INTERVAL_MS = 5 * 1000; // Poll every 5 seconds
const BUILD_PROCESSING_TIMEOUT_MS = 15 * 1000; // Wait for up to 10 minutes
const MASTER_BRANCHES_REGEXP = /^(?:master|release|canary|amp-release-.*)$/;
const PERCY_BUILD_URL = 'https://percy.io/ampproject/amphtml/builds';

const WRAP_IN_IFRAME_SCRIPT = fs.readFileSync(
    path.resolve(__dirname, 'visual-diff-wrapper.snippet.js'), 'utf8');

const preVisualDiffTasks =
    (argv.nobuild || argv.verify_status) ? [] : ['build'];

/**
 * Logs a message to the console.
 *
 * @param {string} mode
 * @param {!Array<string>} messages
 */
function log(mode, ...messages) {
  switch (mode) {
    case 'verbose':
      if (process.env.TRAVIS) {
        return;
      }
      messages.unshift(colors.green('VERBOSE:'));
      break;
    case 'info':
      messages.unshift(colors.green('INFO:'));
      break;
    case 'warning':
      messages.unshift(colors.yellow('WARNING:'));
      break;
    case 'error':
      messages.unshift(colors.red('ERROR:'));
      break;
    case 'fatal':
      messages.unshift(colors.red('FATAL:'));
      break;
    case 'travis':
      if (process.env['TRAVIS']) {
        messages.forEach(message => process.stdout.write(message));
      }
      return;
  }
  // eslint-disable-next-line amphtml-internal/no-spread
  fancyLog(...messages);
  if (mode == 'fatal') {
    process.exit(1);
  }
}

/**
 * Override PERCY_* environment variables if passed via gulp task parameters.
 */
function maybeOverridePercyEnvironmentVariables() {
  ['percy_project', 'percy_token', 'percy_branch'].forEach(variable => {
    if (variable in argv) {
      process.env[variable.toUpperCase()] = argv[variable];
    }
  });
}

/**
 * Disambiguates branch names by decorating them with the commit author name.
 * We do this for all non-push builds in order to prevent them from being used
 * as baselines for future builds.
 */
function setPercyBranch() {
  if (!process.env['PERCY_BRANCH'] &&
      (!argv.master || !process.env['TRAVIS'])) {
    const userName = gitCommitterEmail();
    const branchName = process.env['TRAVIS'] ?
      process.env['TRAVIS_PULL_REQUEST_BRANCH'] : gitBranchName();
    process.env['PERCY_BRANCH'] = userName + '-' + branchName;
  }
}

/**
 * Launches a background AMP webserver for unminified js using gulp.
 *
 * Waits until the server is up and reachable, and ties its lifecycle to this
 * process's lifecycle.
 *
 * @return {!Promise} a Promise that resolves when the web server is launched
 *     and reachable.
 */
async function launchWebServer() {
  const gulpServeAsync = execScriptAsync(
      `gulp serve --host ${HOST} --port ${PORT} ${process.env.WEBSERVER_QUIET}`,
      {
        stdio: argv.webserver_debug ?
          ['ignore', process.stdout, process.stderr] :
          'ignore',
      });

  gulpServeAsync.on('close', code => {
    code = code || 0;
    if (code != 0) {
      log('error', colors.cyan("'serve'"),
          `errored with code ${code}. Cannot continue with visual diff tests`);
      process.exit(code);
    }
  });

  process.on('exit', async() => {
    await shutdown(gulpServeAsync);
  });

  let resolver, rejecter;
  const deferred = new Promise((resolverIn, rejecterIn) => {
    resolver = resolverIn;
    rejecter = rejecterIn;
  });
  tryConnect({
    host: HOST,
    port: PORT,
    retries: WEBSERVER_TIMEOUT_RETRIES, // retry timeout defaults to 1 sec
  }).on('connected', () => {
    return resolver(gulpServeAsync);
  }).on('timeout', rejecter);
  return deferred;
}

/**
 * Kill the webserver process and this own process.
 *
 * @param {!ChildProcess} webServerProcess the webserver process to shut down.
 */
async function shutdown(webServerProcess) {
  if (!webServerProcess.killed) {
    // Explicitly exit the webserver.
    webServerProcess.kill();
    // The child node process has an asynchronous stdout. See #10409.
    await sleep(100);
  }
  // TODO(rsimha): clean up this exit.
  process.exit();
}

/**
 * Checks the current status of a Percy build.
 *
 * @param {string} buildId ID of the ongoing Percy build.
 * @return {!JsonObject} The full response from the build status server.
 */
async function getBuildStatus(buildId) {
  const statusUri = `${BUILD_STATUS_URL}?build_id=${buildId}`;
  const {body} = await request(statusUri, {json: true}).catch(error => {
    log('fatal', 'Failed to query Percy build status:', error);
  });
  return body;
}

/**
 * Waits for Percy to finish processing a build.
 * @param {string} buildId ID of the ongoing Percy build.
 * @return {!JsonObject} The eventual status of the Percy build.
 */
async function waitForBuildCompletion(buildId) {
  log('info', 'Waiting for Percy build', colors.cyan(buildId),
      'to be processed...');
  const startTime = Date.now();
  let status = await getBuildStatus(buildId);
  while (status.state != 'finished' && status.state != 'failed' &&
             Date.now() - startTime < BUILD_PROCESSING_TIMEOUT_MS) {
    await sleep(BUILD_PROCESSING_POLLING_INTERVAL_MS);
    status = await getBuildStatus(buildId);
  }
  return status;
}

/**
 * Verifies that a Percy build succeeded and didn't contain any visual diffs.
 * @param {!JsonObject} status The eventual status of the Percy build.
 * @param {string} buildId ID of the Percy build.
 */
function verifyBuildStatus(status, buildId) {
  switch (status.state) {
    case 'finished':
      if (status.total_comparisons_diff > 0) {
        if (MASTER_BRANCHES_REGEXP.test(status.branch)) {
          // If there are visual diffs on master or a release branch, fail
          // Travis. For master, print instructions for how to approve new
          // visual changes.
          if (status.branch == 'master') {
            log('error', 'Found visual diffs. If the changes are intentional,',
                'you must approve the build at',
                colors.cyan(`${PERCY_BUILD_URL}/${buildId}`),
                'in order to update the baseline snapshots.');
          } else {
            log('error', `Found visual diffs on branch ${status.branch}`);
          }
        } else {
          // For PR branches, just print a warning since the diff may be into
          // intentional, with instructions for how to approve the new snapshots
          // so they are used as the baseline for future visual diff builds.
          log('warning', 'Percy build', colors.cyan(buildId),
              'contains visual diffs.');
          log('warning', 'If they are intentional, you must first approve the',
              'build at', colors.cyan(`${PERCY_BUILD_URL}/${buildId}`),
              'to allow your PR to be merged.');
        }
      } else {
        log('info', 'Percy build', colors.cyan(buildId),
            'contains no visual diffs.');
      }
      break;

    case 'pending':
    case 'processing':
      log('error', 'Percy build not processed after',
          `${BUILD_PROCESSING_TIMEOUT_MS}ms`);
      break;

    case 'failed':
    default:
      log('error', `Percy build failed: ${status.failure_reason}`);
      break;
  }
}

/**
 * Launches a Puppeteer controlled browser and returns a page handle.
 *
 * Waits until the browser is up and reachable, and ties its lifecycle to this
 * process's lifecycle.
 *
 * @return {!puppeteer.Page} a Puppeteer control browser tab/page.
 */
async function launchBrowser() {
  const browserOptions = {
    args: ['--no-sandbox', '--disable-extensions'],
    dumpio: argv.chrome_debug,
  };
  browserOptions.headless = !!argv.headless;
  if (argv.headless) {
    browserOptions['args'].push('--disable-gpu');
  }

  const browser = await puppeteer.launch(browserOptions);
  process.on('exit', browser.close);

  const page = await browser.newPage();
  await page.setViewport({
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
  });
  page.setDefaultNavigationTimeout(NAVIGATE_TIMEOUT_MS);
  await page.setJavaScriptEnabled(true);

  return page;
}

/**
 * Runs the visual tests.
 *
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 * @param {!JsonObject} visualTestsConfig JSON object containing the config for
 *     the visual tests.
 */
async function runVisualTests(page, visualTestsConfig) {
  // Create a Percy client and start a build.
  const percy = createPercyPuppeteerController(
      visualTestsConfig.assets_dir, visualTestsConfig.assets_base_url);
  await percy.startBuild();
  const {buildId} = percy;
  fs.writeFileSync('PERCY_BUILD_ID', buildId);
  log('info', 'Started Percy build', colors.cyan(buildId));

  // Take the snapshots.
  await generateSnapshots(percy, page, visualTestsConfig.webpages);

  // Tell Percy we're finished taking snapshots and check if the build failed
  // early.
  await percy.finalizeBuild();
  const status = await getBuildStatus(buildId);
  if (status.state == 'failed') {
    log('fatal', 'Build', colors.cyan(buildId), 'failed!');
  } else {
    log('info', 'Build', colors.cyan(buildId),
        'is now being processed by Percy.');
  }
}

/**
 * Create a new Percy-Puppeteer controller and return it.
 *
 * @param {string} assetsDir path to the assets dir.
 * @param {string} assetsBaseUrl the base URL for served assets.
 * @return {!Percy} a Percy-Puppeteer controller.
 */
function createPercyPuppeteerController(assetsDir, assetsBaseUrl) {
  if (!argv.percy_disabled) {
    const buildDir = '../../' + assetsDir;
    return new Percy({
      loaders: [
        new FileSystemAssetLoader({
          buildDir: path.resolve(__dirname, buildDir),
          mountPath: assetsBaseUrl,
        }),
      ],
    });
  } else {
    return {
      startBuild: () => {},
      snapshot: () => {},
      finalizeBuild: () => {},
      buildId: '[PERCY_DISABLED]',
    };
  }
}

/**
 * Sets the AMP config, launches a server, and generates Percy snapshots for a
 * set of given webpages.
 *
 * @param {!Percy} percy a Percy-Puppeteer controller.
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 * @param {!Array<JsonObject>} webpages an array of JSON objects containing
 *     details about the pages to snapshot.
 */
async function generateSnapshots(percy, page, webpages) {
  if (argv.master) {
    await page.goto(`${BASE_URL}/examples/visual-tests/blank-page/blank.html`);
    await percy.snapshot('Blank page', page, SNAPSHOT_EMPTY_BUILD_OPTIONS);
  }

  const numUnfilteredTests = webpages.length;
  webpages = webpages.filter(webpage => !webpage.flaky);
  if (numUnfilteredTests != webpages.length) {
    log('info', 'Skipping', colors.cyan(numUnfilteredTests - webpages.length),
        'flaky tests');
  }
  if (argv.grep) {
    webpages = webpages.filter(webpage => argv.grep.test(webpage.name));
    log('info', colors.cyan(`--grep ${argv.grep}`), 'matched',
        colors.cyan(webpages.length), 'tests');
  }

  if (!webpages.length) {
    log('fatal', 'No tests left to run!');
    return;
  } else {
    log('info', 'Executing', colors.cyan(webpages.length), 'visual diff tests');
  }

  log('verbose', 'Generating snapshots...');
  await snapshotWebpages(percy, page, webpages);
}

/**
 * Generates Percy snapshots for a set of given webpages.
 *
 * @param {!Percy} percy a Percy-Puppeteer controller.
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 * @param {!JsonObject} webpages a JSON objects containing details about the
 *     pages to snapshot.
 */
async function snapshotWebpages(percy, page, webpages) {
  for (const webpage of webpages) {
    const {name, url, viewport} = webpage;
    log('verbose', 'Visual diff test', colors.yellow(name));

    await enableExperiments(page, webpage['experiments']);

    const snapshotOptions = Object.assign({}, DEFAULT_SNAPSHOT_OPTIONS);

    if (viewport) {
      snapshotOptions.widths = [viewport.width];
      log('verbose', 'Setting explicit viewport size of',
          colors.yellow(`${viewport.width}×${viewport.height}`));
      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
      });
    }
    log('verbose', 'Navigating to page', colors.yellow(`${BASE_URL}/${url}`));
    // Puppeteer is flaky when it comes to catching navigation requests, so
    // ignore timeouts. If this was a real non-loading page, this will be caught
    // in the resulting Percy build. Navigate to an empty page first to support
    // different webpages that only modify the #anchor name.
    await page.goto('about:blank');
    await page.goto(`${BASE_URL}/${url}`).catch(() => {});

    // Try to wait until there are no more network requests. This method is
    // flaky since Puppeteer doesn't always understand Chrome's network
    // activity, so ignore timeouts.
    await page.waitForNavigation({waitUntil: 'networkidle0'}).catch(() => {});

    await verifyCssElements(page, url, webpage.forbidden_css,
        webpage.loading_incomplete_css, webpage.loading_complete_css);

    if (webpage.loading_complete_delay_ms) {
      log('verbose', 'Waiting',
          colors.cyan(`${webpage.loading_complete_delay_ms}ms`),
          'for loading to complete');
      await sleep(webpage.loading_complete_delay_ms);
    }

    if (webpage.enable_percy_javascript) {
      snapshotOptions.enableJavaScript = true;
      // Remove all scripts that have an external source, leaving only those
      // scripts that are inlined in the page inside a <script> tag.
      await page.evaluate(
          'document.head.querySelectorAll("script[src]").forEach(' +
          'node => node./*OK*/remove())');
    }

    if (viewport) {
      log('verbose', 'Wrapping viewport-constrained page in an iframe');
      await page.evaluate(WRAP_IN_IFRAME_SCRIPT
          .replace(/__WIDTH__/g, viewport.width)
          .replace(/__HEIGHT__/g, viewport.height));
      await page.setViewport({
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
      });
    }

    await percy.snapshot(name, page, snapshotOptions);
    await clearExperiments(page);
    log('travis', colors.cyan('●'));
  }
  log('travis', '\n');
}

/**
 * Verifies that all CSS elements are as expected before taking a snapshot.
 *
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 * @param {string} url URL to be snapshotted.
 * @param {!Array<string>} forbiddenCss Array of CSS elements that must not be
 *     found in the page.
 * @param {!Array<string>} loadingIncompleteCss Array of CSS elements that must
 *     eventually be removed from the page.
 * @param {!Array<string>} loadingCompleteCss Array of CSS elements that must
 *     eventually appear on the page.
 */
async function verifyCssElements(page, url, forbiddenCss, loadingIncompleteCss,
  loadingCompleteCss) {
  // Begin by waiting for all loader dots to disappear.
  await waitForLoaderDot(page, url);

  if (forbiddenCss) {
    for (const css of forbiddenCss) {
      if ((await page.$(css)) !== null) {
        log('fatal', colors.cyan(url), '| The forbidden CSS element',
            colors.cyan(css), 'exists in the page');
      }
    }
  }

  if (loadingIncompleteCss) {
    log('verbose', 'Waiting for invisibility of all:',
        colors.cyan(loadingIncompleteCss.join(', ')));
    for (const css of loadingIncompleteCss) {
      if (!(await waitForElementVisibility(page, css, {hidden: true}))) {
        log('fatal', colors.cyan(url), '| An element with the CSS selector',
            colors.cyan(css),
            `is still visible after ${CSS_SELECTOR_TIMEOUT_MS} ms`);
      }
    }
  }

  if (loadingCompleteCss) {
    log('verbose', 'Waiting for existence of all:',
        colors.cyan(loadingCompleteCss.join(', ')));
    for (const css of loadingCompleteCss) {
      if (!(await waitForSelectorExistence(page, css))) {
        log('fatal', colors.cyan(url), '| The CSS selector', colors.cyan(css),
            'does not match any elements in the page');
      }
    }

    log('verbose', 'Waiting for visibility of all:',
        colors.cyan(loadingCompleteCss.join(', ')));
    for (const css of loadingCompleteCss) {
      if (!(await waitForElementVisibility(page, css, {visible: true}))) {
        log('fatal', colors.cyan(url), '| An element with the CSS selector',
            colors.cyan(css),
            `is still invisible after ${CSS_SELECTOR_TIMEOUT_MS} ms`);
      }
    }
  }
}

/**
 * Wait for all AMP loader dot to disappear.
 *
 * @param {!puppeteer.Page} page page to wait on.
 * @param {string} url URL being snapshotted.
 */
async function waitForLoaderDot(page, url) {
  // Wait for loader dot to be hidden.
  await waitForElementVisibility(
      page, '.i-amphtml-loader-dot', {hidden: true}).catch(() => {
    log('fatal', colors.cyan(url),
        `still has the AMP loader dot after ${CSS_SELECTOR_TIMEOUT_MS} ms`);
  });
}

/**
 * Wait until the element is either hidden or visible or until timed out.
 *
 * @param {!puppeteer.Page} page page to check the visibility of elements in.
 * @param {string} selector CSS selector for elements to wait on.
 * @param {!Object} options with key 'visible' OR 'hidden' set to true.
 * @return {boolean} true if the expectation is met before the timeout.
 */
async function waitForElementVisibility(page, selector, options) {
  const waitForVisible = Boolean(options['visible']);
  const waitForHidden = Boolean(options['hidden']);
  if (waitForVisible == waitForHidden) {
    log('fatal', 'waitForElementVisibility must be called with exactly one of',
        "'visible' or 'hidden' set to true.");
  }

  let attempt = 0;
  do {
    const elementsAreVisible = [];

    for (const elementHandle of await page.$$(selector)) {
      const boundingBox = await elementHandle.boundingBox();
      const elementIsVisible = boundingBox != null && boundingBox.height > 0 &&
          boundingBox.width > 0;
      elementsAreVisible.push(elementIsVisible);
    }

    if (elementsAreVisible.length) {
      log('verbose', 'Found', colors.cyan(elementsAreVisible.length),
          'element(s) matching the CSS selector', colors.cyan(selector));
      log('verbose', 'Expecting all element visibilities to be',
          colors.cyan(waitForVisible), '; they are',
          colors.cyan(elementsAreVisible));
    } else {
      log('verbose', 'No', colors.cyan(selector), 'matches found');
    }
    // Since we assert that waitForVisible == !waitForHidden, there is no need
    // to check equality to both waitForVisible and waitForHidden.
    if (elementsAreVisible.every(
        elementIsVisible => elementIsVisible == waitForVisible)) {
      return true;
    }

    await sleep(CSS_SELECTOR_RETRY_MS);
    attempt++;
  } while (attempt < CSS_SELECTOR_RETRY_ATTEMPTS);
  return false;
}

/**
 * Wait until the CSS selector exists in the page or until timed out.
 *
 * @param {!puppeteer.Page} page page to check the existence of the selector in.
 * @param {string} selector CSS selector.
 * @return {boolean} true if the element exists before the timeout.
 */
async function waitForSelectorExistence(page, selector) {
  let attempt = 0;
  do {
    if ((await page.$(selector)) !== null) {
      return true;
    }
    await sleep(CSS_SELECTOR_RETRY_MS);
    attempt++;
  } while (attempt < CSS_SELECTOR_RETRY_ATTEMPTS);
  return false;
}

/**
 * Enables the given AMP experiments.
 *
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 * @param {!Array<string>} experiments List of experiments to enable.
 */
async function enableExperiments(page, experiments) {
  if (experiments) {
    log('verbose', 'Setting AMP experiments',
        colors.cyan(experiments.join(', ')));
    await page.setCookie({
      name: 'AMP_EXP',
      value: experiments.join('%2C'),
      domain: HOST,
    });
  }
}

/**
 * Clears all AMP experiment cookies.
 *
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 */
async function clearExperiments(page) {
  await page.deleteCookie({name: 'AMP_EXP', domain: HOST});
}

/**
 * Enables debugging if requested via command line.
 */
function setDebuggingLevel() {
  process.env.WEBSERVER_QUIET = '--quiet';

  if (argv.debug) {
    argv['chrome_debug'] = true;
    argv['webserver_debug'] = true;
  }
  if (argv.webserver_debug) {
    process.env.WEBSERVER_QUIET = '';
  }
}

/**
 * Creates a Percy build with only a blank page for comparison.
 *
 * Enables us to require percy checks on GitHub, and yet, not have to do a full
 * build for every PR.
 *
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 */
async function createEmptyBuild(page) {
  log('info', 'Skipping visual diff tests and generating a blank Percy build');
  const blankAssetsDir = '../../examples/visual-tests/blank-page';
  const percy = new Percy({
    loaders: [
      new FileSystemAssetLoader({
        buildDir: path.resolve(__dirname, blankAssetsDir),
        mountPath: '',
      }),
    ],
  });
  await percy.startBuild();
  await page.goto(`${BASE_URL}/examples/visual-tests/blank-page/blank.html`);
  await percy.snapshot('Blank page', page, SNAPSHOT_EMPTY_BUILD_OPTIONS);
  await percy.finalizeBuild();
}

/**
 * Runs the AMP visual diff tests.
 */
async function visualDiff() {
  maybeOverridePercyEnvironmentVariables();
  setPercyBranch();

  if (argv.grep) {
    argv.grep = RegExp(argv.grep);
  }

  if (argv.verify_status) {
    const buildId = fs.readFileSync('PERCY_BUILD_ID', 'utf8');
    const status = await waitForBuildCompletion(buildId);
    verifyBuildStatus(status, buildId);
    return;
  }

  if (!argv.percy_disabled &&
      (!process.env.PERCY_PROJECT || !process.env.PERCY_TOKEN)) {
    log('fatal', 'Could not find', colors.cyan('PERCY_PROJECT'), 'and',
        colors.cyan('PERCY_TOKEN'), 'environment variables');
  }
  setDebuggingLevel();

  // Launch a browser and local web server.
  const page = await launchBrowser();
  const webServerProcess = await launchWebServer().catch(reason => {
    log('fatal', `Failed to start a web server: ${reason}`);
  });

  if (argv.skip) {
    await createEmptyBuild(page);
    await shutdown(webServerProcess);
    return;
  }

  // Load and parse the config. Use JSON5 due to JSON comments in file.
  const visualTestsConfig = JSON5.parse(
      fs.readFileSync(
          path.resolve(__dirname, '../../test/visual-diff/visual-tests'),
          'utf8'));
  await runVisualTests(page, visualTestsConfig);

  await shutdown(webServerProcess);
}

gulp.task(
    'visual-diff',
    'Runs the AMP visual diff tests.',
    preVisualDiffTasks,
    visualDiff,
    {
      options: {
        'master': '  Includes a blank snapshot (baseline for skipped builds)',
        'verify_status':
          '  Verifies the status of the build ID in ./PERCY_BUILD_ID',
        'skip': '  Creates a dummy Percy build with only a blank snapshot',
        'headless': '  Runs Chrome in headless mode',
        'chrome_debug': '  Prints debug info from Chrome',
        'webserver_debug': '  Prints debug info from the local gulp webserver',
        'debug': '  Prints all the above debug info',
        'grep': '  Runs tests that match the pattern',
        'percy_project': '  Override the PERCY_PROJECT environment variable',
        'percy_token': '  Override the PERCY_TOKEN environment variable',
        'percy_branch': '  Override the PERCY_BRANCH environment variable',
        'percy_disabled':
          '  Disables Percy integration (for testing local changes only)',
        'nobuild': '  Skip build',
      },
    }
);
