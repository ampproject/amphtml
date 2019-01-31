// http://kevin.vanzonneveld.net
// +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
// +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
// +   improved by: sowberry
// +    tweaked by: Jack
// +   bugfixed by: Onno Marsman
// +   improved by: Yves Sucaet
// +   bugfixed by: Onno Marsman
// +   bugfixed by: Ulrich
// +   bugfixed by: Rafal Kukawski
// +   improved by: kirilloid
// *     example 1: utf8_encode('Kevin van Zonneveld')
// *     returns 1: 'Kevin van Zonneveld'

/**
 * Encode the given string
 * @private
 * @param {string} argString the string to encode
 * @return {string}
 */
export function utf8Encode(argString) {
  let c1, enc, n;
  if (argString == null) {
    return '';
  }
  const string = String(argString);
  let utftext = '';
  let start = 0;
  let end = 0;
  const stringl = string.length;
  n = 0;
  while (n < stringl) {
    c1 = string.charCodeAt(n);
    enc = null;
    if (c1 < 128) {
      end++;
    } else if (c1 > 127 && c1 < 2048) {
      enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
    } else {
      enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128,
          (c1 & 63) | 128);
    }
    if (enc !== null) {
      if (end > start) {
        utftext += string.slice(start, end);
      }
      utftext += enc;
      start = end = n + 1;
    }
    n++;
  }
  if (end > start) {
    utftext += string.slice(start, stringl);
  }
  return utftext;
}
