function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import * as assertions from "./core/assert/base";
import { createErrorVargs, duplicateErrorIfNecessary } from "./core/error";
import { USER_ERROR_EMBED_SENTINEL, USER_ERROR_SENTINEL, elementStringOrPassThru, isUserErrorMessage, stripUserError } from "./core/error/message-helpers";
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
  FINE: 4
};

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
var messageUrlRtv = function messageUrlRtv() {
  return "01" + mode.version();
};

/**
 * Gets a URL to display a message on amp.dev.
 * @param {string} id
 * @param {!Array} interpolatedParts
 * @return {string}
 */
var externalMessageUrl = function externalMessageUrl(id, interpolatedParts) {
  return interpolatedParts.reduce(function (prefix, arg) {
    return prefix + "&s[]=" + messageArgToEncodedComponent(arg);
  }, "https://log.amp.dev/?v=" + messageUrlRtv() + "&id=" + encodeURIComponent(id));
};

/**
 * URL to simple log messages table JSON file, which contains an Object<string, string>
 * which maps message id to full message template.
 * @return {string}
 */
var externalMessagesSimpleTableUrl = function externalMessagesSimpleTableUrl() {
  return urls.cdn + "/rtv/" + messageUrlRtv() + "/log-messages.simple.json";
};

/**
 * @param {*} arg
 * @return {string}
 */
var messageArgToEncodedComponent = function messageArgToEncodedComponent(arg) {
  return encodeURIComponent(String(elementStringOrPassThru(arg)));
};

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
  function Log(win, levelFunc, opt_suffix) {
    var _this = this;

    if (opt_suffix === void 0) {
      opt_suffix = '';
    }

    _classCallCheck(this, Log);

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
    this.fetchExternalMessagesOnce_ = once(function () {
      win.fetch(externalMessagesSimpleTableUrl()).then(function (response) {
        return response.json();
      }, noop).then(function (opt_messages) {
        if (opt_messages) {
          _this.messages_ =
          /** @type {!JsonObject} */
          opt_messages;
        }
      });
    });
    // This bound assertion function is capable of handling the format used when
    // error/assertion messages are extracted. This logic hasn't yet been
    // migrated to an AMP-independent form for use in core. This binding allows
    // Log assertion helpers to maintain message-extraction capabilities until
    // that logic can be moved to core.
    this.boundAssertFn_ =
    /** @type {!assertions.AssertionFunctionDef} */
    this.assert.bind(this);
  }

  /**
   * @return {!LogLevel}
   * @private
   */
  _createClass(Log, [{
    key: "defaultLevel_",
    value: function defaultLevel_() {
      var _this$win$console;

      // No console - can't enable logging.
      if (!((_this$win$console = this.win.console) != null && _this$win$console.log) || // Logging has been explicitly disabled.
      getMode().log == 0) {
        return LogLevel.OFF;
      }

      // Logging is enabled for tests directly.
      if (getMode().test && this.win.ENABLE_LOG) {
        return LogLevel.FINE;
      }

      // LocalDev by default allows INFO level, unless overriden by `#log`.
      if (getMode().localDev) {
        return LogLevel.INFO;
      }

      return this.defaultLevelWithFunc_();
    }
    /**
     * @return {!LogLevel}
     * @private
     */

  }, {
    key: "defaultLevelWithFunc_",
    value: function defaultLevelWithFunc_() {
      // Delegate to the specific resolver.
      return this.levelFunc_(getMode().log, getMode().development);
    }
    /**
     * @param {string} tag
     * @param {!LogLevel} level
     * @param {!Array} messages
     * @return {boolean} true if a the message was logged
     */

  }, {
    key: "msg_",
    value: function msg_(tag, level, messages) {
      var _levelOverride_, _LogLevel$ERROR$LogLe, _LogLevel$ERROR$LogLe2;

      if (level > ((_levelOverride_ = levelOverride_) != null ? _levelOverride_ : this.level_)) {
        return false;
      }

      var cs = this.win.console;
      var fn = (_LogLevel$ERROR$LogLe = (_LogLevel$ERROR$LogLe2 = {}, _LogLevel$ERROR$LogLe2[LogLevel.ERROR] = cs.error, _LogLevel$ERROR$LogLe2[LogLevel.INFO] = cs.info, _LogLevel$ERROR$LogLe2[LogLevel.WARN] = cs.warn, _LogLevel$ERROR$LogLe2)[level]) != null ? _LogLevel$ERROR$LogLe : cs.log;
      var args = this.maybeExpandMessageArgs_(messages);
      // Prefix console message with "[tag]".
      var prefix = "[" + tag + "]";

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

  }, {
    key: "fine",
    value: function fine(tag) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      this.msg_(tag, LogLevel.FINE, args);
    }
    /**
     * Reports a informational message.
     * @param {string} tag
     * @param {...*} args
     */

  }, {
    key: "info",
    value: function info(tag) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      this.msg_(tag, LogLevel.INFO, args);
    }
    /**
     * Reports a warning message.
     * @param {string} tag
     * @param {...*} args
     */

  }, {
    key: "warn",
    value: function warn(tag) {
      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      this.msg_(tag, LogLevel.WARN, args);
    }
    /**
     * Reports an error message. If the logging is disabled, the error is rethrown
     * asynchronously.
     * @param {string} tag
     * @param {...*} args
     * @return {!Error|undefined}
     * @private
     */

  }, {
    key: "error_",
    value: function error_(tag) {
      for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        args[_key4 - 1] = arguments[_key4];
      }

      if (!this.msg_(tag, LogLevel.ERROR, args)) {
        return this.createError.apply(this, args);
      }
    }
    /**
     * Reports an error message.
     * @param {string} tag
     * @param {...*} var_args
     */

  }, {
    key: "error",
    value: function error(tag, var_args) {
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
     */

  }, {
    key: "expectedError",
    value: function expectedError(unusedTag, var_args) {
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
     */

  }, {
    key: "createError",
    value: function createError(var_args) {
      var error = createErrorVargs.apply(null, arguments);
      this.prepareError_(error);
      return error;
    }
    /**
     * Creates an error object with its expected property set to true.
     * @param {...*} var_args
     * @return {!Error}
     */

  }, {
    key: "createExpectedError",
    value: function createExpectedError(var_args) {
      var error = createErrorVargs.apply(null, arguments);
      this.prepareError_(error);
      error.expected = true;
      return error;
    }
    /**
     * @param {!Error} error
     * @private
     */

  }, {
    key: "prepareError_",
    value: function prepareError_(error) {
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
     */

  }, {
    key: "maybeExpandMessageArgs_",
    value: function maybeExpandMessageArgs_(args) {
      return isArray(args[0]) ? this.expandMessageArgs_(
      /** @type {!Array} */
      args[0]) : args;
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

  }, {
    key: "expandMessageArgs_",
    value: function expandMessageArgs_(parts) {
      var _this$messages_;

      // First value should exist.
      var id = parts.shift();

      // Best effort fetch of message template table.
      // Since this is async, the first few logs might be indirected to a URL even
      // if in development mode. Message table is ~small so this should be a short
      // gap.
      if (getMode(this.win).development) {
        this.fetchExternalMessagesOnce_();
      }

      return (_this$messages_ = this.messages_) != null && _this$messages_[id] ? [this.messages_[id]].concat(parts) : ["More info at " + externalMessageUrl(id, parts)];
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

  }, {
    key: "assert",
    value: function assert(shouldBeTrueish, opt_message, var_args) {
      if (isArray(opt_message)) {
        return this.assert.apply(this, [shouldBeTrueish].concat(this.expandMessageArgs_(
        /** @type {!Array} */
        opt_message)));
      }

      return assertions.assert.apply(null, [this.suffix_].concat(Array.prototype.slice.call(arguments)));
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

  }, {
    key: "assertElement",
    value: function assertElement(shouldBeElement, opt_message) {
      return assertions.assertElement(this.boundAssertFn_, shouldBeElement, opt_message);
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

  }, {
    key: "assertString",
    value: function assertString(shouldBeString, opt_message) {
      return assertions.assertString(this.boundAssertFn_, shouldBeString, opt_message);
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

  }, {
    key: "assertNumber",
    value: function assertNumber(shouldBeNumber, opt_message) {
      return assertions.assertNumber(this.boundAssertFn_, shouldBeNumber, opt_message);
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

  }, {
    key: "assertArray",
    value: function assertArray(shouldBeArray, opt_message) {
      return assertions.assertArray(this.boundAssertFn_, shouldBeArray, opt_message);
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

  }, {
    key: "assertBoolean",
    value: function assertBoolean(shouldBeBoolean, opt_message) {
      return assertions.assertBoolean(this.boundAssertFn_, shouldBeBoolean, opt_message);
    }
  }]);

  return Log;
}();

/**
 * Cache for logs. We do not use a Service since the service module depends
 * on Log and closure literally can't even.
 * @type {{user: ?Log, dev: ?Log, userForEmbed: ?Log}}
 */
self.__AMP_LOG = self.__AMP_LOG || {
  user: null,
  dev: null,
  userForEmbed: null
};
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
    return logs.userForEmbed || (logs.userForEmbed = getUserLogger(USER_ERROR_EMBED_SENTINEL));
  }

  return logs.user;
}

/**
 * Getter for user logger
 * @param {string=} suffix
 * @return {!Log}
 */
function getUserLogger(suffix) {
  return callLogConstructor(function (logNum, development) {
    return development || logNum >= 1 ? LogLevel.FINE : LogLevel.WARN;
  }, suffix);
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
  return logs.dev || (logs.dev = callLogConstructor(function (logNum) {
    return logNum >= 3 ? LogLevel.FINE : logNum >= 2 ? LogLevel.INFO : LogLevel.OFF;
  }));
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
export function devAssert(shouldBeTrueish, opt_message, opt_1, opt_2, opt_3, opt_4, opt_5, opt_6, opt_7, opt_8, opt_9) {
  if (mode.isMinified()) {
    return shouldBeTrueish;
  }

  if (self.__AMP_ASSERTION_CHECK) {
    // This will never execute regardless, but will be included on unminified
    // builds. It will be DCE'd away from minified builds, and so can be used to
    // validate that Babel is properly removing dev assertions in minified
    // builds.
    console
    /*OK*/
    .log('__devAssert_sentinel__');
  }

  return dev().
  /*Orig call*/
  assert(shouldBeTrueish, opt_message, opt_1, opt_2, opt_3, opt_4, opt_5, opt_6, opt_7, opt_8, opt_9);
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
export function userAssert(shouldBeTrueish, opt_message, opt_1, opt_2, opt_3, opt_4, opt_5, opt_6, opt_7, opt_8, opt_9) {
  return user().
  /*Orig call*/
  assert(shouldBeTrueish, opt_message, opt_1, opt_2, opt_3, opt_4, opt_5, opt_6, opt_7, opt_8, opt_9);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvZy5qcyJdLCJuYW1lcyI6WyJhc3NlcnRpb25zIiwiY3JlYXRlRXJyb3JWYXJncyIsImR1cGxpY2F0ZUVycm9ySWZOZWNlc3NhcnkiLCJVU0VSX0VSUk9SX0VNQkVEX1NFTlRJTkVMIiwiVVNFUl9FUlJPUl9TRU5USU5FTCIsImVsZW1lbnRTdHJpbmdPclBhc3NUaHJ1IiwiaXNVc2VyRXJyb3JNZXNzYWdlIiwic3RyaXBVc2VyRXJyb3IiLCJtb2RlIiwiaXNBcnJheSIsImlzU3RyaW5nIiwib25jZSIsInVybHMiLCJnZXRNb2RlIiwibm9vcCIsInNldFJlcG9ydEVycm9yIiwiZm4iLCJzZWxmIiwiX19BTVBfUkVQT1JUX0VSUk9SIiwiTG9nTGV2ZWwiLCJPRkYiLCJFUlJPUiIsIldBUk4iLCJJTkZPIiwiRklORSIsImxldmVsT3ZlcnJpZGVfIiwidW5kZWZpbmVkIiwib3ZlcnJpZGVMb2dMZXZlbCIsImxldmVsIiwibWVzc2FnZVVybFJ0diIsInZlcnNpb24iLCJleHRlcm5hbE1lc3NhZ2VVcmwiLCJpZCIsImludGVycG9sYXRlZFBhcnRzIiwicmVkdWNlIiwicHJlZml4IiwiYXJnIiwibWVzc2FnZUFyZ1RvRW5jb2RlZENvbXBvbmVudCIsImVuY29kZVVSSUNvbXBvbmVudCIsImV4dGVybmFsTWVzc2FnZXNTaW1wbGVUYWJsZVVybCIsImNkbiIsIlN0cmluZyIsIkxvZyIsIndpbiIsImxldmVsRnVuYyIsIm9wdF9zdWZmaXgiLCJ0ZXN0IiwiX19BTVBfVEVTVF9JRlJBTUUiLCJwYXJlbnQiLCJsZXZlbEZ1bmNfIiwibGV2ZWxfIiwiZGVmYXVsdExldmVsXyIsInN1ZmZpeF8iLCJtZXNzYWdlc18iLCJmZXRjaEV4dGVybmFsTWVzc2FnZXNPbmNlXyIsImZldGNoIiwidGhlbiIsInJlc3BvbnNlIiwianNvbiIsIm9wdF9tZXNzYWdlcyIsImJvdW5kQXNzZXJ0Rm5fIiwiYXNzZXJ0IiwiYmluZCIsImNvbnNvbGUiLCJsb2ciLCJFTkFCTEVfTE9HIiwibG9jYWxEZXYiLCJkZWZhdWx0TGV2ZWxXaXRoRnVuY18iLCJkZXZlbG9wbWVudCIsInRhZyIsIm1lc3NhZ2VzIiwiY3MiLCJlcnJvciIsImluZm8iLCJ3YXJuIiwiYXJncyIsIm1heWJlRXhwYW5kTWVzc2FnZUFyZ3NfIiwidW5zaGlmdCIsImFwcGx5IiwibXNnXyIsImNyZWF0ZUVycm9yIiwidmFyX2FyZ3MiLCJlcnJvcl8iLCJhcmd1bWVudHMiLCJuYW1lIiwidW51c2VkVGFnIiwiZXhwZWN0ZWQiLCJwcmVwYXJlRXJyb3JfIiwibWVzc2FnZSIsImluZGV4T2YiLCJleHBhbmRNZXNzYWdlQXJnc18iLCJwYXJ0cyIsInNoaWZ0IiwiY29uY2F0Iiwic2hvdWxkQmVUcnVlaXNoIiwib3B0X21lc3NhZ2UiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiY2FsbCIsInNob3VsZEJlRWxlbWVudCIsImFzc2VydEVsZW1lbnQiLCJzaG91bGRCZVN0cmluZyIsImFzc2VydFN0cmluZyIsInNob3VsZEJlTnVtYmVyIiwiYXNzZXJ0TnVtYmVyIiwic2hvdWxkQmVBcnJheSIsImFzc2VydEFycmF5Iiwic2hvdWxkQmVCb29sZWFuIiwiYXNzZXJ0Qm9vbGVhbiIsIl9fQU1QX0xPRyIsInVzZXIiLCJkZXYiLCJ1c2VyRm9yRW1iZWQiLCJsb2dzIiwibG9nQ29uc3RydWN0b3IiLCJpbml0TG9nQ29uc3RydWN0b3IiLCJyZXNldExvZ0NvbnN0cnVjdG9yRm9yVGVzdGluZyIsImNhbGxMb2dDb25zdHJ1Y3RvciIsIkVycm9yIiwib3B0X2VsZW1lbnQiLCJnZXRVc2VyTG9nZ2VyIiwiaXNGcm9tRW1iZWQiLCJzdWZmaXgiLCJsb2dOdW0iLCJvd25lckRvY3VtZW50IiwiZGVmYXVsdFZpZXciLCJkZXZBc3NlcnQiLCJvcHRfMSIsIm9wdF8yIiwib3B0XzMiLCJvcHRfNCIsIm9wdF81Iiwib3B0XzYiLCJvcHRfNyIsIm9wdF84Iiwib3B0XzkiLCJpc01pbmlmaWVkIiwiX19BTVBfQVNTRVJUSU9OX0NIRUNLIiwidXNlckFz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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTRyxVQUFULENBQ0w3QyxlQURLLEVBRUxDLFdBRkssRUFHTGlDLEtBSEssRUFJTEMsS0FKSyxFQUtMQyxLQUxLLEVBTUxDLEtBTkssRUFPTEMsS0FQSyxFQVFMQyxLQVJLLEVBU0xDLEtBVEssRUFVTEMsS0FWSyxFQVdMQyxLQVhLLEVBWUw7QUFDQSxTQUFPekIsSUFBSTtBQUFHO0FBQWNsRCxFQUFBQSxNQUFyQixDQUNMaUMsZUFESyxFQUVMQyxXQUZLLEVBR0xpQyxLQUhLLEVBSUxDLEtBSkssRUFLTEMsS0FMSyxFQU1MQyxLQU5LLEVBT0xDLEtBUEssRUFRTEMsS0FSSyxFQVNMQyxLQVRLLEVBVUxDLEtBVkssRUFXTEMsS0FYSyxDQUFQO0FBYUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE1IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0ICogYXMgYXNzZXJ0aW9ucyBmcm9tICcjY29yZS9hc3NlcnQvYmFzZSc7XG5pbXBvcnQge2NyZWF0ZUVycm9yVmFyZ3MsIGR1cGxpY2F0ZUVycm9ySWZOZWNlc3Nhcnl9IGZyb20gJyNjb3JlL2Vycm9yJztcbmltcG9ydCB7XG4gIFVTRVJfRVJST1JfRU1CRURfU0VOVElORUwsXG4gIFVTRVJfRVJST1JfU0VOVElORUwsXG4gIGVsZW1lbnRTdHJpbmdPclBhc3NUaHJ1LFxuICBpc1VzZXJFcnJvck1lc3NhZ2UsXG4gIHN0cmlwVXNlckVycm9yLFxufSBmcm9tICcjY29yZS9lcnJvci9tZXNzYWdlLWhlbHBlcnMnO1xuaW1wb3J0ICogYXMgbW9kZSBmcm9tICcjY29yZS9tb2RlJztcbmltcG9ydCB7aXNBcnJheSwgaXNTdHJpbmd9IGZyb20gJyNjb3JlL3R5cGVzJztcbmltcG9ydCB7b25jZX0gZnJvbSAnI2NvcmUvdHlwZXMvZnVuY3Rpb24nO1xuXG5pbXBvcnQge3VybHN9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi9tb2RlJztcblxuY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuXG4vLyBUaGVzZSBhcmUgZXhwb3J0ZWQgaGVyZSBkZXNwaXRlIGJlaW5nIGRlZmluZWQgZWxzd2hlcmUgdG8gYXZvaWQgdXBkYXRpbmdcbi8vIGltcG9ydHMgYWNyb3NzIG1hbnkgZmlsZXMgZm9yIG5vdy5cbmV4cG9ydCB7VVNFUl9FUlJPUl9TRU5USU5FTCwgaXNVc2VyRXJyb3JNZXNzYWdlfTtcblxuLyoqXG4gKiBTZXRzIHJlcG9ydEVycm9yIGZ1bmN0aW9uLiBDYWxsZWQgZnJvbSBlcnJvci1yZXBvcnRpbmcuanMgdG8gYnJlYWsgY3ljbGljXG4gKiBkZXBlbmRlbmN5LlxuICogQHBhcmFtIHtmdW5jdGlvbih0aGlzOldpbmRvdywgRXJyb3IsICg/RWxlbWVudCk9KTogP3x1bmRlZmluZWR9IGZuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRSZXBvcnRFcnJvcihmbikge1xuICBzZWxmLl9fQU1QX1JFUE9SVF9FUlJPUiA9IGZuO1xufVxuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBMb2dMZXZlbCA9IHtcbiAgT0ZGOiAwLFxuICBFUlJPUjogMSxcbiAgV0FSTjogMixcbiAgSU5GTzogMyxcbiAgRklORTogNCxcbn07XG5cbi8qKlxuICogQHR5cGUgeyFMb2dMZXZlbHx1bmRlZmluZWR9XG4gKiBAcHJpdmF0ZVxuICovXG5sZXQgbGV2ZWxPdmVycmlkZV8gPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogQHBhcmFtIHshTG9nTGV2ZWx9IGxldmVsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvdmVycmlkZUxvZ0xldmVsKGxldmVsKSB7XG4gIGxldmVsT3ZlcnJpZGVfID0gbGV2ZWw7XG59XG5cbi8qKlxuICogUHJlZml4ZXMgYGludGVybmFsUnVudGltZVZlcnNpb25gIHdpdGggdGhlIGAwMWAgY2hhbm5lbCBzaWduaWZpZXIgKGZvciBwcm9kLikgZm9yXG4gKiBleHRyYWN0ZWQgbWVzc2FnZSBVUkxzLlxuICogKFNwZWNpZmljIGNoYW5uZWwgaXMgaXJyZWxldmFudDogbWVzc2FnZSB0YWJsZXMgYXJlIGludmFyaWFudCBvbiBpbnRlcm5hbCB2ZXJzaW9uLilcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuY29uc3QgbWVzc2FnZVVybFJ0diA9ICgpID0+IGAwMSR7bW9kZS52ZXJzaW9uKCl9YDtcblxuLyoqXG4gKiBHZXRzIGEgVVJMIHRvIGRpc3BsYXkgYSBtZXNzYWdlIG9uIGFtcC5kZXYuXG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqIEBwYXJhbSB7IUFycmF5fSBpbnRlcnBvbGF0ZWRQYXJ0c1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5jb25zdCBleHRlcm5hbE1lc3NhZ2VVcmwgPSAoaWQsIGludGVycG9sYXRlZFBhcnRzKSA9PlxuICBpbnRlcnBvbGF0ZWRQYXJ0cy5yZWR1Y2UoXG4gICAgKHByZWZpeCwgYXJnKSA9PiBgJHtwcmVmaXh9JnNbXT0ke21lc3NhZ2VBcmdUb0VuY29kZWRDb21wb25lbnQoYXJnKX1gLFxuICAgIGBodHRwczovL2xvZy5hbXAuZGV2Lz92PSR7bWVzc2FnZVVybFJ0digpfSZpZD0ke2VuY29kZVVSSUNvbXBvbmVudChpZCl9YFxuICApO1xuXG4vKipcbiAqIFVSTCB0byBzaW1wbGUgbG9nIG1lc3NhZ2VzIHRhYmxlIEpTT04gZmlsZSwgd2hpY2ggY29udGFpbnMgYW4gT2JqZWN0PHN0cmluZywgc3RyaW5nPlxuICogd2hpY2ggbWFwcyBtZXNzYWdlIGlkIHRvIGZ1bGwgbWVzc2FnZSB0ZW1wbGF0ZS5cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuY29uc3QgZXh0ZXJuYWxNZXNzYWdlc1NpbXBsZVRhYmxlVXJsID0gKCkgPT5cbiAgYCR7dXJscy5jZG59L3J0di8ke21lc3NhZ2VVcmxSdHYoKX0vbG9nLW1lc3NhZ2VzLnNpbXBsZS5qc29uYDtcblxuLyoqXG4gKiBAcGFyYW0geyp9IGFyZ1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5jb25zdCBtZXNzYWdlQXJnVG9FbmNvZGVkQ29tcG9uZW50ID0gKGFyZykgPT5cbiAgZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhlbGVtZW50U3RyaW5nT3JQYXNzVGhydShhcmcpKSk7XG5cbi8qKlxuICogTG9nZ2luZyBjbGFzcy4gVXNlIG9mIHNlbnRpbmVsIHN0cmluZyBpbnN0ZWFkIG9mIGEgYm9vbGVhbiB0byBjaGVjayB1c2VyL2RldlxuICogZXJyb3JzIGJlY2F1c2UgZXJyb3JzIGNvdWxkIGJlIHJldGhyb3duIGJ5IHNvbWUgbmF0aXZlIGNvZGUgYXMgYSBuZXcgZXJyb3IsXG4gKiBhbmQgb25seSBhIG1lc3NhZ2Ugd291bGQgc3Vydml2ZS4gQWxzbywgc29tZSBicm93c2VyIGRvbuKAmXQgc3VwcG9ydCBhIDV0aFxuICogZXJyb3Igb2JqZWN0IGFyZ3VtZW50IGluIHdpbmRvdy5vbmVycm9yLiBMaXN0IG9mIHN1cHBvcnRpbmcgYnJvd3NlciBjYW4gYmVcbiAqIGZvdW5kIGhlcmU6XG4gKiBodHRwczovL2Jsb2cuc2VudHJ5LmlvLzIwMTYvMDEvMDQvY2xpZW50LWphdmFzY3JpcHQtcmVwb3J0aW5nLXdpbmRvdy1vbmVycm9yLmh0bWxcbiAqIEBmaW5hbFxuICogQHByaXZhdGUgVmlzaWJsZSBmb3IgdGVzdGluZyBvbmx5LlxuICovXG5leHBvcnQgY2xhc3MgTG9nIHtcbiAgLyoqXG4gICAqIG9wdF9zdWZmaXggd2lsbCBiZSBhcHBlbmRlZCB0byBlcnJvciBtZXNzYWdlIHRvIGlkZW50aWZ5IHRoZSB0eXBlIG9mIHRoZVxuICAgKiBlcnJvciBtZXNzYWdlLiBXZSBjYW4ndCByZWx5IG9uIHRoZSBlcnJvciBvYmplY3QgdG8gcGFzcyBhbG9uZyB0aGUgdHlwZVxuICAgKiBiZWNhdXNlIHNvbWUgYnJvd3NlcnMgZG8gbm90IGhhdmUgdGhpcyBwYXJhbSBpbiBpdHMgd2luZG93Lm9uZXJyb3IgQVBJLlxuICAgKiBTZWU6XG4gICAqIGh0dHBzOi8vYmxvZy5zZW50cnkuaW8vMjAxNi8wMS8wNC9jbGllbnQtamF2YXNjcmlwdC1yZXBvcnRpbmctd2luZG93LW9uZXJyb3IuaHRtbFxuICAgKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKG51bWJlciwgYm9vbGVhbik6IUxvZ0xldmVsfSBsZXZlbEZ1bmNcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfc3VmZml4XG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIGxldmVsRnVuYywgb3B0X3N1ZmZpeCA9ICcnKSB7XG4gICAgLyoqXG4gICAgICogSW4gdGVzdHMgd2UgdXNlIHRoZSBtYWluIHRlc3Qgd2luZG93IGluc3RlYWQgb2YgdGhlIGlmcmFtZSB3aGVyZVxuICAgICAqIHRoZSB0ZXN0cyBydW5zIGJlY2F1c2Ugb25seSB0aGUgZm9ybWVyIGlzIHJlbGF5ZWQgdG8gdGhlIGNvbnNvbGUuXG4gICAgICogQGNvbnN0IHshV2luZG93fVxuICAgICAqL1xuICAgIHRoaXMud2luID0gZ2V0TW9kZSgpLnRlc3QgJiYgd2luLl9fQU1QX1RFU1RfSUZSQU1FID8gd2luLnBhcmVudCA6IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge2Z1bmN0aW9uKG51bWJlciwgYm9vbGVhbik6IUxvZ0xldmVsfSAqL1xuICAgIHRoaXMubGV2ZWxGdW5jXyA9IGxldmVsRnVuYztcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFMb2dMZXZlbH0gKi9cbiAgICB0aGlzLmxldmVsXyA9IHRoaXMuZGVmYXVsdExldmVsXygpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuICAgIHRoaXMuc3VmZml4XyA9IG9wdF9zdWZmaXg7XG5cbiAgICAvKiogQHByaXZhdGUgez9Kc29uT2JqZWN0fSAqL1xuICAgIHRoaXMubWVzc2FnZXNfID0gbnVsbDtcblxuICAgIHRoaXMuZmV0Y2hFeHRlcm5hbE1lc3NhZ2VzT25jZV8gPSBvbmNlKCgpID0+IHtcbiAgICAgIHdpblxuICAgICAgICAuZmV0Y2goZXh0ZXJuYWxNZXNzYWdlc1NpbXBsZVRhYmxlVXJsKCkpXG4gICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpLCBub29wKVxuICAgICAgICAudGhlbigob3B0X21lc3NhZ2VzKSA9PiB7XG4gICAgICAgICAgaWYgKG9wdF9tZXNzYWdlcykge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlc18gPSAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAob3B0X21lc3NhZ2VzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gVGhpcyBib3VuZCBhc3NlcnRpb24gZnVuY3Rpb24gaXMgY2FwYWJsZSBvZiBoYW5kbGluZyB0aGUgZm9ybWF0IHVzZWQgd2hlblxuICAgIC8vIGVycm9yL2Fzc2VydGlvbiBtZXNzYWdlcyBhcmUgZXh0cmFjdGVkLiBUaGlzIGxvZ2ljIGhhc24ndCB5ZXQgYmVlblxuICAgIC8vIG1pZ3JhdGVkIHRvIGFuIEFNUC1pbmRlcGVuZGVudCBmb3JtIGZvciB1c2UgaW4gY29yZS4gVGhpcyBiaW5kaW5nIGFsbG93c1xuICAgIC8vIExvZyBhc3NlcnRpb24gaGVscGVycyB0byBtYWludGFpbiBtZXNzYWdlLWV4dHJhY3Rpb24gY2FwYWJpbGl0aWVzIHVudGlsXG4gICAgLy8gdGhhdCBsb2dpYyBjYW4gYmUgbW92ZWQgdG8gY29yZS5cbiAgICB0aGlzLmJvdW5kQXNzZXJ0Rm5fID0gLyoqIEB0eXBlIHshYXNzZXJ0aW9ucy5Bc3NlcnRpb25GdW5jdGlvbkRlZn0gKi8gKFxuICAgICAgdGhpcy5hc3NlcnQuYmluZCh0aGlzKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IUxvZ0xldmVsfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZGVmYXVsdExldmVsXygpIHtcbiAgICAvLyBObyBjb25zb2xlIC0gY2FuJ3QgZW5hYmxlIGxvZ2dpbmcuXG4gICAgaWYgKFxuICAgICAgIXRoaXMud2luLmNvbnNvbGU/LmxvZyB8fFxuICAgICAgLy8gTG9nZ2luZyBoYXMgYmVlbiBleHBsaWNpdGx5IGRpc2FibGVkLlxuICAgICAgZ2V0TW9kZSgpLmxvZyA9PSAwXG4gICAgKSB7XG4gICAgICByZXR1cm4gTG9nTGV2ZWwuT0ZGO1xuICAgIH1cblxuICAgIC8vIExvZ2dpbmcgaXMgZW5hYmxlZCBmb3IgdGVzdHMgZGlyZWN0bHkuXG4gICAgaWYgKGdldE1vZGUoKS50ZXN0ICYmIHRoaXMud2luLkVOQUJMRV9MT0cpIHtcbiAgICAgIHJldHVybiBMb2dMZXZlbC5GSU5FO1xuICAgIH1cblxuICAgIC8vIExvY2FsRGV2IGJ5IGRlZmF1bHQgYWxsb3dzIElORk8gbGV2ZWwsIHVubGVzcyBvdmVycmlkZW4gYnkgYCNsb2dgLlxuICAgIGlmIChnZXRNb2RlKCkubG9jYWxEZXYpIHtcbiAgICAgIHJldHVybiBMb2dMZXZlbC5JTkZPO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmRlZmF1bHRMZXZlbFdpdGhGdW5jXygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4geyFMb2dMZXZlbH1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRlZmF1bHRMZXZlbFdpdGhGdW5jXygpIHtcbiAgICAvLyBEZWxlZ2F0ZSB0byB0aGUgc3BlY2lmaWMgcmVzb2x2ZXIuXG4gICAgcmV0dXJuIHRoaXMubGV2ZWxGdW5jXyhnZXRNb2RlKCkubG9nLCBnZXRNb2RlKCkuZGV2ZWxvcG1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWdcbiAgICogQHBhcmFtIHshTG9nTGV2ZWx9IGxldmVsXG4gICAqIEBwYXJhbSB7IUFycmF5fSBtZXNzYWdlc1xuICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIGEgdGhlIG1lc3NhZ2Ugd2FzIGxvZ2dlZFxuICAgKi9cbiAgbXNnXyh0YWcsIGxldmVsLCBtZXNzYWdlcykge1xuICAgIGlmIChsZXZlbCA+IChsZXZlbE92ZXJyaWRlXyA/PyB0aGlzLmxldmVsXykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBjcyA9IHRoaXMud2luLmNvbnNvbGU7XG4gICAgY29uc3QgZm4gPVxuICAgICAge1xuICAgICAgICBbTG9nTGV2ZWwuRVJST1JdOiBjcy5lcnJvcixcbiAgICAgICAgW0xvZ0xldmVsLklORk9dOiBjcy5pbmZvLFxuICAgICAgICBbTG9nTGV2ZWwuV0FSTl06IGNzLndhcm4sXG4gICAgICB9W2xldmVsXSA/PyBjcy5sb2c7XG5cbiAgICBjb25zdCBhcmdzID0gdGhpcy5tYXliZUV4cGFuZE1lc3NhZ2VBcmdzXyhtZXNzYWdlcyk7XG4gICAgLy8gUHJlZml4IGNvbnNvbGUgbWVzc2FnZSB3aXRoIFwiW3RhZ11cIi5cbiAgICBjb25zdCBwcmVmaXggPSBgWyR7dGFnfV1gO1xuICAgIGlmIChpc1N0cmluZyhhcmdzWzBdKSkge1xuICAgICAgLy8gUHJlcGVuZCBzdHJpbmcgdG8gYXZvaWQgYnJlYWtpbmcgc3RyaW5nIHN1YnN0aXR1dGlvbnMgZS5nLiAlcy5cbiAgICAgIGFyZ3NbMF0gPSBwcmVmaXggKyAnICcgKyBhcmdzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzLnVuc2hpZnQocHJlZml4KTtcbiAgICB9XG4gICAgZm4uYXBwbHkoY3MsIGFyZ3MpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVwb3J0cyBhIGZpbmUtZ3JhaW5lZCBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnXG4gICAqIEBwYXJhbSB7Li4uKn0gYXJnc1xuICAgKi9cbiAgZmluZSh0YWcsIC4uLmFyZ3MpIHtcbiAgICB0aGlzLm1zZ18odGFnLCBMb2dMZXZlbC5GSU5FLCBhcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIGEgaW5mb3JtYXRpb25hbCBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnXG4gICAqIEBwYXJhbSB7Li4uKn0gYXJnc1xuICAgKi9cbiAgaW5mbyh0YWcsIC4uLmFyZ3MpIHtcbiAgICB0aGlzLm1zZ18odGFnLCBMb2dMZXZlbC5JTkZPLCBhcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIGEgd2FybmluZyBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnXG4gICAqIEBwYXJhbSB7Li4uKn0gYXJnc1xuICAgKi9cbiAgd2Fybih0YWcsIC4uLmFyZ3MpIHtcbiAgICB0aGlzLm1zZ18odGFnLCBMb2dMZXZlbC5XQVJOLCBhcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIGFuIGVycm9yIG1lc3NhZ2UuIElmIHRoZSBsb2dnaW5nIGlzIGRpc2FibGVkLCB0aGUgZXJyb3IgaXMgcmV0aHJvd25cbiAgICogYXN5bmNocm9ub3VzbHkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWdcbiAgICogQHBhcmFtIHsuLi4qfSBhcmdzXG4gICAqIEByZXR1cm4geyFFcnJvcnx1bmRlZmluZWR9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlcnJvcl8odGFnLCAuLi5hcmdzKSB7XG4gICAgaWYgKCF0aGlzLm1zZ18odGFnLCBMb2dMZXZlbC5FUlJPUiwgYXJncykpIHtcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUVycm9yLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIGFuIGVycm9yIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWdcbiAgICogQHBhcmFtIHsuLi4qfSB2YXJfYXJnc1xuICAgKi9cbiAgZXJyb3IodGFnLCB2YXJfYXJncykge1xuICAgIGNvbnN0IGVycm9yID0gdGhpcy5lcnJvcl8uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIC8vIFRPRE8ocmNlYnVsa28pOiBEZXRlcm1pbmUgaWYvaG93IHRoaXMgRXJyb3IjbmFtZSBwcm9wZXJ0eSBpcyB1c2VkLlxuICAgICAgZXJyb3IubmFtZSA9IHRhZyB8fCBlcnJvci5uYW1lO1xuICAgICAgLy8gX19BTVBfUkVQT1JUX0VSUk9SIGlzIGluc3RhbGxlZCBnbG9iYWxseSBwZXIgd2luZG93IGluIHRoZSBlbnRyeSBwb2ludC5cbiAgICAgIHNlbGYuX19BTVBfUkVQT1JUX0VSUk9SKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVwb3J0cyBhbiBlcnJvciBtZXNzYWdlIGFuZCBtYXJrcyB3aXRoIGFuIGV4cGVjdGVkIHByb3BlcnR5LiBJZiB0aGVcbiAgICogbG9nZ2luZyBpcyBkaXNhYmxlZCwgdGhlIGVycm9yIGlzIHJldGhyb3duIGFzeW5jaHJvbm91c2x5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW51c2VkVGFnXG4gICAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3NcbiAgICovXG4gIGV4cGVjdGVkRXJyb3IodW51c2VkVGFnLCB2YXJfYXJncykge1xuICAgIGNvbnN0IGVycm9yID0gdGhpcy5lcnJvcl8uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIGVycm9yLmV4cGVjdGVkID0gdHJ1ZTtcbiAgICAgIC8vIF9fQU1QX1JFUE9SVF9FUlJPUiBpcyBpbnN0YWxsZWQgZ2xvYmFsbHkgcGVyIHdpbmRvdyBpbiB0aGUgZW50cnkgcG9pbnQuXG4gICAgICBzZWxmLl9fQU1QX1JFUE9SVF9FUlJPUihlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gZXJyb3Igb2JqZWN0LlxuICAgKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzXG4gICAqIEByZXR1cm4geyFFcnJvcn1cbiAgICovXG4gIGNyZWF0ZUVycm9yKHZhcl9hcmdzKSB7XG4gICAgY29uc3QgZXJyb3IgPSBjcmVhdGVFcnJvclZhcmdzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5wcmVwYXJlRXJyb3JfKGVycm9yKTtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBlcnJvciBvYmplY3Qgd2l0aCBpdHMgZXhwZWN0ZWQgcHJvcGVydHkgc2V0IHRvIHRydWUuXG4gICAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3NcbiAgICogQHJldHVybiB7IUVycm9yfVxuICAgKi9cbiAgY3JlYXRlRXhwZWN0ZWRFcnJvcih2YXJfYXJncykge1xuICAgIGNvbnN0IGVycm9yID0gY3JlYXRlRXJyb3JWYXJncy5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIHRoaXMucHJlcGFyZUVycm9yXyhlcnJvcik7XG4gICAgZXJyb3IuZXhwZWN0ZWQgPSB0cnVlO1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFcnJvcn0gZXJyb3JcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByZXBhcmVFcnJvcl8oZXJyb3IpIHtcbiAgICBlcnJvciA9IGR1cGxpY2F0ZUVycm9ySWZOZWNlc3NhcnkoZXJyb3IpO1xuXG4gICAgaWYgKHRoaXMuc3VmZml4Xykge1xuICAgICAgaWYgKCFlcnJvci5tZXNzYWdlKSB7XG4gICAgICAgIGVycm9yLm1lc3NhZ2UgPSB0aGlzLnN1ZmZpeF87XG4gICAgICB9IGVsc2UgaWYgKGVycm9yLm1lc3NhZ2UuaW5kZXhPZih0aGlzLnN1ZmZpeF8pID09IC0xKSB7XG4gICAgICAgIGVycm9yLm1lc3NhZ2UgKz0gdGhpcy5zdWZmaXhfO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNVc2VyRXJyb3JNZXNzYWdlKGVycm9yLm1lc3NhZ2UpKSB7XG4gICAgICBlcnJvci5tZXNzYWdlID0gc3RyaXBVc2VyRXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUFycmF5fSBhcmdzXG4gICAqIEByZXR1cm4geyFBcnJheX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIG1heWJlRXhwYW5kTWVzc2FnZUFyZ3NfKGFyZ3MpIHtcbiAgICByZXR1cm4gaXNBcnJheShhcmdzWzBdKVxuICAgICAgPyB0aGlzLmV4cGFuZE1lc3NhZ2VBcmdzXygvKiogQHR5cGUgeyFBcnJheX0gKi8gKGFyZ3NbMF0pKVxuICAgICAgOiBhcmdzO1xuICB9XG5cbiAgLyoqXG4gICAqIEVpdGhlciByZWRpcmVjdHMgYSBwYWlyIG9mIChlcnJvcklkLCAuLi5hcmdzKSB0byBhIFVSTCB3aGVyZSB0aGUgZnVsbFxuICAgKiBtZXNzYWdlIGlzIGRpc3BsYXllZCwgb3IgZGlzcGxheXMgaXQgZnJvbSBhIGZldGNoZWQgdGFibGUuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgYnkgdGhlIG91dHB1dCBvZiB0aGUgYHRyYW5zZm9ybS1sb2ctbWV0aG9kc2AgYmFiZWxcbiAgICogcGx1Z2luLiBJdCBzaG91bGQgbm90IGJlIHVzZWQgZGlyZWN0bHkuIFVzZSB0aGUgKCplcnJvcnxhc3NlcnQqfGluZm98d2FybilcbiAgICogbWV0aG9kcyBpbnN0ZWFkLlxuICAgKlxuICAgKiBAcGFyYW0geyFBcnJheX0gcGFydHNcbiAgICogQHJldHVybiB7IUFycmF5fVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZXhwYW5kTWVzc2FnZUFyZ3NfKHBhcnRzKSB7XG4gICAgLy8gRmlyc3QgdmFsdWUgc2hvdWxkIGV4aXN0LlxuICAgIGNvbnN0IGlkID0gcGFydHMuc2hpZnQoKTtcbiAgICAvLyBCZXN0IGVmZm9ydCBmZXRjaCBvZiBtZXNzYWdlIHRlbXBsYXRlIHRhYmxlLlxuICAgIC8vIFNpbmNlIHRoaXMgaXMgYXN5bmMsIHRoZSBmaXJzdCBmZXcgbG9ncyBtaWdodCBiZSBpbmRpcmVjdGVkIHRvIGEgVVJMIGV2ZW5cbiAgICAvLyBpZiBpbiBkZXZlbG9wbWVudCBtb2RlLiBNZXNzYWdlIHRhYmxlIGlzIH5zbWFsbCBzbyB0aGlzIHNob3VsZCBiZSBhIHNob3J0XG4gICAgLy8gZ2FwLlxuICAgIGlmIChnZXRNb2RlKHRoaXMud2luKS5kZXZlbG9wbWVudCkge1xuICAgICAgdGhpcy5mZXRjaEV4dGVybmFsTWVzc2FnZXNPbmNlXygpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm1lc3NhZ2VzXz8uW2lkXVxuICAgICAgPyBbdGhpcy5tZXNzYWdlc19baWRdXS5jb25jYXQocGFydHMpXG4gICAgICA6IFtgTW9yZSBpbmZvIGF0ICR7ZXh0ZXJuYWxNZXNzYWdlVXJsKGlkLCBwYXJ0cyl9YF07XG4gIH1cblxuICAvKipcbiAgICogVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBmaXJzdCBhcmd1bWVudCBpc24ndCB0cnVlaXNoLlxuICAgKlxuICAgKiBTdXBwb3J0cyBhcmd1bWVudCBzdWJzdGl0dXRpb24gaW50byB0aGUgbWVzc2FnZSB2aWEgJXMgcGxhY2Vob2xkZXJzLlxuICAgKlxuICAgKiBUaHJvd3MgYW4gZXJyb3Igb2JqZWN0IHRoYXQgaGFzIHR3byBleHRyYSBwcm9wZXJ0aWVzOlxuICAgKiAtIGFzc29jaWF0ZWRFbGVtZW50OiBUaGlzIGlzIHRoZSBmaXJzdCBlbGVtZW50IHByb3ZpZGVkIGluIHRoZSB2YXIgYXJncy5cbiAgICogICBJdCBjYW4gYmUgdXNlZCBmb3IgaW1wcm92ZWQgZGlzcGxheSBvZiBlcnJvciBtZXNzYWdlcy5cbiAgICogLSBtZXNzYWdlQXJyYXk6IFRoZSBlbGVtZW50cyBvZiB0aGUgc3Vic3RpdHV0ZWQgbWVzc2FnZSBhcyBub24tc3RyaW5naWZpZWRcbiAgICogICBlbGVtZW50cyBpbiBhbiBhcnJheS4gV2hlbiBlLmcuIHBhc3NlZCB0byBjb25zb2xlLmVycm9yIHRoaXMgeWllbGRzXG4gICAqICAgbmF0aXZlIGRpc3BsYXlzIG9mIHRoaW5ncyBsaWtlIEhUTUwgZWxlbWVudHMuXG4gICAqXG4gICAqIEBwYXJhbSB7VH0gc2hvdWxkQmVUcnVlaXNoIFRoZSB2YWx1ZSB0byBhc3NlcnQuIFRoZSBhc3NlcnQgZmFpbHMgaWYgaXQgZG9lc1xuICAgKiAgICAgbm90IGV2YWx1YXRlIHRvIHRydWUuXG4gICAqIEBwYXJhbSB7IUFycmF5fHN0cmluZz19IG9wdF9tZXNzYWdlIFRoZSBhc3NlcnRpb24gbWVzc2FnZVxuICAgKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzIEFyZ3VtZW50cyBzdWJzdGl0dXRlZCBpbnRvICVzIGluIHRoZSBtZXNzYWdlLlxuICAgKiBAcmV0dXJuIHtUfSBUaGUgdmFsdWUgb2Ygc2hvdWxkQmVUcnVlaXNoLlxuICAgKiBAdGhyb3dzIHshRXJyb3J9IFdoZW4gYHZhbHVlYCBpcyBmYWxzZXkuXG4gICAqIEB0ZW1wbGF0ZSBUXG4gICAqIEBjbG9zdXJlUHJpbWl0aXZlIHthc3NlcnRzLnRydXRoeX1cbiAgICovXG4gIGFzc2VydChzaG91bGRCZVRydWVpc2gsIG9wdF9tZXNzYWdlLCB2YXJfYXJncykge1xuICAgIGlmIChpc0FycmF5KG9wdF9tZXNzYWdlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuYXNzZXJ0LmFwcGx5KFxuICAgICAgICB0aGlzLFxuICAgICAgICBbc2hvdWxkQmVUcnVlaXNoXS5jb25jYXQoXG4gICAgICAgICAgdGhpcy5leHBhbmRNZXNzYWdlQXJnc18oLyoqIEB0eXBlIHshQXJyYXl9ICovIChvcHRfbWVzc2FnZSkpXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFzc2VydGlvbnMuYXNzZXJ0LmFwcGx5KFxuICAgICAgbnVsbCxcbiAgICAgIFt0aGlzLnN1ZmZpeF9dLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBmaXJzdCBhcmd1bWVudCBpc24ndCBhbiBFbGVtZW50XG4gICAqXG4gICAqIE90aGVyd2lzZSBzZWUgYGFzc2VydGAgZm9yIHVzYWdlXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gc2hvdWxkQmVFbGVtZW50XG4gICAqIEBwYXJhbSB7IUFycmF5fHN0cmluZz19IG9wdF9tZXNzYWdlIFRoZSBhc3NlcnRpb24gbWVzc2FnZVxuICAgKiBAcmV0dXJuIHshRWxlbWVudH0gVGhlIHZhbHVlIG9mIHNob3VsZEJlVHJ1ZWlzaC5cbiAgICogQGNsb3N1cmVQcmltaXRpdmUge2Fzc2VydHMubWF0Y2hlc1JldHVybn1cbiAgICovXG4gIGFzc2VydEVsZW1lbnQoc2hvdWxkQmVFbGVtZW50LCBvcHRfbWVzc2FnZSkge1xuICAgIHJldHVybiBhc3NlcnRpb25zLmFzc2VydEVsZW1lbnQoXG4gICAgICB0aGlzLmJvdW5kQXNzZXJ0Rm5fLFxuICAgICAgc2hvdWxkQmVFbGVtZW50LFxuICAgICAgb3B0X21lc3NhZ2VcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRocm93cyBhbiBlcnJvciBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaXNuJ3QgYSBzdHJpbmcuIFRoZSBzdHJpbmcgY2FuXG4gICAqIGJlIGVtcHR5LlxuICAgKlxuICAgKiBGb3IgbW9yZSBkZXRhaWxzIHNlZSBgYXNzZXJ0YC5cbiAgICpcbiAgICogQHBhcmFtIHsqfSBzaG91bGRCZVN0cmluZ1xuICAgKiBAcGFyYW0geyFBcnJheXxzdHJpbmc9fSBvcHRfbWVzc2FnZSBUaGUgYXNzZXJ0aW9uIG1lc3NhZ2VcbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RyaW5nIHZhbHVlLiBDYW4gYmUgYW4gZW1wdHkgc3RyaW5nLlxuICAgKiBAY2xvc3VyZVByaW1pdGl2ZSB7YXNzZXJ0cy5tYXRjaGVzUmV0dXJufVxuICAgKi9cbiAgYXNzZXJ0U3RyaW5nKHNob3VsZEJlU3RyaW5nLCBvcHRfbWVzc2FnZSkge1xuICAgIHJldHVybiBhc3NlcnRpb25zLmFzc2VydFN0cmluZyhcbiAgICAgIHRoaXMuYm91bmRBc3NlcnRGbl8sXG4gICAgICBzaG91bGRCZVN0cmluZyxcbiAgICAgIG9wdF9tZXNzYWdlXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIGZpcnN0IGFyZ3VtZW50IGlzbid0IGEgbnVtYmVyLiBUaGUgYWxsb3dlZCB2YWx1ZXNcbiAgICogaW5jbHVkZSBgMGAgYW5kIGBOYU5gLlxuICAgKlxuICAgKiBGb3IgbW9yZSBkZXRhaWxzIHNlZSBgYXNzZXJ0YC5cbiAgICpcbiAgICogQHBhcmFtIHsqfSBzaG91bGRCZU51bWJlclxuICAgKiBAcGFyYW0geyFBcnJheXxzdHJpbmc9fSBvcHRfbWVzc2FnZSBUaGUgYXNzZXJ0aW9uIG1lc3NhZ2VcbiAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgbnVtYmVyIHZhbHVlLiBUaGUgYWxsb3dlZCB2YWx1ZXMgaW5jbHVkZSBgMGBcbiAgICogICBhbmQgYE5hTmAuXG4gICAqIEBjbG9zdXJlUHJpbWl0aXZlIHthc3NlcnRzLm1hdGNoZXNSZXR1cm59XG4gICAqL1xuICBhc3NlcnROdW1iZXIoc2hvdWxkQmVOdW1iZXIsIG9wdF9tZXNzYWdlKSB7XG4gICAgcmV0dXJuIGFzc2VydGlvbnMuYXNzZXJ0TnVtYmVyKFxuICAgICAgdGhpcy5ib3VuZEFzc2VydEZuXyxcbiAgICAgIHNob3VsZEJlTnVtYmVyLFxuICAgICAgb3B0X21lc3NhZ2VcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRocm93cyBhbiBlcnJvciBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaXMgbm90IGFuIGFycmF5LlxuICAgKiBUaGUgYXJyYXkgY2FuIGJlIGVtcHR5LlxuICAgKlxuICAgKiBAcGFyYW0geyp9IHNob3VsZEJlQXJyYXlcbiAgICogQHBhcmFtIHshQXJyYXl8c3RyaW5nPX0gb3B0X21lc3NhZ2UgVGhlIGFzc2VydGlvbiBtZXNzYWdlXG4gICAqIEByZXR1cm4geyFBcnJheX0gVGhlIGFycmF5IHZhbHVlXG4gICAqIEBjbG9zdXJlUHJpbWl0aXZlIHthc3NlcnRzLm1hdGNoZXNSZXR1cm59XG4gICAqL1xuICBhc3NlcnRBcnJheShzaG91bGRCZUFycmF5LCBvcHRfbWVzc2FnZSkge1xuICAgIHJldHVybiBhc3NlcnRpb25zLmFzc2VydEFycmF5KFxuICAgICAgdGhpcy5ib3VuZEFzc2VydEZuXyxcbiAgICAgIHNob3VsZEJlQXJyYXksXG4gICAgICBvcHRfbWVzc2FnZVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBmaXJzdCBhcmd1bWVudCBpc24ndCBhIGJvb2xlYW4uXG4gICAqXG4gICAqIEZvciBtb3JlIGRldGFpbHMgc2VlIGBhc3NlcnRgLlxuICAgKlxuICAgKiBAcGFyYW0geyp9IHNob3VsZEJlQm9vbGVhblxuICAgKiBAcGFyYW0geyFBcnJheXxzdHJpbmc9fSBvcHRfbWVzc2FnZSBUaGUgYXNzZXJ0aW9uIG1lc3NhZ2VcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVGhlIGJvb2xlYW4gdmFsdWUuXG4gICAqIEBjbG9zdXJlUHJpbWl0aXZlIHthc3NlcnRzLm1hdGNoZXNSZXR1cm59XG4gICAqL1xuICBhc3NlcnRCb29sZWFuKHNob3VsZEJlQm9vbGVhbiwgb3B0X21lc3NhZ2UpIHtcbiAgICByZXR1cm4gYXNzZXJ0aW9ucy5hc3NlcnRCb29sZWFuKFxuICAgICAgdGhpcy5ib3VuZEFzc2VydEZuXyxcbiAgICAgIHNob3VsZEJlQm9vbGVhbixcbiAgICAgIG9wdF9tZXNzYWdlXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIENhY2hlIGZvciBsb2dzLiBXZSBkbyBub3QgdXNlIGEgU2VydmljZSBzaW5jZSB0aGUgc2VydmljZSBtb2R1bGUgZGVwZW5kc1xuICogb24gTG9nIGFuZCBjbG9zdXJlIGxpdGVyYWxseSBjYW4ndCBldmVuLlxuICogQHR5cGUge3t1c2VyOiA/TG9nLCBkZXY6ID9Mb2csIHVzZXJGb3JFbWJlZDogP0xvZ319XG4gKi9cbnNlbGYuX19BTVBfTE9HID0gc2VsZi5fX0FNUF9MT0cgfHwge1xuICB1c2VyOiBudWxsLFxuICBkZXY6IG51bGwsXG4gIHVzZXJGb3JFbWJlZDogbnVsbCxcbn07XG5cbmNvbnN0IGxvZ3MgPSBzZWxmLl9fQU1QX0xPRztcblxuLyoqXG4gKiBFdmVudHVhbGx5IGhvbGRzIGEgY29uc3RydWN0b3IgZm9yIExvZyBvYmplY3RzLiBMYXppbHkgaW5pdGlhbGl6ZWQsIHNvIHdlXG4gKiBjYW4gYXZvaWQgZXZlciByZWZlcmVuY2luZyB0aGUgcmVhbCBjb25zdHJ1Y3RvciBleGNlcHQgaW4gSlMgYmluYXJpZXNcbiAqIHRoYXQgYWN0dWFsbHkgd2FudCB0byBpbmNsdWRlIHRoZSBpbXBsZW1lbnRhdGlvbi5cbiAqIEB0eXBlIHs/dHlwZW9mIExvZ31cbiAqL1xubGV0IGxvZ0NvbnN0cnVjdG9yID0gbnVsbDtcblxuLyoqXG4gKiBJbml0aWFsaXplcyBsb2cgY29uc3RydWN0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbml0TG9nQ29uc3RydWN0b3IoKSB7XG4gIGxvZ0NvbnN0cnVjdG9yID0gTG9nO1xuICAvLyBJbml0aWFsaXplIGluc3RhbmNlcyBmb3IgdXNlLiBJZiBhIGJpbmFyeSAoYW4gZXh0ZW5zaW9uIGZvciBleGFtcGxlKSB0aGF0XG4gIC8vIGRvZXMgbm90IGNhbGwgYGluaXRMb2dDb25zdHJ1Y3RvcmAgaW52b2tlcyBgZGV2KClgIG9yIGB1c2VyKClgIGVhcmxpZXIgdGhhblxuICAvLyB0aGUgYmluYXJ5IHRoYXQgZG9lcyBjYWxsIGBpbml0TG9nQ29uc3RydWN0b3JgIChhbXAuanMpLCB0aGUgZXh0ZW5zaW9uIHdpbGxcbiAgLy8gdGhyb3cgYW4gZXJyb3IgYXMgdGhhdCBleHRlbnNpb24gd2lsbCBuZXZlciBiZSBhYmxlIHRvIGluaXRpYWxpemUgdGhlIGxvZ1xuICAvLyBpbnN0YW5jZXMgYW5kIHdlIGFsc28gZG9uJ3Qgd2FudCBpdCB0byBjYWxsIGBpbml0TG9nQ29uc3RydWN0b3JgIGVpdGhlclxuICAvLyAoc2luY2UgdGhhdCB3aWxsIGNhdXNlIHRoZSBMb2cgaW1wbGVtZW50YXRpb24gdG8gYmUgYnVuZGxlZCBpbnRvIHRoYXRcbiAgLy8gYmluYXJ5KS4gU28gd2UgbXVzdCBpbml0aWFsaXplIHRoZSBpbnN0YW5jZXMgZWFnZXJseSBzbyB0aGF0IHRoZXkgYXJlIHJlYWR5XG4gIC8vIGZvciB1c2UgKHN0b3JlZCBnbG9iYWxseSkgYWZ0ZXIgdGhlIG1haW4gYmluYXJ5IGNhbGxzIGBpbml0TG9nQ29uc3RydWN0b3JgLlxuICBkZXYoKTtcbiAgdXNlcigpO1xufVxuXG4vKipcbiAqIFJlc2V0cyBsb2cgY29uc3RydWN0b3IgZm9yIHRlc3RpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldExvZ0NvbnN0cnVjdG9yRm9yVGVzdGluZygpIHtcbiAgbG9nQ29uc3RydWN0b3IgPSBudWxsO1xufVxuXG4vKipcbiAqIENhbGxzIHRoZSBsb2cgY29uc3RydWN0b3Igd2l0aCBhIGdpdmVuIGxldmVsIGZ1bmN0aW9uIGFuZCBzdWZmaXguXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKG51bWJlciwgYm9vbGVhbik6IUxvZ0xldmVsfSBsZXZlbEZ1bmNcbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X3N1ZmZpeFxuICogQHJldHVybiB7IUxvZ31cbiAqL1xuZnVuY3Rpb24gY2FsbExvZ0NvbnN0cnVjdG9yKGxldmVsRnVuYywgb3B0X3N1ZmZpeCkge1xuICBpZiAoIWxvZ0NvbnN0cnVjdG9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdmYWlsZWQgdG8gY2FsbCBpbml0TG9nQ29uc3RydWN0b3InKTtcbiAgfVxuICByZXR1cm4gbmV3IGxvZ0NvbnN0cnVjdG9yKHNlbGYsIGxldmVsRnVuYywgb3B0X3N1ZmZpeCk7XG59XG5cbi8qKlxuICogUHVibGlzaGVyIGxldmVsIGxvZy5cbiAqXG4gKiBFbmFibGVkIGluIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqICAxLiBOb3QgZGlzYWJsZWQgdXNpbmcgYCNsb2c9MGAuXG4gKiAgMi4gRGV2ZWxvcG1lbnQgbW9kZSBpcyBlbmFibGVkIHZpYSBgI2RldmVsb3BtZW50PTFgIG9yIGxvZ2dpbmcgaXMgZXhwbGljaXRseVxuICogICAgIGVuYWJsZWQgdmlhIGAjbG9nPURgIHdoZXJlIEQgPj0gMS5cbiAqICAzLiBBTVAuc2V0TG9nTGV2ZWwoRCkgaXMgY2FsbGVkLCB3aGVyZSBEID49IDEuXG4gKlxuICogQHBhcmFtIHshRWxlbWVudD19IG9wdF9lbGVtZW50XG4gKiBAcmV0dXJuIHshTG9nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlcihvcHRfZWxlbWVudCkge1xuICAvLyBsb2dzLnVzZXIgbXVzdCBleGlzdCBmaXJzdCB0byBwZXJmb3JtIHRoZSBsb2dzLnVzZXIud2luIGNoZWNrIGJlbG93XG4gIGlmICghbG9ncy51c2VyKSB7XG4gICAgbG9ncy51c2VyID0gZ2V0VXNlckxvZ2dlcihVU0VSX0VSUk9SX1NFTlRJTkVMKTtcbiAgfVxuXG4gIGlmIChpc0Zyb21FbWJlZChsb2dzLnVzZXIud2luLCBvcHRfZWxlbWVudCkpIHtcbiAgICByZXR1cm4gKFxuICAgICAgbG9ncy51c2VyRm9yRW1iZWQgfHxcbiAgICAgIChsb2dzLnVzZXJGb3JFbWJlZCA9IGdldFVzZXJMb2dnZXIoVVNFUl9FUlJPUl9FTUJFRF9TRU5USU5FTCkpXG4gICAgKTtcbiAgfVxuICByZXR1cm4gbG9ncy51c2VyO1xufVxuXG4vKipcbiAqIEdldHRlciBmb3IgdXNlciBsb2dnZXJcbiAqIEBwYXJhbSB7c3RyaW5nPX0gc3VmZml4XG4gKiBAcmV0dXJuIHshTG9nfVxuICovXG5mdW5jdGlvbiBnZXRVc2VyTG9nZ2VyKHN1ZmZpeCkge1xuICByZXR1cm4gY2FsbExvZ0NvbnN0cnVjdG9yKFxuICAgIChsb2dOdW0sIGRldmVsb3BtZW50KSA9PlxuICAgICAgZGV2ZWxvcG1lbnQgfHwgbG9nTnVtID49IDEgPyBMb2dMZXZlbC5GSU5FIDogTG9nTGV2ZWwuV0FSTixcbiAgICBzdWZmaXhcbiAgKTtcbn1cblxuLyoqXG4gKiBBTVAgZGV2ZWxvcG1lbnQgbG9nLiBDYWxscyB0byBgZGV2TG9nKCkuYXNzZXJ0YCBhbmQgYGRldi5maW5lYCBhcmUgc3RyaXBwZWRcbiAqIGluIHRoZSBQUk9EIGJpbmFyeS4gSG93ZXZlciwgYGRldkxvZygpLmFzc2VydGAgcmVzdWx0IGlzIHByZXNlcnZlZCBpbiBlaXRoZXJcbiAqIGNhc2UuXG4gKlxuICogRW5hYmxlZCBpbiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKiAgMS4gTm90IGRpc2FibGVkIHVzaW5nIGAjbG9nPTBgLlxuICogIDIuIExvZ2dpbmcgaXMgZXhwbGljaXRseSBlbmFibGVkIHZpYSBgI2xvZz1EYCwgd2hlcmUgRCA+PSAyLlxuICogIDMuIEFNUC5zZXRMb2dMZXZlbChEKSBpcyBjYWxsZWQsIHdoZXJlIEQgPj0gMi5cbiAqXG4gKiBAcmV0dXJuIHshTG9nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGV2KCkge1xuICByZXR1cm4gKFxuICAgIGxvZ3MuZGV2IHx8XG4gICAgKGxvZ3MuZGV2ID0gY2FsbExvZ0NvbnN0cnVjdG9yKChsb2dOdW0pID0+XG4gICAgICBsb2dOdW0gPj0gMyA/IExvZ0xldmVsLkZJTkUgOiBsb2dOdW0gPj0gMiA/IExvZ0xldmVsLklORk8gOiBMb2dMZXZlbC5PRkZcbiAgICApKVxuICApO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0geyFFbGVtZW50PX0gb3B0X2VsZW1lbnRcbiAqIEByZXR1cm4ge2Jvb2xlYW59IGlzRW1iZWRcbiAqL1xuZnVuY3Rpb24gaXNGcm9tRW1iZWQod2luLCBvcHRfZWxlbWVudCkge1xuICByZXR1cm4gb3B0X2VsZW1lbnQgJiYgb3B0X2VsZW1lbnQub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldyAhPSB3aW47XG59XG5cbi8qKlxuICogVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBmaXJzdCBhcmd1bWVudCBpc24ndCB0cnVlaXNoLlxuICpcbiAqIFN1cHBvcnRzIGFyZ3VtZW50IHN1YnN0aXR1dGlvbiBpbnRvIHRoZSBtZXNzYWdlIHZpYSAlcyBwbGFjZWhvbGRlcnMuXG4gKlxuICogVGhyb3dzIGFuIGVycm9yIG9iamVjdCB0aGF0IGhhcyB0d28gZXh0cmEgcHJvcGVydGllczpcbiAqIC0gYXNzb2NpYXRlZEVsZW1lbnQ6IFRoaXMgaXMgdGhlIGZpcnN0IGVsZW1lbnQgcHJvdmlkZWQgaW4gdGhlIHZhciBhcmdzLlxuICogICBJdCBjYW4gYmUgdXNlZCBmb3IgaW1wcm92ZWQgZGlzcGxheSBvZiBlcnJvciBtZXNzYWdlcy5cbiAqIC0gbWVzc2FnZUFycmF5OiBUaGUgZWxlbWVudHMgb2YgdGhlIHN1YnN0aXR1dGVkIG1lc3NhZ2UgYXMgbm9uLXN0cmluZ2lmaWVkXG4gKiAgIGVsZW1lbnRzIGluIGFuIGFycmF5LiBXaGVuIGUuZy4gcGFzc2VkIHRvIGNvbnNvbGUuZXJyb3IgdGhpcyB5aWVsZHNcbiAqICAgbmF0aXZlIGRpc3BsYXlzIG9mIHRoaW5ncyBsaWtlIEhUTUwgZWxlbWVudHMuXG4gKlxuICogQHBhcmFtIHtUfSBzaG91bGRCZVRydWVpc2ggVGhlIHZhbHVlIHRvIGFzc2VydC4gVGhlIGFzc2VydCBmYWlscyBpZiBpdCBkb2VzXG4gKiAgICAgbm90IGV2YWx1YXRlIHRvIHRydWUuXG4gKiBAcGFyYW0geyFBcnJheXxzdHJpbmc9fSBvcHRfbWVzc2FnZSBUaGUgYXNzZXJ0aW9uIG1lc3NhZ2VcbiAqIEBwYXJhbSB7Kj19IG9wdF8xIE9wdGlvbmFsIGFyZ3VtZW50IChWYXIgYXJnIGFzIGluZGl2aWR1YWwgcGFyYW1zIGZvciBiZXR0ZXJcbiAqIEBwYXJhbSB7Kj19IG9wdF8yIE9wdGlvbmFsIGFyZ3VtZW50IGlubGluaW5nKVxuICogQHBhcmFtIHsqPX0gb3B0XzMgT3B0aW9uYWwgYXJndW1lbnRcbiAqIEBwYXJhbSB7Kj19IG9wdF80IE9wdGlvbmFsIGFyZ3VtZW50XG4gKiBAcGFyYW0geyo9fSBvcHRfNSBPcHRpb25hbCBhcmd1bWVudFxuICogQHBhcmFtIHsqPX0gb3B0XzYgT3B0aW9uYWwgYXJndW1lbnRcbiAqIEBwYXJhbSB7Kj19IG9wdF83IE9wdGlvbmFsIGFyZ3VtZW50XG4gKiBAcGFyYW0geyo9fSBvcHRfOCBPcHRpb25hbCBhcmd1bWVudFxuICogQHBhcmFtIHsqPX0gb3B0XzkgT3B0aW9uYWwgYXJndW1lbnRcbiAqIEByZXR1cm4ge1R9IFRoZSB2YWx1ZSBvZiBzaG91bGRCZVRydWVpc2guXG4gKiBAdGhyb3dzIHshRXJyb3J9IFdoZW4gYHNob3VsZEJlVHJ1ZWlzaGAgaXMgZmFsc2V5LlxuICogQHRlbXBsYXRlIFRcbiAqIEBjbG9zdXJlUHJpbWl0aXZlIHthc3NlcnRzLnRydXRoeX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldkFzc2VydChcbiAgc2hvdWxkQmVUcnVlaXNoLFxuICBvcHRfbWVzc2FnZSxcbiAgb3B0XzEsXG4gIG9wdF8yLFxuICBvcHRfMyxcbiAgb3B0XzQsXG4gIG9wdF81LFxuICBvcHRfNixcbiAgb3B0XzcsXG4gIG9wdF84LFxuICBvcHRfOVxuKSB7XG4gIGlmIChtb2RlLmlzTWluaWZpZWQoKSkge1xuICAgIHJldHVybiBzaG91bGRCZVRydWVpc2g7XG4gIH1cbiAgaWYgKHNlbGYuX19BTVBfQVNTRVJUSU9OX0NIRUNLKSB7XG4gICAgLy8gVGhpcyB3aWxsIG5ldmVyIGV4ZWN1dGUgcmVnYXJkbGVzcywgYnV0IHdpbGwgYmUgaW5jbHVkZWQgb24gdW5taW5pZmllZFxuICAgIC8vIGJ1aWxkcy4gSXQgd2lsbCBiZSBEQ0UnZCBhd2F5IGZyb20gbWluaWZpZWQgYnVpbGRzLCBhbmQgc28gY2FuIGJlIHVzZWQgdG9cbiAgICAvLyB2YWxpZGF0ZSB0aGF0IEJhYmVsIGlzIHByb3Blcmx5IHJlbW92aW5nIGRldiBhc3NlcnRpb25zIGluIG1pbmlmaWVkXG4gICAgLy8gYnVpbGRzLlxuICAgIGNvbnNvbGUgLypPSyovXG4gICAgICAubG9nKCdfX2RldkFzc2VydF9zZW50aW5lbF9fJyk7XG4gIH1cblxuICByZXR1cm4gZGV2KCkuLypPcmlnIGNhbGwqLyBhc3NlcnQoXG4gICAgc2hvdWxkQmVUcnVlaXNoLFxuICAgIG9wdF9tZXNzYWdlLFxuICAgIG9wdF8xLFxuICAgIG9wdF8yLFxuICAgIG9wdF8zLFxuICAgIG9wdF80LFxuICAgIG9wdF81LFxuICAgIG9wdF82LFxuICAgIG9wdF83LFxuICAgIG9wdF84LFxuICAgIG9wdF85XG4gICk7XG59XG5cbi8qKlxuICogVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBmaXJzdCBhcmd1bWVudCBpc24ndCB0cnVlaXNoLlxuICpcbiAqIFN1cHBvcnRzIGFyZ3VtZW50IHN1YnN0aXR1dGlvbiBpbnRvIHRoZSBtZXNzYWdlIHZpYSAlcyBwbGFjZWhvbGRlcnMuXG4gKlxuICogVGhyb3dzIGFuIGVycm9yIG9iamVjdCB0aGF0IGhhcyB0d28gZXh0cmEgcHJvcGVydGllczpcbiAqIC0gYXNzb2NpYXRlZEVsZW1lbnQ6IFRoaXMgaXMgdGhlIGZpcnN0IGVsZW1lbnQgcHJvdmlkZWQgaW4gdGhlIHZhciBhcmdzLlxuICogICBJdCBjYW4gYmUgdXNlZCBmb3IgaW1wcm92ZWQgZGlzcGxheSBvZiBlcnJvciBtZXNzYWdlcy5cbiAqIC0gbWVzc2FnZUFycmF5OiBUaGUgZWxlbWVudHMgb2YgdGhlIHN1YnN0aXR1dGVkIG1lc3NhZ2UgYXMgbm9uLXN0cmluZ2lmaWVkXG4gKiAgIGVsZW1lbnRzIGluIGFuIGFycmF5LiBXaGVuIGUuZy4gcGFzc2VkIHRvIGNvbnNvbGUuZXJyb3IgdGhpcyB5aWVsZHNcbiAqICAgbmF0aXZlIGRpc3BsYXlzIG9mIHRoaW5ncyBsaWtlIEhUTUwgZWxlbWVudHMuXG4gKlxuICogQHBhcmFtIHtUfSBzaG91bGRCZVRydWVpc2ggVGhlIHZhbHVlIHRvIGFzc2VydC4gVGhlIGFzc2VydCBmYWlscyBpZiBpdCBkb2VzXG4gKiAgICAgbm90IGV2YWx1YXRlIHRvIHRydWUuXG4gKiBAcGFyYW0geyFBcnJheXxzdHJpbmc9fSBvcHRfbWVzc2FnZSBUaGUgYXNzZXJ0aW9uIG1lc3NhZ2VcbiAqIEBwYXJhbSB7Kj19IG9wdF8xIE9wdGlvbmFsIGFyZ3VtZW50IChWYXIgYXJnIGFzIGluZGl2aWR1YWwgcGFyYW1zIGZvciBiZXR0ZXJcbiAqIEBwYXJhbSB7Kj19IG9wdF8yIE9wdGlvbmFsIGFyZ3VtZW50IGlubGluaW5nKVxuICogQHBhcmFtIHsqPX0gb3B0XzMgT3B0aW9uYWwgYXJndW1lbnRcbiAqIEBwYXJhbSB7Kj19IG9wdF80IE9wdGlvbmFsIGFyZ3VtZW50XG4gKiBAcGFyYW0geyo9fSBvcHRfNSBPcHRpb25hbCBhcmd1bWVudFxuICogQHBhcmFtIHsqPX0gb3B0XzYgT3B0aW9uYWwgYXJndW1lbnRcbiAqIEBwYXJhbSB7Kj19IG9wdF83IE9wdGlvbmFsIGFyZ3VtZW50XG4gKiBAcGFyYW0geyo9fSBvcHRfOCBPcHRpb25hbCBhcmd1bWVudFxuICogQHBhcmFtIHsqPX0gb3B0XzkgT3B0aW9uYWwgYXJndW1lbnRcbiAqIEByZXR1cm4ge1R9IFRoZSB2YWx1ZSBvZiBzaG91bGRCZVRydWVpc2guXG4gKiBAdGhyb3dzIHshRXJyb3J9IFdoZW4gYHNob3VsZEJlVHJ1ZWlzaGAgaXMgZmFsc2V5LlxuICogQHRlbXBsYXRlIFRcbiAqIEBjbG9zdXJlUHJpbWl0aXZlIHthc3NlcnRzLnRydXRoeX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZXJBc3NlcnQoXG4gIHNob3VsZEJlVHJ1ZWlzaCxcbiAgb3B0X21lc3NhZ2UsXG4gIG9wdF8xLFxuICBvcHRfMixcbiAgb3B0XzMsXG4gIG9wdF80LFxuICBvcHRfNSxcbiAgb3B0XzYsXG4gIG9wdF83LFxuICBvcHRfOCxcbiAgb3B0Xzlcbikge1xuICByZXR1cm4gdXNlcigpLi8qT3JpZyBjYWxsKi8gYXNzZXJ0KFxuICAgIHNob3VsZEJlVHJ1ZWlzaCxcbiAgICBvcHRfbWVzc2FnZSxcbiAgICBvcHRfMSxcbiAgICBvcHRfMixcbiAgICBvcHRfMyxcbiAgICBvcHRfNCxcbiAgICBvcHRfNSxcbiAgICBvcHRfNixcbiAgICBvcHRfNyxcbiAgICBvcHRfOCxcbiAgICBvcHRfOVxuICApO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/log.js