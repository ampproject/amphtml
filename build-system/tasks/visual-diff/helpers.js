/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

const colors = require('ansi-colors');
const fancyLog = require('fancy-log');
const sleep = require('sleep-promise');
const {isTravisBuild} = require('../../travis');

const CSS_SELECTOR_RETRY_MS = 200;
const CSS_SELECTOR_RETRY_ATTEMPTS = 50;
const CSS_SELECTOR_TIMEOUT_MS =
    CSS_SELECTOR_RETRY_MS * CSS_SELECTOR_RETRY_ATTEMPTS;

const HTML_ESCAPE_CHARS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
};
const HTML_ESCAPE_REGEX = /(&|<|>|"|'|`)/g;

/**
 * Escapes a string of HTML elements to HTML entities.
 *
 * @param {string} html HTML as string to escape.
 */
function escapeHtml(html) {
  return html.replace(HTML_ESCAPE_REGEX, c => HTML_ESCAPE_CHARS[c]);
}

/**
 * Logs a message to the console.
 *
 * @param {string} mode
 * @param {!Array<string>} messages
 */
function log(mode, ...messages) {
  switch (mode) {
    case 'verbose':
      if (isTravisBuild()) {
        return;
      }
      fancyLog.info(colors.green('VERBOSE:'), ...messages);
      break;
    case 'info':
      fancyLog.info(colors.green('INFO:'), ...messages);
      break;
    case 'warning':
      fancyLog.warn(colors.yellow('WARNING:'), ...messages);
      break;
    case 'error':
      fancyLog.error(colors.red('ERROR:'), ...messages);
      break;
    case 'fatal':
      process.exitCode = 1;
      fancyLog.error(colors.red('FATAL:'), ...messages);
      throw new Error(messages.join(' '));
    case 'travis':
      if (isTravisBuild()) {
        messages.forEach(message => process.stdout.write(message));
      }
      break;
  }
}

/**
 * Verifies that all CSS elements are as expected before taking a snapshot.
 *
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 * @param {string} testName the full name of the test.
 * @param {!Array<string>} selectors Array of CSS selector that must eventually
 *     be removed from the page.
 * @throws {Error} an encountered error.
 */
async function verifySelectorsInvisible(page, testName, selectors) {
  log('verbose', 'Waiting for invisibility of all:',
      colors.cyan(selectors.join(', ')));
  try {
    await Promise.all(selectors.map(
        selector => waitForElementVisibility(page, selector, {hidden: true})));
  } catch (e) {
    throw new Error(`${colors.cyan(testName)} | An element with the CSS ` +
        `selector ${colors.cyan(e.message)} is still visible after ` +
        `${CSS_SELECTOR_TIMEOUT_MS} ms`);
  }
}

/**
 * Verifies that all CSS elements are as expected before taking a snapshot.
 *
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 * @param {string} testName the full name of the test.
 * @param {!Array<string>} selectors Array of CSS selectors that must
 *     eventually appear on the page.
 * @throws {Error} an encountered error.
 */
async function verifySelectorsVisible(page, testName, selectors) {
  log('verbose', 'Waiting for existence of all:',
      colors.cyan(selectors.join(', ')));
  try {
    await Promise.all(
        selectors.map(selector => waitForSelectorExistence(page, selector)));
  } catch (e) {
    throw new Error(`${colors.cyan(testName)} | The CSS selector ` +
        `${colors.cyan(e.message)} does not match any elements in the page`);
  }

  log('verbose', 'Waiting for visibility of all:',
      colors.cyan(selectors.join(', ')));
  try {
    await Promise.all(selectors.map(
        selector => waitForElementVisibility(page, selector, {visible: true})));
  } catch (e) {
    throw new Error(`${colors.cyan(testName)} | An element with the CSS ` +
        `selector ${colors.cyan(e.message)} is still invisible after ` +
        `${CSS_SELECTOR_TIMEOUT_MS} ms`);
  }
}

/**
 * Wait for all AMP loader dot to disappear.
 *
 * @param {!puppeteer.Page} page page to wait on.
 * @param {string} testName the full name of the test.
 * @throws {Error} an encountered error.
 */
async function waitForLoaderDots(page, testName) {
  const allLoaderDotsGone = await waitForElementVisibility(
      page, '.i-amphtml-loader-dot', {hidden: true});
  if (!allLoaderDotsGone) {
    throw new Error(`${colors.cyan(testName)} still has the AMP loader dot ` +
        `after ${CSS_SELECTOR_TIMEOUT_MS} ms`);
  }
}

/**
 * Wait until the element is either hidden or visible or until timed out.
 *
 * Timeout is set to CSS_SELECTOR_RETRY_MS * CSS_SELECTOR_RETRY_ATTEMPTS ms.
 *
 * @param {!puppeteer.Page} page page to check the visibility of elements in.
 * @param {string} selector CSS selector for elements to wait on.
 * @param {!Object} options with key 'visible' OR 'hidden' set to true.
 * @return {boolean} true if the expectation is met before the timeout.
 * @throws {Error} if the expectation is not met before the timeout, throws an
 *    error with the message value set to the CSS selector.
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
  throw new Error(selector);
}

/**
 * Wait until the CSS selector exists in the page or until timed out.
 *
 * Timeout is set to CSS_SELECTOR_RETRY_MS * CSS_SELECTOR_RETRY_ATTEMPTS ms.
 *
 * @param {!puppeteer.Page} page page to check the existence of the selector in.
 * @param {string} selector CSS selector.
 * @return {boolean} true if the element exists before the timeout.
 * @throws {Error} if the element does not exist before the timeout, throws an
 *    error with the message value set to the CSS selector.
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
  throw new Error(selector);
}

module.exports = {
  escapeHtml,
  log,
  waitForLoaderDots,
  verifySelectorsInvisible,
  verifySelectorsVisible,
};
