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
const colors = require('ansi-colors');
const fs = require('fs');
const JSON5 = require('json5');
const path = require('path');
const sleep = require('sleep-promise');
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../../common/ctrlcHandler');
const {
  escapeHtml,
  log,
  waitForLoaderDots,
  verifySelectorsInvisible,
  verifySelectorsVisible,
} = require('./helpers');
const {
  gitBranchName,
  gitCommitterEmail,
  gitTravisMasterBaseline,
  shortSha,
} = require('../../common/git');
const {execOrDie, execScriptAsync} = require('../../common/exec');
const {installPackages} = require('../../common/utils');
const {isTravisBuild} = require('../../common/travis');
const {startServer, stopServer} = require('../serve');
const {waitUntilUsed} = require('tcp-port-used');

// optional dependencies for local development (outside of visual diff tests)
let puppeteer;
let percySnapshot;

// CSS widths: iPhone: 375, Pixel: 411, Desktop: 1400.
const DEFAULT_SNAPSHOT_OPTIONS = {widths: [375, 411, 1400]};
const SNAPSHOT_SINGLE_BUILD_OPTIONS = {widths: [375]};
const VIEWPORT_WIDTH = 1400;
const VIEWPORT_HEIGHT = 100000;
const HOST = 'localhost';
const PORT = 8000;
const PERCY_AGENT_PORT = 5338;
const PERCY_AGENT_RETRY_MS = 100;
const PERCY_AGENT_TIMEOUT_MS = 5000;
const NAVIGATE_TIMEOUT_MS = 30000;
const MAX_PARALLEL_TABS = 5;
const WAIT_FOR_TABS_MS = 1000;

const PUPPETEER_OPTIONS = {
  chrome: {
    product: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-extensions', '--disable-gpu'],
    dumpio: argv.browser_debug,
  },
  firefox: {
    product: 'firefox',
    args: ['-new-instance', '-private'],
    headless: true,
    dumpio: argv.browser_debug,
  },
};

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

// HTML snippet to create an error page snapshot.
const SNAPSHOT_ERROR_SNIPPET = fs.readFileSync(
  path.resolve(__dirname, 'snippets/snapshot-error.html'),
  'utf8'
);

/**
 * Override PERCY_* environment variables if passed via gulp task parameters.
 */
function maybeOverridePercyEnvironmentVariables() {
  ['percy_token_chrome', 'percy_token_firefox', 'percy_branch'].forEach(
    variable => {
      if (variable in argv) {
        process.env[variable.toUpperCase()] = argv[variable];
      }
    }
  );
}

/**
 * Disambiguates branch names by decorating them with the commit author name.
 * We do this for all non-push builds in order to prevent them from being used
 * as baselines for future builds.
 */
function setPercyBranch() {
  if (!process.env['PERCY_BRANCH'] && (!argv.master || !isTravisBuild())) {
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
 * Launches a @percy/agent instance.
 */
async function launchPercyAgent() {
  try {
    if (argv.percy_disabled) {
      return;
    }

    const env = argv.percy_agent_debug ? {LOG_LEVEL: 'debug'} : {};
    const percyAgentProcess = execScriptAsync(
      `npx percy start --port ${PERCY_AGENT_PORT}`,
      {
        cwd: __dirname,
        env: Object.assign(env, process.env),
        stdio: ['ignore', process.stdout, process.stderr],
      }
    );
    await waitUntilUsed(
      PERCY_AGENT_PORT,
      PERCY_AGENT_RETRY_MS,
      PERCY_AGENT_TIMEOUT_MS
    );
    log('info', 'Percy agent is reachable on port', PERCY_AGENT_PORT);

    addCleanupStep_(() => {
      exitPercyAgent_(percyAgentProcess);
    });
    return percyAgentProcess;
  } catch (reason) {
    log('fatal', `Failed to start the Percy agent: ${reason}`);
  }
}

/**
 * Launches an AMP webserver for minified js.
 */
async function launchWebServer() {
  try {
    await startServer(
      {host: HOST, port: PORT},
      {quiet: !argv.webserver_debug},
      {compiled: true}
    );
    addCleanupStep_(stopServer);
  } catch (reason) {
    log('fatal', `Failed to start a web server: ${reason}`);
  }
}

/**
 * Launches a Puppeteer controlled browser.
 *
 * Waits until the browser is up and reachable, and ties its lifecycle to this
 * process's lifecycle.
 *
 * @param {string} browserName either "chrome" or "firefox".
 * @return {!puppeteer.Browser} a Puppeteer controlled browser.
 */
async function launchBrowser(browserName) {
  try {
    const browser = await puppeteer.launch(PUPPETEER_OPTIONS[browserName]);
    // Every action on the browser or its pages adds a listener to the
    // Puppeteer.Connection.Events.Disconnected event. This is a temporary
    // workaround for the Node runtime warning that is emitted once 11 listeners
    // are added to the same object.
    browser._connection.setMaxListeners(9999);
    return browser;
  } catch (error) {
    log('fatal', error);
  }
}

/**
 * Opens a new browser tab, resizes its viewport, and returns a Page handler.
 *
 * @param {!puppeteer.Browser} browser a Puppeteer controlled browser.
 * @param {JsonObject} viewport optional viewport size object with numeric
 *     fields `width` and `height`.
 * @return {!Promise<!Puppeteer.Page>}
 */
async function newPage(browser, viewport = null) {
  log('verbose', 'Creating new tab');

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
  await page.setJavaScriptEnabled(true);
  await page.setRequestInterception(true);
  page.on('request', interceptedRequest => {
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
        colors.yellow(requestUrl.href),
        'with file',
        colors.cyan(mockedFilepath)
      );
      return interceptedRequest.respond(fs.readFileSync(mockedFilepath));
    } else {
      log(
        'verbose',
        'Blocked external network request for',
        colors.yellow(requestUrl.href)
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
 * @param {JsonObject} viewport optional viewport size object with numeric
 *     fields `width` and `height`.
 */
async function resetPage(page, viewport = null) {
  const width = viewport ? viewport.width : VIEWPORT_WIDTH;
  const height = viewport ? viewport.height : VIEWPORT_HEIGHT;

  log(
    'verbose',
    'Resetting tab to',
    colors.yellow('about:blank'),
    'with size',
    colors.yellow(`${width}×${height}`)
  );

  await page.goto('about:blank');
  await page.setViewport({width, height});
}

/**
 * Adds a test error and logs it if running locally (not on Travis).
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
  if (!isTravisBuild()) {
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
    colors.yellow(testError.name),
    '\n  ',
    testError.message,
    '\n  ',
    testError.error
  );
  if (testError.consoleMessages.length > 0) {
    log(
      'error',
      colors.cyan(testError.consoleMessages.length),
      'Console messages in the browser so far:'
    );
    for (const message of testError.consoleMessages) {
      log('error', colors.cyan(`[console.${message.type()}]`), message.text());
    }
  }
}

/**
 * Runs the visual tests.
 *
 * @param {string} browserName either "chrome" or "firefox".
 * @param {!Array<JsonObject>} webpages an array of JSON objects containing
 *     details about the pages to snapshot.
 */
async function runVisualTests(browserName, webpages) {
  // Create a Percy client and start a build.
  if (process.env['PERCY_TARGET_COMMIT']) {
    log(
      'info',
      'The Percy build is baselined on top of commit',
      colors.cyan(shortSha(process.env['PERCY_TARGET_COMMIT']))
    );
  }

  // Take the snapshots.
  await generateSnapshots(browserName, webpages);
}

/**
 * Sets the AMP config, launches a server, and generates Percy snapshots for a
 * set of given webpages.
 *
 * @param {string} browserName either "chrome" or "firefox".
 * @param {!Array<JsonObject>} webpages an array of JSON objects containing
 *     details about the pages to snapshot.
 */
async function generateSnapshots(browserName, webpages) {
  webpages = filterWebPages_(webpages);
  const browser = await launchBrowser(browserName);
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
 * Filter the web pages based on the process flags.
 *
 * @param {!Array<!JsonObject>} webpages an array of JSON objects containing
 *     details about the webpages to snapshot.
 * @return {!Array<!JsonObject>} the same array, filtered.
 */
function filterWebPages_(webpages) {
  const numUnfilteredPages = webpages.length;
  webpages = webpages.filter(webpage => !webpage.flaky);
  if (numUnfilteredPages != webpages.length) {
    log(
      'info',
      'Skipping',
      colors.cyan(numUnfilteredPages - webpages.length),
      'flaky pages'
    );
  }
  if (argv.grep) {
    webpages = webpages.filter(webpage => argv.grep.test(webpage.name));
    log(
      'info',
      colors.cyan(`--grep ${argv.grep}`),
      'matched',
      colors.cyan(webpages.length),
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
          colors.cyan(webpage.interactive_tests),
          'for test',
          colors.cyan(webpage.name),
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
      colors.cyan(totalTests),
      'visual diff tests on',
      colors.cyan(webpages.length),
      'pages'
    );
  }
  return webpages;
}

/**
 * Generates Percy snapshots for a set of given webpages.
 *
 * @param {!puppeteer.Browser} browser a Puppeteer controlled browser.
 * @param {!Array<!JsonObject>} webpages an array of JSON objects containing
 *     details about the webpages to snapshot.
 * @return {boolean} true if all tests passed locally (does not indicate whether
 *     the tests passed on Percy).
 */
async function snapshotWebpages(browser, webpages) {
  const availablePages = [];

  log('verbose', 'Preallocating', colors.cyan(MAX_PARALLEL_TABS), 'tabs...');
  for (let i = 0; i < MAX_PARALLEL_TABS; i++) {
    availablePages.push(await newPage(browser));
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
      await resetPage(page, viewport);

      const consoleMessages = [];
      const consoleLogger = consoleMessage => {
        consoleMessages.push(consoleMessage);
      };
      page.on('console', consoleLogger);

      const name = testName ? `${pageName} (${testName})` : pageName;
      log('info', 'Starting test', colors.yellow(name));

      // Puppeteer is flaky when it comes to catching navigation requests, so
      // retry the page navigation up to NAVIGATE_RETRIES times and eventually
      // ignore a final timeout. If this ends up being a real non-loading page
      // error, this will be caught in the resulting Percy build. Also attempt
      // to wait until there are no more network requests. This method is flaky
      // since Puppeteer doesn't always understand Chrome's network activity, so
      // ignore timeouts again.
      const pagePromise = (async () => {
        const responseWatcher = new Promise((resolve, reject) => {
          const responseTimeout = setTimeout(() => {
            reject(
              new puppeteer.TimeoutError(
                `Response was not received in test ${testName} for page ` +
                  `${webpage.url} after ${NAVIGATE_TIMEOUT_MS}ms`
              )
            );
          }, NAVIGATE_TIMEOUT_MS);

          page.once('response', async response => {
            log(
              'verbose',
              'Response for url',
              colors.yellow(response.url()),
              'with status',
              colors.cyan(response.status()),
              colors.cyan(response.statusText())
            );
            clearTimeout(responseTimeout);
            resolve();
          });
        });

        log('verbose', 'Navigating to page', colors.yellow(webpage.url));
        await Promise.all([
          responseWatcher,
          page.goto(fullUrl, {waitUntil: 'networkidle2'}),
        ]);
      })()
        .then(() => {
          log(
            'verbose',
            'Page navigation of test',
            colors.yellow(name),
            'is done, verifying page'
          );
        })
        .catch(navigationError => {
          hasWarnings = true;
          addTestError(
            testErrors,
            name,
            'The browser test runner failed to complete the navigation ' +
              'to the test page',
            navigationError,
            consoleMessages
          );
          if (!isTravisBuild()) {
            log('warning', 'Continuing to verify page regardless...');
          }
        })
        .then(async () => {
          // Perform visibility checks: wait for all AMP built-in loader dots
          // to disappear (i.e., all visible components are finished being
          // layed out and external resources such as images are loaded and
          // displayed), then, depending on the test configurations, wait for
          // invisibility/visibility of specific elements that match the
          // configured CSS selectors.
          await waitForLoaderDots(page, name);
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
              colors.cyan(`${webpage.loading_complete_delay_ms}ms`),
              'for loading to complete'
            );
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
          const snapshotOptions = {...DEFAULT_SNAPSHOT_OPTIONS};
          if (webpage.enable_percy_javascript) {
            snapshotOptions.enableJavaScript = true;
          }

          if (viewport) {
            snapshotOptions.widths = [viewport.width];
            log('verbose', 'Wrapping viewport-constrained page in an iframe');
            await page.evaluate(
              WRAP_IN_IFRAME_SNIPPET.replace(
                /__WIDTH__/g,
                viewport.width
              ).replace(/__HEIGHT__/g, viewport.height)
            );
          }

          // Finally, send the snapshot to percy.
          await percySnapshot(page, name, snapshotOptions);
        })
        .catch(async testError => {
          addTestError(
            testErrors,
            name,
            'Unknown failure in test page',
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
        })
        .finally(async () => {
          log(
            hasWarnings ? 'warning' : 'info',
            'Finished test',
            colors.yellow(name),
            hasWarnings ? 'with warnings' : ''
          );
          page.removeListener('console', consoleLogger);
          availablePages.push(page);
        });
      pagePromises.push(pagePromise);
    }
  }

  await Promise.all(pagePromises);
  if (isTravisBuild() && testErrors.length > 0) {
    testErrors.sort((a, b) => a.name.localeCompare(b.name));
    log(
      'info',
      colors.yellow('Tests warnings and errors:'),
      'expand this section'
    );
    console./*OK*/ log('travis_fold:start:visual_tests\n');
    testErrors.forEach(logTestError);
    console./*OK*/ log('travis_fold:end:visual_tests');
    return false;
  }
  return true;
}

/**
 * Enables debugging if requested via command line.
 */
function setDebuggingLevel() {
  if (argv.debug) {
    argv['browser_debug'] = true;
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
 * @param {string} browserName either "chrome" or "firefox".
 */
async function createEmptyBuild(browserName) {
  log('info', 'Skipping visual diff tests and generating a blank Percy build');

  const browser = await launchBrowser(browserName);
  const page = await newPage(browser);

  await page
    .goto(`http://${HOST}:${PORT}/examples/visual-tests/blank-page/blank.html`)
    .then(
      () => {},
      () => {}
    );
  await percySnapshot(page, 'Blank page', SNAPSHOT_SINGLE_BUILD_OPTIONS);
  addCleanupStep_(async () => {
    await browser.close();
  });
}

/**
 * Runs the AMP visual diff tests.
 * @return {!Promise}
 */
async function visualDiff() {
  const handlerProcess = createCtrlcHandler('visual-diff');
  ensureOrBuildAmpRuntimeInTestMode_();
  installPercy_();
  maybeOverridePercyEnvironmentVariables();
  setPercyBranch();
  setPercyTargetCommit();

  if (argv.grep) {
    argv.grep = RegExp(argv.grep);
  }

  await performVisualTests();
  exitCtrlcHandler(handlerProcess);
}

/**
 * Runs the AMP visual diff tests.
 */
async function performVisualTests() {
  setDebuggingLevel();
  if (
    !argv.percy_disabled &&
    (!process.env.PERCY_TOKEN_CHROME || !process.env.PERCY_TOKEN_FIREFOX)
  ) {
    log(
      'fatal',
      'Could not find the',
      colors.cyan('PERCY_TOKEN_CHROME'),
      'and/or',
      colors.cyan('PERCY_TOKEN_FIREFOX'),
      'environment variables'
    );
  }

  // Launch a local web server.
  await launchWebServer();

  for (const browserName of ['chrome', 'firefox']) {
    log('info', 'Executing visual diff tests on', colors.cyan(browserName));

    // Start the Percy agent.
    process.env.PERCY_TOKEN =
      process.env[`PERCY_TOKEN_${browserName.toUpperCase()}`];
    const percyAgentProcess = await launchPercyAgent();

    if (argv.empty) {
      await createEmptyBuild();
    } else {
      // Load and parse the config. Use JSON5 due to JSON comments in file.
      const visualTestsConfig = JSON5.parse(
        fs.readFileSync(
          path.resolve(__dirname, '../../../test/visual-diff/visual-tests'),
          'utf8'
        )
      );
      await runVisualTests(browserName, visualTestsConfig.webpages);
    }
    await exitPercyAgent_(percyAgentProcess);
  }

  stopServer();
}

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
        colors.cyan('gulp dist --fortesting'),
        'or remove the',
        colors.cyan('--nobuild'),
        'option from this command'
      );
    }
  } else {
    execOrDie('gulp clean');
    execOrDie(`gulp dist --fortesting --config ${argv.config}`);
  }
}

function installPercy_() {
  if (!argv.noyarn) {
    installPackages(__dirname);
  }

  puppeteer = require('puppeteer');
  percySnapshot = require('@percy/puppeteer').percySnapshot;
}

/**
 * Add a cleanup action on exit or crashes.
 *
 * @param {Function} callback function to execute when cleaning up.
 */
function addCleanupStep_(callback) {
  process.on('exit', callback);
  process.on('SIGINT', callback);
  process.on('uncaughtException', callback);
  process.on('unhandledRejection', callback);
}

async function exitPercyAgent_(percyAgentProcess) {
  if (percyAgentProcess && !percyAgentProcess.killed) {
    let resolver;
    const percyAgentExited_ = new Promise(resolverIn => {
      resolver = resolverIn;
    });
    percyAgentProcess.on('exit', () => {
      resolver();
    });
    // Explicitly exit the process by "Ctrl+C"-ing it.
    await percyAgentProcess.kill('SIGINT');
    await percyAgentExited_;
  }
}

module.exports = {
  visualDiff,
};

visualDiff.description = 'Runs the AMP visual diff tests.';
visualDiff.flags = {
  'master': '  Includes a blank snapshot (baseline for skipped builds)',
  'empty': '  Creates a dummy Percy build with only a blank snapshot',
  'config':
    '  Sets the runtime\'s AMP_CONFIG to one of "prod" (default) or "canary"',
  'browser_debug': '  Prints debug info from the browser',
  'webserver_debug': '  Prints debug info from the local gulp webserver',
  'percy_agent_debug': '  Prints debug info from the @percy/agent instance',
  'debug': '  Sets all debugging flags',
  'verbose': '  Prints verbose log statements',
  'grep': '  Runs tests that match the pattern',
  'percy_token_chrome': '  Set the percy token for the Chrome Percy project',
  'percy_token_firefox': '  Set the percy token for the Firefox Percy project',
  'percy_branch': '  Override the PERCY_BRANCH environment variable',
  'percy_disabled':
    '  Disables Percy integration (for testing local changes only)',
  'nobuild': '  Skip build',
  'noyarn': '  Skip calling yarn to install dependencies',
};
