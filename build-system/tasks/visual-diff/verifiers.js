'use strict';

const {cyan} = require('kleur/colors');
const {log} = require('./log');
const {sleep} = require('./helpers');
const {VisibilityDef} = require('./types');

const CSS_SELECTOR_RETRY_MS = 200;
const CSS_SELECTOR_TIMEOUT_MS = 10000;

/** @typedef {import('puppeteer-core')} puppeteer */
/** @typedef {import('puppeteer-core').Page} puppeteer.Page */

/**
 * Verifies that all CSS elements are as expected before taking a snapshot.
 *
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 * @param {string} testName the full name of the test.
 * @param {!Array<string>} selectors Array of CSS selector that must eventually
 *     be removed from the page.
 * @param {number} timeoutMillis how long to retry.
 * @return {Promise<void>}
 * @throws {Error} an encountered error.
 */
async function verifySelectorsInvisible(
  page,
  testName,
  selectors,
  timeoutMillis = CSS_SELECTOR_TIMEOUT_MS
) {
  log(
    'verbose',
    'Waiting for invisibility of all:',
    cyan(selectors.join(', '))
  );
  try {
    await Promise.all(
      selectors.map((selector) =>
        waitForElementVisibility(page, selector, {hidden: true}, timeoutMillis)
      )
    );
  } catch (e) {
    throw new Error(
      `${cyan(testName)} | An element with the CSS ` +
        `selector ${cyan(e.message)} is still visible after ` +
        `${CSS_SELECTOR_TIMEOUT_MS} ms`
    );
  }
}

/**
 * Verifies that all CSS elements are as expected before taking a snapshot.
 *
 * @param {!puppeteer.Page} page a Puppeteer control browser tab/page.
 * @param {string} testName the full name of the test.
 * @param {!Array<string>} selectors Array of CSS selectors that must
 *     eventually appear on the page.
 * @param {number} timeoutMillis how long to retry.
 * @return {Promise<void>}
 * @throws {Error} an encountered error.
 */
async function verifySelectorsVisible(
  page,
  testName,
  selectors,
  timeoutMillis = CSS_SELECTOR_TIMEOUT_MS
) {
  log('verbose', 'Waiting for existence of all:', cyan(selectors.join(', ')));
  try {
    await Promise.all(
      selectors.map((selector) =>
        waitForSelectorExistence(page, selector, timeoutMillis)
      )
    );
  } catch (e) {
    throw new Error(
      `${cyan(testName)} | The CSS selector ` +
        `${cyan(e.message)} does not match any elements in the page`
    );
  }

  log('verbose', 'Waiting for visibility of all:', cyan(selectors.join(', ')));
  try {
    await Promise.all(
      selectors.map((selector) =>
        waitForElementVisibility(page, selector, {visible: true}, timeoutMillis)
      )
    );
  } catch (e) {
    throw new Error(
      `${cyan(testName)} | An element with the CSS ` +
        `selector ${cyan(e.message)} is still invisible after ` +
        `${CSS_SELECTOR_TIMEOUT_MS} ms`
    );
  }
}

/**
 * Wait for all AMP loader indicators to disappear.
 *
 * @param {!puppeteer.Page} page page to wait on.
 * @param {string} testName the full name of the test.
 * @param {number} timeoutMillis how long to retry.
 * @return {Promise<void>}
 * @throws {Error} an encountered error.
 */
async function waitForPageLoad(
  page,
  testName,
  timeoutMillis = CSS_SELECTOR_TIMEOUT_MS
) {
  const allLoadersGone = await waitForElementVisibility(
    page,
    '[class~="i-amphtml-loader"], [class~="i-amphtml-loading"]',
    {hidden: true},
    timeoutMillis
  );
  if (!allLoadersGone) {
    throw new Error(
      `${cyan(testName)} still has the AMP loader dot ` +
        `after ${CSS_SELECTOR_TIMEOUT_MS} ms`
    );
  }
}

/**
 * Wait until the element is either hidden or visible or until timed out.
 *
 * Timeout is set to CSS_SELECTOR_RETRY_MS * CSS_SELECTOR_RETRY_ATTEMPTS ms.
 *
 * @param {!puppeteer.Page} page page to check the visibility of elements in.
 * @param {string} selector CSS selector for elements to wait on.
 * @param {!VisibilityDef} options with key 'visible' OR 'hidden' set to true.
 * @param {number} timeoutMillis how long to retry.
 * @return {Promise<boolean>} true if the expectation is met before the timeout.
 * @throws {Error} if the expectation is not met before the timeout, throws an
 *      error with the message value set to the CSS selector.
 */
async function waitForElementVisibility(
  page,
  selector,
  options,
  timeoutMillis
) {
  const waitForVisible = Boolean(options['visible']);
  const waitForHidden = Boolean(options['hidden']);
  if (waitForVisible == waitForHidden) {
    log(
      'fatal',
      'waitForElementVisibility must be called with exactly one of',
      "'visible' or 'hidden' set to true."
    );
  }

  const startTime = Date.now();
  do {
    const elementsAreVisible = [];

    for (const elementHandle of await page.$$(selector)) {
      const boundingBox = await elementHandle.boundingBox();
      const elementIsVisible =
        boundingBox != null && boundingBox.height > 0 && boundingBox.width > 0;
      elementsAreVisible.push(elementIsVisible);
    }

    if (elementsAreVisible.length) {
      log(
        'verbose',
        'Found',
        cyan(elementsAreVisible.length),
        'element(s) matching the CSS selector',
        cyan(selector)
      );
      log(
        'verbose',
        'Expecting all element visibilities to be',
        cyan(waitForVisible),
        '; they are:',
        cyan(elementsAreVisible.join(', '))
      );
    } else {
      log('verbose', 'No', cyan(selector), 'matches found');
    }
    // Since we assert that waitForVisible == !waitForHidden, there is no need
    // to check equality to both waitForVisible and waitForHidden.
    if (
      elementsAreVisible.every(
        (elementIsVisible) => elementIsVisible == waitForVisible
      )
    ) {
      return true;
    }

    await sleep(CSS_SELECTOR_RETRY_MS);
  } while (Date.now() < startTime + timeoutMillis);
  throw new Error(selector);
}

/**
 * Wait until the CSS selector exists in the page or until timed out.
 *
 * Timeout is set to CSS_SELECTOR_RETRY_MS * CSS_SELECTOR_RETRY_ATTEMPTS ms.
 *
 * @param {!puppeteer.Page} page page to check the existence of the selector in.
 * @param {string} selector CSS selector.
 * @param {number} timeoutMillis how long to retry.
 * @return {Promise<boolean>} true if the element exists before the timeout.
 * @throws {Error} if the element does not exist before the timeout, throws an
 *    error with the message value set to the CSS selector.
 */
async function waitForSelectorExistence(page, selector, timeoutMillis) {
  const startTime = Date.now();
  do {
    if ((await page.$(selector)) !== null) {
      return true;
    }
    await sleep(CSS_SELECTOR_RETRY_MS);
  } while (Date.now() < startTime + timeoutMillis);
  throw new Error(selector);
}

module.exports = {
  waitForPageLoad,
  verifySelectorsInvisible,
  verifySelectorsVisible,
};
