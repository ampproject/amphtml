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

import {dev, devAssert, userAssert} from './log';
import {htmlFor} from './static-template';
import {isFiniteNumber} from './types';
import {setStyle, setStyles, toggle} from './style';
import {startsWith} from './string';

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
  'AMP-PIXEL': {width: '0px', height: '0px'},
  'AMP-ANALYTICS': {width: '1px', height: '1px'},
  // TODO(dvoytenko): audio should have width:auto.
  'AMP-AUDIO': null,
  'AMP-SOCIAL-SHARE': {width: '60px', height: '44px'},
};


/**
 * Elements that the progess can be shown for. This set has to be externalized
 * since the element's implementation may not be downloaded yet.
 * @enum {boolean}
 * @private  Visible for testing only!
 */
export const LOADING_ELEMENTS_ = {
  'AMP-AD': true,
  'AMP-ANIM': true,
  'AMP-BRIGHTCOVE': true,
  'AMP-DAILYMOTION': true,
  'AMP-EMBED': true,
  'AMP-FACEBOOK': true,
  'AMP-FACEBOOK-COMMENTS': true,
  'AMP-FACEBOOK-LIKE': true,
  'AMP-FACEBOOK-PAGE': true,
  'AMP-GOOGLE-DOCUMENT-EMBED': true,
  'AMP-IFRAME': true,
  'AMP-IMG': true,
  'AMP-INSTAGRAM': true,
  'AMP-LIST': true,
  'AMP-PINTEREST': true,
  'AMP-PLAYBUZZ': true,
  'AMP-YOUTUBE': true,
  'AMP-VIMEO': true,
};


/**
 * All video player components must either have a) "video" or b) "player" in
 * their name. A few components don't follow this convention for historical
 * reasons, so they're present in the LOADING_ELEMENTS_ whitelist.
 * @private @const {!RegExp}
 */
const videoPlayerTagNameRe = /^amp\-(video|.+player)/i;


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
  return 'i-amphtml-layout-' + layout;
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
      layout == Layout.FILL ||
      layout == Layout.FLEX_ITEM ||
      layout == Layout.FLUID ||
      layout == Layout.INTRINSIC);
}


/**
 * Whether the tag is an internal (service) AMP tag.
 * @param {!Node|string} tag
 * @return {boolean}
 */
export function isInternalElement(tag) {
  const tagName = (typeof tag == 'string') ? tag : tag.tagName;
  return tagName && startsWith(tagName.toLowerCase(), 'i-');
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
 */
export function assertLength(length) {
  userAssert(
      /^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)$/.test(length),
      'Invalid length value: %s', length);
  return /** @type {!LengthDef} */ (length);
}




/**
 * Asserts that the supplied value is a CSS Length value
 * (including percent unit).
 * @param {!LengthDef|string} length
 * @return {!LengthDef}
 */
export function assertLengthOrPercent(length) {
  userAssert(/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|%)$/.test(length),
      'Invalid length or percent value: %s', length);
  return length;
}


/**
 * Returns units from the CSS length value.
 * @param {!LengthDef|string|null|undefined} length
 * @return {string}
 */
export function getLengthUnits(length) {
  assertLength(length);
  dev().assertString(length);
  const m = userAssert(length.match(/[a-z]+/i),
      'Failed to read units from %s', length);
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
 * Determines whether the tagName is a known element that has natural dimensions
 * in our runtime or the browser.
 * @param {string} tagName The element tag name.
 * @return {boolean}
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
 * @param {!Element} element
 * @return {DimensionsDef}
 */
export function getNaturalDimensions(element) {
  const tagName = element.tagName.toUpperCase();
  devAssert(naturalDimensions_[tagName] !== undefined);
  if (!naturalDimensions_[tagName]) {
    const doc = element.ownerDocument;
    const naturalTagName = tagName.replace(/^AMP\-/, '');
    const temp = doc.createElement(naturalTagName);
    // For audio, should no-op elsewhere.
    temp.controls = true;
    setStyles(temp, {
      position: 'absolute',
      visibility: 'hidden',
    });
    doc.body.appendChild(temp);
    naturalDimensions_[tagName] = {
      width: (temp./*OK*/offsetWidth || 1) + 'px',
      height: (temp./*OK*/offsetHeight || 1) + 'px',
    };
    doc.body.removeChild(temp);
  }
  return /** @type {DimensionsDef} */ (naturalDimensions_[tagName]);
}


/**
 * Whether the loading can be shown for the specified elemeent. This set has
 * to be externalized since the element's implementation may not be
 * downloaded yet.
 * @param {!Element} element
 * @return {boolean}
 */
export function isLoadingAllowed(element) {
  const tagName = element.tagName.toUpperCase();
  return LOADING_ELEMENTS_[tagName] || isVideoPlayerComponent(tagName);
}


/**
 * All video player components must either have a) "video" or b) "player" in
 * their name. A few components don't follow this convention for historical
 * reasons, so they're present in the LOADING_ELEMENTS_ whitelist.
 * @param {string} tagName
 * @return {boolean}
 */
function isVideoPlayerComponent(tagName) {
  return videoPlayerTagNameRe.test(tagName);
}


/**
 * Applies layout to the element. Visible for testing only.
 *
 * \   \  /  \  /   / /   \     |   _  \     |  \ |  | |  | |  \ |  |  / _____|
 *  \   \/    \/   / /  ^  \    |  |_)  |    |   \|  | |  | |   \|  | |  |  __
 *   \            / /  /_\  \   |      /     |  . `  | |  | |  . `  | |  | |_ |
 *    \    /\    / /  _____  \  |  |\  \----.|  |\   | |  | |  |\   | |  |__| |
 *     \__/  \__/ /__/     \__\ | _| `._____||__| \__| |__| |__| \__|  \______|
 *
 * The equivalent of this method is used for server-side rendering (SSR) and
 * any changes made to it must be made in coordination with caches that
 * implement SSR. For more information on SSR see bit.ly/amp-ssr.
 *
 * @param {!Element} element
 * @return {!Layout}
 */
export function applyStaticLayout(element) {
  // Check if the layout has already been done by server-side rendering or
  // client-side rendering and the element was cloned. The document may be
  // visible to the user if the boilerplate was removed so please take care in
  // making changes here.
  const completedLayoutAttr = element.getAttribute('i-amphtml-layout');
  if (completedLayoutAttr) {
    const layout = /** @type {!Layout} */ (devAssert(
        parseLayout(completedLayoutAttr)));
    if ((layout == Layout.RESPONSIVE || layout == Layout.INTRINSIC)
      && element.firstElementChild) {
      // Find sizer, but assume that it might not have been parsed yet.
      element.sizerElement =
          element.querySelector('i-amphtml-sizer') || undefined;
    } else if (layout == Layout.NODISPLAY) {
      toggle(element, false);
      // TODO(jridgewell): Temporary hack while SSR still adds an inline
      // `display: none`
      element['style']['display'] = '';
    }
    return layout;
  }

  // If the layout was already done by server-side rendering (SSR), then the
  // code below will not run. Any changes below will necessitate a change to SSR
  // and must be coordinated with caches that implement SSR. See bit.ly/amp-ssr.

  // Parse layout from the element.
  const layoutAttr = element.getAttribute('layout');
  const widthAttr = element.getAttribute('width');
  const heightAttr = element.getAttribute('height');
  const sizesAttr = element.getAttribute('sizes');
  const heightsAttr = element.getAttribute('heights');

  // Input layout attributes.
  const inputLayout = layoutAttr ? parseLayout(layoutAttr) : null;
  userAssert(inputLayout !== undefined, 'Unknown layout: %s', layoutAttr);
  /** @const {string|null|undefined} */
  const inputWidth = (widthAttr && widthAttr != 'auto') ?
    parseLength(widthAttr) : widthAttr;
  userAssert(inputWidth !== undefined, 'Invalid width value: %s', widthAttr);
  /** @const {string|null|undefined} */
  const inputHeight = (heightAttr && heightAttr != 'fluid') ?
    parseLength(heightAttr) : heightAttr;
  userAssert(inputHeight !== undefined, 'Invalid height value: %s',
      heightAttr);

  // Effective layout attributes. These are effectively constants.
  let width;
  let height;
  let layout;

  // Calculate effective width and height.
  if ((!inputLayout || inputLayout == Layout.FIXED ||
      inputLayout == Layout.FIXED_HEIGHT) &&
      (!inputWidth || !inputHeight) && hasNaturalDimensions(element.tagName)) {
    // Default width and height: handle elements that do not specify a
    // width/height and are defined to have natural browser dimensions.
    const dimensions = getNaturalDimensions(element);
    width = (inputWidth || inputLayout == Layout.FIXED_HEIGHT) ? inputWidth :
      dimensions.width;
    height = inputHeight || dimensions.height;
  } else {
    width = inputWidth;
    height = inputHeight;
  }

  // Calculate effective layout.
  if (inputLayout) {
    layout = inputLayout;
  } else if (!width && !height) {
    layout = Layout.CONTAINER;
  } else if (height == 'fluid') {
    layout = Layout.FLUID;
  } else if (height && (!width || width == 'auto')) {
    layout = Layout.FIXED_HEIGHT;
  } else if (height && width && (sizesAttr || heightsAttr)) {
    layout = Layout.RESPONSIVE;
  } else {
    layout = Layout.FIXED;
  }

  // Verify layout attributes.
  if (layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT ||
      layout == Layout.RESPONSIVE || layout == Layout.INTRINSIC) {
    userAssert(height, 'Expected height to be available: %s', heightAttr);
  }
  if (layout == Layout.FIXED_HEIGHT) {
    userAssert(!width || width == 'auto',
        'Expected width to be either absent or equal "auto" ' +
        'for fixed-height layout: %s', widthAttr);
  }
  if (layout == Layout.FIXED || layout == Layout.RESPONSIVE ||
      layout == Layout.INTRINSIC) {
    userAssert(width && width != 'auto',
        'Expected width to be available and not equal to "auto": %s',
        widthAttr);
  }

  if (layout == Layout.RESPONSIVE || layout == Layout.INTRINSIC) {
    userAssert(getLengthUnits(width) == getLengthUnits(height),
        'Length units should be the same for width and height: %s, %s',
        widthAttr, heightAttr);
  } else {
    userAssert(heightsAttr === null,
        'Unexpected "heights" attribute for none-responsive layout');
  }

  // Apply UI.
  element.classList.add(getLayoutClass(layout));
  if (isLayoutSizeDefined(layout)) {
    element.classList.add('i-amphtml-layout-size-defined');
  }
  if (layout == Layout.NODISPLAY) {
    // CSS defines layout=nodisplay automatically with `display:none`. Thus
    // no additional styling is needed.
    toggle(element, false);
    // TODO(jridgewell): Temporary hack while SSR still adds an inline
    // `display: none`
    element['style']['display'] = '';
  } else if (layout == Layout.FIXED) {
    setStyles(element, {
      width: dev().assertString(width),
      height: dev().assertString(height),
    });
  } else if (layout == Layout.FIXED_HEIGHT) {
    setStyle(element, 'height', dev().assertString(height));
  } else if (layout == Layout.RESPONSIVE) {
    const sizer = element.ownerDocument.createElement('i-amphtml-sizer');
    setStyles(sizer, {
      paddingTop:
        ((getLengthNumeral(height) / getLengthNumeral(width)) * 100) + '%',
    });
    element.insertBefore(sizer, element.firstChild);
    element.sizerElement = sizer;
  } else if (layout == Layout.INTRINSIC) {
    // Intrinsic uses an svg inside the sizer element rather than the padding
    // trick Note a naked svg won't work becasue other thing expect the
    // i-amphtml-sizer element
    const sizer = htmlFor(element)`
      <i-amphtml-sizer class="i-amphtml-sizer">
        <img alt="" role="presentation" aria-hidden="true"
             class="i-amphtml-intrinsic-sizer" />
      </i-amphtml-sizer>`;
    const intrinsicSizer = sizer.firstElementChild;
    intrinsicSizer.setAttribute('src',
        `data:image/svg+xml;charset=utf-8,<svg height="${height}" width="${width}" xmlns="http://www.w3.org/2000/svg" version="1.1"/>`);
    element.insertBefore(sizer, element.firstChild);
    element.sizerElement = sizer;
  } else if (layout == Layout.FILL) {
    // Do nothing.
  } else if (layout == Layout.CONTAINER) {
    // Do nothing. Elements themselves will check whether the supplied
    // layout value is acceptable. In particular container is only OK
    // sometimes.
  } else if (layout == Layout.FLEX_ITEM) {
    // Set height and width to a flex item if they exist.
    // The size set to a flex item could be overridden by `display: flex` later.
    if (width) {
      setStyle(element, 'width', width);
    }
    if (height) {
      setStyle(element, 'height', height);
    }
  } else if (layout == Layout.FLUID) {
    element.classList.add('i-amphtml-layout-awaiting-size');
    if (width) {
      setStyle(element, 'width', width);
    }
    setStyle(element, 'height', 0);
  }
  // Mark the element as having completed static layout, in case it is cloned
  // in the future.
  element.setAttribute('i-amphtml-layout', layout);
  return layout;
}
