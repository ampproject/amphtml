/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const assert = require('assert');


/**
 * Takes a document-register-element polyfill init object (like: git.io/fhxbR)
 * in the form:
 *
 *  {
 *    'collections': {
 *      // ...
 *    },
 *    'elements': {
 *      'Element': ['element'],
 *      'HTMLAnchorElement': ['a'],
 *      'HTMLAppletElement': ['applet'],
 *      'HTMLAreaElement': ['area'],
 *      'HTMLAttachmentElement': ['attachment'],
 *      'HTMLAudioElement': ['audio'],
 *      'HTMLBRElement': ['br'],
 *      // ...
 *    },
 *    'nodes': {
 *      // ...
 *    }
 *  }
 *
 * And compresses items of "elements" that follow the convention
 *    'HTML$MyEl$Element': ['$myel$']
 *
 * So that they're generated on runtime inside an IIFE:
 *
 *   (function(def) {
 *      ['Applet', 'Area', 'Attachment', ...].forEach(function(tagName) {
 *        def.elements['HTML' + tagName + 'Element'] = [tagName.toLowerCase()];
 *      });
 *      return def;
 *   }({
 *     'collections': {
 *       // ...
 *     },
 *     'elements': {
 *       'Element': ['element'],
 *       'HTMLAnchorElement': ['a'],
 *       // HTMLAppletElement, HTMLAreaElement, &c. stripped out.
 *       // ...
 *     },
 *     'nodes': {
 *       // ...
 *     }
 *   }))
 *
 * This reduces the output size (~250B gzipped) since the amount of items that
 * follow said convention is sufficiently large.
 *
 * @param {!Object<string, !Object<string, !Array<string>>>} def
 * @return {string}
 */
function generateElementDefReplacement(def) {
  const tagNames = getSimpleKeysSanitizeDef(def);
  return `(function(def) {
    ${JSON.stringify(tagNames)}.forEach(function(tagName) {
      def.elements['HTML' + tagName + 'Element'] = [tagName.toLowerCase()];
    });
    return def;
  }(${JSON.stringify(def)}))`;
}


function getSimpleKeysSanitizeDef(unsanitized) {
  const simpleKeys = [];
  Object.keys(unsanitized.elements).forEach(k => {
    if (unsanitized.elements[k].length > 1) {
      // special case, many tags to one type.
      return;
    }
    assert(unsanitized.elements[k].length == 1);
    const simpleKey = k.replace(/^HTML|Element$/g, '');
    if (simpleKey.length != (k.length - ('HTML'.length + 'Element'.length))) {
      // special case, not `HTML*Element`
      return;
    }
    if (unsanitized.elements[k][0] != simpleKey.toLowerCase()) {
      // special case, tagname does not match `HTML*Element` convention.
      return;
    }
    delete unsanitized.elements[k];
    simpleKeys.push(simpleKey);
  });
  return simpleKeys;
}


const trimParens = match => match.replace(/^\(+|\)+$/g, '');


/**
 * Takes a match from `shrinkRegisterElementTableRe` and returns a compressed
 * replacement.
 * If the format is not as expected, the match is left as-is.
 * @param {string} match
 * @return {string}
 */
function shrinkRegisterElementTable(match) {
  try {
    return generateElementDefReplacement(JSON.parse(trimParens(match)));
  } catch {
    // if parsing or cleanup fails, safely leave as-is
    return match;
  }
}


module.exports = {
  shrinkRegisterElementTableRe:
      // should start and end with parens
      /\(\{\s*"collections":\s*\{[\s\S]+\]\s*\}\s*\}\s*\)/g,

  shrinkRegisterElementTable,
};
