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
const {execOrDie, execScriptAsync} = require('../exec');
const {FileSystemAssetLoader, Percy} = require('@percy/puppeteer');
const {gitBranchName, gitCommitterEmail} = require('../git');

// CSS widths: iPhone: 375, Pixel: 411, Desktop: 1400.
const SNAPSHOT_OPTIONS = {widths: [375, 411, 1400]};
const SNAPSHOT_EMPTY_BUILD_OPTIONS = {widths: [375]};
const VIEWPORT_WIDTH = 1400;
const VIEWPORT_HEIGHT = 100000;
const HOST = 'localhost';
const PORT = 8000;
const BASE_URL = `http://${HOST}:${PORT}`;
const WEBSERVER_TIMEOUT_RETRIES = 10;
const NAVIGATE_TIMEOUT_MS = 12000;
const CONFIGS = ['canary', 'prod'];
const CSS_SELECTOR_TIMEOUT_MS = 5000;
const AMP_RUNTIME_TARGET_FILES = [
  'dist/amp.js', 'dist.3p/current/integration.js'];
const BUILD_STATUS_URL = 'https://amphtml-percy-status-checker.appspot.com/status';
const BUILD_PROCESSING_POLLING_INTERVAL_MS = 5 * 1000; // Poll every 5 seconds
const BUILD_PROCESSING_TIMEOUT_MS = 15 * 1000; // Wait for up to 10 minutes
const MASTER_BRANCHES_REGEXP = /^(?:master|release|canary|amp-release-.*)$/;
const PERCY_BUILD_URL = 'https://percy.io/ampproject/amphtml/builds';

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
      messages.unshift(colors.yellow('YELLOW:'));
      break;
    case 'error':
      messages.unshift(colors.red('ERROR:'));
      break;
    case 'fatal':
      messages.unshift(colors.red('FATAL:'));
  }
  // eslint-disable-next-line amphtml-internal/no-spread
  fancyLog(...messages);
  if (mode == 'fatal') {
    process.exit(1);
  }
}

/**
 * Disambiguates branch names by decorating them with the commit author name.
 * We do this for all non-push builds in order to prevent them from being used
 * as baselines for future builds.
 */
function setPercyBranch() {
  if (!argv.master || !process.env['TRAVIS']) {
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
      {stdio: 'inherit'});

  gulpServeAsync.on('exit', code => {
    if (code != 0) {
      log('error', colors.cyan("'serve'"),
          `errored with code ${code}. Cannot continue with visual diff tests`);
      process.exit(code);
    }
  });

  process.on('exit', async() => {
    if (gulpServeAsync.exitCode == null) {
      gulpServeAsync.kill();
      // The child node process has an asynchronous stdout. See #10409.
      await sleep(100);
    }
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
  }).on('connected', resolver).on('timeout', rejecter);
  return deferred;
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
  page.setJavaScriptEnabled(true);

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
  const buildDir = '../../' + visualTestsConfig.assets_dir;
  const percy = new Percy({
    loaders: [
      new FileSystemAssetLoader({
        buildDir: path.resolve(__dirname, buildDir),
        mountPath: visualTestsConfig.assets_base_url,
      }),
    ],
  });
  await percy.startBuild();
  const {buildId} = percy;
  fs.writeFileSync('PERCY_BUILD_ID', buildId);
  log('info', 'Started Percy build', colors.cyan(buildId));

  // Take the snapshots.
  await generateSnapshots(percy, page, visualTestsConfig.webpages);

  // Tell Percy we're finished taking snapshots.
  await percy.finalizeBuild();
  // TODO(danielrozenberg): inspect result to check if the build failed fast
  log('info', 'Build', colors.cyan(buildId),
      'is now being processed by Percy.');
}

/**
 * Cleans up any existing AMP config from the runtime and 3p frame.
 */
function cleanupAmpConfig() {
  log('verbose', 'Cleaning up existing AMP config');
  AMP_RUNTIME_TARGET_FILES.forEach(targetFile => {
    execOrDie(
        `gulp prepend-global --local_dev --target ${targetFile} --remove`);
  });
}

/**
 * Applies the AMP config to the runtime and 3p frame.
 *
 * @param {string} config Config to apply. One of 'canary' or 'prod'.
 */
function applyAmpConfig(config) {
  log('verbose', 'Switching to the', colors.cyan(config), 'AMP config');
  AMP_RUNTIME_TARGET_FILES.forEach(targetFile => {
    execOrDie(
        `gulp prepend-global --local_dev --target ${targetFile} ` +
        `--${config}`);
  });
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
    await percy.snapshot('Blank page', page, SNAPSHOT_EMPTY_BUILD_OPTIONS);
  }
  cleanupAmpConfig();

  const numFlakyTests = webpages.filter(webpage => webpage.flaky).length;
  if (numFlakyTests > 0) {
    log('info', 'Skipping', colors.cyan(numFlakyTests), 'flaky tests');
  }
  for (const config of CONFIGS) {
    applyAmpConfig(config);
    log('verbose',
        'Generating snapshots using the', colors.cyan(config), 'AMP config');
    await snapshotWebpages(percy, page, webpages, config);
  }
}

/**
 * Generates Percy snapshots for a set of given webpages.
 *
 * @param {!Percy} percy a Percy-Puppeteer controller.
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 * @param {!JsonObject} webpages a JSON objects containing details about the
 *     pages to snapshot.
 * @param {*} config Config being used. One of 'canary' or 'prod'.
 */
async function snapshotWebpages(percy, page, webpages, config) {
  webpages = webpages.filter(webpage => (!webpage.flaky &&
        !webpage.url.startsWith('examples/visual-tests/amp-by-example')));
  for (const webpage of webpages) {
    const {url} = webpage;
    const name = `${webpage.name} (${config})`;

    await enableExperiments(page, webpage['experiments']);
    log('verbose', 'Navigating to page', colors.yellow(`${BASE_URL}/${url}`));
    await page.goto(`${BASE_URL}/${url}`);

    await verifyCssElements(page, url, webpage.forbidden_css,
        webpage.loading_incomplete_css, webpage.loading_complete_css);
    await percy.snapshot(name, page, SNAPSHOT_OPTIONS);
    await clearExperiments(page);
  }
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
  // Wait for loader dot to be hidden.
  await page.waitForSelector('.i-amphtml-loader-dot', {
    hidden: true,
    timeout: CSS_SELECTOR_TIMEOUT_MS,
  }).catch(() => {
    log('fatal', colors.cyan(url),
        `still has the AMP loader dot after ${CSS_SELECTOR_TIMEOUT_MS} ms`);
  });

  if (forbiddenCss) {
    for (const css of forbiddenCss) {
      if (await page.$(css) !== null) {
        log('fatal', colors.cyan(url), 'has forbidden CSS element',
            colors.cyan(css));
      }
    }
  }

  if (loadingIncompleteCss) {
    for (const css of loadingIncompleteCss) {
      log('verbose', `Waiting for invisibility of ${css}`);
      await page.waitForSelector(css, {
        hidden: true,
        timeout: CSS_SELECTOR_TIMEOUT_MS,
      }).catch(() => {
        log('fatal', colors.cyan(url), 'still has CSS element',
            colors.cyan(css), `after ${CSS_SELECTOR_TIMEOUT_MS} ms`);
      });
    }
  }

  if (loadingCompleteCss) {
    for (const css of loadingCompleteCss) {
      log('verbose', 'Waiting for visibility of', css);
      await page.waitForSelector(css, {
        visible: true,
        timeout: CSS_SELECTOR_TIMEOUT_MS,
      }).catch(() => {
        log('fatal', colors.cyan(url), 'does not yet have CSS element',
            colors.cyan(css), `after ${CSS_SELECTOR_TIMEOUT_MS} ms`);
      });
    }
  }
}

/**
 * Enables the given AMP experiments.
 *
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 * @param {*} experiments List of experiments to enable.
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
    // eslint-disable-next-line google-camelcase/google-camelcase
    argv.chrome_debug = true;
    process.env.WEBSERVER_QUIET = '';
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
 * Simple wrapper around the JS (Percy-Puppeteer) based visual diff tests.
 */
async function visualDiffPuppeteer() {
  if (argv.verify) {
    const buildId = fs.readFileSync('PERCY_BUILD_ID', 'utf8');
    const status = await waitForBuildCompletion(buildId);
    verifyBuildStatus(status, buildId);
    return;
  }

  if (!process.env.PERCY_PROJECT || !process.env.PERCY_TOKEN) {
    log('fatal', 'Could not find', colors.cyan('PERCY_PROJECT'), 'and',
        colors.cyan('PERCY_TOKEN'), 'environment variables');
  }
  setDebuggingLevel();

  // Launch a browser and local web server.
  const page = await launchBrowser();
  await launchWebServer().catch(reason => {
    log('fatal', `Failed to start a web server: ${reason}`);
  });

  if (argv.skip) {
    await createEmptyBuild(page);
    // Explicitly exit, to trigger the webserver's exit event too.
    process.exit();
    return;
  }

  // Load and parse the config. Use JSON5 due to JSON comments in file.
  const visualTestsConfig = JSON5.parse(
      fs.readFileSync(
          path.resolve(__dirname, '../../test/visual-diff/visual-tests'),
          'utf8'));
  await runVisualTests(page, visualTestsConfig);

  // Explicitly exit, to trigger the webserver's exit event too.
  process.exit();
}

/**
 * Simple wrapper around the ruby (Percy-Capybara) based visual diff tests.
 *
 * This is the current default mode, which is actively being replaced with a
 * pure JS implementation.
 */
function visualDiffCapybara() {
  let cmd = 'ruby build-system/tasks/visual-diff.rb';
  for (const arg in argv) {
    if (arg !== '_') {
      cmd = cmd + ' --' + arg;
    }
  }
  execOrDie(cmd);
}

/**
 * Runs the AMP visual diff tests.
 */
async function visualDiff() {
  setPercyBranch();

  if (argv.puppeteer) {
    await visualDiffPuppeteer();
  } else {
    visualDiffCapybara();
  }
}

gulp.task(
    'visual-diff',
    'Runs the AMP visual diff tests.',
    visualDiff,
    {
      options: {
        'master': '  Includes a blank snapshot (baseline for skipped builds)',
        'verify': '  Verifies the status of the build ID in ./PERCY_BUILD_ID',
        'skip': '  Creates a dummy Percy build with only a blank snapshot',
        'headless': '  Runs Chrome in headless mode',
        'percy_debug': '  Prints debug info from Percy-Capybara libraries',
        'chrome_debug': '  Prints debug info from Chrome',
        'webserver_debug': '  Prints debug info from the local gulp webserver',
        'debug': '  Prints all the above debug info',
        'puppeteer': '  [EXPERIMENTAL] Use Percy-Puppeteer (work in progress)',
      },
    }
);
