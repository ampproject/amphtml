/**
 * Copyright 2016 Longtail Ad Solutions Inc.
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

class AmpJWPlayer extends AMP.BaseElement {

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
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');

    /** @private @const {number} */
    this.width_ = getLengthNumeral(width);

    /** @private @const {number} */
    this.height_ = getLengthNumeral(height);

    /** @private @const {string} */
    this.contentid_ = AMP.assert(
      (this.element.getAttribute('data-playlist-id') ||
      this.element.getAttribute('data-media-id')),
      'Either the data-media-id or the data-playlist-id ' +
      'attributes must be specified for <amp-jwplayer> %s',
      this.element);

    /** @private @const {string} */
    this.playerid_ = AMP.assert(
      this.element.getAttribute('data-player-id'),
      'The data-player-id attribute is required for <amp-jwplayer> %s',
      this.element);


    if (!this.getPlaceholder()) {
      this.buildImagePlaceholder_();
    }
  }


  /** @override */
  layoutCallback() {
    const iframe = document.createElement('iframe');
    const src = 'https://content.jwplatform.com/players/'+
      encodeURIComponent(this.contentid_) + '-' +
      encodeURIComponent(this.playerid_) + '.html';

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
  documentInactiveCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      // The /players page can respond to "play" and "pause" commands from the
      // iframe's parent
      this.iframe_.contentWindow./*OK*/postMessage('pause',
        'https://content.jwplatform.com');
    }
    return false;
  }

  /** @private */
  buildImagePlaceholder_() {
    const imgPlaceholder = new Image();

    setStyles(imgPlaceholder, {
      'object-fit': 'cover',
      'visibility': 'hidden',
    });

    imgPlaceholder.src = 'https://content.jwplatform.com/thumbs/' +
        encodeURIComponent(this.contentid_) + '-720.jpg';
    imgPlaceholder.setAttribute('placeholder', '');
    imgPlaceholder.width = this.width_;
    imgPlaceholder.height = this.height_;

    this.element.appendChild(imgPlaceholder);
    this.applyFillContent(imgPlaceholder);

    loadPromise(imgPlaceholder).then(() => {
      setStyles(imgPlaceholder, {
        'visibility': '',
      });
    }).catch(() => {
      // Thumbnails aren't available for all media content.
      // On a 404, remove the placeholder image.
      this.element.removeChild(imgPlaceholder);
    });
  }

};

AMP.registerElement('amp-jwplayer', AmpJWPlayer);
