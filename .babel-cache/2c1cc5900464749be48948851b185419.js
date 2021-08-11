function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import { SESSION_VALUES, sessionServicePromiseForDoc } from "./session-manager";
import { Services } from "../../../src/service";
import { TickLabel } from "../../../src/core/constants/enums";
import { asyncStringReplace } from "../../../src/core/types/string";
import { base64UrlEncodeFromString } from "../../../src/core/types/string/base64";
import { cookieReader } from "./cookie-reader";
import { dev, devAssert, user, userAssert } from "../../../src/log";
import { dict } from "../../../src/core/types/object";
import { getActiveExperimentBranches, getExperimentBranch } from "../../../src/experiments";
import { getConsentMetadata, getConsentPolicyInfo, getConsentPolicyState } from "../../../src/consent";
import { getServiceForDoc, getServicePromiseForDoc, registerServiceBuilderForDoc } from "../../../src/service-helpers";
import { isArray, isFiniteNumber } from "../../../src/core/types";
import { isInFie } from "../../../src/iframe-helper";
import { linkerReaderServiceFor } from "./linker-reader";

/** @const {string} */
var TAG = 'amp-analytics/variables';

/** @const {RegExp} */
var VARIABLE_ARGS_REGEXP = /^(?:([^\s]*)(\([^)]*\))|[^]+)$/;
var EXTERNAL_CONSENT_POLICY_STATE_STRING = {
  1: 'sufficient',
  2: 'insufficient',
  3: 'not_required',
  4: 'unknown'
};

/** @typedef {{name: string, argList: string}} */
var FunctionNameArgsDef;

/**
 * The structure that contains all details needed to expand a template
 * @struct
 * @const
 * @package For type.
 */
export var ExpansionOptions = /*#__PURE__*/function () {
  /**
   * @param {!Object<string, *>} vars
   * @param {number=} opt_iterations
   * @param {boolean=} opt_noEncode
   */
  function ExpansionOptions(vars, opt_iterations, opt_noEncode) {
    _classCallCheck(this, ExpansionOptions);

    /** @const {!Object<string, string|Array<string>>} */
    this.vars = vars;

    /** @const {number} */
    this.iterations = opt_iterations === undefined ? 2 : opt_iterations;

    /** @const {boolean} */
    this.noEncode = !!opt_noEncode;
    this.freezeVars = {};
  }

  /**
   * Freeze special variable name so that they don't get expanded.
   * For example ${extraUrlParams}
   * @param {string} str
   */
  _createClass(ExpansionOptions, [{
    key: "freezeVar",
    value: function freezeVar(str) {
      this.freezeVars[str] = true;
    }
    /**
     * @param {string} name
     * @return {*}
     */

  }, {
    key: "getVar",
    value: function getVar(name) {
      var value = this.vars[name];

      if (value == null) {
        value = '';
      }

      return value;
    }
  }]);

  return ExpansionOptions;
}();

/**
 * @param {string} value
 * @param {string} s
 * @param {string=} opt_l
 * @return {string}
 */
function substrMacro(value, s, opt_l) {
  var start = Number(s);
  var length = value.length;
  userAssert(isFiniteNumber(start), 'Start index ' + start + 'in substr macro should be a number');

  if (opt_l) {
    length = Number(opt_l);
    userAssert(isFiniteNumber(length), 'Length ' + length + ' in substr macro should be a number');
  }

  return value.substr(start, length);
}

/**
 * @param {string} value
 * @param {string} defaultValue
 * @return {string}
 */
function defaultMacro(value, defaultValue) {
  if (!value || !value.length) {
    return defaultValue;
  }

  return value;
}

/**
 * @param {string} string input to be replaced
 * @param {string} matchPattern string representation of regex pattern
 * @param {string=} opt_newSubStr pattern to be substituted in
 * @return {string}
 */
function replaceMacro(string, matchPattern, opt_newSubStr) {
  if (!matchPattern) {
    user().warn(TAG, 'REPLACE macro must have two or more arguments');
  }

  if (!opt_newSubStr) {
    opt_newSubStr = '';
  }

  var regex = new RegExp(matchPattern, 'g');
  return string.replace(regex, opt_newSubStr);
}

/**
 * Applies the match function to the given string with the given regex
 * @param {string} string input to be replaced
 * @param {string} matchPattern string representation of regex pattern
 * @param {string=} opt_matchingGroupIndexStr the matching group to return.
 *                  Index of 0 indicates the full match. Defaults to 0
 * @return {string} returns the matching group given by opt_matchingGroupIndexStr
 */
function matchMacro(string, matchPattern, opt_matchingGroupIndexStr) {
  if (!matchPattern) {
    user().warn(TAG, 'MATCH macro must have two or more arguments');
  }

  var index = 0;

  if (opt_matchingGroupIndexStr) {
    index = parseInt(opt_matchingGroupIndexStr, 10);

    // if given a non-number or negative number
    if (index != 0 && !index || index < 0) {
      user().error(TAG, 'Third argument in MATCH macro must be a number >= 0');
      index = 0;
    }
  }

  var regex = new RegExp(matchPattern);
  var matches = string.match(regex);
  return matches && matches[index] ? matches[index] : '';
}

/**
 * This macro function allows arithmetic operations over other analytics variables.
 *
 * @param {string} leftOperand
 * @param {string} rightOperand
 * @param {string} operation
 * @param {string} round If this flag is truthy the result will be rounded
 * @return {number}
 */
function calcMacro(leftOperand, rightOperand, operation, round) {
  var left = Number(leftOperand);
  var right = Number(rightOperand);
  userAssert(!isNaN(left), 'CALC macro - left operand must be a number');
  userAssert(!isNaN(right), 'CALC macro - right operand must be a number');
  var result = 0;

  switch (operation) {
    case 'add':
      result = left + right;
      break;

    case 'subtract':
      result = left - right;
      break;

    case 'multiply':
      result = left * right;
      break;

    case 'divide':
      userAssert(right, 'CALC macro - cannot divide by 0');
      result = left / right;
      break;

    default:
      user().error(TAG, 'CALC macro - Invalid operation');
  }

  return stringToBool(round) ? Math.round(result) : result;
}

/**
 * If given an experiment name returns the branch id if a branch is selected.
 * If no branch name given, it returns a comma separated list of active branch
 * experiment ids and their names or an empty string if none exist.
 * @param {!Window} win
 * @param {string=} opt_expName
 * @return {string}
 */
function experimentBranchesMacro(win, opt_expName) {
  if (opt_expName) {
    return getExperimentBranch(win, opt_expName) || '';
  }

  var branches = getActiveExperimentBranches(win);
  return Object.keys(branches).map(function (expName) {
    return expName + ":" + branches[expName];
  }).join(',');
}

/**
 * Provides support for processing of advanced variable syntax like nested
 * expansions macros etc.
 */
export var VariableService = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function VariableService(ampdoc) {
    var _this = this;

    _classCallCheck(this, VariableService);

    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!JsonObject} */
    this.macros_ = dict({});

    /** @const @private {!./linker-reader.LinkerReader} */
    this.linkerReader_ = linkerReaderServiceFor(this.ampdoc_.win);

    /** @const @private {!Promise<SessionManager>} */
    this.sessionManagerPromise_ = sessionServicePromiseForDoc(this.ampdoc_);
    this.register_('$DEFAULT', defaultMacro);
    this.register_('$SUBSTR', substrMacro);
    this.register_('$TRIM', function (value) {
      return value.trim();
    });
    this.register_('$TOLOWERCASE', function (value) {
      return value.toLowerCase();
    });
    this.register_('$TOUPPERCASE', function (value) {
      return value.toUpperCase();
    });
    this.register_('$NOT', function (value) {
      return String(!value);
    });
    this.register_('$BASE64', function (value) {
      return base64UrlEncodeFromString(value);
    });
    this.register_('$HASH', this.hashMacro_.bind(this));
    this.register_('$IF', function (value, thenValue, elseValue) {
      return stringToBool(value) ? thenValue : elseValue;
    });
    this.register_('$REPLACE', replaceMacro);
    this.register_('$MATCH', matchMacro);
    this.register_('$CALC', calcMacro);
    this.register_('$EQUALS', function (firstValue, secValue) {
      return firstValue === secValue;
    });
    this.register_('LINKER_PARAM', function (name, id) {
      return _this.linkerReader_.get(name, id);
    });
    // Returns the IANA timezone code
    this.register_('TIMEZONE_CODE', function () {
      var tzCode = '';

      if ('Intl' in _this.ampdoc_.win && 'DateTimeFormat' in _this.ampdoc_.win.Intl) {
        // It could be undefined (i.e. IE11)
        tzCode = new _this.ampdoc_.win.Intl.DateTimeFormat().resolvedOptions().timeZone;
      }

      return tzCode;
    });
    // Returns a promise resolving to viewport.getScrollTop.
    this.register_('SCROLL_TOP', function () {
      return Math.round(Services.viewportForDoc(_this.ampdoc_).getScrollTop());
    });
    // Returns a promise resolving to viewport.getScrollLeft.
    this.register_('SCROLL_LEFT', function () {
      return Math.round(Services.viewportForDoc(_this.ampdoc_).getScrollLeft());
    });
    this.register_('EXPERIMENT_BRANCHES', function (opt_expName) {
      return experimentBranchesMacro(_this.ampdoc_.win, opt_expName);
    });
    // Returns the content of a meta tag in the ampdoc
    this.register_('AMPDOC_META', function (meta, defaultValue) {
      var _this$ampdoc_$getMeta;

      if (defaultValue === void 0) {
        defaultValue = '';
      }

      return (_this$ampdoc_$getMeta = _this.ampdoc_.getMetaByName(meta)) != null ? _this$ampdoc_$getMeta : defaultValue;
    });
  }

  /**
   * @param {!Element} element
   * @return {!JsonObject} contains all registered macros
   */
  _createClass(VariableService, [{
    key: "getMacros",
    value: function getMacros(element) {
      var _this2 = this;

      var type = element.getAttribute('type');
      var elementMacros = {
        'COOKIE': function COOKIE(name) {
          return cookieReader(_this2.ampdoc_.win, dev().assertElement(element), name);
        },
        'CONSENT_STATE': getConsentStateStr(element),
        'CONSENT_STRING': getConsentPolicyInfo(element),
        'CONSENT_METADATA': function CONSENT_METADATA(key) {
          return getConsentMetadataValue(element, userAssert(key, 'CONSENT_METADATA macro must contain a key'));
        },
        'SESSION_ID': function SESSION_ID() {
          return _this2.getSessionValue_(type, SESSION_VALUES.SESSION_ID);
        },
        'SESSION_TIMESTAMP': function SESSION_TIMESTAMP() {
          return _this2.getSessionValue_(type, SESSION_VALUES.CREATION_TIMESTAMP);
        },
        'SESSION_COUNT': function SESSION_COUNT() {
          return _this2.getSessionValue_(type, SESSION_VALUES.COUNT);
        },
        'SESSION_EVENT_TIMESTAMP': function SESSION_EVENT_TIMESTAMP() {
          return _this2.getSessionValue_(type, SESSION_VALUES.EVENT_TIMESTAMP);
        },
        'SESSION_ENGAGED': function SESSION_ENGAGED() {
          return _this2.getSessionValue_(type, SESSION_VALUES.ENGAGED);
        }
      };
      var perfMacros = isInFie(element) ? {} : {
        'FIRST_CONTENTFUL_PAINT': function FIRST_CONTENTFUL_PAINT() {
          return Services.performanceFor(_this2.ampdoc_.win).getMetric(TickLabel.FIRST_CONTENTFUL_PAINT_VISIBLE);
        },
        'FIRST_VIEWPORT_READY': function FIRST_VIEWPORT_READY() {
          return Services.performanceFor(_this2.ampdoc_.win).getMetric(TickLabel.FIRST_VIEWPORT_READY);
        },
        'MAKE_BODY_VISIBLE': function MAKE_BODY_VISIBLE() {
          return Services.performanceFor(_this2.ampdoc_.win).getMetric(TickLabel.MAKE_BODY_VISIBLE);
        },
        'LARGEST_CONTENTFUL_PAINT': function LARGEST_CONTENTFUL_PAINT() {
          return Services.performanceFor(_this2.ampdoc_.win).getMetric(TickLabel.LARGEST_CONTENTFUL_PAINT_VISIBLE);
        },
        'FIRST_INPUT_DELAY': function FIRST_INPUT_DELAY() {
          return Services.performanceFor(_this2.ampdoc_.win).getMetric(TickLabel.FIRST_INPUT_DELAY);
        },
        'CUMULATIVE_LAYOUT_SHIFT': function CUMULATIVE_LAYOUT_SHIFT() {
          return Services.performanceFor(_this2.ampdoc_.win).getMetric(TickLabel.CUMULATIVE_LAYOUT_SHIFT);
        }
      };

      var merged = _extends({}, this.macros_, elementMacros, perfMacros);

      return (
        /** @type {!JsonObject} */
        merged
      );
    }
    /**
     *
     * @param {string} vendorType
     * @param {!SESSION_VALUES} key
     * @return {!Promise<number>}
     */

  }, {
    key: "getSessionValue_",
    value: function getSessionValue_(vendorType, key) {
      return this.sessionManagerPromise_.then(function (sessionManager) {
        return sessionManager.getSessionValue(vendorType, key);
      });
    }
    /**
     * TODO (micajuineho): If we add new synchronous macros, we
     * will need to split this method and getMacros into sync and
     * async version (currently all macros are async).
     * @param {string} name
     * @param {*} macro
     */

  }, {
    key: "register_",
    value: function register_(name, macro) {
      devAssert(!this.macros_[name], 'Macro "' + name + '" already registered.');
      this.macros_[name] = macro;
    }
    /**
     * Converts templates from ${} format to MACRO() and resolves any platform
     * level macros when encountered.
     * @param {string} template The template to expand.
     * @param {!ExpansionOptions} options configuration to use for expansion.
     * @param {!Element} element amp-analytics element.
     * @param {!JsonObject=} opt_bindings
     * @param {!Object=} opt_allowlist
     * @return {!Promise<string>} The expanded string.
     */

  }, {
    key: "expandTemplate",
    value: function expandTemplate(template, options, element, opt_bindings, opt_allowlist) {
      var _this3 = this;

      return asyncStringReplace(template, /\${([^}]*)}/g, function (match, key) {
        if (options.iterations < 0) {
          user().error(TAG, 'Maximum depth reached while expanding variables. ' + 'Please ensure that the variables are not recursive.');
          return match;
        }

        if (!key) {
          return '';
        }

        // Split the key to name and args
        // e.g.: name='SOME_MACRO', args='(arg1, arg2)'
        var _getNameArgs = getNameArgs(key),
            argList = _getNameArgs.argList,
            name = _getNameArgs.name;

        if (options.freezeVars[name]) {
          // Do nothing with frozen params
          return match;
        }

        var value = options.getVar(name);
        var urlReplacements = Services.urlReplacementsForDoc(element);

        if (typeof value == 'string') {
          value = _this3.expandValueAndReplaceAsync_(value, options, element, urlReplacements, opt_bindings, opt_allowlist, argList);
        } else if (isArray(value)) {
          // Treat each value as a template and expand
          for (var i = 0; i < value.length; i++) {
            value[i] = typeof value[i] == 'string' ? _this3.expandValueAndReplaceAsync_(value[i], options, element, urlReplacements, opt_bindings, opt_allowlist) : value[i];
          }

          value = Promise.all(
          /** @type {!Array<string>} */
          value);
        }

        return Promise.resolve(value).then(function (value) {
          return !options.noEncode ? encodeVars(
          /** @type {string|?Array<string>} */
          value) : value;
        });
      });
    }
    /**
     * @param {string} value
     * @param {!ExpansionOptions} options
     * @param {!Element} element amp-analytics element.
     * @param {!../../../src/service/url-replacements-impl.UrlReplacements} urlReplacements
     * @param {!JsonObject=} opt_bindings
     * @param {!Object=} opt_allowlist
     * @param {string=} opt_argList
     * @return {Promise<string>}
     */

  }, {
    key: "expandValueAndReplaceAsync_",
    value: function expandValueAndReplaceAsync_(value, options, element, urlReplacements, opt_bindings, opt_allowlist, opt_argList) {
      var _this4 = this;

      return this.expandTemplate(value, new ExpansionOptions(options.vars, options.iterations - 1, true
      /* noEncode */
      ), element, opt_bindings, opt_allowlist).then(function (val) {
        return urlReplacements.expandStringAsync(opt_argList ? val + opt_argList : val, opt_bindings || _this4.getMacros(element), opt_allowlist);
      });
    }
    /**
     * @param {string} value
     * @return {!Promise<string>}
     */

  }, {
    key: "hashMacro_",
    value: function hashMacro_(value) {
      return Services.cryptoFor(this.ampdoc_.win).sha384Base64(value);
    }
  }]);

  return VariableService;
}();

/**
 * @param {string|?Array<string>} raw The values to URI encode.
 * @return {string} The encoded value.
 */
export function encodeVars(raw) {
  if (raw == null) {
    return '';
  }

  if (isArray(raw)) {
    return raw.map(encodeVars).join(',');
  }

  // Separate out names and arguments from the value and encode the value.
  var _getNameArgs2 = getNameArgs(String(raw)),
      argList = _getNameArgs2.argList,
      name = _getNameArgs2.name;

  return encodeURIComponent(name) + argList;
}

/**
 * Returns an array containing two values: name and args parsed from the key.
 *
 * case 1) 'SOME_MACRO(abc,def)' => name='SOME_MACRO', argList='(abc,def)'
 * case 2) 'randomString' => name='randomString', argList=''
 * @param {string} key The key to be parsed.
 * @return {!FunctionNameArgsDef}
 */
export function getNameArgs(key) {
  if (!key) {
    return {
      name: '',
      argList: ''
    };
  }

  var match = key.match(VARIABLE_ARGS_REGEXP);
  userAssert(match, 'Variable with invalid format found: ' + key);
  return {
    name: match[1] || match[0],
    argList: match[2] || ''
  };
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installVariableServiceForTesting(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, 'amp-analytics-variables', VariableService);
}

/**
 * @param {!Element|!ShadowRoot|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!VariableService}
 */
export function variableServiceForDoc(elementOrAmpDoc) {
  return getServiceForDoc(elementOrAmpDoc, 'amp-analytics-variables');
}

/**
 * @param {!Element|!ShadowRoot|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<!VariableService>}
 */
export function variableServicePromiseForDoc(elementOrAmpDoc) {
  return (
    /** @type {!Promise<!VariableService>} */
    getServicePromiseForDoc(elementOrAmpDoc, 'amp-analytics-variables')
  );
}

/**
 * @param {string} key
 * @return {{name, argList}|!FunctionNameArgsDef}
 * @visibleForTesting
 */
export function getNameArgsForTesting(key) {
  return getNameArgs(key);
}

/**
 * Get the resolved consent state value to send with analytics request
 * @param {!Element} element
 * @return {!Promise<?string>}
 */
function getConsentStateStr(element) {
  return getConsentPolicyState(element).then(function (consent) {
    if (!consent) {
      return null;
    }

    return EXTERNAL_CONSENT_POLICY_STATE_STRING[consent];
  });
}

/**
 * Get the associated value from the resolved consent metadata object
 * @param {!Element} element
 * @param {string} key
 * @return {!Promise<?Object>}
 */
function getConsentMetadataValue(element, key) {
  // Get the metadata using the default policy id
  return getConsentMetadata(element).then(function (consentMetadata) {
    if (!consentMetadata) {
      return null;
    }

    return consentMetadata[key];
  });
}

/**
 * Converts string to boolean
 * @param {string} str
 * @return {boolean}
 */
export function stringToBool(str) {
  return str !== 'false' && str !== '' && str !== '0' && str !== 'null' && str !== 'NaN' && str !== 'undefined';
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZhcmlhYmxlcy5qcyJdLCJuYW1lcyI6WyJTRVNTSU9OX1ZBTFVFUyIsInNlc3Npb25TZXJ2aWNlUHJvbWlzZUZvckRvYyIsIlNlcnZpY2VzIiwiVGlja0xhYmVsIiwiYXN5bmNTdHJpbmdSZXBsYWNlIiwiYmFzZTY0VXJsRW5jb2RlRnJvbVN0cmluZyIsImNvb2tpZVJlYWRlciIsImRldiIsImRldkFzc2VydCIsInVzZXIiLCJ1c2VyQXNzZXJ0IiwiZGljdCIsImdldEFjdGl2ZUV4cGVyaW1lbnRCcmFuY2hlcyIsImdldEV4cGVyaW1lbnRCcmFuY2giLCJnZXRDb25zZW50TWV0YWRhdGEiLCJnZXRDb25zZW50UG9saWN5SW5mbyIsImdldENvbnNlbnRQb2xpY3lTdGF0ZSIsImdldFNlcnZpY2VGb3JEb2MiLCJnZXRTZXJ2aWNlUHJvbWlzZUZvckRvYyIsInJlZ2lzdGVyU2VydmljZUJ1aWxkZXJGb3JEb2MiLCJpc0FycmF5IiwiaXNGaW5pdGVOdW1iZXIiLCJpc0luRmllIiwibGlua2VyUmVhZGVyU2VydmljZUZvciIsIlRBRyIsIlZBUklBQkxFX0FSR1NfUkVHRVhQIiwiRVhURVJOQUxfQ09OU0VOVF9QT0xJQ1lfU1RBVEVfU1RSSU5HIiwiRnVuY3Rpb25OYW1lQXJnc0RlZiIsIkV4cGFuc2lvbk9wdGlvbnMiLCJ2YXJzIiwib3B0X2l0ZXJhdGlvbnMiLCJvcHRfbm9FbmNvZGUiLCJpdGVyYXRpb25zIiwidW5kZWZpbmVkIiwibm9FbmNvZGUiLCJmcmVlemVWYXJzIiwic3RyIiwibmFtZSIsInZhbHVlIiwic3Vic3RyTWFjcm8iLCJzIiwib3B0X2wiLCJzdGFydCIsIk51bWJlciIsImxlbmd0aCIsInN1YnN0ciIsImRlZmF1bHRNYWNybyIsImRlZmF1bHRWYWx1ZSIsInJlcGxhY2VNYWNybyIsInN0cmluZyIsIm1hdGNoUGF0dGVybiIsIm9wdF9uZXdTdWJTdHIiLCJ3YXJuIiwicmVnZXgiLCJSZWdFeHAiLCJyZXBsYWNlIiwibWF0Y2hNYWNybyIsIm9wdF9tYXRjaGluZ0dyb3VwSW5kZXhTdHIiLCJpbmRleCIsInBhcnNlSW50IiwiZXJyb3IiLCJtYXRjaGVzIiwibWF0Y2giLCJjYWxjTWFjcm8iLCJsZWZ0T3BlcmFuZCIsInJpZ2h0T3BlcmFuZCIsIm9wZXJhdGlvbiIsInJvdW5kIiwibGVmdCIsInJpZ2h0IiwiaXNOYU4iLCJyZXN1bHQiLCJzdHJpbmdUb0Jvb2wiLCJNYXRoIiwiZXhwZXJpbWVudEJyYW5jaGVzTWFjcm8iLCJ3aW4iLCJvcHRfZXhwTmFtZSIsImJyYW5jaGVzIiwiT2JqZWN0Iiwia2V5cyIsIm1hcCIsImV4cE5hbWUiLCJqb2luIiwiVmFyaWFibGVTZXJ2aWNlIiwiYW1wZG9jIiwiYW1wZG9jXyIsIm1hY3Jvc18iLCJsaW5rZXJSZWFkZXJfIiwic2Vzc2lvbk1hbmFnZXJQcm9taXNlXyIsInJlZ2lzdGVyXyIsInRyaW0iLCJ0b0xvd2VyQ2FzZSIsInRvVXBwZXJDYXNlIiwiU3RyaW5nIiwiaGFzaE1hY3JvXyIsImJpbmQiLCJ0aGVuVmFsdWUiLCJlbHNlVmFsdWUiLCJmaXJzdFZhbHVlIiwic2VjVmFsdWUiLCJpZCIsImdldCIsInR6Q29kZSIsIkludGwiLCJEYXRlVGltZUZvcm1hdCIsInJlc29sdmVkT3B0aW9ucyIsInRpbWVab25lIiwidmlld3BvcnRGb3JEb2MiLCJnZXRTY3JvbGxUb3AiLCJnZXRTY3JvbGxMZWZ0IiwibWV0YSIsImdldE1ldGFCeU5hbWUiLCJlbGVtZW50IiwidHlwZSIsImdldEF0dHJpYnV0ZSIsImVsZW1lbnRNYWNyb3MiLCJhc3NlcnRFbGVtZW50IiwiZ2V0Q29uc2VudFN0YXRlU3RyIiwia2V5IiwiZ2V0Q29uc2VudE1ldGFkYXRhVmFsdWUiLCJnZXRTZXNzaW9uVmFsdWVfIiwiU0VTU0lPTl9JRCIsIkNSRUFUSU9OX1RJTUVTVEFNUCIsIkNPVU5UIiwiRVZFTlRfVElNRVNUQU1QIiwiRU5HQUdFRCIsInBlcmZNYWNyb3MiLCJwZXJmb3JtYW5jZUZvciIsImdldE1ldHJpYyIsIkZJUlNUX0NPTlRFTlRGVUxfUEFJTlRfVklTSUJMRSIsIkZJUlNUX1ZJRVdQT1JUX1JFQURZIiwiTUFLRV9CT0RZX1ZJU0lCTEUiLCJMQVJHRVNUX0NPTlRFTlRGVUxfUEFJTlRfVklTSUJMRSIsIkZJUlNUX0lOUFVUX0RFTEFZIiwiQ1VNVUxBVElWRV9MQVlPVVRfU0hJRlQiLCJtZXJnZWQiLCJ2ZW5kb3JUeXBlIiwidGhlbiIsInNlc3Npb25NYW5hZ2VyIiwiZ2V0U2Vzc2lvblZhbHVlIiwibWFjcm8iLCJ0ZW1wbGF0ZSIsIm9wdGlvbnMiLCJvcHRfYmluZGluZ3MiLCJvcHRfYWxsb3dsaXN0IiwiZ2V0TmFtZUFyZ3MiLCJhcmdMaXN0IiwiZ2V0VmFyIiwidXJsUmVwbGFjZW1lbnRzIiwidXJsUmVwbGFjZW1lbnRzRm9yRG9jIiwiZXhwYW5kVmFsdWVBbmRSZXBsYWNlQXN5bmNfIiwiaSIsIlByb21pc2UiLCJhbGwiLCJyZXNvbHZlIiwiZW5jb2RlVmFycyIsIm9wdF9hcmdMaXN0IiwiZXhwYW5kVGVtcGxhdGUiLCJ2YWwiLCJleHBhbmRTdHJpbmdBc3luYyIsImdldE1hY3JvcyIsImNyeXB0b0ZvciIsInNoYTM4NEJhc2U2NCIsInJhdyIsImVuY29kZVVSSUNvbXBvbmVudCIsImluc3RhbGxWYXJpYWJsZVNlcnZpY2VGb3JUZXN0aW5nIiwidmFyaWFibGVTZXJ2aWNlRm9yRG9jIiwiZWxlbWVudE9yQW1wRG9jIiwidmFyaWFibGVTZXJ2aWNlUHJvbWlzZUZvckRvYyIsImdldE5hbWVBcmdzRm9yVGVzdGluZyIsImNvbnNlbnQiLCJjb25zZW50TWV0YWRhdGEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUEsU0FBUUEsY0FBUixFQUF3QkMsMkJBQXhCO0FBQ0EsU0FBUUMsUUFBUjtBQUNBLFNBQVFDLFNBQVI7QUFDQSxTQUFRQyxrQkFBUjtBQUNBLFNBQVFDLHlCQUFSO0FBQ0EsU0FBUUMs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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNuRCx1QkFBVCxDQUFpQ1AsT0FBakMsRUFBMENNLEdBQTFDLEVBQStDO0FBQzdDO0FBQ0EsU0FBT3hHLGtCQUFrQixDQUFDa0csT0FBRCxDQUFsQixDQUE0QnlCLElBQTVCLENBQWlDLFVBQUNrQyxlQUFELEVBQXFCO0FBQzNELFFBQUksQ0FBQ0EsZUFBTCxFQUFzQjtBQUNwQixhQUFPLElBQVA7QUFDRDs7QUFDRCxXQUFPQSxlQUFlLENBQUNyRCxHQUFELENBQXRCO0FBQ0QsR0FMTSxDQUFQO0FBTUQ7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBUzlDLFlBQVQsQ0FBc0JwQyxHQUF0QixFQUEyQjtBQUNoQyxTQUNFQSxHQUFHLEtBQUssT0FBUixJQUNBQSxHQUFHLEtBQUssRUFEUixJQUVBQSxHQUFHLEtBQUssR0FGUixJQUdBQSxHQUFHLEtBQUssTUFIUixJQUlBQSxHQUFHLEtBQUssS0FKUixJQUtBQSxHQUFHLEtBQUssV0FOVjtBQVFEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNiBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCB7U0VTU0lPTl9WQUxVRVMsIHNlc3Npb25TZXJ2aWNlUHJvbWlzZUZvckRvY30gZnJvbSAnLi9zZXNzaW9uLW1hbmFnZXInO1xuaW1wb3J0IHtTZXJ2aWNlc30gZnJvbSAnI3NlcnZpY2UnO1xuaW1wb3J0IHtUaWNrTGFiZWx9IGZyb20gJyNjb3JlL2NvbnN0YW50cy9lbnVtcyc7XG5pbXBvcnQge2FzeW5jU3RyaW5nUmVwbGFjZX0gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nJztcbmltcG9ydCB7YmFzZTY0VXJsRW5jb2RlRnJvbVN0cmluZ30gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nL2Jhc2U2NCc7XG5pbXBvcnQge2Nvb2tpZVJlYWRlcn0gZnJvbSAnLi9jb29raWUtcmVhZGVyJztcbmltcG9ydCB7ZGV2LCBkZXZBc3NlcnQsIHVzZXIsIHVzZXJBc3NlcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9sb2cnO1xuaW1wb3J0IHtkaWN0fSBmcm9tICcjY29yZS90eXBlcy9vYmplY3QnO1xuaW1wb3J0IHtnZXRBY3RpdmVFeHBlcmltZW50QnJhbmNoZXMsIGdldEV4cGVyaW1lbnRCcmFuY2h9IGZyb20gJyNleHBlcmltZW50cyc7XG5pbXBvcnQge1xuICBnZXRDb25zZW50TWV0YWRhdGEsXG4gIGdldENvbnNlbnRQb2xpY3lJbmZvLFxuICBnZXRDb25zZW50UG9saWN5U3RhdGUsXG59IGZyb20gJy4uLy4uLy4uL3NyYy9jb25zZW50JztcbmltcG9ydCB7XG4gIGdldFNlcnZpY2VGb3JEb2MsXG4gIGdldFNlcnZpY2VQcm9taXNlRm9yRG9jLFxuICByZWdpc3RlclNlcnZpY2VCdWlsZGVyRm9yRG9jLFxufSBmcm9tICcuLi8uLi8uLi9zcmMvc2VydmljZS1oZWxwZXJzJztcbmltcG9ydCB7aXNBcnJheSwgaXNGaW5pdGVOdW1iZXJ9IGZyb20gJyNjb3JlL3R5cGVzJztcblxuaW1wb3J0IHtpc0luRmllfSBmcm9tICcuLi8uLi8uLi9zcmMvaWZyYW1lLWhlbHBlcic7XG5pbXBvcnQge2xpbmtlclJlYWRlclNlcnZpY2VGb3J9IGZyb20gJy4vbGlua2VyLXJlYWRlcic7XG5cbi8qKiBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICdhbXAtYW5hbHl0aWNzL3ZhcmlhYmxlcyc7XG5cbi8qKiBAY29uc3Qge1JlZ0V4cH0gKi9cbmNvbnN0IFZBUklBQkxFX0FSR1NfUkVHRVhQID0gL14oPzooW15cXHNdKikoXFwoW14pXSpcXCkpfFteXSspJC87XG5cbmNvbnN0IEVYVEVSTkFMX0NPTlNFTlRfUE9MSUNZX1NUQVRFX1NUUklORyA9IHtcbiAgMTogJ3N1ZmZpY2llbnQnLFxuICAyOiAnaW5zdWZmaWNpZW50JyxcbiAgMzogJ25vdF9yZXF1aXJlZCcsXG4gIDQ6ICd1bmtub3duJyxcbn07XG5cbi8qKiBAdHlwZWRlZiB7e25hbWU6IHN0cmluZywgYXJnTGlzdDogc3RyaW5nfX0gKi9cbmxldCBGdW5jdGlvbk5hbWVBcmdzRGVmO1xuXG4vKipcbiAqIFRoZSBzdHJ1Y3R1cmUgdGhhdCBjb250YWlucyBhbGwgZGV0YWlscyBuZWVkZWQgdG8gZXhwYW5kIGEgdGVtcGxhdGVcbiAqIEBzdHJ1Y3RcbiAqIEBjb25zdFxuICogQHBhY2thZ2UgRm9yIHR5cGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBFeHBhbnNpb25PcHRpb25zIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsICo+fSB2YXJzXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gb3B0X2l0ZXJhdGlvbnNcbiAgICogQHBhcmFtIHtib29sZWFuPX0gb3B0X25vRW5jb2RlXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih2YXJzLCBvcHRfaXRlcmF0aW9ucywgb3B0X25vRW5jb2RlKSB7XG4gICAgLyoqIEBjb25zdCB7IU9iamVjdDxzdHJpbmcsIHN0cmluZ3xBcnJheTxzdHJpbmc+Pn0gKi9cbiAgICB0aGlzLnZhcnMgPSB2YXJzO1xuICAgIC8qKiBAY29uc3Qge251bWJlcn0gKi9cbiAgICB0aGlzLml0ZXJhdGlvbnMgPSBvcHRfaXRlcmF0aW9ucyA9PT0gdW5kZWZpbmVkID8gMiA6IG9wdF9pdGVyYXRpb25zO1xuICAgIC8qKiBAY29uc3Qge2Jvb2xlYW59ICovXG4gICAgdGhpcy5ub0VuY29kZSA9ICEhb3B0X25vRW5jb2RlO1xuICAgIHRoaXMuZnJlZXplVmFycyA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIEZyZWV6ZSBzcGVjaWFsIHZhcmlhYmxlIG5hbWUgc28gdGhhdCB0aGV5IGRvbid0IGdldCBleHBhbmRlZC5cbiAgICogRm9yIGV4YW1wbGUgJHtleHRyYVVybFBhcmFtc31cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICAgKi9cbiAgZnJlZXplVmFyKHN0cikge1xuICAgIHRoaXMuZnJlZXplVmFyc1tzdHJdID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHsqfVxuICAgKi9cbiAgZ2V0VmFyKG5hbWUpIHtcbiAgICBsZXQgdmFsdWUgPSB0aGlzLnZhcnNbbmFtZV07XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICAgIHZhbHVlID0gJyc7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICogQHBhcmFtIHtzdHJpbmd9IHNcbiAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X2xcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gc3Vic3RyTWFjcm8odmFsdWUsIHMsIG9wdF9sKSB7XG4gIGNvbnN0IHN0YXJ0ID0gTnVtYmVyKHMpO1xuICBsZXQge2xlbmd0aH0gPSB2YWx1ZTtcbiAgdXNlckFzc2VydChcbiAgICBpc0Zpbml0ZU51bWJlcihzdGFydCksXG4gICAgJ1N0YXJ0IGluZGV4ICcgKyBzdGFydCArICdpbiBzdWJzdHIgbWFjcm8gc2hvdWxkIGJlIGEgbnVtYmVyJ1xuICApO1xuICBpZiAob3B0X2wpIHtcbiAgICBsZW5ndGggPSBOdW1iZXIob3B0X2wpO1xuICAgIHVzZXJBc3NlcnQoXG4gICAgICBpc0Zpbml0ZU51bWJlcihsZW5ndGgpLFxuICAgICAgJ0xlbmd0aCAnICsgbGVuZ3RoICsgJyBpbiBzdWJzdHIgbWFjcm8gc2hvdWxkIGJlIGEgbnVtYmVyJ1xuICAgICk7XG4gIH1cblxuICByZXR1cm4gdmFsdWUuc3Vic3RyKHN0YXJ0LCBsZW5ndGgpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICogQHBhcmFtIHtzdHJpbmd9IGRlZmF1bHRWYWx1ZVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBkZWZhdWx0TWFjcm8odmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAoIXZhbHVlIHx8ICF2YWx1ZS5sZW5ndGgpIHtcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIGlucHV0IHRvIGJlIHJlcGxhY2VkXG4gKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2hQYXR0ZXJuIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiByZWdleCBwYXR0ZXJuXG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9uZXdTdWJTdHIgcGF0dGVybiB0byBiZSBzdWJzdGl0dXRlZCBpblxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZXBsYWNlTWFjcm8oc3RyaW5nLCBtYXRjaFBhdHRlcm4sIG9wdF9uZXdTdWJTdHIpIHtcbiAgaWYgKCFtYXRjaFBhdHRlcm4pIHtcbiAgICB1c2VyKCkud2FybihUQUcsICdSRVBMQUNFIG1hY3JvIG11c3QgaGF2ZSB0d28gb3IgbW9yZSBhcmd1bWVudHMnKTtcbiAgfVxuICBpZiAoIW9wdF9uZXdTdWJTdHIpIHtcbiAgICBvcHRfbmV3U3ViU3RyID0gJyc7XG4gIH1cbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKG1hdGNoUGF0dGVybiwgJ2cnKTtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKHJlZ2V4LCBvcHRfbmV3U3ViU3RyKTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIHRoZSBtYXRjaCBmdW5jdGlvbiB0byB0aGUgZ2l2ZW4gc3RyaW5nIHdpdGggdGhlIGdpdmVuIHJlZ2V4XG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIGlucHV0IHRvIGJlIHJlcGxhY2VkXG4gKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2hQYXR0ZXJuIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiByZWdleCBwYXR0ZXJuXG4gKiBAcGFyYW0ge3N0cmluZz19IG9wdF9tYXRjaGluZ0dyb3VwSW5kZXhTdHIgdGhlIG1hdGNoaW5nIGdyb3VwIHRvIHJldHVybi5cbiAqICAgICAgICAgICAgICAgICAgSW5kZXggb2YgMCBpbmRpY2F0ZXMgdGhlIGZ1bGwgbWF0Y2guIERlZmF1bHRzIHRvIDBcbiAqIEByZXR1cm4ge3N0cmluZ30gcmV0dXJucyB0aGUgbWF0Y2hpbmcgZ3JvdXAgZ2l2ZW4gYnkgb3B0X21hdGNoaW5nR3JvdXBJbmRleFN0clxuICovXG5mdW5jdGlvbiBtYXRjaE1hY3JvKHN0cmluZywgbWF0Y2hQYXR0ZXJuLCBvcHRfbWF0Y2hpbmdHcm91cEluZGV4U3RyKSB7XG4gIGlmICghbWF0Y2hQYXR0ZXJuKSB7XG4gICAgdXNlcigpLndhcm4oVEFHLCAnTUFUQ0ggbWFjcm8gbXVzdCBoYXZlIHR3byBvciBtb3JlIGFyZ3VtZW50cycpO1xuICB9XG5cbiAgbGV0IGluZGV4ID0gMDtcbiAgaWYgKG9wdF9tYXRjaGluZ0dyb3VwSW5kZXhTdHIpIHtcbiAgICBpbmRleCA9IHBhcnNlSW50KG9wdF9tYXRjaGluZ0dyb3VwSW5kZXhTdHIsIDEwKTtcblxuICAgIC8vIGlmIGdpdmVuIGEgbm9uLW51bWJlciBvciBuZWdhdGl2ZSBudW1iZXJcbiAgICBpZiAoKGluZGV4ICE9IDAgJiYgIWluZGV4KSB8fCBpbmRleCA8IDApIHtcbiAgICAgIHVzZXIoKS5lcnJvcihUQUcsICdUaGlyZCBhcmd1bWVudCBpbiBNQVRDSCBtYWNybyBtdXN0IGJlIGEgbnVtYmVyID49IDAnKTtcbiAgICAgIGluZGV4ID0gMDtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAobWF0Y2hQYXR0ZXJuKTtcbiAgY29uc3QgbWF0Y2hlcyA9IHN0cmluZy5tYXRjaChyZWdleCk7XG4gIHJldHVybiBtYXRjaGVzICYmIG1hdGNoZXNbaW5kZXhdID8gbWF0Y2hlc1tpbmRleF0gOiAnJztcbn1cblxuLyoqXG4gKiBUaGlzIG1hY3JvIGZ1bmN0aW9uIGFsbG93cyBhcml0aG1ldGljIG9wZXJhdGlvbnMgb3ZlciBvdGhlciBhbmFseXRpY3MgdmFyaWFibGVzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBsZWZ0T3BlcmFuZFxuICogQHBhcmFtIHtzdHJpbmd9IHJpZ2h0T3BlcmFuZFxuICogQHBhcmFtIHtzdHJpbmd9IG9wZXJhdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IHJvdW5kIElmIHRoaXMgZmxhZyBpcyB0cnV0aHkgdGhlIHJlc3VsdCB3aWxsIGJlIHJvdW5kZWRcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gY2FsY01hY3JvKGxlZnRPcGVyYW5kLCByaWdodE9wZXJhbmQsIG9wZXJhdGlvbiwgcm91bmQpIHtcbiAgY29uc3QgbGVmdCA9IE51bWJlcihsZWZ0T3BlcmFuZCk7XG4gIGNvbnN0IHJpZ2h0ID0gTnVtYmVyKHJpZ2h0T3BlcmFuZCk7XG4gIHVzZXJBc3NlcnQoIWlzTmFOKGxlZnQpLCAnQ0FMQyBtYWNybyAtIGxlZnQgb3BlcmFuZCBtdXN0IGJlIGEgbnVtYmVyJyk7XG4gIHVzZXJBc3NlcnQoIWlzTmFOKHJpZ2h0KSwgJ0NBTEMgbWFjcm8gLSByaWdodCBvcGVyYW5kIG11c3QgYmUgYSBudW1iZXInKTtcbiAgbGV0IHJlc3VsdCA9IDA7XG4gIHN3aXRjaCAob3BlcmF0aW9uKSB7XG4gICAgY2FzZSAnYWRkJzpcbiAgICAgIHJlc3VsdCA9IGxlZnQgKyByaWdodDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3N1YnRyYWN0JzpcbiAgICAgIHJlc3VsdCA9IGxlZnQgLSByaWdodDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ211bHRpcGx5JzpcbiAgICAgIHJlc3VsdCA9IGxlZnQgKiByaWdodDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2RpdmlkZSc6XG4gICAgICB1c2VyQXNzZXJ0KHJpZ2h0LCAnQ0FMQyBtYWNybyAtIGNhbm5vdCBkaXZpZGUgYnkgMCcpO1xuICAgICAgcmVzdWx0ID0gbGVmdCAvIHJpZ2h0O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHVzZXIoKS5lcnJvcihUQUcsICdDQUxDIG1hY3JvIC0gSW52YWxpZCBvcGVyYXRpb24nKTtcbiAgfVxuICByZXR1cm4gc3RyaW5nVG9Cb29sKHJvdW5kKSA/IE1hdGgucm91bmQocmVzdWx0KSA6IHJlc3VsdDtcbn1cblxuLyoqXG4gKiBJZiBnaXZlbiBhbiBleHBlcmltZW50IG5hbWUgcmV0dXJucyB0aGUgYnJhbmNoIGlkIGlmIGEgYnJhbmNoIGlzIHNlbGVjdGVkLlxuICogSWYgbm8gYnJhbmNoIG5hbWUgZ2l2ZW4sIGl0IHJldHVybnMgYSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBhY3RpdmUgYnJhbmNoXG4gKiBleHBlcmltZW50IGlkcyBhbmQgdGhlaXIgbmFtZXMgb3IgYW4gZW1wdHkgc3RyaW5nIGlmIG5vbmUgZXhpc3QuXG4gKiBAcGFyYW0geyFXaW5kb3d9IHdpblxuICogQHBhcmFtIHtzdHJpbmc9fSBvcHRfZXhwTmFtZVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBleHBlcmltZW50QnJhbmNoZXNNYWNybyh3aW4sIG9wdF9leHBOYW1lKSB7XG4gIGlmIChvcHRfZXhwTmFtZSkge1xuICAgIHJldHVybiBnZXRFeHBlcmltZW50QnJhbmNoKHdpbiwgb3B0X2V4cE5hbWUpIHx8ICcnO1xuICB9XG4gIGNvbnN0IGJyYW5jaGVzID0gZ2V0QWN0aXZlRXhwZXJpbWVudEJyYW5jaGVzKHdpbik7XG4gIHJldHVybiBPYmplY3Qua2V5cyhicmFuY2hlcylcbiAgICAubWFwKChleHBOYW1lKSA9PiBgJHtleHBOYW1lfToke2JyYW5jaGVzW2V4cE5hbWVdfWApXG4gICAgLmpvaW4oJywnKTtcbn1cblxuLyoqXG4gKiBQcm92aWRlcyBzdXBwb3J0IGZvciBwcm9jZXNzaW5nIG9mIGFkdmFuY2VkIHZhcmlhYmxlIHN5bnRheCBsaWtlIG5lc3RlZFxuICogZXhwYW5zaW9ucyBtYWNyb3MgZXRjLlxuICovXG5leHBvcnQgY2xhc3MgVmFyaWFibGVTZXJ2aWNlIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbXBkb2MpIHtcbiAgICAvKiogQHByaXZhdGUgeyEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9ICovXG4gICAgdGhpcy5hbXBkb2NfID0gYW1wZG9jO1xuXG4gICAgLyoqIEBwcml2YXRlIHshSnNvbk9iamVjdH0gKi9cbiAgICB0aGlzLm1hY3Jvc18gPSBkaWN0KHt9KTtcblxuICAgIC8qKiBAY29uc3QgQHByaXZhdGUgeyEuL2xpbmtlci1yZWFkZXIuTGlua2VyUmVhZGVyfSAqL1xuICAgIHRoaXMubGlua2VyUmVhZGVyXyA9IGxpbmtlclJlYWRlclNlcnZpY2VGb3IodGhpcy5hbXBkb2NfLndpbik7XG5cbiAgICAvKiogQGNvbnN0IEBwcml2YXRlIHshUHJvbWlzZTxTZXNzaW9uTWFuYWdlcj59ICovXG4gICAgdGhpcy5zZXNzaW9uTWFuYWdlclByb21pc2VfID0gc2Vzc2lvblNlcnZpY2VQcm9taXNlRm9yRG9jKHRoaXMuYW1wZG9jXyk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyXygnJERFRkFVTFQnLCBkZWZhdWx0TWFjcm8pO1xuICAgIHRoaXMucmVnaXN0ZXJfKCckU1VCU1RSJywgc3Vic3RyTWFjcm8pO1xuICAgIHRoaXMucmVnaXN0ZXJfKCckVFJJTScsICh2YWx1ZSkgPT4gdmFsdWUudHJpbSgpKTtcbiAgICB0aGlzLnJlZ2lzdGVyXygnJFRPTE9XRVJDQVNFJywgKHZhbHVlKSA9PiB2YWx1ZS50b0xvd2VyQ2FzZSgpKTtcbiAgICB0aGlzLnJlZ2lzdGVyXygnJFRPVVBQRVJDQVNFJywgKHZhbHVlKSA9PiB2YWx1ZS50b1VwcGVyQ2FzZSgpKTtcbiAgICB0aGlzLnJlZ2lzdGVyXygnJE5PVCcsICh2YWx1ZSkgPT4gU3RyaW5nKCF2YWx1ZSkpO1xuICAgIHRoaXMucmVnaXN0ZXJfKCckQkFTRTY0JywgKHZhbHVlKSA9PiBiYXNlNjRVcmxFbmNvZGVGcm9tU3RyaW5nKHZhbHVlKSk7XG4gICAgdGhpcy5yZWdpc3Rlcl8oJyRIQVNIJywgdGhpcy5oYXNoTWFjcm9fLmJpbmQodGhpcykpO1xuICAgIHRoaXMucmVnaXN0ZXJfKCckSUYnLCAodmFsdWUsIHRoZW5WYWx1ZSwgZWxzZVZhbHVlKSA9PlxuICAgICAgc3RyaW5nVG9Cb29sKHZhbHVlKSA/IHRoZW5WYWx1ZSA6IGVsc2VWYWx1ZVxuICAgICk7XG4gICAgdGhpcy5yZWdpc3Rlcl8oJyRSRVBMQUNFJywgcmVwbGFjZU1hY3JvKTtcbiAgICB0aGlzLnJlZ2lzdGVyXygnJE1BVENIJywgbWF0Y2hNYWNybyk7XG4gICAgdGhpcy5yZWdpc3Rlcl8oJyRDQUxDJywgY2FsY01hY3JvKTtcbiAgICB0aGlzLnJlZ2lzdGVyXyhcbiAgICAgICckRVFVQUxTJyxcbiAgICAgIChmaXJzdFZhbHVlLCBzZWNWYWx1ZSkgPT4gZmlyc3RWYWx1ZSA9PT0gc2VjVmFsdWVcbiAgICApO1xuICAgIHRoaXMucmVnaXN0ZXJfKCdMSU5LRVJfUEFSQU0nLCAobmFtZSwgaWQpID0+XG4gICAgICB0aGlzLmxpbmtlclJlYWRlcl8uZ2V0KG5hbWUsIGlkKVxuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBJQU5BIHRpbWV6b25lIGNvZGVcbiAgICB0aGlzLnJlZ2lzdGVyXygnVElNRVpPTkVfQ09ERScsICgpID0+IHtcbiAgICAgIGxldCB0ekNvZGUgPSAnJztcbiAgICAgIGlmIChcbiAgICAgICAgJ0ludGwnIGluIHRoaXMuYW1wZG9jXy53aW4gJiZcbiAgICAgICAgJ0RhdGVUaW1lRm9ybWF0JyBpbiB0aGlzLmFtcGRvY18ud2luLkludGxcbiAgICAgICkge1xuICAgICAgICAvLyBJdCBjb3VsZCBiZSB1bmRlZmluZWQgKGkuZS4gSUUxMSlcbiAgICAgICAgdHpDb2RlID0gbmV3IHRoaXMuYW1wZG9jXy53aW4uSW50bC5EYXRlVGltZUZvcm1hdCgpLnJlc29sdmVkT3B0aW9ucygpXG4gICAgICAgICAgLnRpbWVab25lO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHpDb2RlO1xuICAgIH0pO1xuXG4gICAgLy8gUmV0dXJucyBhIHByb21pc2UgcmVzb2x2aW5nIHRvIHZpZXdwb3J0LmdldFNjcm9sbFRvcC5cbiAgICB0aGlzLnJlZ2lzdGVyXygnU0NST0xMX1RPUCcsICgpID0+XG4gICAgICBNYXRoLnJvdW5kKFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKHRoaXMuYW1wZG9jXykuZ2V0U2Nyb2xsVG9wKCkpXG4gICAgKTtcblxuICAgIC8vIFJldHVybnMgYSBwcm9taXNlIHJlc29sdmluZyB0byB2aWV3cG9ydC5nZXRTY3JvbGxMZWZ0LlxuICAgIHRoaXMucmVnaXN0ZXJfKCdTQ1JPTExfTEVGVCcsICgpID0+XG4gICAgICBNYXRoLnJvdW5kKFNlcnZpY2VzLnZpZXdwb3J0Rm9yRG9jKHRoaXMuYW1wZG9jXykuZ2V0U2Nyb2xsTGVmdCgpKVxuICAgICk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyXygnRVhQRVJJTUVOVF9CUkFOQ0hFUycsIChvcHRfZXhwTmFtZSkgPT5cbiAgICAgIGV4cGVyaW1lbnRCcmFuY2hlc01hY3JvKHRoaXMuYW1wZG9jXy53aW4sIG9wdF9leHBOYW1lKVxuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBjb250ZW50IG9mIGEgbWV0YSB0YWcgaW4gdGhlIGFtcGRvY1xuICAgIHRoaXMucmVnaXN0ZXJfKCdBTVBET0NfTUVUQScsIChtZXRhLCBkZWZhdWx0VmFsdWUgPSAnJykgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuYW1wZG9jXy5nZXRNZXRhQnlOYW1lKG1ldGEpID8/IGRlZmF1bHRWYWx1ZTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gICAqIEByZXR1cm4geyFKc29uT2JqZWN0fSBjb250YWlucyBhbGwgcmVnaXN0ZXJlZCBtYWNyb3NcbiAgICovXG4gIGdldE1hY3JvcyhlbGVtZW50KSB7XG4gICAgY29uc3QgdHlwZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0eXBlJyk7XG4gICAgY29uc3QgZWxlbWVudE1hY3JvcyA9IHtcbiAgICAgICdDT09LSUUnOiAobmFtZSkgPT5cbiAgICAgICAgY29va2llUmVhZGVyKHRoaXMuYW1wZG9jXy53aW4sIGRldigpLmFzc2VydEVsZW1lbnQoZWxlbWVudCksIG5hbWUpLFxuICAgICAgJ0NPTlNFTlRfU1RBVEUnOiBnZXRDb25zZW50U3RhdGVTdHIoZWxlbWVudCksXG4gICAgICAnQ09OU0VOVF9TVFJJTkcnOiBnZXRDb25zZW50UG9saWN5SW5mbyhlbGVtZW50KSxcbiAgICAgICdDT05TRU5UX01FVEFEQVRBJzogKGtleSkgPT5cbiAgICAgICAgZ2V0Q29uc2VudE1ldGFkYXRhVmFsdWUoXG4gICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICB1c2VyQXNzZXJ0KGtleSwgJ0NPTlNFTlRfTUVUQURBVEEgbWFjcm8gbXVzdCBjb250YWluIGEga2V5JylcbiAgICAgICAgKSxcbiAgICAgICdTRVNTSU9OX0lEJzogKCkgPT5cbiAgICAgICAgdGhpcy5nZXRTZXNzaW9uVmFsdWVfKHR5cGUsIFNFU1NJT05fVkFMVUVTLlNFU1NJT05fSUQpLFxuICAgICAgJ1NFU1NJT05fVElNRVNUQU1QJzogKCkgPT5cbiAgICAgICAgdGhpcy5nZXRTZXNzaW9uVmFsdWVfKHR5cGUsIFNFU1NJT05fVkFMVUVTLkNSRUFUSU9OX1RJTUVTVEFNUCksXG4gICAgICAnU0VTU0lPTl9DT1VOVCc6ICgpID0+IHRoaXMuZ2V0U2Vzc2lvblZhbHVlXyh0eXBlLCBTRVNTSU9OX1ZBTFVFUy5DT1VOVCksXG4gICAgICAnU0VTU0lPTl9FVkVOVF9USU1FU1RBTVAnOiAoKSA9PlxuICAgICAgICB0aGlzLmdldFNlc3Npb25WYWx1ZV8odHlwZSwgU0VTU0lPTl9WQUxVRVMuRVZFTlRfVElNRVNUQU1QKSxcbiAgICAgICdTRVNTSU9OX0VOR0FHRUQnOiAoKSA9PlxuICAgICAgICB0aGlzLmdldFNlc3Npb25WYWx1ZV8odHlwZSwgU0VTU0lPTl9WQUxVRVMuRU5HQUdFRCksXG4gICAgfTtcbiAgICBjb25zdCBwZXJmTWFjcm9zID0gaXNJbkZpZShlbGVtZW50KVxuICAgICAgPyB7fVxuICAgICAgOiB7XG4gICAgICAgICAgJ0ZJUlNUX0NPTlRFTlRGVUxfUEFJTlQnOiAoKSA9PlxuICAgICAgICAgICAgU2VydmljZXMucGVyZm9ybWFuY2VGb3IodGhpcy5hbXBkb2NfLndpbikuZ2V0TWV0cmljKFxuICAgICAgICAgICAgICBUaWNrTGFiZWwuRklSU1RfQ09OVEVOVEZVTF9QQUlOVF9WSVNJQkxFXG4gICAgICAgICAgICApLFxuICAgICAgICAgICdGSVJTVF9WSUVXUE9SVF9SRUFEWSc6ICgpID0+XG4gICAgICAgICAgICBTZXJ2aWNlcy5wZXJmb3JtYW5jZUZvcih0aGlzLmFtcGRvY18ud2luKS5nZXRNZXRyaWMoXG4gICAgICAgICAgICAgIFRpY2tMYWJlbC5GSVJTVF9WSUVXUE9SVF9SRUFEWVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAnTUFLRV9CT0RZX1ZJU0lCTEUnOiAoKSA9PlxuICAgICAgICAgICAgU2VydmljZXMucGVyZm9ybWFuY2VGb3IodGhpcy5hbXBkb2NfLndpbikuZ2V0TWV0cmljKFxuICAgICAgICAgICAgICBUaWNrTGFiZWwuTUFLRV9CT0RZX1ZJU0lCTEVcbiAgICAgICAgICAgICksXG4gICAgICAgICAgJ0xBUkdFU1RfQ09OVEVOVEZVTF9QQUlOVCc6ICgpID0+XG4gICAgICAgICAgICBTZXJ2aWNlcy5wZXJmb3JtYW5jZUZvcih0aGlzLmFtcGRvY18ud2luKS5nZXRNZXRyaWMoXG4gICAgICAgICAgICAgIFRpY2tMYWJlbC5MQVJHRVNUX0NPTlRFTlRGVUxfUEFJTlRfVklTSUJMRVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAnRklSU1RfSU5QVVRfREVMQVknOiAoKSA9PlxuICAgICAgICAgICAgU2VydmljZXMucGVyZm9ybWFuY2VGb3IodGhpcy5hbXBkb2NfLndpbikuZ2V0TWV0cmljKFxuICAgICAgICAgICAgICBUaWNrTGFiZWwuRklSU1RfSU5QVVRfREVMQVlcbiAgICAgICAgICAgICksXG4gICAgICAgICAgJ0NVTVVMQVRJVkVfTEFZT1VUX1NISUZUJzogKCkgPT5cbiAgICAgICAgICAgIFNlcnZpY2VzLnBlcmZvcm1hbmNlRm9yKHRoaXMuYW1wZG9jXy53aW4pLmdldE1ldHJpYyhcbiAgICAgICAgICAgICAgVGlja0xhYmVsLkNVTVVMQVRJVkVfTEFZT1VUX1NISUZUXG4gICAgICAgICAgICApLFxuICAgICAgICB9O1xuICAgIGNvbnN0IG1lcmdlZCA9IHtcbiAgICAgIC4uLnRoaXMubWFjcm9zXyxcbiAgICAgIC4uLmVsZW1lbnRNYWNyb3MsXG4gICAgICAuLi5wZXJmTWFjcm9zLFxuICAgIH07XG4gICAgcmV0dXJuIC8qKiBAdHlwZSB7IUpzb25PYmplY3R9ICovIChtZXJnZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2ZW5kb3JUeXBlXG4gICAqIEBwYXJhbSB7IVNFU1NJT05fVkFMVUVTfSBrZXlcbiAgICogQHJldHVybiB7IVByb21pc2U8bnVtYmVyPn1cbiAgICovXG4gIGdldFNlc3Npb25WYWx1ZV8odmVuZG9yVHlwZSwga2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbk1hbmFnZXJQcm9taXNlXy50aGVuKChzZXNzaW9uTWFuYWdlcikgPT4ge1xuICAgICAgcmV0dXJuIHNlc3Npb25NYW5hZ2VyLmdldFNlc3Npb25WYWx1ZSh2ZW5kb3JUeXBlLCBrZXkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRPRE8gKG1pY2FqdWluZWhvKTogSWYgd2UgYWRkIG5ldyBzeW5jaHJvbm91cyBtYWNyb3MsIHdlXG4gICAqIHdpbGwgbmVlZCB0byBzcGxpdCB0aGlzIG1ldGhvZCBhbmQgZ2V0TWFjcm9zIGludG8gc3luYyBhbmRcbiAgICogYXN5bmMgdmVyc2lvbiAoY3VycmVudGx5IGFsbCBtYWNyb3MgYXJlIGFzeW5jKS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHsqfSBtYWNyb1xuICAgKi9cbiAgcmVnaXN0ZXJfKG5hbWUsIG1hY3JvKSB7XG4gICAgZGV2QXNzZXJ0KCF0aGlzLm1hY3Jvc19bbmFtZV0sICdNYWNybyBcIicgKyBuYW1lICsgJ1wiIGFscmVhZHkgcmVnaXN0ZXJlZC4nKTtcbiAgICB0aGlzLm1hY3Jvc19bbmFtZV0gPSBtYWNybztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0ZW1wbGF0ZXMgZnJvbSAke30gZm9ybWF0IHRvIE1BQ1JPKCkgYW5kIHJlc29sdmVzIGFueSBwbGF0Zm9ybVxuICAgKiBsZXZlbCBtYWNyb3Mgd2hlbiBlbmNvdW50ZXJlZC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRlbXBsYXRlIFRoZSB0ZW1wbGF0ZSB0byBleHBhbmQuXG4gICAqIEBwYXJhbSB7IUV4cGFuc2lvbk9wdGlvbnN9IG9wdGlvbnMgY29uZmlndXJhdGlvbiB0byB1c2UgZm9yIGV4cGFuc2lvbi5cbiAgICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudCBhbXAtYW5hbHl0aWNzIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7IUpzb25PYmplY3Q9fSBvcHRfYmluZGluZ3NcbiAgICogQHBhcmFtIHshT2JqZWN0PX0gb3B0X2FsbG93bGlzdFxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fSBUaGUgZXhwYW5kZWQgc3RyaW5nLlxuICAgKi9cbiAgZXhwYW5kVGVtcGxhdGUodGVtcGxhdGUsIG9wdGlvbnMsIGVsZW1lbnQsIG9wdF9iaW5kaW5ncywgb3B0X2FsbG93bGlzdCkge1xuICAgIHJldHVybiBhc3luY1N0cmluZ1JlcGxhY2UodGVtcGxhdGUsIC9cXCR7KFtefV0qKX0vZywgKG1hdGNoLCBrZXkpID0+IHtcbiAgICAgIGlmIChvcHRpb25zLml0ZXJhdGlvbnMgPCAwKSB7XG4gICAgICAgIHVzZXIoKS5lcnJvcihcbiAgICAgICAgICBUQUcsXG4gICAgICAgICAgJ01heGltdW0gZGVwdGggcmVhY2hlZCB3aGlsZSBleHBhbmRpbmcgdmFyaWFibGVzLiAnICtcbiAgICAgICAgICAgICdQbGVhc2UgZW5zdXJlIHRoYXQgdGhlIHZhcmlhYmxlcyBhcmUgbm90IHJlY3Vyc2l2ZS4nXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgIH1cblxuICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICAvLyBTcGxpdCB0aGUga2V5IHRvIG5hbWUgYW5kIGFyZ3NcbiAgICAgIC8vIGUuZy46IG5hbWU9J1NPTUVfTUFDUk8nLCBhcmdzPScoYXJnMSwgYXJnMiknXG4gICAgICBjb25zdCB7YXJnTGlzdCwgbmFtZX0gPSBnZXROYW1lQXJncyhrZXkpO1xuICAgICAgaWYgKG9wdGlvbnMuZnJlZXplVmFyc1tuYW1lXSkge1xuICAgICAgICAvLyBEbyBub3RoaW5nIHdpdGggZnJvemVuIHBhcmFtc1xuICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICB9XG5cbiAgICAgIGxldCB2YWx1ZSA9IG9wdGlvbnMuZ2V0VmFyKG5hbWUpO1xuICAgICAgY29uc3QgdXJsUmVwbGFjZW1lbnRzID0gU2VydmljZXMudXJsUmVwbGFjZW1lbnRzRm9yRG9jKGVsZW1lbnQpO1xuXG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgICAgIHZhbHVlID0gdGhpcy5leHBhbmRWYWx1ZUFuZFJlcGxhY2VBc3luY18oXG4gICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgIHVybFJlcGxhY2VtZW50cyxcbiAgICAgICAgICBvcHRfYmluZGluZ3MsXG4gICAgICAgICAgb3B0X2FsbG93bGlzdCxcbiAgICAgICAgICBhcmdMaXN0XG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIC8vIFRyZWF0IGVhY2ggdmFsdWUgYXMgYSB0ZW1wbGF0ZSBhbmQgZXhwYW5kXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YWx1ZVtpXSA9XG4gICAgICAgICAgICB0eXBlb2YgdmFsdWVbaV0gPT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgPyB0aGlzLmV4cGFuZFZhbHVlQW5kUmVwbGFjZUFzeW5jXyhcbiAgICAgICAgICAgICAgICAgIHZhbHVlW2ldLFxuICAgICAgICAgICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICB1cmxSZXBsYWNlbWVudHMsXG4gICAgICAgICAgICAgICAgICBvcHRfYmluZGluZ3MsXG4gICAgICAgICAgICAgICAgICBvcHRfYWxsb3dsaXN0XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICA6IHZhbHVlW2ldO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlID0gUHJvbWlzZS5hbGwoLyoqIEB0eXBlIHshQXJyYXk8c3RyaW5nPn0gKi8gKHZhbHVlKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oKHZhbHVlKSA9PlxuICAgICAgICAhb3B0aW9ucy5ub0VuY29kZVxuICAgICAgICAgID8gZW5jb2RlVmFycygvKiogQHR5cGUge3N0cmluZ3w/QXJyYXk8c3RyaW5nPn0gKi8gKHZhbHVlKSlcbiAgICAgICAgICA6IHZhbHVlXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgKiBAcGFyYW0geyFFeHBhbnNpb25PcHRpb25zfSBvcHRpb25zXG4gICAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnQgYW1wLWFuYWx5dGljcyBlbGVtZW50LlxuICAgKiBAcGFyYW0geyEuLi8uLi8uLi9zcmMvc2VydmljZS91cmwtcmVwbGFjZW1lbnRzLWltcGwuVXJsUmVwbGFjZW1lbnRzfSB1cmxSZXBsYWNlbWVudHNcbiAgICogQHBhcmFtIHshSnNvbk9iamVjdD19IG9wdF9iaW5kaW5nc1xuICAgKiBAcGFyYW0geyFPYmplY3Q9fSBvcHRfYWxsb3dsaXN0XG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gb3B0X2FyZ0xpc3RcbiAgICogQHJldHVybiB7UHJvbWlzZTxzdHJpbmc+fVxuICAgKi9cbiAgZXhwYW5kVmFsdWVBbmRSZXBsYWNlQXN5bmNfKFxuICAgIHZhbHVlLFxuICAgIG9wdGlvbnMsXG4gICAgZWxlbWVudCxcbiAgICB1cmxSZXBsYWNlbWVudHMsXG4gICAgb3B0X2JpbmRpbmdzLFxuICAgIG9wdF9hbGxvd2xpc3QsXG4gICAgb3B0X2FyZ0xpc3RcbiAgKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhwYW5kVGVtcGxhdGUoXG4gICAgICB2YWx1ZSxcbiAgICAgIG5ldyBFeHBhbnNpb25PcHRpb25zKFxuICAgICAgICBvcHRpb25zLnZhcnMsXG4gICAgICAgIG9wdGlvbnMuaXRlcmF0aW9ucyAtIDEsXG4gICAgICAgIHRydWUgLyogbm9FbmNvZGUgKi9cbiAgICAgICksXG4gICAgICBlbGVtZW50LFxuICAgICAgb3B0X2JpbmRpbmdzLFxuICAgICAgb3B0X2FsbG93bGlzdFxuICAgICkudGhlbigodmFsKSA9PlxuICAgICAgdXJsUmVwbGFjZW1lbnRzLmV4cGFuZFN0cmluZ0FzeW5jKFxuICAgICAgICBvcHRfYXJnTGlzdCA/IHZhbCArIG9wdF9hcmdMaXN0IDogdmFsLFxuICAgICAgICBvcHRfYmluZGluZ3MgfHwgdGhpcy5nZXRNYWNyb3MoZWxlbWVudCksXG4gICAgICAgIG9wdF9hbGxvd2xpc3RcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fVxuICAgKi9cbiAgaGFzaE1hY3JvXyh2YWx1ZSkge1xuICAgIHJldHVybiBTZXJ2aWNlcy5jcnlwdG9Gb3IodGhpcy5hbXBkb2NfLndpbikuc2hhMzg0QmFzZTY0KHZhbHVlKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfD9BcnJheTxzdHJpbmc+fSByYXcgVGhlIHZhbHVlcyB0byBVUkkgZW5jb2RlLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgZW5jb2RlZCB2YWx1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZVZhcnMocmF3KSB7XG4gIGlmIChyYXcgPT0gbnVsbCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGlmIChpc0FycmF5KHJhdykpIHtcbiAgICByZXR1cm4gcmF3Lm1hcChlbmNvZGVWYXJzKS5qb2luKCcsJyk7XG4gIH1cbiAgLy8gU2VwYXJhdGUgb3V0IG5hbWVzIGFuZCBhcmd1bWVudHMgZnJvbSB0aGUgdmFsdWUgYW5kIGVuY29kZSB0aGUgdmFsdWUuXG4gIGNvbnN0IHthcmdMaXN0LCBuYW1lfSA9IGdldE5hbWVBcmdzKFN0cmluZyhyYXcpKTtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChuYW1lKSArIGFyZ0xpc3Q7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHR3byB2YWx1ZXM6IG5hbWUgYW5kIGFyZ3MgcGFyc2VkIGZyb20gdGhlIGtleS5cbiAqXG4gKiBjYXNlIDEpICdTT01FX01BQ1JPKGFiYyxkZWYpJyA9PiBuYW1lPSdTT01FX01BQ1JPJywgYXJnTGlzdD0nKGFiYyxkZWYpJ1xuICogY2FzZSAyKSAncmFuZG9tU3RyaW5nJyA9PiBuYW1lPSdyYW5kb21TdHJpbmcnLCBhcmdMaXN0PScnXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgdG8gYmUgcGFyc2VkLlxuICogQHJldHVybiB7IUZ1bmN0aW9uTmFtZUFyZ3NEZWZ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXROYW1lQXJncyhrZXkpIHtcbiAgaWYgKCFrZXkpIHtcbiAgICByZXR1cm4ge25hbWU6ICcnLCBhcmdMaXN0OiAnJ307XG4gIH1cbiAgY29uc3QgbWF0Y2ggPSBrZXkubWF0Y2goVkFSSUFCTEVfQVJHU19SRUdFWFApO1xuICB1c2VyQXNzZXJ0KG1hdGNoLCAnVmFyaWFibGUgd2l0aCBpbnZhbGlkIGZvcm1hdCBmb3VuZDogJyArIGtleSk7XG5cbiAgcmV0dXJuIHtuYW1lOiBtYXRjaFsxXSB8fCBtYXRjaFswXSwgYXJnTGlzdDogbWF0Y2hbMl0gfHwgJyd9O1xufVxuXG4vKipcbiAqIEBwYXJhbSB7IS4uLy4uLy4uL3NyYy9zZXJ2aWNlL2FtcGRvYy1pbXBsLkFtcERvY30gYW1wZG9jXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsVmFyaWFibGVTZXJ2aWNlRm9yVGVzdGluZyhhbXBkb2MpIHtcbiAgcmVnaXN0ZXJTZXJ2aWNlQnVpbGRlckZvckRvYyhcbiAgICBhbXBkb2MsXG4gICAgJ2FtcC1hbmFseXRpY3MtdmFyaWFibGVzJyxcbiAgICBWYXJpYWJsZVNlcnZpY2VcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFFbGVtZW50fCFTaGFkb3dSb290fCEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGVsZW1lbnRPckFtcERvY1xuICogQHJldHVybiB7IVZhcmlhYmxlU2VydmljZX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhcmlhYmxlU2VydmljZUZvckRvYyhlbGVtZW50T3JBbXBEb2MpIHtcbiAgcmV0dXJuIGdldFNlcnZpY2VGb3JEb2MoZWxlbWVudE9yQW1wRG9jLCAnYW1wLWFuYWx5dGljcy12YXJpYWJsZXMnKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0geyFFbGVtZW50fCFTaGFkb3dSb290fCEuLi8uLi8uLi9zcmMvc2VydmljZS9hbXBkb2MtaW1wbC5BbXBEb2N9IGVsZW1lbnRPckFtcERvY1xuICogQHJldHVybiB7IVByb21pc2U8IVZhcmlhYmxlU2VydmljZT59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YXJpYWJsZVNlcnZpY2VQcm9taXNlRm9yRG9jKGVsZW1lbnRPckFtcERvYykge1xuICByZXR1cm4gLyoqIEB0eXBlIHshUHJvbWlzZTwhVmFyaWFibGVTZXJ2aWNlPn0gKi8gKFxuICAgIGdldFNlcnZpY2VQcm9taXNlRm9yRG9jKGVsZW1lbnRPckFtcERvYywgJ2FtcC1hbmFseXRpY3MtdmFyaWFibGVzJylcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHt7bmFtZSwgYXJnTGlzdH18IUZ1bmN0aW9uTmFtZUFyZ3NEZWZ9XG4gKiBAdmlzaWJsZUZvclRlc3RpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5hbWVBcmdzRm9yVGVzdGluZyhrZXkpIHtcbiAgcmV0dXJuIGdldE5hbWVBcmdzKGtleSk7XG59XG5cbi8qKlxuICogR2V0IHRoZSByZXNvbHZlZCBjb25zZW50IHN0YXRlIHZhbHVlIHRvIHNlbmQgd2l0aCBhbmFseXRpY3MgcmVxdWVzdFxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7IVByb21pc2U8P3N0cmluZz59XG4gKi9cbmZ1bmN0aW9uIGdldENvbnNlbnRTdGF0ZVN0cihlbGVtZW50KSB7XG4gIHJldHVybiBnZXRDb25zZW50UG9saWN5U3RhdGUoZWxlbWVudCkudGhlbigoY29uc2VudCkgPT4ge1xuICAgIGlmICghY29uc2VudCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBFWFRFUk5BTF9DT05TRU5UX1BPTElDWV9TVEFURV9TVFJJTkdbY29uc2VudF07XG4gIH0pO1xufVxuXG4vKipcbiAqIEdldCB0aGUgYXNzb2NpYXRlZCB2YWx1ZSBmcm9tIHRoZSByZXNvbHZlZCBjb25zZW50IG1ldGFkYXRhIG9iamVjdFxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHJldHVybiB7IVByb21pc2U8P09iamVjdD59XG4gKi9cbmZ1bmN0aW9uIGdldENvbnNlbnRNZXRhZGF0YVZhbHVlKGVsZW1lbnQsIGtleSkge1xuICAvLyBHZXQgdGhlIG1ldGFkYXRhIHVzaW5nIHRoZSBkZWZhdWx0IHBvbGljeSBpZFxuICByZXR1cm4gZ2V0Q29uc2VudE1ldGFkYXRhKGVsZW1lbnQpLnRoZW4oKGNvbnNlbnRNZXRhZGF0YSkgPT4ge1xuICAgIGlmICghY29uc2VudE1ldGFkYXRhKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnNlbnRNZXRhZGF0YVtrZXldO1xuICB9KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBzdHJpbmcgdG8gYm9vbGVhblxuICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1RvQm9vbChzdHIpIHtcbiAgcmV0dXJuIChcbiAgICBzdHIgIT09ICdmYWxzZScgJiZcbiAgICBzdHIgIT09ICcnICYmXG4gICAgc3RyICE9PSAnMCcgJiZcbiAgICBzdHIgIT09ICdudWxsJyAmJlxuICAgIHN0ciAhPT0gJ05hTicgJiZcbiAgICBzdHIgIT09ICd1bmRlZmluZWQnXG4gICk7XG59XG4iXX0=
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/variables.js