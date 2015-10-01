/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {closestByTag} from './dom';
import {log} from './log';
import {parseUrl} from './url';

/**
 * @param {!Window} window
 */
export function installGlobalClickListener(window) {
  window.document.documentElement
      .addEventListener('click', onDocumentElementClick_);
}

/**
 * @param {!Window} window
 */
export function uninstallGlobalClickListener(window) {
  window.document.documentElement
      .removeEventListener('click', onDocumentElementClick_);
}

/**
 * Intercept any click on the current document and prevent any
 * linking to an identifier from pushing into the history stack.
 * @param {!Event} e
 * @visibleForTesting
 */
export function onDocumentElementClick_(e) {
  if (e.defaultPrevented) {
    return;
  }

  let target = closestByTag(e.target, 'A');
  if (!target) {
    return;
  }

  let elem = null;
  let docElement = e.currentTarget;
  let doc = docElement.ownerDocument;
  let tgtLoc = parseUrl(target.href);
  let curLoc = parseUrl(doc.location.href);
  let tgtHref = `${tgtLoc.origin}${tgtLoc.pathname}`;
  let curHref = `${curLoc.origin}${curLoc.pathname}`;

  // If the current target anchor link is the same origin + path
  // as the current document then we know we are just linking to an
  // identifier in the document.
  if (tgtHref == curHref) {
    // We prevent default so that the current click does not push
    // into the history stack as this messes up the external documents
    // history which contains the amp document.
    e.preventDefault();

    let hash = tgtLoc.hash.slice(1);
    elem = doc.getElementById(hash);

    if (!elem) {
      // Fallback to anchor[name] if element with id is not found.
      // Linking to an anchor element with name is obsolete in html5.
      elem = doc.querySelector(`a[name=${hash}]`);
    }

    if (elem) {
      elem.scrollIntoView(true);
    } else {
      log.warn('documentElement',
          `failed to find element with id=${hash} or a[name=${hash}]`);
    }
  }
}
