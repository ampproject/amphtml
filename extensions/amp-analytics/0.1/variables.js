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

import {isExperimentOn} from '../../../src/experiments';
import {cryptoFor} from '../../../src/crypto';
import {dev, user} from '../../../src/log';
import {getService, registerServiceBuilder} from '../../../src/service';
import {isArray, isFiniteNumber} from '../../../src/types';
import {map} from '../../../src/utils/object';

/** @const {string} */
const TAG = 'Analytics.Variables';

/** @const {RegExp} */
const VARIABLE_ARGS_REGEXP = /^(?:([^\s]*)(\([^)]*\))|[^]+)$/;

/** @typedef {{name: string, argList: string}} */
let FunctionNameArgsDef;

/**
 * @struct
 * @const
 */
class Filter {
  /**
   * @param {function(...?):(string|!Promise<string>)} filter
   * @param {boolean=} opt_allowNull
   */
  constructor(filter, opt_allowNull) {
    /** @type {!function(...?):(string|!Promise<string>)} */
    this.filter = filter;

    /** @type{boolean} */
    this.allowNull = !!opt_allowNull;
  }
}


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
  }
}



/**
 * @param {string} str
 * @param {string} s
 * @param {string=} opt_l
 * @return {string}
 */
function substrFilter(str, s, opt_l) {
  const start = Number(s);
  let length = str.length;
  user().assert(isFiniteNumber(start),
      'Start index ' + start + 'in substr filter should be a number');
  if (opt_l) {
    length = Number(opt_l);
    user().assert(isFiniteNumber(length),
        'Length ' + length + ' in substr filter should be a number');
  }

  return str.substr(start, length);
}

/**
 * @param {string} value
 * @param {string} defaultValue
 * @return {string}
 */
function defaultFilter(value, defaultValue) {
  return value || user().assertString(defaultValue);
}


/**
 * Provides support for processing of advanced variable syntax like nested
 * expansions filters etc.
 */
export class VariableService {
  /**
   * @param {!Window} window
   */
  constructor(window) {

    /** @private {!Window} */
    this.win_ = window;

    /** @private {!Object<string, !Filter>} */
    this.filters_ = map();

    this.register_('default', new Filter(defaultFilter, /* allowNulls */ true));
    this.register_('substr', new Filter(substrFilter));
    this.register_('trim', new Filter(value => value.trim()));
    this.register_('json', new Filter(value => JSON.stringify(value)));
    this.register_('toLowerCase', new Filter(value => value.toLowerCase()));
    this.register_('toUpperCase', new Filter(value => value.toUpperCase()));
    this.register_('not', new Filter(value => String(!value)));
    this.register_('base64', new Filter(value => btoa(value)));
    this.register_('hash', new Filter(this.hashFilter_.bind(this)));
    this.register_('if', new Filter(
        (value, thenValue, elseValue) => value ? thenValue : elseValue, true));
  }

  /**
   * @param {string} name
   * @param {!Filter} filter
   */
  register_(name, filter) {
    dev().assert(!this.filters_[name], 'Filter "' + name
        + '" already registered.');
    this.filters_[name] = filter;
  }

  /**
   * @param {string} filterStr
   * @return {?{filter: !Filter, args: !Array<string>}}
   */
  parseFilter_(filterStr) {
    if (!filterStr) {
      return null;
    }

    // The parsing for filters breaks when `:` is used as something other than
    // the argument separator. A full-fledged parser would be needed to fix
    // this.
    const tokens = filterStr.split(':');
    const fnName = tokens.shift();
    user().assert(fnName, 'Filter ' + name + ' is invalid.');
    const filter = user().assert(this.filters_[fnName],
        'Unknown filter: ' + fnName);
    return {filter, args: tokens};
  }

  /**
   * @param {string} value
   * @param {Array<string>} filters
   * @return {Promise<string>}
   */
  applyFilters_(value, filters) {
    if (!this.isFilterExperimentOn_()) {
      return Promise.resolve(value);
    }

    let result = Promise.resolve(value);
    for (let i = 0; i < filters.length; i++) {
      const {filter, args} = this.parseFilter_(filters[i].trim());
      if (filter) {
        result = result.then(value => {
          if (value != null || filter.allowNull) {
            args.unshift(value);
            return filter.filter.apply(null, args);
          }
          return null;
        });
      }
    }
    return result;
  }

  /**
   * @param {string} template The template to expand
   * @param {!ExpansionOptions} options configuration to use for expansion
   * @return {!Promise<!string>} The expanded string
   */
  expandTemplate(template, options) {
    if (options.iterations < 0) {
      user().error(TAG, 'Maximum depth reached while expanding variables. ' +
          'Please ensure that the variables are not recursive.');
      return Promise.resolve(template);
    }

    const replacementPromises = [];
    let replacement = template.replace(/\${([^}]*)}/g, (match, key) => {

      // Note: The parsing for variables breaks when `|` is used as
      // something other than the filter separator. A full-fledged parser would
      // be needed to fix this.
      const tokens = key.split('|');
      const initialValue = tokens.shift().trim();
      if (!initialValue) {
        return Promise.resolve('');
      }

      const {name, argList} = this.getNameArgs_(initialValue);
      const raw = options.vars[name] != null ? options.vars[name] : '';

      let p;
      if (typeof raw == 'string') {
        // Expand string values further.
        p = this.expandTemplate(raw,
            new ExpansionOptions(options.vars, options.iterations - 1,
                options.noEncode));
      } else {
        // Values can also be arrays and objects. Don't expand them.
        p = Promise.resolve(raw);
      }

      p = p.then(expandedValue =>
            // First apply filters
            this.applyFilters_(expandedValue, tokens))
        .then(finalRawValue => {
          // Then encode the value
          const val = options.noEncode
              ? finalRawValue
              : this.encodeVars(finalRawValue, name);
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
   * @param {string|!Array<string>} raw The values to URI encode.
   * @param {string} unusedName Name of the variable.
   * @return {string} The encoded value.
   */
  encodeVars(raw, unusedName) {
    if (raw == null) {
      return '';
    }

    if (isArray(raw)) {
      return raw.map(encodeURIComponent).join(',');
    }
    // Separate out names and arguments from the value and encode the value.
    const {name, argList} = this.getNameArgs_(String(raw));
    return encodeURIComponent(name) + argList;
  }

  /**
   * @param {string} value
   * @return {!Promise<string>}
   */
  hashFilter_(value) {
    return cryptoFor(this.win_).sha384Base64(value);
  }

  isFilterExperimentOn_() {
    return isExperimentOn(this.win_, 'variable-filters');
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
