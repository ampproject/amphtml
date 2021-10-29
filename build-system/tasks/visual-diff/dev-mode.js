'use strict';

const inquirer = require('inquirer');
const puppeteer = require('puppeteer'); // eslint-disable-line no-unused-vars
const {
  verifySelectorsInvisible,
  verifySelectorsVisible,
  waitForPageLoad,
} = require('./verifiers');
const {BASE_TEST_FUNCTION} = require('./consts');
const {cyan, yellow} = require('kleur/colors');
const {HOST, PORT} = require('./consts');
const {log} = require('./log');
const {newPage} = require('./browser');
const {sleep} = require('./helpers');
const {WebpageDef} = require('./types');

/**
 * Runs a development mode.
 *
 * @param {!puppeteer.Browser} browser a Puppeteer controlled browser.
 * @param {!Array<!WebpageDef>} webpages an array of JSON objects containing
 *     details about the webpages to snapshot.
 * @return {Promise<void>}
 */
async function devMode(browser, webpages) {
  /** @type {WebpageDef} */
  let webpage;
  if (webpages.length > 1) {
    webpage = (
      await inquirer.prompt([
        {
          type: 'list',
          name: 'webpage',
          message:
            'Select test name from ' +
            cyan('visual-diff.jsonc') +
            ' (use ' +
            cyan('--grep') +
            ' to filter this list):',
          choices: webpages.map((webpage) => ({
            name: webpage.name,
            value: webpage,
          })),
        },
      ])
    ).webpage;
  } else {
    webpage = webpages[0];
    log(
      'info',
      'Using test',
      yellow(webpage.name),
      '(Only one test matches the',
      cyan('--grep'),
      'value)'
    );
  }

  let testName = '';
  let testFunction = Object.values(webpage.tests_)[0];
  if (Object.entries(webpage.tests_).length > 1) {
    [testName, testFunction] = (
      await inquirer.prompt([
        {
          type: 'list',
          name: 'test_',
          message:
            'Select which interactive test from ' +
            cyan(webpage.interactive_tests) +
            ' to run:',
          choices: Object.entries(webpage.tests_).map(
            ([testName, testFunction]) => ({
              name: testName || '(base test)',
              value: [testName, testFunction],
            })
          ),
        },
      ])
    ).test_;
  }

  log('info', 'The test will now run in a browser window...');
  const page = await newPage(browser, webpage.viewport);
  await page.goto(`http://${HOST}:${PORT}/${webpage.url}`, {
    waitUntil: 'networkidle0',
  });

  while (true) {
    try {
      await waitForPageLoad(page, webpage.name);
    } catch {
      log('warning', 'Page did not finish loading all AMP components');
    }

    // Based on test configuration, wait for a specific amount of time.
    if (webpage.loading_complete_delay_ms) {
      log(
        'info',
        'Waiting',
        cyan(`${webpage.loading_complete_delay_ms}ms`),
        'for loading to complete'
      );
      await sleep(webpage.loading_complete_delay_ms);
    }

    if (testFunction !== BASE_TEST_FUNCTION) {
      log('info', 'Executing custom test function', cyan(testName));
      try {
        await testFunction(page, webpage.name);
      } catch (e) {
        log('warning', 'Custom test function did not execute correctly:', e);
      }
    }

    log('info', '- Type', cyan('CSS selector'), 'to verify that it is visible');
    log('info', '- Start with', cyan('!'), 'to verify invisibility');
    log('info', '- Press enter on', cyan('empty prompt'), 'to reload the page');
    log('info', '-', cyan('Ctrl + C'), 'to quit.');
    while (true) {
      /** @type {string} */
      let cssSelector = (
        await inquirer.prompt({
          type: 'input',
          name: 'cssSelector',
          message: '>',
          prefix: '',
        })
      ).cssSelector.trim();

      if (!cssSelector) {
        break;
      }

      const verifySelectors = cssSelector.startsWith('!')
        ? verifySelectorsInvisible
        : verifySelectorsVisible;
      const verifyingText = cssSelector.startsWith('!')
        ? 'invisible'
        : 'visible';
      if (cssSelector.startsWith('!')) {
        cssSelector = cssSelector.slice(1);
      }

      try {
        await verifySelectors(page, webpage.name, [cssSelector], 0);
        log(
          'info',
          'CSS selector',
          cyan(cssSelector),
          'is',
          cyan(verifyingText),
          'on the page as expected'
        );
      } catch (e) {
        log(
          'warning',
          'CSS selector',
          cyan(cssSelector),
          'is not',
          cyan(verifyingText),
          'on the page'
        );
      }
    }

    log('info', 'Reloading the page...');
    await page.reload({waitUntil: 'networkidle0'});
  }
}

module.exports = {
  devMode,
};
