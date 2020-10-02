/**
 * @license DEDUPE_ON_MINIFY
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.module('parse_srcset');
const Set = goog.require('goog.structs.Set');
const {ValidationError} = goog.require('amp.validator.protogenerated');

/**
 * A single source within a srcset.
 * @typedef {{
 *   url: string,
 *   widthOrPixelDensity: string
 * }}
 */
const SrcsetSourceDef = function() {};
exports.SrcsetSourceDef = SrcsetSourceDef;

/**
 * Return value for parseSrcset.
 * @constructor @struct
 */
const SrcsetParsingResult = function() {
  /** @type {boolean} */
  this.success = false;
  /** @type {!ValidationError.Code} */
  this.errorCode = ValidationError.Code.UNKNOWN_CODE;
  /** @type {!Array<!SrcsetSourceDef>} */
  this.srcsetImages = [];
};
exports.SrcsetParsingResult = SrcsetParsingResult;

/**
 * Parses the text representation of srcset into array of SrcsetSourceDef.
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes.
 * See
 * http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-srcset.
 *
 * If parsing fails, returns false in SrcsetParsingResult.status.
 *
 * @param {string} srcset
 * @return {!SrcsetParsingResult}
 */
const parseSrcset = function(srcset) {
  // Regex for leading spaces, followed by an optional comma and whitespace,
  // followed by an URL*, followed by an optional space, followed by an
  // optional width or pixel density**, followed by spaces, followed by an
  // optional comma and whitespace.
  //
  // URL*: matches non-space, non-empty string which neither ends nor begins
  // with a comma. The set of space characters in the srcset attribute is
  // defined to include only ascii characters, so using \s, which is an
  // ascii only character set, is fine. See
  // https://html.spec.whatwg.org/multipage/infrastructure.html#space-character.
  //
  // Optional width or pixel density**: Matches the empty string or (one or
  // more spaces + a non empty string containing no space or commas).
  // Doesn't capture the initial space.
  //
  // \s*                       Match, but don't capture leading spaces.
  // (?:,\s*)?                 Optionally match comma and trailing space,
  //                           but don't capture comma.
  // ([^,\s]\S*[^,\s])         Match something like "google.com/favicon.ico"
  //                           but not ",google.com/favicon.ico,".
  // \s*                       Match, but dont capture spaces.
  // (                         Match the width or density descriptor...
  //   [1-9]\d*[wx]            which is a non-zero integer followed by a w
  //                           or an x ...
  //   |                       or ...
  //   [1-9]\d*\.\d+x          a decimal with its whole-number part greater
  //                           than zero and followed by an x ...
  //   |                       or ...
  //   0.\d*[1-9]\d*x          a decimal with its fractional part greater
  //                           than zero and followed by an x ...
  // )?                        and make it optional.
  // \s*                       Match, but don't capture space.
  // (?:(,)\s*)?               Optionally match comma and trailing space,
  //                           capturing comma.
  const imageCandidateRegex = new RegExp(
      '\\s*' +
          '(?:,\\s*)?' +
          '([^,\\s]\\S*[^,\\s])' +
          '\\s*' +
          '(' +
              '[1-9]\\d*[wx]' +
              '|' +
              '[1-9]\\d*\\.\\d+x' +
              '|' +
              '0.\\d*[1-9]\\d*' +
          ')?' +
          '\\s*' +
          '(?:(,)\\s*)?',
      'g');
  let remainingSrcset = srcset;
  /** @type {!Set<string>} */
  const seenWidthOrPixelDensity = new Set();
  /** @type {!SrcsetParsingResult} */
  const result = new SrcsetParsingResult();
  const {srcsetImages} = result;
  let source;
  while (source = imageCandidateRegex.exec(srcset)) {
    const url = source[1];
    let widthOrPixelDensity = source[2];
    const comma = source[3];
    if (widthOrPixelDensity === undefined) {
      widthOrPixelDensity = '1x';
    }
    // Duplicate width or pixel density in srcset.
    if (seenWidthOrPixelDensity.contains(widthOrPixelDensity)) {
      result.errorCode = ValidationError.Code.DUPLICATE_DIMENSION;
      return result;
    }
    seenWidthOrPixelDensity.add(widthOrPixelDensity);
    srcsetImages.push({url, widthOrPixelDensity});
    remainingSrcset = srcset.substr(imageCandidateRegex.lastIndex);
    // If no more srcset, break.
    if (srcset.length <= imageCandidateRegex.lastIndex) {
      break;
    }
    // More srcset, comma expected as separator for image candidates.
    if (comma === undefined) {
      result.errorCode = ValidationError.Code.INVALID_ATTR_VALUE;
      return result;
    }
  }
  // Regex didn't consume all of the srcset string
  if (remainingSrcset !== '') {
    result.errorCode = ValidationError.Code.INVALID_ATTR_VALUE;
    return result;
  }
  // Must have at least one image candidate.
  if (srcsetImages.length === 0) {
    result.errorCode = ValidationError.Code.INVALID_ATTR_VALUE;
    return result;
  }
  result.success = true;
  return result;
};
exports.parseSrcset = parseSrcset;
