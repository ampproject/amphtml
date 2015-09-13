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

import {assert} from './asserts';


/**
 * @enum {string}
 */
export var Layout = {
  NODISPLAY: 'nodisplay',
  FIXED: 'fixed',
  RESPONSIVE: 'responsive',
  CONTAINER: 'container',
  FILL: 'fill'
};


/**
 * @param {string} s
 * @return {Layout|undefined} Returns undefined in case of failure to parse
 *   the layout string.
 */
export function parseLayout(s) {
  for (let k in Layout) {
    if (Layout[k] == s) {
      return Layout[k];
    }
  }
  return undefined;
};


/**
 * @param {!Layout} layout
 * @return {string}
 */
export function getLayoutClass(layout) {
  return '-amp-layout-' + layout;
};


/**
 * Whether an element with this layout inherently defines the size.
 * @param {!Layout} layout
 * @return {boolean}
 */
export function isLayoutSizeDefined(layout) {
  return (layout == Layout.FIXED ||
      layout == Layout.RESPONSIVE ||
      layout == Layout.FILL);
};


/**
 * Whether the tag is an internal (service) AMP tag.
 * @param {!Node|string} tag
 * @return {boolean}
 */
export function isInternalElement(tag) {
  let tagName = (typeof tag == 'string') ? tag : tag.tagName;
  return tagName && tagName.toLowerCase().indexOf('i-') == 0;
};


/**
 * CSS Length type. E.g. "1px" or "20vh".
 * @typedef {string}
 */
var Length;


/**
 * Parses the CSS length value. If no units specified, the assumed value is
 * "px". Returns undefined in case of parsing error.
 * @param {string|undefined} s
 * @return {!Length|undefined}
 */
export function parseLength(s) {
  if (typeof s == 'number') {
    return s + 'px';
  }
  if (!s) {
    return undefined;
  }
  if (!/^\d+(px|em|rem|vh|vw|vmin|vmax)?$/.test(s)) {
    return undefined;
  }
  if (/^\d+$/.test(s)) {
    return s + 'px';
  }
  return s;
};


/**
 * Asserts that the supplied value is a CSS Length value.
 * @param {!Length|string} length
 * @return {!Length}
 */
export function assertLength(length) {
  assert(/^\d+(px|em|rem|vh|vw|vmin|vmax)$/.test(length),
      'Invalid length value: %s', length);
  return length;
};


/**
 * Returns units from the CSS length value.
 * @param {!Length} length
 * @return {string}
 */
export function getLengthUnits(length) {
  assertLength(length);
  let m = assert(length.match(/[a-z]+/i),
      'Failed to read units from %s', length);
  return m[0];
};


/**
 * Returns the numeric value of a CSS length value.
 * @param {!Length|string} length
 * @return {number}
 */
export function getLengthNumeral(length) {
  return parseInt(length, 10);
};


/**
 * @typedef {{
 *   width: number,
 *   height: number
 * }}
 */
var Dimensions;

/**
 * Cached browser natural dimenions for elements. Exported for testing.
 * @type {Object<String, Dimensions>}
 */
export var naturalDimensions_ = {};


/**
 * Determines the default dimensions for an element which could vary across
 * different browser implementations, like <audio> for instance.
 * @return {Dimensions}
 */
export function getBrowserNaturalDimensions(tagName) {
  tagName = tagName.toLowerCase().replace(/^amp\-/, '');
  if (!naturalDimensions_[tagName]) {
    let temp = document.createElement(tagName);
    if (tagName === 'audio') {
      temp.controls = true;
    }
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    document.body.appendChild(temp);
    naturalDimensions_[tagName] = {
      width: temp.offsetWidth,
      height: temp.offsetHeight
    };
    document.body.removeChild(temp);
  }
  return naturalDimensions_[tagName];;
}
