'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const {cyan, yellow} = require('kleur/colors');
const {HOST} = require('./consts');
const {log} = require('./log');
const puppeteer = require('puppeteer-core');
const {getStdout} = require('../../common/process');

const CHROME_BASENAMES = [
  'chrome',
  'google-chrome',
  'google-chrome-stable',
  'chromium',
];

const VIEWPORT_WIDTH = 1400;
const VIEWPORT_HEIGHT = 100000;

/**
 * Attempts to locale the full executable path for Chrome/Chromium.
 * @return {string}
 */
function locateChromeExecutablePath() {
  if (argv.executablePath) {
    return argv.executablePath;
  }
  for (const executableBaseName of CHROME_BASENAMES) {
    const executablePath = getStdout(`which ${executableBaseName}`).trim();
    if (executablePath) {
      return executablePath;
    }
  }
  throw new Error(
    `Could not locate Chrome/Chromium executable. Make sure it is on your $PATH (looking for any of {${CHROME_BASENAMES.join(', ')}}) or pass --executablePath to amp visual-diff`
  );
}

/**
 * Launches a Puppeteer controlled browser.
 *
 * @return {!Promise<!puppeteer.Browser>} a Puppeteer controlled browser.
 */
async function launchBrowser() {
  /** @type {import('puppeteer-core').LaunchOptions} */
  const browserOptions = {
    args: [
      '--disable-background-media-suspend',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-extensions',
      '--disable-gpu',
      '--disable-renderer-backgrounding',
      '--no-sandbox',
      '--no-startup-window',
    ],
    dumpio: argv.chrome_debug,
    headless: !argv.dev,
    executablePath: locateChromeExecutablePath(),
    waitForInitialPage: false,
  };
  return puppeteer.launch(browserOptions);
}

/**
 * Opens a new browser tab, resizes its viewport, and returns a Page handler.
 *
 * @param {!puppeteer.Browser} browser a Puppeteer controlled browser.
 * @param {?puppeteer.Viewport} viewport optional viewport size object with
 *     numeric fields `width` and `height`.
 * @return {Promise<!puppeteer.Page>}
 */
async function newPage(browser, viewport = null) {
  log('verbose', 'Creating new tab');

  const context = await browser.createBrowserContext();
  const page = await context.newPage();
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
      return interceptedRequest.respond({
        status: 200,
        body: new Uint8Array(fs.readFileSync(mockedFilepath)),
      });
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
 * @param {?puppeteer.Viewport} viewport optional viewport size object with
 *     numeric fields `width` and `height`.
 * @return {Promise<void>}
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

module.exports = {
  locateChromeExecutablePath,
  launchBrowser,
  newPage,
  resetPage,
};
