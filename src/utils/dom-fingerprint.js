/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
 * Gets a string showing the index of an element within
 * the children of its parent, counting only nodes with the same tag.
 * Stop at 25, just to have a limit.
 * @param {?Element} element DOM node to get index of.
 * @return {string} '.<index>' or ''.
 */
function indexWithinParent(element) {
  if (element && element.nodeName && element.parentElement) {
    const elementParent = element.parentElement;
    const nodeName = element.nodeName.toString().toLowerCase();
    // Find my index within my parent's children
    const children = elementParent.childNodes;
    // Choose a limit that we hope will allow getting to 25
    // matching nodes.
    const limit = Math.min(children.length, 100);
    let matchingNodeCount = 0;
    for (let i = 0; i < limit && matchingNodeCount < 25; i++) {
      const child = children[i];
      // Some browsers treat childNodes differently.
      // So we'll only count nodes with the same tag.
      if (child.nodeName &&
          child.nodeName.toString().toLowerCase() === nodeName) {
        if (element === child) {
          return '.' + matchingNodeCount;
        }
        ++matchingNodeCount;
      }
    }
  }
  return '';
};


/**
 * Gets a string of concatenated element names and relative positions
 * of the DOM element and its parentElement's (up to 25).  Relative position
 * is the index of nodes with this tag within the parent's childNodes.
 * The order is from the inner to outer nodes in DOM hierarchy.
 *
 * If a DOM hierarchy is the following:
 *
 * <div id='id1' ...>
 *   <div id='id2' ...>
 *     <table ...>       // table:0
 *       <tr>            // tr:0
 *         <td>...</td>  // td:0
 *         <td>          // td:1
 *           <amp-ad ...></amp-ad>
 *         </td>
 *       </tr>
 *       <tr>...</tr>    // tr:1
 *     </table>
 *   </div>
 * </div>
 *
 * With the amp-ad element passed in:
 * 'amp-ad.0,td.1,tr.0,table.0,div/id2.0,div/id1.0'
 *
 * Note: 25 is chosen arbitrarily.
 *
 * @param {?Element} element DOM node from which to get fingerprint.
 * @return {string} Concatenated element ids.
 */
export function domFingerprintString(element) {
  const ids = [];
  for (let level = 0; element && element.nodeType == /* element */ 1 &&
           level < 25; ++level) {
    // Skip generated id on amp-ad.
    const id = level > 0 && element.id;
    const nodeName = element.nodeName &&
          element.nodeName.toString().toLowerCase();
    ids.push(nodeName + (id ? '/' + id : '') +
             indexWithinParent(element));
    element = element.parentElement;
  }

  return ids.join();
};

/**
 * Calculates ad slot DOM fingerprint.  This key is intended to
 * identify "same" ad unit across many page views. This is
 * based on where the ad appears within the page's DOM structure.
 *
 * @param {?Element} element The DOM element from which to collect
 *     the DOM chain element IDs.  If null, DOM chain element IDs are not
 *     included in the hash.
 * @return {string} The ad unit hash key string.
 */
export function domFingerprint(element) {
  return stringHash32(domFingerprintString(element)).toString();
};

/**
 * Hash function djb2a
 * @param {string} str
 * @return {number} 32-bit unsigned hash of the string
 */
export function stringHash32(str) {
  const length = str.length;
  let hash = 5381;
  for (let i = 0; i < length; i++) {
    hash = hash * 33 ^ str.charCodeAt(i);
  }
  // Convert from 32-bit signed to unsigned.
  return hash >>> 0;
};
