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
    chai.use(installWrappers);
  }

  return chai.expect(actual, opt_message);
}

/** @enum {string} */
const ChaiType = {
  METHOD: 'method',
  PROPERTY: 'property',
  CHAINABLE_METHOD: 'chainable-method',
};

/**
 * These properties will be overridden to accept a Promise value and then
 * continue to process the value like normal.
 * Only the chai properties that make assertions need to be overwritten.
 * Not all chai properties need to be overwritten, like those that set
 * flags or are only language chains e.g. `not` or 'to'
 * See the Chai implementation for the original definitions:
 * {@link https://github.com/chaijs/chai/blob/master/lib/chai/core/assertions.js}
 */
const chaiMethodsAndProperties = [
  {name: 'a', type: ChaiType.CHAINABLE_METHOD},
  {name: 'above', type: ChaiType.METHOD},
  {name: 'an', type: ChaiType.CHAINABLE_METHOD},
  {name: 'approximately', type: ChaiType.METHOD},
  {name: 'arguments', type: ChaiType.PROPERTY},
  {name: 'Arguments', type: ChaiType.PROPERTY},
  {name: 'below', type: ChaiType.METHOD},
  {name: 'by', type: ChaiType.METHOD},
  {name: 'change', type: ChaiType.METHOD},
  {name: 'changes', type: ChaiType.METHOD},
  {name: 'closeTo', type: ChaiType.METHOD},
  {name: 'contain', type: ChaiType.CHAINABLE_METHOD},
  {name: 'contains', type: ChaiType.CHAINABLE_METHOD},
  {name: 'decrease', type: ChaiType.METHOD},
  {name: 'decreases', type: ChaiType.METHOD},
  {name: 'empty', type: ChaiType.PROPERTY},
  {name: 'eq', type: ChaiType.METHOD},
  {name: 'eql', type: ChaiType.METHOD},
  {name: 'eqls', type: ChaiType.METHOD},
  {name: 'equal', type: ChaiType.METHOD},
  {name: 'equals', type: ChaiType.METHOD},
  {name: 'exist', type: ChaiType.PROPERTY},
  {name: 'extensible', type: ChaiType.PROPERTY},
  {name: 'false', type: ChaiType.PROPERTY},
  {name: 'finite', type: ChaiType.PROPERTY},
  {name: 'frozen', type: ChaiType.PROPERTY},
  {name: 'greaterThan', type: ChaiType.METHOD},
  {name: 'gt', type: ChaiType.METHOD},
  {name: 'gte', type: ChaiType.METHOD},
  {name: 'haveOwnProperty', type: ChaiType.METHOD},
  {name: 'haveOwnPropertyDescriptor', type: ChaiType.METHOD},
  {name: 'include', type: ChaiType.CHAINABLE_METHOD},
  {name: 'includes', type: ChaiType.CHAINABLE_METHOD},
  {name: 'increase', type: ChaiType.METHOD},
  {name: 'increases', type: ChaiType.METHOD},
  {name: 'instanceof', type: ChaiType.METHOD},
  {name: 'instanceOf', type: ChaiType.METHOD},
  {name: 'isFalse', type: ChaiType.PROPERTY},
  {name: 'isNull', type: ChaiType.PROPERTY},
  {name: 'isOk', type: ChaiType.PROPERTY},
  {name: 'isTrue', type: ChaiType.PROPERTY},
  {name: 'itself', type: ChaiType.PROPERTY},
  {name: 'key', type: ChaiType.METHOD},
  {name: 'keys', type: ChaiType.METHOD},
  {name: 'least', type: ChaiType.METHOD},
  {name: 'length', type: ChaiType.CHAINABLE_METHOD},
  {name: 'length', type: ChaiType.CHAINABLE_METHOD},
  {name: 'lengthOf', type: ChaiType.CHAINABLE_METHOD},
  {name: 'lengthOf', type: ChaiType.CHAINABLE_METHOD},
  {name: 'lessThan', type: ChaiType.METHOD},
  {name: 'lt', type: ChaiType.METHOD},
  {name: 'lte', type: ChaiType.METHOD},
  {name: 'match', type: ChaiType.METHOD},
  {name: 'match', type: ChaiType.METHOD},
  {name: 'matches', type: ChaiType.METHOD},
  {name: 'matches', type: ChaiType.METHOD},
  {name: 'members', type: ChaiType.METHOD},
  {name: 'most', type: ChaiType.METHOD},
  {name: 'NaN', type: ChaiType.PROPERTY},
  {name: 'null', type: ChaiType.PROPERTY},
  {name: 'ok', type: ChaiType.PROPERTY},
  {name: 'oneOf', type: ChaiType.METHOD},
  {name: 'ownProperty', type: ChaiType.METHOD},
  {name: 'ownPropertyDescriptor', type: ChaiType.METHOD},
  {name: 'property', type: ChaiType.METHOD},
  {name: 'respondsTo', type: ChaiType.METHOD},
  {name: 'respondTo', type: ChaiType.METHOD},
  {name: 'satisfies', type: ChaiType.METHOD},
  {name: 'satisfy', type: ChaiType.METHOD},
  {name: 'sealed', type: ChaiType.PROPERTY},
  {name: 'string', type: ChaiType.METHOD},
  {name: 'throw', type: ChaiType.METHOD},
  {name: 'Throw', type: ChaiType.METHOD},
  {name: 'throws', type: ChaiType.METHOD},
  {name: 'true', type: ChaiType.PROPERTY},
  {name: 'undefined', type: ChaiType.PROPERTY},
  {name: 'within', type: ChaiType.METHOD},
];

function installWrappers(chai, utils) {
  const {METHOD, PROPERTY, CHAINABLE_METHOD} = ChaiType;
  const {Assertion} = chai;
  const overwrite = overwriteAlwaysUseSuper(utils);

  for (const {name, type} of chaiMethodsAndProperties) {
    switch (type) {
      case METHOD:
        Assertion.overwriteMethod(name, overwrite);
        break;
      case PROPERTY:
        Assertion.overwriteProperty(name, overwrite);
        break;
      case CHAINABLE_METHOD:
        Assertion.overwriteChainableMethod(
          name,
          overwrite,
          inheritChainingBehavior
        );
        break;
      default:
        throw new Error('Unknown ChaiType');
    }
  }
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
          clearLastExpectError();
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
