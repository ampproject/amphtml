import {user, rethrowAsync} from '../log';

/**
   * Takes array of all matching variable keyword locations and returns only those that we
   * want to evaluate. In the case of overlapping keywords it choose the longer. It also
   * excludes protected keywords.
   * @param {!Array<Object<string, *>=>} matches
   * @param {number} urlLength The length of the url containing the matches
   * @return {!Object<string, *>=}
   */
export function mergeMatches(matches, url, opt_whiteList) {
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
    if (fillStorage(match, storage)) {
      // if this match does not overlap with a longer match
      results.push(match);
    }
    return results;
  }, []).sort((a, b) => a.start - b.start);
}


export function findMatches(url, expression) {
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
   * @param {!Object<string, *>=} match contains match data
   * @return {boolean} indicates whether a collision was found
   */
function fillStorage(match, storage) {
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

function evaluateBinding(binding, opt_sync, opt_args,) {
  // we can evaluate now and move on
  if (opt_sync) {
    binding = binding.sync;
    if (!binding) {
      user().error('UrlReplacements', 'ignoring async replacement key: ', name);
      return '';
    }
  } else {
    binding = binding.async || binding.sync;
  }

  let value;
  try {
    value = typeof binding === 'function' ?
      binding.apply(null, opt_args) : binding;
  } catch (e) {
    // Report error, but do not disrupt URL replacement. This will
    // interpolate as the empty string.
    if (opt_sync) {
      value = '';
    }
    rethrowAsync(e);
  }

  // In case the produced value is a promise but we are not expecting it
  if (value && value.then && opt_sync) {
    user().error('UrlReplacements', 'ignoring promise value for key: ', name);
    return '';
  }

  // value here may be a promise or primitive
  return Promise.resolve(value);
}


/**
 * @param {string} url
 * @param {!Array<Object<string, *>=>} matches
 * @param {} variableSource
 * @param {!Object<string, *>=} opt_bindings
 * @param {!Object<string, *>=} opt_collectVars
 * @param {boolean=} opt_sync
 * @param {!Object<string, boolean>=} opt_whiteList Optional white list of names
 *     that can be substituted.
 * @return {!Promise<string>|string}
 * @private
 */
export function parseUrlRecursively(
  url,
  matches,
  variableSource,
  opt_sync,
  opt_bindings,
  opt_collectVars, // this is not added yet...
) {
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
          binding = variableSource.get(match.name);
        }
        
        urlIndex = match.stop + 1;

        if (url[urlIndex] === '(') {
          // if we hit a left parenthesis we still need to get args
          urlIndex++;
          stack.push(binding);
          results.push(builder, evaluateNextLevel());
        } else {
          results.push(builder, evaluateBinding(binding, opt_sync));
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
        const value = evaluateBinding(binding, opt_sync, args);
        return value;
      }

      else {
        builder += url[urlIndex];
        urlIndex++;
      }
    }

    return opt_sync ? results.join('') :
      Promise.all(results).then(promiseArray => promiseArray.join(''));
  };

  return evaluateNextLevel();
}