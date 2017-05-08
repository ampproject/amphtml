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

import {isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';

class AmpBridPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.partnerID_ = '';

    /** @private {string} */
    this.feedID_ = '';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

 /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://services.brid.tv', opt_onLayout);
    this.preconnect.url('https://cdn.brid.tv', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.partnerID_ = user().assert(
        this.element.getAttribute('data-partner'),
        'The data-partner attribute is required for <amp-brid-player> %s',
        this.element);

    this.feedID_ = user().assert(
        (this.element.getAttribute('data-video') ||
        this.element.getAttribute('data-playlist')),
        'Either the data-video or the data-playlist ' +
        'attributes must be specified for <amp-brid-player> %s',
        this.element);
  }

  /** @override */
  layoutCallback() {
    const playerID = user().assert(this.element.getAttribute('data-player'),
        'The data-player attribute is required for <amp-brid-player> %s',
        this.element);

    const partnerID = user().assert(
        this.partnerID_,
        'The data-partner attribute is required for <amp-brid-player> %s',
        this.element);

    let feedType = '';

    if (this.element.getAttribute('data-video')) {
      feedType = 'video';
    } else if (this.element.getAttribute('data-playlist')) {
      feedType = 'playlist';
    }

    //Create iframe
    const iframe = this.element.ownerDocument.createElement('iframe');
    const src = 'https://services.brid.tv/services/iframe/' +
        encodeURIComponent(feedType) +
        '/' + encodeURIComponent(this.feedID_) +
        '/' + encodeURIComponent(partnerID) +
        '/' + encodeURIComponent(playerID) + '/0/1';
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
      this.iframe_.contentWindow./*OK*/postMessage(
        'Brid|pause',
        'https://services.brid.tv'
      );
    }
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('amp-img');
    const partnerID = this.partnerID_;
    const feedID = this.feedID_;

    const placeholderFallback = this.win.document.createElement('amp-img');
    placeholderFallback.setAttribute('src',
        'https://cdn.brid.tv/live/default/defaultSnapshot.png');
    placeholderFallback.setAttribute('referrerpolicy', 'origin');
    placeholderFallback.setAttribute('layout', 'fill');
    placeholderFallback.setAttribute('fallback', '');
    placeholder.appendChild(placeholderFallback);

    placeholder.setAttribute('src',
        'https://cdn.brid.tv/live/partners/' +
        encodeURIComponent(partnerID) + '/snapshot/' +
        encodeURIComponent(feedID) + '.jpg');
    placeholder.setAttribute('layout', 'fill');
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('referrerpolicy', 'origin');
    this.applyFillContent(placeholder);

    return placeholder;
  }
};

AMP.registerElement('amp-brid-player', AmpBridPlayer);
