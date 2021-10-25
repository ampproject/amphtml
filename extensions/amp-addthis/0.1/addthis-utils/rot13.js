import {RE_ALPHA} from '../constants';

const CHAR_Z_LOWER = 122;
const CHAR_Z_UPPER = 90;

/**
 * Rotate a string by 13 characters. Only applies to alphabetical characters.
 * For "good enough" obfuscation.
 *
 * @param {string} input
 * @return {*} TODO(#23582): Specify return type
 * @private
 */
const rot13 = (input) => {
  return input.replace(RE_ALPHA, (match) => {
    const code = match.charCodeAt(0);

    // Get the z character code based on whether the character is
    // upper/lowercase.
    const zChar = code <= CHAR_Z_UPPER ? CHAR_Z_UPPER : CHAR_Z_LOWER;

    // Add/subtract 13 to rotate the character so it doesn't exceed the alphabet
    // bounds.
    return String.fromCharCode(zChar >= code + 13 ? code + 13 : code - 13);
  });
};

/**
 * Run rot13 on an array of strings.
 * @param {!Array<string>} input
 * @return {!Object}
 */
export const rot13Array = (input) => {
  return input.reduce((rot13Map, str) => {
    rot13Map[rot13(str)] = 1;
    return rot13Map;
  }, {});
};
