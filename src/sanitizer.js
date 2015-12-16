/**
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

import {htmlSanitizer} from '../third_party/caja/html-sanitizer';


/**
 * @const {!Object<string, boolean>}
 * See https://github.com/ampproject/amphtml/blob/master/spec/amp-html-format.md
 */
const BLACKLISTED_TAGS = {
  'applet': true,
  'audio': true,
  'base': true,
  'embed': true,
  'form': true,
  'frame': true,
  'frameset': true,
  'iframe': true,
  'img': true,
  'input': true,
  'link': true,
  'meta': true,
  'object': true,
  'script': true,
  'style': true,
  // TODO(dvoytenko, #1156): SVG is blacklisted temporarily. There's no
  // intention to keep this block for any longer than we have to.
  'svg': true,
  'template': true,
  'textarea': true,
  'video': true,
};


/** @const {!Object<string, boolean>} */
const SELF_CLOSING_TAGS = {
  'br': true,
  'col': true,
  'hr': true,
  'img': true,
  'source': true,
  'track': true,
  'wbr': true,
};


/** @const {!Array<string>} */
const WHITELISTED_FORMAT_TAGS = [
  'b',
  'br',
  'code',
  'del',
  'em',
  'i',
  'ins',
  'mark',
  'q',
  's',
  'small',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
];


/** @const {!Array<string>} */
const WHITELISTED_ATTRS = [
  'fallback',
  'href',
  'on',
  'placeholder',
];


/** @const {!Array<string>} */
const BLACKLISTED_ATTR_VALUES = [
  /*eslint no-script-url: 0*/ 'javascript:',
  /*eslint no-script-url: 0*/ 'vbscript:',
  /*eslint no-script-url: 0*/ 'data:',
  /*eslint no-script-url: 0*/ '<script',
  /*eslint no-script-url: 0*/ '</script',
];


/**
 * Sanitizes the provided HTML.
 *
 * This function expects the HTML to be already pre-sanitized and thus it does
 * not validate all of the AMP rules - only the most dangerous security-related
 * cases, such as <SCRIPT>, <STYLE>, <IFRAME>.
 *
 * @param {string} html
 * @return {string}
 */
export function sanitizeHtml(html) {
  const tagPolicy = htmlSanitizer.makeTagPolicy();
  const output = [];
  let ignore = 0;

  function emit(content) {
    if (ignore == 0) {
      output.push(content);
    }
  }

  const parser = htmlSanitizer.makeSaxParser({
    'startTag': function(tagName, attribs) {
      if (ignore > 0) {
        if (!SELF_CLOSING_TAGS[tagName]) {
          ignore++;
        }
        return;
      }
      if (BLACKLISTED_TAGS[tagName]) {
        ignore++;
      } else if (tagName.indexOf('amp-') != 0) {
        // Ask Caja to validate the element as well.
        // Use the resulting properties.
        const savedAttribs = attribs.slice(0);
        const scrubbed = tagPolicy(tagName, attribs);
        if (!scrubbed) {
          ignore++;
        } else {
          attribs = scrubbed.attribs;
          // Restore some of the attributes that AMP is directly responsible
          // for, such as "on".
          for (let i = 0; i < attribs.length; i += 2) {
            if (WHITELISTED_ATTRS.indexOf(attribs[i]) != -1) {
              attribs[i + 1] = savedAttribs[i + 1];
            }
          }
        }
      }
      if (ignore > 0) {
        if (SELF_CLOSING_TAGS[tagName]) {
          ignore--;
        }
        return;
      }
      emit('<');
      emit(tagName);
      for (let i = 0; i < attribs.length; i += 2) {
        const attrName = attribs[i];
        const attrValue = attribs[i + 1];
        if (!isValidAttr(attrName, attrValue)) {
          continue;
        }
        emit(' ');
        emit(attrName);
        emit('="');
        if (attrValue) {
          emit(htmlSanitizer.escapeAttrib(attrValue));
        }
        emit('"');
      }
      emit('>');
    },
    'endTag': function(tagName) {
      if (ignore > 0) {
        ignore--;
        return;
      }
      emit('</');
      emit(tagName);
      emit('>');
    },
    'pcdata': emit,
    'rcdata': emit,
    'cdata': emit,
  });
  parser(html);
  return output.join('');
}


/**
 * Sanitizes the provided formatting HTML. Only the most basic inline tags are
 * allowed, such as <b>, <i>, etc.
 *
 * @param {string} html
 * @return {string}
 */
export function sanitizeFormattingHtml(html) {
  return htmlSanitizer.sanitizeWithPolicy(html, function(tagName, attrs) {
    if (WHITELISTED_FORMAT_TAGS.indexOf(tagName) == -1) {
      return null;
    }
    return {
      'tagName': tagName,
      'attribs': []
    };
  });
}


/**
 * Whether the attribute/value are valid.
 * @param {string} attrName
 * @param {string} attrValue
 * @return {boolean}
 */
export function isValidAttr(attrName, attrValue) {

  // "on*" attributes are not allowed.
  if (attrName.indexOf('on') == 0 && attrName != 'on') {
    return false;
  }

  // Inline styles are not allowed.
  if (attrName == 'style') {
    return false;
  }

  // No attributes with "javascript" or other blacklisted substrings in them.
  if (attrValue) {
    const attrValueNorm = attrValue.toLowerCase().replace(/[\s,\u0000]+/g, '');
    for (let i = 0; i < BLACKLISTED_ATTR_VALUES.length; i++) {
      if (attrValueNorm.indexOf(BLACKLISTED_ATTR_VALUES[i]) != -1) {
        return false;
      }
    }
  }

  return true;
}
