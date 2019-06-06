/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {computedStyle} from '../../../src/style';


/**
  *  Returns the min opacity found amongst the element and its ancestors
  *  @param {!Element|null} el
  *  @return {number} minimum opacity value
  */
export function getMinOpacity(el) {
  const parentNodeTree = getElementNodeTree(el.parentElement);
  parentNodeTree.push(el);
  let minOpacityFound = 1;
  let opacity;

  for (let i = 0; i < parentNodeTree.length; i++) {
    const node = parentNodeTree[i];
    opacity = getElementOpacity(node);

    if (opacity < minOpacityFound) { minOpacityFound = opacity; }

    if (minOpacityFound === 0) { return minOpacityFound; }

  }

  return minOpacityFound;

}

/**
  * Returns the Opacity value of the element.
  * @param {!Element} el
  * @return {number}
  */
function getElementOpacity(el) {
  const win = window;
  const fullyVisibleValue = 1;
  const fullyHiddenValue = 0;

  if (!el) { return fullyVisibleValue; }
  const {visibility, opacity} = computedStyle(win, el);

  if (visibility === 'hidden') {
    return fullyHiddenValue;

  }
  const opacityValue = (opacity === '')
    ? fullyVisibleValue
    : parseFloat(opacity);

  if (isNaN(opacityValue)) { return fullyVisibleValue; }

  return opacityValue;

}

/**
  * Returns the node tree of the current element starting from
  * the document root
  * @param {!Element|null} el
  * @return {Array} node list of the element's node tree
  */
function getElementNodeTree(el) {
  const nodeList = [];
  if (!el) { return nodeList; }

  const CAP = 50;
  const DOCUMENT_NODE_TYPE = 9;
  const ELEMENT_WITH_PARENT_TYPE = 1;
  let parent;
  let element = el;
  nodeList.push(element);

  for (let i = 0; i < CAP; i++) {

    parent = element.parentNode || element.parentElement;

    if (parent && parent.nodeType == ELEMENT_WITH_PARENT_TYPE) {
      element = parent;
      nodeList.push(element);

    } else if (parent && parent.nodeType == DOCUMENT_NODE_TYPE) {
      parent = element.ownerDocument.defaultView.frameElement;

      if (parent && parent.nodeType == ELEMENT_WITH_PARENT_TYPE) {
        element = parent;
        nodeList.push(element);

      } else { break; }

    } else { break; }

  }

  return nodeList;

}
