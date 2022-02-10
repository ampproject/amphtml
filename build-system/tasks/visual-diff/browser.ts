import fs from 'fs';
import {cyan, yellow} from 'kleur/colors';
import minimist from 'minimist';
import path from 'path';
import puppeteer from 'puppeteer';
import {addExtra} from 'puppeteer-extra';
import PuppeteerExtraPluginUserPreferences from 'puppeteer-extra-plugin-user-preferences';

import {HOST} from './consts';
import {log} from './log';

const argv = minimist(process.argv.slice(2));

// The default export of the `puppeteer` module is guaranteed to be an instance
// of PuppeteerNode in a Node environment.
const puppeteerNode = puppeteer as unknown as puppeteer.PuppeteerNode;

// REPEATING TODO(@ampproject/wg-infra): Update this whenever the Percy backend
// starts using a new version of Chrome to render DOM snapshots.
//
// Steps:
// 1. Open a recent Percy build, and click the “ⓘ” icon
// 2. Note the Chrome major version at the bottom
// 3. Look up the full version at https://en.wikipedia.org/wiki/Google_Chrome_version_history
// 4. Open https://omahaproxy.appspot.com in a browser
// 5. Go to "Tools" -> "Version information"
// 6. Paste the full version (add ".0" at the end) in the "Version" field and click "Lookup"
// 7. Copy the value next to "Branch Base Position"
// 8. Clone the Puppeteer repository: `git clone https://github.com/puppeteer/puppeteer`
// 9. Run `npm ci` in the cloned directory
// 10. `node utils/check_availability.js ${branchBasePosition} ${branchBasePosition + 1000}`
//     (e.g., `node utils/check_availability.js 870763 871763)
// 10. Find the first available value for each platform and update the value below:
export const PUPPETEER_CHROMIUM_REVISION = // 91.0.4472.x
  process.platform === 'linux'
    ? '870763'
    : process.platform === 'darwin' // ('mac' in check_availability.js output)
    ? '870776'
    : process.platform === 'win32' && process.arch === 'x32' // ('win32' in check_availability.js output)
    ? '870768'
    : process.platform === 'win32' && process.arch === 'x64' // ('win64' in check_availability.js output)
    ? '870781'
    : '';

const VIEWPORT_WIDTH = 1400;
const VIEWPORT_HEIGHT = 100000;

/**
 * Launches a Puppeteer controlled browser.
 *
 * Waits until the browser is up and reachable, and ties its lifecycle to this
 * process's lifecycle.
 *
 * @param browserFetcher Puppeteer browser binaries manager.
 * @return {Promise<puppeteer.Browser>} a Puppeteer controlled browser.
 */
export async function launchBrowser(
  browserFetcher: puppeteer.BrowserFetcher
): Promise<puppeteer.Browser> {
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
    executablePath: browserFetcher.revisionInfo(PUPPETEER_CHROMIUM_REVISION)
      .executablePath,
    waitForInitialPage: false,
  };

  const puppeteerExtra = addExtra(puppeteerNode);
  puppeteerExtra.use(
    PuppeteerExtraPluginUserPreferences({
      userPrefs: {
        devtools: {
          preferences: {
            currentDockState: '"undocked"',
          },
        },
      },
    })
  );
  return await puppeteerExtra.launch(browserOptions);
}

/**
 * Opens a new browser tab, resizes its viewport, and returns a Page handler.
 */
export async function newPage(
  browser: puppeteer.Browser,
  viewport?: puppeteer.Viewport
): Promise<puppeteer.Page> {
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
        `${requestUrl.pathname.slice(1)}${requestUrl.search}`
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
 * @param page a Puppeteer control browser tab/page.
 * @param viewport optional viewport size object with numeric fields `width` and
 *     `height`.
 */
export async function resetPage(
  page: puppeteer.Page,
  viewport?: puppeteer.Viewport
): Promise<void> {
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
 * Loads task-specific dependencies are returns an instance of BrowserFetcher.
 */
export async function loadBrowserFetcher(): Promise<puppeteer.BrowserFetcher> {
  const browserFetcher = puppeteerNode.createBrowserFetcher({});
  const chromiumRevisions = await browserFetcher.localRevisions();
  if (chromiumRevisions.includes(PUPPETEER_CHROMIUM_REVISION)) {
    log(
      'info',
      'Using Percy-compatible version of Chromium',
      cyan(PUPPETEER_CHROMIUM_REVISION)
    );
  } else {
    log(
      'info',
      'Percy-compatible version of Chromium',
      cyan(PUPPETEER_CHROMIUM_REVISION),
      'was not found. Downloading...'
    );
    await browserFetcher.download(
      PUPPETEER_CHROMIUM_REVISION,
      (/* downloadedBytes, totalBytes */) => {
        // TODO(@ampproject/wg-infra): display download progress.
        // Logging every call is too verbose.
      }
    );
  }
  return browserFetcher;
}
