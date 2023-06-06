// Note: loaded by 3p system. Cannot rely on babel polyfills.
import {devAssert} from '#core/assert';
import {devError} from '#core/error';
import {map} from '#core/types/object';

/** @type {{[key: string]: string}} */
let propertyNameCache;

/** @const {Array<string>} */
const vendorPrefixes = ['Webkit', 'webkit', 'Moz', 'moz', 'ms', 'O', 'o'];

const DISPLAY_STYLE_MESSAGE =
  '`display` style detected. You must use toggle instead.';

const EMPTY_CSS_DECLARATION = /** @type {CSSStyleDeclaration} */ (
  /** @type {?} */ ({
    'getPropertyPriority': () => '',
    'getPropertyValue': () => '',
  })
);

/**
 * @param {string} camelCase camel cased string
 * @return {string} title cased string
 */
export function camelCaseToTitleCase(camelCase) {
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * @param {string} camelCase camel cased string
 * @return {string} hyphen-cased string
 */
export function camelCaseToHyphenCase(camelCase) {
  const hyphenated = camelCase.replace(
    /[A-Z]/g,
    (match) => '-' + match.toLowerCase()
  );

  // For o-foo or ms-foo, we need to convert to -o-foo and ms-foo
  if (vendorPrefixes.some((prefix) => hyphenated.startsWith(prefix + '-'))) {
    return `-${hyphenated}`;
  }
  return hyphenated;
}

/**
  Checks the style if a prefixed version of a property exists and returns
 * it or returns an empty string.
 * @private
 * @param {{[key: string]: *}} style
 * @param {string} titleCase the title case version of a css property name
 * @return {string} the prefixed property name or null.
 */
function getVendorJsPropertyName_(style, titleCase) {
  for (let i = 0; i < vendorPrefixes.length; i++) {
    const propertyName = vendorPrefixes[i] + titleCase;
    if (style[propertyName] !== undefined) {
      return propertyName;
    }
  }
  return '';
}

/**
 * Returns the possibly prefixed JavaScript property name of a style property
 * (ex. WebkitTransitionDuration) given a camelCase'd version of the property
 * (ex. transitionDuration).
 * @param {*} style
 * @param {string} camelCase the camel cased version of a css property name
 * @param {boolean=} opt_bypassCache bypass the memoized cache of property
 *   mapping
 * @return {string}
 */
export function getVendorJsPropertyName(style, camelCase, opt_bypassCache) {
  if (isVar(camelCase)) {
    // CSS vars are returned as is.
    return camelCase;
  }

  if (!propertyNameCache) {
    propertyNameCache = map();
  }
  let propertyName = propertyNameCache[camelCase];
  if (!propertyName || opt_bypassCache) {
    propertyName = camelCase;
    if (style[camelCase] === undefined) {
      const titleCase = camelCaseToTitleCase(camelCase);
      const prefixedPropertyName = getVendorJsPropertyName_(style, titleCase);

      if (style[prefixedPropertyName] !== undefined) {
        propertyName = prefixedPropertyName;
      }
    }
    if (!opt_bypassCache) {
      propertyNameCache[camelCase] = propertyName;
    }
  }
  return propertyName;
}

/**
 * Sets the CSS styles of the specified element with !important. The styles
 * are specified as a map from CSS property names to their values.
 * @param {HTMLElement} element
 * @param {{[key: string]: *}} styles
 */
export function setImportantStyles(element, styles) {
  const {style} = element;
  for (const k in styles) {
    style.setProperty(
      camelCaseToHyphenCase(getVendorJsPropertyName(style, k)),
      String(styles[k]),
      'important'
    );
  }
}

/**
 * Sets the CSS style of the specified element with optional units, e.g. "px".
 * @param {HTMLElement} element
 * @param {string} property
 * @param {*} value
 * @param {string=} opt_units
 * @param {boolean=} opt_bypassCache
 */
export function setStyle(element, property, value, opt_units, opt_bypassCache) {
  const propertyName = getVendorJsPropertyName(
    element.style,
    property,
    opt_bypassCache
  );
  if (!propertyName) {
    return;
  }
  const styleValue = opt_units ? value + opt_units : value;
  element.style.setProperty(camelCaseToHyphenCase(propertyName), styleValue);
}

/**
 * Returns the value of the CSS style of the specified element.
 * @param {HTMLElement} element
 * @param {string} property
 * @param {boolean=} opt_bypassCache
 * @return {*}
 */
export function getStyle(element, property, opt_bypassCache) {
  const propertyName = getVendorJsPropertyName(
    element.style,
    property,
    opt_bypassCache
  );
  if (!propertyName) {
    return undefined;
  }
  if (isVar(propertyName)) {
    return element.style.getPropertyValue(propertyName);
  }
  return /** @type {*} */ (element.style)[propertyName];
}

/**
 * Sets the CSS styles of the specified element. The styles
 * a specified as a map from CSS property names to their values.
 * @param {HTMLElement} element
 * @param {{[key: string]: *}} styles
 */
export function setStyles(element, styles) {
  for (const k in styles) {
    setStyle(element, k, styles[k]);
  }
}

/**
 * Sets the initial display style of an element. This is a last resort. If you
 * can set the initial display using CSS, YOU MUST.
 * DO NOT USE THIS TO ARBITRARILY SET THE DISPLAY STYLE AFTER INITIAL SETUP.
 *
 * @param {HTMLElement} el
 * @param {string} value
 */
export function setInitialDisplay(el, value) {
  const {style} = el;
  devAssert(
    value !== '' && value !== 'none',
    'Initial display value must not be "none". Use toggle instead.'
  );
  devAssert(
    !style['display'],
    'setInitialDisplay MUST NOT be used for ' +
      'resetting the display style. If you are looking for display:none ' +
      'toggling, use toggle instead.'
  );
  style['display'] = value;
}

/**
 * Shows or hides the specified element.
 * @param {HTMLElement} element
 * @param {boolean=} opt_display
 */
export function toggle(element, opt_display) {
  if (opt_display === undefined) {
    opt_display = element.hasAttribute('hidden');
  }
  if (opt_display) {
    element.removeAttribute('hidden');
  } else {
    element.setAttribute('hidden', '');
  }
}

/**
 * Returns a pixel value.
 * @param {number} value
 * @return {string}
 */
export function px(value) {
  return `${value}px`;
}

/**
 * Returns a degree value.
 * @param {number} value
 * @return {string}
 */
export function deg(value) {
  return `${value}deg`;
}

/**
 * Coerces a number into a string with units.
 * @param {number|string} value
 * @param {function(number):string} fn
 * @return {string}
 */
function units(value, fn) {
  return typeof value == 'number' ? fn(value) : value;
}

/**
 * Returns a "translateX" for CSS "transform" property.
 * @param {number|string} value
 * @return {string}
 */
export function translateX(value) {
  return `translateX(${units(value, px)})`;
}

/**
 * Returns a "translateX" for CSS "transform" property.
 * @param {number|string} x
 * @param {(number|string|null)=} opt_y
 * @return {string}
 */
export function translate(x, opt_y) {
  return opt_y === undefined || opt_y === null
    ? `translate(${units(x, px)})`
    : `translate(${units(x, px)}, ${units(opt_y, px)})`;
}

/**
 * Returns a "scale" for CSS "transform" property.
 * @param {number|string} value
 * @return {string}
 */
export function scale(value) {
  return `scale(${value})`;
}

/**
 * Returns a "rotate" for CSS "transform" property.
 * @param {number|string} value
 * @return {string}
 */
export function rotate(value) {
  return `rotate(${units(value, deg)})`;
}

/**
 * Remove alpha value from a rgba color value.
 * Return the new color property with alpha equals if has the alpha value.
 * Caller needs to make sure the input color value is a valid rgba/rgb value
 * @param {string} rgbaColor
 * @return {string}
 */
export function removeAlphaFromColor(rgbaColor) {
  return rgbaColor.replace(
    /\(([^,]+),([^,]+),([^,)]+),[^)]+\)/g,
    '($1,$2,$3, 1)'
  );
}

/**
 * Gets the computed style of the element. The helper is necessary to enforce
 * the possible `null` value returned by a buggy Firefox.
 *
 * @param {Window} win
 * @param {HTMLElement} el
 * @return {CSSStyleDeclaration}
 */
export function computedStyle(win, el) {
  const style = win.getComputedStyle(el);
  return style || EMPTY_CSS_DECLARATION;
}

/**
 * Resets styles that were set dynamically (i.e. inline)
 * @param {HTMLElement} element
 * @param {Array<string>} properties
 */
export function resetStyles(element, properties) {
  for (let i = 0; i < properties.length; i++) {
    setStyle(element, properties[i], null);
  }
}

/**
 * Propagates the object-fit/position element attributes as styles.
 * @param {HTMLElement} fromEl ie: amp-img
 * @param {HTMLElement} toEl ie: the img within amp-img
 */
export function propagateObjectFitStyles(fromEl, toEl) {
  if (fromEl.hasAttribute('object-fit')) {
    setStyle(toEl, 'object-fit', fromEl.getAttribute('object-fit'));
  }

  if (fromEl.hasAttribute('object-position')) {
    setStyle(toEl, 'object-position', fromEl.getAttribute('object-position'));
  }
}

/**
 * @param {string} property
 * @return {boolean}
 */
function isVar(property) {
  return property.startsWith('--');
}

/**
 * Asserts that the style is not the `display` style.
 * This is the only possible way to pass a dynamic style to setStyle.
 *
 * If you wish to set `display`, use the `toggle` helper instead. This is so
 * changes to display can trigger necessary updates. See #17475.
 *
 * @param {string} style
 * @return {string}
 */
export function assertNotDisplay(style) {
  // TODO(rcebulko): This calls itself an assert, but doesn't throw an error.
  // Should it throw sync? If so, this/below can reduce to
  // `return devAssert(style == 'display', DISPLAY_STYLE_MESSAGE);`
  if (style === 'display') {
    devError('STYLE', DISPLAY_STYLE_MESSAGE);
  }
  return style;
}

/**
 * Asserts that the styles does not contain the `display` style.
 * This is the only possible way to pass a dynamic styles object to setStyles
 * and setImportantStyles.
 *
 * If you wish to set `display`, use the `toggle` helper instead. This is so
 * changes to display can trigger necessary updates. See #17475.
 *
 * @param {{[key: string]: *}} styles
 * @return {{[key: string]: *}}
 */
export function assertDoesNotContainDisplay(styles) {
  if ('display' in styles) {
    devError('STYLE', DISPLAY_STYLE_MESSAGE);
  }
  return styles;
}
