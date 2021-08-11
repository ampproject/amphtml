function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import * as assertions from "./core/assert/base";
import { createErrorVargs, duplicateErrorIfNecessary } from "./core/error";
import {
USER_ERROR_EMBED_SENTINEL,
USER_ERROR_SENTINEL,
elementStringOrPassThru,
isUserErrorMessage,
stripUserError } from "./core/error/message-helpers";

import * as mode from "./core/mode";
import { isArray, isString } from "./core/types";
import { once } from "./core/types/function";

import { urls } from "./config";
import { getMode } from "./mode";

var noop = function noop() {};

// These are exported here despite being defined elswhere to avoid updating
// imports across many files for now.
export { USER_ERROR_SENTINEL, isUserErrorMessage };

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
export var LogLevel = {
  OFF: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  FINE: 4 };


/**
 * @type {!LogLevel|undefined}
 * @private
 */
var levelOverride_ = undefined;

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
var messageUrlRtv = function messageUrlRtv() {return "01".concat(mode.version());};

/**
 * Gets a URL to display a message on amp.dev.
 * @param {string} id
 * @param {!Array} interpolatedParts
 * @return {string}
 */
var externalMessageUrl = function externalMessageUrl(id, interpolatedParts) {return (
    interpolatedParts.reduce(
    function (prefix, arg) {return "".concat(prefix, "&s[]=").concat(messageArgToEncodedComponent(arg));}, "https://log.amp.dev/?v=".concat(
    messageUrlRtv(), "&id=").concat(encodeURIComponent(id))));};


/**
 * URL to simple log messages table JSON file, which contains an Object<string, string>
 * which maps message id to full message template.
 * @return {string}
 */
var externalMessagesSimpleTableUrl = function externalMessagesSimpleTableUrl() {return "".concat(
  urls.cdn, "/rtv/").concat(messageUrlRtv(), "/log-messages.simple.json");};

/**
 * @param {*} arg
 * @return {string}
 */
var messageArgToEncodedComponent = function messageArgToEncodedComponent(arg) {return (
    encodeURIComponent(String(elementStringOrPassThru(arg))));};

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
export var Log = /*#__PURE__*/function () {
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
  function Log(win, levelFunc) {var _this = this;var opt_suffix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';_classCallCheck(this, Log);
    /**
     * In tests we use the main test window instead of the iframe where
     * the tests runs because only the former is relayed to the console.
     * @const {!Window}
     */
    this.win = false && win.__AMP_TEST_IFRAME ? win.parent : win;

    /** @private @const {function(number, boolean):!LogLevel} */
    this.levelFunc_ = levelFunc;

    /** @private @const {!LogLevel} */
    this.level_ = this.defaultLevel_();

    /** @private @const {string} */
    this.suffix_ = opt_suffix;

    /** @private {?JsonObject} */
    this.messages_ = null;

    this.fetchExternalMessagesOnce_ = once(function () {
      win.
      fetch(externalMessagesSimpleTableUrl()).
      then(function (response) {return response.json();}, noop).
      then(function (opt_messages) {
        if (opt_messages) {
          _this.messages_ = /** @type {!JsonObject} */(opt_messages);
        }
      });
    });

    // This bound assertion function is capable of handling the format used when
    // error/assertion messages are extracted. This logic hasn't yet been
    // migrated to an AMP-independent form for use in core. This binding allows
    // Log assertion helpers to maintain message-extraction capabilities until
    // that logic can be moved to core.
    this.boundAssertFn_ = /** @type {!assertions.AssertionFunctionDef} */(
    this.assert.bind(this));

  }

  /**
   * @return {!LogLevel}
   * @private
   */_createClass(Log, [{ key: "defaultLevel_", value:
    function defaultLevel_() {var _this$win$console;
      // No console - can't enable logging.
      if (
      !(((_this$win$console = this.win.console) !== null && _this$win$console !== void 0) && _this$win$console.log) ||
      // Logging has been explicitly disabled.
      getMode().log == 0)
      {
        return LogLevel.OFF;
      }

      // Logging is enabled for tests directly.
      if (false && this.win.ENABLE_LOG) {
        return LogLevel.FINE;
      }

      // LocalDev by default allows INFO level, unless overriden by `#log`.
      if (false) {
        return LogLevel.INFO;
      }

      return this.defaultLevelWithFunc_();
    }

    /**
     * @return {!LogLevel}
     * @private
     */ }, { key: "defaultLevelWithFunc_", value:
    function defaultLevelWithFunc_() {
      // Delegate to the specific resolver.
      return this.levelFunc_(getMode().log, false);
    }

    /**
     * @param {string} tag
     * @param {!LogLevel} level
     * @param {!Array} messages
     * @return {boolean} true if a the message was logged
     */ }, { key: "msg_", value:
    function msg_(tag, level, messages) {var _levelOverride_, _LogLevel$ERROR$LogLe, _LogLevel$ERROR$LogLe2;
      if (level > ((_levelOverride_ = levelOverride_) !== null && _levelOverride_ !== void 0 ? _levelOverride_ : this.level_)) {
        return false;
      }

      var cs = this.win.console;
      var fn = (_LogLevel$ERROR$LogLe =
      (_LogLevel$ERROR$LogLe2 = {}, _defineProperty(_LogLevel$ERROR$LogLe2,
      LogLevel.ERROR, cs.error), _defineProperty(_LogLevel$ERROR$LogLe2,
      LogLevel.INFO, cs.info), _defineProperty(_LogLevel$ERROR$LogLe2,
      LogLevel.WARN, cs.warn), _LogLevel$ERROR$LogLe2)[
      level]) !== null && _LogLevel$ERROR$LogLe !== void 0 ? _LogLevel$ERROR$LogLe : cs.log;

      var args = this.maybeExpandMessageArgs_(messages);
      // Prefix console message with "[tag]".
      var prefix = "[".concat(tag, "]");
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
     */ }, { key: "fine", value:
    function fine(tag) {for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {args[_key - 1] = arguments[_key];}
      this.msg_(tag, LogLevel.FINE, args);
    }

    /**
     * Reports a informational message.
     * @param {string} tag
     * @param {...*} args
     */ }, { key: "info", value:
    function info(tag) {for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {args[_key2 - 1] = arguments[_key2];}
      this.msg_(tag, LogLevel.INFO, args);
    }

    /**
     * Reports a warning message.
     * @param {string} tag
     * @param {...*} args
     */ }, { key: "warn", value:
    function warn(tag) {for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {args[_key3 - 1] = arguments[_key3];}
      this.msg_(tag, LogLevel.WARN, args);
    }

    /**
     * Reports an error message. If the logging is disabled, the error is rethrown
     * asynchronously.
     * @param {string} tag
     * @param {...*} args
     * @return {!Error|undefined}
     * @private
     */ }, { key: "error_", value:
    function error_(tag) {for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {args[_key4 - 1] = arguments[_key4];}
      if (!this.msg_(tag, LogLevel.ERROR, args)) {
        return this.createError.apply(this, args);
      }
    }

    /**
     * Reports an error message.
     * @param {string} tag
     * @param {...*} var_args
     */ }, { key: "error", value:
    function error(tag, var_args) {
      var error = this.error_.apply(this, arguments);
      if (error) {
        // TODO(rcebulko): Determine if/how this Error#name property is used.
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
     */ }, { key: "expectedError", value:
    function expectedError(unusedTag, var_args) {
      var error = this.error_.apply(this, arguments);
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
     */ }, { key: "createError", value:
    function createError(var_args) {
      var error = createErrorVargs.apply(null, arguments);
      this.prepareError_(error);
      return error;
    }

    /**
     * Creates an error object with its expected property set to true.
     * @param {...*} var_args
     * @return {!Error}
     */ }, { key: "createExpectedError", value:
    function createExpectedError(var_args) {
      var error = createErrorVargs.apply(null, arguments);
      this.prepareError_(error);
      error.expected = true;
      return error;
    }

    /**
     * @param {!Error} error
     * @private
     */ }, { key: "prepareError_", value:
    function prepareError_(error) {
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
    }

    /**
     * @param {!Array} args
     * @return {!Array}
     * @private
     */ }, { key: "maybeExpandMessageArgs_", value:
    function maybeExpandMessageArgs_(args) {
      return isArray(args[0]) ?
      this.expandMessageArgs_( /** @type {!Array} */(args[0])) :
      args;
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
     */ }, { key: "expandMessageArgs_", value:
    function expandMessageArgs_(parts) {var _this$messages_;
      // First value should exist.
      var id = parts.shift();
      // Best effort fetch of message template table.
      // Since this is async, the first few logs might be indirected to a URL even
      // if in development mode. Message table is ~small so this should be a short
      // gap.
      if (false) {
        this.fetchExternalMessagesOnce_();
      }

      return ((_this$messages_ = this.messages_) !== null && _this$messages_ !== void 0) && _this$messages_[id] ?
      [this.messages_[id]].concat(parts) :
      ["More info at ".concat(externalMessageUrl(id, parts))];
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
     */ }, { key: "assert", value:
    function assert(shouldBeTrueish, opt_message, var_args) {
      if (isArray(opt_message)) {
        return this.assert.apply(
        this,
        [shouldBeTrueish].concat(
        this.expandMessageArgs_( /** @type {!Array} */(opt_message))));


      }

      return assertions.assert.apply(
      null,
      [this.suffix_].concat(Array.prototype.slice.call(arguments)));

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
     */ }, { key: "assertElement", value:
    function assertElement(shouldBeElement, opt_message) {
      return assertions.assertElement(
      this.boundAssertFn_,
      shouldBeElement,
      opt_message);

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
     */ }, { key: "assertString", value:
    function assertString(shouldBeString, opt_message) {
      return assertions.assertString(
      this.boundAssertFn_,
      shouldBeString,
      opt_message);

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
     */ }, { key: "assertNumber", value:
    function assertNumber(shouldBeNumber, opt_message) {
      return assertions.assertNumber(
      this.boundAssertFn_,
      shouldBeNumber,
      opt_message);

    }

    /**
     * Throws an error if the first argument is not an array.
     * The array can be empty.
     *
     * @param {*} shouldBeArray
     * @param {!Array|string=} opt_message The assertion message
     * @return {!Array} The array value
     * @closurePrimitive {asserts.matchesReturn}
     */ }, { key: "assertArray", value:
    function assertArray(shouldBeArray, opt_message) {
      return assertions.assertArray(
      this.boundAssertFn_,
      shouldBeArray,
      opt_message);

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
     */ }, { key: "assertBoolean", value:
    function assertBoolean(shouldBeBoolean, opt_message) {
      return assertions.assertBoolean(
      this.boundAssertFn_,
      shouldBeBoolean,
      opt_message);

    } }]);return Log;}();


/**
 * Cache for logs. We do not use a Service since the service module depends
 * on Log and closure literally can't even.
 * @type {{user: ?Log, dev: ?Log, userForEmbed: ?Log}}
 */
self.__AMP_LOG = self.__AMP_LOG || {
  user: null,
  dev: null,
  userForEmbed: null };


var logs = self.__AMP_LOG;

/**
 * Eventually holds a constructor for Log objects. Lazily initialized, so we
 * can avoid ever referencing the real constructor except in JS binaries
 * that actually want to include the implementation.
 * @type {?typeof Log}
 */
var logConstructor = null;

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
 * @param {function(number, boolean):!LogLevel} levelFunc
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
    logs.userForEmbed || (
    logs.userForEmbed = getUserLogger(USER_ERROR_EMBED_SENTINEL)));

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
  function (logNum, development) {return (
      development || logNum >= 1 ? LogLevel.FINE : LogLevel.WARN);},
  suffix);

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
  logs.dev || (
  logs.dev = callLogConstructor(function (logNum) {return (
      logNum >= 3 ? LogLevel.FINE : logNum >= 2 ? LogLevel.INFO : LogLevel.OFF);})));


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
opt_9)
{
  if (mode.isMinified()) {
    return shouldBeTrueish;
  }
  if (self.__AMP_ASSERTION_CHECK) {
    // This will never execute regardless, but will be included on unminified
    // builds. It will be DCE'd away from minified builds, and so can be used to
    // validate that Babel is properly removing dev assertions in minified
    // builds.
    console /*OK*/.
    log('__devAssert_sentinel__');
  }

  return dev(). /*Orig call*/assert(
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
  opt_9);

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
opt_9)
{
  return user(). /*Orig call*/assert(
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
  opt_9);

}
// /Users/mszylkowski/src/amphtml/src/log.js