const lodashDebounce = require('lodash.debounce');

/**
 * Creates a debounced function that delays invoking func until after wait
 * milliseconds have elapsed since the last time the debounced function was invoked.
 *
 * Notably, invokes the function both the leading and trailing edges of the event.
 *
 * @param {function(...S):T} func
 * @param {number} wait
 * @return {function(...S):T}
 * @template S
 * @template T
 */
function debounce(func, wait) {
  return lodashDebounce(func, wait, {leading: true, trailing: true});
}

module.exports = debounce;
