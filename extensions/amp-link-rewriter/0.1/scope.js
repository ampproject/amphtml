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


/**
 *
 * @param {?../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 * @param {!Object} configOpts
 * @return {!Array<!Element>}
 */
export function getScopeElements(ampDoc, configOpts) {

  const doc = ampDoc.getRootNode();
  let cssSelector = configOpts.section.join(' a, ');
  let selection = doc.querySelectorAll('a');
  const filteredSelection = [];

  if (configOpts.section.length !== 0) {
    cssSelector = cssSelector + ' a';
    selection = doc.querySelectorAll(cssSelector);
  }

  selection.forEach(element => {
    if (hasAttributeValues(element, configOpts)) {
      filteredSelection.push(element);
    }
  });

  return filteredSelection;
}

/**
 * Match attributes of the anchor if have been defined in config
 * compare every attribute defined in config as regex with its
 * corresponding value of the anchor element attribute
 * @param {!Node} htmlElement
 * @param {!Object} configOpts
 */
function hasAttributeValues(htmlElement, configOpts) {
  const anchorAttr = configOpts.attribute;
  const attrKeys = Object.keys(anchorAttr);

  return attrKeys.every(key => {
    const reg = new RegExp(anchorAttr[key]);

    return reg.test(htmlElement.getAttribute(key));
  });
}
