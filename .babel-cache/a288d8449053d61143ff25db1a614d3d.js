function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
import { tryResolve } from "../../core/data-structures/promise";
import { rethrowAsync } from "../../core/error";
import { hasOwn } from "../../core/types/object";
import { trimStart } from "../../core/types/string";
import { user } from "../../log";

/** @private @const {string} */
var PARSER_IGNORE_FLAG = '`';

/** @private @const {string} */
var TAG = 'Expander';

/**
 * @typedef {{
 *   name: string,
 *   prioritized: (!BindingInfoDef|undefined),
 *   encode: boolean,
 *   sync: ../variable-source.SyncResolverDef,
 *   async: ../variable-source.AsyncResolverDef,
 * }}
 */
var BindingInfoDef;

/**
 * @typedef {{
 *   start: number,
 *   stop: number,
 *   name: string,
 *   length: number,
 * }}
 */
var MatchDef;

/** Rudamentary parser to handle nested Url replacement. */
export var Expander = /*#__PURE__*/function () {
  /**
   * Link this instance of parser to the calling UrlReplacment
   * @param {?../variable-source.VariableSource} variableSource the keywords to replace
   * @param {!Object<string, *>=} opt_bindings additional one-off bindings
   * @param {!Object<string, *>=} opt_collectVars Object passed in to collect
   *   variable resolutions.
   * @param {boolean=} opt_sync If the method should resolve syncronously.
   * @param {!Object<string, boolean>=} opt_allowlist Optional allowlist of names
   *   that can be substituted.
   * @param {boolean=} opt_noEncode Should not urlEncode macro resolution.
   */
  function Expander(variableSource, opt_bindings, opt_collectVars, opt_sync, opt_allowlist, opt_noEncode) {
    _classCallCheck(this, Expander);

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
    this.allowlist_ = opt_allowlist;

    /**@const {boolean|undefined} */
    this.encode_ = !opt_noEncode;
  }

  /**
   * take the template url and return a promise of its evaluated value
   * @param {string} url url to be substituted
   * @return {!Promise<string>|string}
   */
  _createClass(Expander, [{
    key: "expand",
    value: function expand(url) {
      if (!url.length) {
        return this.sync_ ? url : Promise.resolve(url);
      }

      var expr = this.variableSource_.getExpr(this.bindings_, this.allowlist_);
      var matches = this.findMatches_(url, expr);

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

  }, {
    key: "getMacroNames",
    value: function getMacroNames(url) {
      var expr = this.variableSource_.getExpr(this.bindings_, this.allowlist_);
      var matches = url.match(expr);

      if (matches) {
        return matches;
      }

      return [];
    }
    /**
     * Structures the regex matching into the desired format
     * @param {string} url url to be substituted
     * @param {RegExp} expression regex containing all keywords
     * @return {!Array<!MatchDef>} array of matching keywords.
     */

  }, {
    key: "findMatches_",
    value: function findMatches_(url, expression) {
      var matches =
      /** @type {!Array<!MatchDef>} */
      [];
      url.replace(expression, function (match, name, startPosition) {
        var length = match.length;
        var stopPosition = length + startPosition - 1;
        var info = {
          start: startPosition,
          stop: stopPosition,
          name: name,
          length: length
        };
        matches.push(info);
      });
      return matches;
    }
    /**
     * @param {string} url
     * @param {!Array<!MatchDef>} matches Array of matching keywords.
     * @return {!Promise<string>|string}
     */

  }, {
    key: "parseUrlRecursively_",
    value: function parseUrlRecursively_(url, matches) {
      var _this = this;

      var stack = [];
      var urlIndex = 0;
      var matchIndex = 0;
      var match = matches[matchIndex];
      var numOfPendingCalls = 0;
      var ignoringChars = false;

      var evaluateNextLevel = function evaluateNextLevel(encode) {
        var builder = '';
        var results = [];
        var args = [];

        while (urlIndex < url.length && matchIndex <= matches.length) {
          var trimmedBuilder = builder.trim();

          if (match && urlIndex === match.start) {
            // Collect any chars that may be prefixing the macro, if we are in
            // a nested context trim the args.
            if (trimmedBuilder) {
              results.push(numOfPendingCalls ? trimStart(builder) : builder);
            }

            // If we know we are at the start of a macro, we figure out how to
            // resolve it, and move our pointer to after the token.
            var binding = void 0;

            // Find out where this macro is coming from. Could be from the passed
            // in optional bindings, or the global variable source.
            if (_this.bindings_ && hasOwn(_this.bindings_, match.name)) {
              // Macro is from optional bindings.
              binding =
              /** @type {!BindingInfoDef} */
              {
                // This construction helps us save the match name and determine
                // precedence of resolution choices in #expandBinding_ later.
                name: match.name,
                prioritized: _this.bindings_[match.name],
                encode: encode
              };
            } else {
              // Macro is from the global source.
              binding =
              /** @type {!BindingInfoDef} */
              _extends({}, _this.variableSource_.get(match.name), {
                name: match.name,
                encode: encode
              });
            }

            urlIndex = match.stop + 1;
            match = matches[++matchIndex];

            if (url[urlIndex] === '(') {
              // When we see a `(` we know we need to resolve one level deeper
              // before continuing. We push the binding in the stack for
              // resolution later, and then make the recursive call.
              urlIndex++;
              numOfPendingCalls++;
              stack.push(binding);
              results.push(evaluateNextLevel(
              /* encode */
              false));
            } else {
              // Many macros do not take arguments, in this case we do not need to
              // recurse, we just start resolution in it's position.
              results.push(_this.evaluateBinding_(binding));
            }

            builder = '';
          } else if (url[urlIndex] === PARSER_IGNORE_FLAG) {
            if (!ignoringChars) {
              ignoringChars = true;

              // Collect any chars that may exist before backticks, eg FOO(a`b`)
              if (trimmedBuilder) {
                results.push(trimmedBuilder);
              }
            } else {
              ignoringChars = false;

              // Collect any chars inside backticks without trimming whitespace.
              if (builder.length) {
                results.push(builder);
              }
            }

            builder = '';
            urlIndex++;
          } else if (numOfPendingCalls && url[urlIndex] === ',' && !ignoringChars) {
            // Commas tell us to create a new argument when in nested context and
            // we push any string built so far, create a new array for the next
            // argument, and reset our string builder.
            if (trimmedBuilder) {
              results.push(trimmedBuilder);
            }

            args.push(results);
            results = [];

            // Support existing two comma format by pushing an empty string as
            // argument. eg CLIENT_ID(__ga,,ga-url)
            if (url[urlIndex + 1] === ',') {
              args.push(['']);
              urlIndex++;
            }

            builder = '';
            urlIndex++;
          } else // Invoke a function on every right parenthesis unless the stack is
            // empty. This is where we actually evaluate any macro that takes an
            // argument. We pop the macro resover off the stack, and take anying left
            // in our string builder and add it as the final section of the final
            // arg. Then we call the resolver.
            if (numOfPendingCalls && url[urlIndex] === ')' && !ignoringChars) {
              urlIndex++;
              numOfPendingCalls--;

              var _binding = stack.pop();

              if (trimmedBuilder) {
                results.push(trimmedBuilder);
              }

              args.push(results);

              var value = _this.evaluateBinding_(_binding,
              /* opt_args */
              args);

              return value;
            } else {
              // This is the most common case. Just building a string as we walk
              // along.
              builder += url[urlIndex];
              urlIndex++;
            }

          // Capture any trailing characters.
          if (urlIndex === url.length && builder.length) {
            results.push(builder);
          }
        }

        // TODO: If there is a single item in results, we should preserve it's
        // type when returning here and the async version below.
        if (_this.sync_) {
          return results.join('');
        }

        return Promise.all(results).then(function (promiseArray) {
          return promiseArray.join('');
        }).catch(function (e) {
          rethrowAsync(e);
          return '';
        });
      };

      return evaluateNextLevel(this.encode_);
    }
    /**
     * Called when a binding is ready to be resolved. Determines which version of
     * binding to use and if syncronous or asyncronous version should be called.
     * @param {!BindingInfoDef} bindingInfo An object containing the name of
     *    macro and value to be resolved.
     * @param {Array=} opt_args Arguments passed to the macro. Arguments come as
     *    an array of arrays that will be eventually passed to a function.apply
     *    invocation. For example: FOO(BARBAR, 123) => When we are ready to evaluate
     *    the FOO binding opt_args will be [[Result of BAR, Result of BAR], [123]].
     *    This structure is so that the outer array will have the correct number of
     *    arguments, but we still can resolve each macro separately.
     * @return {string|!Promise<string>}
     */

  }, {
    key: "evaluateBinding_",
    value: function evaluateBinding_(bindingInfo, opt_args) {
      var encode = bindingInfo.encode,
          name = bindingInfo.name;
      var binding;

      if (bindingInfo.prioritized != undefined) {
        // Has to explicity check for undefined because bindingInfo.priorityized
        // could not be a function but a false value. For example {FOO: 0}
        // If a binding is passed in through the bindings argument it always takes
        // precedence.
        binding = bindingInfo.prioritized;
      } else if (this.sync_ && bindingInfo.sync != undefined) {
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

      if (this.sync_) {
        var result = this.evaluateBindingSync_(binding, name, opt_args);
        return encode ? encodeURIComponent(result) : result;
      } else {
        return this.evaluateBindingAsync_(binding, name, opt_args).then(function (result) {
          return encode ? encodeURIComponent(result) : result;
        });
      }
    }
    /**
     * Resolves binding to value to be substituted asyncronously.
     * @param {*} binding Container for sync/async resolutions.
     * @param {string} name
     * @param {?Array=} opt_args Arguments to be passed if binding is function.
     * @return {!Promise<string>} Resolved value.
     */

  }, {
    key: "evaluateBindingAsync_",
    value: function evaluateBindingAsync_(binding, name, opt_args) {
      var _this2 = this;

      var value;

      try {
        if (typeof binding === 'function') {
          var bindingFunc = binding;

          if (opt_args) {
            value = this.processArgsAsync_(opt_args).then(function (args) {
              return bindingFunc.apply(null, args);
            });
          } else {
            value = tryResolve(bindingFunc);
          }
        } else {
          value = Promise.resolve(binding);
        }

        return value.then(function (val) {
          _this2.maybeCollectVars_(name, val, opt_args);

          var result;

          if (val == null) {
            result = '';
          } else {
            result = val;
          }

          return result;
        }).catch(function (e) {
          rethrowAsync(e);

          _this2.maybeCollectVars_(name, '', opt_args);

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

  }, {
    key: "processArgsAsync_",
    value: function processArgsAsync_(argsArray) {
      return Promise.all(argsArray.map(function (argArray) {
        return Promise.all(argArray).then(function (resolved) {
          return resolved.join('');
        });
      }));
    }
    /**
     * Resolves binding to value to be substituted asyncronously.
     * @param {*} binding Container for sync/async resolutions.
     * @param {string} name
     * @param {?Array=} opt_args Arguments to be passed if binding is function.
     * @return {string} Resolved value.
     */

  }, {
    key: "evaluateBindingSync_",
    value: function evaluateBindingSync_(binding, name, opt_args) {
      try {
        var value = binding;

        if (typeof binding === 'function') {
          value = binding.apply(null, this.processArgsSync_(opt_args));
        }

        var result;

        if (value && typeof value.then == 'function') {
          // If binding is passed in as opt_binding we try to resolve it and it
          // may return a promise. NOTE: We do not collect this discarded value,
          // even if collectVars exists.
          user().error(TAG, 'ignoring async macro resolution');
          result = '';
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
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
     * @param {Array<!Array>|undefined} argsArray
     * @return {Array<string>|undefined}
     */

  }, {
    key: "processArgsSync_",
    value: function processArgsSync_(argsArray) {
      if (!argsArray) {
        return argsArray;
      }

      return argsArray.map(function (argArray) {
        return argArray.join('');
      });
    }
    /**
     * Collect vars if given the optional object. Handles formatting of kv pairs.
     * @param {string} name Name of the macro.
     * @param {*} value Raw macro resolution value.
     * @param {?Array=} opt_args Arguments to be passed if binding is function.
     */

  }, {
    key: "maybeCollectVars_",
    value: function maybeCollectVars_(name, value, opt_args) {
      if (!this.collectVars_) {
        return;
      }

      var args = '';

      if (opt_args) {
        var rawArgs = opt_args.filter(function (arg) {
          return arg !== '';
        }).join(',');
        args = "(" + rawArgs + ")";
      }

      this.collectVars_["" + name + args] = value || '';
    }
  }]);

  return Expander;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV4cGFuZGVyLmpzIl0sIm5hbWVzIjpbInRyeVJlc29sdmUiLCJyZXRocm93QXN5bmMiLCJoYXNPd24iLCJ0cmltU3RhcnQiLCJ1c2VyIiwiUEFSU0VSX0lHTk9SRV9GTEFHIiwiVEFHIiwiQmluZGluZ0luZm9EZWYiLCJNYXRjaERlZiIsIkV4cGFuZGVyIiwidmFyaWFibGVTb3VyY2UiLCJvcHRfYmluZGluZ3MiLCJvcHRfY29sbGVjdFZhcnMiLCJvcHRfc3luYyIsIm9wdF9hbGxvd2xpc3QiLCJvcHRfbm9FbmNvZGUiLCJ2YXJpYWJsZVNvdXJjZV8iLCJiaW5kaW5nc18iLCJjb2xsZWN0VmFyc18iLCJzeW5jXyIsImFsbG93bGlzdF8iLCJlbmNvZGVfIiwidXJsIiwibGVuZ3RoIiwiUHJvbWlzZSIsInJlc29sdmUiLCJleHByIiwiZ2V0RXhwciIsIm1hdGNoZXMiLCJmaW5kTWF0Y2hlc18iLCJwYXJzZVVybFJlY3Vyc2l2ZWx5XyIsIm1hdGNoIiwiZXhwcmVzc2lvbiIsInJlcGxhY2UiLCJuYW1lIiwic3RhcnRQb3NpdGlvbiIsInN0b3BQb3NpdGlvbiIsImluZm8iLCJzdGFydCIsInN0b3AiLCJwdXNoIiwic3RhY2siLCJ1cmxJbmRleCIsIm1hdGNoSW5kZXgiLCJudW1PZlBlbmRpbmdDYWxscyIsImlnbm9yaW5nQ2hhcnMiLCJldmFsdWF0ZU5leHRMZXZlbCIsImVuY29kZSIsImJ1aWxkZXIiLCJyZXN1bHRzIiwiYXJncyIsInRyaW1tZWRCdWlsZGVyIiwidHJpbSIsImJpbmRpbmciLCJwcmlvcml0aXplZCIsImdldCIsImV2YWx1YXRlQmluZGluZ18iLCJwb3AiLCJ2YWx1ZSIsImpvaW4iLCJhbGwiLCJ0aGVuIiwicHJvbWlzZUFycmF5IiwiY2F0Y2giLCJlIiwiYmluZGluZ0luZm8iLCJvcHRfYXJncyIsInVuZGVmaW5lZCIsInN5bmMiLCJlcnJvciIsImFzeW5jIiwicmVzdWx0IiwiZXZhbHVhdGVCaW5kaW5nU3luY18iLCJlbmNvZGVVUklDb21wb25lbnQiLCJldmFsdWF0ZUJpbmRpbmdBc3luY18iLCJiaW5kaW5nRnVuYyIsInByb2Nlc3NBcmdzQXN5bmNfIiwiYXBwbHkiLCJ2YWwiLCJtYXliZUNvbGxlY3RWYXJzXyIsImFyZ3NBcnJheSIsIm1hcCIsImFyZ0FycmF5IiwicmVzb2x2ZWQiLCJwcm9jZXNzQXJnc1N5bmNfIiwidG9TdHJpbmciLCJyYXdBcmdzIiwiZmlsdGVyIiwiYXJnIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLFVBQVI7QUFDQSxTQUFRQyxZQUFSO0FBQ0EsU0FBUUMsTUFBUjtBQUNBLFNBQVFDLFNBQVI7QUFFQSxTQUFRQyxJQUFSOztBQUVBO0FBQ0EsSUFBTUMsa0JBQWtCLEdBQUcsR0FBM0I7O0FBRUE7QUFDQSxJQUFNQyxHQUFHLEdBQUcsVUFBWjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQyxjQUFKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQyxRQUFKOztBQUVBO0FBQ0EsV0FBYUMsUUFBYjtBQUNFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRSxvQkFDRUMsY0FERixFQUVFQyxZQUZGLEVBR0VDLGVBSEYsRUFJRUMsUUFKRixFQUtFQyxhQUxGLEVBTUVDLFlBTkYsRUFPRTtBQUFBOztBQUNBO0FBQ0EsU0FBS0MsZUFBTCxHQUF1Qk4sY0FBdkI7O0FBRUE7QUFDQSxTQUFLTyxTQUFMLEdBQWlCTixZQUFqQjtBQUVBOztBQUNBO0FBQ0EsU0FBS08sWUFBTCxHQUFvQk4sZUFBcEI7O0FBRUE7QUFDQSxTQUFLTyxLQUFMLEdBQWFOLFFBQWI7O0FBRUE7QUFDQSxTQUFLTyxVQUFMLEdBQWtCTixhQUFsQjs7QUFFQTtB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QmdCLElBQXJCLEdBQTRCZ0IsSUFBNUIsSUFBc0NRLEtBQUssSUFBSSxFQUEvQztBQUNEO0FBcmJIOztBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAyMDE4IFRoZSBBTVAgSFRNTCBBdXRob3JzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMtSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IHt0cnlSZXNvbHZlfSBmcm9tICcjY29yZS9kYXRhLXN0cnVjdHVyZXMvcHJvbWlzZSc7XG5pbXBvcnQge3JldGhyb3dBc3luY30gZnJvbSAnI2NvcmUvZXJyb3InO1xuaW1wb3J0IHtoYXNPd259IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5pbXBvcnQge3RyaW1TdGFydH0gZnJvbSAnI2NvcmUvdHlwZXMvc3RyaW5nJztcblxuaW1wb3J0IHt1c2VyfSBmcm9tICcuLi8uLi9sb2cnO1xuXG4vKiogQHByaXZhdGUgQGNvbnN0IHtzdHJpbmd9ICovXG5jb25zdCBQQVJTRVJfSUdOT1JFX0ZMQUcgPSAnYCc7XG5cbi8qKiBAcHJpdmF0ZSBAY29uc3Qge3N0cmluZ30gKi9cbmNvbnN0IFRBRyA9ICdFeHBhbmRlcic7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgbmFtZTogc3RyaW5nLFxuICogICBwcmlvcml0aXplZDogKCFCaW5kaW5nSW5mb0RlZnx1bmRlZmluZWQpLFxuICogICBlbmNvZGU6IGJvb2xlYW4sXG4gKiAgIHN5bmM6IC4uL3ZhcmlhYmxlLXNvdXJjZS5TeW5jUmVzb2x2ZXJEZWYsXG4gKiAgIGFzeW5jOiAuLi92YXJpYWJsZS1zb3VyY2UuQXN5bmNSZXNvbHZlckRlZixcbiAqIH19XG4gKi9cbmxldCBCaW5kaW5nSW5mb0RlZjtcblxuLyoqXG4gKiBAdHlwZWRlZiB7e1xuICogICBzdGFydDogbnVtYmVyLFxuICogICBzdG9wOiBudW1iZXIsXG4gKiAgIG5hbWU6IHN0cmluZyxcbiAqICAgbGVuZ3RoOiBudW1iZXIsXG4gKiB9fVxuICovXG5sZXQgTWF0Y2hEZWY7XG5cbi8qKiBSdWRhbWVudGFyeSBwYXJzZXIgdG8gaGFuZGxlIG5lc3RlZCBVcmwgcmVwbGFjZW1lbnQuICovXG5leHBvcnQgY2xhc3MgRXhwYW5kZXIge1xuICAvKipcbiAgICogTGluayB0aGlzIGluc3RhbmNlIG9mIHBhcnNlciB0byB0aGUgY2FsbGluZyBVcmxSZXBsYWNtZW50XG4gICAqIEBwYXJhbSB7Py4uL3ZhcmlhYmxlLXNvdXJjZS5WYXJpYWJsZVNvdXJjZX0gdmFyaWFibGVTb3VyY2UgdGhlIGtleXdvcmRzIHRvIHJlcGxhY2VcbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgKj49fSBvcHRfYmluZGluZ3MgYWRkaXRpb25hbCBvbmUtb2ZmIGJpbmRpbmdzXG4gICAqIEBwYXJhbSB7IU9iamVjdDxzdHJpbmcsICo+PX0gb3B0X2NvbGxlY3RWYXJzIE9iamVjdCBwYXNzZWQgaW4gdG8gY29sbGVjdFxuICAgKiAgIHZhcmlhYmxlIHJlc29sdXRpb25zLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfc3luYyBJZiB0aGUgbWV0aG9kIHNob3VsZCByZXNvbHZlIHN5bmNyb25vdXNseS5cbiAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgYm9vbGVhbj49fSBvcHRfYWxsb3dsaXN0IE9wdGlvbmFsIGFsbG93bGlzdCBvZiBuYW1lc1xuICAgKiAgIHRoYXQgY2FuIGJlIHN1YnN0aXR1dGVkLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBvcHRfbm9FbmNvZGUgU2hvdWxkIG5vdCB1cmxFbmNvZGUgbWFjcm8gcmVzb2x1dGlvbi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIHZhcmlhYmxlU291cmNlLFxuICAgIG9wdF9iaW5kaW5ncyxcbiAgICBvcHRfY29sbGVjdFZhcnMsXG4gICAgb3B0X3N5bmMsXG4gICAgb3B0X2FsbG93bGlzdCxcbiAgICBvcHRfbm9FbmNvZGVcbiAgKSB7XG4gICAgLyoqIEBjb25zdCB7Py4uL3ZhcmlhYmxlLXNvdXJjZS5WYXJpYWJsZVNvdXJjZX0gKi9cbiAgICB0aGlzLnZhcmlhYmxlU291cmNlXyA9IHZhcmlhYmxlU291cmNlO1xuXG4gICAgLyoqQGNvbnN0IHshT2JqZWN0PHN0cmluZywgKj58dW5kZWZpbmVkfSAqL1xuICAgIHRoaXMuYmluZGluZ3NfID0gb3B0X2JpbmRpbmdzO1xuXG4gICAgLy8gVE9ETyhjY29yZHJ5KTogUmVtb3ZlIHRoaXMgb3V0cHV0IG9iamVjdCBwYXNzZWQgaW50byBjb25zdHJ1Y3Rvci5cbiAgICAvKipAY29uc3QgeyFPYmplY3Q8c3RyaW5nLCAqPnx1bmRlZmluZWR9ICovXG4gICAgdGhpcy5jb2xsZWN0VmFyc18gPSBvcHRfY29sbGVjdFZhcnM7XG5cbiAgICAvKipAY29uc3Qge2Jvb2xlYW58dW5kZWZpbmVkfSAqL1xuICAgIHRoaXMuc3luY18gPSBvcHRfc3luYztcblxuICAgIC8qKkBjb25zdCB7IU9iamVjdDxzdHJpbmcsIGJvb2xlYW4+fHVuZGVmaW5lZH0gKi9cbiAgICB0aGlzLmFsbG93bGlzdF8gPSBvcHRfYWxsb3dsaXN0O1xuXG4gICAgLyoqQGNvbnN0IHtib29sZWFufHVuZGVmaW5lZH0gKi9cbiAgICB0aGlzLmVuY29kZV8gPSAhb3B0X25vRW5jb2RlO1xuICB9XG5cbiAgLyoqXG4gICAqIHRha2UgdGhlIHRlbXBsYXRlIHVybCBhbmQgcmV0dXJuIGEgcHJvbWlzZSBvZiBpdHMgZXZhbHVhdGVkIHZhbHVlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgdXJsIHRvIGJlIHN1YnN0aXR1dGVkXG4gICAqIEByZXR1cm4geyFQcm9taXNlPHN0cmluZz58c3RyaW5nfVxuICAgKi9cbiAgZXhwYW5kKHVybCkge1xuICAgIGlmICghdXJsLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3luY18gPyB1cmwgOiBQcm9taXNlLnJlc29sdmUodXJsKTtcbiAgICB9XG4gICAgY29uc3QgZXhwciA9IHRoaXMudmFyaWFibGVTb3VyY2VfLmdldEV4cHIodGhpcy5iaW5kaW5nc18sIHRoaXMuYWxsb3dsaXN0Xyk7XG5cbiAgICBjb25zdCBtYXRjaGVzID0gdGhpcy5maW5kTWF0Y2hlc18odXJsLCBleHByKTtcbiAgICAvLyBpZiBubyBrZXl3b3JkcyBtb3ZlIG9uXG4gICAgaWYgKCFtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3luY18gPyB1cmwgOiBQcm9taXNlLnJlc29sdmUodXJsKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGFyc2VVcmxSZWN1cnNpdmVseV8odXJsLCBtYXRjaGVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYW55IG1hY3JvcyB0aGF0IGV4aXN0IGluIHRoZSBnaXZlbiB1cmwuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICogQHJldHVybiB7IUFycmF5fVxuICAgKi9cbiAgZ2V0TWFjcm9OYW1lcyh1cmwpIHtcbiAgICBjb25zdCBleHByID0gdGhpcy52YXJpYWJsZVNvdXJjZV8uZ2V0RXhwcih0aGlzLmJpbmRpbmdzXywgdGhpcy5hbGxvd2xpc3RfKTtcbiAgICBjb25zdCBtYXRjaGVzID0gdXJsLm1hdGNoKGV4cHIpO1xuICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICByZXR1cm4gbWF0Y2hlcztcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0cnVjdHVyZXMgdGhlIHJlZ2V4IG1hdGNoaW5nIGludG8gdGhlIGRlc2lyZWQgZm9ybWF0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgdXJsIHRvIGJlIHN1YnN0aXR1dGVkXG4gICAqIEBwYXJhbSB7UmVnRXhwfSBleHByZXNzaW9uIHJlZ2V4IGNvbnRhaW5pbmcgYWxsIGtleXdvcmRzXG4gICAqIEByZXR1cm4geyFBcnJheTwhTWF0Y2hEZWY+fSBhcnJheSBvZiBtYXRjaGluZyBrZXl3b3Jkcy5cbiAgICovXG4gIGZpbmRNYXRjaGVzXyh1cmwsIGV4cHJlc3Npb24pIHtcbiAgICBjb25zdCBtYXRjaGVzID0gLyoqIEB0eXBlIHshQXJyYXk8IU1hdGNoRGVmPn0gKi8gKFtdKTtcbiAgICB1cmwucmVwbGFjZShleHByZXNzaW9uLCAobWF0Y2gsIG5hbWUsIHN0YXJ0UG9zaXRpb24pID0+IHtcbiAgICAgIGNvbnN0IHtsZW5ndGh9ID0gbWF0Y2g7XG4gICAgICBjb25zdCBzdG9wUG9zaXRpb24gPSBsZW5ndGggKyBzdGFydFBvc2l0aW9uIC0gMTtcbiAgICAgIGNvbnN0IGluZm8gPSB7XG4gICAgICAgIHN0YXJ0OiBzdGFydFBvc2l0aW9uLFxuICAgICAgICBzdG9wOiBzdG9wUG9zaXRpb24sXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGxlbmd0aCxcbiAgICAgIH07XG4gICAgICBtYXRjaGVzLnB1c2goaW5mbyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG1hdGNoZXM7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcGFyYW0geyFBcnJheTwhTWF0Y2hEZWY+fSBtYXRjaGVzIEFycmF5IG9mIG1hdGNoaW5nIGtleXdvcmRzLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fHN0cmluZ31cbiAgICovXG4gIHBhcnNlVXJsUmVjdXJzaXZlbHlfKHVybCwgbWF0Y2hlcykge1xuICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgbGV0IHVybEluZGV4ID0gMDtcbiAgICBsZXQgbWF0Y2hJbmRleCA9IDA7XG4gICAgbGV0IG1hdGNoID0gbWF0Y2hlc1ttYXRjaEluZGV4XTtcbiAgICBsZXQgbnVtT2ZQZW5kaW5nQ2FsbHMgPSAwO1xuICAgIGxldCBpZ25vcmluZ0NoYXJzID0gZmFsc2U7XG5cbiAgICBjb25zdCBldmFsdWF0ZU5leHRMZXZlbCA9IChlbmNvZGUpID0+IHtcbiAgICAgIGxldCBidWlsZGVyID0gJyc7XG4gICAgICBsZXQgcmVzdWx0cyA9IFtdO1xuICAgICAgY29uc3QgYXJncyA9IFtdO1xuXG4gICAgICB3aGlsZSAodXJsSW5kZXggPCB1cmwubGVuZ3RoICYmIG1hdGNoSW5kZXggPD0gbWF0Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgdHJpbW1lZEJ1aWxkZXIgPSBidWlsZGVyLnRyaW0oKTtcbiAgICAgICAgaWYgKG1hdGNoICYmIHVybEluZGV4ID09PSBtYXRjaC5zdGFydCkge1xuICAgICAgICAgIC8vIENvbGxlY3QgYW55IGNoYXJzIHRoYXQgbWF5IGJlIHByZWZpeGluZyB0aGUgbWFjcm8sIGlmIHdlIGFyZSBpblxuICAgICAgICAgIC8vIGEgbmVzdGVkIGNvbnRleHQgdHJpbSB0aGUgYXJncy5cbiAgICAgICAgICBpZiAodHJpbW1lZEJ1aWxkZXIpIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChudW1PZlBlbmRpbmdDYWxscyA/IHRyaW1TdGFydChidWlsZGVyKSA6IGJ1aWxkZXIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIHdlIGtub3cgd2UgYXJlIGF0IHRoZSBzdGFydCBvZiBhIG1hY3JvLCB3ZSBmaWd1cmUgb3V0IGhvdyB0b1xuICAgICAgICAgIC8vIHJlc29sdmUgaXQsIGFuZCBtb3ZlIG91ciBwb2ludGVyIHRvIGFmdGVyIHRoZSB0b2tlbi5cbiAgICAgICAgICBsZXQgYmluZGluZztcbiAgICAgICAgICAvLyBGaW5kIG91dCB3aGVyZSB0aGlzIG1hY3JvIGlzIGNvbWluZyBmcm9tLiBDb3VsZCBiZSBmcm9tIHRoZSBwYXNzZWRcbiAgICAgICAgICAvLyBpbiBvcHRpb25hbCBiaW5kaW5ncywgb3IgdGhlIGdsb2JhbCB2YXJpYWJsZSBzb3VyY2UuXG4gICAgICAgICAgaWYgKHRoaXMuYmluZGluZ3NfICYmIGhhc093bih0aGlzLmJpbmRpbmdzXywgbWF0Y2gubmFtZSkpIHtcbiAgICAgICAgICAgIC8vIE1hY3JvIGlzIGZyb20gb3B0aW9uYWwgYmluZGluZ3MuXG4gICAgICAgICAgICBiaW5kaW5nID0gLyoqIEB0eXBlIHshQmluZGluZ0luZm9EZWZ9ICovICh7XG4gICAgICAgICAgICAgIC8vIFRoaXMgY29uc3RydWN0aW9uIGhlbHBzIHVzIHNhdmUgdGhlIG1hdGNoIG5hbWUgYW5kIGRldGVybWluZVxuICAgICAgICAgICAgICAvLyBwcmVjZWRlbmNlIG9mIHJlc29sdXRpb24gY2hvaWNlcyBpbiAjZXhwYW5kQmluZGluZ18gbGF0ZXIuXG4gICAgICAgICAgICAgIG5hbWU6IG1hdGNoLm5hbWUsXG4gICAgICAgICAgICAgIHByaW9yaXRpemVkOiB0aGlzLmJpbmRpbmdzX1ttYXRjaC5uYW1lXSxcbiAgICAgICAgICAgICAgZW5jb2RlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE1hY3JvIGlzIGZyb20gdGhlIGdsb2JhbCBzb3VyY2UuXG4gICAgICAgICAgICBiaW5kaW5nID0gLyoqIEB0eXBlIHshQmluZGluZ0luZm9EZWZ9ICovICh7XG4gICAgICAgICAgICAgIC4uLnRoaXMudmFyaWFibGVTb3VyY2VfLmdldChtYXRjaC5uYW1lKSxcbiAgICAgICAgICAgICAgbmFtZTogbWF0Y2gubmFtZSxcbiAgICAgICAgICAgICAgZW5jb2RlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdXJsSW5kZXggPSBtYXRjaC5zdG9wICsgMTtcbiAgICAgICAgICBtYXRjaCA9IG1hdGNoZXNbKyttYXRjaEluZGV4XTtcblxuICAgICAgICAgIGlmICh1cmxbdXJsSW5kZXhdID09PSAnKCcpIHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2Ugc2VlIGEgYChgIHdlIGtub3cgd2UgbmVlZCB0byByZXNvbHZlIG9uZSBsZXZlbCBkZWVwZXJcbiAgICAgICAgICAgIC8vIGJlZm9yZSBjb250aW51aW5nLiBXZSBwdXNoIHRoZSBiaW5kaW5nIGluIHRoZSBzdGFjayBmb3JcbiAgICAgICAgICAgIC8vIHJlc29sdXRpb24gbGF0ZXIsIGFuZCB0aGVuIG1ha2UgdGhlIHJlY3Vyc2l2ZSBjYWxsLlxuICAgICAgICAgICAgdXJsSW5kZXgrKztcbiAgICAgICAgICAgIG51bU9mUGVuZGluZ0NhbGxzKys7XG4gICAgICAgICAgICBzdGFjay5wdXNoKGJpbmRpbmcpO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGV2YWx1YXRlTmV4dExldmVsKC8qIGVuY29kZSAqLyBmYWxzZSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBNYW55IG1hY3JvcyBkbyBub3QgdGFrZSBhcmd1bWVudHMsIGluIHRoaXMgY2FzZSB3ZSBkbyBub3QgbmVlZCB0b1xuICAgICAgICAgICAgLy8gcmVjdXJzZSwgd2UganVzdCBzdGFydCByZXNvbHV0aW9uIGluIGl0J3MgcG9zaXRpb24uXG4gICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5ldmFsdWF0ZUJpbmRpbmdfKGJpbmRpbmcpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBidWlsZGVyID0gJyc7XG4gICAgICAgIH0gZWxzZSBpZiAodXJsW3VybEluZGV4XSA9PT0gUEFSU0VSX0lHTk9SRV9GTEFHKSB7XG4gICAgICAgICAgaWYgKCFpZ25vcmluZ0NoYXJzKSB7XG4gICAgICAgICAgICBpZ25vcmluZ0NoYXJzID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIENvbGxlY3QgYW55IGNoYXJzIHRoYXQgbWF5IGV4aXN0IGJlZm9yZSBiYWNrdGlja3MsIGVnIEZPTyhhYGJgKVxuICAgICAgICAgICAgaWYgKHRyaW1tZWRCdWlsZGVyKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0cmltbWVkQnVpbGRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlnbm9yaW5nQ2hhcnMgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIENvbGxlY3QgYW55IGNoYXJzIGluc2lkZSBiYWNrdGlja3Mgd2l0aG91dCB0cmltbWluZyB3aGl0ZXNwYWNlLlxuICAgICAgICAgICAgaWYgKGJ1aWxkZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaChidWlsZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnVpbGRlciA9ICcnO1xuICAgICAgICAgIHVybEluZGV4Kys7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgbnVtT2ZQZW5kaW5nQ2FsbHMgJiZcbiAgICAgICAgICB1cmxbdXJsSW5kZXhdID09PSAnLCcgJiZcbiAgICAgICAgICAhaWdub3JpbmdDaGFyc1xuICAgICAgICApIHtcbiAgICAgICAgICAvLyBDb21tYXMgdGVsbCB1cyB0byBjcmVhdGUgYSBuZXcgYXJndW1lbnQgd2hlbiBpbiBuZXN0ZWQgY29udGV4dCBhbmRcbiAgICAgICAgICAvLyB3ZSBwdXNoIGFueSBzdHJpbmcgYnVpbHQgc28gZmFyLCBjcmVhdGUgYSBuZXcgYXJyYXkgZm9yIHRoZSBuZXh0XG4gICAgICAgICAgLy8gYXJndW1lbnQsIGFuZCByZXNldCBvdXIgc3RyaW5nIGJ1aWxkZXIuXG4gICAgICAgICAgaWYgKHRyaW1tZWRCdWlsZGVyKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2godHJpbW1lZEJ1aWxkZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhcmdzLnB1c2gocmVzdWx0cyk7XG4gICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIC8vIFN1cHBvcnQgZXhpc3RpbmcgdHdvIGNvbW1hIGZvcm1hdCBieSBwdXNoaW5nIGFuIGVtcHR5IHN0cmluZyBhc1xuICAgICAgICAgIC8vIGFyZ3VtZW50LiBlZyBDTElFTlRfSUQoX19nYSwsZ2EtdXJsKVxuICAgICAgICAgIGlmICh1cmxbdXJsSW5kZXggKyAxXSA9PT0gJywnKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2goWycnXSk7XG4gICAgICAgICAgICB1cmxJbmRleCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBidWlsZGVyID0gJyc7XG4gICAgICAgICAgdXJsSW5kZXgrKztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEludm9rZSBhIGZ1bmN0aW9uIG9uIGV2ZXJ5IHJpZ2h0IHBhcmVudGhlc2lzIHVubGVzcyB0aGUgc3RhY2sgaXNcbiAgICAgICAgLy8gZW1wdHkuIFRoaXMgaXMgd2hlcmUgd2UgYWN0dWFsbHkgZXZhbHVhdGUgYW55IG1hY3JvIHRoYXQgdGFrZXMgYW5cbiAgICAgICAgLy8gYXJndW1lbnQuIFdlIHBvcCB0aGUgbWFjcm8gcmVzb3ZlciBvZmYgdGhlIHN0YWNrLCBhbmQgdGFrZSBhbnlpbmcgbGVmdFxuICAgICAgICAvLyBpbiBvdXIgc3RyaW5nIGJ1aWxkZXIgYW5kIGFkZCBpdCBhcyB0aGUgZmluYWwgc2VjdGlvbiBvZiB0aGUgZmluYWxcbiAgICAgICAgLy8gYXJnLiBUaGVuIHdlIGNhbGwgdGhlIHJlc29sdmVyLlxuICAgICAgICBlbHNlIGlmIChudW1PZlBlbmRpbmdDYWxscyAmJiB1cmxbdXJsSW5kZXhdID09PSAnKScgJiYgIWlnbm9yaW5nQ2hhcnMpIHtcbiAgICAgICAgICB1cmxJbmRleCsrO1xuICAgICAgICAgIG51bU9mUGVuZGluZ0NhbGxzLS07XG4gICAgICAgICAgY29uc3QgYmluZGluZyA9IHN0YWNrLnBvcCgpO1xuICAgICAgICAgIGlmICh0cmltbWVkQnVpbGRlcikge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRyaW1tZWRCdWlsZGVyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXJncy5wdXNoKHJlc3VsdHMpO1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5ldmFsdWF0ZUJpbmRpbmdfKGJpbmRpbmcsIC8qIG9wdF9hcmdzICovIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBtb3N0IGNvbW1vbiBjYXNlLiBKdXN0IGJ1aWxkaW5nIGEgc3RyaW5nIGFzIHdlIHdhbGtcbiAgICAgICAgICAvLyBhbG9uZy5cbiAgICAgICAgICBidWlsZGVyICs9IHVybFt1cmxJbmRleF07XG4gICAgICAgICAgdXJsSW5kZXgrKztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhcHR1cmUgYW55IHRyYWlsaW5nIGNoYXJhY3RlcnMuXG4gICAgICAgIGlmICh1cmxJbmRleCA9PT0gdXJsLmxlbmd0aCAmJiBidWlsZGVyLmxlbmd0aCkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaChidWlsZGVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUT0RPOiBJZiB0aGVyZSBpcyBhIHNpbmdsZSBpdGVtIGluIHJlc3VsdHMsIHdlIHNob3VsZCBwcmVzZXJ2ZSBpdCdzXG4gICAgICAvLyB0eXBlIHdoZW4gcmV0dXJuaW5nIGhlcmUgYW5kIHRoZSBhc3luYyB2ZXJzaW9uIGJlbG93LlxuICAgICAgaWYgKHRoaXMuc3luY18pIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHMuam9pbignJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChyZXN1bHRzKVxuICAgICAgICAudGhlbigocHJvbWlzZUFycmF5KSA9PiBwcm9taXNlQXJyYXkuam9pbignJykpXG4gICAgICAgIC5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgIHJldGhyb3dBc3luYyhlKTtcbiAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4gZXZhbHVhdGVOZXh0TGV2ZWwodGhpcy5lbmNvZGVfKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGJpbmRpbmcgaXMgcmVhZHkgdG8gYmUgcmVzb2x2ZWQuIERldGVybWluZXMgd2hpY2ggdmVyc2lvbiBvZlxuICAgKiBiaW5kaW5nIHRvIHVzZSBhbmQgaWYgc3luY3Jvbm91cyBvciBhc3luY3Jvbm91cyB2ZXJzaW9uIHNob3VsZCBiZSBjYWxsZWQuXG4gICAqIEBwYXJhbSB7IUJpbmRpbmdJbmZvRGVmfSBiaW5kaW5nSW5mbyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgbmFtZSBvZlxuICAgKiAgICBtYWNybyBhbmQgdmFsdWUgdG8gYmUgcmVzb2x2ZWQuXG4gICAqIEBwYXJhbSB7QXJyYXk9fSBvcHRfYXJncyBBcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBtYWNyby4gQXJndW1lbnRzIGNvbWUgYXNcbiAgICogICAgYW4gYXJyYXkgb2YgYXJyYXlzIHRoYXQgd2lsbCBiZSBldmVudHVhbGx5IHBhc3NlZCB0byBhIGZ1bmN0aW9uLmFwcGx5XG4gICAqICAgIGludm9jYXRpb24uIEZvciBleGFtcGxlOiBGT08oQkFSQkFSLCAxMjMpID0+IFdoZW4gd2UgYXJlIHJlYWR5IHRvIGV2YWx1YXRlXG4gICAqICAgIHRoZSBGT08gYmluZGluZyBvcHRfYXJncyB3aWxsIGJlIFtbUmVzdWx0IG9mIEJBUiwgUmVzdWx0IG9mIEJBUl0sIFsxMjNdXS5cbiAgICogICAgVGhpcyBzdHJ1Y3R1cmUgaXMgc28gdGhhdCB0aGUgb3V0ZXIgYXJyYXkgd2lsbCBoYXZlIHRoZSBjb3JyZWN0IG51bWJlciBvZlxuICAgKiAgICBhcmd1bWVudHMsIGJ1dCB3ZSBzdGlsbCBjYW4gcmVzb2x2ZSBlYWNoIG1hY3JvIHNlcGFyYXRlbHkuXG4gICAqIEByZXR1cm4ge3N0cmluZ3whUHJvbWlzZTxzdHJpbmc+fVxuICAgKi9cbiAgZXZhbHVhdGVCaW5kaW5nXyhiaW5kaW5nSW5mbywgb3B0X2FyZ3MpIHtcbiAgICBjb25zdCB7ZW5jb2RlLCBuYW1lfSA9IGJpbmRpbmdJbmZvO1xuICAgIGxldCBiaW5kaW5nO1xuICAgIGlmIChiaW5kaW5nSW5mby5wcmlvcml0aXplZCAhPSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEhhcyB0byBleHBsaWNpdHkgY2hlY2sgZm9yIHVuZGVmaW5lZCBiZWNhdXNlIGJpbmRpbmdJbmZvLnByaW9yaXR5aXplZFxuICAgICAgLy8gY291bGQgbm90IGJlIGEgZnVuY3Rpb24gYnV0IGEgZmFsc2UgdmFsdWUuIEZvciBleGFtcGxlIHtGT086IDB9XG4gICAgICAvLyBJZiBhIGJpbmRpbmcgaXMgcGFzc2VkIGluIHRocm91Z2ggdGhlIGJpbmRpbmdzIGFyZ3VtZW50IGl0IGFsd2F5cyB0YWtlc1xuICAgICAgLy8gcHJlY2VkZW5jZS5cbiAgICAgIGJpbmRpbmcgPSBiaW5kaW5nSW5mby5wcmlvcml0aXplZDtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3luY18gJiYgYmluZGluZ0luZm8uc3luYyAhPSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFVzZSB0aGUgc3luYyByZXNvbHV0aW9uIGlmIGF2YWxpYWJsZSB3aGVuIGNhbGxlZCBzeW5jaHJvbm91c2x5LlxuICAgICAgYmluZGluZyA9IGJpbmRpbmdJbmZvLnN5bmM7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN5bmNfKSB7XG4gICAgICAvLyBJZiB0aGVyZSBpcyBubyBzeW5jIHJlc29sdXRpb24gd2UgY2FuIG5vdCB3YWl0LlxuICAgICAgdXNlcigpLmVycm9yKFRBRywgJ2lnbm9yaW5nIGFzeW5jIHJlcGxhY2VtZW50IGtleTogJywgYmluZGluZ0luZm8ubmFtZSk7XG4gICAgICBiaW5kaW5nID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFByZWZlciB0aGUgYXN5bmMgb3ZlciB0aGUgc3luYyBidXQgaXQgbWF5IG5vdCBleGlzdC5cbiAgICAgIGJpbmRpbmcgPSBiaW5kaW5nSW5mby5hc3luYyB8fCBiaW5kaW5nSW5mby5zeW5jO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnN5bmNfKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSB0aGlzLmV2YWx1YXRlQmluZGluZ1N5bmNfKGJpbmRpbmcsIG5hbWUsIG9wdF9hcmdzKTtcbiAgICAgIHJldHVybiBlbmNvZGUgPyBlbmNvZGVVUklDb21wb25lbnQocmVzdWx0KSA6IHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVCaW5kaW5nQXN5bmNfKGJpbmRpbmcsIG5hbWUsIG9wdF9hcmdzKS50aGVuKFxuICAgICAgICAocmVzdWx0KSA9PiAoZW5jb2RlID8gZW5jb2RlVVJJQ29tcG9uZW50KHJlc3VsdCkgOiByZXN1bHQpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyBiaW5kaW5nIHRvIHZhbHVlIHRvIGJlIHN1YnN0aXR1dGVkIGFzeW5jcm9ub3VzbHkuXG4gICAqIEBwYXJhbSB7Kn0gYmluZGluZyBDb250YWluZXIgZm9yIHN5bmMvYXN5bmMgcmVzb2x1dGlvbnMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7P0FycmF5PX0gb3B0X2FyZ3MgQXJndW1lbnRzIHRvIGJlIHBhc3NlZCBpZiBiaW5kaW5nIGlzIGZ1bmN0aW9uLlxuICAgKiBAcmV0dXJuIHshUHJvbWlzZTxzdHJpbmc+fSBSZXNvbHZlZCB2YWx1ZS5cbiAgICovXG4gIGV2YWx1YXRlQmluZGluZ0FzeW5jXyhiaW5kaW5nLCBuYW1lLCBvcHRfYXJncykge1xuICAgIGxldCB2YWx1ZTtcbiAgICB0cnkge1xuICAgICAgaWYgKHR5cGVvZiBiaW5kaW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmdGdW5jID0gYmluZGluZztcbiAgICAgICAgaWYgKG9wdF9hcmdzKSB7XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLnByb2Nlc3NBcmdzQXN5bmNfKG9wdF9hcmdzKS50aGVuKChhcmdzKSA9PlxuICAgICAgICAgICAgYmluZGluZ0Z1bmMuYXBwbHkobnVsbCwgYXJncylcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gdHJ5UmVzb2x2ZShiaW5kaW5nRnVuYyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gUHJvbWlzZS5yZXNvbHZlKGJpbmRpbmcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICAgIC50aGVuKCh2YWwpID0+IHtcbiAgICAgICAgICB0aGlzLm1heWJlQ29sbGVjdFZhcnNfKG5hbWUsIHZhbCwgb3B0X2FyZ3MpO1xuXG4gICAgICAgICAgbGV0IHJlc3VsdDtcblxuICAgICAgICAgIGlmICh2YWwgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzdWx0ID0gJyc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHZhbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgcmV0aHJvd0FzeW5jKGUpO1xuICAgICAgICAgIHRoaXMubWF5YmVDb2xsZWN0VmFyc18obmFtZSwgJycsIG9wdF9hcmdzKTtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCcnKTtcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gUmVwb3J0IGVycm9yLCBidXQgZG8gbm90IGRpc3J1cHQgVVJMIHJlcGxhY2VtZW50LiBUaGlzIHdpbGxcbiAgICAgIC8vIGludGVycG9sYXRlIGFzIHRoZSBlbXB0eSBzdHJpbmcuXG4gICAgICByZXRocm93QXN5bmMoZSk7XG4gICAgICB0aGlzLm1heWJlQ29sbGVjdFZhcnNfKG5hbWUsICcnLCBvcHRfYXJncyk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCcnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRmxhdHRlbnMgdGhlIGlubmVyIGxheWVyIG9mIGFuIGFycmF5IG9mIGFycmF5cyBzbyB0aGF0IHRoZSByZXN1bHQgY2FuIGJlXG4gICAqIHBhc3NlZCB0byBhIGZ1bmN0aW9uLmFwcGx5IGNhbGwuIE11c3Qgd2FpdCBmb3IgYW55IGlubmVyIG1hY3JvcyB0byByZXNvbHZlLlxuICAgKiBUaGlzIHdpbGwgY2FzdCBhbGwgYXJndW1lbnRzIHRvIHN0cmluZyBiZWZvcmUgY2FsbGluZyB0aGUgbWFjcm8uXG4gICAqICBbW1Jlc3VsdCBvZiBCQVIsIFJlc3VsdCBvZiBCQVJdLCAxMjNdLiA9PiBbJ3Jlc3VsdHJlc3VsdCcsICcxMjMnXVxuICAgKiBAcGFyYW0geyFBcnJheTwhQXJyYXk+fSBhcmdzQXJyYXlcbiAgICogQHJldHVybiB7IVByb21pc2U8QXJyYXk8c3RyaW5nPj59XG4gICAqL1xuICBwcm9jZXNzQXJnc0FzeW5jXyhhcmdzQXJyYXkpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICBhcmdzQXJyYXkubWFwKChhcmdBcnJheSkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoYXJnQXJyYXkpLnRoZW4oKHJlc29sdmVkKSA9PiByZXNvbHZlZC5qb2luKCcnKSk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZXMgYmluZGluZyB0byB2YWx1ZSB0byBiZSBzdWJzdGl0dXRlZCBhc3luY3Jvbm91c2x5LlxuICAgKiBAcGFyYW0geyp9IGJpbmRpbmcgQ29udGFpbmVyIGZvciBzeW5jL2FzeW5jIHJlc29sdXRpb25zLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0gez9BcnJheT19IG9wdF9hcmdzIEFyZ3VtZW50cyB0byBiZSBwYXNzZWQgaWYgYmluZGluZyBpcyBmdW5jdGlvbi5cbiAgICogQHJldHVybiB7c3RyaW5nfSBSZXNvbHZlZCB2YWx1ZS5cbiAgICovXG4gIGV2YWx1YXRlQmluZGluZ1N5bmNfKGJpbmRpbmcsIG5hbWUsIG9wdF9hcmdzKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCB2YWx1ZSA9IGJpbmRpbmc7XG4gICAgICBpZiAodHlwZW9mIGJpbmRpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFsdWUgPSBiaW5kaW5nLmFwcGx5KG51bGwsIHRoaXMucHJvY2Vzc0FyZ3NTeW5jXyhvcHRfYXJncykpO1xuICAgICAgfVxuXG4gICAgICBsZXQgcmVzdWx0O1xuXG4gICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBJZiBiaW5kaW5nIGlzIHBhc3NlZCBpbiBhcyBvcHRfYmluZGluZyB3ZSB0cnkgdG8gcmVzb2x2ZSBpdCBhbmQgaXRcbiAgICAgICAgLy8gbWF5IHJldHVybiBhIHByb21pc2UuIE5PVEU6IFdlIGRvIG5vdCBjb2xsZWN0IHRoaXMgZGlzY2FyZGVkIHZhbHVlLFxuICAgICAgICAvLyBldmVuIGlmIGNvbGxlY3RWYXJzIGV4aXN0cy5cbiAgICAgICAgdXNlcigpLmVycm9yKFRBRywgJ2lnbm9yaW5nIGFzeW5jIG1hY3JvIHJlc29sdXRpb24nKTtcbiAgICAgICAgcmVzdWx0ID0gJyc7XG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbidcbiAgICAgICkge1xuICAgICAgICAvLyBOb3JtYWwgY2FzZS5cbiAgICAgICAgdGhpcy5tYXliZUNvbGxlY3RWYXJzXyhuYW1lLCB2YWx1ZSwgb3B0X2FyZ3MpO1xuICAgICAgICAvLyBUT0RPOiBXZSBzaG91bGQgdHJ5IHRvIHByZXNlcnZlIHR5cGUgaGVyZS5cbiAgICAgICAgcmVzdWx0ID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE1vc3QgbGlrZWx5IGEgYnJva2VuIGJpbmRpbmcgZ2V0cyB1cyBoZXJlLlxuICAgICAgICB0aGlzLm1heWJlQ29sbGVjdFZhcnNfKG5hbWUsICcnLCBvcHRfYXJncyk7XG4gICAgICAgIHJlc3VsdCA9ICcnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFJlcG9ydCBlcnJvciwgYnV0IGRvIG5vdCBkaXNydXB0IFVSTCByZXBsYWNlbWVudC4gVGhpcyB3aWxsXG4gICAgICAvLyBpbnRlcnBvbGF0ZSBhcyB0aGUgZW1wdHkgc3RyaW5nLlxuICAgICAgcmV0aHJvd0FzeW5jKGUpO1xuICAgICAgdGhpcy5tYXliZUNvbGxlY3RWYXJzXyhuYW1lLCAnJywgb3B0X2FyZ3MpO1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGbGF0dGVucyB0aGUgaW5uZXIgbGF5ZXIgb2YgYW4gYXJyYXkgb2YgYXJyYXlzIHNvIHRoYXQgdGhlIHJlc3VsdCBjYW4gYmVcbiAgICogcGFzc2VkIHRvIGEgZnVuY3Rpb24uYXBwbHkgY2FsbC4gV2lsbCBub3Qgd2FpdCBmb3IgYW55IHByb21pc2UgdG8gcmVzb2x2ZS5cbiAgICogVGhpcyB3aWxsIGNhc3QgYWxsIGFyZ3VtZW50cyB0byBzdHJpbmcgYmVmb3JlIGNhbGxpbmcgdGhlIG1hY3JvLlxuICAgKiAgW1tSZXN1bHQgb2YgQkFSLCBSZXN1bHQgb2YgQkFSXSwgMTIzXS4gPT4gWydyZXN1bHRyZXN1bHQnLCAnMTIzJ11cbiAgICogQHBhcmFtIHtBcnJheTwhQXJyYXk+fHVuZGVmaW5lZH0gYXJnc0FycmF5XG4gICAqIEByZXR1cm4ge0FycmF5PHN0cmluZz58dW5kZWZpbmVkfVxuICAgKi9cbiAgcHJvY2Vzc0FyZ3NTeW5jXyhhcmdzQXJyYXkpIHtcbiAgICBpZiAoIWFyZ3NBcnJheSkge1xuICAgICAgcmV0dXJuIGFyZ3NBcnJheTtcbiAgICB9XG4gICAgcmV0dXJuIGFyZ3NBcnJheS5tYXAoKGFyZ0FycmF5KSA9PiB7XG4gICAgICByZXR1cm4gYXJnQXJyYXkuam9pbignJyk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ29sbGVjdCB2YXJzIGlmIGdpdmVuIHRoZSBvcHRpb25hbCBvYmplY3QuIEhhbmRsZXMgZm9ybWF0dGluZyBvZiBrdiBwYWlycy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgTmFtZSBvZiB0aGUgbWFjcm8uXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgUmF3IG1hY3JvIHJlc29sdXRpb24gdmFsdWUuXG4gICAqIEBwYXJhbSB7P0FycmF5PX0gb3B0X2FyZ3MgQXJndW1lbnRzIHRvIGJlIHBhc3NlZCBpZiBiaW5kaW5nIGlzIGZ1bmN0aW9uLlxuICAgKi9cbiAgbWF5YmVDb2xsZWN0VmFyc18obmFtZSwgdmFsdWUsIG9wdF9hcmdzKSB7XG4gICAgaWYgKCF0aGlzLmNvbGxlY3RWYXJzXykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBhcmdzID0gJyc7XG4gICAgaWYgKG9wdF9hcmdzKSB7XG4gICAgICBjb25zdCByYXdBcmdzID0gb3B0X2FyZ3MuZmlsdGVyKChhcmcpID0+IGFyZyAhPT0gJycpLmpvaW4oJywnKTtcbiAgICAgIGFyZ3MgPSBgKCR7cmF3QXJnc30pYDtcbiAgICB9XG4gICAgdGhpcy5jb2xsZWN0VmFyc19bYCR7bmFtZX0ke2FyZ3N9YF0gPSB2YWx1ZSB8fCAnJztcbiAgfVxufVxuIl19
// /Users/mszylkowski/src/amphtml/src/service/url-expander/expander.js