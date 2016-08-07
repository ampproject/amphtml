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
import {loadPromise} from '../../../src/event-helper';
import {setStyles} from '../../../src/style';
import {user} from '../../../src/log';

class AmpSpringboardPlayer extends AMP.BaseElement {

  /** @override */
  createdCallback() {
    this.preconnect.url('https://cms.springboardplatform.com');
    this.preconnect.url('https://www.springboardplatform.com');
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');
    const mode = user().assert(
        this.element.getAttribute('data-mode'),
        'The data-mode attribute is required for <amp-springboard-player> %s',
        this.element);
    const contentId = user().assert(
        this.element.getAttribute('data-content-id'),
        'The data-content-id attribute is required for' +
        '<amp-springboard-player> %s',
        this.element);
    const domain = user().assert(
        this.element.getAttribute('data-domain'),
        'The data-domain attribute is required for <amp-springboard-player> %s',
        this.element);

    /** @private @const {number} */
    this.width_ = width;
    /** @private @const {number} */
    this.height_ = height;
    /** @private @const {string} */
    this.mode_ = mode;
    /** @private @const {number} */
    this.contentId_ = contentId;
    /** @private @const {string} */
    this.domain_ = domain;

    if (!this.getPlaceholder()) {
      this.buildImagePlaceholder_();
    }
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
    	encodeURIComponent(siteId) + '/' + encodeURIComponent(this.mode_) +
    	'/' + encodeURIComponent(this.contentId_) + '/' +
    	encodeURIComponent(playerId) + '/' + encodeURIComponent(this.domain_) +
    	'/' + encodeURIComponent(items);
    this.applyFillContent(iframe);
    iframe.width = this.width_;
    iframe.height = this.height_;
    /** @private {?Element} */
    this.iframe_ = iframe;
    this.element.appendChild(iframe);
    return loadPromise(iframe);
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage('ampPause', '*');
    }
  }

  /** @private */
  buildImagePlaceholder_() {
    const imgPlaceholder = new Image();

    setStyles(imgPlaceholder, {
      // Cover matches Springboard Player size.
      'object-fit': 'cover',
      // Hiding the placeholder initially to give the browser time to fix
      // the object-fit: cover.
      'visibility': 'hidden',
    });

    imgPlaceholder.src = 'https://www.springboardplatform.com/storage/' +
    	encodeURIComponent(this.domain_) + '/snapshots/' +
    	encodeURIComponent(this.contentId_) + '.jpg';
    /** Show default image for playlist */
    if (this.mode_ == 'playlist') {
      imgPlaceholder.src =
        'https://www.springboardplatform.com/storage/default/' +
        'snapshots/default_snapshot.png';
    }
    imgPlaceholder.setAttribute('placeholder', '');
    imgPlaceholder.width = this.width_;
    imgPlaceholder.height = this.height_;

    this.element.appendChild(imgPlaceholder);
    this.applyFillContent(imgPlaceholder);
    imgPlaceholder.setAttribute('referrerpolicy', 'origin');

    loadPromise(imgPlaceholder).then(() => {
      setStyles(imgPlaceholder, {
        'visibility': '',
      });
    });
  }
}

AMP.registerElement('amp-springboard-player', AmpSpringboardPlayer);
