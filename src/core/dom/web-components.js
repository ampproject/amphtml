import {toWin} from '#core/window';

/**
 * Possible versions of Shadow DOM spec
 * @enum {string}
 */
export const ShadowDomVersion_Enum = {
  NONE: 'none',
  V0: 'v0',
  V1: 'v1',
};

/**
 * @type {ShadowDomVersion_Enum|undefined}
 * @visibleForTesting
 */
let shadowDomSupportedVersion;

/**
 * @type {boolean|undefined}
 * @visibleForTesting
 */
let shadowCssSupported;

/**
 * @param {ShadowDomVersion_Enum|undefined} val
 * @visibleForTesting
 */
export function setShadowDomSupportedVersionForTesting(val) {
  shadowDomSupportedVersion = val;
}

/**
 * @param {boolean|undefined} val
 * @visibleForTesting
 */
export function setShadowCssSupportedForTesting(val) {
  shadowCssSupported = val;
}

/**
 * Returns `true` if the Shadow DOM is supported.
 * @return {boolean}
 */
export function isShadowDomSupported() {
  return getShadowDomSupportedVersion() != ShadowDomVersion_Enum.NONE;
}

/**
 * Returns `true` if Shadow CSS encapsulation is supported.
 * @return {boolean}
 */
export function isShadowCssSupported() {
  if (shadowCssSupported === undefined) {
    shadowCssSupported =
      isShadowDomSupported() &&
      (isNative(Element.prototype.attachShadow) ||
        isNative(Element.prototype.createShadowRoot));
  }
  return shadowCssSupported;
}

/**
 * Returns `true` if the passed function is native to the browser, and is not
 * polyfilled
 * @param {Function|undefined} func A function that is attatched to a JS
 * object.
 * @return {boolean}
 */
function isNative(func) {
  return !!func && func.toString().indexOf('[native code]') != -1;
}

/**
 * Returns the supported version of Shadow DOM spec.
 * @param {typeof Element=} opt_elementClass optional for testing
 * @return {ShadowDomVersion_Enum}
 */
export function getShadowDomSupportedVersion(opt_elementClass) {
  if (shadowDomSupportedVersion === undefined) {
    shadowDomSupportedVersion = getShadowDomVersion(
      opt_elementClass || Element
    );
  }
  return shadowDomSupportedVersion;
}

/**
 * Returns shadow dom version.
 *
 * @param {typeof Element} element
 * @return {ShadowDomVersion_Enum}
 */
function getShadowDomVersion(element) {
  if (!!element.prototype.attachShadow) {
    return ShadowDomVersion_Enum.V1;
  } else if (!!element.prototype.createShadowRoot) {
    return ShadowDomVersion_Enum.V0;
  }
  return ShadowDomVersion_Enum.NONE;
}

/**
 * @param {ShadowRoot} shadowRoot
 * @param {string} name
 * @param {string} cssText
 */
export function installShadowStyle(shadowRoot, name, cssText) {
  const doc = shadowRoot.ownerDocument;
  const win = toWin(doc.defaultView);
  if (
    shadowRoot.adoptedStyleSheets !== undefined &&
    win.CSSStyleSheet.prototype.replaceSync !== undefined
  ) {
    const cache = win[SHADOW_CSS_CACHE] || (win[SHADOW_CSS_CACHE] = {});
    let styleSheet = cache[name];
    if (!styleSheet) {
      styleSheet = new win.CSSStyleSheet();
      styleSheet.replaceSync(cssText);
      cache[name] = styleSheet;
    }
    shadowRoot.adoptedStyleSheets =
      shadowRoot.adoptedStyleSheets.concat(styleSheet);
  } else {
    const styleEl = doc.createElement('style');
    styleEl.setAttribute('data-name', name);
    styleEl.textContent = cssText;
    shadowRoot.appendChild(styleEl);
  }
}
