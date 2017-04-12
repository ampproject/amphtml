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
  isIframed,
} from '../dom';
import {
  registerServiceBuilderForDoc,
  installServiceInEmbedScope,
} from '../service';
import {dev} from '../log';
import {getMode} from '../mode';
import {
  historyForDoc,
  platformFor,
  timerFor,
  urlReplacementsForDoc,
  viewerForDoc,
  viewportForDoc,
} from '../services';
import {parseUrl, parseUrlWithA} from '../url';

const TAG = 'clickhandler';


/**
 * Install click handler service for ampdoc. Immediately instantiates the
 * the click handler service.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installGlobalClickListenerForDoc(ampdoc) {
  registerServiceBuilderForDoc(
      ampdoc,
      TAG,
      ClickHandler,
      /* opt_factory */ undefined,
      /* opt_instantiate */ true);
}


/**
 * Intercept any click on the current document and prevent any
 * linking to an identifier from pushing into the history stack.
 * @implements {./service.EmbeddableService}
 * @visibleForTesting
 */
export class ClickHandler {
  /**
   * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
   * @param {(!Document|!ShadowRoot)=} opt_rootNode
   */
  constructor(ampdoc, opt_rootNode) {
    /** @const {!./service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private @const {!Document|!ShadowRoot} */
    this.rootNode_ = opt_rootNode || ampdoc.getRootNode();

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
    this.isIframed_ =
        isIframed(this.ampdoc.win) && this.viewer_.isOvertakeHistory();

    /** @private @const {boolean} */
    this.isEmbed_ = this.rootNode_ != this.ampdoc.getRootNode();

    /** @private @const {boolean} */
    this.isInABox_ = getMode(this.ampdoc.win).runtime == 'inabox';

    /**
     * Used for URL resolution in embeds.
     * @private @const {?HTMLAnchorElement}
     */
    this.embedA_ = null;

    /** @private @const {!function(!Event)|undefined} */
    this.boundHandle_ = this.handle_.bind(this);
    this.rootNode_.addEventListener('click', this.boundHandle_);
  }

  /** @override */
  adoptEmbedWindow(embedWin) {
    installServiceInEmbedScope(embedWin, TAG,
        new ClickHandler(this.ampdoc, embedWin.document));
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
    urlReplacementsForDoc(target).maybeExpandLink(target);

    const tgtLoc = this.parseUrl_(target.href);

    // Handle custom protocols only if the document is iframed.
    if (this.isIframed_) {
      this.handleCustomProtocolClick_(e, target, tgtLoc);
    }

    // Handle navigation clicks.
    if (!e.defaultPrevented) {
      this.handleNavClick_(e, target, tgtLoc);
    }
  }

  /**
   * Handles clicking on a custom protocol link.
   * @param {!Event} e
   * @param {!Element} target
   * @param {!Location} tgtLoc
   * @private
   */
  handleCustomProtocolClick_(e, target, tgtLoc) {
    /** @const {!Window} */
    const win = target.ownerDocument.defaultView;
    // On Safari iOS, custom protocol links will fail to open apps when the
    // document is iframed - in order to go around this, we set the top.location
    // to the custom protocol href.
    const isFTP = tgtLoc.protocol == 'ftp:';

    // In case of FTP Links in embedded documents always open then in _blank.
    if (isFTP) {
      openWindowDialog(win, target.href, '_blank');
      e.preventDefault();
      return;
    }

    const isNormalProtocol = /^(https?|mailto):$/.test(tgtLoc.protocol);
    if (this.isIosSafari_ && !isNormalProtocol) {
      openWindowDialog(win, target.href, '_top');
      // Without preventing default the page would should an alert error twice
      // in the case where there's no app to handle the custom protocol.
      e.preventDefault();
    }
  }

  /**
   * Handles clicking on a link with hash navigation.
   * @param {!Event} e
   * @param {!Element} target
   * @param {!Location} tgtLoc
   * @private
   */
  handleNavClick_(e, target, tgtLoc) {
    /** @const {!Window} */
    const win = e.target.ownerDocument.defaultView;
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
      const escapedHash = escapeCssSelectorIdent(win, hash);
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
      timerFor(this.ampdoc.win).delay(() => this.viewport_./*OK*/scrollIntoView(
          dev().assertElement(elem)), 1);
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
      if (!this.embedA_) {
        const embedDoc = (this.rootNode_.ownerDocument || this.rootNode_);
        this.embedA_ = embedDoc.createElement('a');
      }
      return parseUrlWithA(this.embedA_, url);
    }
    return parseUrl(url || this.ampdoc.win.location.href);
  }
}
