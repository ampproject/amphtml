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

import {removeElement} from '../../../src/dom';
import {isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';

class AmpJWPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.contentid_ = '';

    /** @private {string} */
    this.playerid_ = '';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

    /** @override */
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
    this.contentid_ = user().assert(
      (this.element.getAttribute('data-playlist-id') ||
      this.element.getAttribute('data-media-id')),
      'Either the data-media-id or the data-playlist-id ' +
      'attributes must be specified for <amp-jwplayer> %s',
      this.element);

    this.playerid_ = user().assert(
      this.element.getAttribute('data-player-id'),
      'The data-player-id attribute is required for <amp-jwplayer> %s',
      this.element);
  }


  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    const src = 'https://content.jwplatform.com/players/' +
      encodeURIComponent(this.contentid_) + '-' +
      encodeURIComponent(this.playerid_) + '.html';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
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
    // TODO(#5328): Investigate if there's a calculable poster image for playlists or
    // a default playlist placeholder image.
    if (!this.element.hasAttribute('data-media-id')) {
      return;
    }
    const placeholder = this.win.document.createElement('amp-img');
    placeholder.setAttribute('src', 'https://content.jwplatform.com/thumbs/' +
        encodeURIComponent(this.contentid_) + '-720.jpg');
    placeholder.setAttribute('layout', 'fill');
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('referrerpolicy', 'origin');
    return placeholder;
  }

};

AMP.registerElement('amp-jwplayer', AmpJWPlayer);
