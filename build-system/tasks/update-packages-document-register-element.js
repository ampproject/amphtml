/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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


function generateElementDefReplacement(tagNames, parsedSanitizedDef) {
  return `(function(def) {
    ${JSON.stringify(tagNames)}.forEach(function(tagName) {
      def.elements['HTML' + tagName + 'Element'] = [tagName.toLowerCase()];
    });
    return def;
  }(${JSON.stringify(parsedSanitizedDef)}))`;
}


function getSimpleKeysSanitizeDef(unsanitized) {
  const simpleKeys = [];
  Object.keys(unsanitized.elements).forEach(k => {
    if (unsanitized.elements[k].length > 1) {
      // special case, many tags to one type.
      return;
    }
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


function shrinkRegisterElementTable(match) {
  try {
    const parsed = JSON.parse(trimParens(match));
    const simpleKeys = getSimpleKeysSanitizeDef(parsed);
    return generateElementDefReplacement(simpleKeys, parsed);
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
