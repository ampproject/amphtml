var _templateObject;

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
import { devAssert, devAssertNumber, devAssertString, userAssert } from "./core/assert";
import { transparentPng } from "./core/dom/img";
import { Layout, getLayoutClass, getLengthNumeral, getLengthUnits, isLayoutSizeDefined, parseLayout, parseLength } from "./core/dom/layout";
import { htmlFor } from "./core/dom/static-template";
import { setStyle, setStyles, toggle } from "./core/dom/style";
import { toWin } from "./core/window";
import { isExperimentOn } from "./experiments";

/**
 * Whether aspect-ratio CSS can be used to implement responsive layouts.
 * @type {?boolean}
 */
var aspectRatioCssCache = null;

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
export var naturalDimensions_ = {
  'AMP-PIXEL': {
    width: '0px',
    height: '0px'
  },
  'AMP-ANALYTICS': {
    width: '1px',
    height: '1px'
  },
  // TODO(dvoytenko): audio should have width:auto.
  'AMP-AUDIO': null,
  'AMP-SOCIAL-SHARE': {
    width: '60px',
    height: '44px'
  }
};

/** @visibleForTesting */
export function resetShouldUseAspectRatioCssForTesting() {
  aspectRatioCssCache = null;
}

/**
 * Whether aspect-ratio CSS can be used to implement responsive layouts.
 *
 * @param {!Window} win
 * @return {boolean}
 */
function shouldUseAspectRatioCss(win) {
  if (aspectRatioCssCache == null) {
    aspectRatioCssCache = isExperimentOn(win, 'layout-aspect-ratio-css') && win.CSS && win.CSS.supports && win.CSS.supports('aspect-ratio: 1/1') || false;
  }

  return aspectRatioCssCache;
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
 * This operation can only be completed for an element allowlisted by
 * `hasNaturalDimensions`.
 * @param {!Element} element
 * @return {DimensionsDef}
 */
export function getNaturalDimensions(element) {
  var tagName = element.tagName.toUpperCase();
  devAssert(naturalDimensions_[tagName] !== undefined);

  if (!naturalDimensions_[tagName]) {
    var doc = element.ownerDocument;
    var naturalTagName = tagName.replace(/^AMP\-/, '');
    var temp = doc.createElement(naturalTagName);
    // For audio, should no-op elsewhere.
    temp.controls = true;
    setStyles(temp, {
      position: 'absolute',
      visibility: 'hidden'
    });
    doc.body.appendChild(temp);
    naturalDimensions_[tagName] = {
      width: (temp.
      /*OK*/
      offsetWidth || 1) + 'px',
      height: (temp.
      /*OK*/
      offsetHeight || 1) + 'px'
    };
    doc.body.removeChild(temp);
  }

  return (
    /** @type {DimensionsDef} */
    naturalDimensions_[tagName]
  );
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
 * @param {boolean} fixIeIntrinsic
 * @return {!Layout}
 */
export function applyStaticLayout(element, fixIeIntrinsic) {
  if (fixIeIntrinsic === void 0) {
    fixIeIntrinsic = false;
  }

  // Check if the layout has already been done by server-side rendering or
  // client-side rendering and the element was cloned. The document may be
  // visible to the user if the boilerplate was removed so please take care in
  // making changes here.
  var completedLayoutAttr = element.getAttribute('i-amphtml-layout');

  if (completedLayoutAttr) {
    var _layout =
    /** @type {!Layout} */
    devAssert(parseLayout(completedLayoutAttr));

    if ((_layout == Layout.RESPONSIVE || _layout == Layout.INTRINSIC) && element.firstElementChild) {
      // Find sizer, but assume that it might not have been parsed yet.
      element.sizerElement = element.querySelector('i-amphtml-sizer') || undefined;

      if (element.sizerElement) {
        element.sizerElement.setAttribute('slot', 'i-amphtml-svc');
      }
    } else if (_layout == Layout.NODISPLAY) {
      toggle(element, false);
      // TODO(jridgewell): Temporary hack while SSR still adds an inline
      // `display: none`
      element['style']['display'] = '';
    }

    return _layout;
  }

  // If the layout was already done by server-side rendering (SSR), then the
  // code below will not run. Any changes below will necessitate a change to SSR
  // and must be coordinated with caches that implement SSR. See bit.ly/amp-ssr.
  var _getEffectiveLayoutIn = getEffectiveLayoutInternal(element),
      height = _getEffectiveLayoutIn.height,
      layout = _getEffectiveLayoutIn.layout,
      width = _getEffectiveLayoutIn.width;

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
      width: devAssertString(width),
      height: devAssertString(height)
    });
  } else if (layout == Layout.FIXED_HEIGHT) {
    setStyle(element, 'height', devAssertString(height));
  } else if (layout == Layout.RESPONSIVE) {
    if (shouldUseAspectRatioCss(toWin(element.ownerDocument.defaultView))) {
      setStyle(element, 'aspect-ratio', getLengthNumeral(width) + "/" + getLengthNumeral(height));
    } else {
      var sizer = element.ownerDocument.createElement('i-amphtml-sizer');
      sizer.setAttribute('slot', 'i-amphtml-svc');
      setStyles(sizer, {
        paddingTop: getLengthNumeral(height) / getLengthNumeral(width) * 100 + '%'
      });
      element.insertBefore(sizer, element.firstChild);
      element.sizerElement = sizer;
    }
  } else if (layout == Layout.INTRINSIC) {
    // Intrinsic uses an svg inside the sizer element rather than the padding
    // trick Note a naked svg won't work becasue other thing expect the
    // i-amphtml-sizer element
    var _sizer = htmlFor(element)(_templateObject || (_templateObject = _taggedTemplateLiteralLoose(["\n      <i-amphtml-sizer class=\"i-amphtml-sizer\" slot=\"i-amphtml-svc\">\n        <img alt=\"\" role=\"presentation\" aria-hidden=\"true\"\n             class=\"i-amphtml-intrinsic-sizer\" />\n      </i-amphtml-sizer>"])));

    var intrinsicSizer = _sizer.firstElementChild;
    intrinsicSizer.setAttribute('src', !false && fixIeIntrinsic && element.ownerDocument ? transparentPng(element.ownerDocument, devAssertNumber(getLengthNumeral(width)), devAssertNumber(getLengthNumeral(height))) : "data:image/svg+xml;charset=utf-8,<svg height=\"" + height + "\" width=\"" + width + "\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\"/>");
    element.insertBefore(_sizer, element.firstChild);
    element.sizerElement = _sizer;
  } else if (layout == Layout.FILL) {// Do nothing.
  } else if (layout == Layout.CONTAINER) {// Do nothing. Elements themselves will check whether the supplied
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

/**
 * Gets the effective layout for an element.
 *
 * @param {!Element} element
 * @return {!Layout}
 */
export function getEffectiveLayout(element) {
  // Return the pre-existing value if layout has already been applied.
  var completedLayoutAttr = element.getAttribute('i-amphtml-layout');

  if (completedLayoutAttr) {
    return parseLayout(completedLayoutAttr);
  }

  return getEffectiveLayoutInternal(element).layout;
}

/**
 * @typedef {
 *   {layout: !Layout, height: number, width: number} | {layout: !Layout}
 * } InternalEffectiveLayout
 */

/**
 * Gets the effective layout for an element.
 *
 * If class 'i-amphtml-layout' is present, then directly use its value.
 * Else calculate layout based on element attributes and return the width/height.
 *
 * @param {!Element} element
 * @return {InternalEffectiveLayout}
 */
function getEffectiveLayoutInternal(element) {
  // Parse layout from the element.
  var layoutAttr = element.getAttribute('layout');
  var widthAttr = element.getAttribute('width');
  var heightAttr = element.getAttribute('height');
  var sizesAttr = element.getAttribute('sizes');
  var heightsAttr = element.getAttribute('heights');
  // Input layout attributes.
  var inputLayout = layoutAttr ? parseLayout(layoutAttr) : null;
  userAssert(inputLayout !== undefined, 'Invalid "layout" value: %s, %s', layoutAttr, element);

  /** @const {string|null|undefined} */
  var inputWidth = widthAttr && widthAttr != 'auto' ? parseLength(widthAttr) : widthAttr;
  userAssert(inputWidth !== undefined, 'Invalid "width" value: %s, %s', widthAttr, element);

  /** @const {string|null|undefined} */
  var inputHeight = heightAttr && heightAttr != 'fluid' ? parseLength(heightAttr) : heightAttr;
  userAssert(inputHeight !== undefined, 'Invalid "height" value: %s, %s', heightAttr, element);
  // Effective layout attributes. These are effectively constants.
  var width;
  var height;
  var layout;

  // Calculate effective width and height.
  if ((!inputLayout || inputLayout == Layout.FIXED || inputLayout == Layout.FIXED_HEIGHT) && (!inputWidth || !inputHeight) && hasNaturalDimensions(element.tagName)) {
    // Default width and height: handle elements that do not specify a
    // width/height and are defined to have natural browser dimensions.
    var dimensions = getNaturalDimensions(element);
    width = inputWidth || inputLayout == Layout.FIXED_HEIGHT ? inputWidth : dimensions.width;
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

  if (layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT || layout == Layout.RESPONSIVE || layout == Layout.INTRINSIC) {
    userAssert(height, 'The "height" attribute is missing: %s', element);
  }

  if (layout == Layout.FIXED_HEIGHT) {
    userAssert(!width || width == 'auto', 'The "width" attribute must be missing or "auto": %s', element);
  }

  if (layout == Layout.FIXED || layout == Layout.RESPONSIVE || layout == Layout.INTRINSIC) {
    userAssert(width && width != 'auto', 'The "width" attribute must be present and not "auto": %s', element);
  }

  if (layout == Layout.RESPONSIVE || layout == Layout.INTRINSIC) {
    userAssert(getLengthUnits(width) == getLengthUnits(height), 'Length units should be the same for "width" and "height": %s, %s, %s', widthAttr, heightAttr, element);
  } else {
    userAssert(heightsAttr === null, '"heights" attribute must be missing: %s', element);
  }

  return {
    layout: layout,
    width: width,
    height: height
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0YXRpYy1sYXlvdXQuanMiXSwibmFtZXMiOlsiZGV2QXNzZXJ0IiwiZGV2QXNzZXJ0TnVtYmVyIiwiZGV2QXNzZXJ0U3RyaW5nIiwidXNlckFzc2VydCIsInRyYW5zcGFyZW50UG5nIiwiTGF5b3V0IiwiZ2V0TGF5b3V0Q2xhc3MiLCJnZXRMZW5ndGhOdW1lcmFsIiwiZ2V0TGVuZ3RoVW5pdHMiLCJpc0xheW91dFNpemVEZWZpbmVkIiwicGFyc2VMYXlvdXQiLCJwYXJzZUxlbmd0aCIsImh0bWxGb3IiLCJzZXRTdHlsZSIsInNldFN0eWxlcyIsInRvZ2dsZSIsInRvV2luIiwiaXNFeHBlcmltZW50T24iLCJhc3BlY3RSYXRpb0Nzc0NhY2hlIiwibmF0dXJhbERpbWVuc2lvbnNfIiwid2lkdGgiLCJoZWlnaHQiLCJyZXNldFNob3VsZFVzZUFzcGVjdFJhdGlvQ3NzRm9yVGVzdGluZyIsInNob3VsZFVzZUFzcGVjdFJhdGlvQ3NzIiwid2luIiwiQ1NTIiwic3VwcG9ydHMiLCJoYXNOYXR1cmFsRGltZW5zaW9ucyIsInRhZ05hbWUiLCJ0b1VwcGVyQ2FzZSIsInVuZGVmaW5lZCIsImdldE5hdHVyYWxEaW1lbnNpb25zIiwiZWxlbWVudCIsImRvYyIsIm93bmVyRG9jdW1lbnQiLCJuYXR1cmFsVGFnTmFtZSIsInJlcGxhY2UiLCJ0ZW1wIiwiY3JlYXRlRWxlbWVudCIsImNvbnRyb2xzIiwicG9zaXRpb24iLCJ2aXNpYmlsaXR5IiwiYm9keSIsImFwcGVuZENoaWxkIiwib2Zmc2V0V2lkdGgiLCJvZmZzZXRIZWlnaHQiLCJyZW1vdmVDaGlsZCIsImFwcGx5U3RhdGljTGF5b3V0IiwiZml4SWVJbnRyaW5zaWMiLCJjb21wbGV0ZWRMYXlvdXRBdHRyIiwiZ2V0QXR0cmlidXRlIiwibGF5b3V0IiwiUkVTUE9OU0lWRSIsIklOVFJJTlNJQyIsImZpcnN0RWxlbWVudENoaWxkIiwic2l6ZXJFbGVtZW50IiwicXVlcnlTZWxlY3RvciIsInNldEF0dHJpYnV0ZSIsIk5PRElTUExBWSIsImdldEVmZmVjdGl2ZUxheW91dEludGVybmFsIiwiY2xhc3NMaXN0IiwiYWRkIiwiRklYRUQiLCJGSVhFRF9IRUlHSFQiLCJkZWZhdWx0VmlldyIsInNpemVyIiwicGFkZGluZ1RvcCIsImluc2VydEJlZm9yZSIsImZpcnN0Q2hpbGQiLCJpbnRyaW5zaWNTaXplciIsIkZJTEwiLCJDT05UQUlORVIiLCJGTEVYX0lURU0iLCJGTFVJRCIsImdldEVmZmVjdGl2ZUxheW91dCIsImxheW91dEF0dHIiLCJ3aWR0aEF0dHIiLCJoZWlnaHRBdHRyIiwic2l6ZXNBdHRyIiwiaGVpZ2h0c0F0dHIiLCJpbnB1dExheW91dCIsImlucHV0V2lkdGgiLCJpbnB1dEhlaWdodCIsImRpbWVuc2lvbnMiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUNFQSxTQURGLEVBRUVDLGVBRkYsRUFHRUMsZUFIRixFQUlFQyxVQUpGO0FBTUEsU0FBUUMsY0FBUjtBQUNBLFNBQ0VDLE1BREYsRUFFRUMsY0FGRixFQUdFQyxnQkFIRixFQUlFQyxjQUpGLEVBS0VDLG1CQUxGLEVBTUVDLFdBTkYsRUFPRUMsV0FQRjtBQVNBLFNBQVFDLE9BQVI7QUFDQSxTQUFRQyxRQUFSLEVBQWtCQyxTQUFsQixFQUE2QkMsTUFBN0I7QUFDQSxTQUFRQyxLQUFSO0FBQ0EsU0FBUUMsY0FBUjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlDLG1CQUFtQixHQUFHLElBQTFCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyxrQkFBa0IsR0FBRztBQUNoQyxlQUFhO0FBQUNDLElBQUFBLEtBQUssRUFBRSxLQUFSO0FBQWVDLElBQUFBLE1BQU0sRUFBRTtBQUF2QixHQURtQjtBQUVoQyxtQkFBaUI7QUFBQ0QsSUFBQUEsS0FBSyxFQUFFLEtBQVI7QUFBZUMsSUFBQUEsTUFBTSxFQUFFO0FBQXZCLEdBRmU7QUFHaEM7QUFDQSxlQUFhLElBSm1CO0FBS2hDLHNCQUFvQjtBQUFDRCxJQUFBQSxLQUFLLEVBQUUsTUFBUjtBQUFnQkMsSUFBQUEsTUFBTSxFQUFFO0FBQXhCO0FBTFksQ0FBM0I7O0FBUVA7QUFDQSxPQUFPLFNBQVNDLHNDQUFULEdBQWtEO0FBQ3ZESixFQUFBQSxtQkFBbUIsR0FBRyxJQUF0QjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNLLHVCQUFULENBQWlDQyxHQUFqQyxFQUFzQztBQUNwQyxNQUFJTixtQkFBbUIsSUFBSSxJQUEzQixFQUFpQztBQUMvQkEsSUFBQUEsbUJBQW1CLEdBQ2hCRCxjQUFjLENBQUNPLEdBQUQsRUFBTSx5QkFBTixDQUFkLElBQ0NBLEdBQUcsQ0FBQ0MsR0FETCxJQUVDRCxHQUFHLENBQUNDLEdBQUosQ0FBUUMsUUFGVCxJQUdDRixHQUFHLENBQUNDLEdBQUosQ0FBUUMsUUFBUixDQUFpQixtQkFBakIsQ0FIRixJQUlBLEtBTEY7QUFNRDs7QUFDRCxTQUFPUixtQkFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU1Msb0JBQVQsQ0FBOEJDLE9BQTlCLEVBQXVDO0FBQzVDQSxFQUFBQSxPQUFPLEdBQUdBLE9BQU8sQ0FBQ0MsV0FBUixFQUFWO0FBQ0EsU0FBT1Ysa0JBQWtCLENBQUNTLE9BQUQsQ0FBbEIsS0FBZ0NFLFNBQXZDO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0Msb0JBQVQsQ0FBOEJDLE9BQTlCLEVBQXVDO0FBQzVDLE1BQU1KLE9BQU8sR0FBR0ksT0FBTyxDQUFDSixPQUFSLENBQWdCQyxXQUFoQixFQUFoQjtBQUNBN0IsRUFBQUEsU0FBUyxDQUFDbUIsa0JBQWtCLENBQUNTLE9BQUQsQ0FBbEIsS0FBZ0NFLFNBQWpDLENBQVQ7O0FBQ0EsTUFBSSxDQUFDWCxrQkFBa0IsQ0FBQ1MsT0FBRCxDQUF2QixFQUFrQztBQUNoQyxRQUFNSyxHQUFHLEdBQUdELE9BQU8sQ0FBQ0UsYUFBcEI7QUFDQSxRQUFNQyxjQUFjLEdBQUdQLE9BQU8sQ0FBQ1EsT0FBUixDQUFnQixRQUFoQixFQUEwQixFQUExQixDQUF2QjtBQUNBLFFBQU1DLElBQUksR0FBR0osR0FBRyxDQUFDSyxhQUFKLENBQWtCSCxjQUFsQixDQUFiO0FBQ0E7QUFDQUUsSUFBQUEsSUFBSSxDQUFDRSxRQUFMLEdBQWdCLElBQWhCO0FBQ0F6QixJQUFBQSxTQUFTLENBQUN1QixJQUFELEVBQU87QUFDZEcsTUFBQUEsUUFBUSxFQUFFLFVBREk7QUFFZEMsTUFBQUEsVUFBVSxFQUFFO0FBRkUsS0FBUCxDQUFUO0FBSUFSLElBQUFBLEdBQUcsQ0FBQ1MsSUFBSixDQUFTQyxXQUFULENBQXFCTixJQUFyQjtBQUNBbEIsSUFBQUEsa0JBQWtCLENBQUNTLE9BQUQsQ0FBbEIsR0FBOEI7QUFDNUJSLE1BQUFBLEtBQUssRUFBRSxDQUFDaUIsSUFBSTtBQUFDO0FBQU9PLE1BQUFBLFdBQVosSUFBMkIsQ0FBNUIsSUFBaUMsSUFEWjtBQUU1QnZCLE1BQUFBLE1BQU0sRUFBRSxDQUFDZ0IsSUFBSTtBQUFDO0FBQU9RLE1BQUFBLFlBQVosSUFBNEIsQ0FBN0IsSUFBa0M7QUFGZCxLQUE5QjtBQUlBWixJQUFBQSxHQUFHLENBQUNTLElBQUosQ0FBU0ksV0FBVCxDQUFxQlQsSUFBckI7QUFDRDs7QUFDRDtBQUFPO0FBQThCbEIsSUFBQUEsa0JBQWtCLENBQUNTLE9BQUQ7QUFBdkQ7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxTQUFTbUIsaUJBQVQsQ0FBMkJmLE9BQTNCLEVBQW9DZ0IsY0FBcEMsRUFBNEQ7QUFBQSxNQUF4QkEsY0FBd0I7QUFBeEJBLElBQUFBLGNBQXdCLEdBQVAsS0FBTztBQUFBOztBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLG1CQUFtQixHQUFHakIsT0FBTyxDQUFDa0IsWUFBUixDQUFxQixrQkFBckIsQ0FBNUI7O0FBQ0EsTUFBSUQsbUJBQUosRUFBeUI7QUFDdkIsUUFBTUUsT0FBTTtBQUFHO0FBQ2JuRCxJQUFBQSxTQUFTLENBQUNVLFdBQVcsQ0FBQ3VDLG1CQUFELENBQVosQ0FEWDs7QUFHQSxRQUNFLENBQUNFLE9BQU0sSUFBSTlDLE1BQU0sQ0FBQytDLFVBQWpCLElBQStCRCxPQUFNLElBQUk5QyxNQUFNLENBQUNnRCxTQUFqRCxLQUNBckIsT0FBTyxDQUFDc0IsaUJBRlYsRUFHRTtBQUNBO0FBQ0F0QixNQUFBQSxPQUFPLENBQUN1QixZQUFSLEdBQ0V2QixPQUFPLENBQUN3QixhQUFSLENBQXNCLGlCQUF0QixLQUE0QzFCLFNBRDlDOztBQUVBLFVBQUlFLE9BQU8sQ0FBQ3VCLFlBQVosRUFBMEI7QUFDeEJ2QixRQUFBQSxPQUFPLENBQUN1QixZQUFSLENBQXFCRSxZQUFyQixDQUFrQyxNQUFsQyxFQUEwQyxlQUExQztBQUNEO0FBQ0YsS0FWRCxNQVVPLElBQUlOLE9BQU0sSUFBSTlDLE1BQU0sQ0FBQ3FELFNBQXJCLEVBQWdDO0FBQ3JDM0MsTUFBQUEsTUFBTSxDQUFDaUIsT0FBRCxFQUFVLEtBQVYsQ0FBTjtBQUNBO0FBQ0E7QUFDQUEsTUFBQUEsT0FBTyxDQUFDLE9BQUQsQ0FBUCxDQUFpQixTQUFqQixJQUE4QixFQUE5QjtBQUNEOztBQUNELFdBQU9tQixPQUFQO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsOEJBQWdDUSwwQkFBMEIsQ0FBQzNCLE9BQUQsQ0FBMUQ7QUFBQSxNQUFPWCxNQUFQLHlCQUFPQSxNQUFQO0FBQUEsTUFBZThCLE1BQWYseUJBQWVBLE1BQWY7QUFBQSxNQUF1Qi9CLEtBQXZCLHlCQUF1QkEsS0FBdkI7O0FBRUE7QUFDQVksRUFBQUEsT0FBTyxDQUFDNEIsU0FBUixDQUFrQkMsR0FBbEIsQ0FBc0J2RCxjQUFjLENBQUM2QyxNQUFELENBQXBDOztBQUNBLE1BQUkxQyxtQkFBbUIsQ0FBQzBDLE1BQUQsQ0FBdkIsRUFBaUM7QUFDL0JuQixJQUFBQSxPQUFPLENBQUM0QixTQUFSLENBQWtCQyxHQUFsQixDQUFzQiwrQkFBdEI7QUFDRDs7QUFDRCxNQUFJVixNQUFNLElBQUk5QyxNQUFNLENBQUNxRCxTQUFyQixFQUFnQztBQUM5QjtBQUNBO0FBQ0EzQyxJQUFBQSxNQUFNLENBQUNpQixPQUFELEVBQVUsS0FBVixDQUFOO0FBQ0E7QUFDQTtBQUNBQSxJQUFBQSxPQUFPLENBQUMsT0FBRCxDQUFQLENBQWlCLFNBQWpCLElBQThCLEVBQTlCO0FBQ0QsR0FQRCxNQU9PLElBQUltQixNQUFNLElBQUk5QyxNQUFNLENBQUN5RCxLQUFyQixFQUE0QjtBQUNqQ2hELElBQUFBLFNBQVMsQ0FBQ2tCLE9BQUQsRUFBVTtBQUNqQlosTUFBQUEsS0FBSyxFQUFFbEIsZUFBZSxDQUFDa0IsS0FBRCxDQURMO0FBRWpCQyxNQUFBQSxNQUFNLEVBQUVuQixlQUFlLENBQUNtQixNQUFEO0FBRk4sS0FBVixDQUFUO0FBSUQsR0FMTSxNQUtBLElBQUk4QixNQUFNLElBQUk5QyxNQUFNLENBQUMwRCxZQUFyQixFQUFtQztBQUN4Q2xELElBQUFBLFFBQVEsQ0FBQ21CLE9BQUQsRUFBVSxRQUFWLEVBQW9COUIsZUFBZSxDQUFDbUIsTUFBRCxDQUFuQyxDQUFSO0FBQ0QsR0FGTSxNQUVBLElBQUk4QixNQUFNLElBQUk5QyxNQUFNLENBQUMrQyxVQUFyQixFQUFpQztBQUN0QyxRQUFJN0IsdUJBQXVCLENBQUNQLEtBQUssQ0FBQ2dCLE9BQU8sQ0FBQ0UsYUFBUixDQUFzQjhCLFdBQXZCLENBQU4sQ0FBM0IsRUFBdUU7QUFDckVuRCxNQUFBQSxRQUFRLENBQ05tQixPQURNLEVBRU4sY0FGTSxFQUdIekIsZ0JBQWdCLENBQUNhLEtBQUQsQ0FIYixTQUd3QmIsZ0JBQWdCLENBQUNjLE1BQUQsQ0FIeEMsQ0FBUjtBQUtELEtBTkQsTUFNTztBQUNMLFVBQU00QyxLQUFLLEdBQUdqQyxPQUFPLENBQUNFLGFBQVIsQ0FBc0JJLGFBQXRCLENBQW9DLGlCQUFwQyxDQUFkO0FBQ0EyQixNQUFBQSxLQUFLLENBQUNSLFlBQU4sQ0FBbUIsTUFBbkIsRUFBMkIsZUFBM0I7QUFDQTNDLE1BQUFBLFNBQVMsQ0FBQ21ELEtBQUQsRUFBUTtBQUNmQyxRQUFBQSxVQUFVLEVBQ1AzRCxnQkFBZ0IsQ0FBQ2MsTUFBRCxDQUFoQixHQUEyQmQsZ0JBQWdCLENBQUNhLEtBQUQsQ0FBNUMsR0FBdUQsR0FBdkQsR0FBNkQ7QUFGaEQsT0FBUixDQUFUO0FBSUFZLE1BQUFBLE9BQU8sQ0FBQ21DLFlBQVIsQ0FBcUJGLEtBQXJCLEVBQTRCakMsT0FBTyxDQUFDb0MsVUFBcEM7QUFDQXBDLE1BQUFBLE9BQU8sQ0FBQ3VCLFlBQVIsR0FBdUJVLEtBQXZCO0FBQ0Q7QUFDRixHQWpCTSxNQWlCQSxJQUFJZCxNQUFNLElBQUk5QyxNQUFNLENBQUNnRCxTQUFyQixFQUFnQztBQUNyQztBQUNBO0FBQ0E7QUFDQSxRQUFNWSxNQUFLLEdBQUdyRCxPQUFPLENBQUNvQixPQUFELENBQVYscVNBQVg7O0FBS0EsUUFBTXFDLGNBQWMsR0FBR0osTUFBSyxDQUFDWCxpQkFBN0I7QUFDQWUsSUFBQUEsY0FBYyxDQUFDWixZQUFmLENBQ0UsS0FERixFQUVFLFVBQVdULGNBQVgsSUFBNkJoQixPQUFPLENBQUNFLGFBQXJDLEdBQ0k5QixjQUFjLENBQ1o0QixPQUFPLENBQUNFLGFBREksRUFFWmpDLGVBQWUsQ0FBQ00sZ0JBQWdCLENBQUNhLEtBQUQsQ0FBakIsQ0FGSCxFQUdabkIsZUFBZSxDQUFDTSxnQkFBZ0IsQ0FBQ2MsTUFBRCxDQUFqQixDQUhILENBRGxCLHVEQU1xREEsTUFOckQsbUJBTXVFRCxLQU52RSw4REFGRjtBQVVBWSxJQUFBQSxPQUFPLENBQUNtQyxZQUFSLENBQXFCRixNQUFyQixFQUE0QmpDLE9BQU8sQ0FBQ29DLFVBQXBDO0FBQ0FwQyxJQUFBQSxPQUFPLENBQUN1QixZQUFSLEdBQXVCVSxNQUF2QjtBQUNELEdBdEJNLE1Bc0JBLElBQUlkLE1BQU0sSUFBSTlDLE1BQU0sQ0FBQ2lFLElBQXJCLEVBQTJCLENBQ2hDO0FBQ0QsR0FGTSxNQUVBLElBQUluQixNQUFNLElBQUk5QyxNQUFNLENBQUNrRSxTQUFyQixFQUFnQyxDQUNyQztBQUNBO0FBQ0E7QUFDRCxHQUpNLE1BSUEsSUFBSXBCLE1BQU0sSUFBSTlDLE1BQU0sQ0FBQ21FLFNBQXJCLEVBQWdDO0FBQ3JDO0FBQ0E7QUFDQSxRQUFJcEQsS0FBSixFQUFXO0FBQ1RQLE1BQUFBLFFBQVEsQ0FBQ21CLE9BQUQsRUFBVSxPQUFWLEVBQW1CWixLQUFuQixDQUFSO0FBQ0Q7O0FBQ0QsUUFBSUMsTUFBSixFQUFZO0FBQ1ZSLE1BQUFBLFFBQVEsQ0FBQ21CLE9BQUQsRUFBVSxRQUFWLEVBQW9CWCxNQUFwQixDQUFSO0FBQ0Q7QUFDRixHQVRNLE1BU0EsSUFBSThCLE1BQU0sSUFBSTlDLE1BQU0sQ0FBQ29FLEtBQXJCLEVBQTRCO0FBQ2pDekMsSUFBQUEsT0FBTyxDQUFDNEIsU0FBUixDQUFrQkMsR0FBbEIsQ0FBc0IsZ0NBQXRCOztBQUNBLFFBQUl6QyxLQUFKLEVBQVc7QUFDVFAsTUFBQUEsUUFBUSxDQUFDbUIsT0FBRCxFQUFVLE9BQVYsRUFBbUJaLEtBQW5CLENBQVI7QUFDRDs7QUFDRFAsSUFBQUEsUUFBUSxDQUFDbUIsT0FBRCxFQUFVLFFBQVYsRUFBb0IsQ0FBcEIsQ0FBUjtBQUNEOztBQUNEO0FBQ0E7QUFDQUEsRUFBQUEsT0FBTyxDQUFDeUIsWUFBUixDQUFxQixrQkFBckIsRUFBeUNOLE1BQXpDO0FBQ0EsU0FBT0EsTUFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU3VCLGtCQUFULENBQTRCMUMsT0FBNUIsRUFBcUM7QUFDMUM7QUFDQSxNQUFNaUIsbUJBQW1CLEdBQUdqQixPQUFPLENBQUNrQixZQUFSLENBQXFCLGtCQUFyQixDQUE1Qjs7QUFDQSxNQUFJRCxtQkFBSixFQUF5QjtBQUN2QixXQUFPdkMsV0FBVyxDQUFDdUMsbUJBQUQsQ0FBbEI7QUFDRDs7QUFFRCxTQUFPVSwwQkFBMEIsQ0FBQzNCLE9BQUQsQ0FBMUIsQ0FBb0NtQixNQUEzQztBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU1EsMEJBQVQsQ0FBb0MzQixPQUFwQyxFQUE2QztBQUMzQztBQUNBLE1BQU0yQyxVQUFVLEdBQUczQyxPQUFPLENBQUNrQixZQUFSLENBQXFCLFFBQXJCLENBQW5CO0FBQ0EsTUFBTTBCLFNBQVMsR0FBRzVDLE9BQU8sQ0FBQ2tCLFlBQVIsQ0FBcUIsT0FBckIsQ0FBbEI7QUFDQSxNQUFNMkIsVUFBVSxHQUFHN0MsT0FBTyxDQUFDa0IsWUFBUixDQUFxQixRQUFyQixDQUFuQjtBQUNBLE1BQU00QixTQUFTLEdBQUc5QyxPQUFPLENBQUNrQixZQUFSLENBQXFCLE9BQXJCLENBQWxCO0FBQ0EsTUFBTTZCLFdBQVcsR0FBRy9DLE9BQU8sQ0FBQ2tCLFlBQVIsQ0FBcUIsU0FBckIsQ0FBcEI7QUFFQTtBQUNBLE1BQU04QixXQUFXLEdBQUdMLFVBQVUsR0FBR2pFLFdBQVcsQ0FBQ2lFLFVBQUQsQ0FBZCxHQUE2QixJQUEzRDtBQUNBeEUsRUFBQUEsVUFBVSxDQUNSNkUsV0FBVyxLQUFLbEQsU0FEUixFQUVSLGdDQUZRLEVBR1I2QyxVQUhRLEVBSVIzQyxPQUpRLENBQVY7O0FBTUE7QUFDQSxNQUFNaUQsVUFBVSxHQUNkTCxTQUFTLElBQUlBLFNBQVMsSUFBSSxNQUExQixHQUFtQ2pFLFdBQVcsQ0FBQ2lFLFNBQUQsQ0FBOUMsR0FBNERBLFNBRDlEO0FBRUF6RSxFQUFBQSxVQUFVLENBQ1I4RSxVQUFVLEtBQUtuRCxTQURQLEVBRVIsK0JBRlEsRUFHUjhDLFNBSFEsRUFJUjVDLE9BSlEsQ0FBVjs7QUFNQTtBQUNBLE1BQU1rRCxXQUFXLEdBQ2ZMLFVBQVUsSUFBSUEsVUFBVSxJQUFJLE9BQTVCLEdBQXNDbEUsV0FBVyxDQUFDa0UsVUFBRCxDQUFqRCxHQUFnRUEsVUFEbEU7QUFFQTFFLEVBQUFBLFVBQVUsQ0FDUitFLFdBQVcsS0FBS3BELFNBRFIsRUFFUixnQ0FGUSxFQUdSK0MsVUFIUSxFQUlSN0MsT0FKUSxDQUFWO0FBT0E7QUFDQSxNQUFJWixLQUFKO0FBQ0EsTUFBSUMsTUFBSjtBQUNBLE1BQUk4QixNQUFKOztBQUVBO0FBQ0EsTUFDRSxDQUFDLENBQUM2QixXQUFELElBQ0NBLFdBQVcsSUFBSTNFLE1BQU0sQ0FBQ3lELEtBRHZCLElBRUNrQixXQUFXLElBQUkzRSxNQUFNLENBQUMwRCxZQUZ4QixNQUdDLENBQUNrQixVQUFELElBQWUsQ0FBQ0MsV0FIakIsS0FJQXZELG9CQUFvQixDQUFDSyxPQUFPLENBQUNKLE9BQVQsQ0FMdEIsRUFNRTtBQUNBO0FBQ0E7QUFDQSxRQUFNdUQsVUFBVSxHQUFHcEQsb0JBQW9CLENBQUNDLE9BQUQsQ0FBdkM7QUFDQVosSUFBQUEsS0FBSyxHQUNINkQsVUFBVSxJQUFJRCxXQUFXLElBQUkzRSxNQUFNLENBQUMwRCxZQUFwQyxHQUNJa0IsVUFESixHQUVJRSxVQUFVLENBQUMvRCxLQUhqQjtBQUlBQyxJQUFBQSxNQUFNLEdBQUc2RCxXQUFXLElBQUlDLFVBQVUsQ0FBQzlELE1BQW5DO0FBQ0QsR0FmRCxNQWVPO0FBQ0xELElBQUFBLEtBQUssR0FBRzZELFVBQVI7QUFDQTVELElBQUFBLE1BQU0sR0FBRzZELFdBQVQ7QUFDRDs7QUFFRDtBQUNBLE1BQUlGLFdBQUosRUFBaUI7QUFDZjdCLElBQUFBLE1BQU0sR0FBRzZCLFdBQVQ7QUFDRCxHQUZELE1BRU8sSUFBSSxDQUFDNUQsS0FBRCxJQUFVLENBQUNDLE1BQWYsRUFBdUI7QUFDNUI4QixJQUFBQSxNQUFNLEdBQUc5QyxNQUFNLENBQUNrRSxTQUFoQjtBQUNELEdBRk0sTUFFQSxJQUFJbEQsTUFBTSxJQUFJLE9BQWQsRUFBdUI7QUFDNUI4QixJQUFBQSxNQUFNLEdBQUc5QyxNQUFNLENBQUNvRSxLQUFoQjtBQUNELEdBRk0sTUFFQSxJQUFJcEQsTUFBTSxLQUFLLENBQUNELEtBQUQsSUFBVUEsS0FBSyxJQUFJLE1BQXhCLENBQVYsRUFBMkM7QUFDaEQrQixJQUFBQSxNQUFNLEdBQUc5QyxNQUFNLENBQUMwRCxZQUFoQjtBQUNELEdBRk0sTUFFQSxJQUFJMUMsTUFBTSxJQUFJRCxLQUFWLEtBQW9CMEQsU0FBUyxJQUFJQyxXQUFqQyxDQUFKLEVBQW1EO0FBQ3hENUIsSUFBQUEsTUFBTSxHQUFHOUMsTUFBTSxDQUFDK0MsVUFBaEI7QUFDRCxHQUZNLE1BRUE7QUFDTEQsSUFBQUEsTUFBTSxHQUFHOUMsTUFBTSxDQUFDeUQsS0FBaEI7QUFDRDs7QUFFRCxNQUNFWCxNQUFNLElBQUk5QyxNQUFNLENBQUN5RCxLQUFqQixJQUNBWCxNQUFNLElBQUk5QyxNQUFNLENBQUMwRCxZQURqQixJQUVBWixNQUFNLElBQUk5QyxNQUFNLENBQUMrQyxVQUZqQixJQUdBRCxNQUFNLElBQUk5QyxNQUFNLENBQUNnRCxTQUpuQixFQUtFO0FBQ0FsRCxJQUFBQSxVQUFVLENBQUNrQixNQUFELEVBQVMsdUNBQVQsRUFBa0RXLE9BQWxELENBQVY7QUFDRDs7QUFDRCxNQUFJbUIsTUFBTSxJQUFJOUMsTUFBTSxDQUFDMEQsWUFBckIsRUFBbUM7QUFDakM1RCxJQUFBQSxVQUFVLENBQ1IsQ0FBQ2lCLEtBQUQsSUFBVUEsS0FBSyxJQUFJLE1BRFgsRUFFUixxREFGUSxFQUdSWSxPQUhRLENBQVY7QUFLRDs7QUFDRCxNQUNFbUIsTUFBTSxJQUFJOUMsTUFBTSxDQUFDeUQsS0FBakIsSUFDQVgsTUFBTSxJQUFJOUMsTUFBTSxDQUFDK0MsVUFEakIsSUFFQUQsTUFBTSxJQUFJOUMsTUFBTSxDQUFDZ0QsU0FIbkIsRUFJRTtBQUNBbEQsSUFBQUEsVUFBVSxDQUNSaUIsS0FBSyxJQUFJQSxLQUFLLElBQUksTUFEVixFQUVSLDBEQUZRLEVBR1JZLE9BSFEsQ0FBVjtBQUtEOztBQUVELE1BQUltQixNQUFNLElBQUk5QyxNQUFNLENBQUMrQyxVQUFqQixJQUErQkQsTUFBTSxJQUFJOUMsTUFBTSxDQUFDZ0QsU0FBcEQsRUFBK0Q7QUFDN0RsRCxJQUFBQSxVQUFVLENBQ1JLLGNBQWMsQ0FBQ1ksS0FBRCxDQUFkLElBQXlCWixjQUFjLENBQUNhLE1BQUQsQ0FEL0IsRUFFUixzRUFGUSxFQUdSdUQsU0FIUSxFQUlSQyxVQUpRLEVBS1I3QyxPQUxRLENBQVY7QUFPRCxHQVJELE1BUU87QUFDTDdCLElBQUFBLFVBQVUsQ0FDUjRFLFdBQVcsS0FBSyxJQURSLEVBRVIseUNBRlEsRUFHUi9DLE9BSFEsQ0FBVjtBQUtEOztBQUVELFNBQU87QUFBQ21CLElBQUFBLE1BQU0sRUFBTkEsTUFBRDtBQUFTL0IsSUFBQUEsS0FBSyxFQUFMQSxLQUFUO0FBQWdCQyxJQUFBQSxNQUFNLEVBQU5BO0FBQWhCLEdBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMjEgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICBkZXZBc3NlcnQsXG4gIGRldkFzc2VydE51bWJlcixcbiAgZGV2QXNzZXJ0U3RyaW5nLFxuICB1c2VyQXNzZXJ0LFxufSBmcm9tICcuL2NvcmUvYXNzZXJ0JztcbmltcG9ydCB7dHJhbnNwYXJlbnRQbmd9IGZyb20gJy4vY29yZS9kb20vaW1nJztcbmltcG9ydCB7XG4gIExheW91dCxcbiAgZ2V0TGF5b3V0Q2xhc3MsXG4gIGdldExlbmd0aE51bWVyYWwsXG4gIGdldExlbmd0aFVuaXRzLFxuICBpc0xheW91dFNpemVEZWZpbmVkLFxuICBwYXJzZUxheW91dCxcbiAgcGFyc2VMZW5ndGgsXG59IGZyb20gJy4vY29yZS9kb20vbGF5b3V0JztcbmltcG9ydCB7aHRtbEZvcn0gZnJvbSAnLi9jb3JlL2RvbS9zdGF0aWMtdGVtcGxhdGUnO1xuaW1wb3J0IHtzZXRTdHlsZSwgc2V0U3R5bGVzLCB0b2dnbGV9IGZyb20gJy4vY29yZS9kb20vc3R5bGUnO1xuaW1wb3J0IHt0b1dpbn0gZnJvbSAnLi9jb3JlL3dpbmRvdyc7XG5pbXBvcnQge2lzRXhwZXJpbWVudE9ufSBmcm9tICcuL2V4cGVyaW1lbnRzJztcblxuLyoqXG4gKiBXaGV0aGVyIGFzcGVjdC1yYXRpbyBDU1MgY2FuIGJlIHVzZWQgdG8gaW1wbGVtZW50IHJlc3BvbnNpdmUgbGF5b3V0cy5cbiAqIEB0eXBlIHs/Ym9vbGVhbn1cbiAqL1xubGV0IGFzcGVjdFJhdGlvQ3NzQ2FjaGUgPSBudWxsO1xuXG4vKipcbiAqIFRoZSBzZXQgb2YgZWxlbWVudHMgd2l0aCBuYXR1cmFsIGRpbWVuc2lvbnMsIHRoYXQgaXMsIGVsZW1lbnRzXG4gKiB3aGljaCBoYXZlIGEga25vd24gZGltZW5zaW9uIGVpdGhlciBiYXNlZCBvbiB0aGVpciB2YWx1ZSBzcGVjaWZpZWQgaGVyZSxcbiAqIG9yLCBpZiB0aGUgdmFsdWUgaXMgbnVsbCwgYSBkaW1lbnNpb24gc3BlY2lmaWMgdG8gdGhlIGJyb3dzZXIuXG4gKiBgaGFzTmF0dXJhbERpbWVuc2lvbnNgIGNoZWNrcyBmb3IgbWVtYmVyc2hpcCBpbiB0aGlzIHNldC5cbiAqIGBnZXROYXR1cmFsRGltZW5zaW9uc2AgZGV0ZXJtaW5lcyB0aGUgZGltZW5zaW9ucyBmb3IgYW4gZWxlbWVudCBpbiB0aGVcbiAqICAgIHNldCBhbmQgY2FjaGVzIGl0LlxuICogQHR5cGUgeyFPYmplY3Q8c3RyaW5nLCA/RGltZW5zaW9uc0RlZj59XG4gKiBAcHJpdmF0ZSAgVmlzaWJsZSBmb3IgdGVzdGluZyBvbmx5IVxuICovXG5leHBvcnQgY29uc3QgbmF0dXJhbERpbWVuc2lvbnNfID0ge1xuICAnQU1QLVBJWEVMJzoge3dpZHRoOiAnMHB4JywgaGVpZ2h0OiAnMHB4J30sXG4gICdBTVAtQU5BTFlUSUNTJzoge3dpZHRoOiAnMXB4JywgaGVpZ2h0OiAnMXB4J30sXG4gIC8vIFRPRE8oZHZveXRlbmtvKTogYXVkaW8gc2hvdWxkIGhhdmUgd2lkdGg6YXV0by5cbiAgJ0FNUC1BVURJTyc6IG51bGwsXG4gICdBTVAtU09DSUFMLVNIQVJFJzoge3dpZHRoOiAnNjBweCcsIGhlaWdodDogJzQ0cHgnfSxcbn07XG5cbi8qKiBAdmlzaWJsZUZvclRlc3RpbmcgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldFNob3VsZFVzZUFzcGVjdFJhdGlvQ3NzRm9yVGVzdGluZygpIHtcbiAgYXNwZWN0UmF0aW9Dc3NDYWNoZSA9IG51bGw7XG59XG5cbi8qKlxuICogV2hldGhlciBhc3BlY3QtcmF0aW8gQ1NTIGNhbiBiZSB1c2VkIHRvIGltcGxlbWVudCByZXNwb25zaXZlIGxheW91dHMuXG4gKlxuICogQHBhcmFtIHshV2luZG93fSB3aW5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIHNob3VsZFVzZUFzcGVjdFJhdGlvQ3NzKHdpbikge1xuICBpZiAoYXNwZWN0UmF0aW9Dc3NDYWNoZSA9PSBudWxsKSB7XG4gICAgYXNwZWN0UmF0aW9Dc3NDYWNoZSA9XG4gICAgICAoaXNFeHBlcmltZW50T24od2luLCAnbGF5b3V0LWFzcGVjdC1yYXRpby1jc3MnKSAmJlxuICAgICAgICB3aW4uQ1NTICYmXG4gICAgICAgIHdpbi5DU1Muc3VwcG9ydHMgJiZcbiAgICAgICAgd2luLkNTUy5zdXBwb3J0cygnYXNwZWN0LXJhdGlvOiAxLzEnKSkgfHxcbiAgICAgIGZhbHNlO1xuICB9XG4gIHJldHVybiBhc3BlY3RSYXRpb0Nzc0NhY2hlO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgdGFnTmFtZSBpcyBhIGtub3duIGVsZW1lbnQgdGhhdCBoYXMgbmF0dXJhbCBkaW1lbnNpb25zXG4gKiBpbiBvdXIgcnVudGltZSBvciB0aGUgYnJvd3Nlci5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0YWdOYW1lIFRoZSBlbGVtZW50IHRhZyBuYW1lLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc05hdHVyYWxEaW1lbnNpb25zKHRhZ05hbWUpIHtcbiAgdGFnTmFtZSA9IHRhZ05hbWUudG9VcHBlckNhc2UoKTtcbiAgcmV0dXJuIG5hdHVyYWxEaW1lbnNpb25zX1t0YWdOYW1lXSAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgdGhlIGRlZmF1bHQgZGltZW5zaW9ucyBmb3IgYW4gZWxlbWVudCB3aGljaCBjb3VsZCB2YXJ5IGFjcm9zc1xuICogZGlmZmVyZW50IGJyb3dzZXIgaW1wbGVtZW50YXRpb25zLCBsaWtlIDxhdWRpbz4gZm9yIGluc3RhbmNlLlxuICogVGhpcyBvcGVyYXRpb24gY2FuIG9ubHkgYmUgY29tcGxldGVkIGZvciBhbiBlbGVtZW50IGFsbG93bGlzdGVkIGJ5XG4gKiBgaGFzTmF0dXJhbERpbWVuc2lvbnNgLlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7RGltZW5zaW9uc0RlZn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5hdHVyYWxEaW1lbnNpb25zKGVsZW1lbnQpIHtcbiAgY29uc3QgdGFnTmFtZSA9IGVsZW1lbnQudGFnTmFtZS50b1VwcGVyQ2FzZSgpO1xuICBkZXZBc3NlcnQobmF0dXJhbERpbWVuc2lvbnNfW3RhZ05hbWVdICE9PSB1bmRlZmluZWQpO1xuICBpZiAoIW5hdHVyYWxEaW1lbnNpb25zX1t0YWdOYW1lXSkge1xuICAgIGNvbnN0IGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudDtcbiAgICBjb25zdCBuYXR1cmFsVGFnTmFtZSA9IHRhZ05hbWUucmVwbGFjZSgvXkFNUFxcLS8sICcnKTtcbiAgICBjb25zdCB0ZW1wID0gZG9jLmNyZWF0ZUVsZW1lbnQobmF0dXJhbFRhZ05hbWUpO1xuICAgIC8vIEZvciBhdWRpbywgc2hvdWxkIG5vLW9wIGVsc2V3aGVyZS5cbiAgICB0ZW1wLmNvbnRyb2xzID0gdHJ1ZTtcbiAgICBzZXRTdHlsZXModGVtcCwge1xuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICB2aXNpYmlsaXR5OiAnaGlkZGVuJyxcbiAgICB9KTtcbiAgICBkb2MuYm9keS5hcHBlbmRDaGlsZCh0ZW1wKTtcbiAgICBuYXR1cmFsRGltZW5zaW9uc19bdGFnTmFtZV0gPSB7XG4gICAgICB3aWR0aDogKHRlbXAuLypPSyovIG9mZnNldFdpZHRoIHx8IDEpICsgJ3B4JyxcbiAgICAgIGhlaWdodDogKHRlbXAuLypPSyovIG9mZnNldEhlaWdodCB8fCAxKSArICdweCcsXG4gICAgfTtcbiAgICBkb2MuYm9keS5yZW1vdmVDaGlsZCh0ZW1wKTtcbiAgfVxuICByZXR1cm4gLyoqIEB0eXBlIHtEaW1lbnNpb25zRGVmfSAqLyAobmF0dXJhbERpbWVuc2lvbnNfW3RhZ05hbWVdKTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIGxheW91dCB0byB0aGUgZWxlbWVudC4gVmlzaWJsZSBmb3IgdGVzdGluZyBvbmx5LlxuICpcbiAqIFxcICAgXFwgIC8gIFxcICAvICAgLyAvICAgXFwgICAgIHwgICBfICBcXCAgICAgfCAgXFwgfCAgfCB8ICB8IHwgIFxcIHwgIHwgIC8gX19fX198XG4gKiAgXFwgICBcXC8gICAgXFwvICAgLyAvICBeICBcXCAgICB8ICB8XykgIHwgICAgfCAgIFxcfCAgfCB8ICB8IHwgICBcXHwgIHwgfCAgfCAgX19cbiAqICAgXFwgICAgICAgICAgICAvIC8gIC9fXFwgIFxcICAgfCAgICAgIC8gICAgIHwgIC4gYCAgfCB8ICB8IHwgIC4gYCAgfCB8ICB8IHxfIHxcbiAqICAgIFxcICAgIC9cXCAgICAvIC8gIF9fX19fICBcXCAgfCAgfFxcICBcXC0tLS0ufCAgfFxcICAgfCB8ICB8IHwgIHxcXCAgIHwgfCAgfF9ffCB8XG4gKiAgICAgXFxfXy8gIFxcX18vIC9fXy8gICAgIFxcX19cXCB8IF98IGAuX19fX198fF9ffCBcXF9ffCB8X198IHxfX3wgXFxfX3wgIFxcX19fX19ffFxuICpcbiAqIFRoZSBlcXVpdmFsZW50IG9mIHRoaXMgbWV0aG9kIGlzIHVzZWQgZm9yIHNlcnZlci1zaWRlIHJlbmRlcmluZyAoU1NSKSBhbmRcbiAqIGFueSBjaGFuZ2VzIG1hZGUgdG8gaXQgbXVzdCBiZSBtYWRlIGluIGNvb3JkaW5hdGlvbiB3aXRoIGNhY2hlcyB0aGF0XG4gKiBpbXBsZW1lbnQgU1NSLiBGb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBTU1Igc2VlIGJpdC5seS9hbXAtc3NyLlxuICpcbiAqIEBwYXJhbSB7IUVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZml4SWVJbnRyaW5zaWNcbiAqIEByZXR1cm4geyFMYXlvdXR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVN0YXRpY0xheW91dChlbGVtZW50LCBmaXhJZUludHJpbnNpYyA9IGZhbHNlKSB7XG4gIC8vIENoZWNrIGlmIHRoZSBsYXlvdXQgaGFzIGFscmVhZHkgYmVlbiBkb25lIGJ5IHNlcnZlci1zaWRlIHJlbmRlcmluZyBvclxuICAvLyBjbGllbnQtc2lkZSByZW5kZXJpbmcgYW5kIHRoZSBlbGVtZW50IHdhcyBjbG9uZWQuIFRoZSBkb2N1bWVudCBtYXkgYmVcbiAgLy8gdmlzaWJsZSB0byB0aGUgdXNlciBpZiB0aGUgYm9pbGVycGxhdGUgd2FzIHJlbW92ZWQgc28gcGxlYXNlIHRha2UgY2FyZSBpblxuICAvLyBtYWtpbmcgY2hhbmdlcyBoZXJlLlxuICBjb25zdCBjb21wbGV0ZWRMYXlvdXRBdHRyID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2ktYW1waHRtbC1sYXlvdXQnKTtcbiAgaWYgKGNvbXBsZXRlZExheW91dEF0dHIpIHtcbiAgICBjb25zdCBsYXlvdXQgPSAvKiogQHR5cGUgeyFMYXlvdXR9ICovIChcbiAgICAgIGRldkFzc2VydChwYXJzZUxheW91dChjb21wbGV0ZWRMYXlvdXRBdHRyKSlcbiAgICApO1xuICAgIGlmIChcbiAgICAgIChsYXlvdXQgPT0gTGF5b3V0LlJFU1BPTlNJVkUgfHwgbGF5b3V0ID09IExheW91dC5JTlRSSU5TSUMpICYmXG4gICAgICBlbGVtZW50LmZpcnN0RWxlbWVudENoaWxkXG4gICAgKSB7XG4gICAgICAvLyBGaW5kIHNpemVyLCBidXQgYXNzdW1lIHRoYXQgaXQgbWlnaHQgbm90IGhhdmUgYmVlbiBwYXJzZWQgeWV0LlxuICAgICAgZWxlbWVudC5zaXplckVsZW1lbnQgPVxuICAgICAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2ktYW1waHRtbC1zaXplcicpIHx8IHVuZGVmaW5lZDtcbiAgICAgIGlmIChlbGVtZW50LnNpemVyRWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnNpemVyRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3Nsb3QnLCAnaS1hbXBodG1sLXN2YycpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobGF5b3V0ID09IExheW91dC5OT0RJU1BMQVkpIHtcbiAgICAgIHRvZ2dsZShlbGVtZW50LCBmYWxzZSk7XG4gICAgICAvLyBUT0RPKGpyaWRnZXdlbGwpOiBUZW1wb3JhcnkgaGFjayB3aGlsZSBTU1Igc3RpbGwgYWRkcyBhbiBpbmxpbmVcbiAgICAgIC8vIGBkaXNwbGF5OiBub25lYFxuICAgICAgZWxlbWVudFsnc3R5bGUnXVsnZGlzcGxheSddID0gJyc7XG4gICAgfVxuICAgIHJldHVybiBsYXlvdXQ7XG4gIH1cblxuICAvLyBJZiB0aGUgbGF5b3V0IHdhcyBhbHJlYWR5IGRvbmUgYnkgc2VydmVyLXNpZGUgcmVuZGVyaW5nIChTU1IpLCB0aGVuIHRoZVxuICAvLyBjb2RlIGJlbG93IHdpbGwgbm90IHJ1bi4gQW55IGNoYW5nZXMgYmVsb3cgd2lsbCBuZWNlc3NpdGF0ZSBhIGNoYW5nZSB0byBTU1JcbiAgLy8gYW5kIG11c3QgYmUgY29vcmRpbmF0ZWQgd2l0aCBjYWNoZXMgdGhhdCBpbXBsZW1lbnQgU1NSLiBTZWUgYml0Lmx5L2FtcC1zc3IuXG4gIGNvbnN0IHtoZWlnaHQsIGxheW91dCwgd2lkdGh9ID0gZ2V0RWZmZWN0aXZlTGF5b3V0SW50ZXJuYWwoZWxlbWVudCk7XG5cbiAgLy8gQXBwbHkgVUkuXG4gIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChnZXRMYXlvdXRDbGFzcyhsYXlvdXQpKTtcbiAgaWYgKGlzTGF5b3V0U2l6ZURlZmluZWQobGF5b3V0KSkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWxheW91dC1zaXplLWRlZmluZWQnKTtcbiAgfVxuICBpZiAobGF5b3V0ID09IExheW91dC5OT0RJU1BMQVkpIHtcbiAgICAvLyBDU1MgZGVmaW5lcyBsYXlvdXQ9bm9kaXNwbGF5IGF1dG9tYXRpY2FsbHkgd2l0aCBgZGlzcGxheTpub25lYC4gVGh1c1xuICAgIC8vIG5vIGFkZGl0aW9uYWwgc3R5bGluZyBpcyBuZWVkZWQuXG4gICAgdG9nZ2xlKGVsZW1lbnQsIGZhbHNlKTtcbiAgICAvLyBUT0RPKGpyaWRnZXdlbGwpOiBUZW1wb3JhcnkgaGFjayB3aGlsZSBTU1Igc3RpbGwgYWRkcyBhbiBpbmxpbmVcbiAgICAvLyBgZGlzcGxheTogbm9uZWBcbiAgICBlbGVtZW50WydzdHlsZSddWydkaXNwbGF5J10gPSAnJztcbiAgfSBlbHNlIGlmIChsYXlvdXQgPT0gTGF5b3V0LkZJWEVEKSB7XG4gICAgc2V0U3R5bGVzKGVsZW1lbnQsIHtcbiAgICAgIHdpZHRoOiBkZXZBc3NlcnRTdHJpbmcod2lkdGgpLFxuICAgICAgaGVpZ2h0OiBkZXZBc3NlcnRTdHJpbmcoaGVpZ2h0KSxcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChsYXlvdXQgPT0gTGF5b3V0LkZJWEVEX0hFSUdIVCkge1xuICAgIHNldFN0eWxlKGVsZW1lbnQsICdoZWlnaHQnLCBkZXZBc3NlcnRTdHJpbmcoaGVpZ2h0KSk7XG4gIH0gZWxzZSBpZiAobGF5b3V0ID09IExheW91dC5SRVNQT05TSVZFKSB7XG4gICAgaWYgKHNob3VsZFVzZUFzcGVjdFJhdGlvQ3NzKHRvV2luKGVsZW1lbnQub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldykpKSB7XG4gICAgICBzZXRTdHlsZShcbiAgICAgICAgZWxlbWVudCxcbiAgICAgICAgJ2FzcGVjdC1yYXRpbycsXG4gICAgICAgIGAke2dldExlbmd0aE51bWVyYWwod2lkdGgpfS8ke2dldExlbmd0aE51bWVyYWwoaGVpZ2h0KX1gXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzaXplciA9IGVsZW1lbnQub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpLWFtcGh0bWwtc2l6ZXInKTtcbiAgICAgIHNpemVyLnNldEF0dHJpYnV0ZSgnc2xvdCcsICdpLWFtcGh0bWwtc3ZjJyk7XG4gICAgICBzZXRTdHlsZXMoc2l6ZXIsIHtcbiAgICAgICAgcGFkZGluZ1RvcDpcbiAgICAgICAgICAoZ2V0TGVuZ3RoTnVtZXJhbChoZWlnaHQpIC8gZ2V0TGVuZ3RoTnVtZXJhbCh3aWR0aCkpICogMTAwICsgJyUnLFxuICAgICAgfSk7XG4gICAgICBlbGVtZW50Lmluc2VydEJlZm9yZShzaXplciwgZWxlbWVudC5maXJzdENoaWxkKTtcbiAgICAgIGVsZW1lbnQuc2l6ZXJFbGVtZW50ID0gc2l6ZXI7XG4gICAgfVxuICB9IGVsc2UgaWYgKGxheW91dCA9PSBMYXlvdXQuSU5UUklOU0lDKSB7XG4gICAgLy8gSW50cmluc2ljIHVzZXMgYW4gc3ZnIGluc2lkZSB0aGUgc2l6ZXIgZWxlbWVudCByYXRoZXIgdGhhbiB0aGUgcGFkZGluZ1xuICAgIC8vIHRyaWNrIE5vdGUgYSBuYWtlZCBzdmcgd29uJ3Qgd29yayBiZWNhc3VlIG90aGVyIHRoaW5nIGV4cGVjdCB0aGVcbiAgICAvLyBpLWFtcGh0bWwtc2l6ZXIgZWxlbWVudFxuICAgIGNvbnN0IHNpemVyID0gaHRtbEZvcihlbGVtZW50KWBcbiAgICAgIDxpLWFtcGh0bWwtc2l6ZXIgY2xhc3M9XCJpLWFtcGh0bWwtc2l6ZXJcIiBzbG90PVwiaS1hbXBodG1sLXN2Y1wiPlxuICAgICAgICA8aW1nIGFsdD1cIlwiIHJvbGU9XCJwcmVzZW50YXRpb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgICAgICAgIGNsYXNzPVwiaS1hbXBodG1sLWludHJpbnNpYy1zaXplclwiIC8+XG4gICAgICA8L2ktYW1waHRtbC1zaXplcj5gO1xuICAgIGNvbnN0IGludHJpbnNpY1NpemVyID0gc2l6ZXIuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgaW50cmluc2ljU2l6ZXIuc2V0QXR0cmlidXRlKFxuICAgICAgJ3NyYycsXG4gICAgICAhSVNfRVNNICYmIGZpeEllSW50cmluc2ljICYmIGVsZW1lbnQub3duZXJEb2N1bWVudFxuICAgICAgICA/IHRyYW5zcGFyZW50UG5nKFxuICAgICAgICAgICAgZWxlbWVudC5vd25lckRvY3VtZW50LFxuICAgICAgICAgICAgZGV2QXNzZXJ0TnVtYmVyKGdldExlbmd0aE51bWVyYWwod2lkdGgpKSxcbiAgICAgICAgICAgIGRldkFzc2VydE51bWJlcihnZXRMZW5ndGhOdW1lcmFsKGhlaWdodCkpXG4gICAgICAgICAgKVxuICAgICAgICA6IGBkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtOCw8c3ZnIGhlaWdodD1cIiR7aGVpZ2h0fVwiIHdpZHRoPVwiJHt3aWR0aH1cIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmVyc2lvbj1cIjEuMVwiLz5gXG4gICAgKTtcbiAgICBlbGVtZW50Lmluc2VydEJlZm9yZShzaXplciwgZWxlbWVudC5maXJzdENoaWxkKTtcbiAgICBlbGVtZW50LnNpemVyRWxlbWVudCA9IHNpemVyO1xuICB9IGVsc2UgaWYgKGxheW91dCA9PSBMYXlvdXQuRklMTCkge1xuICAgIC8vIERvIG5vdGhpbmcuXG4gIH0gZWxzZSBpZiAobGF5b3V0ID09IExheW91dC5DT05UQUlORVIpIHtcbiAgICAvLyBEbyBub3RoaW5nLiBFbGVtZW50cyB0aGVtc2VsdmVzIHdpbGwgY2hlY2sgd2hldGhlciB0aGUgc3VwcGxpZWRcbiAgICAvLyBsYXlvdXQgdmFsdWUgaXMgYWNjZXB0YWJsZS4gSW4gcGFydGljdWxhciBjb250YWluZXIgaXMgb25seSBPS1xuICAgIC8vIHNvbWV0aW1lcy5cbiAgfSBlbHNlIGlmIChsYXlvdXQgPT0gTGF5b3V0LkZMRVhfSVRFTSkge1xuICAgIC8vIFNldCBoZWlnaHQgYW5kIHdpZHRoIHRvIGEgZmxleCBpdGVtIGlmIHRoZXkgZXhpc3QuXG4gICAgLy8gVGhlIHNpemUgc2V0IHRvIGEgZmxleCBpdGVtIGNvdWxkIGJlIG92ZXJyaWRkZW4gYnkgYGRpc3BsYXk6IGZsZXhgIGxhdGVyLlxuICAgIGlmICh3aWR0aCkge1xuICAgICAgc2V0U3R5bGUoZWxlbWVudCwgJ3dpZHRoJywgd2lkdGgpO1xuICAgIH1cbiAgICBpZiAoaGVpZ2h0KSB7XG4gICAgICBzZXRTdHlsZShlbGVtZW50LCAnaGVpZ2h0JywgaGVpZ2h0KTtcbiAgICB9XG4gIH0gZWxzZSBpZiAobGF5b3V0ID09IExheW91dC5GTFVJRCkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaS1hbXBodG1sLWxheW91dC1hd2FpdGluZy1zaXplJyk7XG4gICAgaWYgKHdpZHRoKSB7XG4gICAgICBzZXRTdHlsZShlbGVtZW50LCAnd2lkdGgnLCB3aWR0aCk7XG4gICAgfVxuICAgIHNldFN0eWxlKGVsZW1lbnQsICdoZWlnaHQnLCAwKTtcbiAgfVxuICAvLyBNYXJrIHRoZSBlbGVtZW50IGFzIGhhdmluZyBjb21wbGV0ZWQgc3RhdGljIGxheW91dCwgaW4gY2FzZSBpdCBpcyBjbG9uZWRcbiAgLy8gaW4gdGhlIGZ1dHVyZS5cbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2ktYW1waHRtbC1sYXlvdXQnLCBsYXlvdXQpO1xuICByZXR1cm4gbGF5b3V0O1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGVmZmVjdGl2ZSBsYXlvdXQgZm9yIGFuIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7IUxheW91dH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVmZmVjdGl2ZUxheW91dChlbGVtZW50KSB7XG4gIC8vIFJldHVybiB0aGUgcHJlLWV4aXN0aW5nIHZhbHVlIGlmIGxheW91dCBoYXMgYWxyZWFkeSBiZWVuIGFwcGxpZWQuXG4gIGNvbnN0IGNvbXBsZXRlZExheW91dEF0dHIgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaS1hbXBodG1sLWxheW91dCcpO1xuICBpZiAoY29tcGxldGVkTGF5b3V0QXR0cikge1xuICAgIHJldHVybiBwYXJzZUxheW91dChjb21wbGV0ZWRMYXlvdXRBdHRyKTtcbiAgfVxuXG4gIHJldHVybiBnZXRFZmZlY3RpdmVMYXlvdXRJbnRlcm5hbChlbGVtZW50KS5sYXlvdXQ7XG59XG5cbi8qKlxuICogQHR5cGVkZWYge1xuICogICB7bGF5b3V0OiAhTGF5b3V0LCBoZWlnaHQ6IG51bWJlciwgd2lkdGg6IG51bWJlcn0gfCB7bGF5b3V0OiAhTGF5b3V0fVxuICogfSBJbnRlcm5hbEVmZmVjdGl2ZUxheW91dFxuICovXG5cbi8qKlxuICogR2V0cyB0aGUgZWZmZWN0aXZlIGxheW91dCBmb3IgYW4gZWxlbWVudC5cbiAqXG4gKiBJZiBjbGFzcyAnaS1hbXBodG1sLWxheW91dCcgaXMgcHJlc2VudCwgdGhlbiBkaXJlY3RseSB1c2UgaXRzIHZhbHVlLlxuICogRWxzZSBjYWxjdWxhdGUgbGF5b3V0IGJhc2VkIG9uIGVsZW1lbnQgYXR0cmlidXRlcyBhbmQgcmV0dXJuIHRoZSB3aWR0aC9oZWlnaHQuXG4gKlxuICogQHBhcmFtIHshRWxlbWVudH0gZWxlbWVudFxuICogQHJldHVybiB7SW50ZXJuYWxFZmZlY3RpdmVMYXlvdXR9XG4gKi9cbmZ1bmN0aW9uIGdldEVmZmVjdGl2ZUxheW91dEludGVybmFsKGVsZW1lbnQpIHtcbiAgLy8gUGFyc2UgbGF5b3V0IGZyb20gdGhlIGVsZW1lbnQuXG4gIGNvbnN0IGxheW91dEF0dHIgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnbGF5b3V0Jyk7XG4gIGNvbnN0IHdpZHRoQXR0ciA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd3aWR0aCcpO1xuICBjb25zdCBoZWlnaHRBdHRyID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2hlaWdodCcpO1xuICBjb25zdCBzaXplc0F0dHIgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnc2l6ZXMnKTtcbiAgY29uc3QgaGVpZ2h0c0F0dHIgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaGVpZ2h0cycpO1xuXG4gIC8vIElucHV0IGxheW91dCBhdHRyaWJ1dGVzLlxuICBjb25zdCBpbnB1dExheW91dCA9IGxheW91dEF0dHIgPyBwYXJzZUxheW91dChsYXlvdXRBdHRyKSA6IG51bGw7XG4gIHVzZXJBc3NlcnQoXG4gICAgaW5wdXRMYXlvdXQgIT09IHVuZGVmaW5lZCxcbiAgICAnSW52YWxpZCBcImxheW91dFwiIHZhbHVlOiAlcywgJXMnLFxuICAgIGxheW91dEF0dHIsXG4gICAgZWxlbWVudFxuICApO1xuICAvKiogQGNvbnN0IHtzdHJpbmd8bnVsbHx1bmRlZmluZWR9ICovXG4gIGNvbnN0IGlucHV0V2lkdGggPVxuICAgIHdpZHRoQXR0ciAmJiB3aWR0aEF0dHIgIT0gJ2F1dG8nID8gcGFyc2VMZW5ndGgod2lkdGhBdHRyKSA6IHdpZHRoQXR0cjtcbiAgdXNlckFzc2VydChcbiAgICBpbnB1dFdpZHRoICE9PSB1bmRlZmluZWQsXG4gICAgJ0ludmFsaWQgXCJ3aWR0aFwiIHZhbHVlOiAlcywgJXMnLFxuICAgIHdpZHRoQXR0cixcbiAgICBlbGVtZW50XG4gICk7XG4gIC8qKiBAY29uc3Qge3N0cmluZ3xudWxsfHVuZGVmaW5lZH0gKi9cbiAgY29uc3QgaW5wdXRIZWlnaHQgPVxuICAgIGhlaWdodEF0dHIgJiYgaGVpZ2h0QXR0ciAhPSAnZmx1aWQnID8gcGFyc2VMZW5ndGgoaGVpZ2h0QXR0cikgOiBoZWlnaHRBdHRyO1xuICB1c2VyQXNzZXJ0KFxuICAgIGlucHV0SGVpZ2h0ICE9PSB1bmRlZmluZWQsXG4gICAgJ0ludmFsaWQgXCJoZWlnaHRcIiB2YWx1ZTogJXMsICVzJyxcbiAgICBoZWlnaHRBdHRyLFxuICAgIGVsZW1lbnRcbiAgKTtcblxuICAvLyBFZmZlY3RpdmUgbGF5b3V0IGF0dHJpYnV0ZXMuIFRoZXNlIGFyZSBlZmZlY3RpdmVseSBjb25zdGFudHMuXG4gIGxldCB3aWR0aDtcbiAgbGV0IGhlaWdodDtcbiAgbGV0IGxheW91dDtcblxuICAvLyBDYWxjdWxhdGUgZWZmZWN0aXZlIHdpZHRoIGFuZCBoZWlnaHQuXG4gIGlmIChcbiAgICAoIWlucHV0TGF5b3V0IHx8XG4gICAgICBpbnB1dExheW91dCA9PSBMYXlvdXQuRklYRUQgfHxcbiAgICAgIGlucHV0TGF5b3V0ID09IExheW91dC5GSVhFRF9IRUlHSFQpICYmXG4gICAgKCFpbnB1dFdpZHRoIHx8ICFpbnB1dEhlaWdodCkgJiZcbiAgICBoYXNOYXR1cmFsRGltZW5zaW9ucyhlbGVtZW50LnRhZ05hbWUpXG4gICkge1xuICAgIC8vIERlZmF1bHQgd2lkdGggYW5kIGhlaWdodDogaGFuZGxlIGVsZW1lbnRzIHRoYXQgZG8gbm90IHNwZWNpZnkgYVxuICAgIC8vIHdpZHRoL2hlaWdodCBhbmQgYXJlIGRlZmluZWQgdG8gaGF2ZSBuYXR1cmFsIGJyb3dzZXIgZGltZW5zaW9ucy5cbiAgICBjb25zdCBkaW1lbnNpb25zID0gZ2V0TmF0dXJhbERpbWVuc2lvbnMoZWxlbWVudCk7XG4gICAgd2lkdGggPVxuICAgICAgaW5wdXRXaWR0aCB8fCBpbnB1dExheW91dCA9PSBMYXlvdXQuRklYRURfSEVJR0hUXG4gICAgICAgID8gaW5wdXRXaWR0aFxuICAgICAgICA6IGRpbWVuc2lvbnMud2lkdGg7XG4gICAgaGVpZ2h0ID0gaW5wdXRIZWlnaHQgfHwgZGltZW5zaW9ucy5oZWlnaHQ7XG4gIH0gZWxzZSB7XG4gICAgd2lkdGggPSBpbnB1dFdpZHRoO1xuICAgIGhlaWdodCA9IGlucHV0SGVpZ2h0O1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlIGVmZmVjdGl2ZSBsYXlvdXQuXG4gIGlmIChpbnB1dExheW91dCkge1xuICAgIGxheW91dCA9IGlucHV0TGF5b3V0O1xuICB9IGVsc2UgaWYgKCF3aWR0aCAmJiAhaGVpZ2h0KSB7XG4gICAgbGF5b3V0ID0gTGF5b3V0LkNPTlRBSU5FUjtcbiAgfSBlbHNlIGlmIChoZWlnaHQgPT0gJ2ZsdWlkJykge1xuICAgIGxheW91dCA9IExheW91dC5GTFVJRDtcbiAgfSBlbHNlIGlmIChoZWlnaHQgJiYgKCF3aWR0aCB8fCB3aWR0aCA9PSAnYXV0bycpKSB7XG4gICAgbGF5b3V0ID0gTGF5b3V0LkZJWEVEX0hFSUdIVDtcbiAgfSBlbHNlIGlmIChoZWlnaHQgJiYgd2lkdGggJiYgKHNpemVzQXR0ciB8fCBoZWlnaHRzQXR0cikpIHtcbiAgICBsYXlvdXQgPSBMYXlvdXQuUkVTUE9OU0lWRTtcbiAgfSBlbHNlIHtcbiAgICBsYXlvdXQgPSBMYXlvdXQuRklYRUQ7XG4gIH1cblxuICBpZiAoXG4gICAgbGF5b3V0ID09IExheW91dC5GSVhFRCB8fFxuICAgIGxheW91dCA9PSBMYXlvdXQuRklYRURfSEVJR0hUIHx8XG4gICAgbGF5b3V0ID09IExheW91dC5SRVNQT05TSVZFIHx8XG4gICAgbGF5b3V0ID09IExheW91dC5JTlRSSU5TSUNcbiAgKSB7XG4gICAgdXNlckFzc2VydChoZWlnaHQsICdUaGUgXCJoZWlnaHRcIiBhdHRyaWJ1dGUgaXMgbWlzc2luZzogJXMnLCBlbGVtZW50KTtcbiAgfVxuICBpZiAobGF5b3V0ID09IExheW91dC5GSVhFRF9IRUlHSFQpIHtcbiAgICB1c2VyQXNzZXJ0KFxuICAgICAgIXdpZHRoIHx8IHdpZHRoID09ICdhdXRvJyxcbiAgICAgICdUaGUgXCJ3aWR0aFwiIGF0dHJpYnV0ZSBtdXN0IGJlIG1pc3Npbmcgb3IgXCJhdXRvXCI6ICVzJyxcbiAgICAgIGVsZW1lbnRcbiAgICApO1xuICB9XG4gIGlmIChcbiAgICBsYXlvdXQgPT0gTGF5b3V0LkZJWEVEIHx8XG4gICAgbGF5b3V0ID09IExheW91dC5SRVNQT05TSVZFIHx8XG4gICAgbGF5b3V0ID09IExheW91dC5JTlRSSU5TSUNcbiAgKSB7XG4gICAgdXNlckFzc2VydChcbiAgICAgIHdpZHRoICYmIHdpZHRoICE9ICdhdXRvJyxcbiAgICAgICdUaGUgXCJ3aWR0aFwiIGF0dHJpYnV0ZSBtdXN0IGJlIHByZXNlbnQgYW5kIG5vdCBcImF1dG9cIjogJXMnLFxuICAgICAgZWxlbWVudFxuICAgICk7XG4gIH1cblxuICBpZiAobGF5b3V0ID09IExheW91dC5SRVNQT05TSVZFIHx8IGxheW91dCA9PSBMYXlvdXQuSU5UUklOU0lDKSB7XG4gICAgdXNlckFzc2VydChcbiAgICAgIGdldExlbmd0aFVuaXRzKHdpZHRoKSA9PSBnZXRMZW5ndGhVbml0cyhoZWlnaHQpLFxuICAgICAgJ0xlbmd0aCB1bml0cyBzaG91bGQgYmUgdGhlIHNhbWUgZm9yIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIjogJXMsICVzLCAlcycsXG4gICAgICB3aWR0aEF0dHIsXG4gICAgICBoZWlnaHRBdHRyLFxuICAgICAgZWxlbWVudFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgdXNlckFzc2VydChcbiAgICAgIGhlaWdodHNBdHRyID09PSBudWxsLFxuICAgICAgJ1wiaGVpZ2h0c1wiIGF0dHJpYnV0ZSBtdXN0IGJlIG1pc3Npbmc6ICVzJyxcbiAgICAgIGVsZW1lbnRcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIHtsYXlvdXQsIHdpZHRoLCBoZWlnaHR9O1xufVxuIl19
// /Users/mszylkowski/src/amphtml/src/static-layout.js