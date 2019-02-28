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
const {AmpDriver, Environment} = require('./amp-driver');
const {Builder, Capabilities} = require('selenium-webdriver');
const {clearLastExpectError, getLastExpectError} = require('./expect');
const {SeleniumWebDriverController} = require('./selenium-webdriver-controller');

/** Should have something in the name, otherwise nothing is shown. */
const SUB = ' ';
const TIMEOUT = 20000;

/**
 * TODO(estherkim): use this to specify browsers/fixtures to opt in/out of
 * @typedef {{
 *  browsers: (!Array<string>|undefined),
 *  fixtures: (!Array<string>|undefined),
 * }}
 */
let TestSpec;

/**
 * An end2end test using selenium web driver on a regular amp page
 */
const endtoend = describeEnv(spec => [
  new AmpPageFixture(spec),
  // TODO(estherkim): add fixtures for viewer, shadow, cache, etc
]);

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
    const fixtures = [];
    factory(spec).forEach(fixture => {
      if (fixture && fixture.isOn()) {
        fixtures.push(fixture);
      }
    });
    return describeFunc(name, function() {
      const env = Object.create(null);
      let asyncErrorTimerId;
      this.timeout(TIMEOUT);
      beforeEach(() => {
        let totalPromise = undefined;
        // Set up all fixtures.
        fixtures.forEach((fixture, unusedIndex) => {
          if (totalPromise) {
            totalPromise = totalPromise.then(() => fixture.setup(env));
          } else {
            const res = fixture.setup(env);
            if (res && typeof res.then == 'function') {
              totalPromise = res;
            }
          }
        });
        return totalPromise;
      });

      afterEach(function() {
        clearLastExpectError();
        clearTimeout(asyncErrorTimerId);
        // Tear down all fixtures.
        fixtures.slice(0).reverse().forEach(fixture => {
          // TODO(cvializ): handle errors better
          // if (this.currentTest.state == 'failed') {
          //   fixture.handleError();
          // }
          fixture.teardown(env);
        });

        // Delete all other keys.
        for (const key in env) {
          delete env[key];
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
    });
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


/** @interface */
class FixtureInterface {

  /** @return {boolean} */
  isOn() {}

  /**
   * @param {!Object} unusedEnv
   * @return {!Promise|undefined}
   */
  setup(unusedEnv) {}

  /**
   * @param {!Object} unusedEnv
   */
  teardown(unusedEnv) {}
}

/** @implements {FixtureInterface} */
class AmpPageFixture {

  /** @param {!TestSpec} spec */
  constructor(spec) {
    /** @const */
    this.spec = spec;

    // /** @private @const {!Array<string>} */
    // this.browsers_ = this.spec.browsers || ['chrome'];

    /** @private @const */
    this.driver_ = null;
  }

  /** @override */
  isOn() {
    return true;
  }

  /** @override */
  async setup(env) {
    // TODO(estherkim): implement sessions
    // TODO(estherkim): ensure tests are in a sandbox
    // See https://w3c.github.io/webdriver/#sessions

    // TODO(estherkim): create multiple drivers per 'config.browsers'
    // const config = {
    //   browsers: this.browsers_,
    //   session: undefined,
    // };

    // TODO(estherkim): remove hardcoded chrome driver
    const capabilities = Capabilities.chrome();
    const chromeOptions = {
      // TODO(cvializ,estherkim,sparhami):
      //   figure out why headless causes more flakes
      // 'args': ['--headless']
    };
    capabilities.set('chromeOptions', chromeOptions);

    const builder = new Builder().withCapabilities(capabilities);
    const driver = await builder.build();
    const controller = new SeleniumWebDriverController(driver);
    const ampDriver = new AmpDriver(controller);

    env.controller = controller;
    env.ampDriver = ampDriver;
    this.driver_ = driver;

    const {
      fixture,
      experiments,
      environment,
      serveMode,
    } = this.spec;

    await setServeMode(ampDriver, serveMode);
    await toggleExperiments(ampDriver, fixture, experiments);
    await ampDriver.navigateToEnvironment(environment, fixture);
  }

  /** @override */
  async teardown(env) {
    const {controller} = env;
    if (controller) {
      await controller.switchToParent();
    }
    if (this.driver_) {
      await this.driver_.quit();
    }
    this.driver_ = null;
  }
}

/**
 * Set the serve mode on the AMP dev server
 * @param {!AmpDriver} ampDriver
 * @param {string} serveMode cdn, compiled, uncompiled
 * @return {!Promise}
 */
function setServeMode(ampDriver, serveMode) {
  if (!serveMode) {
    return Promise.resolve();
  }

  return ampDriver.serveMode(serveMode);
}

/**
 * Toggle the given experiments for the given fixture URL domain.
 * @param {!AmpDriver} ampDriver
 * @param {string} fixture
 * @param {!Array<string>} experiments
 */
function toggleExperiments(ampDriver, fixture, experiments) {
  if (!Array.isArray(experiments)) {
    return Promise.resolve();
  }

  const navigate =
      ampDriver.navigateToEnvironment(Environment.SINGLE, fixture);
  return navigate.then(() => {
    const togglePromises = experiments.map(experiment => {
      return ampDriver.toggleExperiment(experiment, true);
    });
    return Promise.all(togglePromises);
  });
}

module.exports = {
  TestSpec,
  endtoend,
};
