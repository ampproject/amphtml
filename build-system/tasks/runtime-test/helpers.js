'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const {cyan, green, red, yellow} = require('kleur/colors');
const {isCiBuild} = require('../../common/ci');
const {log, logWithoutTimestamp} = require('../../common/logging');
const {maybePrintCoverageMessage} = require('../helpers');
const {Server} = require('karma');

const CHROMEBASE = argv.chrome_canary ? 'ChromeCanary' : 'Chrome';
const chromeFlags = [];

/**
 * Returns an array of ad types.
 * @return {!Array<string>}
 */
function getAdTypes() {
  const namingExceptions = {
    // We recommend 3P ad networks use the same string for filename and type.
    // Write exceptions here in alphabetic order.
    // filename: [type1, type2, ... ]
    adblade: ['adblade', 'industrybrains'],
    mantis: ['mantis-display', 'mantis-recommend'],
    weborama: ['weborama-display'],
  };

  const adTypes = [];

  // Add ad types (google networks not included as they full support native
  // implementations).
  const files = fs.readdirSync('./ads/');
  for (let i = 0; i < files.length; i++) {
    if (
      path.extname(files[i]) == '.js' &&
      files[i][0] != '_' &&
      files[i] != 'ads.extern.js' &&
      files[i] != '.eslintrc.js'
    ) {
      const adType = path.basename(files[i], '.js');
      const expanded = namingExceptions[adType];
      if (expanded) {
        for (let j = 0; j < expanded.length; j++) {
          adTypes.push(expanded[j]);
        }
      } else {
        adTypes.push(adType);
      }
    }
  }
  return adTypes;
}

/**
 * Prints help messages for args if tests are being run for local development.
 */
function maybePrintArgvMessages() {
  if (argv.nohelp || isCiBuild()) {
    return;
  }

  const argvMessages = {
    safari: 'Running tests on Safari.',
    firefox: 'Running tests on Firefox.',
    ie: 'Running tests on IE.',
    edge: 'Running tests on Edge.',
    // eslint-disable-next-line
    chrome_canary: 'Running tests on Chrome Canary.',
    nobuild: 'Skipping build.',
    watch:
      'Enabling watch mode. Editing and saving a file will cause the' +
      ' tests for that file to be re-run in the same browser instance.',
    verbose: 'Enabling verbose mode. Expect lots of output!',
    testnames: 'Listing the names of all tests being run.',
    files: 'Running tests in the file(s): ' + cyan(argv.files),
    grep:
      'Only running tests that match the pattern "' + cyan(argv.grep) + '".',
    coverage: 'Running tests in code coverage mode.',
    headless: 'Running tests in a headless Chrome window.',
    // eslint-disable-next-line
    local_changes:
      'Running unit tests directly affected by the files' +
      ' changed in the local branch.',
    minified: 'Running tests in minified mode.',
    stable: 'Running tests only on stable browsers.',
    beta: 'Running tests only on beta browsers.',
  };
  if (argv.chrome_flags) {
    log(
      green('Launching'),
      cyan(CHROMEBASE),
      green('with flags'),
      cyan(`${chromeFlags}`)
    );
  }

  log(
    green('Run'),
    cyan('amp --tasks'),
    green('to see a list of all test flags.')
  );
  log(green('⤷ Use'), cyan('--nohelp'), green('to silence these messages.'));
  log(
    green('⤷ Use'),
    cyan('--local_changes'),
    green('to run unit tests from files commited to the local branch.')
  );
  if (!argv.testnames && !argv.files && !argv.local_changes) {
    log(
      green('⤷ Use'),
      cyan('--testnames'),
      green('to see the names of all tests being run.')
    );
  }
  if (!argv.headless) {
    log(
      green('⤷ Use'),
      cyan('--headless'),
      green('to run tests in a headless Chrome window.')
    );
  }
  if (argv.minified) {
    log(green('Running tests against minified code.'));
  } else {
    log(green('Running tests against unminified code.'));
  }
  Object.keys(argv).forEach((arg) => {
    /** @type {string} */
    const message = argvMessages[arg];
    if (message) {
      log(yellow(`--${arg}:`), green(message));
    }
  });
}

/**
 * @param {object} browser
 * @return {Promise<void>}
 * @private
 */
async function karmaBrowserComplete_(browser) {
  const result = browser.lastResult;
  result.total = result.success + result.failed + result.skipped;
  // This used to be a warning with karma-browserify. See #16851 and #24957.
  // Now, with karma-esbuild, this is a fatal error. See #34040.
  if (result.total == 0) {
    log(
      red('ERROR:'),
      'Karma returned a result with zero tests.',
      'This usually indicates a transformation error. See logs above.'
    );
    log(cyan(JSON.stringify(result)));
    process.exit(1);
  }
}

/**
 * @private
 */
function karmaBrowserStart_() {
  logWithoutTimestamp('\n');
  log(green('Done. Running tests...'));
}

/**
 * Creates and starts karma server
 * @param {!Object} config
 * @return {!Promise<number>}
 */
async function createKarmaServer(config) {
  let resolver;
  const deferred = new Promise((resolverIn) => {
    resolver = resolverIn;
  });

  const karmaServer = new Server(config, (exitCode) => {
    maybePrintCoverageMessage('test/coverage/index.html');
    resolver(exitCode);
  });

  karmaServer
    .on('browser_start', karmaBrowserStart_)
    .on('browser_complete', karmaBrowserComplete_);

  karmaServer.start();

  return deferred;
}

module.exports = {
  createKarmaServer,
  getAdTypes,
  maybePrintArgvMessages,
};
