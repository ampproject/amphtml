/*! https://mths.be/cssescape v1.5.1 by @mathias | MIT license */


var regex = /(\0)|^(-)$|([\x01-\x1f\x7f]|^-?[0-9])|([\x80-\uffff0-9a-zA-Z_-]+)|[^]/g;

function escaper(match, nil, dash, hexEscape, chars) {
  if (chars) {
    return chars;
  }
  if (nil) {
    return '\uFFFD';
  }
  if (hexEscape) {
    return match.slice(0, -1) + '\\' + match.slice(-1).charCodeAt(0).toString(16) + ' '
  }
  return '\\' + match;
}

/**
 * https://drafts.csswg.org/cssom/#serialize-an-identifier
 * @param {string} value
 * @return {string}
 */
export function cssEscape(value) {
  return String(value).replace(regex, escaper);
}
