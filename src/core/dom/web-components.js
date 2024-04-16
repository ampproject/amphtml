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
  if (shadowCssSupported !== undefined) {
    return shadowCssSupported;
  }

  if (!isShadowDomSupported()) {
    shadowCssSupported = false;
  } else {
    const shadowRoot =
      getShadowDomSupportedVersion() === ShadowDomVersion_Enum.V0
        ? self.document.createElement('div').createShadowRoot()
        : self.document.createElement('div').attachShadow({mode: 'open'});

    shadowCssSupported =
      isNative(ShadowRoot) && shadowRoot instanceof ShadowRoot;
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
