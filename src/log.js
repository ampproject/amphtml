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

import {getMode} from './mode';
import {getModeObject} from './mode-object';
import {internalRuntimeVersion} from './internal-version';
import {isArray, isEnumValue} from './types';
import {once} from './utils/function';

const noop = () => {};

/**
 * Triple zero width space.
 *
 * This is added to user error messages, so that we can later identify
 * them, when the only thing that we have is the message. This is the
 * case in many browsers when the global exception handler is invoked.
 *
 * @const {string}
 */
export const USER_ERROR_SENTINEL = '\u200B\u200B\u200B';

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
 * @return {boolean} Whether this message was a a user error from an iframe embed.
 */
export function isUserErrorEmbed(message) {
  return message.indexOf(USER_ERROR_EMBED_SENTINEL) >= 0;
}

/**
 * @enum {number}
 * @private Visible for testing only.
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
  self.reportError = fn;
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
 * @param {string} path
 * @return {string}
 */
const externalMessagesUrl = (path = '') =>
  `https://log.amp.dev/${path}?v=${encodeURIComponent(
    internalRuntimeVersion()
  )}&`;

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
   * @param {function(!./mode.ModeDef):!LogLevel} levelFunc
   * @param {string=} opt_suffix
   */
  constructor(win, levelFunc, opt_suffix = '') {
    /**
     * In tests we use the main test window instead of the iframe where
     * the tests runs because only the former is relayed to the console.
     * @const {!Window}
     */
    this.win = getMode().test && win.AMP_TEST_IFRAME ? win.parent : win;

    /** @private @const {function(!./mode.ModeDef):!LogLevel} */
    this.levelFunc_ = levelFunc;

    /** @private @const {!LogLevel} */
    this.level_ = this.defaultLevel_();

    /** @private @const {string} */
    this.suffix_ = opt_suffix;

    /** @private {?JsonObject} */
    this.messages_ = null;

    this.fetchExternalMessagesOnce_ = once(() => {
      // TODO(alanorozco): These should come from the CDN, not amp.dev.
      win
        .fetch(externalMessagesUrl('.json'))
        .then(response => response.json(), noop)
        .then(opt_messages => {
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

    // Delegate to the specific resolver.
    return this.levelFunc_(getModeObject());
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
      const args = this.maybeExpandArguments_(messages);
      if (getMode().localDev) {
        args.unshift('[' + tag + ']');
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
      // reportError is installed globally per window in the entry point.
      self.reportError(error);
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
      // reportError is installed globally per window in the entry point.
      self.reportError(error);
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
   * @template T
   * eslint "google-camelcase/google-camelcase": 0
   */
  assert(shouldBeTrueish, opt_message, var_args) {
    let firstElement;
    if (isArray(opt_message)) {
      return this.assert(
        shouldBeTrueish,
        this.expandLogMessage_(/** @type {!Array} */ (opt_message))
      );
    }
    if (!shouldBeTrueish) {
      const message = opt_message || 'Assertion failed';
      const splitMessage = message.split('%s');
      const first = splitMessage.shift();
      let formatted = first;
      const messageArray = [];
      let i = 2;
      pushIfNonEmpty(messageArray, first);
      while (splitMessage.length > 0) {
        const nextConstant = splitMessage.shift();
        const val = arguments[i++];
        if (val && val.tagName) {
          firstElement = val;
        }
        messageArray.push(val);
        pushIfNonEmpty(messageArray, nextConstant.trim());
        formatted += toString(val) + nextConstant;
      }
      const e = new Error(formatted);
      e.fromAssert = true;
      e.associatedElement = firstElement;
      e.messageArray = messageArray;
      this.prepareError_(e);
      // reportError is installed globally per window in the entry point.
      self.reportError(e);
      throw e;
    }
    return shouldBeTrueish;
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
   * eslint "google-camelcase/google-camelcase": 2
   */
  assertElement(shouldBeElement, opt_message) {
    const shouldBeTrueish = shouldBeElement && shouldBeElement.nodeType == 1;
    this.assert(
      shouldBeTrueish,
      (opt_message || 'Element expected') + ': %s',
      shouldBeElement
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
   * eslint "google-camelcase/google-camelcase": 2
   */
  assertString(shouldBeString, opt_message) {
    this.assert(
      typeof shouldBeString == 'string',
      (opt_message || 'String expected') + ': %s',
      shouldBeString
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
   */
  assertNumber(shouldBeNumber, opt_message) {
    this.assert(
      typeof shouldBeNumber == 'number',
      (opt_message || 'Number expected') + ': %s',
      shouldBeNumber
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
   */
  assertArray(shouldBeArray, opt_message) {
    this.assert(
      Array.isArray(shouldBeArray),
      (opt_message || 'Array expected') + ': %s',
      shouldBeArray
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
   */
  assertBoolean(shouldBeBoolean, opt_message) {
    this.assert(
      !!shouldBeBoolean === shouldBeBoolean,
      (opt_message || 'Boolean expected') + ': %s',
      shouldBeBoolean
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
   * eslint "google-camelcase/google-camelcase": 2
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
  maybeExpandArguments_(args) {
    if (isArray(args[0])) {
      return [this.expandLogMessage_(/** @type {!Array} */ (args[0]))];
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
   * @return {string}
   * @private
   */
  expandLogMessage_(parts) {
    // First value should exist.
    const id = parts[0];
    // Best effort fetch of message template table.
    // Since this is async, the first few logs might be indirected to a URL even
    // if in development mode. Message table is ~small so this should be a short
    // gap.
    if (getMode(this.win).development && !this.messages_) {
      this.fetchExternalMessagesOnce_();
    }
    const args = parts.slice(1);
    if (this.messages_ && id in this.messages_) {
      const template = this.messages_[id];
      const {message} = createErrorVargs.apply(null, [template].concat(args));
      return message;
    }
    const url = args.reduce(
      (prefix, arg) => `${prefix}&s[]=${encodeURIComponent(toString(arg))}`,
      `${externalMessagesUrl()}id=${encodeURIComponent(id)}`
    );
    return `More info at ${url}`;
  }
}

/**
 * @param {string|!Element} val
 * @return {string}
 */
function toString(val) {
  // Do check equivalent to `val instanceof Element` without cross-window bug
  if (val && val.nodeType == 1) {
    return val.tagName.toLowerCase() + (val.id ? '#' + val.id : '');
  }
  return /** @type {string} */ (val);
}

/**
 * @param {!Array} array
 * @param {*} val
 */
function pushIfNonEmpty(array, val) {
  if (val != '') {
    array.push(val);
  }
}

/**
 * Some exceptions (DOMException, namely) have read-only message.
 * @param {!Error} error
 * @return {!Error};
 */
export function duplicateErrorIfNecessary(error) {
  const messageProperty = Object.getOwnPropertyDescriptor(error, 'message');
  if (messageProperty && messageProperty.writable) {
    return error;
  }

  const {message, stack} = error;
  const e = new Error(message);
  // Copy all the extraneous things we attach.
  for (const prop in error) {
    e[prop] = error[prop];
  }
  // Ensure these are copied.
  e.stack = stack;
  return e;
}

/**
 * @param {...*} var_args
 * @return {!Error}
 * @visibleForTesting
 */
export function createErrorVargs(var_args) {
  let error = null;
  let message = '';
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i];
    if (arg instanceof Error && !error) {
      error = duplicateErrorIfNecessary(arg);
    } else {
      if (message) {
        message += ' ';
      }
      message += arg;
    }
  }

  if (!error) {
    error = new Error(message);
  } else if (message) {
    error.message = message + ': ' + error.message;
  }
  return error;
}

/**
 * Rethrows the error without terminating the current context. This preserves
 * whether the original error designation is a user error or a dev error.
 * @param {...*} var_args
 */
export function rethrowAsync(var_args) {
  const error = createErrorVargs.apply(null, arguments);
  setTimeout(() => {
    // reportError is installed globally per window in the entry point.
    self.reportError(error);
    throw error;
  });
}

/**
 * Cache for logs. We do not use a Service since the service module depends
 * on Log and closure literally can't even.
 * @type {{user: ?Log, dev: ?Log, userForEmbed: ?Log}}
 */
self.log = self.log || {
  user: null,
  dev: null,
  userForEmbed: null,
};

const logs = self.log;

/**
 * Eventually holds a constructor for Log objects. Lazily initialized, so we
 * can avoid ever referencing the real constructor except in JS binaries
 * that actually want to include the implementation.
 * @type {?Function}
 */
let logConstructor = null;

/**
 * Initializes log contructor.
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
 * Resets log contructor for testing.
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
    mode => {
      const logNum = parseInt(mode.log, 10);
      if (mode.development || logNum >= 1) {
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
  return (logs.dev = new logConstructor(self, mode => {
    const logNum = parseInt(mode.log, 10);
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
 * @template T
 * eslint "google-camelcase/google-camelcase": 0
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
 * @template T
 * eslint "google-camelcase/google-camelcase": 0
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
