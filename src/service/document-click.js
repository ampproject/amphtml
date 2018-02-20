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

import {Services} from '../services';
import {
  closestByTag,
  escapeCssSelectorIdent,
  isIframed,
  openWindowDialog,
} from '../dom';
import {dev, user} from '../log';
import {
  getExtraParamsUrl,
  shouldAppendExtraParams,
} from '../impression';
import {getMode} from '../mode';
import {
  installServiceInEmbedScope,
  registerServiceBuilderForDoc,
} from '../service';
import {
  isProtocolValid,
  parseUrl,
  parseUrlWithA,
} from '../url';
import {toWin} from '../types';


const TAG = 'clickhandler';


/**
 * Install click handler service for ampdoc. Immediately instantiates the
 * the click handler service.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */
export function installGlobalClickListenerForDoc(ampdoc) {
  registerServiceBuilderForDoc(
      ampdoc,
      TAG,
      ClickHandler,
      /* opt_instantiate */ true);
}

// TODO(willchou): Rename to navigation.js#Navigation.
/**
 * Intercept any click on the current document and prevent any
 * linking to an identifier from pushing into the history stack.
 * @implements {../service.EmbeddableService}
 * @visibleForTesting
 */
export class ClickHandler {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {(!Document|!ShadowRoot)=} opt_rootNode
   */
  constructor(ampdoc, opt_rootNode) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private @const {!Document|!ShadowRoot} */
    this.rootNode_ = opt_rootNode || ampdoc.getRootNode();

    /** @private @const {!./viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);

    /** @private @const {!./viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(this.ampdoc);

    /** @private @const {!./history-impl.History} */
    this.history_ = Services.historyForDoc(this.ampdoc);

    const platform = Services.platformFor(this.ampdoc.win);
    /** @private @const {boolean} */
    this.isIosSafari_ = platform.isIos() && platform.isSafari();

    /** @private @const {boolean} */
    this.isIframed_ =
        isIframed(this.ampdoc.win) && this.viewer_.isOvertakeHistory();

    /** @private @const {boolean} */
    this.isEmbed_ = this.rootNode_ != this.ampdoc.getRootNode();

    /** @private @const {boolean} */
    this.isInABox_ = getMode(this.ampdoc.win).runtime == 'inabox';

    /**
     * Used for URL resolution in embeds.
     * @private {?HTMLAnchorElement}
     */
    this.embedA_ = null;

    /** @private @const {!function(!Event)|undefined} */
    this.boundHandle_ = this.handle_.bind(this);
    this.rootNode_.addEventListener('click', this.boundHandle_);

    /** @private {boolean} */
    this.appendExtraParams_ = false;
    shouldAppendExtraParams(this.ampdoc).then(res => {
      this.appendExtraParams_ = res;
    });

    /**
     * Lazy-generated list of A2A-enabled navigation features.
     * @private {?Array<string>}
     */
    this.a2aFeatures_ = null;
  }

  /** @override */
  adoptEmbedWindow(embedWin) {
    installServiceInEmbedScope(embedWin, TAG,
        new ClickHandler(this.ampdoc, embedWin.document));
  }

  /** @override */
  adoptEmbedDoc(embedAmpDoc) {
    //QQQ:implements
    return new ClickHandler(embedAmpDoc);
  }

  /**
   * Removes all event listeners.
   */
  cleanup() {
    if (this.boundHandle_) {
      this.rootNode_.removeEventListener('click', this.boundHandle_);
    }
  }

  /**
   * Navigates a window to a URL.
   *
   * If opt_requestedBy matches a feature name in a <meta> tag with attribute
   * name="amp-to-amp-navigation", then treats the URL as an AMP URL (A2A).
   *
   * @param {!Window} win
   * @param {string} url
   * @param {string=} opt_requestedBy
   */
  navigateTo(win, url, opt_requestedBy) {
    if (!isProtocolValid(url)) {
      user().error(TAG, 'Cannot navigate to invalid protocol: ' + url);
      return;
    }

    // If this redirect was requested by a feature that opted into A2A,
    // try to ask the viewer to navigate this AMP URL.
    if (opt_requestedBy) {
      if (!this.a2aFeatures_) {
        this.a2aFeatures_ = this.queryA2AFeatures_();
      }
      if (this.a2aFeatures_.includes(opt_requestedBy)) {
        if (this.viewer_.navigateToAmpUrl(url, opt_requestedBy)) {
          return;
        }
      }
    }

    // Otherwise, perform normal behavior of navigating the top frame.
    win.top.location.href = url;
  }

  /**
   * @return {!Array<string>}
   * @private
   */
  queryA2AFeatures_() {
    const meta = this.rootNode_.querySelector(
        'meta[name="amp-to-amp-navigation"]');
    if (meta && meta.hasAttribute('content')) {
      return meta.getAttribute('content').split(',').map(s => s.trim());
    }
    return [];
  }

  /**
   * Intercept any click on the current document and prevent any
   * linking to an identifier from pushing into the history stack.
   *
   * This also handles custom protocols (e.g. whatsapp://) when iframed
   * on iOS Safari.
   *
   * @param {!Event} e
   * @private
   */
  handle_(e) {
    if (e.defaultPrevented) {
      return;
    }

    const target = closestByTag(dev().assertElement(e.target), 'A');
    if (!target || !target.href) {
      return;
    }

    // First check if need to handle external link decoration.
    let defaultExpandParamsUrl = null;
    if (this.appendExtraParams_ && !this.isEmbed_) {
      // Only decorate outgoing link when needed to and is not in FIE.
      defaultExpandParamsUrl = getExtraParamsUrl(this.ampdoc.win, target);
    }

    const urlReplacements = Services.urlReplacementsForDoc(target);
    urlReplacements.maybeExpandLink(target, defaultExpandParamsUrl);

    const location = this.parseUrl_(target.href);

    // Handle AMP-to-AMP navigation if rel=amphtml.
    if (this.handleA2AClick_(e, target, location)) {
      return;
    }

    // Handle navigating to custom protocol if applicable.
    if (this.handleCustomProtocolClick_(e, target, location)) {
      return;
    }

    // Finally, handle normal click-navigation behavior.
    this.handleNavClick_(e, target, location);
  }

  /**
   * Handles clicking on a custom protocol link.
   * Returns true if the navigation was handled. Otherwise, returns false.
   * @param {!Event} e
   * @param {!Element} target
   * @param {!Location} location
   * @return {boolean}
   * @private
   */
  handleCustomProtocolClick_(e, target, location) {
    // Handle custom protocols only if the document is iframed.
    if (!this.isIframed_) {
      return false;
    }

    /** @const {!Window} */
    const win = toWin(target.ownerDocument.defaultView);
    const url = target.href;
    const protocol = location.protocol;

    // On Safari iOS, custom protocol links will fail to open apps when the
    // document is iframed - in order to go around this, we set the top.location
    // to the custom protocol href.
    const isFTP = protocol == 'ftp:';

    // In case of FTP Links in embedded documents always open then in _blank.
    if (isFTP) {
      openWindowDialog(win, url, '_blank');
      e.preventDefault();
      return true;
    }

    const isNormalProtocol = /^(https?|mailto):$/.test(protocol);
    if (this.isIosSafari_ && !isNormalProtocol) {
      openWindowDialog(win, url, '_top');
      // Without preventing default the page would should an alert error twice
      // in the case where there's no app to handle the custom protocol.
      e.preventDefault();
      return true;
    }

    return false;
  }

  /**
   * Handles clicking on an AMP link.
   * Returns true if the navigation was handled. Otherwise, returns false.
   * @param {!Event} e
   * @param {!Element} target
   * @param {!Location} location
   * @return {boolean}
   * @private
   */
  handleA2AClick_(e, target, location) {
    if (!target.hasAttribute('rel')) {
      return false;
    }
    const relations = target.getAttribute('rel').split(' ').map(s => s.trim());
    if (!relations.includes('amphtml')) {
      return false;
    }
    // The viewer may not support the capability for navigating AMP links.
    if (this.viewer_.navigateToAmpUrl(location.href, '<a rel=amphtml>')) {
      e.preventDefault();
      return true;
    }
    return false;
  }


  /**
   * Handles clicking on a link with hash navigation.
   * @param {!Event} e
   * @param {!Element} target
   * @param {!Location} tgtLoc
   * @private
   */
  handleNavClick_(e, target, tgtLoc) {
    /** @const {!Location} */
    const curLoc = this.parseUrl_('');
    const tgtHref = `${tgtLoc.origin}${tgtLoc.pathname}${tgtLoc.search}`;
    const curHref = `${curLoc.origin}${curLoc.pathname}${curLoc.search}`;

    // If the current target anchor link is the same origin + path
    // as the current document then we know we are just linking to an
    // identifier in the document. Otherwise, it's an external navigation.
    if (!tgtLoc.hash || tgtHref != curHref) {
      if (this.isEmbed_ || this.isInABox_) {
        // Target in the embed must be either _top or _blank. If none specified,
        // force to _blank.
        const targetAttr = (target.getAttribute('target') || '').toLowerCase();
        if (targetAttr != '_top' && targetAttr != '_blank') {
          target.setAttribute('target', '_blank');
        }
      }
      return;
    }

    // We prevent default so that the current click does not push
    // into the history stack as this messes up the external documents
    // history which contains the amp document.
    e.preventDefault();

    // For an embed, do not perform scrolling or global history push - both have
    // significant UX and browser problems.
    if (this.isEmbed_) {
      return;
    }

    // Look for the referenced element.
    const hash = tgtLoc.hash.slice(1);
    let elem = null;
    if (hash) {
      const escapedHash = escapeCssSelectorIdent(hash);
      elem = (this.rootNode_.getElementById(hash) ||
          // Fallback to anchor[name] if element with id is not found.
          // Linking to an anchor element with name is obsolete in html5.
          this.rootNode_./*OK*/querySelector(`a[name="${escapedHash}"]`));
    }

    // If possible do update the URL with the hash. As explained above
    // we do `replace` to avoid messing with the container's history.
    if (tgtLoc.hash != curLoc.hash) {
      this.history_.replaceStateForTarget(tgtLoc.hash).then(() => {
        this.scrollToElement_(elem, hash);
      });
    } else {
      // If the hash did not update just scroll to the element.
      this.scrollToElement_(elem, hash);
    }
  }

  /**
   * Scrolls the page to the given element.
   * @param {?Element} elem
   * @param {string} hash
   * @private
   */
  scrollToElement_(elem, hash) {
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
      this.viewport_./*OK*/scrollIntoView(elem);
      Services.timerFor(this.ampdoc.win).delay(() =>
        this.viewport_./*OK*/scrollIntoView(dev().assertElement(elem)), 1);
    } else {
      dev().warn(TAG,
          `failed to find element with id=${hash} or a[name=${hash}]`);
    }
  }

  /**
   * @param {string} url
   * @return {!Location}
   * @private
   */
  parseUrl_(url) {
    if (this.isEmbed_) {
      let a = this.embedA_;
      if (!a) {
        const embedDoc = (this.rootNode_.ownerDocument || this.rootNode_);
        a = /** @type {!HTMLAnchorElement} */ (embedDoc.createElement('a'));
        this.embedA_ = a;
      }
      return parseUrlWithA(a, url);
    }
    return parseUrl(url || this.ampdoc.win.location.href);
  }
}
