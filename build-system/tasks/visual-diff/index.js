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
const fs = require('fs');
const gulp = require('gulp-help')(require('gulp'));
const JSON5 = require('json5');
const path = require('path');
const request = BBPromise.promisify(require('request'));
const sleep = require('sleep-promise');
const tryConnect = require('try-net-connect');
const {
  gitBranchName,
  gitCommitterEmail,
  gitTravisMasterBaseline,
  shortSha,
} = require('../../git');
const {
  log,
  waitForLoaderDots,
  verifySelectorsInvisible,
  verifySelectorsVisible,
} = require('./helpers');
const {execOrDie, execScriptAsync} = require('../../exec');
const {isTravisBuild} = require('../../travis');
const {PercyAssetsLoader} = require('./percy-assets-loader');

// optional dependencies for local development (outside of visual diff tests)
let puppeteer;
let Percy;

// CSS widths: iPhone: 375, Pixel: 411, Desktop: 1400.
const DEFAULT_SNAPSHOT_OPTIONS = {widths: [375, 411, 1400]};
const SNAPSHOT_EMPTY_BUILD_OPTIONS = {widths: [375]};
const VIEWPORT_WIDTH = 1400;
const VIEWPORT_HEIGHT = 100000;
const HOST = 'localhost';
const PORT = 8000;
const WEBSERVER_TIMEOUT_RETRIES = 10;
const NAVIGATE_TIMEOUT_MS = 3000;
const MAX_PARALLEL_TABS = 10;
const WAIT_FOR_TABS_MS = 1000;
const BUILD_STATUS_URL = 'https://amphtml-percy-status-checker.appspot.com/status';

const ROOT_DIR = path.resolve(__dirname, '../../../');

// Script snippets that execute inside the page.
const WRAP_IN_IFRAME_SNIPPET = fs.readFileSync(
    path.resolve(__dirname, 'snippets/iframe-wrapper.js'), 'utf8');
const REMOVE_AMP_SCRIPTS_SNIPPET = fs.readFileSync(
    path.resolve(__dirname, 'snippets/remove-amp-scripts.js'), 'utf8');
const FREEZE_FORM_VALUE_SNIPPET = fs.readFileSync(
    path.resolve(__dirname, 'snippets/freeze-form-values.js'), 'utf8');

let browser_;
let webServerProcess_;

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
      (!argv.master || !isTravisBuild())) {
    const userName = gitCommitterEmail();
    const branchName = gitBranchName();
    process.env['PERCY_BRANCH'] = userName + '-' + branchName;
  }
}

/**
 * Set the branching point's SHA to an env variable.
 *
 * This will let Percy determine which build to use as the baseline for this new
 * build.
 *
 * Only does something on Travis, and for non-master branches, since master
 * builds are always built on top of the previous commit (we use the squash and
 * merge method for pull requests.)
 */
function setPercyTargetCommit() {
  if (isTravisBuild() && !argv.master) {
    process.env['PERCY_TARGET_COMMIT'] = gitTravisMasterBaseline();
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
  webServerProcess_ = execScriptAsync(
      `gulp serve --host ${HOST} --port ${PORT} ${process.env.WEBSERVER_QUIET}`,
      {
        stdio: argv.webserver_debug ?
          ['ignore', process.stdout, process.stderr] :
          'ignore',
      });

  webServerProcess_.on('close', code => {
    code = code || 0;
    if (code != 0) {
      log('fatal', colors.cyan("'serve'"),
          `errored with code ${code}. Cannot continue with visual diff tests`);
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
  }).on('connected', () => {
    return resolver(webServerProcess_);
  }).on('timeout', rejecter);
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
  try {
    return (await request(statusUri, {json: true})).body;
  } catch (error) {
    log('fatal', 'Failed to query Percy build status:', error);
  }
}

/**
 * Launches a Puppeteer controlled browser.
 *
 * Waits until the browser is up and reachable, and ties its lifecycle to this
 * process's lifecycle.
 *
 * @return {!puppeteer.Browser} a Puppeteer controlled browser.
 */
async function launchBrowser() {
  const browserOptions = {
    args: ['--no-sandbox', '--disable-extensions', '--disable-gpu'],
    dumpio: argv.chrome_debug,
    headless: true,
  };

  try {
    browser_ = await puppeteer.launch(browserOptions);
  } catch (error) {
    log('fatal', error);
  }

  // Every action on the browser or its pages adds a listener to the
  // Puppeteer.Connection.Events.Disconnected event. This is a temporary
  // workaround for the Node runtime warning that is emitted once 11 listeners
  // are added to the same object.
  browser_._connection.setMaxListeners(9999);

  return browser_;
}

/**
 * Opens a new browser tab, resizes its viewport, and returns a Page handler.
 *
 * @param {!puppeteer.Browser} browser a Puppeteer controlled browser.
 * @param {JsonObject} viewport optional viewport size object with numeric
 *     fields `width` and `height`.
 */
async function newPage(browser, viewport = null) {
  const width = viewport ? viewport.width : VIEWPORT_WIDTH;
  const height = viewport ? viewport.height : VIEWPORT_HEIGHT;

  log('verbose', 'Creating new page with viewport size of',
      colors.yellow(`${width}×${height}`));

  const page = await browser.newPage();
  await page.setViewport({width, height});
  page.setDefaultNavigationTimeout(NAVIGATE_TIMEOUT_MS);
  await page.setJavaScriptEnabled(true);
  return page;
}

/**
 * Runs the visual tests.
 *
 * @param {!Array<string>} assetGlobs an array of glob strings to load assets
 *     from.
 * @param {!Array<JsonObject>} webpages an array of JSON objects containing
 *     details about the pages to snapshot.
 */
async function runVisualTests(assetGlobs, webpages) {
  // Create a Percy client and start a build.
  const percy = createPercyPuppeteerController(assetGlobs);
  await percy.startBuild();
  const {buildId} = percy;
  fs.writeFileSync('PERCY_BUILD_ID', buildId);
  log('info', 'Started Percy build', colors.cyan(buildId));
  if (process.env['PERCY_TARGET_COMMIT']) {
    log('info', 'The Percy build is baselined on top of commit',
        colors.cyan(shortSha(process.env['PERCY_TARGET_COMMIT'])));
  }

  try {
    // Take the snapshots.
    await generateSnapshots(percy, webpages);
  } finally {
    // Tell Percy we're finished taking snapshots.
    await percy.finalizeBuild();
  }

  // check if the build failed early.
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
 * @param {!Array<string>} assetGlobs an array of glob strings to load assets
 *     from.
 * @return {!Percy} a Percy-Puppeteer controller.
 */
function createPercyPuppeteerController(assetGlobs) {
  if (!argv.percy_disabled) {
    return new Percy({
      loaders: [new PercyAssetsLoader(assetGlobs, ROOT_DIR)],
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
 * @param {!Array<JsonObject>} webpages an array of JSON objects containing
 *     details about the pages to snapshot.
 */
async function generateSnapshots(percy, webpages) {
  const numUnfilteredPages = webpages.length;
  webpages = webpages.filter(webpage => !webpage.flaky);
  if (numUnfilteredPages != webpages.length) {
    log('info', 'Skipping', colors.cyan(numUnfilteredPages - webpages.length),
        'flaky pages');
  }
  if (argv.grep) {
    webpages = webpages.filter(webpage => argv.grep.test(webpage.name));
    log('info', colors.cyan(`--grep ${argv.grep}`), 'matched',
        colors.cyan(webpages.length), 'pages');
  }

  // Expand all the interactive tests. Every test should have a base test with
  // no interactions, and each test that has in interactive tests file should
  // load those tests here.
  for (const webpage of webpages) {
    webpage.tests_ = {
      '': async() => {},
    };
    if (webpage.interactive_tests) {
      try {
        Object.assign(webpage.tests_,
            require(path.resolve(ROOT_DIR, webpage.interactive_tests)));
      } catch (error) {
        log('fatal', 'Failed to load interactive test',
            colors.cyan(webpage.interactive_tests), 'for test',
            colors.cyan(webpage.name), '\nError:', error);
      }
    }
  }

  const totalTests = webpages.reduce(
      (numTests, webpage) => numTests + Object.keys(webpage.tests_).length, 0);
  if (!totalTests) {
    log('fatal', 'No pages left to test!');
  } else {
    log('info', 'Executing', colors.cyan(totalTests), 'visual diff tests on',
        colors.cyan(webpages.length), 'pages');
  }

  const browser = await launchBrowser();
  if (argv.master) {
    const page = await newPage(browser);
    await page.goto(
        `http://${HOST}:${PORT}/examples/visual-tests/blank-page/blank.html`);
    await percy.snapshot('Blank page', page, SNAPSHOT_EMPTY_BUILD_OPTIONS);
  }

  log('verbose', 'Generating snapshots...');
  if (!(await snapshotWebpages(percy, browser, webpages))) {
    log('fatal', 'Some tests have failed locally.');
  }
}

/**
 * Generates Percy snapshots for a set of given webpages.
 *
 * @param {!Percy} percy a Percy-Puppeteer controller.
 * @param {!puppeteer.Browser} browser a Puppeteer controlled browser.
 * @param {!Array<!JsonObject>} webpages an array of JSON objects containing
 *     details about the webpages to snapshot.
 * @return {boolean} true if all tests passed locally (does not indicate whether
 *     the tests passed on Percy).
 */
async function snapshotWebpages(percy, browser, webpages) {
  const pagePromises = {};
  const testErrors = [];
  let testNumber = 0;
  for (const webpage of webpages) {
    const {viewport, name: pageName} = webpage;
    for (const [testName, testFunction] of Object.entries(webpage.tests_)) {
      // Chrome supports redirecting <anything>.localhost to localhost, while
      // respecting domain name boundaries. This allows each test to be
      // sandboxed from other tests, with respect to things like cookies and
      // localStorage. Since Puppeteer only ever executes on Chrome, this is
      // fine.
      const fullUrl = `http://${testNumber++}.${HOST}:${PORT}/${webpage.url}`;
      while (Object.keys(pagePromises).length >= MAX_PARALLEL_TABS) {
        await sleep(WAIT_FOR_TABS_MS);
      }

      const name = testName ? `${pageName} (${testName})` : pageName;
      log('verbose', 'Visual diff test', colors.yellow(name));

      const page = await newPage(browser, viewport);
      log('verbose', 'Navigating to page', colors.yellow(webpage.url));

      // Navigate to an empty page first to support different webpages that only
      // modify the #anchor name.
      await page.goto('about:blank').then(() => {}, () => {});

      // Puppeteer is flaky when it comes to catching navigation requests, so
      // ignore timeouts. If this was a real non-loading page, this will be
      // caught in the resulting Percy build. Also attempt to wait until there
      // are no more network requests. This method is flaky since Puppeteer
      // doesn't always understand Chrome's network activity, so ignore timeouts
      // again.
      const pagePromise = page.goto(fullUrl, {waitUntil: 'networkidle0'})
          .then(() => {}, () => {})
          .then(async() => {
            log('verbose', 'Navigation to page', colors.yellow(name),
                'is done, verifying page');

            // Visibility evaluations can only be performed on the active tab,
            // even in the headless browser mode.
            await page.bringToFront();

            // Perform visibility checks: wait for all AMP built-in loader dots
            // to disappear (i.e., all visible components are finished being
            // layed out and external resources such as images are loaded and
            // displayed), then, depending on the test configurations, wait for
            // invisibility/visibility of specific elements that match the
            // configured CSS selectors.
            await waitForLoaderDots(page, name);
            if (webpage.loading_incomplete_selectors) {
              await verifySelectorsInvisible(
                  page, name, webpage.loading_incomplete_selectors);
            }
            if (webpage.loading_complete_selectors) {
              await verifySelectorsVisible(
                  page, name, webpage.loading_complete_selectors);
            }

            // Based on test configuration, wait for a specific amount of time.
            if (webpage.loading_complete_delay_ms) {
              log('verbose', 'Waiting',
                  colors.cyan(`${webpage.loading_complete_delay_ms}ms`),
                  'for loading to complete');
              await sleep(webpage.loading_complete_delay_ms);
            }

            // Run any other custom code located in the test's interactive_tests
            // file. If there is no interactive test, this defaults to an empty
            // function.
            await testFunction(page, name);

            // Execute post-scripts that clean up the page's HTML and send
            // prepare it for snapshotting on Percy. See comments inside the
            // snippet files for description of each.
            await page.evaluate(REMOVE_AMP_SCRIPTS_SNIPPET);
            await page.evaluate(FREEZE_FORM_VALUE_SNIPPET);

            // Create a default set of snapshot options for Percy and modify
            // them based on the test's configuration.
            const snapshotOptions = Object.assign({}, DEFAULT_SNAPSHOT_OPTIONS);
            if (webpage.enable_percy_javascript) {
              snapshotOptions.enableJavaScript = true;
            }

            if (viewport) {
              snapshotOptions.widths = [viewport.width];
              log('verbose', 'Wrapping viewport-constrained page in an iframe');
              await page.evaluate(WRAP_IN_IFRAME_SNIPPET
                  .replace(/__WIDTH__/g, viewport.width)
                  .replace(/__HEIGHT__/g, viewport.height));
            }

            // Finally, send the snapshot to percy.
            await percy.snapshot(name, page, snapshotOptions);
            log('travis', colors.cyan('●'));
          })
          .catch(testError => {
            log('travis', colors.red('○'));
            if (!isTravisBuild()) {
              log('error', 'Error in test', colors.cyan(name));
              log('error', 'Exception thrown:', testError);
            }
            testErrors.push({name, testError});
          })
          .then(async() => {
            await page.close();
            delete pagePromises[name];
          });
      pagePromises[name] = pagePromise;
    }
  }

  while (Object.keys(pagePromises).length > 0) {
    await sleep(WAIT_FOR_TABS_MS);
  }
  log('travis', '\n');
  if (isTravisBuild()) {
    testErrors.forEach(testErrorObject => {
      const {name, testError} = testErrorObject;
      log('error', 'Error in test', colors.cyan(name));
      log('error', 'Exception thrown:', testError);
    });
  }
  return testErrors.length == 0;
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
 */
async function createEmptyBuild() {
  log('info', 'Skipping visual diff tests and generating a blank Percy build');

  const browser = await launchBrowser();
  const page = await newPage(browser);

  const blankAssetsDir = '../../../examples/visual-tests/blank-page';
  const percy = new Percy({
    loaders: [
      new PercyAssetsLoader(
          [path.resolve(__dirname, blankAssetsDir)], ROOT_DIR),
    ],
  });
  await percy.startBuild();
  await page.goto(
      `http://${HOST}:${PORT}/examples/visual-tests/blank-page/blank.html`)
      .then(() => {}, () => {});
  await percy.snapshot('Blank page', page, SNAPSHOT_EMPTY_BUILD_OPTIONS);
  await percy.finalizeBuild();
}

/**
 * Runs the AMP visual diff tests.
 */
async function visualDiff() {
  ensureOrBuildAmpRuntimeInTestMode_();
  installPercy_();
  setupCleanup_();
  maybeOverridePercyEnvironmentVariables();
  setPercyBranch();
  setPercyTargetCommit();

  if (argv.grep) {
    argv.grep = RegExp(argv.grep);
  }

  try {
    await performVisualTests();
  } finally {
    return await cleanup_();
  }
}

/**
 * Runs the AMP visual diff tests.
 */
async function performVisualTests() {
  if (!argv.percy_disabled &&
      (!process.env.PERCY_PROJECT || !process.env.PERCY_TOKEN)) {
    log('fatal', 'Could not find', colors.cyan('PERCY_PROJECT'), 'and',
        colors.cyan('PERCY_TOKEN'), 'environment variables');
  }
  setDebuggingLevel();

  // Launch a local web server.
  try {
    await launchWebServer();
  } catch (reason) {
    log('fatal', `Failed to start a web server: ${reason}`);
  }

  if (argv.empty) {
    await createEmptyBuild();
  } else {
    // Load and parse the config. Use JSON5 due to JSON comments in file.
    const visualTestsConfig = JSON5.parse(
        fs.readFileSync(
            path.resolve(__dirname, '../../../test/visual-diff/visual-tests'),
            'utf8'));
    await runVisualTests(
        visualTestsConfig.asset_globs, visualTestsConfig.webpages);
  }
}

async function ensureOrBuildAmpRuntimeInTestMode_() {
  if (argv.nobuild) {
    const isInTestMode = /AMP_CONFIG=\{(?:.+,)?"test":true\b/.test(
        fs.readFileSync('dist/amp.js', 'utf8'));
    if (!isInTestMode) {
      log('fatal', 'The AMP runtime was not built in test mode. Run',
          colors.cyan('gulp build --fortesting'), 'or remove the',
          colors.cyan('--nobuild'), 'option from this command');
    }
  } else {
    execOrDie('gulp build --fortesting');
  }
}

function installPercy_() {
  log('info', 'Running', colors.cyan('yarn'), 'to install Percy...');
  execOrDie('npx yarn --cwd build-system/tasks/visual-diff',
      {'stdio': 'ignore'});

  puppeteer = require('puppeteer');
  Percy = require('@percy/puppeteer').Percy;
}

function setupCleanup_() {
  process.on('exit', cleanup_);
  process.on('SIGINT', cleanup_);
  process.on('uncaughtException', cleanup_);
  process.on('unhandledRejection', cleanup_);
}

async function cleanup_() {
  if (browser_) {
    await browser_.close();
  }
  if (webServerProcess_ && !webServerProcess_.killed) {
    // Explicitly exit the webserver.
    webServerProcess_.kill('SIGKILL');
    // The child node process has an asynchronous stdout. See #10409.
    await sleep(100);
  }
}

gulp.task(
    'visual-diff',
    'Runs the AMP visual diff tests.',
    visualDiff,
    {
      options: {
        'master': '  Includes a blank snapshot (baseline for skipped builds)',
        'empty': '  Creates a dummy Percy build with only a blank snapshot',
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
