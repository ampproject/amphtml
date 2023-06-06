import {tryResolve} from '#core/data-structures/promise';
import {rethrowAsync} from '#core/error';
import {hasOwn} from '#core/types/object';
import {trimStart} from '#core/types/string';

import {user} from '#utils/log';

/** @private @const {string} */
const PARSER_IGNORE_FLAG = '`';

/** @private @const {string} */
const TAG = 'Expander';

/**
 * @typedef {{
 *   name: string,
 *   prioritized: (!BindingInfoDef|undefined),
 *   encode: boolean,
 *   sync: ../variable-source.SyncResolverDef,
 *   async: ../variable-source.AsyncResolverDef,
 * }}
 */
let BindingInfoDef;

/**
 * @typedef {{
 *   start: number,
 *   stop: number,
 *   name: string,
 *   length: number,
 * }}
 */
let MatchDef;

/** Rudamentary parser to handle nested Url replacement. */
export class Expander {
  /**
   * Link this instance of parser to the calling UrlReplacment
   * @param {?../variable-source.VariableSource} variableSource the keywords to replace
   * @param {!{[key: string]: *}=} opt_bindings additional one-off bindings
   * @param {!{[key: string]: *}=} opt_collectVars Object passed in to collect
   *   variable resolutions.
   * @param {boolean=} opt_sync If the method should resolve syncronously.
   * @param {!{[key: string]: boolean}=} opt_allowlist Optional allowlist of names
   *   that can be substituted.
   * @param {boolean=} opt_noEncode Should not urlEncode macro resolution.
   */
  constructor(
    variableSource,
    opt_bindings,
    opt_collectVars,
    opt_sync,
    opt_allowlist,
    opt_noEncode
  ) {
    /** @const {?../variable-source.VariableSource} */
    this.variableSource_ = variableSource;

    /**@const {!{[key: string]: *}|undefined} */
    this.bindings_ = opt_bindings;

    // TODO(ccordry): Remove this output object passed into constructor.
    /**@const {!{[key: string]: *}|undefined} */
    this.collectVars_ = opt_collectVars;

    /**@const {boolean|undefined} */
    this.sync_ = opt_sync;

    /**@const {!{[key: string]: boolean}|undefined} */
    this.allowlist_ = opt_allowlist;

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
    const expr = this.variableSource_.getExpr(this.bindings_, this.allowlist_);

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
    const expr = this.variableSource_.getExpr(this.bindings_, this.allowlist_);
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
   * @return {!Array<!MatchDef>} array of matching keywords.
   */
  findMatches_(url, expression) {
    const matches = /** @type {!Array<!MatchDef>} */ ([]);
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
   * @param {!Array<!MatchDef>} matches Array of matching keywords.
   * @return {!Promise<string>|string}
   */
  parseUrlRecursively_(url, matches) {
    const stack = [];
    let urlIndex = 0;
    let matchIndex = 0;
    let match = matches[matchIndex];
    let numOfPendingCalls = 0;
    let ignoringChars = false;

    const evaluateNextLevel = (encode) => {
      let builder = '';
      let results = [];
      const args = [];

      while (urlIndex < url.length && matchIndex <= matches.length) {
        const trimmedBuilder = builder.trim();
        if (match && urlIndex === match.start) {
          // Collect any chars that may be prefixing the macro, if we are in
          // a nested context trim the args.
          if (trimmedBuilder) {
            results.push(numOfPendingCalls ? trimStart(builder) : builder);
          }

          // If we know we are at the start of a macro, we figure out how to
          // resolve it, and move our pointer to after the token.
          let binding;
          // Find out where this macro is coming from. Could be from the passed
          // in optional bindings, or the global variable source.
          if (this.bindings_ && hasOwn(this.bindings_, match.name)) {
            // Macro is from optional bindings.
            binding = /** @type {!BindingInfoDef} */ ({
              // This construction helps us save the match name and determine
              // precedence of resolution choices in #expandBinding_ later.
              name: match.name,
              prioritized: this.bindings_[match.name],
              encode,
            });
          } else {
            // Macro is from the global source.
            binding = /** @type {!BindingInfoDef} */ ({
              ...this.variableSource_.get(match.name),
              name: match.name,
              encode,
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
            results.push(evaluateNextLevel(/* encode */ false));
          } else {
            // Many macros do not take arguments, in this case we do not need to
            // recurse, we just start resolution in it's position.
            results.push(this.evaluateBinding_(binding));
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
          !ignoringChars
        ) {
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
        }

        // Invoke a function on every right parenthesis unless the stack is
        // empty. This is where we actually evaluate any macro that takes an
        // argument. We pop the macro resover off the stack, and take anying left
        // in our string builder and add it as the final section of the final
        // arg. Then we call the resolver.
        else if (numOfPendingCalls && url[urlIndex] === ')' && !ignoringChars) {
          urlIndex++;
          numOfPendingCalls--;
          const binding = stack.pop();
          if (trimmedBuilder) {
            results.push(trimmedBuilder);
          }
          args.push(results);
          const value = this.evaluateBinding_(binding, /* opt_args */ args);
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
      if (this.sync_) {
        return results.join('');
      }

      return Promise.all(results)
        .then((promiseArray) => promiseArray.join(''))
        .catch((e) => {
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
  evaluateBinding_(bindingInfo, opt_args) {
    const {encode, name} = bindingInfo;
    let binding;
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
      const result = this.evaluateBindingSync_(binding, name, opt_args);
      return encode ? encodeURIComponent(result) : result;
    } else {
      return this.evaluateBindingAsync_(binding, name, opt_args).then(
        (result) => (encode ? encodeURIComponent(result) : result)
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
        const bindingFunc = binding;
        if (opt_args) {
          value = this.processArgsAsync_(opt_args).then((args) =>
            bindingFunc.apply(null, args)
          );
        } else {
          value = tryResolve(bindingFunc);
        }
      } else {
        value = Promise.resolve(binding);
      }
      return value
        .then((val) => {
          this.maybeCollectVars_(name, val, opt_args);

          let result;

          if (val == null) {
            result = '';
          } else {
            result = val;
          }
          return result;
        })
        .catch((e) => {
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
      argsArray.map((argArray) => {
        return Promise.all(argArray).then((resolved) => resolved.join(''));
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

      if (value && typeof value.then == 'function') {
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
   * @param {Array<!Array>|undefined} argsArray
   * @return {Array<string>|undefined}
   */
  processArgsSync_(argsArray) {
    if (!argsArray) {
      return argsArray;
    }
    return argsArray.map((argArray) => {
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
      const rawArgs = opt_args.filter((arg) => arg !== '').join(',');
      args = `(${rawArgs})`;
    }
    this.collectVars_[`${name}${args}`] = value || '';
  }
}
