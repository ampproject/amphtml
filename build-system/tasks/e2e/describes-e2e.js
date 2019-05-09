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

// import to install chromedriver
require('chromedriver'); // eslint-disable-line no-unused-vars

const log = require('fancy-log');
const puppeteer = require('puppeteer');
const {AmpDriver, AmpdocEnvironment} = require('./amp-driver');
const {Builder, Capabilities} = require('selenium-webdriver');
const {clearLastExpectError, getLastExpectError} = require('./expect');
const {installRepl, uninstallRepl} = require('./repl');
const {isTravisBuild} = require('../../travis');
const {PuppeteerController} = require('./puppeteer-controller');
const {SeleniumWebDriverController} = require('./selenium-webdriver-controller');

/** Should have something in the name, otherwise nothing is shown. */
const SUB = ' ';
const TIMEOUT = 20000;

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
 * @param {!SeleniumConfigDef=} opt_config
 */
async function createSelenium(opt_config = {}) {
  const args = [];
  args.push('--no-sandbox');
  args.push('--disable-gpu');
  if (opt_config.headless) {
    args.push('--headless');
  }

  const capabilities = Capabilities.chrome();
  const chromeOptions = {
    // TODO(cvializ,estherkim,sparhami):
    // figure out why headless causes more flakes
    'args': args,
  };
  capabilities.set('chromeOptions', chromeOptions);

  const builder = new Builder().withCapabilities(capabilities);
  const driver = await builder.build();
  return driver;
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
  [AmpdocEnvironment.SINGLE]:
      {name: 'Standalone environment', value: {environment: 'single'}},
  [AmpdocEnvironment.VIEWER_DEMO]:
      {name: 'Viewer environment', value: {environment: 'viewer-demo'}},
  [AmpdocEnvironment.SHADOW_DEMO]:
      {name: 'Shadow environment', value: {environment: 'shadow-demo'}},
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
   * @param {string} name
   * @param {!Object} spec
   * @param {function(!Object)} fn
   * @param {function(string, function())} describeFunc
   */
  const templateFunc = function(name, spec, fn, describeFunc) {
    const fixture = factory(spec);
    const environments = spec.environments || defaultEnvironments;
    const variants = Object.create(null);
    environments.forEach(environment => {
      const o = EnvironmentVariantMap[environment];
      variants[o.name] = o.value;
    });

    return describeFunc(name, function() {
      for (const name in variants) {
        it.configure = function() {
          return new ItConfig(it, variants[name]);
        };

        describe(name ? ` ${name} ` : SUB, function() {
          doTemplate.call(this, name, variants[name]);
        });
      }
    });

    function doTemplate(name, variant) {
      const env = Object.create(variant);
      let asyncErrorTimerId;
      this.timeout(TIMEOUT);
      let rootBeforeEachTimeout;
      beforeEach(async function() {
        rootBeforeEachTimeout = setTimeout(() => {
          log('Timed out in root level before each');
        }, TIMEOUT);
        await fixture.setup(env);

        // don't install for CI
        if (!isTravisBuild()) {
          installRepl(global, env);
        }

        clearTimeout(rootBeforeEachTimeout);
      });

      afterEach(async function() {
        clearLastExpectError();
        clearTimeout(asyncErrorTimerId);
        await fixture.teardown(env);
        for (const key in env) {
          delete env[key];
        }

        if (!isTravisBuild()) {
          uninstallRepl(global, env);
        }
      });

      after(function() {
        clearTimeout(asyncErrorTimerId);
      });

      describe(SUB, function() {
        // If there is an async expect error, throw it in the final state.
        asyncErrorTimerId = setTimeout(() => {
          const lastExpectError = getLastExpectError();
          if (lastExpectError) {
            throw lastExpectError;
          }
        }, this.timeout() - 1);
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
    return templateFunc(name, spec, fn, describe./*OK*/only);
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

  async setup(env) {
    const firstTimeout = setTimeout(() => {
      log('first setup timeout');
    }, TIMEOUT / 4);
    const config = getConfig();
    const controller = await getController(config);
    const ampDriver = new AmpDriver(controller);
    env.controller = controller;
    env.ampDriver = ampDriver;
    clearTimeout(firstTimeout);

    const {
      testUrl,
      experiments = [],
      initialRect = DEFAULT_E2E_INITIAL_RECT,
    } = this.spec;
    const {
      environment,
    } = env;

    const secondTimeout = setTimeout(() => {
      log('second setup timeout');
    }, TIMEOUT / 4);
    await toggleExperiments(ampDriver, testUrl, experiments);
    const {width, height} = initialRect;
    await controller.setWindowRect({width, height});
    await ampDriver.navigateToEnvironment(environment, testUrl);
    clearTimeout(secondTimeout);
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
 */
async function getController({
  engine = 'selenium',
  headless = false,
}) {
  if (engine == 'puppeteer') {
    const browser = await createPuppeteer({headless});
    return new PuppeteerController(browser);
  }

  if (engine == 'selenium') {
    const driver = await createSelenium({headless});
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
