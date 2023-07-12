/**
 * @param {string} _match
 * @param {string} character
 * @return {string}
 */
function toUpperCase(_match, character) {
  return character.toUpperCase();
}

/**
 * @param {string} match
 * @return {string}
 */
function prependDashAndToLowerCase(match) {
  return '-' + match.toLowerCase();
}

/**
 * @param {string} name Attribute name containing dashes.
 * @return {string} Dashes removed and successive character sent to upper case.
 * visibleForTesting
 */
export function dashToCamelCase(name) {
  return name.replace(/-([a-z])/g, toUpperCase);
}

/**
 * Converts a string that is in camelCase to one that is in dash-case.
 *
 * @param {string} string The string to convert.
 * @return {string} The string in dash-case.
 */
export function camelCaseToDash(string) {
  return string.replace(/(?!^)[A-Z]/g, prependDashAndToLowerCase);
}

/**
 * @param {string} name Attribute name with dashes
 * @return {string} Dashes replaced by underlines.
 */
export function dashToUnderline(name) {
  return name.replace('-', '_');
}

/**
 * Polyfill for String.prototype.endsWith.
 * @param {string} string
 * @param {string} suffix
 * @return {boolean}
 */
export function endsWith(string, suffix) {
  const index = string.length - suffix.length;
  return index >= 0 && string.indexOf(suffix, index) == index;
}

/**
 * Polyfill for String.prototype.includes.
 * @param {string} string
 * @param {string} substring
 * @param {number=} start
 * @return {boolean}
 */
export function includes(string, substring, start) {
  if (typeof start !== 'number') {
    start = 0;
  }
  if (start + substring.length > string.length) {
    return false;
  }
  return string.indexOf(substring, start) !== -1;
}

/**
 * Expands placeholders in a given template string with values.
 *
 * Placeholders use ${key-name} syntax and are replaced with the value
 * returned from the given getter function.
 *
 * @param {string} template The template string to expand.
 * @param {function(string):*} getter Function used to retrieve a value for a
 *   placeholder. Returns values will be coerced into strings.
 * @param {number=} opt_maxIterations Number of times to expand the template.
 *   Defaults to 1, but should be set to a larger value your placeholder tokens
 *   can be expanded to other placeholder tokens. Take caution with large values
 *   as recursively expanding a string can be exponentially expensive.
 * @return {string}
 */
export function expandTemplate(template, getter, opt_maxIterations) {
  const maxIterations = opt_maxIterations || 1;
  for (let i = 0; i < maxIterations; i++) {
    let matches = 0;
    template = template.replace(/\${([^{}]*)}/g, (_a, b) => {
      matches++;
      return getter(b);
    });
    if (!matches) {
      break;
    }
  }
  return template;
}

/**
 * Hash function djb2a
 * This is intended to be a simple, fast hashing function using minimal code.
 * It does *not* have good cryptographic properties.
 * @param {string} str
 * @return {string} 32-bit unsigned hash of the string
 */
export function stringHash32(str) {
  const {length} = str;
  let hash = 5381;
  for (let i = 0; i < length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // Convert from 32-bit signed to unsigned.
  return String(hash >>> 0);
}

/**
 * Trims a string on the end, removing whitespace characters.
 * @param {string} str  A string to trim.
 * @return {string} The string, with trailing whitespace removed.
 */
export function trimEnd(str) {
  // TODO(sparhami) Does this get inlined for an ES2019 build?
  if (str.trimEnd) {
    return str.trimEnd();
  }

  return ('_' + str).trim().slice(1);
}

/**
 * Trims any leading whitespace from a string.
 * @param {string} str  A string to trim.
 * @return {string} The string, with leading whitespace removed.
 */
export function trimStart(str) {
  if (str.trimStart) {
    return str.trimStart();
  }

  return (str + '_').trim().slice(0, -1);
}

/**
 * Wrapper around String.replace that handles asynchronous resolution.
 * @param {string} str
 * @param {RegExp} regex
 * @param {Function|string} replacer
 * @return {Promise<string>}
 */
export function asyncStringReplace(str, regex, replacer) {
  if (isString(replacer)) {
    return Promise.resolve(str.replace(regex, replacer));
  }
  const stringBuilder = [];
  let lastIndex = 0;

  str.replace(regex, function (match) {
    // String.prototype.replace will pass 3 to n number of arguments to the
    // callback function based on how many capture groups the regex may or may
    // not contain. We know that the match will always be first, and the
    // index will always be second to last.
    const matchIndex = arguments[arguments.length - 2];
    stringBuilder.push(str.slice(lastIndex, matchIndex));
    lastIndex = matchIndex + match.length;

    // Store the promise in it's eventual string position.
    const replacementPromise = replacer.apply(null, arguments);
    stringBuilder.push(replacementPromise);
    return ''; // returned for tsc
  });
  stringBuilder.push(str.slice(lastIndex));

  return Promise.all(stringBuilder).then((resolved) => resolved.join(''));
}

/**
 * Pads the beginning of a string with a substring to a target length.
 * @param {string} s
 * @param {number} targetLength
 * @param {string} padString
 * @return {string}
 */
export function padStart(s, targetLength, padString) {
  if (s.length >= targetLength) {
    return s;
  }
  targetLength = targetLength - s.length;
  let padding = padString;
  while (targetLength > padding.length) {
    padding += padString;
  }
  return padding.slice(0, targetLength) + s;
}

/**
 * Tests if a value is a string.
 * @param {?} s
 * @return {s is string}
 */
export function isString(s) {
  return typeof s == 'string';
}
