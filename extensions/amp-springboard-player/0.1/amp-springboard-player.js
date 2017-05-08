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

import {isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';

class AmpSpringboardPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.mode_ = '';

    /** @private {string} */
    this.contentId_ = '';

    /** @private {string} */
    this.domain_ = '';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

 /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://cms.springboardplatform.com', opt_onLayout);
    this.preconnect.url('https://www.springboardplatform.com', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.mode_ = user().assert(
        this.element.getAttribute('data-mode'),
        'The data-mode attribute is required for <amp-springboard-player> %s',
        this.element);
    this.contentId_ = user().assert(
        this.element.getAttribute('data-content-id'),
        'The data-content-id attribute is required for' +
        '<amp-springboard-player> %s',
        this.element);
    this.domain_ = user().assert(
        this.element.getAttribute('data-domain'),
        'The data-domain attribute is required for <amp-springboard-player> %s',
        this.element);
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    const siteId = user().assert(
        this.element.getAttribute('data-site-id'),
        'The data-site-id attribute is required for' +
        '<amp-springboard-player> %s',
        this.element);
    const playerId = user().assert(
        this.element.getAttribute('data-player-id'),
        'The data-player-id attribute is required for' +
        '<amp-springboard-player> %s',
        this.element);
    const items = this.element.getAttribute('data-items') || '10';

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.id = playerId + '_' + this.contentId_;
    iframe.src = 'https://cms.springboardplatform.com/embed_iframe/' +
        encodeURIComponent(siteId) + '/' +
        encodeURIComponent(this.mode_) +
        '/' + encodeURIComponent(this.contentId_) + '/' +
        encodeURIComponent(playerId) + '/' +
        encodeURIComponent(this.domain_) +
        '/' + encodeURIComponent(items);
    this.applyFillContent(iframe);
    this.iframe_ = iframe;
    this.element.appendChild(iframe);
    return this.loadPromise(iframe);
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage('ampPause', '*');
    }
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('amp-img');

    placeholder.setAttribute('src',
        'https://www.springboardplatform.com/storage/' +
        encodeURIComponent(this.domain_) + '/snapshots/' +
        encodeURIComponent(this.contentId_) + '.jpg');
    /** Show default image for playlist */
    if (this.mode_ == 'playlist') {
      placeholder.setAttribute('src',
        'https://www.springboardplatform.com/storage/default/' +
        'snapshots/default_snapshot.png');
    }
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('referrerpolicy', 'origin');
    placeholder.setAttribute('layout', 'fill');
    return placeholder;
  }
}

AMP.registerElement('amp-springboard-player', AmpSpringboardPlayer);
