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


/** @const {!Object<string, boolean>} */
const BLACKLISTED_TAGS = {
  'iframe': true,
  'img': true,
  'script': true,
  'style': true,
  'template': true,
};


/** @const {!Object<string, boolean>} */
const SELF_CLOSING_TAGS = {
  'img': true,
};


/** @const {!Object<string, boolean>} */
const WHITELISTED_FORMAT_TAGS = {
  'b': true,
  'br': true,
  'code': true,
  'del': true,
  'em': true,
  'i': true,
  'ins': true,
  'mark': true,
  'q': true,
  's': true,
  'small': true,
  'strong': true,
  'sub': true,
  'sup': true,
  'time': true,
  'u': true,
};


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
  const output = [];
  let ignore = 0;

  function emit(content) {
    if (ignore == 0) {
      output.push(content);
    }
  }

  const parser = htmlSanitizer.makeSaxParser({
    'startTag': function(tagName, attribs) {
      if (BLACKLISTED_TAGS[tagName]) {
        ignore++;
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
        if (BLACKLISTED_TAGS[tagName]) {
          ignore--;
        }
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
    if (!WHITELISTED_FORMAT_TAGS[tagName]) {
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

  // No attributes with "javascript" in them.
  if (attrValue.indexOf(/*eslint no-script-url: 0*/ 'javascript:') != -1) {
    return false;
  }

  return true;
}
