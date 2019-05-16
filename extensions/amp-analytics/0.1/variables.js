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
import {base64UrlEncodeFromString} from '../../../src/utils/base64';
import {devAssert, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getConsentPolicyState} from '../../../src/consent';
import {getService, registerServiceBuilder} from '../../../src/service';
import {isArray, isFiniteNumber} from '../../../src/types';
import {linkerReaderServiceFor} from './linker-reader';
import {tryResolve} from '../../../src/utils/promise';

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
 * @param {string} str
 * @param {string} s
 * @param {string=} opt_l
 * @return {string}
 */
function substrMacro(str, s, opt_l) {
  const start = Number(s);
  let {length} = str;
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

  return str.substr(start, length);
}

/**
 * @param {string} value
 * @param {string} defaultValue
 * @return {string}
 */
function defaultMacro(value, defaultValue) {
  if (!value || !value.length) {
    return user().assertString(defaultValue);
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
 * Provides support for processing of advanced variable syntax like nested
 * expansions macros etc.
 */
export class VariableService {
  /**
   * @param {!Window} window
   */
  constructor(window) {
    /** @private {!Window} */
    this.win_ = window;

    /** @private {!JsonObject} */
    this.macros_ = dict({});

    /** @const @private {!./linker-reader.LinkerReader} */
    this.linkerReader_ = linkerReaderServiceFor(this.win_);

    this.register_('$DEFAULT', defaultMacro);
    this.register_('$SUBSTR', substrMacro);
    this.register_('$TRIM', value => value.trim());
    this.register_('$TOLOWERCASE', value => value.toLowerCase());
    this.register_('$TOUPPERCASE', value => value.toUpperCase());
    this.register_('$NOT', value => String(!value));
    this.register_('$BASE64', value => base64UrlEncodeFromString(value));
    this.register_('$HASH', this.hashMacro_.bind(this));
    this.register_('$IF', (value, thenValue, elseValue) =>
      value ? thenValue : elseValue
    );
    this.register_('$REPLACE', replaceMacro);
    // TODO(ccordry): Make sure this stays a window level service when this
    // VariableService is migrated to document level.
    this.register_('LINKER_PARAM', (name, id) =>
      this.linkerReader_.get(name, id)
    );
  }

  /**
   * @return {!JsonObject} contains all registered macros
   */
  getMacros() {
    return this.macros_;
  }

  /**
   * @param {string} name
   * @param {*} macro
   */
  register_(name, macro) {
    devAssert(!this.macros_[name], 'Macro "' + name + '" already registered.');
    this.macros_[name] = macro;
  }

  /**
   * @param {string} template The template to expand
   * @param {!ExpansionOptions} options configuration to use for expansion
   * @return {!Promise<string>} The expanded string
   */
  expandTemplate(template, options) {
    return tryResolve(this.expandTemplateSync.bind(this, template, options));
  }

  /**
   * @param {string} template The template to expand
   * @param {!ExpansionOptions} options configuration to use for expansion
   * @return {string} The expanded string
   * @visibleForTesting
   */
  expandTemplateSync(template, options) {
    return template.replace(/\${([^}]*)}/g, (match, key) => {
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

      if (typeof value == 'string') {
        value = this.expandTemplateSync(
          value,
          new ExpansionOptions(
            options.vars,
            options.iterations - 1,
            true /* noEncode */
          )
        );
      }

      if (!options.noEncode) {
        value = encodeVars(/** @type {string|?Array<string>} */ (value));
      }
      if (value) {
        value += argList;
      }
      return value;
    });
  }

  /**
   * @param {string} value
   * @return {!Promise<string>}
   */
  hashMacro_(value) {
    return Services.cryptoFor(this.win_).sha384Base64(value);
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
 * @param {!Window} win
 */
export function installVariableService(win) {
  registerServiceBuilder(win, 'amp-analytics-variables', VariableService);
}

/**
 * @param {!Window} win
 * @return {!VariableService}
 */
export function variableServiceFor(win) {
  return getService(win, 'amp-analytics-variables');
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
export function getConsentStateStr(element) {
  return getConsentPolicyState(element).then(consent => {
    if (!consent) {
      return null;
    }
    return EXTERNAL_CONSENT_POLICY_STATE_STRING[consent];
  });
}
