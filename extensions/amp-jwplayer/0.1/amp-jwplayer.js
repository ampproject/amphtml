/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {addParamsToUrl} from '../../../src/url';
import {dict} from '../../../src/utils/object';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {userAssert} from '../../../src/log';


class AmpJWPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.contentid_ = '';

    /** @private {string} */
    this.playerid_ = '';

    /** @private {string} */
    this.contentSearch_ = '';

    /** @private {boolean} */
    this.contentContextual_ = false;

    /** @private {string} */
    this.contentRecency_ = '';

    /** @private {boolean} */
    this.contentBackfill_ = false;

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    // Host that serves player configuration and content redirects
    this.preconnect.url('https://content.jwplatform.com', onLayout);
    // CDN which hosts jwplayer assets
    this.preconnect.url('https://ssl.p.jwpcdn.com', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const {element} = this;
    this.contentid_ = userAssert(
        (element.getAttribute('data-playlist-id') ||
        element.getAttribute('data-media-id')),
        'Either the data-media-id or the data-playlist-id ' +
        'attributes must be specified for <amp-jwplayer> %s',
        element);

    this.playerid_ = userAssert(
        element.getAttribute('data-player-id'),
        'The data-player-id attribute is required for <amp-jwplayer> %s',
        element);

    this.contentSearch_ = element.getAttribute('data-content-search') ||
        '';
    this.contentContextual_ = element.hasAttribute('data-content-contextual');
    this.contentRecency_ = element.getAttribute('data-content-recency') ||
        '';
    this.contentBackfill_ = element.hasAttribute('data-content-backfill');
  }


  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    const cid = encodeURIComponent(this.contentid_);
    const pid = encodeURIComponent(this.playerid_);
    const queryParams = dict({
      'search': this.getContextualVal() || undefined,
      'contextual': this.contentContextual_ || undefined,
      'recency': this.contentRecency_ || undefined,
      'backfill': this.contentBackfill_ || undefined,
    });

    const baseUrl = `https://content.jwplatform.com/players/${cid}-${pid}.html`;
    const src = addParamsToUrl(baseUrl, queryParams);

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = /** @type {?HTMLIFrameElement} */ (iframe);
    return this.loadPromise(iframe);
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      // The /players page can respond to "play" and "pause" commands from the
      // iframe's parent
      this.iframe_.contentWindow./*OK*/postMessage('pause',
          'https://content.jwplatform.com');
    }
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true; // Call layoutCallback again.
  }

  /** @override */
  createPlaceholderCallback() {
    if (!this.element.hasAttribute('data-media-id')) {
      return;
    }
    const placeholder = this.win.document.createElement('amp-img');
    this.propagateAttributes(['aria-label'], placeholder);
    placeholder.setAttribute('src', 'https://content.jwplatform.com/thumbs/' +
      encodeURIComponent(this.contentid_) + '-720.jpg');
    placeholder.setAttribute('layout', 'fill');
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('referrerpolicy', 'origin');
    if (placeholder.hasAttribute('aria-label')) {
      placeholder.setAttribute('alt',
          'Loading video - ' + placeholder.getAttribute('aria-label')
      );
    } else {
      placeholder.setAttribute('alt', 'Loading video');
    }
    return placeholder;
  }
  /**
  *
  */
  getContextualVal() {
    if (this.contentSearch_ === '__CONTEXTUAL__') {
      const context = this.getAmpDoc().getHeadNode();
      const ogTitleElement = context.querySelector('meta[property="og:title"]');
      const ogTitle = ogTitleElement ?
        ogTitleElement.getAttribute('content') : null;
      const title = (context.querySelector('title') || {}).textContent;
      return ogTitle || title || '';
    }
    return this.contentSearch_ ;
  }
}

AMP.extension('amp-jwplayer', '0.1', AMP => {
  AMP.registerElement('amp-jwplayer', AmpJWPlayer);
});
