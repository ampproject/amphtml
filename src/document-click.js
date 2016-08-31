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
import {platformFor} from './platform';
import {urlReplacementsFor} from './url-replacements';
import {isShadowRoot} from './types';
import {closestNode} from './dom';

/** @private @const {string} */
const ORIGINAL_HREF_ATTRIBUTE = 'data-amp-orig-href';

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
 * @visibleForTesting
 */
export class ClickHandler {
  /**
   * @param {!Window} window
   */
  constructor(window) {
    /** @const {!Window} */
    this.win = window;

    /** @private @const {!./service/viewport-impl.Viewport} */
    this.viewport_ = viewportFor(this.win);

    /** @private @const {!./service/viewer-impl.Viewer} */
    this.viewer_ = viewerFor(this.win);

    /** @private @const {!./service/history-impl.History} */
    this.history_ = historyFor(this.win);

    /** @private @const {!./service/url-replacements.UrlReplacements} */
    this.urlReplacements_ = urlReplacementsFor(this.win);

    const platform = platformFor(this.win);
    /** @private @const {boolean} */
    this.isIosSafari_ = platform.isIos() && platform.isSafari();

    /** @private {!Array<!function(!Event)|undefined>} */
    this.boundHandlers_ = [];

    // Only intercept clicks when iframed.
    if (this.viewer_.isIframed() && this.viewer_.isOvertakeHistory()) {
      this.boundHandlers_.push(this.handle_.bind(this));
      this.win.document.documentElement.addEventListener(
          'click', this.boundHandlers_[this.boundHandlers_.length - 1]);
    }
    // Add capture phase click handler for anchor target href expansion.
    this.boundHandlers_.push(this.handle_.bind(this, true));
    this.win.document.documentElement.addEventListener(
        'click', this.boundHandlers_[this.boundHandlers_.length - 1]);
  }

  /**
   * Removes all event listeners.
   */
  cleanup() {
    this.boundHandlers_.forEach(handler => {
      this.win.document.documentElement.removeEventListener(
          'click', handler);
    });
    this.boundHandlers_ = [];
  }

  /**
   * Click event handler which on bubble propagation intercepts any click on the
   * current document and prevent any linking to an identifier from pushing into
   * the history stack; on capture propagation expands anchor href.
   * @param {boolean} isCapture
   * @param {!Event} e
   */
  handle_(isCapture, e) {
    onDocumentElementClick_(e, this.viewport_, this.history_,
        this.urlReplacements_, this.isIosSafari_, isCapture);
  }
}

/**
 * Locate first element with given tag name within event path from shadowRoot.
 * @param {!Event} e
 * @param {!string} tagName
 * @return {?Element}
 * @visibleForTesting
 */
export function getElementByTagNameFromEventShadowDomPath(e, tagName) {
  for (let i = 0; i < (e.path ? e.path.length : 0); i++) {
    const element = e.path[i];
    if (element && element.tagName.toUpperCase() == tagName) {
      return element;
    }
  }
  return null;
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
 * @param {!./service/url-replacements.UrlReplacements} urlReplacements
 * @param {boolean} isIosSafari
 * @param {boolean} isIframed
 * @param {boolean} isCapture whether event was caught during capture
 *                  propagation.
 */
export function onDocumentElementClick_(e, viewport, history, urlReplacements,
                                        isIosSafari, isCapture) {
  if (e.defaultPrevented) {
    return;
  }

  // If within a shadowRoot, the event target will be the host element due to
  // event target rewrite.  Given that it is possible a shadowRoot could be
  // within an anchor tag, we need to check the event path prior to looking
  // at the host element's closest tags.
  const target = getElementByTagNameFromEventShadowDomPath(e, 'A') ||
      closestByTag(e.target, 'A');
  if (!target) {
    return;
  }

  // Capture event listener only interested in anchor target href expansion.
  if (isCapture) {
    // Expand URL where valid.
    if (target.href) {
      target.href = expandTargetHref_(e, target, urlReplacements);
    }
    return;
  }

  const docElement = e.currentTarget;
  const doc = docElement.ownerDocument;
  const win = doc.defaultView;

  const tgtLoc = parseUrl(target.href);

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
    dev().warn('documentElement',
        `failed to find element with id=${hash} or a[name=${hash}]`);
  }

  // Push/pop history.
  history.push(() => {
    win.location.replace(`${curLoc.hash || '#'}`);
  });
};

/**
 * Determines the offset of an element's shadowRoot host if it has one,
 * otherwise return top/left 0.
 * @param {EventTarget} element
 * @return {!{top: number, left: number}}
 * @private
 */
function getShadowHostOffset_(element) {
  if (element) {
    const shadowRoot = closestNode(element, parent => {
      return isShadowRoot(parent);
    });
    if (shadowRoot && shadowRoot.host) {
      // Can we guarantee offsetTop/Left are correct values without
      // forcing a promise measure?  Given we cannot wait, what values would
      // we expect here?
      return {top: shadowRoot.host./*REVIEW*/offsetTop,
        left: shadowRoot.host./*REVIEW*/offsetLeft};
    }
  }
  return {top: 0, left: 0};
};

/**
 * Expand click target href synchronously using UrlReplacements service
 * including CLICK_X/CLICK_Y page offsets (if within shadowRoot will reference
 * from host).
 *
 * @param {!Event} e click event.
 * @param {!Element} target nearest anchor to event target.
 * @param {!./service/url-replacements.UrlReplacements} urlReplacements
 * @return {string|undefined} expanded href
 * @visibleForTesting
 */
export function expandTargetHref_(e, target, urlReplacements) {
  const hrefToExpand =
    target.getAttribute(ORIGINAL_HREF_ATTRIBUTE) || target.getAttribute("href");
  if (!hrefToExpand) {
    return;
  }
  let shadowHostOffset;
  const vars = {
    'CLICK_X': () => {
      if (e.clientX === undefined) {
        return '';
      }
      shadowHostOffset =
        shadowHostOffset || getShadowHostOffset_(e.target);
      return String(e.clientX - shadowHostOffset.left);
    },
    'CLICK_Y': () => {
      if (e.clientY === undefined) {
        return '';
      }
      shadowHostOffset =
        shadowHostOffset || getShadowHostOffset_(e.target);
      return String(e.clientY - shadowHostOffset.top);
    },
  };
  let newHref = urlReplacements.expandSync(hrefToExpand, vars);
  if (newHref != hrefToExpand) {
    // Store original value so that later clicks can be processed with
    // freshest values.
    if (!target.getAttribute(ORIGINAL_HREF_ATTRIBUTE)) {
      target.setAttribute(ORIGINAL_HREF_ATTRIBUTE, hrefToExpand);
    }
    target.setAttribute('href', newHref);
  }
  return newHref;
};
