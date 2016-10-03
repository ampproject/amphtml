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
import {fromClassForDoc} from './service';
import {dev} from './log';
import {historyForDoc} from './history';
import {openWindowDialog} from './dom';
import {parseUrl} from './url';
import {viewerFor} from './viewer';
import {viewportForDoc} from './viewport';
import {platformFor} from './platform';
import {urlReplacementsForDoc} from './url-replacements';

/** @private @const {string} */
const ORIGINAL_HREF_ATTRIBUTE = 'data-amp-orig-href';


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
    this.viewer_ = viewerFor(this.ampdoc.win);

    /** @private @const {!./service/history-impl.History} */
    this.history_ = historyForDoc(this.ampdoc);

    const platform = platformFor(this.ampdoc.win);
    /** @private @const {boolean} */
    this.isIosSafari_ = platform.isIos() && platform.isSafari();

    // Only intercept clicks when iframed.
    if (this.viewer_.isIframed() && this.viewer_.isOvertakeHistory()) {
      /** @private @const {!function(!Event)|undefined} */
      this.boundHandle_ = this.handle_.bind(this);
      this.ampdoc.getRootNode().addEventListener('click', this.boundHandle_);
    }
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
        e, this.ampdoc, this.viewport_, this.history_, this.isIosSafari_);
  }
}


/**
 * Intercept any click on the current document and prevent any
 * linking to an identifier from pushing into the history stack.
 * @visibleForTesting
 */
export class CaptureClickHandler {
  /**
   * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!./service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private @const {!./service/url-replacements-impl.UrlReplacements} */
    this.urlReplacements_ = urlReplacementsForDoc(this.ampdoc);

    /** @private {!function(!Event)} */
    this.boundHandler_ = this.handle_.bind(this);

    this.ampdoc.getRootNode().addEventListener(
        'click', this.boundHandler_, true);
  }

  /**
   * Removes all event listeners.
   */
  cleanup() {
    this.ampdoc.getRootNode().removeEventListener(
        'click', this.boundHandler_, true);
  }

  /**
   * Register clicks listener.
   * @param {!Event} e
   */
  handle_(e) {
    onDocumentElementCapturedClick_(e, this.urlReplacements_);
  }
}


/**
 * Locate first element with given tag name within event path from shadowRoot.
 * @param {!Event} e
 * @param {!string} tagName
 * @return {?Element}
 * @visibleForTesting
 */
export function getElementByTagNameFromEventShadowDomPath_(e, tagName) {
  for (let i = 0; i < (e.path ? e.path.length : 0); i++) {
    const element = e.path[i];
    if (element && element.tagName &&
        element.tagName.toUpperCase() == tagName) {
      return element;
    }
  }
  return null;
}


/**
 * Expands target anchor href on capture click event.  If within shadow DOM,
 * will offset from host element.
 * @param {!Event} e
 * @param {!./service/url-replacements-impl.UrlReplacements} urlReplacements
 */
export function onDocumentElementCapturedClick_(e, urlReplacements) {
  // If within a shadowRoot, the event target will be the host element due to
  // event target rewrite.  Given that it is possible a shadowRoot could be
  // within an anchor tag, we need to check the event path prior to looking
  // at the host element's closest tags.
  const target = getElementByTagNameFromEventShadowDomPath_(e, 'A') ||
      closestByTag(dev().assertElement(e.target), 'A');

  // Expand URL where valid.
  if (target && target.href) {
    target.href = expandTargetHref_(e, target, urlReplacements);
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
 */
export function onDocumentElementClick_(
    e, ampdoc, viewport, history, isIosSafari) {
  if (e.defaultPrevented) {
    return;
  }

  const target = closestByTag(dev().assertElement(e.target), 'A');
  if (!target) {
    return;
  }

  const win = ampdoc.win;
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

  // We prevent default so that the current click does not push
  // into the history stack as this messes up the external documents
  // history which contains the amp document.
  e.preventDefault();

  // Look for the referenced element.
  const hash = tgtLoc.hash.slice(1);
  let elem = null;

  // Removal of the targeted attribute here to disable browsers' default
  // scrolling behavior and rely on viewport./*OK*/scrollIntoView(elem)
  // call to scroll to it.
  // Without doing this, the viewport will not catch the updated scroll
  // position on iOS Safari and hence calculate the wrong scrollTop for
  // the scrollbar jumping the user back to the top for failing to calculate
  // the new jumped offset.
  // See https://github.com/ampproject/amphtml/issues/5334 for more details.
  let restoreElementsAttrs = [];
  if (hash) {
    elem = (ampdoc.getRootNode().getElementById(hash) ||
        // Fallback to anchor[name] if element with id is not found.
        // Linking to an anchor element with name is obsolete in html5.
        ampdoc.getRootNode().querySelector(`a[name=${hash}]`));
    restoreElementsAttrs = removeAttrsWithMatchingHash_(ampdoc, hash);
  }

  // If possible do update the URL with the hash. As explained above
  // we do `replace` to avoid messing with the container's history.
  // The choice of `location.replace` vs `history.replaceState` is important.
  // Due to bugs, not every browser triggers `:target` pseudo-class when
  // `replaceState` is called. See http://www.zachleat.com/web/moving-target/
  // for more details. Do this only if fragment has changed.
  if (tgtLoc.hash != curLoc.hash) {
    win.location.replace(`#${hash}`);
  }

  // Scroll to the element if found.
  if (elem) {
    viewport./*OK*/scrollIntoView(elem);
    restoreElementsAttributes_(restoreElementsAttrs);
  } else {
    dev().warn('documentElement',
        `failed to find element with id=${hash} or a[name=${hash}]`);
  }

  // Push/pop history only if fragment really changed.
  if (tgtLoc.hash != curLoc.hash) {
    history.push(() => {
      win.location.replace(`${curLoc.hash || '#'}`);
    });
  }
}


/**
 * Get offset location of click from event taking into account shadowRoot.
 * @param {!Event} e
 * @return {!{left: string, top: string}}
 */
function getClickLocation_(e) {
  // Use existence of event path as indicator that event was rewritten
  // due to shadowDom in which case the event target is the host element.
  // NOTE(keithwrightbos) - this assumes that there is only one level
  // of shadowRoot, not sure how this would behave otherwise (likely only
  // offset to closest shadowRoot).
  return {
    left: (e.clientX === undefined ? '' :
        String(e.clientX -
          (e.path && e.target ? e.target./*OK*/offsetLeft : 0))),
    top: (e.clientY === undefined ? '' :
        String(e.clientY -
          (e.path && e.target ? e.target./*OK*/offsetTop : 0))),
  };
}


/**
 * Expand click target href synchronously using UrlReplacements service
 * including CLICK_X/CLICK_Y page offsets (if within shadowRoot will reference
 * from host).
 *
 * @param {!Event} e click event.
 * @param {!Element} target nearest anchor to event target.
 * @param {!./service/url-replacements-impl.UrlReplacements} urlReplacements
 * @return {string|undefined} expanded href
 * @visibleForTesting
 */
export function expandTargetHref_(e, target, urlReplacements) {
  const hrefToExpand =
    target.getAttribute(ORIGINAL_HREF_ATTRIBUTE) || target.getAttribute('href');
  if (!hrefToExpand) {
    return;
  }
  const vars = {
    'CLICK_X': () => {
      return getClickLocation_(e).left;
    },
    'CLICK_Y': () => {
      return getClickLocation_(e).top;
    },
  };
  const newHref = urlReplacements.expandSync(hrefToExpand, vars);
  if (newHref != hrefToExpand) {
    // Store original value so that later clicks can be processed with
    // freshest values.
    if (!target.getAttribute(ORIGINAL_HREF_ATTRIBUTE)) {
      target.setAttribute(ORIGINAL_HREF_ATTRIBUTE, hrefToExpand);
    }
    target.setAttribute('href', newHref);
  }
  return newHref;
}


/** @typedef {{element: !Element, attributes: Object<string, string>}} */
let RestoreElementAttributesDef;


/**
 * Removes attributes from elements with matching hash target. This includes:
 *   *[id=hash] and a[name=hash].
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} hash
 * @return {!Array<!RestoreElementAttributesDef>}}
 * @private
 */
function removeAttrsWithMatchingHash_(ampdoc, hash) {
  const restoreElementsAttrs = [];
  const targetElements = ampdoc.getRootNode().querySelectorAll(
      `#${hash},a[name=${hash}]`) || [];
  for (let i = 0; i < targetElements.length; i++) {
    const element = targetElements[i];
    const attributes = {};
    if (element.name == hash) {
      attributes.name = element.name;
      element.removeAttribute('name');
    }
    if (element.id == hash) {
      attributes.id = element.id;
      element.removeAttribute('id');
    }
    restoreElementsAttrs.push({element, attributes});
  }
  return restoreElementsAttrs;
}


/**
 * Restore elements attributes.
 * @param {!Array<!RestoreElementAttributesDef>} elementsAttrs
 * @private
 */
function restoreElementsAttributes_(elementsAttrs) {
  for (let i = 0; i < elementsAttrs.length; i++) {
    const element = elementsAttrs[i].element;
    const attrs = elementsAttrs[i].attributes;
    for (const key in attrs) {
      element.setAttribute(key, attrs[key]);
    }
  }
}
