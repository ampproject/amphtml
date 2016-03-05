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

/**
 * @fileoverview Implements element layout. See https://goo.gl/9avXuT for
 * details.
 */

import {assert} from './asserts';


/**
 * @enum {string}
 */
export const Layout = {
  NODISPLAY: 'nodisplay',
  FIXED: 'fixed',
  FIXED_HEIGHT: 'fixed-height',
  RESPONSIVE: 'responsive',
  CONTAINER: 'container',
  FILL: 'fill',
};


/**
 * CSS Length type. E.g. "1px" or "20vh".
 * @typedef {string}
 */
let LengthDef;


/**
 * @typedef {{
 *   width: string,
 *   height: string
 * }}
 */
let DimensionsDef;


/**
 * The set of elements with natural dimensions, that is, elements
 * which have a known dimension either based on their value specified here,
 * or, if the value is null, a dimension specific to the browser.
 * `hasNaturalDimensions` checks for membership in this set.
 * `getNaturalDimensions` determines the dimensions for an element in the
 *    set and caches it.
 * @type {!Object<string, ?DimensionsDef>}
 * @private  Visible for testing only!
 */
export const naturalDimensions_ = {
  'AMP-PIXEL': {width: '1px', height: '1px'},
  'AMP-ANALYTICS': {width: '1px', height: '1px'},
  // TODO(dvoytenko): audio should have width:auto.
  'AMP-AUDIO': null,
};


/**
 * Elements that the progess can be shown for. This set has to be externalized
 * since the element's implementation may not be downloaded yet.
 * @enum {boolean}
 * @private  Visible for testing only!
 */
export const LOADING_ELEMENTS_ = {
  'AMP-ANIM': true,
  'AMP-BRIGHTCOVE': true,
  'AMP-EMBED': true,
  'AMP-IFRAME': true,
  'AMP-IMG': true,
  'AMP-INSTAGRAM': true,
  'AMP-LIST': true,
  'AMP-PINTEREST': true,
  'AMP-VIDEO': true,
};


/**
 * @param {string} s
 * @return {Layout|undefined} Returns undefined in case of failure to parse
 *   the layout string.
 */
export function parseLayout(s) {
  for (const k in Layout) {
    if (Layout[k] == s) {
      return Layout[k];
    }
  }
  return undefined;
}


/**
 * @param {!Layout} layout
 * @return {string}
 */
export function getLayoutClass(layout) {
  return '-amp-layout-' + layout;
}


/**
 * Whether an element with this layout inherently defines the size.
 * @param {!Layout} layout
 * @return {boolean}
 */
export function isLayoutSizeDefined(layout) {
  return (layout == Layout.FIXED ||
      layout == Layout.FIXED_HEIGHT ||
      layout == Layout.RESPONSIVE ||
      layout == Layout.FILL);
}


/**
 * Whether the tag is an internal (service) AMP tag.
 * @param {!Node|string} tag
 * @return {boolean}
 */
export function isInternalElement(tag) {
  const tagName = (typeof tag == 'string') ? tag : tag.tagName;
  return tagName && tagName.toLowerCase().indexOf('i-') == 0;
}


/**
 * Parses the CSS length value. If no units specified, the assumed value is
 * "px". Returns undefined in case of parsing error.
 * @param {string|undefined} s
 * @return {!LengthDef|undefined}
 */
export function parseLength(s) {
  if (typeof s == 'number') {
    return s + 'px';
  }
  if (!s) {
    return undefined;
  }
  if (!/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax)?$/.test(s)) {
    return undefined;
  }
  if (/^\d+(\.\d+)?$/.test(s)) {
    return s + 'px';
  }
  return s;
}



/**
 * Asserts that the supplied value is a non-percent CSS Length value.
 * @param {!LengthDef|string} length
 * @return {!LengthDef}
 */
export function assertLength(length) {
  assert(/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax)$/.test(length),
      'Invalid length value: %s', length);
  return length;
}




/**
 * Asserts that the supplied value is a CSS Length value
 * (including percent unit).
 * @param {!LengthDef|string} length
 * @return {!LengthDef}
 */
export function assertLengthOrPercent(length) {
  assert(/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|%)$/.test(length),
      'Invalid length or percent value: %s', length);
  return length;
}


/**
 * Returns units from the CSS length value.
 * @param {!LengthDef} length
 * @return {string}
 */
export function getLengthUnits(length) {
  assertLength(length);
  const m = assert(length.match(/[a-z]+/i),
      'Failed to read units from %s', length);
  return m[0];
}


/**
 * Returns the numeric value of a CSS length value.
 * @param {!LengthDef|string} length
 * @return {number}
 */
export function getLengthNumeral(length) {
  return parseFloat(length);
}


/**
 * Determines whether the tagName is a known element that has natural dimensions
 * in our runtime or the browser.
 * @param {string} tagName The element tag name.
 * @return {DimensionsDef}
 */
export function hasNaturalDimensions(tagName) {
  tagName = tagName.toUpperCase();
  return naturalDimensions_[tagName] !== undefined;
}


/**
 * Determines the default dimensions for an element which could vary across
 * different browser implementations, like <audio> for instance.
 * This operation can only be completed for an element whitelisted by
 * `hasNaturalDimensions`.
 * @param {string} tagName The element tag name.
 * @return {DimensionsDef}
 */
export function getNaturalDimensions(tagName) {
  tagName = tagName.toUpperCase();
  assert(naturalDimensions_[tagName] !== undefined);
  if (!naturalDimensions_[tagName]) {
    const naturalTagName = tagName.replace(/^AMP\-/, '');
    const temp = document.createElement(naturalTagName);
    // For audio, should no-op elsewhere.
    temp.controls = true;
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    document.body.appendChild(temp);
    naturalDimensions_[tagName] = {
      width: (temp./*OK*/offsetWidth || 1) + 'px',
      height: (temp./*OK*/offsetHeight || 1) + 'px',
    };
    document.body.removeChild(temp);
  }
  return naturalDimensions_[tagName];
}


/**
 * Whether the loading can be shown for the specified elemeent. This set has
 * to be externalized since the element's implementation may not be
 * downloaded yet.
 * @param {string} tagName The element tag name.
 * @return {boolean}
 */
export function isLoadingAllowed(tagName) {
  return LOADING_ELEMENTS_[tagName.toUpperCase()] || false;
}
