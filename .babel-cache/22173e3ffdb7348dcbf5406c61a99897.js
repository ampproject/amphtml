function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
import {
getConsentMetadata,
getConsentPolicyInfo,
getConsentPolicyState } from "../../../src/consent";

import {
getServiceForDoc,
getServicePromiseForDoc,
registerServiceBuilderForDoc } from "../../../src/service-helpers";

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
  4: 'unknown' };


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
  function ExpansionOptions(vars, opt_iterations, opt_noEncode) {_classCallCheck(this, ExpansionOptions);
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
   */_createClass(ExpansionOptions, [{ key: "freezeVar", value:
    function freezeVar(str) {
      this.freezeVars[str] = true;
    }

    /**
     * @param {string} name
     * @return {*}
     */ }, { key: "getVar", value:
    function getVar(name) {
      var value = this.vars[name];
      if (value == null) {
        value = '';
      }
      return value;
    } }]);return ExpansionOptions;}();


/**
 * @param {string} value
 * @param {string} s
 * @param {string=} opt_l
 * @return {string}
 */
function substrMacro(value, s, opt_l) {
  var start = Number(s);
  var length = value.length;
  userAssert(
  isFiniteNumber(start),
  'Start index ' + start + 'in substr macro should be a number');

  if (opt_l) {
    length = Number(opt_l);
    userAssert(
    isFiniteNumber(length),
    'Length ' + length + ' in substr macro should be a number');

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
    if ((index != 0 && !index) || index < 0) {
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
      user().error(TAG, 'CALC macro - Invalid operation');}

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
  return Object.keys(branches).
  map(function (expName) {return "".concat(expName, ":").concat(branches[expName]);}).
  join(',');
}

/**
 * Provides support for processing of advanced variable syntax like nested
 * expansions macros etc.
 */
export var VariableService = /*#__PURE__*/function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function VariableService(ampdoc) {var _this = this;_classCallCheck(this, VariableService);
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
    this.register_('$TRIM', function (value) {return value.trim();});
    this.register_('$TOLOWERCASE', function (value) {return value.toLowerCase();});
    this.register_('$TOUPPERCASE', function (value) {return value.toUpperCase();});
    this.register_('$NOT', function (value) {return String(!value);});
    this.register_('$BASE64', function (value) {return base64UrlEncodeFromString(value);});
    this.register_('$HASH', this.hashMacro_.bind(this));
    this.register_('$IF', function (value, thenValue, elseValue) {return (
        stringToBool(value) ? thenValue : elseValue);});

    this.register_('$REPLACE', replaceMacro);
    this.register_('$MATCH', matchMacro);
    this.register_('$CALC', calcMacro);
    this.register_(
    '$EQUALS',
    function (firstValue, secValue) {return firstValue === secValue;});

    this.register_('LINKER_PARAM', function (name, id) {return (
        _this.linkerReader_.get(name, id));});


    // Returns the IANA timezone code
    this.register_('TIMEZONE_CODE', function () {
      var tzCode = '';
      if (
      'Intl' in _this.ampdoc_.win &&
      'DateTimeFormat' in _this.ampdoc_.win.Intl)
      {
        // It could be undefined (i.e. IE11)
        tzCode = new _this.ampdoc_.win.Intl.DateTimeFormat().resolvedOptions().
        timeZone;
      }

      return tzCode;
    });

    // Returns a promise resolving to viewport.getScrollTop.
    this.register_('SCROLL_TOP', function () {return (
        Math.round(Services.viewportForDoc(_this.ampdoc_).getScrollTop()));});


    // Returns a promise resolving to viewport.getScrollLeft.
    this.register_('SCROLL_LEFT', function () {return (
        Math.round(Services.viewportForDoc(_this.ampdoc_).getScrollLeft()));});


    this.register_('EXPERIMENT_BRANCHES', function (opt_expName) {return (
        experimentBranchesMacro(_this.ampdoc_.win, opt_expName));});


    // Returns the content of a meta tag in the ampdoc
    this.register_('AMPDOC_META', function (meta) {var _this$ampdoc_$getMeta;var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      return (_this$ampdoc_$getMeta = _this.ampdoc_.getMetaByName(meta)) !== null && _this$ampdoc_$getMeta !== void 0 ? _this$ampdoc_$getMeta : defaultValue;
    });
  }

  /**
   * @param {!Element} element
   * @return {!JsonObject} contains all registered macros
   */_createClass(VariableService, [{ key: "getMacros", value:
    function getMacros(element) {var _this2 = this;
      var type = element.getAttribute('type');
      var elementMacros = {
        'COOKIE': function COOKIE(name) {return (
            cookieReader(_this2.ampdoc_.win, /** @type {!Element} */(element), name));},
        'CONSENT_STATE': getConsentStateStr(element),
        'CONSENT_STRING': getConsentPolicyInfo(element),
        'CONSENT_METADATA': function CONSENT_METADATA(key) {return (
            getConsentMetadataValue(
            element,
            userAssert(key, 'CONSENT_METADATA macro must contain a key')));},

        'SESSION_ID': function SESSION_ID() {return (
            _this2.getSessionValue_(type, SESSION_VALUES.SESSION_ID));},
        'SESSION_TIMESTAMP': function SESSION_TIMESTAMP() {return (
            _this2.getSessionValue_(type, SESSION_VALUES.CREATION_TIMESTAMP));},
        'SESSION_COUNT': function SESSION_COUNT() {return _this2.getSessionValue_(type, SESSION_VALUES.COUNT);},
        'SESSION_EVENT_TIMESTAMP': function SESSION_EVENT_TIMESTAMP() {return (
            _this2.getSessionValue_(type, SESSION_VALUES.EVENT_TIMESTAMP));},
        'SESSION_ENGAGED': function SESSION_ENGAGED() {return (
            _this2.getSessionValue_(type, SESSION_VALUES.ENGAGED));} };

      var perfMacros = isInFie(element) ?
      {} :
      {
        'FIRST_CONTENTFUL_PAINT': function FIRST_CONTENTFUL_PAINT() {return (
            Services.performanceFor(_this2.ampdoc_.win).getMetric(
            TickLabel.FIRST_CONTENTFUL_PAINT_VISIBLE));},

        'FIRST_VIEWPORT_READY': function FIRST_VIEWPORT_READY() {return (
            Services.performanceFor(_this2.ampdoc_.win).getMetric(
            TickLabel.FIRST_VIEWPORT_READY));},

        'MAKE_BODY_VISIBLE': function MAKE_BODY_VISIBLE() {return (
            Services.performanceFor(_this2.ampdoc_.win).getMetric(
            TickLabel.MAKE_BODY_VISIBLE));},

        'LARGEST_CONTENTFUL_PAINT': function LARGEST_CONTENTFUL_PAINT() {return (
            Services.performanceFor(_this2.ampdoc_.win).getMetric(
            TickLabel.LARGEST_CONTENTFUL_PAINT_VISIBLE));},

        'FIRST_INPUT_DELAY': function FIRST_INPUT_DELAY() {return (
            Services.performanceFor(_this2.ampdoc_.win).getMetric(
            TickLabel.FIRST_INPUT_DELAY));},

        'CUMULATIVE_LAYOUT_SHIFT': function CUMULATIVE_LAYOUT_SHIFT() {return (
            Services.performanceFor(_this2.ampdoc_.win).getMetric(
            TickLabel.CUMULATIVE_LAYOUT_SHIFT));} };


      var merged = _objectSpread(_objectSpread(_objectSpread({},
      this.macros_),
      elementMacros),
      perfMacros);

      return (/** @type {!JsonObject} */(merged));
    }

    /**
     *
     * @param {string} vendorType
     * @param {!SESSION_VALUES} key
     * @return {!Promise<number>}
     */ }, { key: "getSessionValue_", value:
    function getSessionValue_(vendorType, key) {
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
     */ }, { key: "register_", value:
    function register_(name, macro) {
      devAssert(!this.macros_[name]);
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
     */ }, { key: "expandTemplate", value:
    function expandTemplate(template, options, element, opt_bindings, opt_allowlist) {var _this3 = this;
      return asyncStringReplace(template, /\${([^}]*)}/g, function (match, key) {
        if (options.iterations < 0) {
          user().error(
          TAG,
          'Maximum depth reached while expanding variables. ' +
          'Please ensure that the variables are not recursive.');

          return match;
        }

        if (!key) {
          return '';
        }

        // Split the key to name and args
        // e.g.: name='SOME_MACRO', args='(arg1, arg2)'
        var _getNameArgs = getNameArgs(key),argList = _getNameArgs.argList,name = _getNameArgs.name;
        if (options.freezeVars[name]) {
          // Do nothing with frozen params
          return match;
        }

        var value = options.getVar(name);
        var urlReplacements = Services.urlReplacementsForDoc(element);

        if (typeof value == 'string') {
          value = _this3.expandValueAndReplaceAsync_(
          value,
          options,
          element,
          urlReplacements,
          opt_bindings,
          opt_allowlist,
          argList);

        } else if (isArray(value)) {
          // Treat each value as a template and expand
          for (var i = 0; i < value.length; i++) {
            value[i] =
            typeof value[i] == 'string' ?
            _this3.expandValueAndReplaceAsync_(
            value[i],
            options,
            element,
            urlReplacements,
            opt_bindings,
            opt_allowlist) :

            value[i];
          }
          value = Promise.all( /** @type {!Array<string>} */(value));
        }

        return Promise.resolve(value).then(function (value) {return (
            !options.noEncode ?
            encodeVars( /** @type {string|?Array<string>} */(value)) :
            value);});

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
     */ }, { key: "expandValueAndReplaceAsync_", value:
    function expandValueAndReplaceAsync_(
    value,
    options,
    element,
    urlReplacements,
    opt_bindings,
    opt_allowlist,
    opt_argList)
    {var _this4 = this;
      return this.expandTemplate(
      value,
      new ExpansionOptions(
      options.vars,
      options.iterations - 1,
      true /* noEncode */),

      element,
      opt_bindings,
      opt_allowlist).
      then(function (val) {return (
          urlReplacements.expandStringAsync(
          opt_argList ? val + opt_argList : val,
          opt_bindings || _this4.getMacros(element),
          opt_allowlist));});


    }

    /**
     * @param {string} value
     * @return {!Promise<string>}
     */ }, { key: "hashMacro_", value:
    function hashMacro_(value) {
      return Services.cryptoFor(this.ampdoc_.win).sha384Base64(value);
    } }]);return VariableService;}();


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
  var _getNameArgs2 = getNameArgs(String(raw)),argList = _getNameArgs2.argList,name = _getNameArgs2.name;
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
    return { name: '', argList: '' };
  }
  var match = key.match(VARIABLE_ARGS_REGEXP);
  userAssert(match, 'Variable with invalid format found: ' + key);

  return { name: match[1] || match[0], argList: match[2] || '' };
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installVariableServiceForTesting(ampdoc) {
  registerServiceBuilderForDoc(
  ampdoc,
  'amp-analytics-variables',
  VariableService);

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
  return (/** @type {!Promise<!VariableService>} */(
    getServicePromiseForDoc(elementOrAmpDoc, 'amp-analytics-variables')));

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
  return (
  str !== 'false' &&
  str !== '' &&
  str !== '0' &&
  str !== 'null' &&
  str !== 'NaN' &&
  str !== 'undefined');

}
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/variables.js