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
import {rethrowAsync, user, userAssert} from '../../log';
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
   * @param {?../variable-source.VariableSource} variableSource the keywords to replace
   * @param {!Object<string, *>=} opt_bindings additional one-off bindings
   * @param {!Object<string, *>=} opt_collectVars Object passed in to collect
   *   variable resolutions.
   * @param {boolean=} opt_sync If the method should resolve syncronously.
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of names
   *   that can be substituted.
   * @param {boolean=} opt_noEncode Should not urlEncode macro resolution.
   */
  constructor(
    variableSource,
    opt_bindings,
    opt_collectVars,
    opt_sync,
    opt_whiteList,
    opt_noEncode
  ) {
    /** @const {?../variable-source.VariableSource} */
    this.variableSource_ = variableSource;

    /**@const {!Object<string, *>|undefined} */
    this.bindings_ = opt_bindings;

    // TODO(ccordry): Remove this output object passed into constructor.
    /**@const {!Object<string, *>|undefined} */
    this.collectVars_ = opt_collectVars;

    /**@const {boolean|undefined} */
    this.sync_ = opt_sync;

    /**@const {!Object<string, boolean>|undefined} */
    this.whiteList_ = opt_whiteList;

    /**@const {boolean|undefined} */
    this.encode_ = !opt_noEncode;
  }

  /**
   * take the template url and return a promise of its evaluated value
   * @param {string} url url to be substituted
   * @return {!Promise<string>|string}
   */
  expand(url) {
    if (!url.length) {
      return this.sync_ ? url : Promise.resolve(url);
    }
    const expr = this.variableSource_.getExpr(this.bindings_, this.whiteList_);

    const matches = this.findMatches_(url, expr);
    // if no keywords move on
    if (!matches.length) {
      return this.sync_ ? url : Promise.resolve(url);
    }
    return this.parseUrlRecursively_(url, matches);
  }

  /**
   * Return any macros that exist in the given url.
   * @param {string} url
   * @return {!Array}
   */
  getMacroNames(url) {
    const expr = this.variableSource_.getExpr(this.bindings_, this.whiteList_);
    const matches = url.match(expr);
    if (matches) {
      return matches;
    }
    return [];
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
   * @return {!Promise<string>|string}
   */
  parseUrlRecursively_(url, matches) {
    const stack = [];
    let urlIndex = 0;
    let matchIndex = 0;
    let match = matches[matchIndex];
    let numOfPendingCalls = 0;
    let ignoringChars = false;
    let nextArgShouldBeRaw = false;

    const evaluateNextLevel = encode => {
      let builder = '';
      let results = [];
      const args = [];

      while (urlIndex < url.length && matchIndex <= matches.length) {
        if (match && urlIndex === match.start) {
          let binding;
          // find out where this keyword is coming from
          if (this.bindings_ && hasOwn(this.bindings_, match.name)) {
            // the optional bindings
            binding = {
              // This construction helps us save the match name and determine
              // precedence of resolution choices in #expandBinding_ later.
              name: match.name,
              prioritized: this.bindings_[match.name],
              encode,
            };
          } else {
            // or the global source
            binding = Object.assign({}, this.variableSource_.get(match.name), {
              name: match.name,
              encode,
            });
          }

          urlIndex = match.stop + 1;
          match = matches[++matchIndex];

          if (url[urlIndex] === '(') {
            // if we hit a left parenthesis we still need to get args
            urlIndex++;
            numOfPendingCalls++;
            stack.push(binding);
            // Trim space in between args.
            if (builder.trim().length) {
              results.push(builder.trim());
            }
            results.push(evaluateNextLevel(/* encode */ false));
          } else {
            if (builder.length) {
              results.push(builder);
            }
            results.push(this.evaluateBinding_(binding));
          }

          builder = '';
        } else if (url[urlIndex] === PARSER_IGNORE_FLAG) {
          if (!ignoringChars) {
            ignoringChars = true;
            nextArgShouldBeRaw = true;
            userAssert(
              builder.trim() === '',
              `The substring "${builder}" was lost during url-replacement. ` +
                'Please ensure the url syntax is correct'
            );
            builder = '';
          } else {
            ignoringChars = false;
          }
          urlIndex++;
        } else if (
          numOfPendingCalls &&
          url[urlIndex] === ',' &&
          !ignoringChars
        ) {
          if (builder.length) {
            const nextArg = nextArgShouldBeRaw ? builder : builder.trim();
            results.push(nextArg);
            nextArgShouldBeRaw = false;
          }
          args.push(results);
          results = [];
          // support existing two comma format
          // eg CLIENT_ID(__ga,,ga-url)
          if (url[urlIndex + 1] === ',') {
            results.push(['']);
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
          if (nextArg) {
            results.push(nextArg);
          }
          args.push(results);
          nextArgShouldBeRaw = false;
          const value = this.evaluateBinding_(binding, /* opt_args */ args);
          return value;
        } else {
          builder += url[urlIndex];
          urlIndex++;
        }

        //capture trailing characters
        if (urlIndex === url.length && builder.length) {
          results.push(builder);
        }
      }

      // TODO: If there is a single item in results, we should preserve it's
      // type when returning here and the async version below.
      if (this.sync_) {
        return results.join('');
      }

      return Promise.all(results)
        .then(promiseArray => promiseArray.join(''))
        .catch(e => {
          rethrowAsync(e);
          return '';
        });
    };

    return evaluateNextLevel(this.encode_);
  }

  /**
   * Called when a binding is ready to be resolved. Determines which version of
   * binding to use and if syncronous or asyncronous version should be called.
   * @param {Object<string, *>} bindingInfo An object containing the name of
   *    macro and value to be resolved.
   * @param {Array=} opt_args Arguments passed to the macro. Arguments come as
   *    an array of arrays that will be eventually passed to a function.apply
   *    invocation. For example: FOO(BARBAR, 123) => When we are ready to evaluate
   *    the FOO binding opt_args will be [[Result of BAR, Result of BAR], [123]].
   *    This structure is so that the outer array will have the correct number of
   *    arguments, but we still can resolve each macro separately.
   */
  evaluateBinding_(bindingInfo, opt_args) {
    const {encode, name} = bindingInfo;
    let binding;
    if (hasOwn(bindingInfo, 'prioritized')) {
      // If a binding is passed in through the bindings argument it always takes
      // precedence.
      binding = bindingInfo.prioritized;
    } else if (this.sync_ && hasOwn(bindingInfo, 'sync')) {
      // Use the sync resolution if avaliable when called synchronously.
      binding = bindingInfo.sync;
    } else if (this.sync_) {
      // If there is no sync resolution we can not wait.
      user().error(TAG, 'ignoring async replacement key: ', bindingInfo.name);
      binding = '';
    } else {
      // Prefer the async over the sync but it may not exist.
      binding = bindingInfo.async || bindingInfo.sync;
    }

    // We should only ever encode the top level resolution, or not at all.
    const shouldEncode = encode && !NOENCODE_WHITELIST[name];
    if (this.sync_) {
      const result = this.evaluateBindingSync_(binding, name, opt_args);
      return shouldEncode ? encodeURIComponent(result) : result;
    } else {
      return this.evaluateBindingAsync_(binding, name, opt_args).then(result =>
        shouldEncode ? encodeURIComponent(result) : result
      );
    }
  }

  /**
   * Resolves binding to value to be substituted asyncronously.
   * @param {*} binding Container for sync/async resolutions.
   * @param {string} name
   * @param {?Array=} opt_args Arguments to be passed if binding is function.
   * @return {!Promise<string>} Resolved value.
   */
  evaluateBindingAsync_(binding, name, opt_args) {
    let value;
    try {
      if (typeof binding === 'function') {
        if (opt_args) {
          value = this.processArgsAsync_(opt_args).then(args =>
            binding.apply(null, args)
          );
        } else {
          value = tryResolve(binding);
        }
      } else {
        value = Promise.resolve(binding);
      }
      return value
        .then(val => {
          this.maybeCollectVars_(name, val, opt_args);

          let result;

          if (val == null) {
            result = '';
          } else {
            result = val;
          }
          return result;
        })
        .catch(e => {
          rethrowAsync(e);
          this.maybeCollectVars_(name, '', opt_args);
          return Promise.resolve('');
        });
    } catch (e) {
      // Report error, but do not disrupt URL replacement. This will
      // interpolate as the empty string.
      rethrowAsync(e);
      this.maybeCollectVars_(name, '', opt_args);
      return Promise.resolve('');
    }
  }

  /**
   * Flattens the inner layer of an array of arrays so that the result can be
   * passed to a function.apply call. Must wait for any inner macros to resolve.
   * This will cast all arguments to string before calling the macro.
   *  [[Result of BAR, Result of BAR], 123]. => ['resultresult', '123']
   * @param {!Array<!Array>} argsArray
   * @return {!Promise<Array<string>>}
   */
  processArgsAsync_(argsArray) {
    return Promise.all(
      argsArray.map(argArray => {
        return Promise.all(argArray).then(resolved => resolved.join(''));
      })
    );
  }

  /**
   * Resolves binding to value to be substituted asyncronously.
   * @param {*} binding Container for sync/async resolutions.
   * @param {string} name
   * @param {?Array=} opt_args Arguments to be passed if binding is function.
   * @return {string} Resolved value.
   */
  evaluateBindingSync_(binding, name, opt_args) {
    try {
      let value = binding;
      if (typeof binding === 'function') {
        value = binding.apply(null, this.processArgsSync_(opt_args));
      }

      let result;

      if (value && value.then) {
        // If binding is passed in as opt_binding we try to resolve it and it
        // may return a promise. NOTE: We do not collect this discarded value,
        // even if collectVars exists.
        user().error(TAG, 'ignoring async macro resolution');
        result = '';
      } else if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        // Normal case.
        this.maybeCollectVars_(name, value, opt_args);
        // TODO: We should try to preserve type here.
        result = value.toString();
      } else {
        // Most likely a broken binding gets us here.
        this.maybeCollectVars_(name, '', opt_args);
        result = '';
      }

      return result;
    } catch (e) {
      // Report error, but do not disrupt URL replacement. This will
      // interpolate as the empty string.
      rethrowAsync(e);
      this.maybeCollectVars_(name, '', opt_args);
      return '';
    }
  }

  /**
   * Flattens the inner layer of an array of arrays so that the result can be
   * passed to a function.apply call. Will not wait for any promise to resolve.
   * This will cast all arguments to string before calling the macro.
   *  [[Result of BAR, Result of BAR], 123]. => ['resultresult', '123']
   * @param {!Array<!Array>} argsArray
   */
  processArgsSync_(argsArray) {
    if (!argsArray) {
      return argsArray;
    }
    return argsArray.map(argArray => {
      return argArray.join('');
    });
  }

  /**
   * Collect vars if given the optional object. Handles formatting of kv pairs.
   * @param {string} name Name of the macro.
   * @param {*} value Raw macro resolution value.
   * @param {?Array=} opt_args Arguments to be passed if binding is function.
   */
  maybeCollectVars_(name, value, opt_args) {
    if (!this.collectVars_) {
      return;
    }

    let args = '';
    if (opt_args) {
      const rawArgs = opt_args.filter(arg => arg !== '').join(',');
      args = `(${rawArgs})`;
    }
    this.collectVars_[`${name}${args}`] = value || '';
  }
}
