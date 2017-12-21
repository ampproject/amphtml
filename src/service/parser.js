/**
   * Takes array of all matching variable keyword locations and returns only those that we
   * want to evaluate. In the case of overlapping keywords it choose the longer. It also
   * excludes protected keywords.
   * @param {!Array<Object<string, *>=>} matches
   * @param {number} urlLength The length of the url containing the matches
   * @return {!Object<string, *>=}
   */
export function mergeMatches(matches, urlLength) {
  if (!matches.length) { return null; }
  // longest keywords have priority over shorter
  // how should we prioritize if same length??
  matches.sort((a, b) => b.length - a.length);
  const storage = new Array(urlLength).fill(false);
  const result = [];
  for (const match of matches) {
    // check for frozen vars in here
    if (fillStorage(match, storage)) {
      result.push(match);
    }
  }
  return result;
}


/**
   * Given a storage data structure and a match object, it will fill in a 
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



export function parseUrlRecursively(url, matches, variableSource, opt_bindings, opt_collectVars) {
  const stack = [];
  let urlIndex = 0;
  let matchIndex = 0;

  while (urlIndex < url.length && matchIndex < matches.length) {
    const match = matches[matchIndex];
    const name = match.name;
    let binding;
    // find out where this keyword is coming from
    if (opt_bindings && opt_bindings.hasOwnProperty(name)) {
      // the optional bindings
      binding = opt_bindings[name];
    } else {
      // or the global source
      binding = variableSource.get(name)
    }

    if (typeof binding === 'function') {
      stack.push(binding)
    } else {
      
    }

  }


  const evaluate = url => {
    let builder = '';
    const results = [];

    // while (index < url.length) {
    //   if (url[index] === '(') {
    //     stack.push(builder.trim());
    //     builder = '';
    //     results.push(evaluate(url, ++index, stack));
    //   }

  //     else if (url[index] === ',') {
  //       if (builder.length) {
  //         results.push(builder.trim());
  //       }
  //       builder = '';
  //       index++;
  //     }

  //     else if (url[index] === ')') {
  //       const lookupName = stack.pop();
  //       const args = [...results, builder.trim()];
  //       index++;

  //       if (map.hasOwnProperty(lookupName)) {

  //         if (typeof map[lookupName] === 'function') {
  //           return map[lookupName].apply(null, args);
  //         }

  //         return map[lookupName];
  //       }

  //       return '';
  //     }

  //     else {
  //       builder += url[index];
  //       index++;
  //     }

  //   return results.join('');
  // };

  // return evaluate(url);
  // }
  };
}
