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

import {REPLACEMENT_EXP_NAME} from '../../../src/service/url-replacements-impl';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {getService, registerServiceBuilder} from '../../../src/service';
import {isArray, isFiniteNumber} from '../../../src/types';
// TODO(calebcordry) remove this once experiment is launched
// also remove from dep-check-config whitelist;
import {isExperimentOn} from '../../../src/experiments';

/** @const {string} */
const TAG = 'Analytics.Variables';

/** @const {RegExp} */
const VARIABLE_ARGS_REGEXP = /^(?:([^\s]*)(\([^)]*\))|[^]+)$/;

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
}



/**
 * @param {string} str
 * @param {string} s
 * @param {string=} opt_l
 * @return {string}
 */
function substrMacro(str, s, opt_l) {
  const start = Number(s);
  let length = str.length;
  user().assert(isFiniteNumber(start),
      'Start index ' + start + 'in substr macro should be a number');
  if (opt_l) {
    length = Number(opt_l);
    user().assert(isFiniteNumber(length),
        'Length ' + length + ' in substr macro should be a number');
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
 * @returns {string}
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

    /** @private {!Object<string, *>} */
    this.macros_ = {};

    this.register_('DEFAULT', defaultMacro);
    this.register_('SUBSTR', substrMacro);
    this.register_('TRIM', value => value.trim());
    this.register_('JSON', value => JSON.stringify(value));
    this.register_('TOLOWERCASE', value => value.toLowerCase());
    this.register_('TOUPPERCASE', value => value.toUpperCase());
    this.register_('NOT', value => String(!value));
    this.register_('BASE64', value => btoa(value));
    this.register_('HASH', this.hashMacro_.bind(this));
    this.register_('IF',
        (value, thenValue, elseValue) => value ? thenValue : elseValue);
    this.register_('REPLACE', replaceMacro);
  }

  /**
   * @return {!Object} contains all registered macros
   */
  getMacros() {
    const isV2ExpansionOn = this.win_ && isExperimentOn(this.win_,
        REPLACEMENT_EXP_NAME);
    return isV2ExpansionOn ? this.macros_ : {};
  }

  /**
   * @param {string} name
   * @param {*} macro
   */
  register_(name, macro) {
    dev().assert(!this.macros_[name], 'Macro "' + name
        + '" already registered.');
    this.macros_[name] = macro;
  }

  /**
   * @param {string} template The template to expand
   * @param {!ExpansionOptions} options configuration to use for expansion
   * @return {!Promise<string>} The expanded string
   */
  expandTemplate(template, options) {
    if (options.iterations < 0) {
      user().error(TAG, 'Maximum depth reached while expanding variables. ' +
          'Please ensure that the variables are not recursive.');
      return Promise.resolve(template);
    }

    const replacementPromises = [];
    let replacement = template.replace(/\${([^}]*)}/g, (match, key) => {
      if (!key) {
        return Promise.resolve('');
      }

      const {name, argList} = this.getNameArgs_(key);
      if (options.freezeVars[name]) {
        // Do nothing with frozen params
        return match;
      }

      const raw = options.vars[name] != null ? options.vars[name] : '';

      let p;
      if (typeof raw == 'string') {
        // Expand string values further.
        p = this.expandTemplate(raw,
            new ExpansionOptions(options.vars, options.iterations - 1,
                true /* noEncode */));
      } else {
        // Values can also be arrays and objects. Don't expand them.
        p = Promise.resolve(raw);
      }

      p = p.then(finalRawValue => {
        // Then encode the value
        const val = options.noEncode
          ? finalRawValue
          : this.encodeVars(name, finalRawValue);
        return val ? val + argList : val;
      })
          .then(encodedValue => {
          // Replace it in the string
            replacement = replacement.replace(match, encodedValue);
          });

      // Queue current replacement promise after the last replacement.
      replacementPromises.push(p);

      // Since the replacement will happen later, return the original template.
      return match;
    });

    // Once all the promises are complete, return the expanded value.
    return Promise.all(replacementPromises).then(() => replacement);
  }

  /**
   * Returns an array containing two values: name and args parsed from the key.
   *
   * @param {string} key The key to be parsed.
   * @return {!FunctionNameArgsDef}
   * @private
   */
  getNameArgs_(key) {
    if (!key) {
      return {name: '', argList: ''};
    }
    const match = key.match(VARIABLE_ARGS_REGEXP);
    user().assert(match, 'Variable with invalid format found: ' + key);
    return {name: match[1] || match[0], argList: match[2] || ''};
  }

  /**
   * @param {string} unusedName Name of the variable. Only used in tests.
   * @param {string|!Array<string>} raw The values to URI encode.
   * @return {string} The encoded value.
   */
  encodeVars(unusedName, raw) {
    if (raw == null) {
      return '';
    }

    if (isArray(raw)) {
      return raw.map(this.encodeVars.bind(this, unusedName)).join(',');
    }
    // Separate out names and arguments from the value and encode the value.
    const {name, argList} = this.getNameArgs_(String(raw));
    return encodeURIComponent(name) + argList;
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
