/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {hasOwn} from '../../utils/object';
import {rethrowAsync, user} from '../../log';
import {tryResolve} from '../../utils/promise';

/** @private @const {string} */
const PARSER_IGNORE_FLAG = '`';

/** @private @const {string} */
const TAG = 'Expander';

/** A whitelist for replacements whose values should not be %-encoded. */
/** @const {Object<string, boolean>} */
export const NOENCODE_WHITELIST = {'ANCESTOR_ORIGIN': true};

/** Rudamentary parser to handle nested Url replacement. */
export class Expander {

  /**
   * Link this instance of parser to the calling UrlReplacment
   * @param {!../variable-source.VariableSource|null} variableSource the keywords to replace
   */
  constructor(variableSource) {
    this.variableSource_ = variableSource;
  }


  /**
   * take the template url and return a promise of its evaluated value
   * @param {string} url url to be substituted
   * @param {!Object<string, *>=} opt_bindings additional one-off bindings
   * @param {!Object<string, *>=} opt_collectVars Object passed in to collect
   *   variable resolutions.
   * @param {boolean=} opt_sync If the method should resolve syncronously.
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of names
   *   that can be substituted.
   * @return {!Promise<string>|string}
   */
  expand(url, opt_bindings, opt_collectVars, opt_sync, opt_whiteList) {
    if (!url.length) {
      return opt_sync ? url : Promise.resolve(url);
    }
    const expr = this.variableSource_
        .getExpr(opt_bindings, /*opt_ignoreArgs */ true, opt_whiteList);

    const matches = this.findMatches_(url, expr);
    // if no keywords move on
    if (!matches.length) {
      return opt_sync ? url : Promise.resolve(url);
    }
    return this.parseUrlRecursively_(url, matches, opt_bindings,
        opt_collectVars, opt_sync);
  }


  /**
   * Structures the regex matching into the desired format
   * @param {string} url url to be substituted
   * @param {RegExp} expression regex containing all keywords
   * @return {Array<Object<string, string|number>>} array of objects representing
   *  matching keywords
   */
  findMatches_(url, expression) {
    const matches = [];
    url.replace(expression, (match, name, startPosition) => {
      const {length} = match;
      const stopPosition = length + startPosition - 1;
      const info = {
        start: startPosition,
        stop: stopPosition,
        name,
        length,
      };
      matches.push(info);
    });
    return matches;
  }


  /**
   * @param {string} url
   * @param {!Array<Object<string, string|number>>} matches Array of objects
   *   representing matching keywords.
   * @param {!Object<string, *>=} opt_bindings Additional one-off bindings.
   * @param {!Object<string, *>=} opt_collectVars Object passed in to collect
   *   variable resolutions.
   * @param {boolean=} opt_sync
   * @return {!Promise<string>|string}
   */
  parseUrlRecursively_(url, matches, opt_bindings, opt_collectVars, opt_sync) {
    const stack = [];
    let urlIndex = 0;
    let matchIndex = 0;
    let match = matches[matchIndex];
    let numOfPendingCalls = 0;
    let ignoringChars = false;
    let nextArgShouldBeRaw = false;

    const evaluateNextLevel = () => {
      let builder = '';
      const results = [];

      while (urlIndex < url.length && matchIndex <= matches.length) {
        if (match && urlIndex === match.start) {
          let binding;
          // find out where this keyword is coming from
          if (opt_bindings && hasOwn(opt_bindings, match.name)) {
            // the optional bindings
            binding = {
              // This construction helps us save the match name and determine
              // precedence of resolution choices in #expandBinding_ later.
              name: match.name,
              prioritized: opt_bindings[match.name],
            };
          } else {
            // or the global source
            binding = this.variableSource_.get(match.name);
            binding.name = match.name;
          }

          urlIndex = match.stop + 1;
          match = matches[++matchIndex];

          if (url[urlIndex] === '(') {
            // if we hit a left parenthesis we still need to get args
            urlIndex++;
            numOfPendingCalls++;
            stack.push(binding);
            // trim space in between args
            if (builder.trim().length) {
              results.push(builder);
            }
            results.push(evaluateNextLevel());
          } else {
            if (builder.length) {
              results.push(builder);
            }
            results.push(this.evaluateBinding_(binding,
                /* opt_args */ undefined, opt_collectVars, opt_sync));
          }

          builder = '';
        }

        else if (url[urlIndex] === PARSER_IGNORE_FLAG) {
          if (!ignoringChars) {
            ignoringChars = true;
            nextArgShouldBeRaw = true;
            user().assert(builder.trim() === '',
                `The substring "${builder}" was lost during url-replacement. ` +
                'Please ensure the url syntax is correct');
            builder = '';
          } else {
            ignoringChars = false;
          }
          urlIndex++;
        }

        else if (numOfPendingCalls && url[urlIndex] === ',' && !ignoringChars) {
          if (builder.length) {
            const nextArg = nextArgShouldBeRaw ? builder : builder.trim();
            results.push(nextArg);
            nextArgShouldBeRaw = false;
          }
          // support existing two comma format
          // eg CLIENT_ID(__ga,,ga-url)
          if (url[urlIndex + 1] === ',') {
            results.push(''); // TODO(ccordry): may want this to be undefined at some point
            urlIndex++;
          }
          builder = '';
          urlIndex++;
        }

        // Invoke a function on every right parenthesis unless the stack is
        // empty.
        else if (numOfPendingCalls && url[urlIndex] === ')' && !ignoringChars) {
          urlIndex++;
          numOfPendingCalls--;
          const binding = stack.pop();
          const nextArg = nextArgShouldBeRaw ? builder : builder.trim();
          results.push(nextArg);
          nextArgShouldBeRaw = false;
          const value = this.evaluateBinding_(binding, /* opt_args */ results,
              opt_collectVars, opt_sync);
          return value;
        }

        else {
          builder += url[urlIndex];
          urlIndex++;
        }

        //capture trailing characters
        if (urlIndex === url.length && builder.length) {
          results.push(builder);
        }
      }

      if (opt_sync) {
        return results.join('');
      }

      return Promise.all(results)
          .then(promiseArray => promiseArray.join(''))
          .catch(e => {
            rethrowAsync(e);
            return '';
          });
    };

    return evaluateNextLevel();
  }


  /**
   * Called when a binding is ready to be resolved. Determines which version of
   * binding to use and if syncronous or asyncronous version should be called.
   * @param {Object<string, *>} bindingInfo An object containing the name of macro
   *   and value to be resolved.
   * @param {Array=} opt_args Arguments passed to the macro.
   * @param {!Object<string, *>=} opt_collectVars Object passed in to collect
   *   variable resolutions.
   * @param {*=} opt_sync Whether the binding should be resolved synchronously.
   */
  evaluateBinding_(bindingInfo, opt_args, opt_collectVars, opt_sync) {
    const {name} = bindingInfo;
    let binding;
    if (hasOwn(bindingInfo, 'prioritized')) {
      // If a binding is passed in through opt_bindings it always takes
      // precedence.
      binding = bindingInfo.prioritized;
    } else if (opt_sync && hasOwn(bindingInfo, 'sync')) {
      // Use the sync resolution if avaliable when called synchronously.
      binding = bindingInfo.sync;
    } else if (opt_sync) {
      // If there is no sync resolution we can not wait.
      user().error(TAG, 'ignoring async replacement key: ', bindingInfo.name);
      binding = '';
    } else {
      // Prefer the async over the sync but it may not exist.
      binding = bindingInfo.async || bindingInfo.sync;
    }
    return opt_sync ?
      this.evaluateBindingSync_(binding, name, opt_args, opt_collectVars) :
      this.evaluateBindingAsync_(binding, name, opt_args, opt_collectVars);
  }


  /**
   * Resolves binding to value to be substituted asyncronously.
   * @param {*} binding Container for sync/async resolutions.
   * @param {string} name
   * @param {?Array=} opt_args Arguments to be passed if binding is function.
   * @param {!Object<string, *>=} opt_collectVars Object passed in to collect
   *   variable resolutions.
   * @return {!Promise<string>} Resolved value.
   */
  evaluateBindingAsync_(binding, name, opt_args, opt_collectVars) {
    let value;
    try {
      if (typeof binding === 'function') {
        if (opt_args) {
          value = Promise.all(opt_args)
              .then(args => binding.apply(null, args));
        } else {
          value = tryResolve(binding);
        }
      } else {
        value = Promise.resolve(binding);
      }
      return value.then(val => {
        let result;

        if (val == null) {
          result = '';
        } else {
          result = NOENCODE_WHITELIST[name] ? val : encodeURIComponent(val);
        }

        if (opt_collectVars) {
          opt_collectVars[name] = result;
        }
        return result;
      }).catch(e => {
        rethrowAsync(e);
        if (opt_collectVars) {
          opt_collectVars[name] = '';
        }
        return Promise.resolve('');
      });

    } catch (e) {
      // Report error, but do not disrupt URL replacement. This will
      // interpolate as the empty string.
      rethrowAsync(e);
      if (opt_collectVars) {
        opt_collectVars[name] = '';
      }
      return Promise.resolve('');
    }
  }


  /**
   * Resolves binding to value to be substituted asyncronously.
   * @param {*} binding Container for sync/async resolutions.
   * @param {string} name
   * @param {?Array=} opt_args Arguments to be passed if binding is function.
   * @param {!Object<string, *>=} opt_collectVars Object passed in to collect
   *   variable resolutions.
   * @return {string} Resolved value.
   */
  evaluateBindingSync_(binding, name, opt_args, opt_collectVars) {
    try {
      const value = typeof binding === 'function' ?
        binding.apply(null, opt_args) : binding;

      let result;

      if (value && value.then) {
        // If binding is passed in as opt_binding we try to resolve it and it
        // may return a promise.
        user().error(TAG, 'ignoring async macro resolution');
        result = '';
      } else if (typeof value === 'string' || typeof value === 'number') {
        // Normal case.
        result = NOENCODE_WHITELIST[name] ? value.toString() :
          encodeURIComponent(/** @type {string} */ (value));
      } else {
        // Most likely a broken binding gets us here.
        result = '';
      }

      if (opt_collectVars) {
        opt_collectVars[name] = result;
      }

      return result;
    } catch (e) {
      // Report error, but do not disrupt URL replacement. This will
      // interpolate as the empty string.
      rethrowAsync(e);
      if (opt_collectVars) {
        opt_collectVars[name] = '';
      }
      return '';
    }
  }
}
