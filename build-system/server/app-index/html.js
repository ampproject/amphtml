const identity = (a) => a;

/**
 * Takes a set of HTML fragments and concatenates them.
 * @param {!Array<T>} fragments
 * @param {function(T):string} renderer
 * @return {string}
 * @template T
 */
const joinFragments = (fragments, renderer = identity) =>
  fragments.map(renderer).join('');

/**
 * pass-through for syntax highlighting
 * @param {!Array<string>|TemplateStringsArray} strings
 * @param {...*} values
 * @return {string}
 */
const html = (strings, ...values) =>
  joinFragments(Array.from(strings), (string, i) => string + (values[i] || ''));

module.exports = {html, joinFragments};
