/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {
  USER_ERROR_SENTINEL,
  elementStringOrPassThru,
} from './core/error-message-helpers';
import {createErrorVargs, duplicateErrorIfNecessary} from './core/error';
import {findIndex, isArray} from './core/types/array';
import {getMode} from './mode';
import {internalRuntimeVersion} from './internal-version';
import {isEnumValue} from './core/types';
import {once} from './utils/function';
import {pureDevAssert, pureUserAssert} from './core/assert';
import {urls} from './config';

const noop = () => {};

export {USER_ERROR_SENTINEL};

/**
 * Four zero width space.
 *
 * @const {string}
 */
export const USER_ERROR_EMBED_SENTINEL = '\u200B\u200B\u200B\u200B';

/**
 * @param {string} message
 * @return {boolean} Whether this message was a user error.
 */
export function isUserErrorMessage(message) {
  return message.indexOf(USER_ERROR_SENTINEL) >= 0;
}

/**
 * @param {string} message
 * @return {string} The new message without USER_ERROR_SENTINEL
 */
export function stripUserError(message) {
  return message.replace(USER_ERROR_SENTINEL, '');
}

/**
 * @param {string} message
 * @return {boolean} Whether this message was a a user error from an iframe embed.
 */
export function isUserErrorEmbed(message) {
  return message.indexOf(USER_ERROR_EMBED_SENTINEL) >= 0;
}

/**
 * @enum {number}
 */
export const LogLevel = {
  OFF: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  FINE: 4,
};

/**
 * Sets reportError function. Called from error.js to break cyclic
 * dependency.
 * @param {function(*, !Element=)|undefined} fn
 */
export function setReportError(fn) {
  self.__AMP_REPORT_ERROR = fn;
}

/**
 * @type {!LogLevel|undefined}
 * @private
 */
let levelOverride_ = undefined;

/**
 * @param {!LogLevel} level
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
const messageUrlRtv = () => `01${internalRuntimeVersion()}`;

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
 * URL to simple log messages table JSON file, which contains an Object<string, string>
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
   * @param {function(number, boolean):!LogLevel} levelFunc
   * @param {string=} opt_suffix
   */
  constructor(win, levelFunc, opt_suffix = '') {
    /**
     * In tests we use the main test window instead of the iframe where
     * the tests runs because only the former is relayed to the console.
     * @const {!Window}
     */
    this.win = getMode().test && win.__AMP_TEST_IFRAME ? win.parent : win;

    /** @private @const {function(number, boolean):!LogLevel} */
    this.levelFunc_ = levelFunc;

    /** @private @const {!LogLevel} */
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
  }

  /**
   * @return {!LogLevel}
   * @private
   */
  getLevel_() {
    return levelOverride_ !== undefined ? levelOverride_ : this.level_;
  }

  /**
   * @return {!LogLevel}
   * @private
   */
  defaultLevel_() {
    // No console - can't enable logging.
    if (!this.win.console || !this.win.console.log) {
      return LogLevel.OFF;
    }

    // Logging has been explicitly disabled.
    if (getMode().log == '0') {
      return LogLevel.OFF;
    }

    // Logging is enabled for tests directly.
    if (getMode().test && this.win.ENABLE_LOG) {
      return LogLevel.FINE;
    }

    // LocalDev by default allows INFO level, unless overriden by `#log`.
    if (getMode().localDev && !getMode().log) {
      return LogLevel.INFO;
    }

    return this.defaultLevelWithFunc_();
  }

  /**
   * @return {!LogLevel}
   * @private
   */
  defaultLevelWithFunc_() {
    // Delegate to the specific resolver.
    return this.levelFunc_(parseInt(getMode().log, 10), getMode().development);
  }

  /**
   * @param {string} tag
   * @param {string} level
   * @param {!Array} messages
   */
  msg_(tag, level, messages) {
    if (this.getLevel_() != LogLevel.OFF) {
      let fn = this.win.console.log;
      if (level == 'ERROR') {
        fn = this.win.console.error || fn;
      } else if (level == 'INFO') {
        fn = this.win.console.info || fn;
      } else if (level == 'WARN') {
        fn = this.win.console.warn || fn;
      }
      const args = this.maybeExpandMessageArgs_(messages);
      // Prefix console message with "[tag]".
      const prefix = `[${tag}]`;
      if (typeof args[0] === 'string') {
        // Prepend string to avoid breaking string substitutions e.g. %s.
        args[0] = prefix + ' ' + args[0];
      } else {
        args.unshift(prefix);
      }
      fn.apply(this.win.console, args);
    }
  }

  /**
   * Whether the logging is enabled.
   * @return {boolean}
   */
  isEnabled() {
    return this.getLevel_() != LogLevel.OFF;
  }

  /**
   * Reports a fine-grained message.
   * @param {string} tag
   * @param {...*} var_args
   */
  fine(tag, var_args) {
    if (this.getLevel_() >= LogLevel.FINE) {
      this.msg_(tag, 'FINE', Array.prototype.slice.call(arguments, 1));
    }
  }

  /**
   * Reports a informational message.
   * @param {string} tag
   * @param {...*} var_args
   */
  info(tag, var_args) {
    if (this.getLevel_() >= LogLevel.INFO) {
      this.msg_(tag, 'INFO', Array.prototype.slice.call(arguments, 1));
    }
  }

  /**
   * Reports a warning message.
   * @param {string} tag
   * @param {...*} var_args
   */
  warn(tag, var_args) {
    if (this.getLevel_() >= LogLevel.WARN) {
      this.msg_(tag, 'WARN', Array.prototype.slice.call(arguments, 1));
    }
  }

  /**
   * Reports an error message. If the logging is disabled, the error is rethrown
   * asynchronously.
   * @param {string} tag
   * @param {...*} var_args
   * @return {!Error|undefined}
   * @private
   */
  error_(tag, var_args) {
    if (this.getLevel_() >= LogLevel.ERROR) {
      this.msg_(tag, 'ERROR', Array.prototype.slice.call(arguments, 1));
    } else {
      const error = createErrorVargs.apply(
        null,
        Array.prototype.slice.call(arguments, 1)
      );
      this.prepareError_(error);
      return error;
    }
  }

  /**
   * Reports an error message.
   * @param {string} tag
   * @param {...*} var_args
   */
  error(tag, var_args) {
    const error = this.error_.apply(this, arguments);
    if (error) {
      error.name = tag || error.name;
      // __AMP_REPORT_ERROR is installed globally per window in the entry point.
      self.__AMP_REPORT_ERROR(error);
    }
  }

  /**
   * Reports an error message and marks with an expected property. If the
   * logging is disabled, the error is rethrown asynchronously.
   * @param {string} unusedTag
   * @param {...*} var_args
   */
  expectedError(unusedTag, var_args) {
    const error = this.error_.apply(this, arguments);
    if (error) {
      error.expected = true;
      // __AMP_REPORT_ERROR is installed globally per window in the entry point.
      self.__AMP_REPORT_ERROR(error);
    }
  }

  /**
   * Creates an error object.
   * @param {...*} var_args
   * @return {!Error}
   */
  createError(var_args) {
    const error = createErrorVargs.apply(null, arguments);
    this.prepareError_(error);
    return error;
  }

  /**
   * Creates an error object with its expected property set to true.
   * @param {...*} var_args
   * @return {!Error}
   */
  createExpectedError(var_args) {
    const error = createErrorVargs.apply(null, arguments);
    this.prepareError_(error);
    error.expected = true;
    return error;
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

    try {
      const assertion = this == logs.user ? pureUserAssert : pureDevAssert;
      return assertion.apply(null, arguments);
    } catch (e) {
      this.prepareError_(e);
      // __AMP_REPORT_ERROR is installed globally per window in the entry point.
      self.__AMP_REPORT_ERROR(e);
      throw e;
    }
  }

  /**
   * Throws an error if the first argument isn't an Element
   *
   * Otherwise see `assert` for usage
   *
   * @param {*} shouldBeElement
   * @param {!Array|string=} opt_message The assertion message
   * @return {!Element} The value of shouldBeTrueish.
   * @template T
   * @closurePrimitive {asserts.matchesReturn}
   */
  assertElement(shouldBeElement, opt_message) {
    const shouldBeTrueish = shouldBeElement && shouldBeElement.nodeType == 1;
    this.assertType_(
      shouldBeElement,
      shouldBeTrueish,
      'Element expected',
      opt_message
    );
    return /** @type {!Element} */ (shouldBeElement);
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
    this.assertType_(
      shouldBeString,
      typeof shouldBeString == 'string',
      'String expected',
      opt_message
    );
    return /** @type {string} */ (shouldBeString);
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
    this.assertType_(
      shouldBeNumber,
      typeof shouldBeNumber == 'number',
      'Number expected',
      opt_message
    );
    return /** @type {number} */ (shouldBeNumber);
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
    this.assertType_(
      shouldBeArray,
      isArray(shouldBeArray),
      'Array expected',
      opt_message
    );
    return /** @type {!Array} */ (shouldBeArray);
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
    this.assertType_(
      shouldBeBoolean,
      !!shouldBeBoolean === shouldBeBoolean,
      'Boolean expected',
      opt_message
    );
    return /** @type {boolean} */ (shouldBeBoolean);
  }

  /**
   * Asserts and returns the enum value. If the enum doesn't contain such a
   * value, the error is thrown.
   *
   * @param {!Object<T>} enumObj
   * @param {string} s
   * @param {string=} opt_enumName
   * @return {T}
   * @template T
   * @closurePrimitive {asserts.matchesReturn}
   */
  assertEnumValue(enumObj, s, opt_enumName) {
    if (isEnumValue(enumObj, s)) {
      return s;
    }
    this.assert(false, 'Unknown %s value: "%s"', opt_enumName || 'enum', s);
  }

  /**
   * @param {!Error} error
   * @private
   */
  prepareError_(error) {
    error = duplicateErrorIfNecessary(error);

    // `associatedElement` is used to add the i-amphtml-error class; in
    // `#development=1` mode, it also adds `i-amphtml-element-error` to the
    // element and sets the `error-message` attribute.
    if (error.messageArray) {
      const elIndex = findIndex(error.messageArray, (item) => item?.tagName);
      if (elIndex > -1) {
        error.associatedElement = error.messageArray[elIndex];
      }
    }
    if (this.suffix_) {
      if (!error.message) {
        error.message = this.suffix_;
      } else if (error.message.indexOf(this.suffix_) == -1) {
        error.message += this.suffix_;
      }
    } else if (isUserErrorMessage(error.message)) {
      error.message = error.message.replace(USER_ERROR_SENTINEL, '');
    }
  }

  /**
   * @param {!Array} args
   * @return {!Array}
   * @private
   */
  maybeExpandMessageArgs_(args) {
    if (isArray(args[0])) {
      return this.expandMessageArgs_(/** @type {!Array} */ (args[0]));
    }
    return args;
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
    if (this.messages_ && id in this.messages_) {
      return [this.messages_[id]].concat(parts);
    }
    return [`More info at ${externalMessageUrl(id, parts)}`];
  }

  /**
   * Asserts types, backbone of `assertNumber`, `assertString`, etc.
   *
   * It understands array-based "id"-contracted messages.
   *
   * Otherwise creates a sprintf syntax string containing the optional message or the
   * default. An interpolation token is added at the end to include the `subject`.
   * @param {*} subject
   * @param {*} assertion
   * @param {string} defaultMessage
   * @param {!Array|string=} opt_message
   * @private
   */
  assertType_(subject, assertion, defaultMessage, opt_message) {
    if (isArray(opt_message)) {
      this.assert(assertion, opt_message.concat(subject));
    } else {
      this.assert(assertion, `${opt_message || defaultMessage}: %s`, subject);
    }
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
  if (!logs.user) {
    logs.user = getUserLogger(USER_ERROR_SENTINEL);
  }
  if (!isFromEmbed(logs.user.win, opt_element)) {
    return logs.user;
  } else {
    if (logs.userForEmbed) {
      return logs.userForEmbed;
    }
    return (logs.userForEmbed = getUserLogger(USER_ERROR_EMBED_SENTINEL));
  }
}

/**
 * Getter for user logger
 * @param {string=} suffix
 * @return {!Log}
 */
function getUserLogger(suffix) {
  if (!logConstructor) {
    throw new Error('failed to call initLogConstructor');
  }
  return new logConstructor(
    self,
    (logNum, development) => {
      if (development || logNum >= 1) {
        return LogLevel.FINE;
      }
      return LogLevel.WARN;
    },
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
  if (logs.dev) {
    return logs.dev;
  }
  if (!logConstructor) {
    throw new Error('failed to call initLogConstructor');
  }
  return (logs.dev = new logConstructor(self, (logNum) => {
    if (logNum >= 3) {
      return LogLevel.FINE;
    }
    if (logNum >= 2) {
      return LogLevel.INFO;
    }
    return LogLevel.OFF;
  }));
}

/**
 * @param {!Window} win
 * @param {!Element=} opt_element
 * @return {boolean} isEmbed
 */
export function isFromEmbed(win, opt_element) {
  if (!opt_element) {
    return false;
  }
  return opt_element.ownerDocument.defaultView != win;
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
  if (getMode().minified) {
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
