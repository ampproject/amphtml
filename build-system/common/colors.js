const colors = require('kleur/colors');

/**
 * @fileoverview kleur/color provides a collection of untyped color formatting
 * functions. This file provides a generically typed wrapper for each of them in
 * order to satisfy our type checks without changing any functionality. For more
 * info, see https://github.com/lukeed/kleur/blob/master/colors.{mjs,d.ts}.
 */
module.exports = Object.entries(colors).reduce((map, [key, formatter]) => {
  map[key] =
    typeof formatter == 'function'
      ? (txt) => /** @type {function} */ (formatter)(txt)
      : formatter;
  return map;
}, /** @type {Record<keyof typeof colors, (input?: *) => string>} */ ({}));
