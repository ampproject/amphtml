import {rethrowAsync} from '../../log';

/** Simple parser class to handle nested Url replacement. */
export class Parser {

  /**
   * Link this instance of parser to the calling UrlReplacment
   * @param {VariablSource} variableSource the keywords to replace
   */
  constructor(variableSource) {
    this.variableSource_ = variableSource;
  }

  /**
   * Takes array of all matching variable keyword locations and returns only those that we
   * want to evaluate. In the case of overlapping keywords it choose the longer. It also
   * excludes protected keywords.
   * @param {!Array<Object<string, string|number>>} matches array of objects representing
   *  matching keywords
   * @param {string} url The url to be expanded.
   * @return {!Object<string, string|number>}
   */
  eliminateOverlaps(matches, url, opt_whiteList) {
    if (!matches.length) { return null; }
    // longest keywords have priority over shorter
    // how should we prioritize if same length??
    matches.sort((a, b) => b.length - a.length);
    const storage = new Array(url.length).fill(false);

    return matches.reduce((results, match) => {
      if (opt_whiteList && !opt_whiteList[name]) {
        // Do not perform substitution and just return back the original
        // match, so that the string doesn't change.
        return results;
      }
      if (this.fillStorage(match, storage)) {
        // if this match does not overlap with a longer match
        results.push(match);
      }
      return results;
    }, []).sort((a, b) => a.start - b.start);
  }

  /**
   * Structures the regex matching into the desired format
   * @param {string} url url to be substituted
   * @param {RegExp} expression regex containing all keywords
   * @return {!Object<string, string|number>} array of objects representing
   *  matching keywords
   */
  findMatches(url, expression) {
    const matches = [];
    url.replace(expression, (match, name, opt_strargs, startPosition) => {
      // refactor expression logic in future once legacy code is deprecated.
      const leftParenIndex = match.indexOf('(');
      const length = leftParenIndex > 0 ? leftParenIndex : match.length;
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
   * Given a storage data structure and a match object, it will keep track of indexes
   * that are already being tracked.
   * @param {!Object<string, *>} match contains match data
   * @return {boolean} indicates whether a collision was found
   */
  fillStorage(match, storage) {
    for (let i = match.start; i <= match.stop; i++) {
      if (storage[i]) {
        // toggle off what we thought was to be filled
        for (let j = match.start; j < i; j++) {
          storage[j] = false;
        }
        return false;
      }
      storage[i] = true;
    }
    return true;
  }

  /**
   * resolves binding to value to be substituted
   * @param {!Object<string, *>} binding container for sync/async resolutions
   * @param {?Array=} opt_args arguments to be passed if binding is function
   * @return {!Promise<string>} resolved value
   */
  evaluateBinding(binding, opt_args) {
    binding = binding.async || binding.sync;
    let value;
    try {
      value = typeof binding === 'function' ?
        binding.apply(null, opt_args) : binding;
    } catch (e) {
      // Report error, but do not disrupt URL replacement. This will
      // interpolate as the empty string.
      rethrowAsync(e);
      value = '';
    }
    // value here may be a promise or primitive
    return Promise.resolve(value);
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
    const expr = this.variableSource_.getExpr(opt_bindings);
    const matches = this.findMatches(url, expr);
    const mergedPositions = this.eliminateOverlaps(matches, url, opt_whiteList);
    return this.parseUrlRecursively_(url, mergedPositions, opt_bindings);
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

    const evaluateNextLevel = () => {
      let builder = '';
      const results = [];

      while (urlIndex < url.length && matchIndex < matches.length) {

        if (urlIndex === match.start) {
          let binding;
          // find out where this keyword is coming from
          if (opt_bindings && opt_bindings.hasOwnProperty(match.name)) {
            // the optional bindings
            binding = opt_bindings[match.name];
          } else {
            // or the global source
            binding = this.variableSource_.get(match.name);
          }

          urlIndex = match.stop + 1;

          if (url[urlIndex] === '(') {
            // if we hit a left parenthesis we still need to get args
            urlIndex++;
            stack.push(binding);
            results.push(builder, evaluateNextLevel());
          } else {
            results.push(builder, this.evaluateBinding(binding));
          }

          builder = '';
          match = matches[++matchIndex];
        }

        else if (url[urlIndex] === ',') {
          if (builder.length) {
            results.push(builder.trim());
          }
          builder = '';
          urlIndex++;

        }

        else if (url[urlIndex] === ')') {
          urlIndex++;
          const binding = stack.pop();
          const args = [...results, builder.trim()];
          const value = this.evaluateBinding(binding, args);
          return value;
        }

        else {
          builder += url[urlIndex];
          urlIndex++;
        }
      }
      return Promise.all(results).then(promiseArray => promiseArray.join(''));
    };

    return evaluateNextLevel();
  }
}
