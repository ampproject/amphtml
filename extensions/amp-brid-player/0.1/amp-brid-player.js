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

import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';
import {setStyles} from '../../../src/style';
import {user} from '../../../src/log';

class AmpBridPlayer extends AMP.BaseElement {

  /** @override */
  preconnectCallback(onLayout) {
    this.preconnect.url('https://services.brid.tv', onLayout);
    this.preconnect.url('https://cdn.brid.tv', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');

    /** @private @const {number} */
    this.width_ = getLengthNumeral(width);

    /** @private @const {number} */
    this.height_ = getLengthNumeral(height);

    /** @private @const {string} */
    this.partnerID_ = user().assert(
        this.element.getAttribute('data-partner'),
        'The data-partner attribute is required for <amp-brid-player> %s',
        this.element);

    /** @private @const {string} */
    this.feedID_ = user().assert(
        (this.element.getAttribute('data-video') ||
        this.element.getAttribute('data-playlist')),
        'Either the data-video or the data-playlist ' +
        'attributes must be specified for <amp-brid-player> %s',
        this.element);

    if (!this.getPlaceholder()) {
      this.buildImagePlaceholder_();
    }
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

    let feedType;

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
    iframe.width = this.width_;
    iframe.height = this.height_;
    this.element.appendChild(iframe);
    /** @private {?Element} */
    this.iframe_ = iframe;
    return loadPromise(iframe);
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

  /** @private */
  buildImagePlaceholder_() {
    const imgPlaceholder = new Image();
    const partnerID = this.partnerID_;
    const feedID = this.feedID_;

    setStyles(imgPlaceholder, {
      'object-fit': 'cover',
      // Hiding the placeholder initially to give the browser time to fix
      // the object-fit: cover.
      'visibility': 'hidden',
    });

    imgPlaceholder.src = 'https://cdn.brid.tv/live/partners/' + encodeURIComponent(partnerID) + '/snapshot/' + encodeURIComponent(feedID) + '.jpg';
    imgPlaceholder.setAttribute('placeholder', '');
    imgPlaceholder.width = this.width_;
    imgPlaceholder.height = this.height_;
    imgPlaceholder.setAttribute('referrerpolicy', 'origin');

    this.element.appendChild(imgPlaceholder);
    this.applyFillContent(imgPlaceholder);

    loadPromise(imgPlaceholder).catch(() => {
      imgPlaceholder.src = 'https://services.brid.tv/ugc/default/defaultSnapshot.png';
      return loadPromise(imgPlaceholder);
    }).then(() => {
      setStyles(imgPlaceholder, {
        'visibility': '',
      });
    });
  }
};

AMP.registerElement('amp-brid-player', AmpBridPlayer);
