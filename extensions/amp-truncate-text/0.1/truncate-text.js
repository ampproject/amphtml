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

import {
  BinarySearchPreference,
  BinarySearchStop,
  binarySearch,
} from './binary-search';
import {trimEnd} from '../../../src/string';

/** The class to add to the container when it has overflow. */
const CONTAINER_OVERFLOW_ATTRIBUTE = 'i-amphtml-truncate-overflow';

/** The class to add to a descendant element that is overflowing. */
const ELEMENT_OVERFLOW_ATTRIBUTE = 'i-amphtml-truncate-child-overflow';

/** Used to save the Text Node's data original and modified data.  */
const TEXT_DATA_PROPERTY = '__AMP_TRUNCATE_TEXT_DATA';

/** A marker property for when an element has been truncateed. */
const TRUNCATED_MARKER = '__AMP_TRUNCATE_TRUNCATED';

/**
 * The characters to use when ellipsizing. This includes a space to add some
 * space between the ellipsis and the overflow element. Note that if there is
 * no overflow element, the space character will not take any extra space.
 */
const ELLIPSIS_CHARACTERS = '… ';

/**
 * @param {string} char
 * @return {boolean} True if the character is whitespace, false otherwise.
 */
function isWhitespace(char) {
  return !char.trim();
}

/**
 * Clears the effects of truncateing on an element, restoring content, unhiding
 * any hidden elements and hiding the overflow button.
 * @param {!Element} element
 */
function clearTruncated(element) {
  // Save some time on the first call, since we do not need to clear anything
  // yet,
  if (!element[TRUNCATED_MARKER]) {
    return;
  }

  element[TRUNCATED_MARKER] = false;
  element.removeAttribute(CONTAINER_OVERFLOW_ATTRIBUTE);
  removeTruncation(element);
}

/**
 * Marks an element as truncateed, showing the overflow button.
 * @param {!Element} element
 */
function setTruncated(element) {
  element[TRUNCATED_MARKER] = true;
  element.setAttribute(CONTAINER_OVERFLOW_ATTRIBUTE, '');
}

/**
 * @param {!Node} node The node to operate on. 
 * @param {function(!Node)} cb  A callback to call for each child.
 */
function forEachChild(node, cb) {
  const childNodes = node.localName == 'slot' ?
      node.assignedNodes() :
      node.childNodes;

  for (let i = 0; i < childNodes.length; i++) {
    cb(childNodes[i]);
  }
}

/**
 * Clears the effects of truncation for a given subtree, unhiding Elements that
 * were hidden and restoring text content for Text Nodes.
 * @param {!Node} node The node to restore.
 */
function removeTruncation(node) {
  const data = node[TEXT_DATA_PROPERTY];

  if (data && data.modifiedText == node.data) {
    node.data = data.originalText;
  }

  if (node.nodeType == Node.ELEMENT_NODE) {
    node.removeAttribute(ELEMENT_OVERFLOW_ATTRIBUTE);
  }

  forEachChild(node, child => removeTruncation(child));
}

/**
 * @param {!Node} node The node to truncate.
 * @param {string} originalText The original text of the node, used for
 *    restoring on subsequent truncate calls.
 * @param {string} modifiedText The modified text of the node.
 */
function truncate(node, originalText, modifiedText) {
  node[TEXT_DATA_PROPERTY] = {
    originalText,
    modifiedText,
  };
  node.data = modifiedText;
}

/**
 * @param {!Element} element An Element to get the overflow for.
 * @return {number} The vertical overflow, if any, in pixels.
 */
function getOverflowY(element) {
  return element.scrollHeight - element.offsetHeight;
}

/**
 * Clamps the text within a given Element.
 *
 * To make mostly non-destructive changes for DOM diffing libraries, this
 * clears text from Text nodes rather than removing them. It does not clone
 * contents in any way so that event listeners and any expando properties are
 * maintained.
 *
 * Unlike CSS text truncateing, this actually removes text from the DOM. Text
 * nodes are cleared and not removed so that almost all DOM diffing libraries
 * continue to work. One implication of actually removing text is that it is
 * unavailable to screen readers. This is unfortunate as users would need to
 * use some sort of developer provided functionality to expand the truncated
 * text, then have the content re-read.
 *
 * This function adds the ellipsis and space to the last Text node, to avoid
 * confusing libraries that may be managing the DOM. The space should probably
 * be manually added before the overflow element instead (e.g. so that it is
 * not a part of an `<a>` tag. TODO(sparhami) consider just adding a Text node
 * for the ellipsis before the overflow Element, need to check what this might
 * break.
 *
 * @param {{
 *   container: !Element,
 *   overflowElement: ?Element,
 * }} config
 */
export function truncateText({
  container,
  overflowElement,
} = {}) {
  clearTruncated(container);

  // If everything fits while the overflow button is hidden, we are done.
  if (getOverflowY(container) <= 0) {
    return;
  }

  // Measure here, since we just measured and the container rect should not
  // depend on truncateing.
  const containerRect = container.getBoundingClientRect();
  // Set the container as truncateed, so we show the overflow element and we can
  // truncate taking the size into account.
  setTruncated(container);
  runTruncation(container, containerRect, overflowElement);
}

/**
 * Gets all the nodes within a subtree that match a filter.
 * @param {!Node} root The root of the subtree.
 * @param {function(!Node): boolean} filter A filter function for which nodes
 *    (and their subtrees) to include.
 * @param {!Array<!Node>} nodes An optional Array of initial nodes to include.
 */
function getAllNodes(root, filter, nodes = []) {
  if (!filter(root)) {
    return nodes;
  }

  nodes.push(root);
  forEachChild(root, child => getAllNodes(child, filter, nodes));
  return nodes;
}

/**
 * Runs text truncation for an Element, finding the last node that needs
 * truncation and truncating it.
 * @param {!Element} container The Element to do truncation for.
 * @param {!ClientRect} containerRect The rect for `container`.
 * @param {?Element} overflowElement An Element that shows when overflowing,
 *    or null if none is specified.
 */
function runTruncation(container, containerRect, overflowElement) {
  const nodes = getAllNodes(container, node => {
    return node != overflowElement;
  });

  // Work backwards, truncating nodes from the end until we find one that can
  // fit an ellipsis and not overflow.
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];

    // If we are visiting an Element, everything inside was already cleared,
    // so we want to hide the whole element in case it has some padding.
    if (node.nodeType == Node.ELEMENT_NODE) {
      node.setAttribute(ELEMENT_OVERFLOW_ATTRIBUTE, '');
    }

    // Truncate the text node. If it got ellipsized, the we are done.
    if (node.nodeType == Node.TEXT_NODE &&
        maybeEllipsizeNode(node, container, containerRect)) {
      break;
    }
  }
}

/**
 * Gets the underflow by mutating the node's text. This forces a layout, which
 * should hopefully be limited to the container.
 * @param {!Element} container The container to check get the nderflow for.
 * @param {!Text} node The Text to check for.
 * @param {string} text The text content of `node`.
 * @param {number} offset The text offset within the node to check.
 * @return {number} The amount of underflow, in pixels.
 */
function underflowAtPosition(container, node, text, offset) {
  node.data = text.slice(0, offset + 1) + ELLIPSIS_CHARACTERS;

  return 0 - getOverflowY(container);
}

/**
 * Either clears or ellipsizes the node, depending on whether or not the
 * ellpsized version would still result in a given container overflowing.
 * @param {!Text} node A Text Node to ellipsize.
 * @param {!Element} container The container that should have no overflow.
 * @param {!ClientRect} containerRect The ClientRect for `container`.
 */
function maybeEllipsizeNode(node, container, containerRect) {
  // The Node can have no rects if an ancestor has `display: none`. We need to
  // check for this first before we try to truncate. It can also have no rect
  // if it is all whitespace.
  // TODO(sparhami) Since we need to pay the cost of getting the rect/rects, we
  // could use this information to start our search with a much smaller
  // window.
  const range = document.createRange();
  range.selectNode(node);
  const rect = range.getBoundingClientRect();
  const text = node.data;

  // If the rect has no size, there is nothing we need to do.
  if (!rect.height) {
    return;
  }

  // Since we have the rect anyway, do a quick check to see if all of the
  // node's text is past the truncation point.
  if (rect.top > containerRect.bottom) {
    truncate(node, text, '');
    return;
  }

  // Use the underflow to find the boundary index of where truncation should
  // occur. As long as we have underflow, we will keep looking at a higher
  // index. Note:
  //
  // - We use BinarySearchPreference.HIGH to find the index that is
  //   overflowing when the return value is negative. When everything overflows
  //   overflows, BinarySearchPreference.LOW returns `-0`, so we would need to
  //   special case that.
  // - We use BinarySearchStop.RIGHT to find the last index that is not
  //   overflowing when the return value is positive.
  const searchIndex = binarySearch(0, text.length, offset => {
    // Treat whitespace as being the same as the the previous non-whitespace
    // character in terms of truncation. This is necessary as we will strip
    // trailing whitespace, so we do not to include its width when considering
    // if we overflow. Note this includes non-breaking whitespace.
    while (isWhitespace(text[offset]) && offset > 0) {
      offset--;
    }

    return underflowAtPosition(container, node, text, offset);
  }, BinarySearchStop.RIGHT, BinarySearchPreference.HIGH);

  // When positive, seachIndex is the last underflowing index, so add one to
  // get the overflowing index.
  // When negative, searchIndex corresponds to the first overflowing index.
  const firstOverflowingIndex = searchIndex >= 0 ?
    searchIndex + 1 :
    -(searchIndex + 1);

  // Remove trailing whitespace since we do not want to have something like
  // "Hello world   …". We need to keep leading whitespace since it may be
  // significant (e.g. next to another node).
  const fittingText = trimEnd(text.slice(0, firstOverflowingIndex));
  // If no text fits (i.e. adding an ellipsis to even the first character would
  // cause overflow), then do not add an ellipsis.
  const newText = fittingText ? fittingText + ELLIPSIS_CHARACTERS : '';

  truncate(node, text, newText);
  // We are done if we actually truncated.
  return !!fittingText;
}
