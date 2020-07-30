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

import {Services} from '../../../src/services';
import {TickLabel} from '../../../src/enums';
import {asyncStringReplace} from '../../../src/string';
import {base64UrlEncodeFromString} from '../../../src/utils/base64';
import {cookieReader} from './cookie-reader';
import {dev, devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getActiveExperimentBranches} from '../../../src/experiments';
import {getConsentPolicyState} from '../../../src/consent';
import {
  getServiceForDoc,
  getServicePromiseForDoc,
  registerServiceBuilderForDoc,
} from '../../../src/service';
import {isArray, isFiniteNumber} from '../../../src/types';
import {isInFie} from '../../../src/iframe-helper';
import {linkerReaderServiceFor} from './linker-reader';

/** @const {string} */
const TAG = 'amp-analytics/variables';

/** @const {RegExp} */
const VARIABLE_ARGS_REGEXP = /^(?:([^\s]*)(\([^)]*\))|[^]+)$/;

const EXTERNAL_CONSENT_POLICY_STATE_STRING = {
  1: 'sufficient',
  2: 'insufficient',
  3: 'not_required',
  4: 'unknown',
};

/** @typedef {{name: string, argList: string}} */
let FunctionNameArgsDef;

/**
 * The structure that contains all details needed to expand a template
 * @struct
 * @const
 * @package For type.
 */
export class ExpansionOptions {
  /**
   * @param {!Object<string, *>} vars
   * @param {number=} opt_iterations
   * @param {boolean=} opt_noEncode
   */
  constructor(vars, opt_iterations, opt_noEncode) {
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
  freezeVar(str) {
    this.freezeVars[str] = true;
  }

  /**
   * @param {string} name
   * @return {*}
   */
  getVar(name) {
    let value = this.vars[name];
    if (value == null) {
      value = '';
    }
    return value;
  }
}

/**
 * @param {string} value
 * @param {string} s
 * @param {string=} opt_l
 * @return {string}
 */
function substrMacro(value, s, opt_l) {
  const start = Number(s);
  let {length} = value;
  userAssert(
    isFiniteNumber(start),
    'Start index ' + start + 'in substr macro should be a number'
  );
  if (opt_l) {
    length = Number(opt_l);
    userAssert(
      isFiniteNumber(length),
      'Length ' + length + ' in substr macro should be a number'
    );
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
  const regex = new RegExp(matchPattern, 'g');
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

  let index = 0;
  if (opt_matchingGroupIndexStr) {
    index = parseInt(opt_matchingGroupIndexStr, 10);

    // if given a non-number or negative number
    if ((index != 0 && !index) || index < 0) {
      user().error(TAG, 'Third argument in MATCH macro must be a number >= 0');
      index = 0;
    }
  }

  const regex = new RegExp(matchPattern);
  const matches = string.match(regex);
  return matches && matches[index] ? matches[index] : '';
}

/**
 * Returns a comma separated list of active experiment branches or null
 * if none are active.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {?string}
 */
function experimentBranchesMacro(ampdoc) {
  const parent = ampdoc.getParent();
  const win = parent ? parent.win : ampdoc.win;
  const branches = getActiveExperimentBranches(win);
  return branches ? Object.values(branches).join(',') : null;
}

/**
 * Provides support for processing of advanced variable syntax like nested
 * expansions macros etc.
 */
export class VariableService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!JsonObject} */
    this.macros_ = dict({});

    /** @const @private {!./linker-reader.LinkerReader} */
    this.linkerReader_ = linkerReaderServiceFor(this.ampdoc_.win);

    this.register_('$DEFAULT', defaultMacro);
    this.register_('$SUBSTR', substrMacro);
    this.register_('$TRIM', (value) => value.trim());
    this.register_('$TOLOWERCASE', (value) => value.toLowerCase());
    this.register_('$TOUPPERCASE', (value) => value.toUpperCase());
    this.register_('$NOT', (value) => String(!value));
    this.register_('$BASE64', (value) => base64UrlEncodeFromString(value));
    this.register_('$HASH', this.hashMacro_.bind(this));
    this.register_('$IF', (value, thenValue, elseValue) =>
      stringToBool(value) ? thenValue : elseValue
    );
    this.register_('$REPLACE', replaceMacro);
    this.register_('$MATCH', matchMacro);
    this.register_(
      '$EQUALS',
      (firstValue, secValue) => firstValue === secValue
    );
    this.register_('LINKER_PARAM', (name, id) =>
      this.linkerReader_.get(name, id)
    );

    // Returns the IANA timezone code
    this.register_('TIMEZONE_CODE', () => {
      let tzCode = '';
      if (
        'Intl' in this.ampdoc_.win &&
        'DateTimeFormat' in this.ampdoc_.win.Intl
      ) {
        // It could be undefined (i.e. IE11)
        tzCode = new this.ampdoc_.win.Intl.DateTimeFormat().resolvedOptions()
          .timeZone;
      }

      return tzCode;
    });

    // Returns a promise resolving to viewport.getScrollTop.
    this.register_('SCROLL_TOP', () =>
      Math.round(Services.viewportForDoc(this.ampdoc_).getScrollTop())
    );

    // Returns a promise resolving to viewport.getScrollLeft.
    this.register_('SCROLL_LEFT', () =>
      Math.round(Services.viewportForDoc(this.ampdoc_).getScrollLeft())
    );

    this.register_('EXPERIMENT_BRANCHES', () =>
      experimentBranchesMacro(this.ampdoc_)
    );
  }

  /**
   * @param {!Element} element
   * @return {!JsonObject} contains all registered macros
   */
  getMacros(element) {
    const elementMacros = {
      'COOKIE': (name) =>
        cookieReader(this.ampdoc_.win, dev().assertElement(element), name),
      'CONSENT_STATE': getConsentStateStr(element),
    };
    const perfMacros = isInFie(element)
      ? {}
      : {
          'FIRST_CONTENTFUL_PAINT': () =>
            Services.performanceFor(this.ampdoc_.win).getMetric(
              TickLabel.FIRST_CONTENTFUL_PAINT_VISIBLE
            ),
          'FIRST_VIEWPORT_READY': () =>
            Services.performanceFor(this.ampdoc_.win).getMetric(
              TickLabel.FIRST_VIEWPORT_READY
            ),
          'MAKE_BODY_VISIBLE': () =>
            Services.performanceFor(this.ampdoc_.win).getMetric(
              TickLabel.MAKE_BODY_VISIBLE
            ),
          'LARGEST_CONTENTFUL_PAINT': () =>
            Services.performanceFor(this.ampdoc_.win).getMetric(
              TickLabel.LARGEST_CONTENTFUL_PAINT_VISIBLE
            ),
          'FIRST_INPUT_DELAY': () =>
            Services.performanceFor(this.ampdoc_.win).getMetric(
              TickLabel.FIRST_INPUT_DELAY
            ),
          'CUMULATIVE_LAYOUT_SHIFT': () =>
            Services.performanceFor(this.ampdoc_.win).getMetric(
              TickLabel.CUMULATIVE_LAYOUT_SHIFT
            ),
        };
    const merged = {...this.macros_, ...elementMacros, ...perfMacros};
    return /** @type {!JsonObject} */ (merged);
  }

  /**
   * TODO (micajuineho): If we add new synchronous macros, we
   * will need to split this method and getMacros into sync and
   * async version (currently all macros are async).
   * @param {string} name
   * @param {*} macro
   */
  register_(name, macro) {
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
  expandTemplate(template, options, element, opt_bindings, opt_allowlist) {
    return asyncStringReplace(template, /\${([^}]*)}/g, (match, key) => {
      if (options.iterations < 0) {
        user().error(
          TAG,
          'Maximum depth reached while expanding variables. ' +
            'Please ensure that the variables are not recursive.'
        );
        return match;
      }

      if (!key) {
        return '';
      }

      // Split the key to name and args
      // e.g.: name='SOME_MACRO', args='(arg1, arg2)'
      const {name, argList} = getNameArgs(key);
      if (options.freezeVars[name]) {
        // Do nothing with frozen params
        return match;
      }

      let value = options.getVar(name);
      const urlReplacements = Services.urlReplacementsForDoc(element);

      if (typeof value == 'string') {
        value = this.expandValueAndReplaceAsync_(
          value,
          options,
          element,
          urlReplacements,
          opt_bindings,
          opt_allowlist,
          argList
        );
      } else if (isArray(value)) {
        // Treat each value as a template and expand
        for (let i = 0; i < value.length; i++) {
          value[i] =
            typeof value[i] == 'string'
              ? this.expandValueAndReplaceAsync_(
                  value[i],
                  options,
                  element,
                  urlReplacements,
                  opt_bindings,
                  opt_allowlist
                )
              : value[i];
        }
        value = Promise.all(/** @type {!Array<string>} */ (value));
      }

      return Promise.resolve(value).then((value) =>
        !options.noEncode
          ? encodeVars(/** @type {string|?Array<string>} */ (value))
          : value
      );
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
  expandValueAndReplaceAsync_(
    value,
    options,
    element,
    urlReplacements,
    opt_bindings,
    opt_allowlist,
    opt_argList
  ) {
    return this.expandTemplate(
      value,
      new ExpansionOptions(
        options.vars,
        options.iterations - 1,
        true /* noEncode */
      ),
      element,
      opt_bindings,
      opt_allowlist
    ).then((val) =>
      urlReplacements.expandStringAsync(
        opt_argList ? val + opt_argList : val,
        opt_bindings || this.getMacros(element),
        opt_allowlist
      )
    );
  }

  /**
   * @param {string} value
   * @return {!Promise<string>}
   */
  hashMacro_(value) {
    return Services.cryptoFor(this.ampdoc_.win).sha384Base64(value);
  }
}

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
  const {name, argList} = getNameArgs(String(raw));
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
    return {name: '', argList: ''};
  }
  const match = key.match(VARIABLE_ARGS_REGEXP);
  userAssert(match, 'Variable with invalid format found: ' + key);

  return {name: match[1] || match[0], argList: match[2] || ''};
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installVariableServiceForTesting(ampdoc) {
  registerServiceBuilderForDoc(
    ampdoc,
    'amp-analytics-variables',
    VariableService
  );
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
  return /** @type {!Promise<!VariableService>} */ (getServicePromiseForDoc(
    elementOrAmpDoc,
    'amp-analytics-variables'
  ));
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
  return getConsentPolicyState(element).then((consent) => {
    if (!consent) {
      return null;
    }
    return EXTERNAL_CONSENT_POLICY_STATE_STRING[consent];
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
    str !== 'undefined'
  );
}
