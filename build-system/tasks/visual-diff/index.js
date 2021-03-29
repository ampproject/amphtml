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
const fs = require('fs');
const JSON5 = require('json5');
const path = require('path');
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../../common/ctrlcHandler');
const {
  escapeHtml,
  log,
  waitForPageLoad,
  verifySelectorsInvisible,
  verifySelectorsVisible,
  sleep,
} = require('./helpers');
const {
  gitBranchName,
  gitCommitterEmail,
  gitCiMasterBaseline,
  shortSha,
} = require('../../common/git');
const {buildRuntime} = require('../../common/utils');
const {cyan, yellow} = require('kleur/colors');
const {isCiBuild} = require('../../common/ci');
const {startServer, stopServer} = require('../serve');

// Lazy-loaded dependencies.
let puppeteer;
let percySnapshot;
let Percy;

// CSS injected in every page tested.
// Normally, as in https://docs.percy.io/docs/percy-specific-css
// Otherwise, as a <style> in an iframe, see snippets/iframe-wrapper.js
const percyCss = [
  // Loader animation may otherwise be captured in slightly different points,
  // causing the test to flake.
  '.i-amphtml-new-loader * { animation: none !important; }',
].join('\n');

// REPEATING TODO(@ampproject/wg-infra): Update this whenever the Percy backend
// starts using a new version of Chrome to render DOM snapshots.
//
// Steps:
// 1. Open a recent Percy build, and click the “ⓘ” icon
// 2. Note the Chrome major version at the bottom
// 3. Look up the full version at https://en.wikipedia.org/wiki/Google_Chrome_version_history
// 4. Open https://omahaproxy.appspot.com in a browser
// 5. Go to "Tools" -> "Version information"
// 6. Paste the full version in the "Version" field and click "Lookup"
// 7. Copy the value next to "Branch Base Position" and update the line below
const PUPPETEER_CHROMIUM_REVISION = '827102'; // 88.0.4324.0

const SNAPSHOT_SINGLE_BUILD_OPTIONS = {
  widths: [375],
};
const VIEWPORT_WIDTH = 1400;
const VIEWPORT_HEIGHT = 100000;
const HOST = 'localhost';
const PORT = 8000;
const PERCY_AGENT_PORT = 5338;
const NAVIGATE_TIMEOUT_MS = 30000;
const MAX_PARALLEL_TABS = 5;
const WAIT_FOR_TABS_MS = 1000;

const ROOT_DIR = path.resolve(__dirname, '../../../');

// JavaScript snippets that execute inside the page.
const WRAP_IN_IFRAME_SNIPPET = fs.readFileSync(
  path.resolve(__dirname, 'snippets/iframe-wrapper.js'),
  'utf8'
);
const REMOVE_AMP_SCRIPTS_SNIPPET = fs.readFileSync(
  path.resolve(__dirname, 'snippets/remove-amp-scripts.js'),
  'utf8'
);
const FREEZE_FORM_VALUE_SNIPPET = fs.readFileSync(
  path.resolve(__dirname, 'snippets/freeze-form-values.js'),
  'utf8'
);
const FREEZE_CANVAS_IMAGE_SNIPPET = fs.readFileSync(
  path.resolve(__dirname, 'snippets/freeze-canvas-image.js'),
  'utf8'
);

// HTML snippet to create an error page snapshot.
const SNAPSHOT_ERROR_SNIPPET = fs.readFileSync(
  path.resolve(__dirname, 'snippets/snapshot-error.html'),
  'utf8'
);

let browser_;

/**
 * Override PERCY_* environment variables if passed via amp task parameters.
 */
function maybeOverridePercyEnvironmentVariables() {
  ['percy_token', 'percy_branch'].forEach((variable) => {
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
  if (!process.env['PERCY_BRANCH'] && (!argv.master || !isCiBuild())) {
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
 * Only does something during CI, and for non-master branches, since master
 * builds are always built on top of the previous commit (we use the squash and
 * merge method for pull requests.)
 */
function setPercyTargetCommit() {
  if (isCiBuild() && !argv.master) {
    process.env['PERCY_TARGET_COMMIT'] = gitCiMasterBaseline();
  }
}

/**
 * Launches a @percy/cli instance.
 *
 * @param {!puppeteer.BrowserFetcher} browserFetcher Puppeteer browser binaries
 *     manager.
 * @return {!Promise<Percy|undefined>} percy agent instance.
 */
async function launchPercyAgent(browserFetcher) {
  if (argv.percy_disabled) {
    return;
  }

  const percy = await Percy.start({
    token: process.env.PERCY_TOKEN,
    loglevel: argv.percy_agent_debug ? 'debug' : 'info',
    port: PERCY_AGENT_PORT,
    config: path.join(__dirname, '.percy.yaml'),
    discovery: {
      launchOptions: {
        executable: browserFetcher.revisionInfo(PUPPETEER_CHROMIUM_REVISION)
          .executablePath,
      },
    },
  });

  log('info', 'Percy agent is reachable on port', PERCY_AGENT_PORT);
  if (process.env['PERCY_TARGET_COMMIT']) {
    log(
      'info',
      'The Percy build is baselined on top of commit',
      cyan(shortSha(process.env['PERCY_TARGET_COMMIT']))
    );
  }

  return percy;
}

/**
 * Launches an AMP webserver for minified js.
 */
async function launchWebServer() {
  await startServer(
    {host: HOST, port: PORT},
    {quiet: !argv.webserver_debug},
    {compiled: true}
  );
}

/**
 * Launches a Puppeteer controlled browser.
 *
 * Waits until the browser is up and reachable, and ties its lifecycle to this
 * process's lifecycle.
 *
 * @param {!puppeteer.BrowserFetcher} browserFetcher Puppeteer browser binaries
 *     manager.
 * @return {!Promise<!puppeteer.Browser>} a Puppeteer controlled browser.
 */
async function launchBrowser(browserFetcher) {
  const browserOptions = {
    args: ['--no-sandbox', '--disable-extensions', '--disable-gpu'],
    dumpio: argv.chrome_debug,
    headless: true,
    executablePath: browserFetcher.revisionInfo(PUPPETEER_CHROMIUM_REVISION)
      .executablePath,
  };

  try {
    browser_ = await puppeteer.launch(browserOptions);
  } catch (error) {
    log('fatal', error);
  }

  return browser_;
}

/**
 * Opens a new browser tab, resizes its viewport, and returns a Page handler.
 *
 * @param {!puppeteer.Browser} browser a Puppeteer controlled browser.
 * @param {?{height: number, width: number}} viewport optional viewport size
 *     object with numeric fields `width` and `height`.
 * @return {!Promise<!puppeteer.Page>}
 */
async function newPage(browser, viewport = null) {
  log('verbose', 'Creating new tab');

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  await page.setJavaScriptEnabled(true);
  await page.setRequestInterception(true);
  page.on('request', (interceptedRequest) => {
    const requestUrl = new URL(interceptedRequest.url());
    const mockedFilepath = path.join(
      path.dirname(__filename),
      'network-mocks',
      requestUrl.hostname,
      encodeURIComponent(
        `${requestUrl.pathname.substr(1)}${requestUrl.search}`
      ).replace(/%2F/g, '/')
    );

    if (
      requestUrl.protocol === 'data:' ||
      requestUrl.hostname === HOST ||
      requestUrl.hostname.endsWith(`.${HOST}`)
    ) {
      return interceptedRequest.continue();
    } else if (fs.existsSync(mockedFilepath)) {
      log(
        'verbose',
        'Mocked network request for',
        yellow(requestUrl.href),
        'with file',
        cyan(mockedFilepath)
      );
      return interceptedRequest.respond(fs.readFileSync(mockedFilepath));
    } else {
      log(
        'verbose',
        'Blocked external network request for',
        yellow(requestUrl.href)
      );
      return interceptedRequest.abort('blockedbyclient');
    }
  });
  await resetPage(page, viewport);
  return page;
}

/**
 * Resets the size of a tab and loads about:blank.
 *
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 * @param {?{height: number, width: number}} viewport optional viewport size
 *     object with numeric fields `width` and `height`.
 */
async function resetPage(page, viewport = null) {
  const width = viewport ? viewport.width : VIEWPORT_WIDTH;
  const height = viewport ? viewport.height : VIEWPORT_HEIGHT;

  log(
    'verbose',
    'Resetting tab to',
    yellow('about:blank'),
    'with size',
    yellow(`${width}×${height}`)
  );

  await page.goto('about:blank');
  await page.setViewport({width, height});
}

/**
 * Adds a test error and logs it if running locally (not as part of CI).
 *
 * @param {!Array<!JsonObject>} testErrors array of testError objects.
 * @param {string} name full name of the test.
 * @param {string} message extra information about the failure.
 * @param {Error} error error object with stack trace.
 * @param {!Array<puppeteer.ConsoleMessage>} consoleMessages array of console
 *     messages printed so far.
 */
function addTestError(testErrors, name, message, error, consoleMessages) {
  const testError = {name, message, error, consoleMessages};
  if (!isCiBuild()) {
    logTestError(testError);
  }
  testErrors.push(testError);
}

/**
 * Logs a test error (regardless of where it's running).
 *
 * @param {!JsonObject} testError object as created by addTestError.
 */
function logTestError(testError) {
  log(
    'error',
    'Error in test',
    yellow(testError.name),
    '\n  ',
    testError.message,
    '\n  ',
    testError.error
  );
  if (testError.consoleMessages.length > 0) {
    log(
      'error',
      cyan(testError.consoleMessages.length),
      'Console messages in the browser so far:'
    );
    for (const message of testError.consoleMessages) {
      log('error', cyan(`[console.${message.type()}]`), message.text());
    }
  }
}

/**
 * Sets the AMP config, launches a server, and generates Percy snapshots for a
 * set of given webpages.
 *
 * @param {!puppeteer.Browser} browser a Puppeteer controlled browser.
 * @param {!Array<JsonObject>} webpages an array of JSON objects containing
 *     details about the pages to snapshot.
 */
async function runVisualTests(browser, webpages) {
  const numUnfilteredPages = webpages.length;
  webpages = webpages.filter((webpage) => !webpage.flaky);
  if (numUnfilteredPages != webpages.length) {
    log(
      'info',
      'Skipping',
      cyan(numUnfilteredPages - webpages.length),
      'flaky pages'
    );
  }
  if (argv.grep) {
    webpages = webpages.filter((webpage) => argv.grep.test(webpage.name));
    log(
      'info',
      cyan(`--grep ${argv.grep}`),
      'matched',
      cyan(webpages.length),
      'pages'
    );
  }

  // Expand all the interactive tests. Every test should have a base test with
  // no interactions, and each test that has in interactive tests file should
  // load those tests here.
  for (const webpage of webpages) {
    webpage.tests_ = {};
    if (!webpage.no_base_test) {
      webpage.tests_[''] = async () => {};
    }
    if (webpage.interactive_tests) {
      try {
        Object.assign(
          webpage.tests_,
          require(path.resolve(ROOT_DIR, webpage.interactive_tests))
        );
      } catch (error) {
        log(
          'fatal',
          'Failed to load interactive test',
          cyan(webpage.interactive_tests),
          'for test',
          cyan(webpage.name),
          '\nError:',
          error
        );
      }
    }
  }

  const totalTests = webpages.reduce(
    (numTests, webpage) => numTests + Object.keys(webpage.tests_).length,
    0
  );
  if (!totalTests) {
    log('fatal', 'No pages left to test!');
  } else {
    log(
      'info',
      'Executing',
      cyan(totalTests),
      'visual diff tests on',
      cyan(webpages.length),
      'pages'
    );
  }

  if (argv.master) {
    const page = await newPage(browser);
    await page.goto(
      `http://${HOST}:${PORT}/examples/visual-tests/blank-page/blank.html`
    );
    await percySnapshot(page, 'Blank page', SNAPSHOT_SINGLE_BUILD_OPTIONS);
  }

  log('info', 'Generating snapshots...');
  if (!(await snapshotWebpages(browser, webpages))) {
    log('fatal', 'Some tests have failed locally.');
  }
}

/**
 * Generates Percy snapshots for a set of given webpages.
 *
 * @param {!puppeteer.Browser} browser a Puppeteer controlled browser.
 * @param {!Array<!JsonObject>} webpages an array of JSON objects containing
 *     details about the webpages to snapshot.
 * @return {!Promise<boolean>} true if all tests passed locally (does not
 *     indicate whether the tests passed on Percy).
 */
async function snapshotWebpages(browser, webpages) {
  const availablePages = [];
  const allPages = [];

  log('verbose', 'Preallocating', cyan(MAX_PARALLEL_TABS), 'tabs...');
  for (let i = 0; i < MAX_PARALLEL_TABS; i++) {
    const page = await newPage(browser);
    availablePages.push(page);
    allPages.push(page);
  }

  const pagePromises = [];
  const testErrors = [];
  let testNumber = 0;
  for (const webpage of webpages) {
    const {viewport, name: pageName} = webpage;
    let hasWarnings = false;
    for (const [testName, testFunction] of Object.entries(webpage.tests_)) {
      // Chrome supports redirecting <anything>.localhost to localhost, while
      // respecting domain name boundaries. This allows each test to be
      // sandboxed from other tests, with respect to things like cookies and
      // localStorage. Since Puppeteer only ever executes on Chrome, this is
      // fine.
      const fullUrl = `http://${testNumber++}.${HOST}:${PORT}/${webpage.url}`;
      while (availablePages.length == 0) {
        await sleep(WAIT_FOR_TABS_MS);
      }
      const page = availablePages.shift();

      const name = testName ? `${pageName} (${testName})` : pageName;
      log(
        'info',
        'Starting test',
        yellow(name),
        'on tab',
        yellow(`#${allPages.indexOf(page) + 1}`)
      );

      await resetPage(page, viewport);

      const consoleMessages = [];
      const consoleLogger = (consoleMessage) => {
        consoleMessages.push(consoleMessage);
      };
      page.on('console', consoleLogger);

      // Puppeteer is flaky when it comes to catching navigation requests, so
      // retry the page navigation up to NAVIGATE_RETRIES times and eventually
      // ignore a final timeout. If this ends up being a real non-loading page
      // error, this will be caught in the resulting Percy build. Also attempt
      // to wait until there are no more network requests. This method is flaky
      // since Puppeteer doesn't always understand Chrome's network activity, so
      // ignore timeouts again.
      const pagePromise = (async () => {
        try {
          /** @type {Promise<void>} */
          const responseWatcher = new Promise((resolve, reject) => {
            const responseTimeout = setTimeout(() => {
              reject(
                new puppeteer.TimeoutError(
                  `Response was not received in test ${testName} for page ` +
                    `${webpage.url} after ${NAVIGATE_TIMEOUT_MS}ms`
                )
              );
            }, NAVIGATE_TIMEOUT_MS);

            page.once('response', (response) => {
              log(
                'verbose',
                'Response for url',
                yellow(response.url()),
                'with status',
                cyan(response.status()),
                cyan(response.statusText())
              );
              clearTimeout(responseTimeout);
              resolve();
            });
          });

          log('verbose', 'Navigating to page', yellow(webpage.url));
          await Promise.all([
            responseWatcher,
            page.goto(fullUrl, {waitUntil: 'networkidle2'}),
          ]);

          log(
            'verbose',
            'Page navigation of test',
            yellow(name),
            'is done, verifying page'
          );
        } catch (navigationError) {
          hasWarnings = true;
          addTestError(
            testErrors,
            name,
            'The browser test runner failed to complete the navigation to the test page',
            navigationError,
            consoleMessages
          );
          log('warning', 'Continuing to verify page regardless...');
        }

        let performSnapshot = true;
        try {
          // Perform visibility checks: wait for all AMP built-in loader dots
          // to disappear (i.e., all visible components are finished being
          // layed out and external resources such as images are loaded and
          // displayed), then, depending on the test configurations, wait for
          // invisibility/visibility of specific elements that match the
          // configured CSS selectors.
          await waitForPageLoad(page, name);
          if (webpage.loading_incomplete_selectors) {
            await verifySelectorsInvisible(
              page,
              name,
              webpage.loading_incomplete_selectors
            );
          }
          if (webpage.loading_complete_selectors) {
            await verifySelectorsVisible(
              page,
              name,
              webpage.loading_complete_selectors
            );
          }

          // Based on test configuration, wait for a specific amount of time.
          if (webpage.loading_complete_delay_ms) {
            log(
              'verbose',
              'Waiting',
              cyan(`${webpage.loading_complete_delay_ms}ms`),
              'for loading to complete'
            );
            await sleep(webpage.loading_complete_delay_ms);
          }

          // Run any other custom code located in the test's interactive_tests
          // file. If there is no interactive test, this defaults to an empty
          // function.
          await testFunction(page, name);
        } catch (testError) {
          performSnapshot = false;
          addTestError(
            testErrors,
            name,
            'Test page failed',
            testError,
            consoleMessages
          );

          let htmlSnapshot;
          try {
            htmlSnapshot = await page.content();
          } catch (e) {
            htmlSnapshot = e.message;
          }
          await page.setContent(
            SNAPSHOT_ERROR_SNIPPET.replace('__TEST_NAME__', name)
              .replace('__TEST_ERROR__', testError)
              .replace('__HTML_SNAPSHOT__', escapeHtml(htmlSnapshot))
          );
          await percySnapshot(page, name, SNAPSHOT_SINGLE_BUILD_OPTIONS);
        }

        if (performSnapshot) {
          try {
            // Execute post-scripts that clean up the page's HTML and send
            // prepare it for snapshotting on Percy. See comments inside the
            // snippet files for description of each.
            await page.evaluate(REMOVE_AMP_SCRIPTS_SNIPPET);
            await page.evaluate(FREEZE_FORM_VALUE_SNIPPET);
            await page.evaluate(FREEZE_CANVAS_IMAGE_SNIPPET);

            // Create a default set of snapshot options for Percy and modify
            // them based on the test's configuration.
            const snapshotOptions = {};
            if (webpage.enable_percy_javascript) {
              snapshotOptions.enableJavaScript = true;
            }

            if (viewport) {
              snapshotOptions.widths = [viewport.width];
              log('verbose', 'Wrapping viewport-constrained page in an iframe');
              await page.evaluate(
                WRAP_IN_IFRAME_SNIPPET.replace(/__WIDTH__/g, viewport.width)
                  .replace(/__HEIGHT__/g, viewport.height)
                  .replace(/__PERCY_CSS__/g, percyCss)
              );
            } else {
              snapshotOptions.percyCss = percyCss;
            }

            // Finally, send the snapshot to percy.
            await percySnapshot(page, name, snapshotOptions);
          } catch (snapshotError) {
            addTestError(
              testErrors,
              name,
              'Failed to set up or take the Percy snapshot',
              snapshotError,
              consoleMessages
            );
            throw snapshotError;
          }
        }

        log(
          hasWarnings ? 'warning' : 'info',
          'Finished test',
          yellow(name),
          hasWarnings ? 'with warnings' : ''
        );
        page.removeListener('console', consoleLogger);
        availablePages.push(page);
      })();
      pagePromises.push(pagePromise);
    }
  }

  await Promise.all(pagePromises);
  if (isCiBuild() && testErrors.length > 0) {
    testErrors.sort((a, b) => a.name.localeCompare(b.name));
    log('info', yellow('Tests warnings and errors:'));
    testErrors.forEach(logTestError);
    return false;
  }
  return true;
}

/**
 * Enables debugging if requested via command line.
 */
function setDebuggingLevel() {
  if (argv.debug) {
    argv['chrome_debug'] = true;
    argv['webserver_debug'] = true;
    argv['percy_agent_debug'] = true;
  }
}

/**
 * Creates a Percy build with only a blank page for comparison.
 *
 * Enables us to require percy checks on GitHub, and yet, not have to do a full
 * build for every PR.
 *
 * @param {!puppeteer.Browser} browser a Puppeteer controlled browser.
 */
async function createEmptyBuild(browser) {
  log('info', 'Skipping visual diff tests and generating a blank Percy build');

  const page = await newPage(browser);

  try {
    await page.goto(
      `http://${HOST}:${PORT}/examples/visual-tests/blank-page/blank.html`
    );
  } catch {
    // Ignore failures
  }

  await percySnapshot(page, 'Blank page', SNAPSHOT_SINGLE_BUILD_OPTIONS);
}

/**
 * Runs the AMP visual diff tests.
 * @return {!Promise<void>}
 */
async function visualDiff() {
  const handlerProcess = createCtrlcHandler('visual-diff');
  await ensureOrBuildAmpRuntimeInTestMode_();
  const browserFetcher = await loadBrowserFetcher_();
  maybeOverridePercyEnvironmentVariables();
  setPercyBranch();
  setPercyTargetCommit();

  if (argv.grep) {
    argv.grep = RegExp(argv.grep);
  }

  if (!argv.percy_disabled && !process.env.PERCY_TOKEN) {
    log('fatal', 'Could not find', cyan('PERCY_TOKEN'), 'environment variable');
  }

  const percy = await launchPercyAgent(browserFetcher);
  try {
    await performVisualTests(browserFetcher);
  } finally {
    await percy.stop();
  }
  exitCtrlcHandler(handlerProcess);
}

/**
 * Runs the AMP visual diff tests.
 *
 * @param {!puppeteer.BrowserFetcher} browserFetcher Puppeteer browser binaries
 *     manager.
 */
async function performVisualTests(browserFetcher) {
  setDebuggingLevel();

  const browser = await launchBrowser(browserFetcher);
  await launchWebServer();

  try {
    if (argv.empty) {
      await createEmptyBuild(browser);
    } else {
      // Load and parse the config. Use JSON5 due to JSON comments in file.
      const visualTestsConfig = JSON5.parse(
        fs.readFileSync(
          path.resolve(__dirname, '../../../test/visual-diff/visual-tests'),
          'utf8'
        )
      );
      await runVisualTests(browser, visualTestsConfig.webpages);
    }
  } finally {
    await browser.close();
    await stopServer();
  }
}

/**
 * @return {Promise<void>}
 */
async function ensureOrBuildAmpRuntimeInTestMode_() {
  if (argv.empty) {
    return;
  }

  if (argv.nobuild) {
    const isInTestMode = /AMP_CONFIG=\{(?:.+,)?"test":true\b/.test(
      fs.readFileSync('dist/v0.js', 'utf8')
    );
    if (!isInTestMode) {
      log(
        'fatal',
        'The AMP runtime was not built in test mode. Run',
        cyan('amp dist --fortesting'),
        'or remove the',
        cyan('--nobuild'),
        'option from this command'
      );
    }
  } else {
    await buildRuntime(/* opt_compiled */ true);
  }
}

/**
 * Loads task-specific dependencies are returns an instance of BrowserFetcher.
 *
 * @return {!Promise<!puppeteer.BrowserFetcher>}
 */
async function loadBrowserFetcher_() {
  puppeteer = require('puppeteer');
  percySnapshot = require('@percy/puppeteer');
  Percy = require('@percy/core');

  const browserFetcher = puppeteer.createBrowserFetcher();
  const chromiumRevisions = await browserFetcher.localRevisions();
  if (chromiumRevisions.includes(PUPPETEER_CHROMIUM_REVISION)) {
    log(
      'info',
      'Using Percy-compatible version of Chromium',
      cyan(PUPPETEER_CHROMIUM_REVISION)
    );
  } else {
    log(
      'info',
      'Percy-compatible version of Chromium',
      cyan(PUPPETEER_CHROMIUM_REVISION),
      'was not found. Downloading...'
    );
    await browserFetcher.download(
      PUPPETEER_CHROMIUM_REVISION,
      (/* downloadedBytes, totalBytes */) => {
        // TODO(@ampproject/wg-infra): display download progress.
        // Logging every call is too verbose.
      }
    );
  }
  return browserFetcher;
}

module.exports = {
  visualDiff,
};

visualDiff.description = 'Runs the AMP visual diff tests.';
visualDiff.flags = {
  'master': 'Includes a blank snapshot (baseline for skipped builds)',
  'empty': 'Creates a dummy Percy build with only a blank snapshot',
  'config':
    'Sets the runtime\'s AMP_CONFIG to one of "prod" (default) or "canary"',
  'chrome_debug': 'Prints debug info from Chrome',
  'webserver_debug': 'Prints debug info from the local amp webserver',
  'percy_agent_debug': 'Prints debug info from the @percy/agent instance',
  'debug': 'Sets all debugging flags',
  'verbose': 'Prints verbose log statements',
  'grep': 'Runs tests that match the pattern',
  'percy_token': 'Override the PERCY_TOKEN environment variable',
  'percy_branch': 'Override the PERCY_BRANCH environment variable',
  'percy_disabled':
    'Disables Percy integration (for testing local changes only)',
  'nobuild': 'Skip build',
};
