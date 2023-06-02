const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const selenium = require('selenium-webdriver');

const {AmpDriver} = require('./amp-driver');
const {
  SeleniumWebDriverController,
} = require('./selenium-webdriver-controller');
const {installBrowserAssertions} = require('./expect');
const {getConfig} = require('./describes-config');

/** @typedef {import('./describes-config').DescribesConfigDef} DescribesConfigDef */
/** @typedef {{controller: SeleniumWebDriverController, ampDriver: AmpDriver}} ManagedDriver */

const DEFAULT_E2E_INITIAL_RECT = {width: 800, height: 600};

/** @type {{[key: string]: ManagedDriver}} */
const cache_ = {};

/**
 * @typedef {{
 *  headless?: boolean,
 * }}
 */
let SeleniumConfigDef;

/**
 * Configure and launch a Selenium instance
 * @param {string} browserName
 * @param {!SeleniumConfigDef=} args
 * @param {string=} deviceName
 * @return {!selenium.WebDriver}
 */
function createSelenium(browserName, args = {}, deviceName) {
  switch (browserName) {
    case 'safari':
      // Safari's only option is setTechnologyPreview
      return createDriver(browserName, [], deviceName);
    case 'firefox':
      return createDriver(browserName, getFirefoxArgs(args), deviceName);
    case 'chrome':
    default:
      return createDriver(browserName, getChromeArgs(args), deviceName);
  }
}

/**
 *
 * @param {string} browserName
 * @param {!string[]} args
 * @param {string=} deviceName
 * @return {!selenium.WebDriver}
 */
function createDriver(browserName, args, deviceName) {
  const capabilities = selenium.Capabilities[browserName]();

  const prefs = new selenium.logging.Preferences();
  prefs.setLevel(selenium.logging.Type.PERFORMANCE, selenium.logging.Level.ALL);
  capabilities.setLoggingPrefs(prefs);
  switch (browserName) {
    case 'firefox':
      const firefoxOptions = new firefox.Options();
      firefoxOptions.addArguments(...args);
      firefoxOptions.windowSize({
        width: DEFAULT_E2E_INITIAL_RECT.width,
        height: DEFAULT_E2E_INITIAL_RECT.height,
      });
      return new selenium.Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(firefoxOptions)
        .build();
    case 'chrome':
      // @ts-ignore incorrect in type library.
      const chromeOptions = new chrome.Options(capabilities);
      chromeOptions.addArguments(...args);
      if (deviceName) {
        chromeOptions.setMobileEmulation({deviceName});
      }
      return chrome.Driver.createSession(chromeOptions);
    case 'safari':
      return new selenium.Builder().forBrowser(browserName).build();
    default:
      throw new Error(`Unsupported browser ${browserName}`);
  }
}

/**
 * Configure chrome args.
 *
 * @param {!SeleniumConfigDef} config
 * @return {!Array<string>}
 */
function getChromeArgs(config) {
  const args = [
    '--no-sandbox',
    '--disable-gpu',
    `--window-size=${DEFAULT_E2E_INITIAL_RECT.width},${DEFAULT_E2E_INITIAL_RECT.height}`,
  ];

  if (config.headless) {
    args.push('--headless');
  }
  return args;
}

/**
 * Configure firefox args.
 *
 * @param {!SeleniumConfigDef} config
 * @return {!Array<string>}
 */
function getFirefoxArgs(config) {
  const args = [];

  if (config.headless) {
    args.push('--headless');
  }
  return args;
}

/**
 * Get the driver for the configured engine.
 * @param {!DescribesConfigDef} describesConfig
 * @param {string} browserName
 * @param {string|undefined} deviceName
 * @return {!selenium.WebDriver}
 */
function getDriver({headless = false}, browserName, deviceName) {
  return createSelenium(browserName, {headless}, deviceName);
}

/**
 * Gets a managed driver from cache or generates a new one.
 * @param {string} browserName
 * @param {string} deviceName
 * @return {ManagedDriver}
 */
function getDriverFor(browserName, deviceName) {
  const controllerKey = `${deviceName}-${browserName}`;

  if (!(controllerKey in cache_)) {
    const config = getConfig();
    const driver = getDriver(config, browserName, deviceName);
    const controller = new SeleniumWebDriverController(driver);
    const ampDriver = new AmpDriver(controller);

    cache_[controllerKey] = {controller, ampDriver};
    installBrowserAssertions(controller.networkLogger);
  }

  return cache_[controllerKey];
}

/**
 * Tears down the controllers cache and disposes of all active browsers.
 * @return {Promise<void>}
 */
async function disposeOfDrivers() {
  for (const [key, value] of Object.entries(cache_)) {
    const {controller} = value;
    await controller.dispose();
    delete cache_[key];
  }
}

module.exports = {
  getDriverFor,
  disposeOfDrivers,
};
