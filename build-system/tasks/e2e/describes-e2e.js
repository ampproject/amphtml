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

// import to install chromedriver and gecko driver
require('chromedriver'); // eslint-disable-line no-unused-vars
require('geckodriver'); // eslint-disable-line no-unused-vars

const firefox = require('selenium-webdriver/firefox');
const puppeteer = require('puppeteer');
const {
  SeleniumWebDriverController,
} = require('./selenium-webdriver-controller');
const {AmpDriver, AmpdocEnvironment} = require('./amp-driver');
const {Builder, Capabilities} = require('selenium-webdriver');
const {clearLastExpectError, getLastExpectError} = require('./expect');
const {installRepl, uninstallRepl} = require('./repl');
const {isTravisBuild} = require('../../travis');
const {PuppeteerController} = require('./puppeteer-controller');

/** Should have something in the name, otherwise nothing is shown. */
const SUB = ' ';
const TEST_TIMEOUT = 20000;
const SETUP_TIMEOUT = 30000;
const DEFAULT_E2E_INITIAL_RECT = {width: 800, height: 600};

/**
 * @typedef {{
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
 * Map the browserName to the capabilities name. (firefox for example has a
 * prefix.
 *
 * @enum {string}
 */
const capabilitiesKeys = {
  'chrome': 'chromeOptions',
  'firefox': 'moz:firefoxOptions',
}

/**
 * Configure all tests. This may only be called once, since it is only read once
 * and writes after reading will not have any effect.
 * @param {!DescribesConfigDef} config
 */
function configure(config) {
  if (describesConfig) {
    throw new Error('describes.config should only be called once');
  }

  describesConfig = Object.assign({}, config);
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
 * @param {!SeleniumConfigDef=} opt_config
 * @return {!SeleniumDriver}
 */
async function createSelenium(browserName, opt_config = {}) {
  // TODO(estherkim): implement sessions
  // See https://w3c.github.io/webdriver/#sessions
  switch (browserName) {
    case 'firefox':
      return createDriver(browserName, getFirefoxArgs(opt_config));
    case 'chrome':
    default:
      return createDriver(browserName, getChromeArgs(opt_config));
  }
}

async function createDriver(browserName, args) {
  const capabilities = Capabilities[browserName]();
  capabilities.set(capabilitiesKeys[browserName], {'args': args});
  const builder = new Builder().withCapabilities(capabilities);
  const driver = await builder.build();
  return driver;
}

/**
 * Configure chrome args.
 *
 * @param {!SeleniumConfigDef} config
 * @return {!Array<string>}
 */
function getChromeArgs(config) {
  const args = ['--no-sandbox', '--disable-gpu'];

  // TODO(cvializ,estherkim,sparhami):
  // figure out why headless causes more flakes
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
    args.push('-headless');
  }
  return args;
}

/**
 * @typedef {{
 *  browsers: (!Array<string>|undefined),
 *  environments: (!Array<!AmpdocEnvironment>|undefined),
 *  testUrl: string,
 *  initialRect: ({{width: number, height:number}}|undefined)
 * }}
 */
let TestSpec;

/**
 * An end2end test using Selenium Web Driver or Puppeteer
 */
const endtoend = describeEnv(spec => new EndToEndFixture(spec));

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
};

const defaultEnvironments = [
  AmpdocEnvironment.SINGLE,
  AmpdocEnvironment.VIEWER_DEMO,
  AmpdocEnvironment.SHADOW_DEMO,
];

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

  run(name, fn) {
    if (this.skip) {
      return this.it.skip(name, fn);
    }

    this.it(name, function() {
      return fn.apply(this, arguments);
    });
  }
}

/**
 * Returns a wrapped version of Mocha's describe(), it() and only() methods
 * that also sets up the provided fixtures and returns the corresponding
 * environment objects of each fixture to the test method.
 * @param {function(!Object):!Array<?Fixture>} factory
 */
function describeEnv(factory) {
  /**
   * @param {string} suiteName
   * @param {!Object} spec
   * @param {function(!Object)} fn
   * @param {function(string, function())} describeFunc
   */
  const templateFunc = function(suiteName, spec, fn, describeFunc) {
    const fixture = factory(spec);
    const environments = spec.environments || defaultEnvironments;
    const variants = Object.create(null);
    environments.forEach(environment => {
      const o = EnvironmentVariantMap[environment];
      variants[o.name] = o.value;
    });

    // Use chrome as default if no browser is specified
    if (!Array.isArray(spec.browsers)) {
      spec.browsers = ['chrome'];
    }

    function createBrowserDescribe() {
      spec.browsers.forEach(browserName => {
        describe(browserName, function() {
          createVariantDescribe(browserName);
        });
      });
    }

    function createVariantDescribe(browserName) {
      for (const name in variants) {
        it.configure = function() {
          return new ItConfig(it, variants[name]);
        };

        describe(name ? ` ${name} ` : SUB, function() {
          doTemplate.call(this, name, variants[name], browserName);
        });
      }
    }

    return describeFunc(suiteName, function() {
      createBrowserDescribe();
    });

    function doTemplate(name, variant, browserName) {
      const env = Object.create(variant);
      this.timeout(TEST_TIMEOUT);
      beforeEach(async function() {
        this.timeout(SETUP_TIMEOUT);
        await fixture.setup(env, browserName);

        // don't install for CI
        if (!isTravisBuild()) {
          installRepl(global, env);
        }
      });

      afterEach(async function() {
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

      describe(SUB, function() {
        fn.call(this, env);
      });
    }
  };

  /**
   * @param {string} name
   * @param {!Object} spec
   * @param {function(!Object)} fn
   */
  const mainFunc = function(name, spec, fn) {
    return templateFunc(name, spec, fn, describe);
  };

  /**
   * @param {string} name
   * @param {!Object} spec
   * @param {function(!Object)} fn
   */
  mainFunc.only = function(name, spec, fn) {
    return templateFunc(name, spec, fn, describe./*OK*/ only);
  };

  mainFunc.skip = function(name, variants, fn) {
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
   */
  async setup(env, browserName) {
    const config = getConfig();
    const controller = await getController(config, browserName);
    const ampDriver = new AmpDriver(controller);
    env.controller = controller;
    env.ampDriver = ampDriver;

    const {
      testUrl,
      experiments = [],
      initialRect = DEFAULT_E2E_INITIAL_RECT,
    } = this.spec;
    const {environment} = env;

    await toggleExperiments(ampDriver, testUrl, experiments);

    const {width, height} = initialRect;
    await controller.setWindowRect({width, height});

    await ampDriver.navigateToEnvironment(environment, testUrl);
  }

  async teardown(env) {
    const {controller} = env;
    if (controller) {
      await controller.switchToParent();
      await controller.dispose();
    }
  }
}

/**
 * Get the controller object for the configured engine.
 * @param {!DescribesConfigDef} describesConfig
 * @param {string} browserName
 */
async function getController({
  engine = 'selenium',
  headless = false,
}, browserName) {
  if (engine == 'puppeteer') {
    const browser = await createPuppeteer({headless});
    return new PuppeteerController(browser);
  }

  if (engine == 'selenium') {
    const driver = await createSelenium(browserName, {headless});
    return new SeleniumWebDriverController(driver);
  }
}

/**
 * Toggle the given experiments for the given test URL domain.
 * @param {!AmpDriver} ampDriver
 * @param {string} testUrl
 * @param {!Array<string>} experiments
 * @return {!Promise}
 */
async function toggleExperiments(ampDriver, testUrl, experiments) {
  if (!experiments.length) {
    return;
  }

  await ampDriver.navigateToEnvironment(AmpdocEnvironment.SINGLE, testUrl);

  for (const experiment of experiments) {
    await ampDriver.toggleExperiment(experiment, true);
  }
}

module.exports = {
  TestSpec,
  endtoend,
  configure,
};
