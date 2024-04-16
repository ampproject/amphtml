import {
  devAssert,
  devAssertElement,
  devAssertNumber,
  devAssertString,
  userAssert,
} from '#core/assert';
import {
  Layout_Enum,
  getLayoutClass,
  getLengthNumeral,
  getLengthUnits,
  isLayoutSizeDefined,
  parseLayout,
  parseLength,
} from '#core/dom/layout';
import {htmlFor} from '#core/dom/static-template';
import {setStyle, setStyles, toggle} from '#core/dom/style';

/**
 * The set of elements with natural dimensions, that is, elements
 * which have a known dimension either based on their value specified here,
 * or, if the value is null, a dimension specific to the browser.
 * `hasNaturalDimensions` checks for membership in this set.
 * `getNaturalDimensions` determines the dimensions for an element in the
 *    set and caches it.
 * @type {{[key: string]: ?import('./dom/layout').DimensionsDef}}
 * @private  Visible for testing only
 */
export const naturalDimensions_ = {
  'AMP-PIXEL': {width: '0px', height: '0px'},
  'AMP-ANALYTICS': {width: '1px', height: '1px'},
  'AMP-AUDIO': null,
  'AMP-SOCIAL-SHARE': {width: '60px', height: '44px'},
};

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
 * @param {Element} element
 * @return {import('./dom/layout').DimensionsDef}
 */
export function getNaturalDimensions(element) {
  const tagName = element.tagName.toUpperCase();
  devAssert(naturalDimensions_[tagName] !== undefined);
  if (!naturalDimensions_[tagName]) {
    const doc = element.ownerDocument;
    const naturalTagName = tagName.replace(/^AMP\-/, '');
    const temp = /** @type {HTMLElement} */ (doc.createElement(naturalTagName));

    // For audio, should no-op elsewhere.
    /** @type {HTMLAudioElement} */ (temp).controls = true;

    setStyles(temp, {
      position: 'absolute',
      visibility: 'hidden',
    });
    doc.body.appendChild(temp);
    naturalDimensions_[tagName] = {
      width: (temp./*OK*/ offsetWidth || 1) + 'px',
      height: (temp./*OK*/ offsetHeight || 1) + 'px',
    };
    doc.body.removeChild(temp);
  }

  return /** @type {import('./dom/layout').DimensionsDef} */ (
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
 * @param {AmpElement} element
 * @return {Layout_Enum}
 */
export function applyStaticLayout(element) {
  // Check if the layout has already been done by server-side rendering or
  // client-side rendering and the element was cloned. The document may be
  // visible to the user if the boilerplate was removed so please take care in
  // making changes here.
  const completedLayoutAttr = element.getAttribute('i-amphtml-layout');
  if (completedLayoutAttr) {
    const layout = parseLayout(completedLayoutAttr);
    devAssert(layout);

    if (
      (layout == Layout_Enum.RESPONSIVE || layout == Layout_Enum.INTRINSIC) &&
      element.firstElementChild
    ) {
      // Find sizer, but assume that it might not have been parsed yet.
      element.sizerElement =
        /** @type {?HTMLElement} */ (
          element.querySelector('i-amphtml-sizer')
        ) || undefined;
      element.sizerElement?.setAttribute('slot', 'i-amphtml-svc');
    } else if (layout == Layout_Enum.NODISPLAY) {
      toggle(element, false);
    }
    return layout;
  }

  // If the layout was already done by server-side rendering (SSR), then the
  // code below will not run. Any changes below will necessitate a change to SSR
  // and must be coordinated with caches that implement SSR. See bit.ly/amp-ssr.
  const {height, layout, width} = getEffectiveLayoutInternal(element);

  // Apply UI.
  element.classList.add(getLayoutClass(layout));
  if (isLayoutSizeDefined(layout)) {
    element.classList.add('i-amphtml-layout-size-defined');
  }
  if (layout == Layout_Enum.NODISPLAY) {
    // CSS defines layout=nodisplay automatically with `display:none`. Thus
    // no additional styling is needed.
    toggle(element, false);
  } else if (layout == Layout_Enum.FIXED) {
    setStyles(element, {
      width: devAssertString(width),
      height: devAssertString(height),
    });
  } else if (layout == Layout_Enum.FIXED_HEIGHT) {
    setStyle(element, 'height', devAssertString(height));
  } else if (layout == Layout_Enum.RESPONSIVE) {
    const sizer = element.ownerDocument.createElement('i-amphtml-sizer');
    sizer.setAttribute('slot', 'i-amphtml-svc');
    const heightNumeral = getLengthNumeral(height);
    const widthNumeral = getLengthNumeral(width);
    devAssertNumber(heightNumeral);
    devAssertNumber(widthNumeral);
    setStyles(sizer, {
      paddingTop: (heightNumeral / widthNumeral) * 100 + '%',
    });
    element.insertBefore(sizer, element.firstChild);
    element.sizerElement = sizer;
  } else if (layout == Layout_Enum.INTRINSIC) {
    // Intrinsic uses an svg inside the sizer element rather than the padding
    // trick Note a naked svg won't work because other things expect the
    // i-amphtml-sizer element
    const sizer = htmlFor(element)`
      <i-amphtml-sizer class="i-amphtml-sizer" slot="i-amphtml-svc">
        <img alt="" role="presentation" aria-hidden="true"
             class="i-amphtml-intrinsic-sizer" />
      </i-amphtml-sizer>`;
    const intrinsicSizer = sizer.firstElementChild;
    devAssertElement(intrinsicSizer);
    intrinsicSizer.setAttribute(
      'src',
      `data:image/svg+xml;charset=utf-8,<svg height="${height}" width="${width}" xmlns="http://www.w3.org/2000/svg" version="1.1"/>`
    );
    element.insertBefore(sizer, element.firstChild);
    element.sizerElement = sizer;
  } else if (layout == Layout_Enum.FILL) {
    // Do nothing.
  } else if (layout == Layout_Enum.CONTAINER) {
    // Do nothing. Elements themselves will check whether the supplied
    // layout value is acceptable. In particular container is only OK
    // sometimes.
  } else if (layout == Layout_Enum.FLEX_ITEM) {
    // Set height and width to a flex item if they exist.
    // The size set to a flex item could be overridden by `display: flex` later.
    if (width) {
      setStyle(element, 'width', width);
    }
    if (height) {
      setStyle(element, 'height', height);
    }
  } else if (layout == Layout_Enum.FLUID) {
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
 * @param {Element} element
 * @return {Layout_Enum}
 */
export function getEffectiveLayout(element) {
  // Return the pre-existing value if layout has already been applied.
  const completedLayout = parseLayout(element.getAttribute('layout') ?? '');
  if (completedLayout) {
    return completedLayout;
  }

  return getEffectiveLayoutInternal(element).layout;
}

/**
 * @typedef {{
 *  layout: !Layout_Enum,
 *  height: (string|number|null|undefined),
 *  width: (string|number|null|undefined)
 * }}
 */
let InternalEffectiveLayoutDef;

/**
 * Gets the effective layout for an element.
 *
 * If class 'i-amphtml-layout' is present, then directly use its value.
 * Else calculate layout based on element attributes and return the width/height.
 *
 * @param {Element} element
 * @return {InternalEffectiveLayoutDef}
 */
function getEffectiveLayoutInternal(element) {
  // Parse layout from the element.
  const layoutAttr = element.getAttribute('layout');
  const widthAttr = element.getAttribute('width');
  const heightAttr = element.getAttribute('height');
  const sizesAttr = element.getAttribute('sizes');
  const heightsAttr = element.getAttribute('heights');

  // Input layout attributes.
  const inputLayout = layoutAttr ? parseLayout(layoutAttr) : null;
  userAssert(
    inputLayout !== undefined,
    'Invalid "layout" value: %s, %s',
    layoutAttr,
    element
  );
  /**
   * @type {string|null|undefined}
   * @const
   */
  const inputWidth =
    widthAttr && widthAttr != 'auto' ? parseLength(widthAttr) : widthAttr;
  userAssert(
    inputWidth !== undefined,
    'Invalid "width" value: %s, %s',
    widthAttr,
    element
  );
  /**
   * @type {string|null|undefined}
   * @const
   */
  const inputHeight =
    heightAttr && heightAttr != 'fluid' ? parseLength(heightAttr) : heightAttr;
  userAssert(
    inputHeight !== undefined,
    'Invalid "height" value: %s, %s',
    heightAttr,
    element
  );

  // Effective layout attributes. These are effectively constants.
  let width;
  let height;
  let layout;

  // Calculate effective width and height.
  if (
    (!inputLayout ||
      inputLayout == Layout_Enum.FIXED ||
      inputLayout == Layout_Enum.FIXED_HEIGHT) &&
    (!inputWidth || !inputHeight) &&
    hasNaturalDimensions(element.tagName)
  ) {
    // Default width and height: handle elements that do not specify a
    // width/height and are defined to have natural browser dimensions.
    const dimensions = getNaturalDimensions(element);
    width =
      inputWidth || inputLayout == Layout_Enum.FIXED_HEIGHT
        ? inputWidth
        : dimensions.width;
    height = inputHeight || dimensions.height;
  } else {
    width = inputWidth;
    height = inputHeight;
  }

  // Calculate effective layout.
  if (inputLayout) {
    layout = inputLayout;
  } else if (!width && !height) {
    layout = Layout_Enum.CONTAINER;
  } else if (height == 'fluid') {
    layout = Layout_Enum.FLUID;
  } else if (height && (!width || width == 'auto')) {
    layout = Layout_Enum.FIXED_HEIGHT;
  } else if (height && width && (sizesAttr || heightsAttr)) {
    layout = Layout_Enum.RESPONSIVE;
  } else {
    layout = Layout_Enum.FIXED;
  }

  if (
    layout == Layout_Enum.FIXED ||
    layout == Layout_Enum.FIXED_HEIGHT ||
    layout == Layout_Enum.RESPONSIVE ||
    layout == Layout_Enum.INTRINSIC
  ) {
    userAssert(height, 'The "height" attribute is missing: %s', element);
  }
  if (layout == Layout_Enum.FIXED_HEIGHT) {
    userAssert(
      !width || width == 'auto',
      'The "width" attribute must be missing or "auto": %s',
      element
    );
  }
  if (
    layout == Layout_Enum.FIXED ||
    layout == Layout_Enum.RESPONSIVE ||
    layout == Layout_Enum.INTRINSIC
  ) {
    userAssert(
      width && width != 'auto',
      'The "width" attribute must be present and not "auto": %s',
      element
    );
  }

  if (layout == Layout_Enum.RESPONSIVE || layout == Layout_Enum.INTRINSIC) {
    userAssert(
      getLengthUnits(width) == getLengthUnits(height),
      'Length units should be the same for "width" and "height": %s, %s, %s',
      widthAttr,
      heightAttr,
      element
    );
  } else {
    userAssert(
      heightsAttr === null,
      '"heights" attribute must be missing: %s',
      element
    );
  }

  return {layout, width, height};
}
