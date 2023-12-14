// import to install chromedriver and geckodriver
require('chromedriver');
require('geckodriver');

const argv = require('minimist')(process.argv.slice(2));
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const {Builder, logging} = require('selenium-webdriver');
const {
  clearLastExpectError,
  getLastExpectError,
  installBrowserAssertions,
} = require('./expect');
const {
  SeleniumWebDriverController,
} = require('./selenium-webdriver-controller');
const {AmpDriver, AmpdocEnvironment} = require('./amp-driver');
const {configureHelpers} = require('../../../testing/helpers');
const {HOST, PORT} = require('../serve');
const {installRepl, uninstallRepl} = require('./repl');
const {isCiBuild} = require('../../common/ci');

/** Should have something in the name, otherwise nothing is shown. */
const SUB = ' ';
const TEST_TIMEOUT = 3000;
// This can be much lower when the OSX container can be sped up allowing tests
// in extensions/amp-script/0.1/test-e2e/test-amp-script.js to run faster
const SETUP_TIMEOUT = 10000;
const SETUP_RETRIES = 3;
const DEFAULT_E2E_INITIAL_RECT = {width: 800, height: 600};
const COV_REPORT_PATH = '/coverage/client';
const supportedBrowsers = new Set(['chrome', 'firefox', 'safari']);

/**
 * Load coverage middleware only if needed.
 */
let istanbulMiddleware;
if (argv.coverage) {
  istanbulMiddleware = require('istanbul-middleware/lib/core');
}

/** @typedef {import('selenium-webdriver').WebDriver} WebDriver */
/** @typedef {"chrome" | "firefox" | "safari"} BrowserNameDef */

/**
 * @typedef {{
 *  browsers: string,
 *  headless: boolean,
 * }}
 */
let DescribesConfigDef;

/**
 * @typedef {{
 *  headless?: boolean,
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
 * Configure and launch a Selenium instance
 * @param {BrowserNameDef} browserName
 * @param {!SeleniumConfigDef=} args
 * @param {string=} deviceName
 * @return {!WebDriver}
 */
function createSelenium(browserName, args = {}, deviceName) {
  switch (browserName) {
    case 'safari':
      // Safari's only option is setTechnologyPreview
      return createDriver(browserName, [], deviceName);
    case 'firefox':
      return createDriver(browserName, getFirefoxArgs(args), deviceName);
    case 'chrome':
      return createDriver(browserName, getChromeArgs(args), deviceName);
  }
}

/**
 *
 * @param {BrowserNameDef} browserName
 * @param {!string[]} args
 * @param {string=} deviceName
 * @return {!WebDriver}
 */
function createDriver(browserName, args, deviceName) {
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
      const loggingPrefs = new logging.Preferences();
      loggingPrefs.setLevel(logging.Type.PERFORMANCE, logging.Level.ALL);

      const chromeOptions = new chrome.Options();
      chromeOptions.setLoggingPrefs(loggingPrefs);
      chromeOptions.addArguments(...args);
      if (process.env.CHROME_BIN) {
        chromeOptions.setChromeBinaryPath(process.env.CHROME_BIN);
      }
      if (deviceName) {
        chromeOptions.setMobileEmulation({deviceName});
      }
      return new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();

    case 'safari':
      return new Builder().forBrowser('safari').build();
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
 *  experiments: (!Array<string>|undefined),
 *  testUrl: string|undefined,
 *  fixture: string,
 *  initialRect: ({width: number, height:number}|undefined),
 *  deviceName: string|undefined,
 *  version: string|undefined,
 * }}
 */
let TestSpec;

/**
 * @typedef {{
 *  browsers: (!Array<string>|undefined),
 *  environments: (!Array<!AmpdocEnvironment>|undefined),
 *  testUrl: string|undefined,
 *  fixture: string,
 *  initialRect: ({width: number, height:number}|undefined),
 *  deviceName: string|undefined,
 *  versions: {[version: string]: TestSpec},
 *  version: string|undefined
 * }}
 */
let RootSpec;

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
  [AmpdocEnvironment.EMAIL_DEMO]: {
    name: 'Email environment (viewer)',
    value: {environment: 'email-demo'},
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
  /**
   * @param {function} it
   * @param {object} env
   */
  constructor(it, env) {
    this.it = /** @type {Mocha.it} */ (it);
    this.env = env;
    this.skip = false;
  }

  /**
   * @return {ItConfig}
   */
  skipShadowDemo() {
    this.skip = this.skip ? this.skip : this.env.environment == 'shadow-demo';
    return this;
  }

  /**
   * @return {ItConfig}
   */
  skipSingle() {
    this.skip = this.skip ? this.skip : this.env.environment == 'single';
    return this;
  }

  /**
   * @return {ItConfig}
   */
  skipViewerDemo() {
    this.skip = this.skip ? this.skip : this.env.environment == 'viewer-demo';
    return this;
  }

  /**
   * @return {ItConfig}
   */
  skipA4aFie() {
    this.skip = this.skip ? this.skip : this.env.environment == 'a4a-fie';
    return this;
  }

  /**
   * @param {string} name
   * @param {function(): void} fn
   * @return {void|Mocha.Test}
   */
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
async function updateCoverage(env) {
  const coverage = await env.controller.evaluate(() => window.__coverage__);
  if (coverage) {
    istanbulMiddleware.mergeClientCoverage(coverage);
  }
}

/**
 * Reports code coverage data to an aggregating endpoint.
 * @return {Promise<void>}
 */
async function reportCoverage() {
  const coverage = istanbulMiddleware.getCoverageObject();
  await fetch(`https://${HOST}:${PORT}${COV_REPORT_PATH}`, {
    method: 'POST',
    body: JSON.stringify(coverage),
    headers: {'Content-type': 'application/json'},
  });
}

/**
 * Returns a wrapped version of Mocha's describe(), it() and only() methods
 * that also sets up the provided fixtures and returns the corresponding
 * environment objects of each fixture to the test method.
 * @param {function(!TestSpec): EndToEndFixture} factory
 * @return {function(string, RootSpec, function(!Object): void): void}
 */
function describeEnv(factory) {
  /**
   * @param {string} suiteName
   * @param {!Object} spec
   * @param {function(!Object): void} fn
   * @param {function(string, function(): void): void} describeFunc

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

    /**
     * Initializes the describe object for all applicable browsers.
     */
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

    /**
     * @return {Set<string>}
     */
    function getAllowedBrowsers() {
      const {browsers} = getConfig();

      const allowedBrowsers = browsers
        ? new Set(browsers.split(',').map((x) => x.trim()))
        : supportedBrowsers;

      if (process.platform !== 'darwin' && allowedBrowsers.has('safari')) {
        // silently skip safari tests
        allowedBrowsers.delete('safari');
      }

      return allowedBrowsers;
    }

    /**
     * @param {BrowserNameDef} browserName
     */
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

    describeFunc(suiteName, function () {
      createBrowserDescribe();
    });
    return;

    /**
     *
     * @param {string} _name
     * @param {object} variant
     * @param {BrowserNameDef} browserName
     */
    function doTemplate(_name, variant, browserName) {
      const env = Object.create(variant);
      // @ts-ignore
      this.timeout(TEST_TIMEOUT);
      beforeEach(async function () {
        this.timeout(SETUP_TIMEOUT);
        configureHelpers(env);
        await fixture.setup(env, browserName, SETUP_RETRIES);

        // don't install for CI
        if (!isCiBuild()) {
          installRepl(global, env);
        }
      });

      afterEach(async function () {
        if (argv.coverage) {
          await updateCoverage(env);
        }

        // If there is an async expect error, throw it in the final state.
        const lastExpectError = getLastExpectError();
        if (lastExpectError) {
          /** @type {any} */ (this.test).error(lastExpectError);
          clearLastExpectError();
        }

        await fixture.teardown(env);
        for (const key in env) {
          delete env[key];
        }

        if (!isCiBuild()) {
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
   * @param {!RootSpec} spec
   * @param {function(!Object): void} fn
   */
  const mainFunc = function (name, spec, fn) {
    const {versions, ...baseSpec} = spec;
    if (!versions) {
      // If a version is provided, add a prefix to the test suite name.
      const {version} = spec;
      templateFunc(
        version ? `[v${version}] ${name}` : name,
        spec,
        fn,
        describe
      );
    } else {
      // A root `describes.endtoend` spec may contain a `versions` object, where
      // the key represents the version number and the value is an object with
      // test specs for that version. This allows specs to share test fixtures,
      // browsers, and other settings.
      Object.entries(versions).forEach(([version, versionSpec]) => {
        const fullSpec = {
          ...baseSpec,
          ...versionSpec,
          version,
        };
        templateFunc(`[v${version}] ${name}`, fullSpec, fn, describe);
      });
    }
  };

  /**
   * @param {string} name
   * @param {!Object} spec
   * @param {function(!Object): void} fn
   */
  mainFunc.only = function (name, spec, fn) {
    templateFunc(name, spec, fn, describe./*OK*/ only);
    return;
  };

  /**
   * @param {string} name
   * @param {!Object} variants
   * @param {function(!Object): void} fn
   */
  mainFunc.skip = function (name, variants, fn) {
    templateFunc(name, variants, fn, describe.skip);
  };

  return mainFunc;
}

class EndToEndFixture {
  /** @param {!TestSpec} spec */
  constructor(spec) {
    /** @const */
    this.spec = this.setTestUrl(spec);
  }

  /**
   * @param {!Object} env
   * @param {BrowserNameDef} browserName
   * @param {number} retries
   * @return {Promise<void>}
   */
  async setup(env, browserName, retries = 0) {
    const config = getConfig();
    const driver = getDriver(config, browserName, this.spec.deviceName);
    const controller = new SeleniumWebDriverController(driver);
    const ampDriver = new AmpDriver(controller);
    env.controller = controller;
    env.ampDriver = ampDriver;
    env.version = this.spec.version;

    installBrowserAssertions(controller.networkLogger);

    try {
      await setUpTest(env, this.spec);
      // Set env props that require the fixture to be set up.
      if (env.environment === AmpdocEnvironment.VIEWER_DEMO) {
        env.receivedMessages = await controller.evaluate(() => {
          return window.parent.viewer?.receivedMessages;
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

  /**
   * @param {!Object} env
   * @return {Promise<void>}
   */
  async teardown(env) {
    const {controller} = env;
    if (controller && controller.driver) {
      await controller.switchToParent();
      await controller.dispose();
    }
  }

  /**
   * Translate relative fixture specs into localhost test URL.
   * @param {!TestSpec} spec
   * @return {!TestSpec}
   */
  setTestUrl(spec) {
    const {fixture, testUrl} = spec;

    if (testUrl) {
      throw new Error(
        'Setting `testUrl` directly is no longer permitted in e2e tests; please use `fixture` instead'
      );
    }

    return {
      ...spec,
      testUrl: `http://localhost:8000/test/fixtures/e2e/${fixture}`,
    };
  }
}

/**
 * Get the driver for the configured engine.
 * @param {!DescribesConfigDef} describesConfig
 * @param {BrowserNameDef} browserName
 * @param {string|undefined} deviceName
 * @return {!WebDriver}
 */
function getDriver({headless = false}, browserName, deviceName) {
  return createSelenium(browserName, {headless}, deviceName);
}

/**
 * @param {{
 *  environment: *,
 *  ampDriver: *,
 *  controller: *,
 * }} param0
 * @param {TestSpec} param1
 * @return {Promise<void>}
 */
async function setUpTest(
  {ampDriver, controller, environment},
  {experiments = [], initialRect, testUrl = '', version}
) {
  const url = new URL(testUrl);

  // When a component version is specified in the e2e spec, provide it as a
  // request param.
  if (version) {
    url.searchParams.set('componentVersion', version);
  }

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
    const {height, width} = initialRect;
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

module.exports = {
  RootSpec,
  TestSpec,
  endtoend,
  configure,
};
