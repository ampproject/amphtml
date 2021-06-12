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

import {devAssertElement, userAssert} from '#core/assert';
import {isFiniteNumber} from '#core/types';

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
  FLEX_ITEM: 'flex-item',
  FLUID: 'fluid',
  INTRINSIC: 'intrinsic',
};

/**
 * Layout priorities to use with BaseElement#getLayoutPriority() and
 * BaseElement#updateLayoutPriority().
 * @enum {number}
 */
export const LayoutPriority = {
  CONTENT: 0,
  METADATA: 1,
  ADS: 2,
  BACKGROUND: 3,
};

/**
 * CSS Length type. E.g. "1px" or "20vh".
 * @typedef {string}
 */
export let LengthDef;

/**
 * @typedef {{
 *   width: string,
 *   height: string
 * }}
 */
let DimensionsDef;

/**
 * Elements that the progress can be shown for. This set has to be externalized
 * since the element's implementation may not be downloaded yet.
 * This list does not include video players which are found via regex later.
 * @enum {boolean}
 * @private  Visible for testing only!
 */
export const LOADING_ELEMENTS_ = {
  'AMP-AD': true,
  'AMP-ANIM': true,
  'AMP-EMBED': true,
  'AMP-FACEBOOK': true,
  'AMP-FACEBOOK-COMMENTS': true,
  'AMP-FACEBOOK-PAGE': true,
  'AMP-GOOGLE-DOCUMENT-EMBED': true,
  'AMP-IFRAME': true,
  'AMP-IMG': true,
  'AMP-INSTAGRAM': true,
  'AMP-LIST': true,
  'AMP-PINTEREST': true,
  'AMP-PLAYBUZZ': true,
  'AMP-RENDER': true,
  'AMP-TWITTER': true,
};
/**
 * All video player components must either have a) "video" or b) "player" in
 * their name. A few components don't follow this convention for historical
 * reasons, so they are listed individually.
 * @private @const {!RegExp}
 */
const videoPlayerTagNameRe =
  /^amp\-(video|.+player)|AMP-BRIGHTCOVE|AMP-DAILYMOTION|AMP-YOUTUBE|AMP-VIMEO|AMP-IMA-VIDEO/i;

/**
 * @param {string} s
 * @return {!Layout|undefined} Returns undefined in case of failure to parse
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
  return 'i-amphtml-layout-' + layout;
}

/**
 * Whether an element with this layout inherently defines the size.
 * @param {!Layout} layout
 * @return {boolean}
 */
export function isLayoutSizeDefined(layout) {
  return (
    layout == Layout.FIXED ||
    layout == Layout.FIXED_HEIGHT ||
    layout == Layout.RESPONSIVE ||
    layout == Layout.FILL ||
    layout == Layout.FLEX_ITEM ||
    layout == Layout.FLUID ||
    layout == Layout.INTRINSIC
  );
}

/**
 * Whether an element with this layout has a fixed dimension.
 * @param {!Layout} layout
 * @return {boolean}
 */
export function isLayoutSizeFixed(layout) {
  return layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT;
}

/**
 * Whether the tag is an internal (service) AMP tag.
 * @param {!Node|string} nodeOrTagName
 * @return {boolean}
 */
export function isInternalElement(nodeOrTagName) {
  /** @type string */
  let tagName;
  if (typeof nodeOrTagName == 'string') {
    tagName = nodeOrTagName;
  } else if (nodeOrTagName.nodeType === Node.ELEMENT_NODE) {
    tagName = devAssertElement(nodeOrTagName).tagName;
  }

  return !!tagName && tagName.toLowerCase().startsWith('i-');
}

/**
 * Parses the CSS length value. If no units specified, the assumed value is
 * "px". Returns undefined in case of parsing error.
 * @param {string|undefined|null} s
 * @return {!LengthDef|undefined}
 */
export function parseLength(s) {
  if (typeof s == 'number') {
    return s + 'px';
  }
  if (!s) {
    return undefined;
  }
  if (!/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)?$/.test(s)) {
    return undefined;
  }
  if (/^\d+(\.\d+)?$/.test(s)) {
    return s + 'px';
  }
  return s;
}

/**
 * Asserts that the supplied value is a non-percent CSS Length value.
 * @param {!LengthDef|string|null|undefined} length
 * @return {!LengthDef}
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertLength(length) {
  userAssert(
    /^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)$/.test(length),
    'Invalid length value: %s',
    length
  );
  return /** @type {!LengthDef} */ (length);
}

/**
 * Asserts that the supplied value is a CSS Length value
 * (including percent unit).
 * @param {!LengthDef|string} length
 * @return {!LengthDef}
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertLengthOrPercent(length) {
  userAssert(
    /^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|%)$/.test(length),
    'Invalid length or percent value: %s',
    length
  );
  return length;
}

/**
 * Returns units from the CSS length value.
 * @param {!LengthDef|string|null|undefined} length
 * @return {string}
 */
export function getLengthUnits(length) {
  assertLength(length);
  const m = userAssert(
    /[a-z]+/i.exec(length),
    'Failed to read units from %s',
    length
  );
  return m[0];
}

/**
 * Returns the numeric value of a CSS length value.
 * @param {!LengthDef|string|null|undefined} length
 * @return {number|undefined}
 */
export function getLengthNumeral(length) {
  const res = parseFloat(length);
  return isFiniteNumber(res) ? res : undefined;
}

/**
 * Whether the loading can be shown for the specified element. This set has
 * to be externalized since the element's implementation may not be
 * downloaded yet.
 * @param {!Element} element
 * @return {boolean}
 */
export function isLoadingAllowed(element) {
  const tagName = element.tagName.toUpperCase();
  return LOADING_ELEMENTS_[tagName] || isIframeVideoPlayerComponent(tagName);
}

/**
 * All video player components must either have a) "video" or b) "player" in
 * their name. A few components don't follow this convention for historical
 * reasons, so they're present in the LOADING_ELEMENTS_ allowlist.
 * @param {string} tagName
 * @return {boolean}
 */
export function isIframeVideoPlayerComponent(tagName) {
  if (tagName == 'AMP-VIDEO') {
    return false;
  }
  return videoPlayerTagNameRe.test(tagName);
}

/**
 * Configures the supplied element to have a "fill content" layout. The
 * exact interpretation of "fill content" depends on the element's layout.
 *
 * If `opt_replacedContent` is specified, it indicates whether the "replaced
 * content" styling should be applied. Replaced content is not allowed to
 * have its own paddings or border.
 *
 * @param {!Element} element
 * @param {boolean=} opt_replacedContent
 */
export function applyFillContent(element, opt_replacedContent) {
  element.classList.add('i-amphtml-fill-content');
  if (opt_replacedContent) {
    element.classList.add('i-amphtml-replaced-content');
  }
}
