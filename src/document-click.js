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
import {fromClass} from './service';
import {dev} from './log';
import {historyFor} from './history';
import {openWindowDialog} from './dom';
import {parseUrl} from './url';
import {viewerFor} from './viewer';
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
  return fromClass(window, 'clickhandler', ClickHandler);
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

    /** @private @const {!./service/viewport-impl.Viewport} */
    this.viewport_ = viewportFor(this.win);

    /** @private @const {!./service/viewer-impl.Viewer} */
    this.viewer_ = viewerFor(this.win);

    /** @private @const {!./service/history-impl.History} */
    this.history_ = historyFor(this.win);

    // Only intercept clicks when iframed.
    if (this.viewer_.isIframed() && this.viewer_.isOvertakeHistory()) {
      /** @private @const {!function(!Event)|undefined} */
      this.boundHandle_ = this.handle_.bind(this);
      this.win.document.documentElement.addEventListener(
          'click', this.boundHandle_);
    }
  }

  /**
   * Removes all event listeners.
   */
  cleanup() {
    if (this.boundHandle_) {
      this.win.document.documentElement.removeEventListener(
          'click', this.boundHandle_);
    }
  }

  /**
   * Intercept any click on the current document and prevent any
   * linking to an identifier from pushing into the history stack.
   * @param {!Event} e
   */
  handle_(e) {
    onDocumentElementClick_(e, this.viewport_, this.history_);
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
 * @param {!./service/viewport-impl.Viewport} viewport
 * @param {!./service/history-impl.History} history
 */
export function onDocumentElementClick_(e, viewport, history) {
  if (e.defaultPrevented) {
    return;
  }

  const target = closestByTag(e.target, 'A');
  if (!target) {
    return;
  }

  const docElement = e.currentTarget;
  const doc = docElement.ownerDocument;
  const win = doc.defaultView;

  const tgtLoc = parseUrl(target.href);

  // On Safari iOS, custom protocol links will fail to open apps when the
  // document is iframed - in order to go around this, we set the top.location
  // to the custom protocol href.
  const isSafariIOS = platform.isIos() && platform.isSafari();
  const isFTP = tgtLoc.protocol == 'ftp:';

  // In case of FTP Links in embedded documents always open then in _blank.
  if (isFTP) {
    openWindowDialog(win, target.href, '_blank');
    e.preventDefault();
  }

  const isNormalProtocol = /^(https?|mailto):$/.test(tgtLoc.protocol);
  if (isSafariIOS && !isNormalProtocol) {
    openWindowDialog(win, target.href, '_top');
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

  // Has the fragment actually changed?
  if (tgtLoc.hash == curLoc.hash) {
    return;
  }

  // We prevent default so that the current click does not push
  // into the history stack as this messes up the external documents
  // history which contains the amp document.
  e.preventDefault();

  // Look for the referenced element.
  const hash = tgtLoc.hash.slice(1);
  let elem = null;
  if (hash) {
    elem = doc.getElementById(hash);
    if (!elem) {
      // Fallback to anchor[name] if element with id is not found.
      // Linking to an anchor element with name is obsolete in html5.
      elem = doc.querySelector(`a[name=${hash}]`);
    }
  }

  // If possible do update the URL with the hash. As explained above
  // we do `replace` to avoid messing with the container's history.
  // The choice of `location.replace` vs `history.replaceState` is important.
  // Due to bugs, not every browser triggers `:target` pseudo-class when
  // `replaceState` is called. See http://www.zachleat.com/web/moving-target/
  // for more details.
  win.location.replace(`#${hash}`);

  // Scroll to the element if found.
  if (elem) {
    viewport./*OK*/scrollIntoView(elem);
  } else {
    dev.warn('documentElement',
        `failed to find element with id=${hash} or a[name=${hash}]`);
  }

  // Push/pop history.
  history.push(() => {
    win.location.replace(`${curLoc.hash || '#'}`);
  });
};
