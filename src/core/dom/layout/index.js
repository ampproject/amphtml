/**
 * @fileoverview Implements element layout. See https://goo.gl/9avXuT for
 * details.
 */

import {userAssert} from '#core/assert';
import {isFiniteNumber} from '#core/types';
import {isEnumValue} from '#core/types/enum';

/**
 * @enum {string}
 */
export const Layout_Enum = {
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
export const LayoutPriority_Enum = {
  CONTENT: 0,
  METADATA: 1,
  ADS: 2,
  BACKGROUND: 3,
};

/**
 * CSS Length type. E.g. "1px" or "20vh".
 * @typedef {string} LengthDef;
 */

/**
 * @typedef {{
 *   width: string,
 *   height: string
 * }} DimensionsDef;
 */

/**
 * Elements that the progress can be shown for. This set has to be externalized
 * since the element's implementation may not be downloaded yet.
 * This list does not include video players which are found via regex later.
 * @enum {string}
 * @private Visible for testing only
 */
export const LOADING_ELEMENTS_ENUM = {
  AMP_AD: 'AMP-AD',
  AMP_ANIM: 'AMP-ANIM',
  AMP_EMBED: 'AMP-EMBED',
  AMP_FACEBOOK: 'AMP-FACEBOOK',
  AMP_FACEBOOK_COMMENTS: 'AMP-FACEBOOK-COMMENTS',
  AMP_FACEBOOK_PAGE: 'AMP-FACEBOOK-PAGE',
  AMP_GOOGLE_DOCUMENT_EMBED: 'AMP-GOOGLE-DOCUMENT-EMBED',
  AMP_IFRAME: 'AMP-IFRAME',
  AMP_IMG: 'AMP-IMG',
  AMP_INSTAGRAM: 'AMP-INSTAGRAM',
  AMP_LIST: 'AMP-LIST',
  AMP_PINTEREST: 'AMP-PINTEREST',
  AMP_PLAYBUZZ: 'AMP-PLAYBUZZ',
  AMP_RENDER: 'AMP-RENDER',
  AMP_TIKTOK: 'AMP-TIKTOK',
  AMP_TWITTER: 'AMP-TWITTER',
};
/**
 * All video player components must either have a) "video" or b) "player" in
 * their name. A few components don't follow this convention for historical
 * reasons, so they are listed individually.
 * @private @const {RegExp}
 */
const videoPlayerTagNameRe =
  /^amp\-(video|.+player)|AMP-BRIGHTCOVE|AMP-DAILYMOTION|AMP-YOUTUBE|AMP-VIMEO|AMP-IMA-VIDEO/i;

/**
 * @param {string} s
 * @return {Layout_Enum|undefined} Returns undefined in case of failure to parse
 *   the layout string.
 */
export function parseLayout(s) {
  if (isEnumValue(Layout_Enum, s)) {
    return /** @type {Layout_Enum} */ (s);
  }
  return undefined;
}

/**
 * @param {Layout_Enum} layout
 * @return {string}
 */
export function getLayoutClass(layout) {
  return 'i-amphtml-layout-' + layout;
}

/**
 * Whether an element with this layout inherently defines the size.
 * @param {Layout_Enum} layout
 * @return {boolean}
 */
export function isLayoutSizeDefined(layout) {
  return (
    layout == Layout_Enum.FIXED ||
    layout == Layout_Enum.FIXED_HEIGHT ||
    layout == Layout_Enum.RESPONSIVE ||
    layout == Layout_Enum.FILL ||
    layout == Layout_Enum.FLEX_ITEM ||
    layout == Layout_Enum.FLUID ||
    layout == Layout_Enum.INTRINSIC
  );
}

/**
 * Whether an element with this layout has a fixed dimension.
 * @param {Layout_Enum} layout
 * @return {boolean}
 */
export function isLayoutSizeFixed(layout) {
  return layout == Layout_Enum.FIXED || layout == Layout_Enum.FIXED_HEIGHT;
}

/**
 * Parses the CSS length value. If no units specified, the assumed value is
 * "px". Returns undefined in case of parsing error.
 * @param {string|undefined|null} s
 * @return {LengthDef|undefined}
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
 * @param {LengthDef|string|null|undefined} length
 * @return {LengthDef}
 * @closurePrimitive {asserts.matchesReturn}
 */
export function assertLength(length) {
  userAssert(
    /^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)$/.test(
      length ?? ''
    ),
    'Invalid length value: %s',
    length
  );
  return /** @type {LengthDef} */ (length);
}

/**
 * Asserts that the supplied value is a CSS Length value
 * (including percent unit).
 * @param {LengthDef|string} length
 * @return {LengthDef}
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
 * @param {LengthDef|string|null|undefined} length
 * @return {string}
 */
export function getLengthUnits(length) {
  assertLength(length);
  const m = /[a-z]+/i.exec(length ?? '');
  userAssert(m, 'Failed to read units from %s', length);
  return m[0];
}

/**
 * Returns the numeric value of a CSS length value.
 * @param {LengthDef|string|null|undefined|number} length
 * @return {number|undefined}
 */
export function getLengthNumeral(length) {
  // TS demands that we only pass a string to `parseFloat`, even though the spec
  // allows anything.
  const res = parseFloat(/** @type {?} */ (length));
  return isFiniteNumber(res) ? res : undefined;
}

/**
 * Whether the loading can be shown for the specified element. This set has
 * to be externalized since the element's implementation may not be
 * downloaded yet.
 * @param {Element} element
 * @return {boolean}
 */
export function isLoadingAllowed(element) {
  const tagName = element.tagName.toUpperCase();
  return (
    isEnumValue(LOADING_ELEMENTS_ENUM, tagName) ||
    isIframeVideoPlayerComponent(tagName)
  );
}

/**
 * All video player components must either have a) "video" or b) "player" in
 * their name. A few components don't follow this convention for historical
 * reasons, so they're present in the LOADING_ELEMENTS_ENUM allowlist.
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
 * @param {Element} element
 * @param {boolean=} opt_replacedContent
 */
export function applyFillContent(element, opt_replacedContent) {
  element.classList.add('i-amphtml-fill-content');
  if (opt_replacedContent) {
    element.classList.add('i-amphtml-replaced-content');
  }
}
