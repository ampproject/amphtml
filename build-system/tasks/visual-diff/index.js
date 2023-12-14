'use strict';

const argv = require('minimist')(process.argv.slice(2));
const atob = require('atob');
const fs = require('fs');
const JSON5 = require('json5');
const os = require('os');
const path = require('path');
const PercyModulePromise = import('@percy/core');
const percySnapshot = require('@percy/puppeteer');
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../../common/ctrlcHandler');
const {
  gitBranchName,
  gitCiMainBaseline,
  gitCommitterEmail,
  shortSha,
} = require('../../common/git');
const {
  fetchBrowserExecutablePath,
  launchBrowser,
  newPage,
  resetPage,
} = require('./browser');
const {
  verifySelectorsInvisible,
  verifySelectorsVisible,
  waitForPageLoad,
} = require('./verifiers');
const {BASE_TEST_FUNCTION, HOST, PORT} = require('./consts');
const {cyan, green, red, yellow} = require('kleur/colors');
const {devMode} = require('./dev-mode');
const {drawBoxes, log} = require('./log');
const {escapeHtml, sleep} = require('./helpers');
const {isCiBuild} = require('../../common/ci');
const {isPercyEnabled} = require('@percy/sdk-utils');
const {startServer, stopServer} = require('../serve');
const {TestErrorDef, WebpageDef} = require('./types');

/** @typedef {import('@percy/core').default} Percy */
/** @typedef {import('puppeteer-core')} puppeteer */
/** @typedef {import('puppeteer-core').Browser} puppeteer.Browser */
/** @typedef {import('puppeteer-core').ConsoleMessage} puppeteer.ConsoleMessage */

// CSS injected in every page tested.
// Normally, as in https://docs.percy.io/docs/percy-specific-css
// Otherwise, as a <style> in an iframe, see snippets/iframe-wrapper.js
const percyCss = [
  // Loader animation may otherwise be captured in slightly different points,
  // causing the test to flake.
  '.i-amphtml-new-loader * { animation: none !important; }',
].join('\n');

const SNAPSHOT_SINGLE_BUILD_OPTIONS = {
  widths: [375],
};
const PERCY_AGENT_PORT = 5338;
const WAIT_FOR_TABS_MS = 1000;
const WAIT_FOR_AGENT_MS = 5000;

// Multiple tabs speed up the performance of the visual diff tests.
const MAX_PARALLEL_TABS = os.cpus().length;

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
const FREEZE_CANVAS_IMAGE_SNIPPET = fs.readFileSync(
  path.resolve(__dirname, 'snippets/freeze-canvas-image.js'),
  'utf8'
);
const REMOVE_NO_SCRIPT_ELEMENT_SNIPPET = fs.readFileSync(
  path.resolve(__dirname, 'snippets/remove-no-script.js'),
  'utf8'
);
// HTML snippet to create an error page snapshot.
const SNAPSHOT_ERROR_SNIPPET = fs.readFileSync(
  path.resolve(__dirname, 'snippets/snapshot-error.html'),
  'utf8'
);

/**
 * Decode the write-only Percy token during CI builds.
 */
function decodePercyTokenForCi() {
  if (isCiBuild()) {
    process.env['PERCY_TOKEN'] = atob(process.env.PERCY_TOKEN_ENCODED || '');
  }
}

/**
 * Override PERCY_* environment variables if passed via amp task parameters.
 */
function maybeOverridePercyEnvironmentVariables() {
  ['percy_token', 'percy_branch'].forEach((variable) => {
    if (variable in argv) {
      process.env[variable.toUpperCase()] = argv[variable];
    }
  });
  if (argv.empty) {
    process.env['PERCY_PARTIAL_BUILD'] = '1';
  }
}

/**
 * Disambiguates branch names by decorating them with the commit author name.
 * We do this for all non-push builds in order to prevent them from being used
 * as baselines for future builds.
 */
function setPercyBranch() {
  if (!process.env['PERCY_BRANCH'] && (!argv.main || !isCiBuild())) {
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
 * Only does something during CI, and for non-main branches, since main branch
 * builds are always built on top of the previous commit (we use the squash and
 * merge method for pull requests.)
 */
function setPercyTargetCommit() {
  if (isCiBuild() && !argv.main) {
    process.env['PERCY_TARGET_COMMIT'] = gitCiMainBaseline();
  }
}

/**
 * Launches a Percy agent instance.
 *
 * @param {string} executablePath browser executable path.
 * @return {!Promise<Percy|undefined>} percy agent instance.
 */
async function launchPercyAgent(executablePath) {
  if (argv.percy_disabled) {
    return;
  }

  const {default: PercyModule} = await PercyModulePromise;
  const percy = await PercyModule.start({
    token: process.env.PERCY_TOKEN,
    loglevel: argv.percy_agent_debug ? 'debug' : 'info',
    port: PERCY_AGENT_PORT,
    config: path.join(__dirname, '.percy.yaml'),
    discovery: {
      launchOptions: {
        executable: executablePath,
      },
    },
  });

  await new Promise((resolve, reject) => {
    const percyIsEnabledTimeout = setTimeout(() => {
      log('fatal', 'Percy agent is unreachable after', WAIT_FOR_AGENT_MS, 'ms');
      reject(false);
    }, WAIT_FOR_AGENT_MS);

    while (true) {
      try {
        if (isPercyEnabled()) {
          clearTimeout(percyIsEnabledTimeout);
          log(
            'info',
            'Percy agent is enabled and reachable on port',
            PERCY_AGENT_PORT
          );
          return resolve(true);
        }
      } catch {
        // Ignore transient errors. Promise will reject after WAIT_FOR_AGENT_MS.
      }
    }
  });

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
 * Adds a test error and logs it if running locally (not as part of CI).
 *
 * @param {!Array<!TestErrorDef>} testErrors array of testError objects.
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
 * @param {!TestErrorDef} testError object as created by addTestError.
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
 * @param {!Array<!WebpageDef>} webpages details about the pages to snapshot.
 * @return {Promise<void>}
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
      webpage.tests_[''] = BASE_TEST_FUNCTION;
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

  if (argv.main) {
    const page = await newPage(browser);
    await page.goto(
      `http://${HOST}:${PORT}/examples/visual-tests/blank-page/blank.html`
    );
    // @ts-ignore Type mismatch in library
    await percySnapshot(page, 'Blank page', SNAPSHOT_SINGLE_BUILD_OPTIONS);
  }

  if (argv.dev) {
    log('info', 'Running development mode...');
    await devMode(browser, webpages);
  } else {
    log('info', 'Generating snapshots...');
    if (!(await snapshotWebpages(browser, webpages))) {
      log('fatal', 'Some tests have failed locally.');
    }
  }
}

/**
 * Generates Percy snapshots for a set of given webpages.
 *
 * @param {!puppeteer.Browser} browser a Puppeteer controlled browser.
 * @param {!Array<!WebpageDef>} webpages an array of JSON objects containing
 *     details about the webpages to snapshot.
 * @return {Promise<boolean>} true if all tests passed locally (does not
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
    const {name: pageName, viewport} = webpage;
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
      const [page] = availablePages;
      availablePages.shift();

      const name = testName ? `${pageName} (${testName})` : pageName;
      log(
        'info',
        drawBoxes(allPages, availablePages, page, yellow('▄')),
        'Starting test',
        yellow(name)
      );

      await resetPage(page, viewport);

      const consoleMessages = [];
      const consoleLogger = (consoleMessage) => {
        consoleMessages.push(consoleMessage);
      };
      page.on('console', consoleLogger);

      const pagePromise = (async () => {
        try {
          log('verbose', 'Navigating to page', yellow(webpage.url));
          await page.goto(fullUrl, {waitUntil: 'networkidle0'});

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
          // @ts-ignore Type mismatch in library
          await percySnapshot(page, name, SNAPSHOT_SINGLE_BUILD_OPTIONS);
        }

        if (performSnapshot) {
          try {
            // Execute post-scripts that clean up the page's HTML and send
            // prepare it for snapshotting on Percy. See comments inside the
            // snippet files for description of each.
            await page.evaluate(REMOVE_AMP_SCRIPTS_SNIPPET);
            await page.evaluate(FREEZE_CANVAS_IMAGE_SNIPPET);
            await page.evaluate(REMOVE_NO_SCRIPT_ELEMENT_SNIPPET);

            // Create a default set of snapshot options for Percy and modify
            // them based on the test's configuration.
            const snapshotOptions = {};
            if (webpage.enable_percy_javascript) {
              snapshotOptions.enableJavaScript = true;
            }

            if (viewport) {
              const {height, width} = viewport;
              snapshotOptions.widths = [width];
              log('verbose', 'Wrapping viewport-constrained page in an iframe');
              await page.evaluate(
                WRAP_IN_IFRAME_SNIPPET.replace(/__WIDTH__/g, width.toString())
                  .replace(/__HEIGHT__/g, height.toString())
                  .replace(/__PERCY_CSS__/g, percyCss)
              );
            } else {
              snapshotOptions.percyCSS = percyCss;
            }

            // Finally, send the snapshot to percy.
            // @ts-ignore Type mismatch in library
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
          'info',
          drawBoxes(
            allPages,
            availablePages,
            page,
            (hasWarnings ? red : green)('▀')
          ),
          'Finished test',
          yellow(name),
          hasWarnings ? 'with warnings' : ''
        );
        page.off('console', consoleLogger);
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
 * @return {Promise<void>}
 */
async function createEmptyBuild(browser) {
  log('info', 'Generating the blank page snapshot');

  const page = await newPage(browser);

  try {
    await page.goto(
      `http://${HOST}:${PORT}/examples/visual-tests/blank-page/blank.html`
    );
  } catch {
    // Ignore failures
  }

  // @ts-ignore Type mismatch in library
  await percySnapshot(page, 'Blank page', SNAPSHOT_SINGLE_BUILD_OPTIONS);
}

/**
 * Runs the AMP visual diff tests.
 * @return {Promise<void>}
 */
async function visualDiff() {
  const handlerProcess = createCtrlcHandler('visual-diff');
  await ensureOrBuildAmpRuntimeInTestMode_();
  decodePercyTokenForCi();
  maybeOverridePercyEnvironmentVariables();
  setPercyBranch();
  setPercyTargetCommit();

  if (argv.grep) {
    argv.grep = RegExp(argv.grep);
  }

  if (argv.dev) {
    argv['percy_disabled'] = true;
  }

  if (!argv.percy_disabled && !process.env.PERCY_TOKEN) {
    log('fatal', 'Could not find', cyan('PERCY_TOKEN'), 'environment variable');
  }

  const executablePath = await fetchBrowserExecutablePath();
  const percy = await launchPercyAgent(executablePath);
  try {
    await performVisualTests(executablePath);
  } finally {
    await percy?.stop();
  }
  exitCtrlcHandler(handlerProcess);
}

/**
 * Runs the AMP visual diff tests.
 *
 * @param {string} executablePath browser executable path.
 * @return {Promise<void>}
 */
async function performVisualTests(executablePath) {
  setDebuggingLevel();

  const browser = await launchBrowser(executablePath);
  const handlerProcess = createCtrlcHandler(
    'visual-diff:browser',
    browser.process()?.pid
  );
  await startServer(
    {host: HOST, port: PORT},
    {quiet: !argv.webserver_debug},
    {minified: true}
  );

  try {
    if (!argv.empty) {
      // Load and parse the config. Use JSON5 due to JSON comments in file.
      const visualTestsConfig = JSON5.parse(
        fs.readFileSync(
          path.resolve(
            __dirname,
            '../../../test/visual-diff/visual-tests.jsonc'
          ),
          'utf8'
        )
      );
      await runVisualTests(browser, visualTestsConfig.webpages);
    }
    await createEmptyBuild(browser);
  } finally {
    await browser.close();
    exitCtrlcHandler(handlerProcess);
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

  const isBuiltInTestMode =
    fs.existsSync('dist/v0.js') &&
    /AMP_CONFIG=\{(?:.+,)?"test":(!0|true)\b/.test(
      fs.readFileSync('dist/v0.js', 'utf8')
    );
  if (!isBuiltInTestMode) {
    log(
      'fatal',
      'The AMP runtime was not built or not build in test mode. Run',
      cyan('amp dist --fortesting'),
      'before executing visual diff tests.'
    );
  }
}

module.exports = {
  visualDiff,
};

visualDiff.description = 'Run the AMP visual diff tests';
visualDiff.flags = {
  'main': 'Include a blank snapshot (baseline for skipped builds)',
  'empty': 'Create a dummy Percy build with only a blank snapshot',
  'esm': 'uses the typescript server transforms which will serve the mjs files',
  'chrome_debug': 'Print debug info from Chrome',
  'webserver_debug': 'Print debug info from the local amp webserver',
  'percy_agent_debug': 'Print debug info from the @percy/agent instance',
  'debug': 'Set all debugging flags',
  'verbose': 'Print verbose log statements',
  'grep': 'Run tests that match the pattern',
  'minified': 'Serve minified JS',
  'percy_token': 'Override the PERCY_TOKEN environment variable',
  'percy_branch': 'Override the PERCY_BRANCH environment variable',
  'percy_disabled':
    'Disable Percy integration (for testing local changes only)',
  'dev': 'Developer mode for creating and debugging tests',
};
