'use strict';

/**
 * @fileoverview Karma browser configurations used by unit / integration tests.
 */

const argv = require('minimist')(process.argv.slice(2));
const {isCiBuild} = require('../../common/ci');

const DEFAULT_CHROME_FLAGS = [
  // Dramatically speeds up iframe creation.
  '--disable-extensions',
  // Allows simulating user actions (e.g unmute) which will otherwise be denied.
  '--autoplay-policy=no-user-gesture-required',
  // Makes debugging easy by auto-opening devtools.
  argv.debug ? '--auto-open-devtools-for-tabs' : null,
  // There's no guarantee of a browser UI during CI.
  // https://developers.google.com/web/updates/2017/04/headless-chrome#frontend
  isCiBuild() ? '--no-sandbox' : null,
  // These flags are equired in headless mode.
  // https://github.com/karma-runner/karma-chrome-launcher/issues/175
  argv.headless ? '--remote-debugging-port=9222' : null,
  argv.headless ? "--proxy-server='direct://'" : null,
  argv.headless ? '--proxy-bypass-list=*' : null,
].filter(Boolean);

const customLaunchers = {
  ChromeCustom: {
    base: argv.headless
      ? 'ChromeHeadless'
      : argv.chrome_canary
        ? 'ChromeCanary'
        : 'Chrome',
    flags: argv.chrome_flags
      ? argv.chrome_flags.split(',').map((flag) => `--${flag}`)
      : DEFAULT_CHROME_FLAGS,
  },
  SafariCustom: {
    base: 'SafariNative',
  },
  FirefoxCustom: {
    base: 'Firefox',
    flags: argv.headless ? ['-headless'] : [],
  },
  EdgeCustom: {
    base: argv.headless ? 'EdgeHeadless' : 'Edge',
    flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  },
};

module.exports = {
  customLaunchers,
};
