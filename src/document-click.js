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
import {getService} from './service';
import {log} from './log';
import {parseUrl} from './url';
import {viewportFor} from './viewport';
import {platform} from './platform';


/**
 * @param {!Window} window
 */
export function installGlobalClickListener(window) {
  clickHandlerFor(window);
}

/**
 * @param {!Window} window
 */
export function uninstallGlobalClickListener(window) {
  clickHandlerFor(window).cleanup();
}

/**
 * @param {!Window} window
 */
function clickHandlerFor(window) {
  return getService(window, 'clickhandler', () => {
    return new ClickHandler(window);
  });
}

/**
 * Intercept any click on the current document and prevent any
 * linking to an identifier from pushing into the history stack.
 * visibleForTesting
 */
export class ClickHandler {
  /**
   * @param {!Window} window
   */
  constructor(window) {
    /** @private @const {!Window} */
    this.win = window;

    /** @private @const {!Viewport} */
    this.viewport_ = viewportFor(window);

    /** @private @const {!Function} */
    this.boundHandle_ = this.handle_.bind(this);

    this.win.document.documentElement.addEventListener('click',
        this.boundHandle_);
  }

  /**
   * Removes all event listeners.
   */
  cleanup() {
    this.win.document.documentElement.removeEventListener('click',
        this.boundHandle_);
  }

  /**
   * Intercept any click on the current document and prevent any
   * linking to an identifier from pushing into the history stack.
   * @param {!Event} e
   */
  handle_(e) {
    onDocumentElementClick_(e, this.viewport_);
  }
}


/**
 * Intercept any click on the current document and prevent any
 * linking to an identifier from pushing into the history stack.
 *
 * This also handles custom protocols (e.g. whatsapp://) when iframed
 * on iOS Safari.
 *
 * @param {!Event} e
 * @param {!Viewport} viewport
 */
export function onDocumentElementClick_(e, viewport) {
  if (e.defaultPrevented) {
    return;
  }

  const target = closestByTag(e.target, 'A');
  if (!target) {
    return;
  }

  let elem = null;
  const docElement = e.currentTarget;
  const doc = docElement.ownerDocument;
  const win = doc.defaultView;

  const tgtLoc = parseUrl(target.href);

  // On Safari iOS, custom protocol links will fail to open apps when the
  // document is iframed - in order to go around this, we set the top.location
  // to the custom protocol href.
  const isSafariIOS = platform.isIos() && platform.isSafari();
  const isEmbedded = win.parent && win.parent != win;
  const isNormalProtocol = /^https?:$/.test(tgtLoc.protocol);
  if (isSafariIOS && isEmbedded && !isNormalProtocol) {
    win.open(target.href, '_blank');
    // Without preventing default the page would should an alert error twice
    // in the case where there's no app to handle the custom protocol.
    e.preventDefault();
  }

  if (!tgtLoc.hash) {
    return;
  }

  const curLoc = parseUrl(win.location.href);
  const tgtHref = `${tgtLoc.origin}${tgtLoc.pathname}${tgtLoc.search}`;
  const curHref = `${curLoc.origin}${curLoc.pathname}${curLoc.search}`;

  // If the current target anchor link is the same origin + path
  // as the current document then we know we are just linking to an
  // identifier in the document.
  if (tgtHref != curHref) {
    return;
  }

  // We prevent default so that the current click does not push
  // into the history stack as this messes up the external documents
  // history which contains the amp document.
  e.preventDefault();

  const hash = tgtLoc.hash.slice(1);
  elem = doc.getElementById(hash);

  if (!elem) {
    // Fallback to anchor[name] if element with id is not found.
    // Linking to an anchor element with name is obsolete in html5.
    elem = doc.querySelector(`a[name=${hash}]`);
  }

  if (elem) {
    // TODO(dvoytenko): consider implementing animated scroll.
    viewport./*OK*/scrollIntoView(elem);
  } else {
    log.warn('documentElement',
        `failed to find element with id=${hash} or a[name=${hash}]`);
  }
  const history = win.history;
  // If possible do update the URL with the hash. As explained above
  // we do replaceState to avoid messing with the container's history.
  if (history.replaceState) {
    history.replaceState(null, '', `#${hash}`);
  }
};
