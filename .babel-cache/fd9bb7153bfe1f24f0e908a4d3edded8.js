function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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
  function Expander(
  variableSource,
  opt_bindings,
  opt_collectVars,
  opt_sync,
  opt_allowlist,
  opt_noEncode)
  {_classCallCheck(this, Expander);
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
   */_createClass(Expander, [{ key: "expand", value:
    function expand(url) {
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
     */ }, { key: "getMacroNames", value:
    function getMacroNames(url) {
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
     */ }, { key: "findMatches_", value:
    function findMatches_(url, expression) {
      var matches = /** @type {!Array<!MatchDef>} */([]);
      url.replace(expression, function (match, name, startPosition) {
        var length = match.length;
        var stopPosition = length + startPosition - 1;
        var info = {
          start: startPosition,
          stop: stopPosition,
          name: name,
          length: length };

        matches.push(info);
      });
      return matches;
    }

    /**
     * @param {string} url
     * @param {!Array<!MatchDef>} matches Array of matching keywords.
     * @return {!Promise<string>|string}
     */ }, { key: "parseUrlRecursively_", value:
    function parseUrlRecursively_(url, matches) {var _this = this;
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
              binding = /** @type {!BindingInfoDef} */({
                // This construction helps us save the match name and determine
                // precedence of resolution choices in #expandBinding_ later.
                name: match.name,
                prioritized: _this.bindings_[match.name],
                encode: encode });

            } else {
              // Macro is from the global source.
              binding = /** @type {!BindingInfoDef} */_objectSpread(_objectSpread({},
              _this.variableSource_.get(match.name)), {}, {
                name: match.name,
                encode: encode });

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
              results.push(evaluateNextLevel( /* encode */false));
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
          } else if (
          numOfPendingCalls &&
          url[urlIndex] === ',' &&
          !ignoringChars)
          {
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
          } else

            // Invoke a function on every right parenthesis unless the stack is
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
              var value = _this.evaluateBinding_(_binding, /* opt_args */args);
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

        return Promise.all(results).
        then(function (promiseArray) {return promiseArray.join('');}).
        catch(function (e) {
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
     */ }, { key: "evaluateBinding_", value:
    function evaluateBinding_(bindingInfo, opt_args) {
      var encode = bindingInfo.encode,name = bindingInfo.name;
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
        return this.evaluateBindingAsync_(binding, name, opt_args).then(
        function (result) {return (encode ? encodeURIComponent(result) : result);});

      }
    }

    /**
     * Resolves binding to value to be substituted asyncronously.
     * @param {*} binding Container for sync/async resolutions.
     * @param {string} name
     * @param {?Array=} opt_args Arguments to be passed if binding is function.
     * @return {!Promise<string>} Resolved value.
     */ }, { key: "evaluateBindingAsync_", value:
    function evaluateBindingAsync_(binding, name, opt_args) {var _this2 = this;
      var value;
      try {
        if (typeof binding === 'function') {
          var bindingFunc = binding;
          if (opt_args) {
            value = this.processArgsAsync_(opt_args).then(function (args) {return (
                bindingFunc.apply(null, args));});

          } else {
            value = tryResolve(bindingFunc);
          }
        } else {
          value = Promise.resolve(binding);
        }
        return value.
        then(function (val) {
          _this2.maybeCollectVars_(name, val, opt_args);

          var result;

          if (val == null) {
            result = '';
          } else {
            result = val;
          }
          return result;
        }).
        catch(function (e) {
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
     */ }, { key: "processArgsAsync_", value:
    function processArgsAsync_(argsArray) {
      return Promise.all(
      argsArray.map(function (argArray) {
        return Promise.all(argArray).then(function (resolved) {return resolved.join('');});
      }));

    }

    /**
     * Resolves binding to value to be substituted asyncronously.
     * @param {*} binding Container for sync/async resolutions.
     * @param {string} name
     * @param {?Array=} opt_args Arguments to be passed if binding is function.
     * @return {string} Resolved value.
     */ }, { key: "evaluateBindingSync_", value:
    function evaluateBindingSync_(binding, name, opt_args) {
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
        } else if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean')
        {
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
     */ }, { key: "processArgsSync_", value:
    function processArgsSync_(argsArray) {
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
     */ }, { key: "maybeCollectVars_", value:
    function maybeCollectVars_(name, value, opt_args) {
      if (!this.collectVars_) {
        return;
      }

      var args = '';
      if (opt_args) {
        var rawArgs = opt_args.filter(function (arg) {return arg !== '';}).join(',');
        args = "(".concat(rawArgs, ")");
      }
      this.collectVars_["".concat(name).concat(args)] = value || '';
    } }]);return Expander;}();
// /Users/mszylkowski/src/amphtml/src/service/url-expander/expander.js