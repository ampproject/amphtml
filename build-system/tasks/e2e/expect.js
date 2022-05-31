const chai = require('chai');
chai.use(require('chai-as-promised'));
const {ControllerPromise} = require('./controller-promise');

let installed;
let lastExpectError;
let networkLogger;

/**
 * Clears previous expected error state.
 */
function clearLastExpectError() {
  lastExpectError = null;
}

/**
 * Retrieves the expected error state.
 * @return {?Error}
 */
function getLastExpectError() {
  return lastExpectError;
}

/**
 * @param {*} actual
 * @param {string=} opt_message
 * @return {!Chai.Assertion}
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
 * {@link https://github.com/chaijs/chai/blob/main/lib/chai/core/assertions.js}
 */
const chaiMethodsAndProperties = [
  {name: 'a', type: ChaiType.CHAINABLE_METHOD},
  {name: 'above', type: ChaiType.METHOD},
  {name: 'an', type: ChaiType.CHAINABLE_METHOD},
  {name: 'approximately', type: ChaiType.METHOD},
  {name: 'arguments', type: ChaiType.PROPERTY},
  {name: 'Arguments', type: ChaiType.PROPERTY},
  {name: 'below', type: ChaiType.METHOD},
  {name: 'by', type: ChaiType.METHOD, unsupported: true},
  {name: 'change', type: ChaiType.METHOD, unsupported: true},
  {name: 'changes', type: ChaiType.METHOD, unsupported: true},
  {name: 'closeTo', type: ChaiType.METHOD},
  {name: 'contain', type: ChaiType.CHAINABLE_METHOD},
  {name: 'contains', type: ChaiType.CHAINABLE_METHOD},
  {name: 'decrease', type: ChaiType.METHOD, unsupported: true},
  {name: 'decreases', type: ChaiType.METHOD, unsupported: true},
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
  {name: 'increase', type: ChaiType.METHOD, unsupported: true},
  {name: 'increases', type: ChaiType.METHOD, unsupported: true},
  {name: 'instanceof', type: ChaiType.METHOD},
  {name: 'instanceOf', type: ChaiType.METHOD},
  {name: 'key', type: ChaiType.METHOD},
  {name: 'keys', type: ChaiType.METHOD},
  {name: 'least', type: ChaiType.METHOD},
  {name: 'length', type: ChaiType.CHAINABLE_METHOD},
  {name: 'lengthOf', type: ChaiType.CHAINABLE_METHOD},
  {name: 'lessThan', type: ChaiType.METHOD},
  {name: 'lt', type: ChaiType.METHOD},
  {name: 'lte', type: ChaiType.METHOD},
  {name: 'match', type: ChaiType.METHOD},
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
  {name: 'respondsTo', type: ChaiType.METHOD, unsupported: true},
  {name: 'respondTo', type: ChaiType.METHOD, unsupported: true},
  {name: 'satisfies', type: ChaiType.METHOD},
  {name: 'satisfy', type: ChaiType.METHOD},
  {name: 'sealed', type: ChaiType.PROPERTY},
  {name: 'string', type: ChaiType.METHOD},
  {name: 'throw', type: ChaiType.METHOD, unsupported: true},
  {name: 'Throw', type: ChaiType.METHOD, unsupported: true},
  {name: 'throws', type: ChaiType.METHOD, unsupported: true},
  {name: 'true', type: ChaiType.PROPERTY},
  {name: 'undefined', type: ChaiType.PROPERTY},
  {name: 'within', type: ChaiType.METHOD},
];

/**
 * @param {Chai.ChaiStatic} chai
 * @param {Chai.ChaiUtils} utils
 */
function installWrappers(chai, utils) {
  const {CHAINABLE_METHOD, METHOD, PROPERTY} = ChaiType;
  const {Assertion} = chai;

  for (const {name, type, unsupported} of chaiMethodsAndProperties) {
    /** @type {function(Chai.AssertionStatic): void} */
    const overwrite = unsupported
      ? overwriteUnsupported
      : overwriteAlwaysUseSuper(utils);

    switch (type) {
      case METHOD:
        Assertion.overwriteMethod(name, overwrite);
        break;
      case PROPERTY:
        // TODO(#28387) cleanup this type.
        Assertion.overwriteProperty(name, /** @type {*} */ (overwrite));
        break;
      case CHAINABLE_METHOD:
        Assertion.overwriteChainableMethod(
          name,
          overwrite,
          /** @type {() => any} */ (inheritChainingBehavior)
        );
        break;
      default:
        throw new Error('Unknown ChaiType');
    }
  }
}

/**
 * @param {Chai.ChaiUtils} utils
 * @return {function(Chai.AssertionStatic): function(): any}
 */
function overwriteAlwaysUseSuper(utils) {
  const {flag} = utils;

  /**
   * @param {Chai.AssertionStatic} _super
   * @return {function(): ReturnType<Chai.AssertionStatic>}
   */
  return function (_super) {
    return function () {
      // @ts-ignore
      const that = this;
      const obj = that._obj;
      const isControllerPromise = obj instanceof ControllerPromise;
      if (!isControllerPromise) {
        return _super.apply(that, arguments);
      }
      const {waitForValue} = obj;
      if (!waitForValue) {
        return obj.then((result) => {
          flag(that, 'object', result);
          return _super.apply(that, arguments);
        });
      }

      /**
       * When passed to `waitForValue`, this method causes the Promise
       * returned by `waitForValue` to resolve only when the value it
       * polls matches expectation set by the `expect` chain.
       * @param {*} value
       * @return {boolean} true if the ControllerPromise polling value
       * satisfies the `expect` chain.
       */
      const valueSatisfiesExpectation = (value) => {
        try {
          // Tell chai to use value as the subject of the expect chain.
          flag(that, 'object', value);

          // Run the code that checks the condition.
          _super.apply(that, arguments);

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
          flag(that, 'object', resultPromise);
        }
      };

      const resultPromise = /** @type {(arg: *) => Promise<*>} */ (
        waitForValue
      )(valueSatisfiesExpectation);
      flag(that, 'object', resultPromise);
      return resultPromise;
    };
  };
}

/**
 * @param {Chai.AssertionStatic} _super
 * @return {function(): *}
 */
function inheritChainingBehavior(_super) {
  return function () {
    // @ts-ignore
    _super.apply(this, arguments);
  };
}

/**
 * @param {Chai.AssertionStatic} _super
 * @return {function(): *}
 */
function overwriteUnsupported(_super) {
  return function () {
    // @ts-ignore
    const that = this;
    const obj = that._obj;
    const isControllerPromise = obj instanceof ControllerPromise;
    if (isControllerPromise) {
      throw new Error(
        'ControllerPromise used with unsupported expectation. Await the Promise and expect the value.'
      );
    }
    return _super.apply(that, arguments);
  };
}

/**
 * @param {*} _networkLogger
 */
function installBrowserAssertions(_networkLogger) {
  networkLogger = _networkLogger;
  chai.use(installBrowserWrappers);
}

/**
 * @param {Chai.ChaiStatic} chai
 * @param {Chai.ChaiUtils} utils
 */
function installBrowserWrappers(chai, utils) {
  const {Assertion} = chai;

  // Assert that a request with a testUrl was sent
  // Example usage: await expect(testUrl).to.have.been.sent;
  utils.addProperty(Assertion.prototype, 'sent', async function () {
    // @ts-ignore
    const that = this;
    const url = that._obj;
    const requests = await networkLogger.getSentRequests(url);
    that.assert(0 < requests.length, 'expected #{this} to have been sent');
  });
  Assertion.overwriteProperty(
    'sent',
    /** @type {any} */ (overwriteAlwaysUseSuper(utils))
  );

  // Assert that a request was sent n number of times
  // Example usage: await expect(testUrl).to.have.sentCount(n);
  utils.addMethod(Assertion.prototype, 'sentCount', async function (count) {
    // @ts-ignore
    const that = this;
    const url = that._obj;
    const requests = await networkLogger.getSentRequests(url);
    that.assert(
      count === requests.length,
      `expected #{this} to have been sent ${
        count == 1 ? 'once' : count + ' times'
      }`
    );
  });
  Assertion.overwriteMethod('sentCount', overwriteAlwaysUseSuper(utils));
}

module.exports = {
  clearLastExpectError,
  expect,
  getLastExpectError,
  installBrowserAssertions,
};
