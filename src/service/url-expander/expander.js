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

import {rethrowAsync, user} from '../../log';

export const PARSER_IGNORE_FLAG = '`';

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
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of names
   *     that can be substituted.
   * @return {!Promise<string>}
   */
  expand(url, opt_bindings, opt_whiteList) {
    if (!url.length) {
      return Promise.resolve(url);
    }
    const expr = this.variableSource_
        .getExpr(opt_bindings, /*opt_ignoreArgs */ true);

    const matches = this.findMatches_(url, expr);
    // if no keywords move on
    if (!matches.length) {
      return Promise.resolve(url);
    }
    return this.parseUrlRecursively_(url, matches, opt_bindings);
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
      const length = match.length;
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
   * @param {!Array<Object<string, string|number>>} matches array of objects representing
   *  matching keywords
   * @param {!Object<string, *>=} opt_bindings additional one-off bindings
   * @return {!Promise<string>}
   */
  parseUrlRecursively_(url, matches, opt_bindings) {
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
          if (opt_bindings && opt_bindings.hasOwnProperty(match.name)) {
            // the optional bindings
            binding = opt_bindings[match.name];
          } else {
            // or the global source
            binding = this.variableSource_.get(match.name);
            binding = binding.async || binding.sync;
          }

          urlIndex = match.stop + 1;
          match = matches[++matchIndex];

          if (url[urlIndex] === '(') {
            // if we hit a left parenthesis we still need to get args
            urlIndex++;
            numOfPendingCalls++;
            stack.push(binding);
            if (builder.length) {
              results.push(builder);
            }
            results.push(evaluateNextLevel());
          } else {
            if (builder.length) {
              results.push(builder);
            }
            results.push(this.evaluateBinding_(binding));
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

        else if (url[urlIndex] === ')' && !ignoringChars) {
          urlIndex++;
          numOfPendingCalls--;
          const binding = stack.pop();
          const nextArg = nextArgShouldBeRaw ? builder : builder.trim();
          results.push(nextArg);
          nextArgShouldBeRaw = false;
          const value = this.evaluateBinding_(binding, results);
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
   * resolves binding to value to be substituted
   * @param {*} binding container for sync/async resolutions
   * @param {?Array=} opt_args arguments to be passed if binding is function
   * @return {!Promise<string>} resolved value
   */
  evaluateBinding_(binding, opt_args) {
    let value;
    try {
      if (typeof binding === 'function') {
        if (opt_args) {
          value = Promise.all(opt_args)
              .then(args => binding.apply(null, args));
        } else {
          value = Promise.resolve(binding.apply(null, opt_args));
        }
      } else {
        value = Promise.resolve(binding);
      }
      return value.then(val => val == null ? '' : encodeURIComponent(val))
          .catch(e => {
            rethrowAsync(e);
            return '';
          });

    } catch (e) {
      // Report error, but do not disrupt URL replacement. This will
      // interpolate as the empty string.
      rethrowAsync(e);
      return Promise.resolve('');
    }
  }
}
