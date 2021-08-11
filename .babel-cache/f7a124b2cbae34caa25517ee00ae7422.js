/*! https://mths.be/cssescape v1.5.1 by @mathias | MIT license */

/**
 * This regex consists of 4 matching capture groups and one (non-matching) fallback:
 *
 * - (\0), catch the null terminator character so it may be replaced by UTF
 *   Replacement Char
 * - ^(-)$, catch a solitary dash char, so that it may be backslash escaped.
 *   This is a separate capture group so that the legal-chars (group 4) doesn't
 *   capture it first, since that group doesn't need to escape its dash.
 * - ([\x01-\x1f\x7f]|^-?[0-9]), catch a UTF control char, or any leading
 *   number (with an optional leading dash). The control or the number (but not
 *   the leading dash) must be hex-escaped,.
 * - ([\x80-\uffff0-9a-zA-Z_-]+), catch legal-chars, with the exception of a
 *   solitary dash, which will already have matched in group 1.
 * - [^], finally, a catch-all that allows us to backslash escape the char.
 *
 * Together, this matches everything necessary for CSS.escape.
 */
var regex = /(\0)|^(-)$|([\x01-\x1f\x7f]|^-?[0-9])|([\x80-\uffff0-9a-zA-Z_-]+)|[^]/g;

function escaper(match, nil, dash, hexEscape, chars) {
  // Chars is the legal-chars (group 4) capture
  if (chars) {
    return chars;
  }

  // Nil is the null terminator (group 1) capture
  if (nil) {
    return "\uFFFD";
  }

  // Both UTF control chars, and leading numbers (with optional leading dash)
  // (group 3) must be backslash escaped with a trailing space.  Funnily, the
  // leading dash must not be escaped, but the number. :shrug:
  if (hexEscape) {
    return match.slice(0, -1) + '\\' + match.slice(-1).charCodeAt(0).toString(16) + ' ';
  }

  // Finally, the solitary dash and the catch-all chars require backslash
  // escaping.
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNzcy1lc2NhcGUuanMiXSwibmFtZXMiOlsicmVnZXgiLCJlc2NhcGVyIiwibWF0Y2giLCJuaWwiLCJkYXNoIiwiaGV4RXNjYXBlIiwiY2hhcnMiLCJzbGljZSIsImNoYXJDb2RlQXQiLCJ0b1N0cmluZyIsImNzc0VzY2FwZSIsInZhbHVlIiwiU3RyaW5nIiwicmVwbGFjZSJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlBLEtBQUssR0FBRyx3RUFBWjs7QUFFQSxTQUFTQyxPQUFULENBQWlCQyxLQUFqQixFQUF3QkMsR0FBeEIsRUFBNkJDLElBQTdCLEVBQW1DQyxTQUFuQyxFQUE4Q0MsS0FBOUMsRUFBcUQ7QUFDbkQ7QUFDQSxNQUFJQSxLQUFKLEVBQVc7QUFDVCxXQUFPQSxLQUFQO0FBQ0Q7O0FBQ0Q7QUFDQSxNQUFJSCxHQUFKLEVBQVM7QUFDUCxXQUFPLFFBQVA7QUFDRDs7QUFDRDtBQUNBO0FBQ0E7QUFDQSxNQUFJRSxTQUFKLEVBQWU7QUFDYixXQUFPSCxLQUFLLENBQUNLLEtBQU4sQ0FBWSxDQUFaLEVBQWUsQ0FBQyxDQUFoQixJQUFxQixJQUFyQixHQUE0QkwsS0FBSyxDQUFDSyxLQUFOLENBQVksQ0FBQyxDQUFiLEVBQWdCQyxVQUFoQixDQUEyQixDQUEzQixFQUE4QkMsUUFBOUIsQ0FBdUMsRUFBdkMsQ0FBNUIsR0FBeUUsR0FBaEY7QUFDRDs7QUFDRDtBQUNBO0FBQ0EsU0FBTyxPQUFPUCxLQUFkO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU1EsU0FBVCxDQUFtQkMsS0FBbkIsRUFBMEI7QUFDL0IsU0FBT0MsTUFBTSxDQUFDRCxLQUFELENBQU4sQ0FBY0UsT0FBZCxDQUFzQmIsS0FBdEIsRUFBNkJDLE9BQTdCLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qISBodHRwczovL210aHMuYmUvY3NzZXNjYXBlIHYxLjUuMSBieSBAbWF0aGlhcyB8IE1JVCBsaWNlbnNlICovXG5cblxuLyoqXG4gKiBUaGlzIHJlZ2V4IGNvbnNpc3RzIG9mIDQgbWF0Y2hpbmcgY2FwdHVyZSBncm91cHMgYW5kIG9uZSAobm9uLW1hdGNoaW5nKSBmYWxsYmFjazpcbiAqXG4gKiAtIChcXDApLCBjYXRjaCB0aGUgbnVsbCB0ZXJtaW5hdG9yIGNoYXJhY3RlciBzbyBpdCBtYXkgYmUgcmVwbGFjZWQgYnkgVVRGXG4gKiAgIFJlcGxhY2VtZW50IENoYXJcbiAqIC0gXigtKSQsIGNhdGNoIGEgc29saXRhcnkgZGFzaCBjaGFyLCBzbyB0aGF0IGl0IG1heSBiZSBiYWNrc2xhc2ggZXNjYXBlZC5cbiAqICAgVGhpcyBpcyBhIHNlcGFyYXRlIGNhcHR1cmUgZ3JvdXAgc28gdGhhdCB0aGUgbGVnYWwtY2hhcnMgKGdyb3VwIDQpIGRvZXNuJ3RcbiAqICAgY2FwdHVyZSBpdCBmaXJzdCwgc2luY2UgdGhhdCBncm91cCBkb2Vzbid0IG5lZWQgdG8gZXNjYXBlIGl0cyBkYXNoLlxuICogLSAoW1xceDAxLVxceDFmXFx4N2ZdfF4tP1swLTldKSwgY2F0Y2ggYSBVVEYgY29udHJvbCBjaGFyLCBvciBhbnkgbGVhZGluZ1xuICogICBudW1iZXIgKHdpdGggYW4gb3B0aW9uYWwgbGVhZGluZyBkYXNoKS4gVGhlIGNvbnRyb2wgb3IgdGhlIG51bWJlciAoYnV0IG5vdFxuICogICB0aGUgbGVhZGluZyBkYXNoKSBtdXN0IGJlIGhleC1lc2NhcGVkLC5cbiAqIC0gKFtcXHg4MC1cXHVmZmZmMC05YS16QS1aXy1dKyksIGNhdGNoIGxlZ2FsLWNoYXJzLCB3aXRoIHRoZSBleGNlcHRpb24gb2YgYVxuICogICBzb2xpdGFyeSBkYXNoLCB3aGljaCB3aWxsIGFscmVhZHkgaGF2ZSBtYXRjaGVkIGluIGdyb3VwIDEuXG4gKiAtIFteXSwgZmluYWxseSwgYSBjYXRjaC1hbGwgdGhhdCBhbGxvd3MgdXMgdG8gYmFja3NsYXNoIGVzY2FwZSB0aGUgY2hhci5cbiAqXG4gKiBUb2dldGhlciwgdGhpcyBtYXRjaGVzIGV2ZXJ5dGhpbmcgbmVjZXNzYXJ5IGZvciBDU1MuZXNjYXBlLlxuICovXG52YXIgcmVnZXggPSAvKFxcMCl8XigtKSR8KFtcXHgwMS1cXHgxZlxceDdmXXxeLT9bMC05XSl8KFtcXHg4MC1cXHVmZmZmMC05YS16QS1aXy1dKyl8W15dL2c7XG5cbmZ1bmN0aW9uIGVzY2FwZXIobWF0Y2gsIG5pbCwgZGFzaCwgaGV4RXNjYXBlLCBjaGFycykge1xuICAvLyBDaGFycyBpcyB0aGUgbGVnYWwtY2hhcnMgKGdyb3VwIDQpIGNhcHR1cmVcbiAgaWYgKGNoYXJzKSB7XG4gICAgcmV0dXJuIGNoYXJzO1xuICB9XG4gIC8vIE5pbCBpcyB0aGUgbnVsbCB0ZXJtaW5hdG9yIChncm91cCAxKSBjYXB0dXJlXG4gIGlmIChuaWwpIHtcbiAgICByZXR1cm4gJ1xcdUZGRkQnO1xuICB9XG4gIC8vIEJvdGggVVRGIGNvbnRyb2wgY2hhcnMsIGFuZCBsZWFkaW5nIG51bWJlcnMgKHdpdGggb3B0aW9uYWwgbGVhZGluZyBkYXNoKVxuICAvLyAoZ3JvdXAgMykgbXVzdCBiZSBiYWNrc2xhc2ggZXNjYXBlZCB3aXRoIGEgdHJhaWxpbmcgc3BhY2UuICBGdW5uaWx5LCB0aGVcbiAgLy8gbGVhZGluZyBkYXNoIG11c3Qgbm90IGJlIGVzY2FwZWQsIGJ1dCB0aGUgbnVtYmVyLiA6c2hydWc6XG4gIGlmIChoZXhFc2NhcGUpIHtcbiAgICByZXR1cm4gbWF0Y2guc2xpY2UoMCwgLTEpICsgJ1xcXFwnICsgbWF0Y2guc2xpY2UoLTEpLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpICsgJyAnXG4gIH1cbiAgLy8gRmluYWxseSwgdGhlIHNvbGl0YXJ5IGRhc2ggYW5kIHRoZSBjYXRjaC1hbGwgY2hhcnMgcmVxdWlyZSBiYWNrc2xhc2hcbiAgLy8gZXNjYXBpbmcuXG4gIHJldHVybiAnXFxcXCcgKyBtYXRjaDtcbn1cblxuLyoqXG4gKiBodHRwczovL2RyYWZ0cy5jc3N3Zy5vcmcvY3Nzb20vI3NlcmlhbGl6ZS1hbi1pZGVudGlmaWVyXG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNzc0VzY2FwZSh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKHJlZ2V4LCBlc2NhcGVyKTtcbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/third_party/css-escape/css-escape.js