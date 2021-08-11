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

import { computedStyle } from "../../../src/core/dom/style";

/**
 *  Returns the min opacity found amongst the element and its ancestors
 *  @param {?Element} el
 *  @return {number} minimum opacity value
 */
export function getMinOpacity(el) {
  var parentNodeTree = getElementNodeTree(el.parentElement);
  parentNodeTree.push(el);
  var minOpacityFound = 1;
  var opacity;

  for (var i = 0; i < parentNodeTree.length; i++) {
    var node = parentNodeTree[i];
    opacity = getElementOpacity(node);

    if (opacity < minOpacityFound) {
      minOpacityFound = opacity;
    }

    if (minOpacityFound === 0) {
      return minOpacityFound;
    }
  }

  return minOpacityFound;
}

/**
 * Returns the Opacity value of the element.
 * @param {!Element} el
 * @return {number}
 */
function getElementOpacity(el) {
  var win = window;
  var fullyVisibleValue = 1;
  var fullyHiddenValue = 0;

  if (!el) {
    return fullyVisibleValue;
  }
  var _computedStyle = computedStyle(win, el),opacity = _computedStyle.opacity,visibility = _computedStyle.visibility;

  if (visibility === 'hidden') {
    return fullyHiddenValue;
  }
  var opacityValue = opacity === '' ? fullyVisibleValue : parseFloat(opacity);

  if (isNaN(opacityValue)) {
    return fullyVisibleValue;
  }

  return opacityValue;
}

/**
 * Returns the node tree of the current element starting from
 * the document root
 * @param {?Element} el
 * @return {Array} node list of the element's node tree
 */
function getElementNodeTree(el) {
  var nodeList = [];
  if (!el) {
    return nodeList;
  }

  var CAP = 50;
  var DOCUMENT_NODE_TYPE = 9;
  var ELEMENT_WITH_PARENT_TYPE = 1;
  var parent;
  var element = el;
  nodeList.push(element);

  for (var i = 0; i < CAP; i++) {
    parent = element.parentNode || element.parentElement;

    if (parent && parent.nodeType == ELEMENT_WITH_PARENT_TYPE) {
      element = parent;
      nodeList.push(element);
    } else if (parent && parent.nodeType == DOCUMENT_NODE_TYPE) {
      parent = element.ownerDocument.defaultView.frameElement;

      if (parent && parent.nodeType == ELEMENT_WITH_PARENT_TYPE) {
        element = parent;
        nodeList.push(element);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return nodeList;
}
// /Users/mszylkowski/src/amphtml/extensions/amp-analytics/0.1/opacity.js