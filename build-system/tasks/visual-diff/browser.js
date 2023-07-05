'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const {
  Browser: BrowserEnum,
  computeExecutablePath,
  getInstalledBrowsers,
  install,
} = require('@puppeteer/browsers');
const {cyan, yellow} = require('kleur/colors');
const {HOST} = require('./consts');
const {log} = require('./log');
const puppeteer = require('puppeteer-core');

const cacheDir = path.join(__dirname, '.cache');

// REPEATING TODO(@ampproject/wg-infra): Update this whenever the Percy backend
// starts using a new version of Chrome to render DOM snapshots.
//
// Steps:
// 1. Open a recent Percy build, and click the “ⓘ” icon
// 2. Note the Chrome major version at the bottom
// 3. Open https://chromiumdash.appspot.com/releases?platform=Linux
// 4. In the `Stable` table, look for the highest *full* version number that
//    matches the major version from Percy (which you noted in Step 2)
// 5. Click on the “ⓘ” icon next to it and note the Branch Base Position
// 6. Change the release platfrom to Mac and to Windows; verify that the same
//    exact full version number is available on all three platform. If it is
//    not, find the next highest one that does!
// 7. Update the value below:
const PUPPETEER_CHROMIUM_REVISION = '1097615'; // 111.0.5563.146

const VIEWPORT_WIDTH = 1400;
const VIEWPORT_HEIGHT = 100000;

/**
 * Launches a Puppeteer controlled browser.
 *
 * @param {string} executablePath browser executable path.
 * @return {!Promise<!puppeteer.Browser>} a Puppeteer controlled browser.
 */
async function launchBrowser(executablePath) {
  /** @type {"new" | false} */
  const headless = !argv.dev && 'new';
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
    headless,
    executablePath,
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

  const context = await browser.createIncognitoBrowserContext();
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
        body: fs.readFileSync(mockedFilepath),
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

/**
 * Returns the executable path of the browser, potentially installing and caching it.
 *
 * @return {Promise<string>}
 */
async function fetchBrowserExecutablePath() {
  const installedBrowsers = await getInstalledBrowsers({cacheDir});
  const installedBrowser = installedBrowsers.find(
    ({browser, buildId}) =>
      browser == BrowserEnum.CHROMIUM && buildId == PUPPETEER_CHROMIUM_REVISION
  );
  if (installedBrowser) {
    log(
      'info',
      'Using cached Percy-compatible version of Chromium',
      cyan(PUPPETEER_CHROMIUM_REVISION)
    );
  } else {
    log(
      'info',
      'Percy-compatible version of Chromium',
      cyan(PUPPETEER_CHROMIUM_REVISION),
      'was not found in cache. Downloading...'
    );
    let logThrottler = true;
    await install({
      cacheDir,
      browser: BrowserEnum.CHROMIUM,
      buildId: PUPPETEER_CHROMIUM_REVISION,
      downloadProgressCallback(downloadedBytes, totalBytes) {
        if (logThrottler) {
          log('info', downloadedBytes, '/', totalBytes, 'bytes');
          logThrottler = false;
          setTimeout(() => {
            logThrottler = true;
          }, 1000);
        } else if (downloadedBytes == totalBytes) {
          log(
            'info',
            'Finished downloading Chromium version',
            cyan(PUPPETEER_CHROMIUM_REVISION)
          );
        }
      },
    });
  }
  return computeExecutablePath({
    cacheDir,
    browser: BrowserEnum.CHROMIUM,
    buildId: PUPPETEER_CHROMIUM_REVISION,
  });
}

module.exports = {
  PUPPETEER_CHROMIUM_REVISION,
  launchBrowser,
  fetchBrowserExecutablePath,
  newPage,
  resetPage,
};
