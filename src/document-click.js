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

import {
  closestByTag,
  openWindowDialog,
  escapeCssSelectorIdent,
} from './dom';
import {fromClassForDoc} from './service';
import {dev} from './log';
import {historyForDoc} from './history';
import {parseUrl} from './url';
import {viewerForDoc} from './viewer';
import {viewportForDoc} from './viewport';
import {platformFor} from './platform';
import {timerFor} from './timer';
import {urlReplacementsForDoc} from './url-replacements';


/**
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installGlobalClickListenerForDoc(ampdoc) {
  fromClassForDoc(ampdoc, 'clickhandler', ClickHandler);
}


/**
 * Intercept any click on the current document and prevent any
 * linking to an identifier from pushing into the history stack.
 * @visibleForTesting
 */
export class ClickHandler {
  /**
   * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!./service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private @const {!./service/viewport-impl.Viewport} */
    this.viewport_ = viewportForDoc(this.ampdoc);

    /** @private @const {!./service/viewer-impl.Viewer} */
    this.viewer_ = viewerForDoc(this.ampdoc);

    /** @private @const {!./service/history-impl.History} */
    this.history_ = historyForDoc(this.ampdoc);

    const platform = platformFor(this.ampdoc.win);
    /** @private @const {boolean} */
    this.isIosSafari_ = platform.isIos() && platform.isSafari();

    /** @private @const {boolean} */
    this.isIframed_ = (this.viewer_.isIframed() &&
        this.viewer_.isOvertakeHistory());

    /** @private @const {!function(!Event)|undefined} */
    this.boundHandle_ = this.handle_.bind(this);
    this.ampdoc.getRootNode().addEventListener('click', this.boundHandle_);
  }

  /**
   * Removes all event listeners.
   */
  cleanup() {
    if (this.boundHandle_) {
      this.ampdoc.getRootNode().removeEventListener('click', this.boundHandle_);
    }
  }

  /**
   * Click event handler which on bubble propagation intercepts any click on the
   * current document and prevent any linking to an identifier from pushing into
   * the history stack.
   * @param {!Event} e
   */
  handle_(e) {
    onDocumentElementClick_(
        e, this.ampdoc, this.viewport_, this.history_, this.isIosSafari_,
        this.isIframed_);
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
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!./service/viewport-impl.Viewport} viewport
 * @param {!./service/history-impl.History} history
 * @param {boolean} isIosSafari
 * @param {boolean} isIframed
 */
export function onDocumentElementClick_(
    e, ampdoc, viewport, history, isIosSafari, isIframed) {
  if (e.defaultPrevented) {
    return;
  }

  const target = closestByTag(dev().assertElement(e.target), 'A');
  if (!target || !target.href) {
    return;
  }
  urlReplacementsForDoc(ampdoc).maybeExpandLink(target);

  const tgtLoc = parseUrl(target.href);
  // Handle custom protocols only if the document is iframe'd.
  if (isIframed) {
    handleCustomProtocolClick_(e, target, tgtLoc, ampdoc, isIosSafari);
  }

  if (tgtLoc.hash) {
    handleHashClick_(e, tgtLoc, ampdoc, viewport, history);
  }
}


/**
 * Handles clicking on a custom protocol link.
 * @param {!Event} e
 * @param {!Element} target
 * @param {!Location} tgtLoc
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {boolean} isIosSafari
 * @private
 */
function handleCustomProtocolClick_(e, target, tgtLoc, ampdoc, isIosSafari) {
  /** @const {!Window} */
  const win = ampdoc.win;
  // On Safari iOS, custom protocol links will fail to open apps when the
  // document is iframed - in order to go around this, we set the top.location
  // to the custom protocol href.
  const isFTP = tgtLoc.protocol == 'ftp:';

  // In case of FTP Links in embedded documents always open then in _blank.
  if (isFTP) {
    openWindowDialog(win, target.href, '_blank');
    e.preventDefault();
  }

  const isNormalProtocol = /^(https?|mailto):$/.test(tgtLoc.protocol);
  if (isIosSafari && !isNormalProtocol) {
    openWindowDialog(win, target.href, '_top');
    // Without preventing default the page would should an alert error twice
    // in the case where there's no app to handle the custom protocol.
    e.preventDefault();
  }
}


/**
 * Handles clicking on a link with hash navigation.
 * @param {!Event} e
 * @param {!Location} tgtLoc
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!./service/viewport-impl.Viewport} viewport
 * @param {!./service/history-impl.History} history
 * @private
 */
function handleHashClick_(e, tgtLoc, ampdoc, viewport, history) {
  /** @const {!Window} */
  const win = ampdoc.win;
  /** @const {!Location} */
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

  // Look for the referenced element.
  const hash = tgtLoc.hash.slice(1);
  let elem = null;

  if (hash) {
    const escapedHash = escapeCssSelectorIdent(win, hash);
    elem = (ampdoc.getRootNode().getElementById(hash) ||
        // Fallback to anchor[name] if element with id is not found.
        // Linking to an anchor element with name is obsolete in html5.
        ampdoc.getRootNode().querySelector(`a[name="${escapedHash}"]`));
  }

  // If possible do update the URL with the hash. As explained above
  // we do `replace` to avoid messing with the container's history.
  if (tgtLoc.hash != curLoc.hash) {
    history.replaceStateForTarget(tgtLoc.hash).then(() => {
      scrollToElement(elem, win, viewport, hash);
    });
  } else {
    // If the hash did not update just scroll to the element.
    scrollToElement(elem, win, viewport, hash);
  }
}


/**
 * Scrolls the page to the given element.
 * @param {?Element} elem
 * @param {!Window} win
 * @param {!./service/viewport-impl.Viewport} viewport
 * @param {string} hash
 */
function scrollToElement(elem, win, viewport, hash) {
  // Scroll to the element if found.
  if (elem) {
    // The first call to scrollIntoView overrides browsers' default
    // scrolling behavior. The second call insides setTimeout allows us to
    // scroll to that element properly.
    // Without doing this, the viewport will not catch the updated scroll
    // position on iOS Safari and hence calculate the wrong scrollTop for
    // the scrollbar jumping the user back to the top for failing to calculate
    // the new jumped offset.
    // Without the first call there will be a visual jump due to browser scroll.
    // See https://github.com/ampproject/amphtml/issues/5334 for more details.
    viewport./*OK*/scrollIntoView(elem);
    timerFor(win).delay(() => viewport./*OK*/scrollIntoView(
        dev().assertElement(elem)), 1);
  } else {
    dev().warn('HTML',
        `failed to find element with id=${hash} or a[name=${hash}]`);
  }
}
