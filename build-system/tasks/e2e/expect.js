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

const chai = require('chai');
const {ControllerPromise} = require('./functional-test-controller');

let installed;
let lastExpectError;

function clearLastExpectError() {
  lastExpectError = null;
}

/**
 * @return {?Error}
 */
function getLastExpectError() {
  return lastExpectError;
}

/**
 * @param {*} actual
 * @param {string=} opt_message
 * @return {!ExpectStatic}
 */
function expect(actual, opt_message) {
  if (!installed) {
    installed = true;
    // See https://www.chaijs.com/guide/helpers/ for details on implementation
    chai.use(installEqualWrapper);
    chai.use(installIncludeWrapper);
    chai.use(installMatchWrapper);
    chai.use(installLengthWrapper);
    chai.use(installAboveWrapper);
    chai.use(installBelowWrapper);
  }

  return chai.expect(actual, opt_message);
}

function installEqualWrapper(chai, utils) {
  const {Assertion} = chai;

  const overwrite = overwriteAlwaysUseSuper(utils);
  Assertion.overwriteMethod('equal', overwrite);
  Assertion.overwriteMethod('equals', overwrite);
  Assertion.overwriteMethod('eq', overwrite);
}

function installIncludeWrapper(chai, utils) {
  const {Assertion} = chai;

  const overwrite = overwriteAlwaysUseSuper(utils);
  Assertion.overwriteChainableMethod(
      'include', overwrite, inheritChainingBehavior);
  Assertion.overwriteChainableMethod(
      'includes', overwrite, inheritChainingBehavior);
  Assertion.overwriteChainableMethod(
      'contain', overwrite, inheritChainingBehavior);
  Assertion.overwriteChainableMethod(
      'contains', overwrite, inheritChainingBehavior);
}

function installMatchWrapper(chai, utils) {
  const {Assertion} = chai;

  const overwrite = overwriteAlwaysUseSuper(utils);
  Assertion.overwriteMethod('match', overwrite);
  Assertion.overwriteMethod('matches', overwrite);
}

function installLengthWrapper(chai, utils) {
  const {Assertion} = chai;

  const overwrite = overwriteAlwaysUseSuper(utils);
  Assertion.overwriteChainableMethod(
      'length', overwrite, inheritChainingBehavior);
  Assertion.overwriteChainableMethod(
      'lengthOf', overwrite, inheritChainingBehavior);
}

function installAboveWrapper(chai, utils) {
  const {Assertion} = chai;

  const overwrite = overwriteAlwaysUseSuper(utils);
  Assertion.overwriteMethod('above', overwrite);
  Assertion.overwriteMethod('gt', overwrite);
  Assertion.overwriteMethod('greaterThan', overwrite);
}

function installBelowWrapper(chai, utils) {
  const {Assertion} = chai;

  const overwrite = overwriteAlwaysUseSuper(utils);
  Assertion.overwriteMethod('below', overwrite);
  Assertion.overwriteMethod('lt', overwrite);
  Assertion.overwriteMethod('lessThan', overwrite);
}

function overwriteAlwaysUseSuper(utils) {
  const {flag} = utils;

  return function(_super) {
    return async function() {
      const obj = this._obj;
      const isControllerPromise = obj instanceof ControllerPromise;
      if (!isControllerPromise) {
        return _super.apply(this, arguments);
      }
      const {waitForValue} = obj;
      if (!waitForValue) {
        const result = await obj;
        flag(this, 'object', result);
        return _super.apply(this, arguments);
      }

      const resultPromise = waitForValue(obj => {
        try {
          flag(this, 'object', obj);
          // Run the code that checks the condition.
          _super.apply(this, arguments);
          // Let waitForValue know we are done.
          return true;
        } catch (e) {
          // The condition checking code threw an error, so we are not done
          // yet. Save the error so that it can be grabbed in case the test
          // times out.
          lastExpectError = e;
          return false;
        } finally {
          flag(this, 'object', resultPromise);
        }
      });

      flag(this, 'object', resultPromise);
      return resultPromise;
    };
  };
}

function inheritChainingBehavior(_super) {
  return function() {
    _super.apply(this, arguments);
  };
}

module.exports = {
  clearLastExpectError,
  expect,
  getLastExpectError,
};
