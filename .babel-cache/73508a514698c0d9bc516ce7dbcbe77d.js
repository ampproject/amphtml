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
import * as mode from "./core/mode";
import { urls } from "./config";
import * as assertions from "./core/assert/base";
import { createErrorVargs, duplicateErrorIfNecessary } from "./core/error";
import { USER_ERROR_SENTINEL, elementStringOrPassThru, isUserErrorMessage, stripUserError } from "./core/error/message-helpers";
import { isArray } from "./core/types";
import { once } from "./core/types/function";
import { internalRuntimeVersion } from "./internal-version";
import { getMode } from "./mode";

var noop = function noop() {};

// These are exported here despite being defined in core to avoid updating
// imports for now.
export { USER_ERROR_SENTINEL, isUserErrorMessage, stripUserError };

/**
 * Four zero width space.
 *
 * @const {string}
 */
export var USER_ERROR_EMBED_SENTINEL = "\u200B\u200B\u200B\u200B";

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
export var LogLevel = {
  OFF: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  FINE: 4
};

/**
 * Sets reportError function. Called from error-reporting.js to break cyclic
 * dependency.
 * @param {function(this:Window, Error, (?Element)=): ?|undefined} fn
 */
export function setReportError(fn) {
  self.__AMP_REPORT_ERROR = fn;
}

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
  return "01" + internalRuntimeVersion();
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
    key: "getLevel_",
    value: function getLevel_() {
      return levelOverride_ !== undefined ? levelOverride_ : this.level_;
    }
    /**
     * @return {!LogLevel}
     * @private
     */

  }, {
    key: "defaultLevel_",
    value: function defaultLevel_() {
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

  }, {
    key: "defaultLevelWithFunc_",
    value: function defaultLevelWithFunc_() {
      // Delegate to the specific resolver.
      return this.levelFunc_(parseInt(getMode().log, 10), getMode().development);
    }
    /**
     * @param {string} tag
     * @param {!LogLevel} level
     * @param {!Array} messages
     * @return {boolean} true if a message was logged
     */

  }, {
    key: "msg_",
    value: function msg_(tag, level, messages) {
      if (this.getLevel_() < level) {
        return false;
      }

      var fn = this.win.console.log;

      if (level == LogLevel.ERROR) {
        fn = this.win.console.error || fn;
      } else if (level == LogLevel.INFO) {
        fn = this.win.console.info || fn;
      } else if (level == LogLevel.WARN) {
        fn = this.win.console.warn || fn;
      }

      var args = this.maybeExpandMessageArgs_(messages);
      // Prefix console message with "[tag]".
      var prefix = "[" + tag + "]";

      if (typeof args[0] === 'string') {
        // Prepend string to avoid breaking string substitutions e.g. %s.
        args[0] = prefix + ' ' + args[0];
      } else {
        args.unshift(prefix);
      }

      fn.apply(this.win.console, args);
      return true;
    }
    /**
     * Whether the logging is enabled.
     * @return {boolean}
     */

  }, {
    key: "isEnabled",
    value: function isEnabled() {
      return this.getLevel_() != LogLevel.OFF;
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
        error.message = error.message.replace(USER_ERROR_SENTINEL, '');
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
      if (isArray(args[0])) {
        return this.expandMessageArgs_(
        /** @type {!Array} */
        args[0]);
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

  }, {
    key: "expandMessageArgs_",
    value: function expandMessageArgs_(parts) {
      // First value should exist.
      var id = parts.shift();

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

      return ["More info at " + externalMessageUrl(id, parts)];
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

    return logs.userForEmbed = getUserLogger(USER_ERROR_EMBED_SENTINEL);
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

  return new logConstructor(self, function (logNum, development) {
    if (development || logNum >= 1) {
      return LogLevel.FINE;
    }

    return LogLevel.WARN;
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
  if (logs.dev) {
    return logs.dev;
  }

  if (!logConstructor) {
    throw new Error('failed to call initLogConstructor');
  }

  return logs.dev = new logConstructor(self, function (logNum) {
    if (logNum >= 3) {
      return LogLevel.FINE;
    }

    if (logNum >= 2) {
      return LogLevel.INFO;
    }

    return LogLevel.OFF;
  });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvZy5qcyJdLCJuYW1lcyI6WyJtb2RlIiwidXJscyIsImFzc2VydGlvbnMiLCJjcmVhdGVFcnJvclZhcmdzIiwiZHVwbGljYXRlRXJyb3JJZk5lY2Vzc2FyeSIsIlVTRVJfRVJST1JfU0VOVElORUwiLCJlbGVtZW50U3RyaW5nT3JQYXNzVGhydSIsImlzVXNlckVycm9yTWVzc2FnZSIsInN0cmlwVXNlckVycm9yIiwiaXNBcnJheSIsIm9uY2UiLCJpbnRlcm5hbFJ1bnRpbWVWZXJzaW9uIiwiZ2V0TW9kZSIsIm5vb3AiLCJVU0VSX0VSUk9SX0VNQkVEX1NFTlRJTkVMIiwiaXNVc2VyRXJyb3JFbWJlZCIsIm1lc3NhZ2UiLCJpbmRleE9mIiwiTG9nTGV2ZWwiLCJPRkYiLCJFUlJPUiIsIldBUk4iLCJJTkZPIiwiRklORSIsInNldFJlcG9ydEVycm9yIiwiZm4iLCJzZWxmIiwiX19BTVBfUkVQT1JUX0VSUk9SIiwibGV2ZWxPdmVycmlkZV8iLCJ1bmRlZmluZWQiLCJvdmVycmlkZUxvZ0xldmVsIiwibGV2ZWwiLCJtZXNzYWdlVXJsUnR2IiwiZXh0ZXJuYWxNZXNzYWdlVXJsIiwiaWQiLCJpbnRlcnBvbGF0ZWRQYXJ0cyIsInJlZHVjZSIsInByZWZpeCIsImFyZyIsIm1lc3NhZ2VBcmdUb0VuY29kZWRDb21wb25lbnQiLCJlbmNvZGVVUklDb21wb25lbnQiLCJleHRlcm5hbE1lc3NhZ2VzU2ltcGxlVGFibGVVcmwiLCJjZG4iLCJTdHJpbmciLCJMb2ciLCJ3aW4iLCJsZXZlbEZ1bmMiLCJvcHRfc3VmZml4IiwidGVzdCIsIl9fQU1QX1RFU1RfSUZSQU1FIiwicGFyZW50IiwibGV2ZWxGdW5jXyIsImxldmVsXyIsImRlZmF1bHRMZXZlbF8iLCJzdWZmaXhfIiwibWVzc2FnZXNfIiwiZmV0Y2hFeHRlcm5hbE1lc3NhZ2VzT25jZV8iLCJmZXRjaCIsInRoZW4iLCJyZXNwb25zZSIsImpzb24iLCJvcHRfbWVzc2FnZXMiLCJib3VuZEFzc2VydEZuXyIsImFzc2VydCIsImJpbmQiLCJjb25zb2xlIiwibG9nIiwiRU5BQkxFX0xPRyIsImxvY2FsRGV2IiwiZGVmYXVsdExldmVsV2l0aEZ1bmNfIiwicGFyc2VJbnQiLCJkZXZlbG9wbWVudCIsInRhZyIsIm1lc3NhZ2VzIiwiZ2V0TGV2ZWxfIiwiZXJyb3IiLCJpbmZvIiwid2FybiIsImFyZ3MiLCJtYXliZUV4cGFuZE1lc3NhZ2VBcmdzXyIsInVuc2hpZnQiLCJhcHBseSIsIm1zZ18iLCJjcmVhdGVFcnJvciIsInZhcl9hcmdzIiwiZXJyb3JfIiwiYXJndW1lbnRzIiwibmFtZSIsInVudXNlZFRhZyIsImV4cGVjdGVkIiwicHJlcGFyZUVycm9yXyIsInNob3VsZEJlVHJ1ZWlzaCIsIm9wdF9tZXNzYWdlIiwiY29uY2F0IiwiZXhwYW5kTWVzc2FnZUFyZ3NfIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJzbGljZSIsImNhbGwiLCJzaG91bGRCZUVsZW1lbnQiLCJhc3NlcnRFbGVtZW50Iiwic2hvdWxkQmVTdHJpbmciLCJhc3NlcnRTdHJpbmciLCJzaG91bGRCZU51bWJlciIsImFzc2VydE51bWJlciIsInNob3VsZEJlQXJyYXkiLCJhc3NlcnRBcnJheSIsInNob3VsZEJlQm9vbGVhbiIsImFzc2VydEJvb2xlYW4iLCJyZXBsYWNlIiwicGFydHMiLCJzaGlmdCIsIl9fQU1QX0xPRyIsInVzZXIiLCJkZXYiLCJ1c2VyRm9yRW1iZWQiLCJsb2dzIiwibG9nQ29uc3RydWN0b3IiLCJpbml0TG9nQ29uc3RydWN0b3IiLCJyZXNldExvZ0NvbnN0cnVjdG9yRm9yVGVzdGluZyIsIm9wdF9lbGVtZW50IiwiZ2V0VXNlckxvZ2dlciIsImlzRnJvbUVtYmVkIiwic3VmZml4IiwiRXJyb3IiLCJsb2dOdW0iLCJvd25lckRvY3VtZW50IiwiZGVmYXVsdFZpZXciLCJkZXZBc3NlcnQiLCJvcHRfMSIsIm9wdF8yIiwib3B0XzMiLCJvcHRfNCIsIm9wdF81Iiwib3B0XzYiLCJvcHRfNyIsIm9wdF84Iiwib3B0XzkiLCJpc01pbmlmaWVkIiwiX19BTVBfQVNTRVJUSU9OX0NIRUNLIiwidXNlckFzc2VydCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsT0FBTyxLQUFLQSxJQUFaO0FBRUEsU0FBUUMsSUFBUjtBQUNBLE9BQU8sS0FBS0MsVUFBWjtBQUNBLFNBQVFDLGdCQUFSLEVBQTBCQyx5QkFBMUI7QUFDQSxTQUNFQyxtQkFERixFQUVFQyx1QkFGRixFQUdFQyxrQkFIRixFQUlFQyxjQUpGO0FBTUEsU0FBUUMsT0FBUjtBQUNBLFNBQVFDLElBQVI7QUFDQSxTQUFRQyxzQkFBUjtBQUNBLFNBQVFDLE9BQVI7O0FBRUEsSUFBTUMsSUFBSSxHQUFHLFNBQVBBLElBQU8sR0FBTSxDQUFFLENBQXJCOztBQUVBO0FBQ0E7QUFDQSxTQUFRUixtQkFBUixFQUE2QkUsa0JBQTdCLEVBQWlEQyxjQUFqRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNTSx5QkFBeUIsR0FBRywwQkFBbEM7O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLGdCQUFULENBQTBCQyxPQUExQixFQUFtQztBQUN4QyxTQUFPQSxPQUFPLENBQUNDLE9BQVIsQ0FBZ0JILHlCQUFoQixLQUE4QyxDQUFyRDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBTUksUUFBUSxHQUFHO0FBQ3RCQyxFQUFBQSxHQUFHLEVBQUUsQ0FEaUI7QUFFdEJDLEVBQUFBLEtBQUssRUFBRSxDQUZlO0FBR3RCQyxFQUFBQSxJQUFJLEVBQUUsQ0FIZ0I7QUFJdEJDLEVBQUFBLElBQUksRUFBRSxDQUpnQjtBQUt0QkMsRUFBQUEsSUFBSSxFQUFFO0FBTGdCLENBQWpCOztBQVFQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLGNBQVQsQ0FBd0JDLEVBQXhCLEVBQTRCO0FBQ2pDQyxFQUFBQSxJQUFJLENBQUNDLGtCQUFMLEdBQTBCRixFQUExQjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSUcsY0FBYyxHQUFHQyxTQUFyQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNDLGdCQUFULENBQTBCQyxLQUExQixFQUFpQztBQUN0Q0gsRUFBQUEsY0FBYyxHQUFHRyxLQUFqQjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1DLGFBQWEsR0FBRyxTQUFoQkEsYUFBZ0I7QUFBQSxnQkFBV3JCLHNCQUFzQixFQUFqQztBQUFBLENBQXRCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1zQixrQkFBa0IsR0FBRyxTQUFyQkEsa0JBQXFCLENBQUNDLEVBQUQsRUFBS0MsaUJBQUw7QUFBQSxTQUN6QkEsaUJBQWlCLENBQUNDLE1BQWxCLENBQ0UsVUFBQ0MsTUFBRCxFQUFTQyxHQUFUO0FBQUEsV0FBb0JELE1BQXBCLGFBQWtDRSw0QkFBNEIsQ0FBQ0QsR0FBRCxDQUE5RDtBQUFBLEdBREYsOEJBRTRCTixhQUFhLEVBRnpDLFlBRWtEUSxrQkFBa0IsQ0FBQ04sRUFBRCxDQUZwRSxDQUR5QjtBQUFBLENBQTNCOztBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNTyw4QkFBOEIsR0FBRyxTQUFqQ0EsOEJBQWlDO0FBQUEsU0FDbEN4QyxJQUFJLENBQUN5QyxHQUQ2QixhQUNsQlYsYUFBYSxFQURLO0FBQUEsQ0FBdkM7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNTyw0QkFBNEIsR0FBRyxTQUEvQkEsNEJBQStCLENBQUNELEdBQUQ7QUFBQSxTQUNuQ0Usa0JBQWtCLENBQUNHLE1BQU0sQ0FBQ3JDLHVCQUF1QixDQUFDZ0MsR0FBRCxDQUF4QixDQUFQLENBRGlCO0FBQUEsQ0FBckM7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFhTSxHQUFiO0FBQ0U7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNFLGVBQVlDLEdBQVosRUFBaUJDLFNBQWpCLEVBQTRCQyxVQUE1QixFQUE2QztBQUFBOztBQUFBLFFBQWpCQSxVQUFpQjtBQUFqQkEsTUFBQUEsVUFBaUIsR0FBSixFQUFJO0FBQUE7O0FBQUE7O0FBQzNDO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDSSxTQUFLRixHQUFMLEdBQVdqQyxPQUFPLEdBQUdvQyxJQUFWLElBQWtCSCxHQUFHLENBQUNJLGlCQUF0QixHQUEwQ0osR0FBRyxDQUFDSyxNQUE5QyxHQUF1REwsR0FBbEU7O0FBRUE7QUFDQSxTQUFLTSxVQUFMLEdBQWtCTCxTQUFsQjs7QUFFQTtBQUNBLFNBQUtNLE1BQUwsR0FBYyxLQUFLQyxhQUFMLEVBQWQ7O0FBRUE7QUFDQSxTQUFLQyxPQUFMLEdBQWVQLFVBQWY7O0FBRUE7QUFDQSxTQUFLUSxTQUFMLEdBQWlCLElBQWpCO0FBRUEsU0FBS0MsMEJBQUwsR0FBa0M5QyxJQUFJLENBQUMsWUFBTTtBQUMzQ21DLE1BQUFBLEdBQUcsQ0FDQVksS0FESCxDQUNTaEIsOEJBQThCLEVBRHZDLEVBRUdpQixJQUZILENBRVEsVUFBQ0MsUUFBRDtBQUFBLGVBQWNBLFFBQVEsQ0FBQ0MsSUFBVCxFQUFkO0FBQUEsT0FGUixFQUV1Qy9DLElBRnZDLEVBR0c2QyxJQUhILENBR1EsVUFBQ0csWUFBRCxFQUFrQjtBQUN0QixZQUFJQSxZQUFKLEVBQWtCO0FBQ2hCLFVBQUEsS0FBSSxDQUFDTixTQUFMO0FBQWlCO0FBQTRCTSxVQUFBQSxZQUE3QztBQUNEO0FBQ0YsT0FQSDtBQVFELEtBVHFDLENBQXRDO0FBV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQUtDLGNBQUw7QUFBc0I7QUFDcEIsU0FBS0MsTUFBTCxDQUFZQyxJQUFaLENBQWlCLElBQWpCLENBREY7QUFHRDs7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQXhEQTtBQUFBO0FBQUEsV0F5REUscUJBQVk7QUFDVixhQUFPcEMsY0FBYyxLQUFLQyxTQUFuQixHQUErQkQsY0FBL0IsR0FBZ0QsS0FBS3dCLE1BQTVEO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUFoRUE7QUFBQTtBQUFBLFdBaUVFLHlCQUFnQjtBQUNkO0FBQ0EsVUFBSSxDQUFDLEtBQUtQLEdBQUwsQ0FBU29CLE9BQVYsSUFBcUIsQ0FBQyxLQUFLcEIsR0FBTCxDQUFTb0IsT0FBVCxDQUFpQkMsR0FBM0MsRUFBZ0Q7QUFDOUMsZUFBT2hELFFBQVEsQ0FBQ0MsR0FBaEI7QUFDRDs7QUFFRDtBQUNBLFVBQUlQLE9BQU8sR0FBR3NELEdBQVYsSUFBaUIsR0FBckIsRUFBMEI7QUFDeEIsZUFBT2hELFFBQVEsQ0FBQ0MsR0FBaEI7QUFDRDs7QUFFRDtBQUNBLFVBQUlQLE9BQU8sR0FBR29DLElBQVYsSUFBa0IsS0FBS0gsR0FBTCxDQUFTc0IsVUFBL0IsRUFBMkM7QUFDekMsZUFBT2pELFFBQVEsQ0FBQ0ssSUFBaEI7QUFDRDs7QUFFRDtBQUNBLFVBQUlYLE9BQU8sR0FBR3dELFFBQVYsSUFBc0IsQ0FBQ3hELE9BQU8sR0FBR3NELEdBQXJDLEVBQTBDO0FBQ3hDLGVBQU9oRCxRQUFRLENBQUNJLElBQWhCO0FBQ0Q7O0FBRUQsYUFBTyxLQUFLK0MscUJBQUwsRUFBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7O0FBNUZBO0FBQUE7QUFBQSxXQTZGRSxpQ0FBd0I7QUFDdEI7QUFDQSxhQUFPLEtBQUtsQixVQUFMLENBQWdCbUIsUUFBUSxDQUFDMUQsT0FBTyxHQUFHc0QsR0FBWCxFQUFnQixFQUFoQixDQUF4QixFQUE2Q3RELE9BQU8sR0FBRzJELFdBQXZELENBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF2R0E7QUFBQTtBQUFBLFdBd0dFLGNBQUtDLEdBQUwsRUFBVXpDLEtBQVYsRUFBaUIwQyxRQUFqQixFQUEyQjtBQUN6QixVQUFJLEtBQUtDLFNBQUwsS0FBbUIzQyxLQUF2QixFQUE4QjtBQUM1QixlQUFPLEtBQVA7QUFDRDs7QUFDRCxVQUFJTixFQUFFLEdBQUcsS0FBS29CLEdBQUwsQ0FBU29CLE9BQVQsQ0FBaUJDLEdBQTFCOztBQUNBLFVBQUluQyxLQUFLLElBQUliLFFBQVEsQ0FBQ0UsS0FBdEIsRUFBNkI7QUFDM0JLLFFBQUFBLEVBQUUsR0FBRyxLQUFLb0IsR0FBTCxDQUFTb0IsT0FBVCxDQUFpQlUsS0FBakIsSUFBMEJsRCxFQUEvQjtBQUNELE9BRkQsTUFFTyxJQUFJTSxLQUFLLElBQUliLFFBQVEsQ0FBQ0ksSUFBdEIsRUFBNEI7QUFDakNHLFFBQUFBLEVBQUUsR0FBRyxLQUFLb0IsR0FBTCxDQUFTb0IsT0FBVCxDQUFpQlcsSUFBakIsSUFBeUJuRCxFQUE5QjtBQUNELE9BRk0sTUFFQSxJQUFJTSxLQUFLLElBQUliLFFBQVEsQ0FBQ0csSUFBdEIsRUFBNEI7QUFDakNJLFFBQUFBLEVBQUUsR0FBRyxLQUFLb0IsR0FBTCxDQUFTb0IsT0FBVCxDQUFpQlksSUFBakIsSUFBeUJwRCxFQUE5QjtBQUNEOztBQUNELFVBQU1xRCxJQUFJLEdBQUcsS0FBS0MsdUJBQUwsQ0FBNkJOLFFBQTdCLENBQWI7QUFDQTtBQUNBLFVBQU1wQyxNQUFNLFNBQU9tQyxHQUFQLE1BQVo7O0FBQ0EsVUFBSSxPQUFPTSxJQUFJLENBQUMsQ0FBRCxDQUFYLEtBQW1CLFFBQXZCLEVBQWlDO0FBQy9CO0FBQ0FBLFFBQUFBLElBQUksQ0FBQyxDQUFELENBQUosR0FBVXpDLE1BQU0sR0FBRyxHQUFULEdBQWV5QyxJQUFJLENBQUMsQ0FBRCxDQUE3QjtBQUNELE9BSEQsTUFHTztBQUNMQSxRQUFBQSxJQUFJLENBQUNFLE9BQUwsQ0FBYTNDLE1BQWI7QUFDRDs7QUFDRFosTUFBQUEsRUFBRSxDQUFDd0QsS0FBSCxDQUFTLEtBQUtwQyxHQUFMLENBQVNvQixPQUFsQixFQUEyQmEsSUFBM0I7QUFDQSxhQUFPLElBQVA7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBOztBQXBJQTtBQUFBO0FBQUEsV0FxSUUscUJBQVk7QUFDVixhQUFPLEtBQUtKLFNBQUwsTUFBb0J4RCxRQUFRLENBQUNDLEdBQXBDO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQTdJQTtBQUFBO0FBQUEsV0E4SUUsY0FBS3FELEdBQUwsRUFBbUI7QUFBQSx3Q0FBTk0sSUFBTTtBQUFOQSxRQUFBQSxJQUFNO0FBQUE7O0FBQ2pCLFdBQUtJLElBQUwsQ0FBVVYsR0FBVixFQUFldEQsUUFBUSxDQUFDSyxJQUF4QixFQUE4QnVELElBQTlCO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQXRKQTtBQUFBO0FBQUEsV0F1SkUsY0FBS04sR0FBTCxFQUFtQjtBQUFBLHlDQUFOTSxJQUFNO0FBQU5BLFFBQUFBLElBQU07QUFBQTs7QUFDakIsV0FBS0ksSUFBTCxDQUFVVixHQUFWLEVBQWV0RCxRQUFRLENBQUNJLElBQXhCLEVBQThCd0QsSUFBOUI7QUFDRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBL0pBO0FBQUE7QUFBQSxXQWdLRSxjQUFLTixHQUFMLEVBQW1CO0FBQUEseUNBQU5NLElBQU07QUFBTkEsUUFBQUEsSUFBTTtBQUFBOztBQUNqQixXQUFLSSxJQUFMLENBQVVWLEdBQVYsRUFBZXRELFFBQVEsQ0FBQ0csSUFBeEIsRUFBOEJ5RCxJQUE5QjtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUEzS0E7QUFBQTtBQUFBLFdBNEtFLGdCQUFPTixHQUFQLEVBQXFCO0FBQUEseUNBQU5NLElBQU07QUFBTkEsUUFBQUEsSUFBTTtBQUFBOztBQUNuQixVQUFJLENBQUMsS0FBS0ksSUFBTCxDQUFVVixHQUFWLEVBQWV0RCxRQUFRLENBQUNFLEtBQXhCLEVBQStCMEQsSUFBL0IsQ0FBTCxFQUEyQztBQUN6QyxlQUFPLEtBQUtLLFdBQUwsQ0FBaUJGLEtBQWpCLENBQXVCLElBQXZCLEVBQTZCSCxJQUE3QixDQUFQO0FBQ0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBdExBO0FBQUE7QUFBQSxXQXVMRSxlQUFNTixHQUFOLEVBQVdZLFFBQVgsRUFBcUI7QUFDbkIsVUFBTVQsS0FBSyxHQUFHLEtBQUtVLE1BQUwsQ0FBWUosS0FBWixDQUFrQixJQUFsQixFQUF3QkssU0FBeEIsQ0FBZDs7QUFDQSxVQUFJWCxLQUFKLEVBQVc7QUFDVDtBQUNBQSxRQUFBQSxLQUFLLENBQUNZLElBQU4sR0FBYWYsR0FBRyxJQUFJRyxLQUFLLENBQUNZLElBQTFCOztBQUNBO0FBQ0E3RCxRQUFBQSxJQUFJLENBQUNDLGtCQUFMLENBQXdCZ0QsS0FBeEI7QUFDRDtBQUNGO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXRNQTtBQUFBO0FBQUEsV0F1TUUsdUJBQWNhLFNBQWQsRUFBeUJKLFFBQXpCLEVBQW1DO0FBQ2pDLFVBQU1ULEtBQUssR0FBRyxLQUFLVSxNQUFMLENBQVlKLEtBQVosQ0FBa0IsSUFBbEIsRUFBd0JLLFNBQXhCLENBQWQ7O0FBQ0EsVUFBSVgsS0FBSixFQUFXO0FBQ1RBLFFBQUFBLEtBQUssQ0FBQ2MsUUFBTixHQUFpQixJQUFqQjs7QUFDQTtBQUNBL0QsUUFBQUEsSUFBSSxDQUFDQyxrQkFBTCxDQUF3QmdELEtBQXhCO0FBQ0Q7QUFDRjtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBcE5BO0FBQUE7QUFBQSxXQXFORSxxQkFBWVMsUUFBWixFQUFzQjtBQUNwQixVQUFNVCxLQUFLLEdBQUd4RSxnQkFBZ0IsQ0FBQzhFLEtBQWpCLENBQXVCLElBQXZCLEVBQTZCSyxTQUE3QixDQUFkO0FBQ0EsV0FBS0ksYUFBTCxDQUFtQmYsS0FBbkI7QUFDQSxhQUFPQSxLQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQS9OQTtBQUFBO0FBQUEsV0FnT0UsNkJBQW9CUyxRQUFwQixFQUE4QjtBQUM1QixVQUFNVCxLQUFLLEdBQUd4RSxnQkFBZ0IsQ0FBQzhFLEtBQWpCLENBQXVCLElBQXZCLEVBQTZCSyxTQUE3QixDQUFkO0FBQ0EsV0FBS0ksYUFBTCxDQUFtQmYsS0FBbkI7QUFDQUEsTUFBQUEsS0FBSyxDQUFDYyxRQUFOLEdBQWlCLElBQWpCO0FBQ0EsYUFBT2QsS0FBUDtBQUNEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTNQQTtBQUFBO0FBQUEsV0E0UEUsZ0JBQU9nQixlQUFQLEVBQXdCQyxXQUF4QixFQUFxQ1IsUUFBckMsRUFBK0M7QUFDN0MsVUFBSTNFLE9BQU8sQ0FBQ21GLFdBQUQsQ0FBWCxFQUEwQjtBQUN4QixlQUFPLEtBQUs3QixNQUFMLENBQVlrQixLQUFaLENBQ0wsSUFESyxFQUVMLENBQUNVLGVBQUQsRUFBa0JFLE1BQWxCLENBQ0UsS0FBS0Msa0JBQUw7QUFBd0I7QUFBdUJGLFFBQUFBLFdBQS9DLENBREYsQ0FGSyxDQUFQO0FBTUQ7O0FBRUQsYUFBTzFGLFVBQVUsQ0FBQzZELE1BQVgsQ0FBa0JrQixLQUFsQixDQUNMLElBREssRUFFTCxDQUFDLEtBQUszQixPQUFOLEVBQWV1QyxNQUFmLENBQXNCRSxLQUFLLENBQUNDLFNBQU4sQ0FBZ0JDLEtBQWhCLENBQXNCQyxJQUF0QixDQUEyQlosU0FBM0IsQ0FBdEIsQ0FGSyxDQUFQO0FBSUQ7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFyUkE7QUFBQTtBQUFBLFdBc1JFLHVCQUFjYSxlQUFkLEVBQStCUCxXQUEvQixFQUE0QztBQUMxQyxhQUFPMUYsVUFBVSxDQUFDa0csYUFBWCxDQUNMLEtBQUt0QyxjQURBLEVBRUxxQyxlQUZLLEVBR0xQLFdBSEssQ0FBUDtBQUtEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUF4U0E7QUFBQTtBQUFBLFdBeVNFLHNCQUFhUyxjQUFiLEVBQTZCVCxXQUE3QixFQUEwQztBQUN4QyxhQUFPMUYsVUFBVSxDQUFDb0csWUFBWCxDQUNMLEtBQUt4QyxjQURBLEVBRUx1QyxjQUZLLEVBR0xULFdBSEssQ0FBUDtBQUtEO0FBRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQTVUQTtBQUFBO0FBQUEsV0E2VEUsc0JBQWFXLGNBQWIsRUFBNkJYLFdBQTdCLEVBQTBDO0FBQ3hDLGFBQU8xRixVQUFVLENBQUNzRyxZQUFYLENBQ0wsS0FBSzFDLGNBREEsRUFFTHlDLGNBRkssRUFHTFgsV0FISyxDQUFQO0FBS0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBN1VBO0FBQUE7QUFBQSxXQThVRSxxQkFBWWEsYUFBWixFQUEyQmIsV0FBM0IsRUFBd0M7QUFDdEMsYUFBTzFGLFVBQVUsQ0FBQ3dHLFdBQVgsQ0FDTCxLQUFLNUMsY0FEQSxFQUVMMkMsYUFGSyxFQUdMYixXQUhLLENBQVA7QUFLRDtBQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQS9WQTtBQUFBO0FBQUEsV0FnV0UsdUJBQWNlLGVBQWQsRUFBK0JmLFdBQS9CLEVBQTRDO0FBQzFDLGFBQU8xRixVQUFVLENBQUMwRyxhQUFYLENBQ0wsS0FBSzlDLGNBREEsRUFFTDZDLGVBRkssRUFHTGYsV0FISyxDQUFQO0FBS0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTs7QUEzV0E7QUFBQTtBQUFBLFdBNFdFLHVCQUFjakIsS0FBZCxFQUFxQjtBQUNuQkEsTUFBQUEsS0FBSyxHQUFHdkUseUJBQXlCLENBQUN1RSxLQUFELENBQWpDOztBQUVBLFVBQUksS0FBS3JCLE9BQVQsRUFBa0I7QUFDaEIsWUFBSSxDQUFDcUIsS0FBSyxDQUFDM0QsT0FBWCxFQUFvQjtBQUNsQjJELFVBQUFBLEtBQUssQ0FBQzNELE9BQU4sR0FBZ0IsS0FBS3NDLE9BQXJCO0FBQ0QsU0FGRCxNQUVPLElBQUlxQixLQUFLLENBQUMzRCxPQUFOLENBQWNDLE9BQWQsQ0FBc0IsS0FBS3FDLE9BQTNCLEtBQXVDLENBQUMsQ0FBNUMsRUFBK0M7QUFDcERxQixVQUFBQSxLQUFLLENBQUMzRCxPQUFOLElBQWlCLEtBQUtzQyxPQUF0QjtBQUNEO0FBQ0YsT0FORCxNQU1PLElBQUkvQyxrQkFBa0IsQ0FBQ29FLEtBQUssQ0FBQzNELE9BQVAsQ0FBdEIsRUFBdUM7QUFDNUMyRCxRQUFBQSxLQUFLLENBQUMzRCxPQUFOLEdBQWdCMkQsS0FBSyxDQUFDM0QsT0FBTixDQUFjNkYsT0FBZCxDQUFzQnhHLG1CQUF0QixFQUEyQyxFQUEzQyxDQUFoQjtBQUNEO0FBQ0Y7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBOztBQTlYQTtBQUFBO0FBQUEsV0ErWEUsaUNBQXdCeUUsSUFBeEIsRUFBOEI7QUFDNUIsVUFBSXJFLE9BQU8sQ0FBQ3FFLElBQUksQ0FBQyxDQUFELENBQUwsQ0FBWCxFQUFzQjtBQUNwQixlQUFPLEtBQUtnQixrQkFBTDtBQUF3QjtBQUF1QmhCLFFBQUFBLElBQUksQ0FBQyxDQUFELENBQW5ELENBQVA7QUFDRDs7QUFDRCxhQUFPQSxJQUFQO0FBQ0Q7QUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBalpBO0FBQUE7QUFBQSxXQWtaRSw0QkFBbUJnQyxLQUFuQixFQUEwQjtBQUN4QjtBQUNBLFVBQU01RSxFQUFFLEdBQUc0RSxLQUFLLENBQUNDLEtBQU4sRUFBWDs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQUluRyxPQUFPLENBQUMsS0FBS2lDLEdBQU4sQ0FBUCxDQUFrQjBCLFdBQXRCLEVBQW1DO0FBQ2pDLGFBQUtmLDBCQUFMO0FBQ0Q7O0FBQ0QsVUFBSSxLQUFLRCxTQUFMLElBQWtCckIsRUFBRSxJQUFJLEtBQUtxQixTQUFqQyxFQUE0QztBQUMxQyxlQUFPLENBQUMsS0FBS0EsU0FBTCxDQUFlckIsRUFBZixDQUFELEVBQXFCMkQsTUFBckIsQ0FBNEJpQixLQUE1QixDQUFQO0FBQ0Q7O0FBQ0QsYUFBTyxtQkFBaUI3RSxrQkFBa0IsQ0FBQ0MsRUFBRCxFQUFLNEUsS0FBTCxDQUFuQyxDQUFQO0FBQ0Q7QUFoYUg7O0FBQUE7QUFBQTs7QUFtYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBcEYsSUFBSSxDQUFDc0YsU0FBTCxHQUFpQnRGLElBQUksQ0FBQ3NGLFNBQUwsSUFBa0I7QUFDakNDLEVBQUFBLElBQUksRUFBRSxJQUQyQjtBQUVqQ0MsRUFBQUEsR0FBRyxFQUFFLElBRjRCO0FBR2pDQyxFQUFBQSxZQUFZLEVBQUU7QUFIbUIsQ0FBbkM7QUFNQSxJQUFNQyxJQUFJLEdBQUcxRixJQUFJLENBQUNzRixTQUFsQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJSyxjQUFjLEdBQUcsSUFBckI7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQyxrQkFBVCxHQUE4QjtBQUNuQ0QsRUFBQUEsY0FBYyxHQUFHekUsR0FBakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FzRSxFQUFBQSxHQUFHO0FBQ0hELEVBQUFBLElBQUk7QUFDTDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNNLDZCQUFULEdBQXlDO0FBQzlDRixFQUFBQSxjQUFjLEdBQUcsSUFBakI7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNKLElBQVQsQ0FBY08sV0FBZCxFQUEyQjtBQUNoQyxNQUFJLENBQUNKLElBQUksQ0FBQ0gsSUFBVixFQUFnQjtBQUNkRyxJQUFBQSxJQUFJLENBQUNILElBQUwsR0FBWVEsYUFBYSxDQUFDcEgsbUJBQUQsQ0FBekI7QUFDRDs7QUFDRCxNQUFJLENBQUNxSCxXQUFXLENBQUNOLElBQUksQ0FBQ0gsSUFBTCxDQUFVcEUsR0FBWCxFQUFnQjJFLFdBQWhCLENBQWhCLEVBQThDO0FBQzVDLFdBQU9KLElBQUksQ0FBQ0gsSUFBWjtBQUNELEdBRkQsTUFFTztBQUNMLFFBQUlHLElBQUksQ0FBQ0QsWUFBVCxFQUF1QjtBQUNyQixhQUFPQyxJQUFJLENBQUNELFlBQVo7QUFDRDs7QUFDRCxXQUFRQyxJQUFJLENBQUNELFlBQUwsR0FBb0JNLGFBQWEsQ0FBQzNHLHlCQUFELENBQXpDO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzJHLGFBQVQsQ0FBdUJFLE1BQXZCLEVBQStCO0FBQzdCLE1BQUksQ0FBQ04sY0FBTCxFQUFxQjtBQUNuQixVQUFNLElBQUlPLEtBQUosQ0FBVSxtQ0FBVixDQUFOO0FBQ0Q7O0FBQ0QsU0FBTyxJQUFJUCxjQUFKLENBQ0wzRixJQURLLEVBRUwsVUFBQ21HLE1BQUQsRUFBU3RELFdBQVQsRUFBeUI7QUFDdkIsUUFBSUEsV0FBVyxJQUFJc0QsTUFBTSxJQUFJLENBQTdCLEVBQWdDO0FBQzlCLGFBQU8zRyxRQUFRLENBQUNLLElBQWhCO0FBQ0Q7O0FBQ0QsV0FBT0wsUUFBUSxDQUFDRyxJQUFoQjtBQUNELEdBUEksRUFRTHNHLE1BUkssQ0FBUDtBQVVEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU1QsR0FBVCxHQUFlO0FBQ3BCLE1BQUlFLElBQUksQ0FBQ0YsR0FBVCxFQUFjO0FBQ1osV0FBT0UsSUFBSSxDQUFDRixHQUFaO0FBQ0Q7O0FBQ0QsTUFBSSxDQUFDRyxjQUFMLEVBQXFCO0FBQ25CLFVBQU0sSUFBSU8sS0FBSixDQUFVLG1DQUFWLENBQU47QUFDRDs7QUFDRCxTQUFRUixJQUFJLENBQUNGLEdBQUwsR0FBVyxJQUFJRyxjQUFKLENBQW1CM0YsSUFBbkIsRUFBeUIsVUFBQ21HLE1BQUQsRUFBWTtBQUN0RCxRQUFJQSxNQUFNLElBQUksQ0FBZCxFQUFpQjtBQUNmLGFBQU8zRyxRQUFRLENBQUNLLElBQWhCO0FBQ0Q7O0FBQ0QsUUFBSXNHLE1BQU0sSUFBSSxDQUFkLEVBQWlCO0FBQ2YsYUFBTzNHLFFBQVEsQ0FBQ0ksSUFBaEI7QUFDRDs7QUFDRCxXQUFPSixRQUFRLENBQUNDLEdBQWhCO0FBQ0QsR0FSa0IsQ0FBbkI7QUFTRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTdUcsV0FBVCxDQUFxQjdFLEdBQXJCLEVBQTBCMkUsV0FBMUIsRUFBdUM7QUFDNUMsTUFBSSxDQUFDQSxXQUFMLEVBQWtCO0FBQ2hCLFdBQU8sS0FBUDtBQUNEOztBQUNELFNBQU9BLFdBQVcsQ0FBQ00sYUFBWixDQUEwQkMsV0FBMUIsSUFBeUNsRixHQUFoRDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNtRixTQUFULENBQ0xyQyxlQURLLEVBRUxDLFdBRkssRUFHTHFDLEtBSEssRUFJTEMsS0FKSyxFQUtMQyxLQUxLLEVBTUxDLEtBTkssRUFPTEMsS0FQSyxFQVFMQyxLQVJLLEVBU0xDLEtBVEssRUFVTEMsS0FWSyxFQVdMQyxLQVhLLEVBWUw7QUFDQSxNQUFJekksSUFBSSxDQUFDMEksVUFBTCxFQUFKLEVBQXVCO0FBQ3JCLFdBQU8vQyxlQUFQO0FBQ0Q7O0FBQ0QsTUFBSWpFLElBQUksQ0FBQ2lILHFCQUFULEVBQWdDO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0ExRSxJQUFBQTtBQUFRO0FBQUQsS0FDSkMsR0FESCxDQUNPLHdCQURQO0FBRUQ7O0FBRUQsU0FBT2dELEdBQUc7QUFBRztBQUFjbkQsRUFBQUEsTUFBcEIsQ0FDTDRCLGVBREssRUFFTEMsV0FGSyxFQUdMcUMsS0FISyxFQUlMQyxLQUpLLEVBS0xDLEtBTEssRUFNTEMsS0FOSyxFQU9MQyxLQVBLLEVBUUxDLEtBUkssRUFTTEMsS0FUSyxFQVVMQyxLQVZLLEVBV0xDLEtBWEssQ0FBUDtBQWFEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNHLFVBQVQsQ0FDTGpELGVBREssRUFFTEMsV0FGSyxFQUdMcUMsS0FISyxFQUlMQyxLQUpLLEVBS0xDLEtBTEssRUFNTEMsS0FOSyxFQU9MQyxLQVBLLEVBUUxDLEtBUkssRUFTTEMsS0FUSyxFQVVMQyxLQVZLLEVBV0xDLEtBWEssRUFZTDtBQUNBLFNBQU94QixJQUFJO0FBQUc7QUFBY2xELEVBQUFBLE1BQXJCLENBQ0w0QixlQURLLEVBRUxDLFdBRkssRUFHTHFDLEtBSEssRUFJTEMsS0FKSyxFQUtMQyxLQUxLLEVBTUxDLEtBTkssRUFPTEMsS0FQSyxFQVFMQyxLQVJLLEVBU0xDLEtBVEssRUFVTEMsS0FWSyxFQVdMQyxLQVhLLENBQVA7QUFhRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTUgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgKiBhcyBtb2RlIGZyb20gJyNjb3JlL21vZGUnO1xuXG5pbXBvcnQge3VybHN9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCAqIGFzIGFzc2VydGlvbnMgZnJvbSAnLi9jb3JlL2Fzc2VydC9iYXNlJztcbmltcG9ydCB7Y3JlYXRlRXJyb3JWYXJncywgZHVwbGljYXRlRXJyb3JJZk5lY2Vzc2FyeX0gZnJvbSAnLi9jb3JlL2Vycm9yJztcbmltcG9ydCB7XG4gIFVTRVJfRVJST1JfU0VOVElORUwsXG4gIGVsZW1lbnRTdHJpbmdPclBhc3NUaHJ1LFxuICBpc1VzZXJFcnJvck1lc3NhZ2UsXG4gIHN0cmlwVXNlckVycm9yLFxufSBmcm9tICcuL2NvcmUvZXJyb3IvbWVzc2FnZS1oZWxwZXJzJztcbmltcG9ydCB7aXNBcnJheX0gZnJvbSAnLi9jb3JlL3R5cGVzJztcbmltcG9ydCB7b25jZX0gZnJvbSAnLi9jb3JlL3R5cGVzL2Z1bmN0aW9uJztcbmltcG9ydCB7aW50ZXJuYWxSdW50aW1lVmVyc2lvbn0gZnJvbSAnLi9pbnRlcm5hbC12ZXJzaW9uJztcbmltcG9ydCB7Z2V0TW9kZX0gZnJvbSAnLi9tb2RlJztcblxuY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuXG4vLyBUaGVzZSBhcmUgZXhwb3J0ZWQgaGVyZSBkZXNwaXRlIGJlaW5nIGRlZmluZWQgaW4gY29yZSB0byBhdm9pZCB1cGRhdGluZ1xuLy8gaW1wb3J0cyBmb3Igbm93LlxuZXhwb3J0IHtVU0VSX0VSUk9SX1NFTlRJTkVMLCBpc1VzZXJFcnJvck1lc3NhZ2UsIHN0cmlwVXNlckVycm9yfTtcblxuLyoqXG4gKiBGb3VyIHplcm8gd2lkdGggc3BhY2UuXG4gKlxuICogQGNvbnN0IHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBVU0VSX0VSUk9SX0VNQkVEX1NFTlRJTkVMID0gJ1xcdTIwMEJcXHUyMDBCXFx1MjAwQlxcdTIwMEInO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIHRoaXMgbWVzc2FnZSB3YXMgYSBhIHVzZXIgZXJyb3IgZnJvbSBhbiBpZnJhbWUgZW1iZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1VzZXJFcnJvckVtYmVkKG1lc3NhZ2UpIHtcbiAgcmV0dXJuIG1lc3NhZ2UuaW5kZXhPZihVU0VSX0VSUk9SX0VNQkVEX1NFTlRJTkVMKSA+PSAwO1xufVxuXG4vKipcbiAqIEBlbnVtIHtudW1iZXJ9XG4gKi9cbmV4cG9ydCBjb25zdCBMb2dMZXZlbCA9IHtcbiAgT0ZGOiAwLFxuICBFUlJPUjogMSxcbiAgV0FSTjogMixcbiAgSU5GTzogMyxcbiAgRklORTogNCxcbn07XG5cbi8qKlxuICogU2V0cyByZXBvcnRFcnJvciBmdW5jdGlvbi4gQ2FsbGVkIGZyb20gZXJyb3ItcmVwb3J0aW5nLmpzIHRvIGJyZWFrIGN5Y2xpY1xuICogZGVwZW5kZW5jeS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24odGhpczpXaW5kb3csIEVycm9yLCAoP0VsZW1lbnQpPSk6ID98dW5kZWZpbmVkfSBmblxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0UmVwb3J0RXJyb3IoZm4pIHtcbiAgc2VsZi5fX0FNUF9SRVBPUlRfRVJST1IgPSBmbjtcbn1cblxuLyoqXG4gKiBAdHlwZSB7IUxvZ0xldmVsfHVuZGVmaW5lZH1cbiAqIEBwcml2YXRlXG4gKi9cbmxldCBsZXZlbE92ZXJyaWRlXyA9IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBAcGFyYW0geyFMb2dMZXZlbH0gbGV2ZWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG92ZXJyaWRlTG9nTGV2ZWwobGV2ZWwpIHtcbiAgbGV2ZWxPdmVycmlkZV8gPSBsZXZlbDtcbn1cblxuLyoqXG4gKiBQcmVmaXhlcyBgaW50ZXJuYWxSdW50aW1lVmVyc2lvbmAgd2l0aCB0aGUgYDAxYCBjaGFubmVsIHNpZ25pZmllciAoZm9yIHByb2QuKSBmb3JcbiAqIGV4dHJhY3RlZCBtZXNzYWdlIFVSTHMuXG4gKiAoU3BlY2lmaWMgY2hhbm5lbCBpcyBpcnJlbGV2YW50OiBtZXNzYWdlIHRhYmxlcyBhcmUgaW52YXJpYW50IG9uIGludGVybmFsIHZlcnNpb24uKVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5jb25zdCBtZXNzYWdlVXJsUnR2ID0gKCkgPT4gYDAxJHtpbnRlcm5hbFJ1bnRpbWVWZXJzaW9uKCl9YDtcblxuLyoqXG4gKiBHZXRzIGEgVVJMIHRvIGRpc3BsYXkgYSBtZXNzYWdlIG9uIGFtcC5kZXYuXG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqIEBwYXJhbSB7IUFycmF5fSBpbnRlcnBvbGF0ZWRQYXJ0c1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5jb25zdCBleHRlcm5hbE1lc3NhZ2VVcmwgPSAoaWQsIGludGVycG9sYXRlZFBhcnRzKSA9PlxuICBpbnRlcnBvbGF0ZWRQYXJ0cy5yZWR1Y2UoXG4gICAgKHByZWZpeCwgYXJnKSA9PiBgJHtwcmVmaXh9JnNbXT0ke21lc3NhZ2VBcmdUb0VuY29kZWRDb21wb25lbnQoYXJnKX1gLFxuICAgIGBodHRwczovL2xvZy5hbXAuZGV2Lz92PSR7bWVzc2FnZVVybFJ0digpfSZpZD0ke2VuY29kZVVSSUNvbXBvbmVudChpZCl9YFxuICApO1xuXG4vKipcbiAqIFVSTCB0byBzaW1wbGUgbG9nIG1lc3NhZ2VzIHRhYmxlIEpTT04gZmlsZSwgd2hpY2ggY29udGFpbnMgYW4gT2JqZWN0PHN0cmluZywgc3RyaW5nPlxuICogd2hpY2ggbWFwcyBtZXNzYWdlIGlkIHRvIGZ1bGwgbWVzc2FnZSB0ZW1wbGF0ZS5cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuY29uc3QgZXh0ZXJuYWxNZXNzYWdlc1NpbXBsZVRhYmxlVXJsID0gKCkgPT5cbiAgYCR7dXJscy5jZG59L3J0di8ke21lc3NhZ2VVcmxSdHYoKX0vbG9nLW1lc3NhZ2VzLnNpbXBsZS5qc29uYDtcblxuLyoqXG4gKiBAcGFyYW0geyp9IGFyZ1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5jb25zdCBtZXNzYWdlQXJnVG9FbmNvZGVkQ29tcG9uZW50ID0gKGFyZykgPT5cbiAgZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhlbGVtZW50U3RyaW5nT3JQYXNzVGhydShhcmcpKSk7XG5cbi8qKlxuICogTG9nZ2luZyBjbGFzcy4gVXNlIG9mIHNlbnRpbmVsIHN0cmluZyBpbnN0ZWFkIG9mIGEgYm9vbGVhbiB0byBjaGVjayB1c2VyL2RldlxuICogZXJyb3JzIGJlY2F1c2UgZXJyb3JzIGNvdWxkIGJlIHJldGhyb3duIGJ5IHNvbWUgbmF0aXZlIGNvZGUgYXMgYSBuZXcgZXJyb3IsXG4gKiBhbmQgb25seSBhIG1lc3NhZ2Ugd291bGQgc3Vydml2ZS4gQWxzbywgc29tZSBicm93c2VyIGRvbuKAmXQgc3VwcG9ydCBhIDV0aFxuICogZXJyb3Igb2JqZWN0IGFyZ3VtZW50IGluIHdpbmRvdy5vbmVycm9yLiBMaXN0IG9mIHN1cHBvcnRpbmcgYnJvd3NlciBjYW4gYmVcbiAqIGZvdW5kIGhlcmU6XG4gKiBodHRwczovL2Jsb2cuc2VudHJ5LmlvLzIwMTYvMDEvMDQvY2xpZW50LWphdmFzY3JpcHQtcmVwb3J0aW5nLXdpbmRvdy1vbmVycm9yLmh0bWxcbiAqIEBmaW5hbFxuICogQHByaXZhdGUgVmlzaWJsZSBmb3IgdGVzdGluZyBvbmx5LlxuICovXG5leHBvcnQgY2xhc3MgTG9nIHtcbiAgLyoqXG4gICAqIG9wdF9zdWZmaXggd2lsbCBiZSBhcHBlbmRlZCB0byBlcnJvciBtZXNzYWdlIHRvIGlkZW50aWZ5IHRoZSB0eXBlIG9mIHRoZVxuICAgKiBlcnJvciBtZXNzYWdlLiBXZSBjYW4ndCByZWx5IG9uIHRoZSBlcnJvciBvYmplY3QgdG8gcGFzcyBhbG9uZyB0aGUgdHlwZVxuICAgKiBiZWNhdXNlIHNvbWUgYnJvd3NlcnMgZG8gbm90IGhhdmUgdGhpcyBwYXJhbSBpbiBpdHMgd2luZG93Lm9uZXJyb3IgQVBJLlxuICAgKiBTZWU6XG4gICAqIGh0dHBzOi8vYmxvZy5zZW50cnkuaW8vMjAxNi8wMS8wNC9jbGllbnQtamF2YXNjcmlwdC1yZXBvcnRpbmctd2luZG93LW9uZXJyb3IuaHRtbFxuICAgKlxuICAgKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKG51bWJlciwgYm9vbGVhbik6IUxvZ0xldmVsfSBsZXZlbEZ1bmNcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfc3VmZml4XG4gICAqL1xuICBjb25zdHJ1Y3Rvcih3aW4sIGxldmVsRnVuYywgb3B0X3N1ZmZpeCA9ICcnKSB7XG4gICAgLyoqXG4gICAgICogSW4gdGVzdHMgd2UgdXNlIHRoZSBtYWluIHRlc3Qgd2luZG93IGluc3RlYWQgb2YgdGhlIGlmcmFtZSB3aGVyZVxuICAgICAqIHRoZSB0ZXN0cyBydW5zIGJlY2F1c2Ugb25seSB0aGUgZm9ybWVyIGlzIHJlbGF5ZWQgdG8gdGhlIGNvbnNvbGUuXG4gICAgICogQGNvbnN0IHshV2luZG93fVxuICAgICAqL1xuICAgIHRoaXMud2luID0gZ2V0TW9kZSgpLnRlc3QgJiYgd2luLl9fQU1QX1RFU1RfSUZSQU1FID8gd2luLnBhcmVudCA6IHdpbjtcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3Qge2Z1bmN0aW9uKG51bWJlciwgYm9vbGVhbik6IUxvZ0xldmVsfSAqL1xuICAgIHRoaXMubGV2ZWxGdW5jXyA9IGxldmVsRnVuYztcblxuICAgIC8qKiBAcHJpdmF0ZSBAY29uc3QgeyFMb2dMZXZlbH0gKi9cbiAgICB0aGlzLmxldmVsXyA9IHRoaXMuZGVmYXVsdExldmVsXygpO1xuXG4gICAgLyoqIEBwcml2YXRlIEBjb25zdCB7c3RyaW5nfSAqL1xuICAgIHRoaXMuc3VmZml4XyA9IG9wdF9zdWZmaXg7XG5cbiAgICAvKiogQHByaXZhdGUgez9Kc29uT2JqZWN0fSAqL1xuICAgIHRoaXMubWVzc2FnZXNfID0gbnVsbDtcblxuICAgIHRoaXMuZmV0Y2hFeHRlcm5hbE1lc3NhZ2VzT25jZV8gPSBvbmNlKCgpID0+IHtcbiAgICAgIHdpblxuICAgICAgICAuZmV0Y2goZXh0ZXJuYWxNZXNzYWdlc1NpbXBsZVRhYmxlVXJsKCkpXG4gICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpLCBub29wKVxuICAgICAgICAudGhlbigob3B0X21lc3NhZ2VzKSA9PiB7XG4gICAgICAgICAgaWYgKG9wdF9tZXNzYWdlcykge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlc18gPSAvKiogQHR5cGUgeyFKc29uT2JqZWN0fSAqLyAob3B0X21lc3NhZ2VzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gVGhpcyBib3VuZCBhc3NlcnRpb24gZnVuY3Rpb24gaXMgY2FwYWJsZSBvZiBoYW5kbGluZyB0aGUgZm9ybWF0IHVzZWQgd2hlblxuICAgIC8vIGVycm9yL2Fzc2VydGlvbiBtZXNzYWdlcyBhcmUgZXh0cmFjdGVkLiBUaGlzIGxvZ2ljIGhhc24ndCB5ZXQgYmVlblxuICAgIC8vIG1pZ3JhdGVkIHRvIGFuIEFNUC1pbmRlcGVuZGVudCBmb3JtIGZvciB1c2UgaW4gY29yZS4gVGhpcyBiaW5kaW5nIGFsbG93c1xuICAgIC8vIExvZyBhc3NlcnRpb24gaGVscGVycyB0byBtYWludGFpbiBtZXNzYWdlLWV4dHJhY3Rpb24gY2FwYWJpbGl0aWVzIHVudGlsXG4gICAgLy8gdGhhdCBsb2dpYyBjYW4gYmUgbW92ZWQgdG8gY29yZS5cbiAgICB0aGlzLmJvdW5kQXNzZXJ0Rm5fID0gLyoqIEB0eXBlIHshYXNzZXJ0aW9ucy5Bc3NlcnRpb25GdW5jdGlvbkRlZn0gKi8gKFxuICAgICAgdGhpcy5hc3NlcnQuYmluZCh0aGlzKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IUxvZ0xldmVsfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0TGV2ZWxfKCkge1xuICAgIHJldHVybiBsZXZlbE92ZXJyaWRlXyAhPT0gdW5kZWZpbmVkID8gbGV2ZWxPdmVycmlkZV8gOiB0aGlzLmxldmVsXztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHshTG9nTGV2ZWx9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWZhdWx0TGV2ZWxfKCkge1xuICAgIC8vIE5vIGNvbnNvbGUgLSBjYW4ndCBlbmFibGUgbG9nZ2luZy5cbiAgICBpZiAoIXRoaXMud2luLmNvbnNvbGUgfHwgIXRoaXMud2luLmNvbnNvbGUubG9nKSB7XG4gICAgICByZXR1cm4gTG9nTGV2ZWwuT0ZGO1xuICAgIH1cblxuICAgIC8vIExvZ2dpbmcgaGFzIGJlZW4gZXhwbGljaXRseSBkaXNhYmxlZC5cbiAgICBpZiAoZ2V0TW9kZSgpLmxvZyA9PSAnMCcpIHtcbiAgICAgIHJldHVybiBMb2dMZXZlbC5PRkY7XG4gICAgfVxuXG4gICAgLy8gTG9nZ2luZyBpcyBlbmFibGVkIGZvciB0ZXN0cyBkaXJlY3RseS5cbiAgICBpZiAoZ2V0TW9kZSgpLnRlc3QgJiYgdGhpcy53aW4uRU5BQkxFX0xPRykge1xuICAgICAgcmV0dXJuIExvZ0xldmVsLkZJTkU7XG4gICAgfVxuXG4gICAgLy8gTG9jYWxEZXYgYnkgZGVmYXVsdCBhbGxvd3MgSU5GTyBsZXZlbCwgdW5sZXNzIG92ZXJyaWRlbiBieSBgI2xvZ2AuXG4gICAgaWYgKGdldE1vZGUoKS5sb2NhbERldiAmJiAhZ2V0TW9kZSgpLmxvZykge1xuICAgICAgcmV0dXJuIExvZ0xldmVsLklORk87XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZGVmYXVsdExldmVsV2l0aEZ1bmNfKCk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB7IUxvZ0xldmVsfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZGVmYXVsdExldmVsV2l0aEZ1bmNfKCkge1xuICAgIC8vIERlbGVnYXRlIHRvIHRoZSBzcGVjaWZpYyByZXNvbHZlci5cbiAgICByZXR1cm4gdGhpcy5sZXZlbEZ1bmNfKHBhcnNlSW50KGdldE1vZGUoKS5sb2csIDEwKSwgZ2V0TW9kZSgpLmRldmVsb3BtZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnXG4gICAqIEBwYXJhbSB7IUxvZ0xldmVsfSBsZXZlbFxuICAgKiBAcGFyYW0geyFBcnJheX0gbWVzc2FnZXNcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBhIG1lc3NhZ2Ugd2FzIGxvZ2dlZFxuICAgKi9cbiAgbXNnXyh0YWcsIGxldmVsLCBtZXNzYWdlcykge1xuICAgIGlmICh0aGlzLmdldExldmVsXygpIDwgbGV2ZWwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbGV0IGZuID0gdGhpcy53aW4uY29uc29sZS5sb2c7XG4gICAgaWYgKGxldmVsID09IExvZ0xldmVsLkVSUk9SKSB7XG4gICAgICBmbiA9IHRoaXMud2luLmNvbnNvbGUuZXJyb3IgfHwgZm47XG4gICAgfSBlbHNlIGlmIChsZXZlbCA9PSBMb2dMZXZlbC5JTkZPKSB7XG4gICAgICBmbiA9IHRoaXMud2luLmNvbnNvbGUuaW5mbyB8fCBmbjtcbiAgICB9IGVsc2UgaWYgKGxldmVsID09IExvZ0xldmVsLldBUk4pIHtcbiAgICAgIGZuID0gdGhpcy53aW4uY29uc29sZS53YXJuIHx8IGZuO1xuICAgIH1cbiAgICBjb25zdCBhcmdzID0gdGhpcy5tYXliZUV4cGFuZE1lc3NhZ2VBcmdzXyhtZXNzYWdlcyk7XG4gICAgLy8gUHJlZml4IGNvbnNvbGUgbWVzc2FnZSB3aXRoIFwiW3RhZ11cIi5cbiAgICBjb25zdCBwcmVmaXggPSBgWyR7dGFnfV1gO1xuICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIFByZXBlbmQgc3RyaW5nIHRvIGF2b2lkIGJyZWFraW5nIHN0cmluZyBzdWJzdGl0dXRpb25zIGUuZy4gJXMuXG4gICAgICBhcmdzWzBdID0gcHJlZml4ICsgJyAnICsgYXJnc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXJncy51bnNoaWZ0KHByZWZpeCk7XG4gICAgfVxuICAgIGZuLmFwcGx5KHRoaXMud2luLmNvbnNvbGUsIGFyZ3MpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGxvZ2dpbmcgaXMgZW5hYmxlZC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRW5hYmxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMZXZlbF8oKSAhPSBMb2dMZXZlbC5PRkY7XG4gIH1cblxuICAvKipcbiAgICogUmVwb3J0cyBhIGZpbmUtZ3JhaW5lZCBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnXG4gICAqIEBwYXJhbSB7Li4uKn0gYXJnc1xuICAgKi9cbiAgZmluZSh0YWcsIC4uLmFyZ3MpIHtcbiAgICB0aGlzLm1zZ18odGFnLCBMb2dMZXZlbC5GSU5FLCBhcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIGEgaW5mb3JtYXRpb25hbCBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnXG4gICAqIEBwYXJhbSB7Li4uKn0gYXJnc1xuICAgKi9cbiAgaW5mbyh0YWcsIC4uLmFyZ3MpIHtcbiAgICB0aGlzLm1zZ18odGFnLCBMb2dMZXZlbC5JTkZPLCBhcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIGEgd2FybmluZyBtZXNzYWdlLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnXG4gICAqIEBwYXJhbSB7Li4uKn0gYXJnc1xuICAgKi9cbiAgd2Fybih0YWcsIC4uLmFyZ3MpIHtcbiAgICB0aGlzLm1zZ18odGFnLCBMb2dMZXZlbC5XQVJOLCBhcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIGFuIGVycm9yIG1lc3NhZ2UuIElmIHRoZSBsb2dnaW5nIGlzIGRpc2FibGVkLCB0aGUgZXJyb3IgaXMgcmV0aHJvd25cbiAgICogYXN5bmNocm9ub3VzbHkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWdcbiAgICogQHBhcmFtIHsuLi4qfSBhcmdzXG4gICAqIEByZXR1cm4geyFFcnJvcnx1bmRlZmluZWR9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlcnJvcl8odGFnLCAuLi5hcmdzKSB7XG4gICAgaWYgKCF0aGlzLm1zZ18odGFnLCBMb2dMZXZlbC5FUlJPUiwgYXJncykpIHtcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUVycm9yLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBvcnRzIGFuIGVycm9yIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0YWdcbiAgICogQHBhcmFtIHsuLi4qfSB2YXJfYXJnc1xuICAgKi9cbiAgZXJyb3IodGFnLCB2YXJfYXJncykge1xuICAgIGNvbnN0IGVycm9yID0gdGhpcy5lcnJvcl8uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIC8vIFRPRE8ocmNlYnVsa28pOiBEZXRlcm1pbmUgaWYvaG93IHRoaXMgRXJyb3IjbmFtZSBwcm9wZXJ0eSBpcyB1c2VkLlxuICAgICAgZXJyb3IubmFtZSA9IHRhZyB8fCBlcnJvci5uYW1lO1xuICAgICAgLy8gX19BTVBfUkVQT1JUX0VSUk9SIGlzIGluc3RhbGxlZCBnbG9iYWxseSBwZXIgd2luZG93IGluIHRoZSBlbnRyeSBwb2ludC5cbiAgICAgIHNlbGYuX19BTVBfUkVQT1JUX0VSUk9SKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVwb3J0cyBhbiBlcnJvciBtZXNzYWdlIGFuZCBtYXJrcyB3aXRoIGFuIGV4cGVjdGVkIHByb3BlcnR5LiBJZiB0aGVcbiAgICogbG9nZ2luZyBpcyBkaXNhYmxlZCwgdGhlIGVycm9yIGlzIHJldGhyb3duIGFzeW5jaHJvbm91c2x5LlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdW51c2VkVGFnXG4gICAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3NcbiAgICovXG4gIGV4cGVjdGVkRXJyb3IodW51c2VkVGFnLCB2YXJfYXJncykge1xuICAgIGNvbnN0IGVycm9yID0gdGhpcy5lcnJvcl8uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIGVycm9yLmV4cGVjdGVkID0gdHJ1ZTtcbiAgICAgIC8vIF9fQU1QX1JFUE9SVF9FUlJPUiBpcyBpbnN0YWxsZWQgZ2xvYmFsbHkgcGVyIHdpbmRvdyBpbiB0aGUgZW50cnkgcG9pbnQuXG4gICAgICBzZWxmLl9fQU1QX1JFUE9SVF9FUlJPUihlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gZXJyb3Igb2JqZWN0LlxuICAgKiBAcGFyYW0gey4uLip9IHZhcl9hcmdzXG4gICAqIEByZXR1cm4geyFFcnJvcn1cbiAgICovXG4gIGNyZWF0ZUVycm9yKHZhcl9hcmdzKSB7XG4gICAgY29uc3QgZXJyb3IgPSBjcmVhdGVFcnJvclZhcmdzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5wcmVwYXJlRXJyb3JfKGVycm9yKTtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBlcnJvciBvYmplY3Qgd2l0aCBpdHMgZXhwZWN0ZWQgcHJvcGVydHkgc2V0IHRvIHRydWUuXG4gICAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3NcbiAgICogQHJldHVybiB7IUVycm9yfVxuICAgKi9cbiAgY3JlYXRlRXhwZWN0ZWRFcnJvcih2YXJfYXJncykge1xuICAgIGNvbnN0IGVycm9yID0gY3JlYXRlRXJyb3JWYXJncy5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIHRoaXMucHJlcGFyZUVycm9yXyhlcnJvcik7XG4gICAgZXJyb3IuZXhwZWN0ZWQgPSB0cnVlO1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIGZpcnN0IGFyZ3VtZW50IGlzbid0IHRydWVpc2guXG4gICAqXG4gICAqIFN1cHBvcnRzIGFyZ3VtZW50IHN1YnN0aXR1dGlvbiBpbnRvIHRoZSBtZXNzYWdlIHZpYSAlcyBwbGFjZWhvbGRlcnMuXG4gICAqXG4gICAqIFRocm93cyBhbiBlcnJvciBvYmplY3QgdGhhdCBoYXMgdHdvIGV4dHJhIHByb3BlcnRpZXM6XG4gICAqIC0gYXNzb2NpYXRlZEVsZW1lbnQ6IFRoaXMgaXMgdGhlIGZpcnN0IGVsZW1lbnQgcHJvdmlkZWQgaW4gdGhlIHZhciBhcmdzLlxuICAgKiAgIEl0IGNhbiBiZSB1c2VkIGZvciBpbXByb3ZlZCBkaXNwbGF5IG9mIGVycm9yIG1lc3NhZ2VzLlxuICAgKiAtIG1lc3NhZ2VBcnJheTogVGhlIGVsZW1lbnRzIG9mIHRoZSBzdWJzdGl0dXRlZCBtZXNzYWdlIGFzIG5vbi1zdHJpbmdpZmllZFxuICAgKiAgIGVsZW1lbnRzIGluIGFuIGFycmF5LiBXaGVuIGUuZy4gcGFzc2VkIHRvIGNvbnNvbGUuZXJyb3IgdGhpcyB5aWVsZHNcbiAgICogICBuYXRpdmUgZGlzcGxheXMgb2YgdGhpbmdzIGxpa2UgSFRNTCBlbGVtZW50cy5cbiAgICpcbiAgICogQHBhcmFtIHtUfSBzaG91bGRCZVRydWVpc2ggVGhlIHZhbHVlIHRvIGFzc2VydC4gVGhlIGFzc2VydCBmYWlscyBpZiBpdCBkb2VzXG4gICAqICAgICBub3QgZXZhbHVhdGUgdG8gdHJ1ZS5cbiAgICogQHBhcmFtIHshQXJyYXl8c3RyaW5nPX0gb3B0X21lc3NhZ2UgVGhlIGFzc2VydGlvbiBtZXNzYWdlXG4gICAqIEBwYXJhbSB7Li4uKn0gdmFyX2FyZ3MgQXJndW1lbnRzIHN1YnN0aXR1dGVkIGludG8gJXMgaW4gdGhlIG1lc3NhZ2UuXG4gICAqIEByZXR1cm4ge1R9IFRoZSB2YWx1ZSBvZiBzaG91bGRCZVRydWVpc2guXG4gICAqIEB0aHJvd3MgeyFFcnJvcn0gV2hlbiBgdmFsdWVgIGlzIGZhbHNleS5cbiAgICogQHRlbXBsYXRlIFRcbiAgICogQGNsb3N1cmVQcmltaXRpdmUge2Fzc2VydHMudHJ1dGh5fVxuICAgKi9cbiAgYXNzZXJ0KHNob3VsZEJlVHJ1ZWlzaCwgb3B0X21lc3NhZ2UsIHZhcl9hcmdzKSB7XG4gICAgaWYgKGlzQXJyYXkob3B0X21lc3NhZ2UpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hc3NlcnQuYXBwbHkoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIFtzaG91bGRCZVRydWVpc2hdLmNvbmNhdChcbiAgICAgICAgICB0aGlzLmV4cGFuZE1lc3NhZ2VBcmdzXygvKiogQHR5cGUgeyFBcnJheX0gKi8gKG9wdF9tZXNzYWdlKSlcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXNzZXJ0aW9ucy5hc3NlcnQuYXBwbHkoXG4gICAgICBudWxsLFxuICAgICAgW3RoaXMuc3VmZml4X10uY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIGZpcnN0IGFyZ3VtZW50IGlzbid0IGFuIEVsZW1lbnRcbiAgICpcbiAgICogT3RoZXJ3aXNlIHNlZSBgYXNzZXJ0YCBmb3IgdXNhZ2VcbiAgICpcbiAgICogQHBhcmFtIHsqfSBzaG91bGRCZUVsZW1lbnRcbiAgICogQHBhcmFtIHshQXJyYXl8c3RyaW5nPX0gb3B0X21lc3NhZ2UgVGhlIGFzc2VydGlvbiBtZXNzYWdlXG4gICAqIEByZXR1cm4geyFFbGVtZW50fSBUaGUgdmFsdWUgb2Ygc2hvdWxkQmVUcnVlaXNoLlxuICAgKiBAY2xvc3VyZVByaW1pdGl2ZSB7YXNzZXJ0cy5tYXRjaGVzUmV0dXJufVxuICAgKi9cbiAgYXNzZXJ0RWxlbWVudChzaG91bGRCZUVsZW1lbnQsIG9wdF9tZXNzYWdlKSB7XG4gICAgcmV0dXJuIGFzc2VydGlvbnMuYXNzZXJ0RWxlbWVudChcbiAgICAgIHRoaXMuYm91bmRBc3NlcnRGbl8sXG4gICAgICBzaG91bGRCZUVsZW1lbnQsXG4gICAgICBvcHRfbWVzc2FnZVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBmaXJzdCBhcmd1bWVudCBpc24ndCBhIHN0cmluZy4gVGhlIHN0cmluZyBjYW5cbiAgICogYmUgZW1wdHkuXG4gICAqXG4gICAqIEZvciBtb3JlIGRldGFpbHMgc2VlIGBhc3NlcnRgLlxuICAgKlxuICAgKiBAcGFyYW0geyp9IHNob3VsZEJlU3RyaW5nXG4gICAqIEBwYXJhbSB7IUFycmF5fHN0cmluZz19IG9wdF9tZXNzYWdlIFRoZSBhc3NlcnRpb24gbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzdHJpbmcgdmFsdWUuIENhbiBiZSBhbiBlbXB0eSBzdHJpbmcuXG4gICAqIEBjbG9zdXJlUHJpbWl0aXZlIHthc3NlcnRzLm1hdGNoZXNSZXR1cm59XG4gICAqL1xuICBhc3NlcnRTdHJpbmcoc2hvdWxkQmVTdHJpbmcsIG9wdF9tZXNzYWdlKSB7XG4gICAgcmV0dXJuIGFzc2VydGlvbnMuYXNzZXJ0U3RyaW5nKFxuICAgICAgdGhpcy5ib3VuZEFzc2VydEZuXyxcbiAgICAgIHNob3VsZEJlU3RyaW5nLFxuICAgICAgb3B0X21lc3NhZ2VcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRocm93cyBhbiBlcnJvciBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaXNuJ3QgYSBudW1iZXIuIFRoZSBhbGxvd2VkIHZhbHVlc1xuICAgKiBpbmNsdWRlIGAwYCBhbmQgYE5hTmAuXG4gICAqXG4gICAqIEZvciBtb3JlIGRldGFpbHMgc2VlIGBhc3NlcnRgLlxuICAgKlxuICAgKiBAcGFyYW0geyp9IHNob3VsZEJlTnVtYmVyXG4gICAqIEBwYXJhbSB7IUFycmF5fHN0cmluZz19IG9wdF9tZXNzYWdlIFRoZSBhc3NlcnRpb24gbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBudW1iZXIgdmFsdWUuIFRoZSBhbGxvd2VkIHZhbHVlcyBpbmNsdWRlIGAwYFxuICAgKiAgIGFuZCBgTmFOYC5cbiAgICogQGNsb3N1cmVQcmltaXRpdmUge2Fzc2VydHMubWF0Y2hlc1JldHVybn1cbiAgICovXG4gIGFzc2VydE51bWJlcihzaG91bGRCZU51bWJlciwgb3B0X21lc3NhZ2UpIHtcbiAgICByZXR1cm4gYXNzZXJ0aW9ucy5hc3NlcnROdW1iZXIoXG4gICAgICB0aGlzLmJvdW5kQXNzZXJ0Rm5fLFxuICAgICAgc2hvdWxkQmVOdW1iZXIsXG4gICAgICBvcHRfbWVzc2FnZVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBmaXJzdCBhcmd1bWVudCBpcyBub3QgYW4gYXJyYXkuXG4gICAqIFRoZSBhcnJheSBjYW4gYmUgZW1wdHkuXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gc2hvdWxkQmVBcnJheVxuICAgKiBAcGFyYW0geyFBcnJheXxzdHJpbmc9fSBvcHRfbWVzc2FnZSBUaGUgYXNzZXJ0aW9uIG1lc3NhZ2VcbiAgICogQHJldHVybiB7IUFycmF5fSBUaGUgYXJyYXkgdmFsdWVcbiAgICogQGNsb3N1cmVQcmltaXRpdmUge2Fzc2VydHMubWF0Y2hlc1JldHVybn1cbiAgICovXG4gIGFzc2VydEFycmF5KHNob3VsZEJlQXJyYXksIG9wdF9tZXNzYWdlKSB7XG4gICAgcmV0dXJuIGFzc2VydGlvbnMuYXNzZXJ0QXJyYXkoXG4gICAgICB0aGlzLmJvdW5kQXNzZXJ0Rm5fLFxuICAgICAgc2hvdWxkQmVBcnJheSxcbiAgICAgIG9wdF9tZXNzYWdlXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIGZpcnN0IGFyZ3VtZW50IGlzbid0IGEgYm9vbGVhbi5cbiAgICpcbiAgICogRm9yIG1vcmUgZGV0YWlscyBzZWUgYGFzc2VydGAuXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gc2hvdWxkQmVCb29sZWFuXG4gICAqIEBwYXJhbSB7IUFycmF5fHN0cmluZz19IG9wdF9tZXNzYWdlIFRoZSBhc3NlcnRpb24gbWVzc2FnZVxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUaGUgYm9vbGVhbiB2YWx1ZS5cbiAgICogQGNsb3N1cmVQcmltaXRpdmUge2Fzc2VydHMubWF0Y2hlc1JldHVybn1cbiAgICovXG4gIGFzc2VydEJvb2xlYW4oc2hvdWxkQmVCb29sZWFuLCBvcHRfbWVzc2FnZSkge1xuICAgIHJldHVybiBhc3NlcnRpb25zLmFzc2VydEJvb2xlYW4oXG4gICAgICB0aGlzLmJvdW5kQXNzZXJ0Rm5fLFxuICAgICAgc2hvdWxkQmVCb29sZWFuLFxuICAgICAgb3B0X21lc3NhZ2VcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IUVycm9yfSBlcnJvclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJlcGFyZUVycm9yXyhlcnJvcikge1xuICAgIGVycm9yID0gZHVwbGljYXRlRXJyb3JJZk5lY2Vzc2FyeShlcnJvcik7XG5cbiAgICBpZiAodGhpcy5zdWZmaXhfKSB7XG4gICAgICBpZiAoIWVycm9yLm1lc3NhZ2UpIHtcbiAgICAgICAgZXJyb3IubWVzc2FnZSA9IHRoaXMuc3VmZml4XztcbiAgICAgIH0gZWxzZSBpZiAoZXJyb3IubWVzc2FnZS5pbmRleE9mKHRoaXMuc3VmZml4XykgPT0gLTEpIHtcbiAgICAgICAgZXJyb3IubWVzc2FnZSArPSB0aGlzLnN1ZmZpeF87XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1VzZXJFcnJvck1lc3NhZ2UoZXJyb3IubWVzc2FnZSkpIHtcbiAgICAgIGVycm9yLm1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlLnJlcGxhY2UoVVNFUl9FUlJPUl9TRU5USU5FTCwgJycpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFBcnJheX0gYXJnc1xuICAgKiBAcmV0dXJuIHshQXJyYXl9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBtYXliZUV4cGFuZE1lc3NhZ2VBcmdzXyhhcmdzKSB7XG4gICAgaWYgKGlzQXJyYXkoYXJnc1swXSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4cGFuZE1lc3NhZ2VBcmdzXygvKiogQHR5cGUgeyFBcnJheX0gKi8gKGFyZ3NbMF0pKTtcbiAgICB9XG4gICAgcmV0dXJuIGFyZ3M7XG4gIH1cblxuICAvKipcbiAgICogRWl0aGVyIHJlZGlyZWN0cyBhIHBhaXIgb2YgKGVycm9ySWQsIC4uLmFyZ3MpIHRvIGEgVVJMIHdoZXJlIHRoZSBmdWxsXG4gICAqIG1lc3NhZ2UgaXMgZGlzcGxheWVkLCBvciBkaXNwbGF5cyBpdCBmcm9tIGEgZmV0Y2hlZCB0YWJsZS5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgdXNlZCBieSB0aGUgb3V0cHV0IG9mIHRoZSBgdHJhbnNmb3JtLWxvZy1tZXRob2RzYCBiYWJlbFxuICAgKiBwbHVnaW4uIEl0IHNob3VsZCBub3QgYmUgdXNlZCBkaXJlY3RseS4gVXNlIHRoZSAoKmVycm9yfGFzc2VydCp8aW5mb3x3YXJuKVxuICAgKiBtZXRob2RzIGluc3RlYWQuXG4gICAqXG4gICAqIEBwYXJhbSB7IUFycmF5fSBwYXJ0c1xuICAgKiBAcmV0dXJuIHshQXJyYXl9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBleHBhbmRNZXNzYWdlQXJnc18ocGFydHMpIHtcbiAgICAvLyBGaXJzdCB2YWx1ZSBzaG91bGQgZXhpc3QuXG4gICAgY29uc3QgaWQgPSBwYXJ0cy5zaGlmdCgpO1xuICAgIC8vIEJlc3QgZWZmb3J0IGZldGNoIG9mIG1lc3NhZ2UgdGVtcGxhdGUgdGFibGUuXG4gICAgLy8gU2luY2UgdGhpcyBpcyBhc3luYywgdGhlIGZpcnN0IGZldyBsb2dzIG1pZ2h0IGJlIGluZGlyZWN0ZWQgdG8gYSBVUkwgZXZlblxuICAgIC8vIGlmIGluIGRldmVsb3BtZW50IG1vZGUuIE1lc3NhZ2UgdGFibGUgaXMgfnNtYWxsIHNvIHRoaXMgc2hvdWxkIGJlIGEgc2hvcnRcbiAgICAvLyBnYXAuXG4gICAgaWYgKGdldE1vZGUodGhpcy53aW4pLmRldmVsb3BtZW50KSB7XG4gICAgICB0aGlzLmZldGNoRXh0ZXJuYWxNZXNzYWdlc09uY2VfKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLm1lc3NhZ2VzXyAmJiBpZCBpbiB0aGlzLm1lc3NhZ2VzXykge1xuICAgICAgcmV0dXJuIFt0aGlzLm1lc3NhZ2VzX1tpZF1dLmNvbmNhdChwYXJ0cyk7XG4gICAgfVxuICAgIHJldHVybiBbYE1vcmUgaW5mbyBhdCAke2V4dGVybmFsTWVzc2FnZVVybChpZCwgcGFydHMpfWBdO1xuICB9XG59XG5cbi8qKlxuICogQ2FjaGUgZm9yIGxvZ3MuIFdlIGRvIG5vdCB1c2UgYSBTZXJ2aWNlIHNpbmNlIHRoZSBzZXJ2aWNlIG1vZHVsZSBkZXBlbmRzXG4gKiBvbiBMb2cgYW5kIGNsb3N1cmUgbGl0ZXJhbGx5IGNhbid0IGV2ZW4uXG4gKiBAdHlwZSB7e3VzZXI6ID9Mb2csIGRldjogP0xvZywgdXNlckZvckVtYmVkOiA/TG9nfX1cbiAqL1xuc2VsZi5fX0FNUF9MT0cgPSBzZWxmLl9fQU1QX0xPRyB8fCB7XG4gIHVzZXI6IG51bGwsXG4gIGRldjogbnVsbCxcbiAgdXNlckZvckVtYmVkOiBudWxsLFxufTtcblxuY29uc3QgbG9ncyA9IHNlbGYuX19BTVBfTE9HO1xuXG4vKipcbiAqIEV2ZW50dWFsbHkgaG9sZHMgYSBjb25zdHJ1Y3RvciBmb3IgTG9nIG9iamVjdHMuIExhemlseSBpbml0aWFsaXplZCwgc28gd2VcbiAqIGNhbiBhdm9pZCBldmVyIHJlZmVyZW5jaW5nIHRoZSByZWFsIGNvbnN0cnVjdG9yIGV4Y2VwdCBpbiBKUyBiaW5hcmllc1xuICogdGhhdCBhY3R1YWxseSB3YW50IHRvIGluY2x1ZGUgdGhlIGltcGxlbWVudGF0aW9uLlxuICogQHR5cGUgez90eXBlb2YgTG9nfVxuICovXG5sZXQgbG9nQ29uc3RydWN0b3IgPSBudWxsO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGxvZyBjb25zdHJ1Y3Rvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluaXRMb2dDb25zdHJ1Y3RvcigpIHtcbiAgbG9nQ29uc3RydWN0b3IgPSBMb2c7XG4gIC8vIEluaXRpYWxpemUgaW5zdGFuY2VzIGZvciB1c2UuIElmIGEgYmluYXJ5IChhbiBleHRlbnNpb24gZm9yIGV4YW1wbGUpIHRoYXRcbiAgLy8gZG9lcyBub3QgY2FsbCBgaW5pdExvZ0NvbnN0cnVjdG9yYCBpbnZva2VzIGBkZXYoKWAgb3IgYHVzZXIoKWAgZWFybGllciB0aGFuXG4gIC8vIHRoZSBiaW5hcnkgdGhhdCBkb2VzIGNhbGwgYGluaXRMb2dDb25zdHJ1Y3RvcmAgKGFtcC5qcyksIHRoZSBleHRlbnNpb24gd2lsbFxuICAvLyB0aHJvdyBhbiBlcnJvciBhcyB0aGF0IGV4dGVuc2lvbiB3aWxsIG5ldmVyIGJlIGFibGUgdG8gaW5pdGlhbGl6ZSB0aGUgbG9nXG4gIC8vIGluc3RhbmNlcyBhbmQgd2UgYWxzbyBkb24ndCB3YW50IGl0IHRvIGNhbGwgYGluaXRMb2dDb25zdHJ1Y3RvcmAgZWl0aGVyXG4gIC8vIChzaW5jZSB0aGF0IHdpbGwgY2F1c2UgdGhlIExvZyBpbXBsZW1lbnRhdGlvbiB0byBiZSBidW5kbGVkIGludG8gdGhhdFxuICAvLyBiaW5hcnkpLiBTbyB3ZSBtdXN0IGluaXRpYWxpemUgdGhlIGluc3RhbmNlcyBlYWdlcmx5IHNvIHRoYXQgdGhleSBhcmUgcmVhZHlcbiAgLy8gZm9yIHVzZSAoc3RvcmVkIGdsb2JhbGx5KSBhZnRlciB0aGUgbWFpbiBiaW5hcnkgY2FsbHMgYGluaXRMb2dDb25zdHJ1Y3RvcmAuXG4gIGRldigpO1xuICB1c2VyKCk7XG59XG5cbi8qKlxuICogUmVzZXRzIGxvZyBjb25zdHJ1Y3RvciBmb3IgdGVzdGluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0TG9nQ29uc3RydWN0b3JGb3JUZXN0aW5nKCkge1xuICBsb2dDb25zdHJ1Y3RvciA9IG51bGw7XG59XG5cbi8qKlxuICogUHVibGlzaGVyIGxldmVsIGxvZy5cbiAqXG4gKiBFbmFibGVkIGluIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqICAxLiBOb3QgZGlzYWJsZWQgdXNpbmcgYCNsb2c9MGAuXG4gKiAgMi4gRGV2ZWxvcG1lbnQgbW9kZSBpcyBlbmFibGVkIHZpYSBgI2RldmVsb3BtZW50PTFgIG9yIGxvZ2dpbmcgaXMgZXhwbGljaXRseVxuICogICAgIGVuYWJsZWQgdmlhIGAjbG9nPURgIHdoZXJlIEQgPj0gMS5cbiAqICAzLiBBTVAuc2V0TG9nTGV2ZWwoRCkgaXMgY2FsbGVkLCB3aGVyZSBEID49IDEuXG4gKlxuICogQHBhcmFtIHshRWxlbWVudD19IG9wdF9lbGVtZW50XG4gKiBAcmV0dXJuIHshTG9nfVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlcihvcHRfZWxlbWVudCkge1xuICBpZiAoIWxvZ3MudXNlcikge1xuICAgIGxvZ3MudXNlciA9IGdldFVzZXJMb2dnZXIoVVNFUl9FUlJPUl9TRU5USU5FTCk7XG4gIH1cbiAgaWYgKCFpc0Zyb21FbWJlZChsb2dzLnVzZXIud2luLCBvcHRfZWxlbWVudCkpIHtcbiAgICByZXR1cm4gbG9ncy51c2VyO1xuICB9IGVsc2Uge1xuICAgIGlmIChsb2dzLnVzZXJGb3JFbWJlZCkge1xuICAgICAgcmV0dXJuIGxvZ3MudXNlckZvckVtYmVkO1xuICAgIH1cbiAgICByZXR1cm4gKGxvZ3MudXNlckZvckVtYmVkID0gZ2V0VXNlckxvZ2dlcihVU0VSX0VSUk9SX0VNQkVEX1NFTlRJTkVMKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXR0ZXIgZm9yIHVzZXIgbG9nZ2VyXG4gKiBAcGFyYW0ge3N0cmluZz19IHN1ZmZpeFxuICogQHJldHVybiB7IUxvZ31cbiAqL1xuZnVuY3Rpb24gZ2V0VXNlckxvZ2dlcihzdWZmaXgpIHtcbiAgaWYgKCFsb2dDb25zdHJ1Y3Rvcikge1xuICAgIHRocm93IG5ldyBFcnJvcignZmFpbGVkIHRvIGNhbGwgaW5pdExvZ0NvbnN0cnVjdG9yJyk7XG4gIH1cbiAgcmV0dXJuIG5ldyBsb2dDb25zdHJ1Y3RvcihcbiAgICBzZWxmLFxuICAgIChsb2dOdW0sIGRldmVsb3BtZW50KSA9PiB7XG4gICAgICBpZiAoZGV2ZWxvcG1lbnQgfHwgbG9nTnVtID49IDEpIHtcbiAgICAgICAgcmV0dXJuIExvZ0xldmVsLkZJTkU7XG4gICAgICB9XG4gICAgICByZXR1cm4gTG9nTGV2ZWwuV0FSTjtcbiAgICB9LFxuICAgIHN1ZmZpeFxuICApO1xufVxuXG4vKipcbiAqIEFNUCBkZXZlbG9wbWVudCBsb2cuIENhbGxzIHRvIGBkZXZMb2coKS5hc3NlcnRgIGFuZCBgZGV2LmZpbmVgIGFyZSBzdHJpcHBlZFxuICogaW4gdGhlIFBST0QgYmluYXJ5LiBIb3dldmVyLCBgZGV2TG9nKCkuYXNzZXJ0YCByZXN1bHQgaXMgcHJlc2VydmVkIGluIGVpdGhlclxuICogY2FzZS5cbiAqXG4gKiBFbmFibGVkIGluIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqICAxLiBOb3QgZGlzYWJsZWQgdXNpbmcgYCNsb2c9MGAuXG4gKiAgMi4gTG9nZ2luZyBpcyBleHBsaWNpdGx5IGVuYWJsZWQgdmlhIGAjbG9nPURgLCB3aGVyZSBEID49IDIuXG4gKiAgMy4gQU1QLnNldExvZ0xldmVsKEQpIGlzIGNhbGxlZCwgd2hlcmUgRCA+PSAyLlxuICpcbiAqIEByZXR1cm4geyFMb2d9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXYoKSB7XG4gIGlmIChsb2dzLmRldikge1xuICAgIHJldHVybiBsb2dzLmRldjtcbiAgfVxuICBpZiAoIWxvZ0NvbnN0cnVjdG9yKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdmYWlsZWQgdG8gY2FsbCBpbml0TG9nQ29uc3RydWN0b3InKTtcbiAgfVxuICByZXR1cm4gKGxvZ3MuZGV2ID0gbmV3IGxvZ0NvbnN0cnVjdG9yKHNlbGYsIChsb2dOdW0pID0+IHtcbiAgICBpZiAobG9nTnVtID49IDMpIHtcbiAgICAgIHJldHVybiBMb2dMZXZlbC5GSU5FO1xuICAgIH1cbiAgICBpZiAobG9nTnVtID49IDIpIHtcbiAgICAgIHJldHVybiBMb2dMZXZlbC5JTkZPO1xuICAgIH1cbiAgICByZXR1cm4gTG9nTGV2ZWwuT0ZGO1xuICB9KSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEBwYXJhbSB7IUVsZW1lbnQ9fSBvcHRfZWxlbWVudFxuICogQHJldHVybiB7Ym9vbGVhbn0gaXNFbWJlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNGcm9tRW1iZWQod2luLCBvcHRfZWxlbWVudCkge1xuICBpZiAoIW9wdF9lbGVtZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiBvcHRfZWxlbWVudC5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3ICE9IHdpbjtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIGZpcnN0IGFyZ3VtZW50IGlzbid0IHRydWVpc2guXG4gKlxuICogU3VwcG9ydHMgYXJndW1lbnQgc3Vic3RpdHV0aW9uIGludG8gdGhlIG1lc3NhZ2UgdmlhICVzIHBsYWNlaG9sZGVycy5cbiAqXG4gKiBUaHJvd3MgYW4gZXJyb3Igb2JqZWN0IHRoYXQgaGFzIHR3byBleHRyYSBwcm9wZXJ0aWVzOlxuICogLSBhc3NvY2lhdGVkRWxlbWVudDogVGhpcyBpcyB0aGUgZmlyc3QgZWxlbWVudCBwcm92aWRlZCBpbiB0aGUgdmFyIGFyZ3MuXG4gKiAgIEl0IGNhbiBiZSB1c2VkIGZvciBpbXByb3ZlZCBkaXNwbGF5IG9mIGVycm9yIG1lc3NhZ2VzLlxuICogLSBtZXNzYWdlQXJyYXk6IFRoZSBlbGVtZW50cyBvZiB0aGUgc3Vic3RpdHV0ZWQgbWVzc2FnZSBhcyBub24tc3RyaW5naWZpZWRcbiAqICAgZWxlbWVudHMgaW4gYW4gYXJyYXkuIFdoZW4gZS5nLiBwYXNzZWQgdG8gY29uc29sZS5lcnJvciB0aGlzIHlpZWxkc1xuICogICBuYXRpdmUgZGlzcGxheXMgb2YgdGhpbmdzIGxpa2UgSFRNTCBlbGVtZW50cy5cbiAqXG4gKiBAcGFyYW0ge1R9IHNob3VsZEJlVHJ1ZWlzaCBUaGUgdmFsdWUgdG8gYXNzZXJ0LiBUaGUgYXNzZXJ0IGZhaWxzIGlmIGl0IGRvZXNcbiAqICAgICBub3QgZXZhbHVhdGUgdG8gdHJ1ZS5cbiAqIEBwYXJhbSB7IUFycmF5fHN0cmluZz19IG9wdF9tZXNzYWdlIFRoZSBhc3NlcnRpb24gbWVzc2FnZVxuICogQHBhcmFtIHsqPX0gb3B0XzEgT3B0aW9uYWwgYXJndW1lbnQgKFZhciBhcmcgYXMgaW5kaXZpZHVhbCBwYXJhbXMgZm9yIGJldHRlclxuICogQHBhcmFtIHsqPX0gb3B0XzIgT3B0aW9uYWwgYXJndW1lbnQgaW5saW5pbmcpXG4gKiBAcGFyYW0geyo9fSBvcHRfMyBPcHRpb25hbCBhcmd1bWVudFxuICogQHBhcmFtIHsqPX0gb3B0XzQgT3B0aW9uYWwgYXJndW1lbnRcbiAqIEBwYXJhbSB7Kj19IG9wdF81IE9wdGlvbmFsIGFyZ3VtZW50XG4gKiBAcGFyYW0geyo9fSBvcHRfNiBPcHRpb25hbCBhcmd1bWVudFxuICogQHBhcmFtIHsqPX0gb3B0XzcgT3B0aW9uYWwgYXJndW1lbnRcbiAqIEBwYXJhbSB7Kj19IG9wdF84IE9wdGlvbmFsIGFyZ3VtZW50XG4gKiBAcGFyYW0geyo9fSBvcHRfOSBPcHRpb25hbCBhcmd1bWVudFxuICogQHJldHVybiB7VH0gVGhlIHZhbHVlIG9mIHNob3VsZEJlVHJ1ZWlzaC5cbiAqIEB0aHJvd3MgeyFFcnJvcn0gV2hlbiBgc2hvdWxkQmVUcnVlaXNoYCBpcyBmYWxzZXkuXG4gKiBAdGVtcGxhdGUgVFxuICogQGNsb3N1cmVQcmltaXRpdmUge2Fzc2VydHMudHJ1dGh5fVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGV2QXNzZXJ0KFxuICBzaG91bGRCZVRydWVpc2gsXG4gIG9wdF9tZXNzYWdlLFxuICBvcHRfMSxcbiAgb3B0XzIsXG4gIG9wdF8zLFxuICBvcHRfNCxcbiAgb3B0XzUsXG4gIG9wdF82LFxuICBvcHRfNyxcbiAgb3B0XzgsXG4gIG9wdF85XG4pIHtcbiAgaWYgKG1vZGUuaXNNaW5pZmllZCgpKSB7XG4gICAgcmV0dXJuIHNob3VsZEJlVHJ1ZWlzaDtcbiAgfVxuICBpZiAoc2VsZi5fX0FNUF9BU1NFUlRJT05fQ0hFQ0spIHtcbiAgICAvLyBUaGlzIHdpbGwgbmV2ZXIgZXhlY3V0ZSByZWdhcmRsZXNzLCBidXQgd2lsbCBiZSBpbmNsdWRlZCBvbiB1bm1pbmlmaWVkXG4gICAgLy8gYnVpbGRzLiBJdCB3aWxsIGJlIERDRSdkIGF3YXkgZnJvbSBtaW5pZmllZCBidWlsZHMsIGFuZCBzbyBjYW4gYmUgdXNlZCB0b1xuICAgIC8vIHZhbGlkYXRlIHRoYXQgQmFiZWwgaXMgcHJvcGVybHkgcmVtb3ZpbmcgZGV2IGFzc2VydGlvbnMgaW4gbWluaWZpZWRcbiAgICAvLyBidWlsZHMuXG4gICAgY29uc29sZSAvKk9LKi9cbiAgICAgIC5sb2coJ19fZGV2QXNzZXJ0X3NlbnRpbmVsX18nKTtcbiAgfVxuXG4gIHJldHVybiBkZXYoKS4vKk9yaWcgY2FsbCovIGFzc2VydChcbiAgICBzaG91bGRCZVRydWVpc2gsXG4gICAgb3B0X21lc3NhZ2UsXG4gICAgb3B0XzEsXG4gICAgb3B0XzIsXG4gICAgb3B0XzMsXG4gICAgb3B0XzQsXG4gICAgb3B0XzUsXG4gICAgb3B0XzYsXG4gICAgb3B0XzcsXG4gICAgb3B0XzgsXG4gICAgb3B0XzlcbiAgKTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIGZpcnN0IGFyZ3VtZW50IGlzbid0IHRydWVpc2guXG4gKlxuICogU3VwcG9ydHMgYXJndW1lbnQgc3Vic3RpdHV0aW9uIGludG8gdGhlIG1lc3NhZ2UgdmlhICVzIHBsYWNlaG9sZGVycy5cbiAqXG4gKiBUaHJvd3MgYW4gZXJyb3Igb2JqZWN0IHRoYXQgaGFzIHR3byBleHRyYSBwcm9wZXJ0aWVzOlxuICogLSBhc3NvY2lhdGVkRWxlbWVudDogVGhpcyBpcyB0aGUgZmlyc3QgZWxlbWVudCBwcm92aWRlZCBpbiB0aGUgdmFyIGFyZ3MuXG4gKiAgIEl0IGNhbiBiZSB1c2VkIGZvciBpbXByb3ZlZCBkaXNwbGF5IG9mIGVycm9yIG1lc3NhZ2VzLlxuICogLSBtZXNzYWdlQXJyYXk6IFRoZSBlbGVtZW50cyBvZiB0aGUgc3Vic3RpdHV0ZWQgbWVzc2FnZSBhcyBub24tc3RyaW5naWZpZWRcbiAqICAgZWxlbWVudHMgaW4gYW4gYXJyYXkuIFdoZW4gZS5nLiBwYXNzZWQgdG8gY29uc29sZS5lcnJvciB0aGlzIHlpZWxkc1xuICogICBuYXRpdmUgZGlzcGxheXMgb2YgdGhpbmdzIGxpa2UgSFRNTCBlbGVtZW50cy5cbiAqXG4gKiBAcGFyYW0ge1R9IHNob3VsZEJlVHJ1ZWlzaCBUaGUgdmFsdWUgdG8gYXNzZXJ0LiBUaGUgYXNzZXJ0IGZhaWxzIGlmIGl0IGRvZXNcbiAqICAgICBub3QgZXZhbHVhdGUgdG8gdHJ1ZS5cbiAqIEBwYXJhbSB7IUFycmF5fHN0cmluZz19IG9wdF9tZXNzYWdlIFRoZSBhc3NlcnRpb24gbWVzc2FnZVxuICogQHBhcmFtIHsqPX0gb3B0XzEgT3B0aW9uYWwgYXJndW1lbnQgKFZhciBhcmcgYXMgaW5kaXZpZHVhbCBwYXJhbXMgZm9yIGJldHRlclxuICogQHBhcmFtIHsqPX0gb3B0XzIgT3B0aW9uYWwgYXJndW1lbnQgaW5saW5pbmcpXG4gKiBAcGFyYW0geyo9fSBvcHRfMyBPcHRpb25hbCBhcmd1bWVudFxuICogQHBhcmFtIHsqPX0gb3B0XzQgT3B0aW9uYWwgYXJndW1lbnRcbiAqIEBwYXJhbSB7Kj19IG9wdF81IE9wdGlvbmFsIGFyZ3VtZW50XG4gKiBAcGFyYW0geyo9fSBvcHRfNiBPcHRpb25hbCBhcmd1bWVudFxuICogQHBhcmFtIHsqPX0gb3B0XzcgT3B0aW9uYWwgYXJndW1lbnRcbiAqIEBwYXJhbSB7Kj19IG9wdF84IE9wdGlvbmFsIGFyZ3VtZW50XG4gKiBAcGFyYW0geyo9fSBvcHRfOSBPcHRpb25hbCBhcmd1bWVudFxuICogQHJldHVybiB7VH0gVGhlIHZhbHVlIG9mIHNob3VsZEJlVHJ1ZWlzaC5cbiAqIEB0aHJvd3MgeyFFcnJvcn0gV2hlbiBgc2hvdWxkQmVUcnVlaXNoYCBpcyBmYWxzZXkuXG4gKiBAdGVtcGxhdGUgVFxuICogQGNsb3N1cmVQcmltaXRpdmUge2Fzc2VydHMudHJ1dGh5fVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlckFzc2VydChcbiAgc2hvdWxkQmVUcnVlaXNoLFxuICBvcHRfbWVzc2FnZSxcbiAgb3B0XzEsXG4gIG9wdF8yLFxuICBvcHRfMyxcbiAgb3B0XzQsXG4gIG9wdF81LFxuICBvcHRfNixcbiAgb3B0XzcsXG4gIG9wdF84LFxuICBvcHRfOVxuKSB7XG4gIHJldHVybiB1c2VyKCkuLypPcmlnIGNhbGwqLyBhc3NlcnQoXG4gICAgc2hvdWxkQmVUcnVlaXNoLFxuICAgIG9wdF9tZXNzYWdlLFxuICAgIG9wdF8xLFxuICAgIG9wdF8yLFxuICAgIG9wdF8zLFxuICAgIG9wdF80LFxuICAgIG9wdF81LFxuICAgIG9wdF82LFxuICAgIG9wdF83LFxuICAgIG9wdF84LFxuICAgIG9wdF85XG4gICk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/log.js