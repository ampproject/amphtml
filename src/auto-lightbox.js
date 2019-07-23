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

import {ChunkPriority, chunk} from './chunk';
import {Services} from './services';
import {dev} from './log';
import {getMode} from './mode';
import {isAmphtml} from './format';

/** @const @enum {string} */
export const AutoLightboxEvents = {
  // Triggered when the lightbox attribute is newly set on an item in order to
  // process by the renderer extension (e.g. amp-lightbox-gallery).
  NEWLY_SET: 'amp-auto-lightbox:newly-set',
};

/**
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @return {boolean}
 */
function isProxyOriginOrLocalDev(ampdoc) {
  // Allow `localDev` in lieu of proxy origin for manual testing, except in
  // tests where we need to actually perform the check.
  const {win} = ampdoc;
  if (getMode(win).localDev && !getMode(win).test) {
    return true;
  }

  // An attached node is required for proxy origin check. If no elements are
  // present, short-circuit.
  if (!ampdoc.isSingleDoc()) {
    return false;
  }

  const {documentElement} = ampdoc.getRootNode();
  if (!documentElement) {
    return false;
  }

  // TODO(alanorozco): Additionally check for transformed, webpackaged flag.
  // See git.io/fhQ0a (#20359) for details.
  return Services.urlForDoc(documentElement).isProxyOrigin(win.location);
}

/**
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installAutoLightboxExtension(ampdoc) {
  const {win} = ampdoc;
  // Only enabled on proxy origins for which the document is tagged as
  // <html amp> or <html ⚡>.
  if (!isAmphtml(win.document) || !isProxyOriginOrLocalDev(ampdoc)) {
    return;
  }
  chunk(
    ampdoc,
    () => {
      Services.extensionsFor(win).installExtensionForDoc(
        ampdoc,
        'amp-auto-lightbox'
      );
    },
    ChunkPriority.LOW
  );
}

/**
 * @param {!Element} element
 * @return {boolean}
 */
export function isActionableByTap(element) {
  if (element.tagName.toLowerCase() == 'a' && element.hasAttribute('href')) {
    return true;
  }
  if (element.querySelector('a[href]')) {
    return true;
  }
  const action = Services.actionServiceForDoc(element);
  const hasTapAction = action.hasResolvableAction(
    element,
    'tap',
    dev().assertElement(element.parentElement)
  );
  if (hasTapAction) {
    return true;
  }
  const actionables = element.querySelectorAll('[on]');
  for (let i = 0; i < actionables.length; i++) {
    const actionable = actionables[i];
    const hasTapAction = action.hasResolvableAction(
      actionable,
      'tap',
      dev().assertElement(actionable.parentElement)
    );
    if (hasTapAction) {
      return true;
    }
  }
  return false;
}
