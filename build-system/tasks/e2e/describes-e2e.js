/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
// import to install chromedriver and geckodriver
require('chromedriver');
require('geckodriver');

const argv = require('minimist')(process.argv.slice(2));
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const http = require('http');
const puppeteer = require('puppeteer');
const {
  clearLastExpectError,
  getLastExpectError,
  installBrowserAssertions,
} = require('./expect');
const {
  getCoverageObject,
  mergeClientCoverage,
} = require('istanbul-middleware/lib/core');
const {
  SeleniumWebDriverController,
} = require('./selenium-webdriver-controller');
const {AmpDriver, AmpdocEnvironment} = require('./amp-driver');
const {Builder, Capabilities, logging} = require('selenium-webdriver');
const {HOST, PORT} = require('../serve');
const {installRepl, uninstallRepl} = require('./repl');
const {isTravisBuild} = require('../../common/travis');
const {PuppeteerController} = require('./puppeteer-controller');

/** Should have something in the name, otherwise nothing is shown. */
const SUB = ' ';
const TEST_TIMEOUT = 40000;
const SETUP_TIMEOUT = 30000;
const SETUP_RETRIES = 3;
const DEFAULT_E2E_INITIAL_RECT = {width: 800, height: 600};
const COV_REPORT_PATH = '/coverage/client';
const supportedBrowsers = new Set(['chrome', 'firefox', 'safari']);
/**
 * TODO(cvializ): Firefox now experimentally supports puppeteer.
 * When it's more mature we might want to support it.
 * {@link https://github.com/GoogleChrome/puppeteer/blob/master/experimental/puppeteer-firefox/README.md}
 */
const PUPPETEER_BROWSERS = new Set(['chrome']);

/**
 * Engine types for e2e testing.
 * @enum {string}
 */
const EngineType = {
  SELENIUM: 'selenium',
  PUPPETEER: 'puppeteer',
};

/**
 * @typedef {{
 *  browsers: string,
 *  headless: boolean,
 *  engine: string,
 * }}
 */
let DescribesConfigDef;

/**
 * @typedef {{
 *  headless: boolean,
 * }}
 */
let PuppeteerConfigDef;

/**
 * @typedef {{
 *  headless: boolean,
 * }}
 */
let SeleniumConfigDef;

/** @const {?DescribesConfigDef} */
let describesConfig = null;

/**
 * Configure all tests. This may only be called once, since it is only read once
 * and writes after reading will not have any effect.
 * @param {!DescribesConfigDef} config
 */
function configure(config) {
  if (describesConfig) {
    throw new Error('describes.configure should only be called once');
  }

  describesConfig = {...config};
}

/**
 * Retrieve the describes config if set.
 * If not set, it sets the config to an empty object and returns it.
 * After getting the config the first time, the config may not be changed.
 * @return {!DescribesConfigDef}
 */
function getConfig() {
  if (!describesConfig) {
    describesConfig = {};
  }

  return describesConfig;
}

/**
 * Configure and launch a Puppeteer instance
 * @param {!PuppeteerConfigDef=} opt_config
 * @return {!Promise}
 */
async function createPuppeteer(opt_config = {}) {
  const browser = await puppeteer.launch({
    headless: opt_config.headless || false,
    devtools: false,
    defaultViewport: null,
    timeout: 0,
  });
  return browser;
}

/**
 * Configure and launch a Selenium instance
 * @param {string} browserName
 * @param {!SeleniumConfigDef=} args
 * @param {?string} deviceName
 * @return {!WebDriver}
 */
function createSelenium(browserName, args = {}, deviceName) {
  switch (browserName) {
    case 'safari':
      // Safari's only option is setTechnologyPreview
      return createDriver(browserName, []);
    case 'firefox':
      return createDriver(browserName, getFirefoxArgs(args));
    case 'chrome':
    default:
      return createDriver(browserName, getChromeArgs(args), deviceName);
  }
}

/**
 *
 * @param {string} browserName
 * @param {!SeleniumConfigDef=} args
 * @param {?string} deviceName
 * @return {!WebDriver}
 */
function createDriver(browserName, args, deviceName) {
  const capabilities = Capabilities[browserName]();

  const prefs = new logging.Preferences();
  prefs.setLevel(logging.Type.PERFORMANCE, logging.Level.ALL);
  capabilities.setLoggingPrefs(prefs);
  switch (browserName) {
    case 'firefox':
      const firefoxOptions = new firefox.Options();
      firefoxOptions.addArguments(...args);
      firefoxOptions.windowSize({
        width: DEFAULT_E2E_INITIAL_RECT.width,
        height: DEFAULT_E2E_INITIAL_RECT.height,
      });
      return new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(firefoxOptions)
        .build();
    case 'chrome':
      const chromeOptions = new chrome.Options(capabilities);
      chromeOptions.addArguments(args);
      if (deviceName) {
        chromeOptions.setMobileEmulation({deviceName});
      }
      const driver = chrome.Driver.createSession(chromeOptions);
      //TODO(estherkim): workaround. `onQuit()` was added in selenium-webdriver v4.0.0-alpha.5
      //which is also when `Server terminated early with status 1` began appearing. Coincidence? Maybe.
      driver.onQuit = null;
      return driver;
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
 * @typedef {{
 *  browsers: (!Array<string>|undefined),
 *  environments: (!Array<!AmpdocEnvironment>|undefined),
 *  testUrl: string,
 *  initialRect: ({{width: number, height:number}}|undefined),
 *  deviceName: string|undefined,
 * }}
 */
let TestSpec;

/**
 * An end2end test using Selenium Web Driver or Puppeteer
 */
const endtoend = describeEnv((spec) => new EndToEndFixture(spec));

/**
 * Maps an environment enum value to a `describes.repeated` variant object.
 */
const EnvironmentVariantMap = {
  [AmpdocEnvironment.SINGLE]: {
    name: 'Standalone environment',
    value: {environment: 'single'},
  },
  [AmpdocEnvironment.VIEWER_DEMO]: {
    name: 'Viewer environment',
    value: {environment: 'viewer-demo'},
  },
  [AmpdocEnvironment.SHADOW_DEMO]: {
    name: 'Shadow environment',
    value: {environment: 'shadow-demo'},
  },
  [AmpdocEnvironment.A4A_FIE]: {
    name: 'AMPHTML ads FIE environment',
    value: {environment: 'a4a-fie'},
  },
  [AmpdocEnvironment.A4A_INABOX]: {
    name: 'AMPHTML ads inabox environment',
    value: {environment: 'a4a-inabox'},
  },
  [AmpdocEnvironment.A4A_INABOX_FRIENDLY]: {
    name: 'AMPHTML ads inabox friendly frame environment',
    value: {environment: 'a4a-inabox-friendly'},
  },
  [AmpdocEnvironment.A4A_INABOX_SAFEFRAME]: {
    name: 'AMPHTML ads inabox safeframe environment',
    value: {environment: 'a4a-inabox-safeframe'},
  },
};

const envPresets = {
  'ampdoc-preset': [
    AmpdocEnvironment.SINGLE,
    AmpdocEnvironment.VIEWER_DEMO,
    AmpdocEnvironment.SHADOW_DEMO,
  ],
  'amp4ads-preset': [
    AmpdocEnvironment.A4A_FIE,
    AmpdocEnvironment.A4A_INABOX,
    AmpdocEnvironment.A4A_INABOX_FRIENDLY,
    AmpdocEnvironment.A4A_INABOX_SAFEFRAME,
  ],
};
envPresets['ampdoc-amp4ads-preset'] = envPresets['ampdoc-preset'].concat(
  envPresets['amp4ads-preset']
);

/**
 * Helper class to skip E2E tests in a specific AMP environment.
 * Must be instantiated using it.configure().
 *
 * Example usage:
 * it.configure().skipViewerDemo().skipShadowDemo().run('Should ...', ...);
 */
class ItConfig {
  constructor(it, env) {
    this.it = it;
    this.env = env;
    this.skip = false;
  }

  skipShadowDemo() {
    this.skip = this.skip ? this.skip : this.env.environment == 'shadow-demo';
    return this;
  }

  skipSingle() {
    this.skip = this.skip ? this.skip : this.env.environment == 'single';
    return this;
  }

  skipViewerDemo() {
    this.skip = this.skip ? this.skip : this.env.environment == 'viewer-demo';
    return this;
  }

  skipA4aFie() {
    this.skip = this.skip ? this.skip : this.env.environment == 'a4a-fie';
    return this;
  }

  run(name, fn) {
    if (this.skip) {
      return this.it.skip(name, fn);
    }

    this.it(name, function () {
      return fn.apply(this, arguments);
    });
  }
}

/**
 * Extracts code coverage data from the page and aggregates it with other tests.
 * @param {!Object} env e2e driver environment.
 * @return {Promise<void>}
 */
async function collectCoverage(env) {
  const coverage = await env.controller.evaluate(() => window.__coverage__);
  if (coverage) {
    mergeClientCoverage(coverage);
  }
}

/**
 * Reports code coverage data to an aggregating endpoint.
 * @return {Promise<void>}
 */
async function reportCoverage() {
  const coverage = getCoverageObject();
  await new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: HOST,
        port: PORT,
        path: COV_REPORT_PATH,
        method: 'POST',
        headers: {'Content-type': 'application/json'},
      },
      (res) => {
        res.on('data', () => {});
        res.on('end', resolve);
        res.on('error', reject);
      }
    );
    req.write(JSON.stringify(coverage));
    req.end();
  });
}

/**
 * Returns a wrapped version of Mocha's describe(), it() and only() methods
 * that also sets up the provided fixtures and returns the corresponding
 * environment objects of each fixture to the test method.
 * @param {function(!Object):!Array<?Fixture>} factory
 * @return {function()}
 */
function describeEnv(factory) {
  /**
   * @param {string} suiteName
   * @param {!Object} spec
   * @param {function(!Object)} fn
   * @param {function(string, function())} describeFunc
   * @return {function()}
   */
  const templateFunc = function (suiteName, spec, fn, describeFunc) {
    const fixture = factory(spec);
    let environments = spec.environments || 'ampdoc-preset';
    if (typeof environments === 'string') {
      environments = envPresets[environments];
    }
    if (!environments) {
      throw new Error('Invalid environment preset: ' + spec.environments);
    }
    const variants = Object.create(null);
    environments.forEach((environment) => {
      const o = EnvironmentVariantMap[environment];
      variants[o.name] = o.value;
    });

    // Use chrome as default if no browser is specified
    if (!Array.isArray(spec.browsers)) {
      spec.browsers = ['chrome'];
    }

    function createBrowserDescribe() {
      const allowedBrowsers = getAllowedBrowsers();

      spec.browsers
        .filter((x) => allowedBrowsers.has(x))
        .forEach((browserName) => {
          describe(browserName, function () {
            createVariantDescribe(browserName);
          });
        });
    }

    function getAllowedBrowsers() {
      const {engine, browsers} = getConfig();

      const allowedBrowsers = browsers
        ? new Set(browsers.split(',').map((x) => x.trim()))
        : supportedBrowsers;

      if (engine === EngineType.PUPPETEER) {
        const result = intersect(allowedBrowsers, PUPPETEER_BROWSERS);
        if (result.size === 0) {
          const browsersList = Array.from(allowedBrowsers).join(',');
          throw new Error(
            `browsers ${browsersList} not supported by Puppeteer`
          );
        }
        return result;
      }

      if (process.platform !== 'darwin' && allowedBrowsers.has('safari')) {
        // silently skip safari tests
        allowedBrowsers.delete('safari');
      }

      return allowedBrowsers;
    }

    function createVariantDescribe(browserName) {
      for (const name in variants) {
        it.configure = function () {
          return new ItConfig(it, variants[name]);
        };

        describe(name ? ` ${name} ` : SUB, function () {
          doTemplate.call(this, name, variants[name], browserName);
        });
      }
    }

    return describeFunc(suiteName, function () {
      createBrowserDescribe();
    });

    function doTemplate(name, variant, browserName) {
      const env = Object.create(variant);
      this.timeout(TEST_TIMEOUT);
      beforeEach(async function () {
        this.timeout(SETUP_TIMEOUT);
        await fixture.setup(env, browserName, SETUP_RETRIES);

        // don't install for CI
        if (!isTravisBuild()) {
          installRepl(global, env);
        }
      });

      afterEach(async function () {
        if (argv.coverage) {
          await collectCoverage(env);
        }

        // If there is an async expect error, throw it in the final state.
        const lastExpectError = getLastExpectError();
        if (lastExpectError) {
          this.test.error(lastExpectError);
          clearLastExpectError();
        }

        await fixture.teardown(env);
        for (const key in env) {
          delete env[key];
        }

        if (!isTravisBuild()) {
          uninstallRepl();
        }
      });

      after(async () => {
        if (argv.coverage) {
          await reportCoverage();
        }
      });

      describe(SUB, function () {
        fn.call(this, env);
      });
    }
  };

  /**
   * @param {string} name
   * @param {!Object} spec
   * @param {function(!Object)} fn
   * @return {function()}
   */
  const mainFunc = function (name, spec, fn) {
    return templateFunc(name, spec, fn, describe);
  };

  /**
   * @param {string} name
   * @param {!Object} spec
   * @param {function(!Object)} fn
   * @return {function()}
   */
  mainFunc.only = function (name, spec, fn) {
    return templateFunc(name, spec, fn, describe./*OK*/ only);
  };

  mainFunc.skip = function (name, variants, fn) {
    return templateFunc(name, variants, fn, describe.skip);
  };

  return mainFunc;
}

class EndToEndFixture {
  /** @param {!TestSpec} spec */
  constructor(spec) {
    /** @const */
    this.spec = spec;
  }

  /**
   * @param {!Object} env
   * @param {string} browserName
   * @param {number} retries
   */
  async setup(env, browserName, retries = 0) {
    const config = getConfig();
    const driver = getDriver(config, browserName, this.spec.deviceName);
    const controller =
      config.engine == EngineType.PUPPETEER
        ? new PuppeteerController(driver)
        : new SeleniumWebDriverController(driver);
    const ampDriver = new AmpDriver(controller);
    env.controller = controller;
    env.ampDriver = ampDriver;

    installBrowserAssertions(controller.networkLogger);

    try {
      await setUpTest(env, this.spec);
      // Set env props that require the fixture to be set up.
      if (env.environment === AmpdocEnvironment.VIEWER_DEMO) {
        env.receivedMessages = await controller.evaluate(() => {
          return window.parent.viewer.receivedMessages;
        });
      }
    } catch (ex) {
      if (retries > 0) {
        await this.setup(env, browserName, --retries);
      } else {
        throw ex;
      }
    }
  }

  async teardown(env) {
    const {controller} = env;
    if (controller && controller.driver) {
      await controller.switchToParent();
      await controller.dispose();
    }
  }
}

/**
 * Get the driver for the configured engine.
 * @param {!DescribesConfigDef} describesConfig
 * @param {string} browserName
 * @param {?string} deviceName
 * @return {!ThenableWebDriver}
 */
function getDriver(
  {engine = EngineType.SELENIUM, headless = false},
  browserName,
  deviceName
) {
  if (engine == EngineType.PUPPETEER) {
    return createPuppeteer({headless});
  }

  if (engine == EngineType.SELENIUM) {
    return createSelenium(browserName, {headless}, deviceName);
  }
}

async function setUpTest(
  {environment, ampDriver, controller},
  {testUrl, experiments = [], initialRect}
) {
  const url = new URL(testUrl);
  if (experiments.length > 0) {
    if (environment.includes('inabox')) {
      // inabox experiments are toggled at server side using <meta> tag
      url.searchParams.set('exp', experiments.join(','));
    } else {
      // AMP doc experiments are toggled via cookies
      await toggleExperiments(ampDriver, url.href, experiments);
    }
  }

  if (initialRect) {
    const {width, height} = initialRect;
    await controller.setWindowRect({width, height});
  }

  await ampDriver.navigateToEnvironment(environment, url.href);
}

/**
 * Toggle the given experiments for the given test URL domain.
 * @param {!AmpDriver} ampDriver
 * @param {string} testUrl
 * @param {!Array<string>} experiments
 * @return {!Promise}
 */
async function toggleExperiments(ampDriver, testUrl, experiments) {
  await ampDriver.navigateToEnvironment(AmpdocEnvironment.SINGLE, testUrl);

  for (const experiment of experiments) {
    await ampDriver.toggleExperiment(experiment, true);
  }
}

/**
 * Intersection of two sets
 * @param {Set<T>} a
 * @param {Set<T>} b
 * @return {Set<T>}
 * @template T
 */
function intersect(a, b) {
  return new Set(Array.from(a).filter((aItem) => b.has(aItem)));
}

module.exports = {
  TestSpec,
  endtoend,
  configure,
};
