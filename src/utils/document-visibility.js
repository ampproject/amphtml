/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {VisibilityState} from '../visibility-state';
import {getVendorJsPropertyName} from '../style';

/**
 * @param {!Document} doc
 * @return {!VisibilityState}
 */
export function getDocumentVisibilityState(doc) {
  // New API: `document.visibilityState` property.
  const visibilityStateProp = getVendorJsPropertyName(
    doc,
    'visibilityState',
    true
  );
  if (doc[visibilityStateProp]) {
    return doc[visibilityStateProp];
  }

  // Old API: `document.hidden` property.
  const hiddenProp = getVendorJsPropertyName(doc, 'hidden', true);
  if (doc[hiddenProp]) {
    return doc[hiddenProp] ? VisibilityState.HIDDEN : VisibilityState.VISIBLE;
  }

  return VisibilityState.VISIBLE;
}

/**
 * Returns the value of "document.hidden" property. The reasons why it may
 * not be visible include document in a non-active tab or when the document
 * is being pre-rendered via link with rel="prerender".
 * @param {!Document} doc
 * @return {boolean}
 */
export function isDocumentHidden(doc) {
  return getDocumentVisibilityState(doc) != VisibilityState.VISIBLE;
}

/**
 * @param {!Document} doc
 * @param {function()} handler
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
 * @param {!Document} doc
 * @param {function()} handler
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
 * @param {!Document} doc
 * @return {?string}
 */
function getVisibilityChangeEvent(doc) {
  const hiddenProp = getVendorJsPropertyName(doc, 'hidden', true);
  const vendorStop = hiddenProp.indexOf('Hidden');
  return vendorStop != -1
    ? hiddenProp.substring(0, vendorStop) + 'Visibilitychange'
    : 'visibilitychange';
}
