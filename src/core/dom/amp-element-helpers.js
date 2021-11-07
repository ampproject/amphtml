import {devAssert} from '#core/assert';
import {Deferred} from '#core/data-structures/promise';

/** @const {string} */
export const UPGRADE_TO_CUSTOMELEMENT_PROMISE = '__AMP_UPG_PRM';

/** @const {string} */
export const UPGRADE_TO_CUSTOMELEMENT_RESOLVER = '__AMP_UPG_RES';

/**
 * Determines if this element is an AMP element
 * @param {!Element} element
 * @return {boolean}
 */
export function isAmpElement(element) {
  const tag = element.tagName;
  // Use prefix to recognize AMP element. This is necessary because stub
  // may not be attached yet.
  return (
    tag.startsWith('AMP-') &&
    // Some "amp-*" elements are not really AMP elements. :smh:
    !(tag == 'AMP-STICKY-AD-TOP-PADDING' || tag == 'AMP-BODY')
  );
}

/**
 * Return a promise that resolve when an AMP element upgrade from HTMLElement
 * to CustomElement
 * @param {!HTMLElement} element
 * @return {!Promise<!AmpElement>}
 */
export function whenUpgradedToCustomElement(element) {
  devAssert(isAmpElement(element), 'element is not AmpElement');
  if (element.createdCallback) {
    // Element already is CustomElement;
    return Promise.resolve(/**@type {!AmpElement} */ (element));
  }
  // If Element is still HTMLElement, wait for it to upgrade to customElement
  // Note: use pure string to avoid obfuscation between versions.
  if (!element[UPGRADE_TO_CUSTOMELEMENT_PROMISE]) {
    const deferred = new Deferred();
    element[UPGRADE_TO_CUSTOMELEMENT_PROMISE] = deferred.promise;
    element[UPGRADE_TO_CUSTOMELEMENT_RESOLVER] = deferred.resolve;
  }

  return element[UPGRADE_TO_CUSTOMELEMENT_PROMISE];
}
