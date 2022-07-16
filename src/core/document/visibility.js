import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {getVendorJsPropertyName} from '#core/dom/style';

/**
 * @param {Document} doc
 * @return {VisibilityState_Enum}
 */
export function getDocumentVisibilityState(doc) {
  // New API: `document.visibilityState` property.
  const visibilityStateProp = getVendorJsPropertyName(
    doc,
    'visibilityState',
    true
  );
  const visibilityStateValue = /** @type {*} */ (doc)[visibilityStateProp];
  if (visibilityStateValue) {
    return visibilityStateValue;
  }

  // Old API: `document.hidden` property.
  const hiddenProp = getVendorJsPropertyName(doc, 'hidden', true);
  if (hiddenProp in doc) {
    const hiddenValue = /** @type {*} */ (doc)[hiddenProp];
    return hiddenValue
      ? VisibilityState_Enum.HIDDEN
      : VisibilityState_Enum.VISIBLE;
  }

  return VisibilityState_Enum.VISIBLE;
}

/**
 * Returns the value of "document.hidden" property. The reasons why it may
 * not be visible include document in a non-active tab or when the document
 * is being pre-rendered via link with rel="prerender".
 * @param {Document} doc
 * @return {boolean}
 */
export function isDocumentHidden(doc) {
  return getDocumentVisibilityState(doc) != VisibilityState_Enum.VISIBLE;
}

/**
 * @param {Document} doc
 * @param {function():void} handler
 */
export function addDocumentVisibilityChangeListener(doc, handler) {
  if (!doc.addEventListener) {
    return;
  }
  const visibilityChangeEvent = getVisibilityChangeEvent(doc);
  if (visibilityChangeEvent) {
    doc.addEventListener(visibilityChangeEvent, handler);
  }
}

/**
 * @param {Document} doc
 * @param {function():void} handler
 */
export function removeDocumentVisibilityChangeListener(doc, handler) {
  if (!doc.removeEventListener) {
    return;
  }
  const visibilityChangeEvent = getVisibilityChangeEvent(doc);
  if (visibilityChangeEvent) {
    doc.removeEventListener(visibilityChangeEvent, handler);
  }
}

/**
 * @param {Document} doc
 * @return {?string}
 */
function getVisibilityChangeEvent(doc) {
  const hiddenProp = getVendorJsPropertyName(doc, 'hidden', true);
  const vendorStop = hiddenProp.indexOf('Hidden');
  return vendorStop != -1
    ? hiddenProp.substring(0, vendorStop) + 'Visibilitychange'
    : 'visibilitychange';
}
