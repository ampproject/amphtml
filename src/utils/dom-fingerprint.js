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

import {stringHash32} from '../crypto';


/**
 * Gets a string of concatenated element names and relative positions
 * of the DOM element and its parentElement's (up to 25).  Relative position
 * is the index of nodes with this tag within the parent's children.
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
export function domFingerprintPlain(element) {
  const ids = [];
  let level = 0;
  while (element && element.nodeType == /* element */ 1 && level < 25) {
    let id = '';
    if (element.id) {
      id = `/${element.id}`;
    }
    const nodeName = element.nodeName.toLowerCase();
    ids.push(`${nodeName}${id}${indexWithinParent(element)}`);
    level++;
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
  return stringHash32(domFingerprintPlain(element));
};


/**
 * Gets a string showing the index of an element within
 * the children of its parent, counting only nodes with the same tag.
 * Stop at 25, just to have a limit.
 * @param {!Element} element DOM node to get index of.
 * @return {string} '.<index>' or ''.
 */
function indexWithinParent(element) {
  const nodeName = element.nodeName;
  // Find my index within my parent's children
  let i = 0;
  let count = 0;
  let sibling = element.previousElementSibling;
  // Different browsers have different children.
  // So count only nodes with the same tag.
  // Use a limit for the tags, so that different browsers get the same
  // count. So 25 and higher all return no index.
  while (sibling && count < 25 && i < 100) {
    if (sibling.nodeName == nodeName) {
      count++;
    }
    i++;
    sibling = sibling.previousElementSibling;
  }
  // If we got to the end, then the count is accurate; otherwise skip count.
  return count < 25 && i < 100 ? `.${count}` : '';
};
