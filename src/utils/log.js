import * as assertions from '#core/assert/base';
import {
  createError,
  createExpectedError,
  duplicateErrorIfNecessary,
} from '#core/error';
import {
  USER_ERROR_EMBED_SENTINEL,
  USER_ERROR_SENTINEL,
  elementStringOrPassThru,
  isUserErrorMessage,
  stripUserError,
} from '#core/error/message-helpers';
import * as mode from '#core/mode';
import {isArray, isString} from '#core/types';
import {once} from '#core/types/function';
import {getHashParams} from '#core/types/string/url';

import * as urls from '../config/urls';
import {getMode} from '../mode';

const noop = () => {};

// These are exported here despite being defined elswhere to avoid updating
// imports across many files for now.
export {USER_ERROR_SENTINEL, isUserErrorMessage};

/**
 * Sets reportError function. Called from error-reporting.js to break cyclic
 * dependency.
 * @param {function(this:Window, Error, (?Element)=): ?|undefined} fn
 */
export function setReportError(fn) {
  self.__AMP_REPORT_ERROR = fn;
}

/**
 * @enum {number}
 */
export const LogLevel_Enum = {
  OFF: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  FINE: 4,
};

/**
 * @type {!LogLevel_Enum|undefined}
 * @private
 */
let levelOverride_ = undefined;

/**
 * @param {!LogLevel_Enum} level
 */
export function overrideLogLevel(level) {
  levelOverride_ = level;
}

/**
 * Prefixes `internalRuntimeVersion` with the `01` channel signifier (for prod.) for
 * extracted message URLs.
 * (Specific channel is irrelevant: message tables are invariant on internal version.)
 * @return {string}
 */
const messageUrlRtv = () => `01${mode.version()}`;

/**
 * Gets a URL to display a message on amp.dev.
 * @param {string} id
 * @param {!Array} interpolatedParts
 * @return {string}
 */
const externalMessageUrl = (id, interpolatedParts) =>
  interpolatedParts.reduce(
    (prefix, arg) => `${prefix}&s[]=${messageArgToEncodedComponent(arg)}`,
    `https://log.amp.dev/?v=${messageUrlRtv()}&id=${encodeURIComponent(id)}`
  );

/**
 * URL to simple log messages table JSON file, which contains an {[key: string]: string}
 * which maps message id to full message template.
 * @return {string}
 */
const externalMessagesSimpleTableUrl = () =>
  `${urls.cdn}/rtv/${messageUrlRtv()}/log-messages.simple.json`;

/**
 * @param {*} arg
 * @return {string}
 */
const messageArgToEncodedComponent = (arg) =>
  encodeURIComponent(String(elementStringOrPassThru(arg)));

/**
 * @param {!Window=} opt_win
 * @return {number}
 */
export const logHashParam = (opt_win) =>
  parseInt(getHashParams(opt_win)['log'], 10);

/**
 * Logging class. Use of sentinel string instead of a boolean to check user/dev
 * errors because errors could be rethrown by some native code as a new error,
 * and only a message would survive. Also, some browser don’t support a 5th
 * error object argument in window.onerror. List of supporting browser can be
 * found here:
 * https://blog.sentry.io/2016/01/04/client-javascript-reporting-window-onerror.html
 * @final
 * @private Visible for testing only.
 */
export class Log {
  /**
   * opt_suffix will be appended to error message to identify the type of the
   * error message. We can't rely on the error object to pass along the type
   * because some browsers do not have this param in its window.onerror API.
   * See:
   * https://blog.sentry.io/2016/01/04/client-javascript-reporting-window-onerror.html
   *
   * @param {!Window} win
   * @param {function(number, boolean):!LogLevel_Enum} levelFunc
   * @param {string=} opt_suffix
   */
  constructor(win, levelFunc, opt_suffix = '') {
    /**
     * In tests we use the main test window instead of the iframe where
     * the tests runs because only the former is relayed to the console.
     * @const {!Window}
     */
    this.win = getMode().test && win.__AMP_TEST_IFRAME ? win.parent : win;

    /** @private @const {function(number, boolean):!LogLevel_Enum} */
    this.levelFunc_ = levelFunc;

    /** @private @const {!LogLevel_Enum} */
    this.level_ = this.defaultLevel_();

    /** @private @const {string} */
    this.suffix_ = opt_suffix;

    /** @private {?JsonObject} */
    this.messages_ = null;

    this.fetchExternalMessagesOnce_ = once(() => {
      win
        .fetch(externalMessagesSimpleTableUrl())
        .then((response) => response.json(), noop)
        .then((opt_messages) => {
          if (opt_messages) {
            this.messages_ = /** @type {!JsonObject} */ (opt_messages);
          }
        });
    });

    // This bound assertion function is capable of handling the format used when
    // error/assertion messages are extracted. This logic hasn't yet been
    // migrated to an AMP-independent form for use in core. This binding allows
    // Log assertion helpers to maintain message-extraction capabilities until
    // that logic can be moved to core.
    this.boundAssertFn_ = /** @type {!assertions.AssertionFunctionDef} */ (
      this.assert.bind(this)
    );
  }

  /**
   * @return {!LogLevel_Enum}
   * @private
   */
  defaultLevel_() {
    const {win} = this;
    // No console - can't enable logging.
    if (
      !win.console?.log ||
      // Logging has been explicitly disabled.
      logHashParam(win) == 0
    ) {
      return LogLevel_Enum.OFF;
    }

    // Logging is enabled for tests directly.
    if (getMode().test && win.ENABLE_LOG) {
      return LogLevel_Enum.FINE;
    }

    // LocalDev by default allows INFO level, unless overriden by `#log`.
    if (getMode().localDev) {
      return LogLevel_Enum.INFO;
    }

    return this.defaultLevelWithFunc_();
  }

  /**
   * @param {!Window=} opt_win provided for testing
   * @return {!LogLevel_Enum}
   * @private
   */
  defaultLevelWithFunc_(opt_win) {
    // Delegate to the specific resolver.
    return this.levelFunc_(logHashParam(opt_win), getMode().development);
  }

  /**
   * @param {string} tag
   * @param {!LogLevel_Enum} level
   * @param {!Array} messages
   * @return {boolean} true if a the message was logged
   */
  msg_(tag, level, messages) {
    if (level > (levelOverride_ ?? this.level_)) {
      return false;
    }

    const cs = this.win.console;
    const fn =
      {
        [LogLevel_Enum.ERROR]: cs.error,
        [LogLevel_Enum.INFO]: cs.info,
        [LogLevel_Enum.WARN]: cs.warn,
      }[level] ?? cs.log;

    const args = this.maybeExpandMessageArgs_(messages);
    // Prefix console message with "[tag]".
    const prefix = `[${tag}]`;
    if (isString(args[0])) {
      // Prepend string to avoid breaking string substitutions e.g. %s.
      args[0] = prefix + ' ' + args[0];
    } else {
      args.unshift(prefix);
    }
    fn.apply(cs, args);

    return true;
  }

  /**
   * Reports a fine-grained message.
   * @param {string} tag
   * @param {...*} args
   */
  fine(tag, ...args) {
    this.msg_(tag, LogLevel_Enum.FINE, args);
  }

  /**
   * Reports a informational message.
   * @param {string} tag
   * @param {...*} args
   */
  info(tag, ...args) {
    this.msg_(tag, LogLevel_Enum.INFO, args);
  }

  /**
   * Reports a warning message.
   * @param {string} tag
   * @param {...*} args
   */
  warn(tag, ...args) {
    this.msg_(tag, LogLevel_Enum.WARN, args);
  }

  /**
   * Reports an error message.
   * @param {string} tag
   * @param {...*} args
   */
  error(tag, ...args) {
    if (!this.msg_(tag, LogLevel_Enum.ERROR, args)) {
      const error = this.createError.apply(this, args);
      error.name = tag || error.name;
      self.__AMP_REPORT_ERROR?.(error);
    }
  }

  /**
   * Reports an error message and marks with an expected property. If the
   * logging is disabled, the error is rethrown asynchronously.
   * @param {string} tag
   * @param {...*} args
   */
  expectedError(tag, ...args) {
    if (!this.msg_(tag, LogLevel_Enum.ERROR, args)) {
      self.__AMP_REPORT_ERROR?.(this.createExpectedError.apply(this, args));
    }
  }

  /**
   * Creates an error object.
   * @param {...*} var_args
   * @return {!Error}
   */
  createError(var_args) {
    return this.setErrorSuffix_(createError.apply(null, arguments));
  }

  /**
   * Creates an error object with its expected property set to true.
   * @param {...*} var_args
   * @return {!Error}
   */
  createExpectedError(var_args) {
    return this.setErrorSuffix_(createExpectedError.apply(null, arguments));
  }

  /**
   * @param {!Error} error
   * @return {!Error}
   * @private
   */
  setErrorSuffix_(error) {
    error = duplicateErrorIfNecessary(error);

    if (this.suffix_) {
      if (!error.message) {
        error.message = this.suffix_;
      } else if (error.message.indexOf(this.suffix_) == -1) {
        error.message += this.suffix_;
      }
    } else if (isUserErrorMessage(error.message)) {
      error.message = stripUserError(error.message);
    }

    return error;
  }

  /**
   * @param {!Array} args
   * @return {!Array}
   * @private
   */
  maybeExpandMessageArgs_(args) {
    return isArray(args[0])
      ? this.expandMessageArgs_(/** @type {!Array} */ (args[0]))
      : args;
  }

  /**
   * Either redirects a pair of (errorId, ...args) to a URL where the full
   * message is displayed, or displays it from a fetched table.
   *
   * This method is used by the output of the `transform-log-methods` babel
   * plugin. It should not be used directly. Use the (*error|assert*|info|warn)
   * methods instead.
   *
   * @param {!Array} parts
   * @return {!Array}
   * @private
   */
  expandMessageArgs_(parts) {
    // First value should exist.
    const id = parts.shift();
    // Best effort fetch of message template table.
    // Since this is async, the first few logs might be indirected to a URL even
    // if in development mode. Message table is ~small so this should be a short
    // gap.
    if (getMode(this.win).development) {
      this.fetchExternalMessagesOnce_();
    }

    return this.messages_?.[id]
      ? [this.messages_[id]].concat(parts)
      : [`More info at ${externalMessageUrl(id, parts)}`];
  }

  /**
   * Throws an error if the first argument isn't trueish.
   *
   * Supports argument substitution into the message via %s placeholders.
   *
   * Throws an error object that has two extra properties:
   * - associatedElement: This is the first element provided in the var args.
   *   It can be used for improved display of error messages.
   * - messageArray: The elements of the substituted message as non-stringified
   *   elements in an array. When e.g. passed to console.error this yields
   *   native displays of things like HTML elements.
   *
   * @param {T} shouldBeTrueish The value to assert. The assert fails if it does
   *     not evaluate to true.
   * @param {!Array|string=} opt_message The assertion message
   * @param {...*} var_args Arguments substituted into %s in the message.
   * @return {T} The value of shouldBeTrueish.
   * @throws {!Error} When `value` is falsey.
   * @template T
   * @closurePrimitive {asserts.truthy}
   */
  assert(shouldBeTrueish, opt_message, var_args) {
    if (isArray(opt_message)) {
      return this.assert.apply(
        this,
        [shouldBeTrueish].concat(
          this.expandMessageArgs_(/** @type {!Array} */ (opt_message))
        )
      );
    }

    return assertions.assert.apply(
      null,
      [this.suffix_].concat(Array.prototype.slice.call(arguments))
    );
  }

  /**
   * Throws an error if the first argument isn't an Element
   *
   * Otherwise see `assert` for usage
   *
   * @param {*} shouldBeElement
   * @param {!Array|string=} opt_message The assertion message
   * @return {!Element} The value of shouldBeTrueish.
   * @closurePrimitive {asserts.matchesReturn}
   */
  assertElement(shouldBeElement, opt_message) {
    return assertions.assertElement(
      this.boundAssertFn_,
      shouldBeElement,
      opt_message
    );
  }

  /**
   * Throws an error if the first argument isn't a string. The string can
   * be empty.
   *
   * For more details see `assert`.
   *
   * @param {*} shouldBeString
   * @param {!Array|string=} opt_message The assertion message
   * @return {string} The string value. Can be an empty string.
   * @closurePrimitive {asserts.matchesReturn}
   */
  assertString(shouldBeString, opt_message) {
    return assertions.assertString(
      this.boundAssertFn_,
      shouldBeString,
      opt_message
    );
  }

  /**
   * Throws an error if the first argument isn't a number. The allowed values
   * include `0` and `NaN`.
   *
   * For more details see `assert`.
   *
   * @param {*} shouldBeNumber
   * @param {!Array|string=} opt_message The assertion message
   * @return {number} The number value. The allowed values include `0`
   *   and `NaN`.
   * @closurePrimitive {asserts.matchesReturn}
   */
  assertNumber(shouldBeNumber, opt_message) {
    return assertions.assertNumber(
      this.boundAssertFn_,
      shouldBeNumber,
      opt_message
    );
  }

  /**
   * Throws an error if the first argument is not an array.
   * The array can be empty.
   *
   * @param {*} shouldBeArray
   * @param {!Array|string=} opt_message The assertion message
   * @return {!Array} The array value
   * @closurePrimitive {asserts.matchesReturn}
   */
  assertArray(shouldBeArray, opt_message) {
    return assertions.assertArray(
      this.boundAssertFn_,
      shouldBeArray,
      opt_message
    );
  }

  /**
   * Throws an error if the first argument isn't a boolean.
   *
   * For more details see `assert`.
   *
   * @param {*} shouldBeBoolean
   * @param {!Array|string=} opt_message The assertion message
   * @return {boolean} The boolean value.
   * @closurePrimitive {asserts.matchesReturn}
   */
  assertBoolean(shouldBeBoolean, opt_message) {
    return assertions.assertBoolean(
      this.boundAssertFn_,
      shouldBeBoolean,
      opt_message
    );
  }
}

/**
 * Cache for logs. We do not use a Service since the service module depends
 * on Log and closure literally can't even.
 * @type {{user: ?Log, dev: ?Log, userForEmbed: ?Log}}
 */
self.__AMP_LOG = self.__AMP_LOG || {
  user: null,
  dev: null,
  userForEmbed: null,
};

const logs = self.__AMP_LOG;

/**
 * Eventually holds a constructor for Log objects. Lazily initialized, so we
 * can avoid ever referencing the real constructor except in JS binaries
 * that actually want to include the implementation.
 * @type {?typeof Log}
 */
let logConstructor = null;

/**
 * Initializes log constructor.
 */
export function initLogConstructor() {
  logConstructor = Log;
  // Initialize instances for use. If a binary (an extension for example) that
  // does not call `initLogConstructor` invokes `dev()` or `user()` earlier than
  // the binary that does call `initLogConstructor` (amp.js), the extension will
  // throw an error as that extension will never be able to initialize the log
  // instances and we also don't want it to call `initLogConstructor` either
  // (since that will cause the Log implementation to be bundled into that
  // binary). So we must initialize the instances eagerly so that they are ready
  // for use (stored globally) after the main binary calls `initLogConstructor`.
  dev();
  user();
}

/**
 * Resets log constructor for testing.
 */
export function resetLogConstructorForTesting() {
  logConstructor = null;
}

/**
 * Calls the log constructor with a given level function and suffix.
 * @param {function(number, boolean):!LogLevel_Enum} levelFunc
 * @param {string=} opt_suffix
 * @return {!Log}
 */
function callLogConstructor(levelFunc, opt_suffix) {
  if (!logConstructor) {
    throw new Error('failed to call initLogConstructor');
  }
  return new logConstructor(self, levelFunc, opt_suffix);
}

/**
 * Publisher level log.
 *
 * Enabled in the following conditions:
 *  1. Not disabled using `#log=0`.
 *  2. Development mode is enabled via `#development=1` or logging is explicitly
 *     enabled via `#log=D` where D >= 1.
 *  3. AMP.setLogLevel(D) is called, where D >= 1.
 *
 * @param {!Element=} opt_element
 * @return {!Log}
 */
export function user(opt_element) {
  // logs.user must exist first to perform the logs.user.win check below
  if (!logs.user) {
    logs.user = getUserLogger(USER_ERROR_SENTINEL);
  }

  if (isFromEmbed(logs.user.win, opt_element)) {
    return (
      logs.userForEmbed ||
      (logs.userForEmbed = getUserLogger(USER_ERROR_EMBED_SENTINEL))
    );
  }
  return logs.user;
}

/**
 * Getter for user logger
 * @param {string=} suffix
 * @return {!Log}
 */
function getUserLogger(suffix) {
  return callLogConstructor(
    (logNum, development) =>
      development || logNum >= 1 ? LogLevel_Enum.FINE : LogLevel_Enum.WARN,
    suffix
  );
}

/**
 * AMP development log. Calls to `devLog().assert` and `dev.fine` are stripped
 * in the PROD binary. However, `devLog().assert` result is preserved in either
 * case.
 *
 * Enabled in the following conditions:
 *  1. Not disabled using `#log=0`.
 *  2. Logging is explicitly enabled via `#log=D`, where D >= 2.
 *  3. AMP.setLogLevel(D) is called, where D >= 2.
 *
 * @return {!Log}
 */
export function dev() {
  return (
    logs.dev ||
    (logs.dev = callLogConstructor((logNum) =>
      logNum >= 3
        ? LogLevel_Enum.FINE
        : logNum >= 2
          ? LogLevel_Enum.INFO
          : LogLevel_Enum.OFF
    ))
  );
}

/**
 * @param {!Window} win
 * @param {!Element=} opt_element
 * @return {boolean} isEmbed
 */
function isFromEmbed(win, opt_element) {
  return opt_element && opt_element.ownerDocument.defaultView != win;
}

/**
 * Throws an error if the first argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders.
 *
 * Throws an error object that has two extra properties:
 * - associatedElement: This is the first element provided in the var args.
 *   It can be used for improved display of error messages.
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this yields
 *   native displays of things like HTML elements.
 *
 * @param {T} shouldBeTrueish The value to assert. The assert fails if it does
 *     not evaluate to true.
 * @param {!Array|string=} opt_message The assertion message
 * @param {*=} opt_1 Optional argument (Var arg as individual params for better
 * @param {*=} opt_2 Optional argument inlining)
 * @param {*=} opt_3 Optional argument
 * @param {*=} opt_4 Optional argument
 * @param {*=} opt_5 Optional argument
 * @param {*=} opt_6 Optional argument
 * @param {*=} opt_7 Optional argument
 * @param {*=} opt_8 Optional argument
 * @param {*=} opt_9 Optional argument
 * @return {T} The value of shouldBeTrueish.
 * @throws {!Error} When `shouldBeTrueish` is falsey.
 * @template T
 * @closurePrimitive {asserts.truthy}
 */
export function devAssert(
  shouldBeTrueish,
  opt_message,
  opt_1,
  opt_2,
  opt_3,
  opt_4,
  opt_5,
  opt_6,
  opt_7,
  opt_8,
  opt_9
) {
  if (mode.isMinified()) {
    return shouldBeTrueish;
  }
  if (self.__AMP_ASSERTION_CHECK) {
    // This will never execute regardless, but will be included on unminified
    // builds. It will be DCE'd away from minified builds, and so can be used to
    // validate that Babel is properly removing dev assertions in minified
    // builds.
    console /*OK*/
      .log('__devAssert_sentinel__');
  }

  return dev()./*Orig call*/ assert(
    shouldBeTrueish,
    opt_message,
    opt_1,
    opt_2,
    opt_3,
    opt_4,
    opt_5,
    opt_6,
    opt_7,
    opt_8,
    opt_9
  );
}

/**
 * Throws an error if the first argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders.
 *
 * Throws an error object that has two extra properties:
 * - associatedElement: This is the first element provided in the var args.
 *   It can be used for improved display of error messages.
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this yields
 *   native displays of things like HTML elements.
 *
 * @param {T} shouldBeTrueish The value to assert. The assert fails if it does
 *     not evaluate to true.
 * @param {!Array|string=} opt_message The assertion message
 * @param {*=} opt_1 Optional argument (Var arg as individual params for better
 * @param {*=} opt_2 Optional argument inlining)
 * @param {*=} opt_3 Optional argument
 * @param {*=} opt_4 Optional argument
 * @param {*=} opt_5 Optional argument
 * @param {*=} opt_6 Optional argument
 * @param {*=} opt_7 Optional argument
 * @param {*=} opt_8 Optional argument
 * @param {*=} opt_9 Optional argument
 * @return {T} The value of shouldBeTrueish.
 * @throws {!Error} When `shouldBeTrueish` is falsey.
 * @template T
 * @closurePrimitive {asserts.truthy}
 */
export function userAssert(
  shouldBeTrueish,
  opt_message,
  opt_1,
  opt_2,
  opt_3,
  opt_4,
  opt_5,
  opt_6,
  opt_7,
  opt_8,
  opt_9
) {
  return user()./*Orig call*/ assert(
    shouldBeTrueish,
    opt_message,
    opt_1,
    opt_2,
    opt_3,
    opt_4,
    opt_5,
    opt_6,
    opt_7,
    opt_8,
    opt_9
  );
}
