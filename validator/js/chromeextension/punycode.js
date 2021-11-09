/**
 * @license
 *
 * Copyright Mathias Bynens <http://mathiasbynens.be/>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

 const floor = Math.floor;
 
 // Bootstring parameters
 const BASE = 36;
 const T_MIN = 1;
 const T_MAX = 26;
 const SKEW = 38;
 const DAMP = 700;
 const INITIAL_BIAS = 72;
 const INITIAL_N = 128; // 0x80
 const DELIMITER = '-'; // '\x2D'
 // Convenience shortcuts
 const BASE_MINUS_TMIN = BASE - T_MIN;
 
 // Highest positive signed 32-bit float value aka 0x7FFFFFFF or 2^31-1.
 const MAX_INT = 2147483647;
 
 /**
  * @enum {RegExp}
  */
 const Regex = {
   PUNYCODE: /^xn--/,
   NON_ASCII: /[^\0-\x7E]/, // non-ASCII chars
   SEPARATORS: /[\x2E\u3002\uFF0E\uFF61]/g  // RFC 3490 separators
 };
 
 /**
  * @enum {string}
  */
 const Errors = {
   OVERFLOW: 'Overflow: input needs wider integers to process',
   NOT_BASIC: 'Illegal input >= 0x80 (not a basic code point)',
   INVALID_INPUT: 'Invalid input'
 };
 
 /**
  * A generic error utility function.
  *
  * @param {string} type The error type.
  * @throws {!Error} Throws a `RangeError` with the applicable error message.
  */
 function error(type) {
   throw RangeError(Errors[type]);
 }
 
 /**
  * Wrapper to work with domain name strings or email addresses.
  *
  * @param {string} domain The domain name or email address.
  * @param {!Function} callback The function that gets called for every
  *   character.
  * @return {string} A new string of characters returned by the callback
  *   function.
  * @private
  */
 function mapDomain(domain, callback) {
   const parts = domain.split('@');
   let result = '';
   if (parts.length > 1) {
     // In email addresses, only the domain name should be punycoded. Leave
     // the local part (i.e. everything up to `@`) intact.
     result = parts[0] + '@';
     domain = parts[1];
   }
   // Avoid `split(regex)` for IE8 compatibility. See #17.
   domain = domain.replace(Regex.SEPARATORS, '\x2E');
   const labels = domain.split('.');
   const encoded = labels.map(callback).join('.');
   return result + encoded;
 }
 
 /**
  * Creates an array containing the numeric code points of each Unicode
  * character in the string. While JavaScript uses UCS-2 internally,
  * this function will convert a pair of surrogate halves (each of which
  * UCS-2 exposes as separate characters) into a single code point,
  * matching UTF-16.
  *
  * @see <http://mathiasbynens.be/notes/javascript-encoding>
  * @param {string} string The Unicode input string (UCS-2).
  * @return {!Array<number>} The new array of code points.
  */
 function ucs2decode(string) {
   const output = [];
   let counter = 0;
   const length = string.length;
   while (counter < length) {
     const value = string.charCodeAt(counter++);
     if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
       // It's a high surrogate, and there is a next character.
       const extra = string.charCodeAt(counter++);
       if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
         output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
       } else {
         // It's an unmatched surrogate; only append this code unit, in case the
         // next code unit is the high surrogate of a surrogate pair.
         output.push(value);
         counter--;
       }
     } else {
       output.push(value);
     }
   }
   return output;
 }
 
 /**
  * Creates a string based on an array of numeric code points.
  *
  * @param {!Array<number>} codePoints The array of numeric code points.
  * @return {string} The new Unicode string (UCS-2).
  */
 function ucs2encode(codePoints) {
   return String.fromCodePoint.apply(null, codePoints);
 }
 
 
 /**
  * Converts a basic code point into a digit/integer.
  *
  * @see `digitToBasic()`
  * @param {number} codePoint The basic numeric code point value.
  * @return {number} The numeric value of a basic code point (for use in
  *   representing integers) in the range `0` to `base - 1`, or `base` if
  *   the code point does not represent a value.
  */
 function basicToDigit(codePoint) {
   if (codePoint - 0x30 < 0x0A) {
     return codePoint - 0x16;
   }
   if (codePoint - 0x41 < 0x1A) {
     return codePoint - 0x41;
   }
   if (codePoint - 0x61 < 0x1A) {
     return codePoint - 0x61;
   }
   return BASE;
 }
 
 /**
  * Converts a digit/integer into a basic code point.
  *
  * @see `basicToDigit()`
  * @param {number} digit The numeric value of a basic code point.
  * @param {number} flag If `flag` is non-zero, the uppercase form is
  *   used; else, the lowercase form is used.
  * @return {number} The basic code point whose value (when used for
  *   representing integers) is `digit`, which needs to be in the range
  *   `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
  *   used; else, the lowercase form is used. The behavior is undefined
  *   if `flag` is non-zero and `digit` has no uppercase form.
  *
  */
 function digitToBasic(digit, flag) {
   //  0..25 map to ASCII a..z or A..Z
   // 26..35 map to ASCII 0..9
   return digit + 22 + 75 * (digit < 26 ? 1 : 0) - ((flag != 0 ? 1 : 0) << 5);
 }
 
 /**
  * Bias adaptation function as per section 3.4 of RFC 3492.
  * http://tools.ietf.org/html/rfc3492#section-3.4
  *
  * @param {number} delta
  * @param {number} numPoints
  * @param {boolean} firstTime
  * @return {number} Computed value
  * @private
  */
 function adapt(delta, numPoints, firstTime) {
   let k = 0;
   delta = firstTime ? floor(delta / DAMP) : delta >> 1;
   delta += floor(delta / numPoints);
   for (/* no initialization */; delta > BASE_MINUS_TMIN * T_MAX >> 1;
        k += BASE) {
     delta = floor(delta / BASE_MINUS_TMIN);
   }
   return floor(k + (BASE_MINUS_TMIN + 1) * delta / (delta + SKEW));
 }
 
 /**
  * Converts a punycode string of ASCII-only symbols to a string of Unicode
  * symbols.
  *
  * @param {string} input The punycode string of ASCII-only symbols.
  * @return {string} The resulting string of Unicode symbols.
  */
 function decode(input) {
   // Don't use UCS-2.
   const output = [];
   const inputLength = input.length;
   let i = 0;
   let n = INITIAL_N;
   let bias = INITIAL_BIAS;
 
   // Handle the basic code points: let `basic` be the number of input code
   // points before the last delimiter, or `0` if there is none, then copy
   // the first basic code points to the output.
 
   let basic = input.lastIndexOf(DELIMITER);
   if (basic < 0) {
     basic = 0;
   }
 
   for (let j = 0; j < basic; ++j) {
     // if it's not a basic code point
     if (input.charCodeAt(j) >= 0x80) {
       error(Errors.NOT_BASIC);
     }
     output.push(input.charCodeAt(j));
   }
 
   // Main decoding loop: start just after the last delimiter if any basic code
   // points were copied; start at the beginning otherwise.
 
   for (let index = basic > 0 ? basic + 1 : 0; index < inputLength;
        /* no final expression */) {
     // `index` is the index of the next character to be consumed.
     // Decode a generalized variable-length integer into `delta`,
     // which gets added to `i`. The overflow checking is easier
     // if we increase `i` as we go, then subtract off its starting
     // value at the end to obtain `delta`.
     let oldi = i;
     for (let w = 1, k = BASE; /* no condition */; k += BASE) {
 
       if (index >= inputLength) {
         error(Errors.INVALID_INPUT);
       }
 
       const digit = basicToDigit(input.charCodeAt(index++));
 
       if (digit >= BASE || digit > floor((MAX_INT - i) / w)) {
         error(Errors.OVERFLOW);
       }
 
       i += digit * w;
       const t = k <= bias ? T_MIN : (k >= bias + T_MAX ? T_MAX : k - bias);
 
       if (digit < t) {
         break;
       }
 
       const baseMinusT = BASE - t;
       if (w > floor(MAX_INT / baseMinusT)) {
         error(Errors.OVERFLOW);
       }
 
       w *= baseMinusT;
 
     }
 
     const out = output.length + 1;
     bias = adapt(i - oldi, out, oldi == 0);
 
     // `i` was supposed to wrap around from `out` to `0`,
     // incrementing `n` each time, so we'll fix that now:
     if (floor(i / out) > MAX_INT - n) {
       error(Errors.OVERFLOW);
     }
 
     n += floor(i / out);
     i %= out;
 
     // Insert `n` at position `i` of the output.
     output.splice(i++, 0, n);
   }
 
   return String.fromCodePoint.apply(null, output);
 }
 
 /**
  * Converts a string of Unicode symbols to a punycode string of ASCII-only
  * symbols.
  * @param {string} input The string of Unicode symbols.
  * @return {string} The resulting punycode string of ASCII-only symbols.
  */
 function encode(input) {
   const output = [];
 
   // Convert the input in UCS-2 to an array of Unicode code points.
   const codePoints = exports.ucs2decode(input);
 
   // Cache the length.
   let codePointsLength = codePoints.length;
 
   // Initialize the state.
   let n = INITIAL_N;
   let delta = 0;
   let bias = INITIAL_BIAS;
 
   // Handle the basic code points.
   for (const currentValue of codePoints) {
     if (currentValue < 0x80) {
       output.push(String.fromCharCode(currentValue));
     }
   }
 
   let basicLength = output.length;
   let handledCPCount = basicLength;
 
   // `handledCPCount` is the number of code points that have been handled;
   // `basicLength` is the number of basic code points.
 
   // Finish the basic string with a delimiter unless it's empty.
   if (basicLength) {
     output.push(DELIMITER);
   }
 
   // Main encoding loop:
   while (handledCPCount < codePointsLength) {
 
     // All non-basic code points < n have been handled already. Find the next
     // larger one:
     let m = MAX_INT;
     for (const currentValue of codePoints) {
       if (currentValue >= n && currentValue < m) {
         m = currentValue;
       }
     }
 
     // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
     // but guard against overflow.
     const handledCPCountPlusOne = handledCPCount + 1;
     if (m - n > floor((MAX_INT - delta) / handledCPCountPlusOne)) {
       error(Errors.OVERFLOW);
     }
 
     delta += (m - n) * handledCPCountPlusOne;
     n = m;
 
     for (const currentValue of codePoints) {
       if (currentValue < n && ++delta > MAX_INT) {
         error(Errors.OVERFLOW);
       }
       if (currentValue == n) {
         // Represent delta as a generalized variable-length integer.
         let q = delta;
         for (let k = BASE; /* no condition */; k += BASE) {
           const t = k <= bias ? T_MIN : (k >= bias + T_MAX ? T_MAX : k - bias);
           if (q < t) {
             break;
           }
           const qMinusT = q - t;
           const baseMinusT = BASE - t;
           output.push(
             String.fromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
           );
           q = floor(qMinusT / baseMinusT);
         }
 
         output.push(String.fromCharCode(digitToBasic(q, 0)));
         bias =
             adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
         delta = 0;
         ++handledCPCount;
       }
     }
 
     ++delta;
     ++n;
 
   }
   return output.join('');
 }
 
 /**
  * Converts a Punycode string representing a domain name or an email address
  * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
  * it doesn't matter if you call it on a string that has already been
  * converted to Unicode.
  *
  * @param {string} input The Punycoded domain name or email address to
  *   convert to Unicode.
  * @return {string} The Unicode representation of the given punycode
  *   string.
  */
 function toUnicode(input) {
   return mapDomain(
       input,
       (mappedInput) =>
           Regex.PUNYCODE.test(mappedInput) && mappedInput.length > 4 ?
           exports.decode(mappedInput.slice(4).toLowerCase()) :
           mappedInput);
 }
 
 /**
  * Converts a Unicode string representing a domain name or an email address to
  * Punycode. Only the non-ASCII parts of the domain name will be converted,
  * i.e. it doesn't matter if you call it with a domain that's already in
  * ASCII.
  *
  * @param {string} input The domain name or email address to convert, as a
  *   Unicode string.
  * @returns {string} The Punycode representation of the given domain name or
  *   email address.
  */
 function toAscii(input) {
   return mapDomain(input, function(mappedInput) {
     return Regex.NON_ASCII.test(mappedInput)
       ? 'xn--' + exports.encode(mappedInput)
       : mappedInput;
   });
 }
 