'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {green, red, yellow} = require('kleur/colors');
const {log: logBase} = require('../../common/logging');

/** @typedef {import('puppeteer-core')} puppeteer */
/** @typedef {import('puppeteer-core').Page} puppeteer.Page */

/**
 * Logs a message to the console.
 *
 * @param {string} mode
 * @param {!Array<*>} messages
 */
function log(mode, ...messages) {
  switch (mode) {
    case 'verbose':
      if (argv.verbose) {
        logBase(green('VERBOSE:'), ...messages);
      }
      break;
    case 'info':
      logBase(green('INFO:'), ...messages);
      break;
    case 'warning':
      logBase(yellow('WARNING:'), ...messages);
      break;
    case 'error':
      logBase(red('ERROR:'), ...messages);
      break;
    case 'fatal':
      process.exitCode = 1;
      logBase(red('FATAL:'), ...messages);
      throw new Error(messages.join(' '));
  }
}

/**
 * Pretty-prints the current test status of each page.
 * @param {!Array<!puppeteer.Page>} allPages
 * @param {!Array<!puppeteer.Page>} availablePages
 * @param {!puppeteer.Page} thisPage
 * @param {string} thisPageText
 * @return {string}
 */
function drawBoxes(allPages, availablePages, thisPage, thisPageText) {
  return (
    '[' +
    allPages
      .map((page) => {
        if (page === thisPage) {
          return thisPageText;
        } else if (availablePages.includes(page)) {
          return ' ';
        } else {
          return yellow('█');
        }
      })
      .join(' ') +
    ']'
  );
}

module.exports = {
  drawBoxes,
  log,
};
