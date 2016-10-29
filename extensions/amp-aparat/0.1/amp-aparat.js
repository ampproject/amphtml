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
import {setStyles} from '../../../src/style';
import {user} from '../../../src/log';

class AmpAparat extends AMP.BaseElement {

  /** @override */
  preconnectCallback(onLayout) {
    // Host that serves player configuration and content redirects
    this.preconnect.url('https://www.aparat.com', onLayout);
    // CDN which hosts jwplayer assets
    this.preconnect.url('https://ssl.p.jwpcdn.com', onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    /** @private @const {string} */
    this.uid_ = user().assert(
      (this.element.getAttribute('uid')),
      'Either the uid ' +
      'attributes must be specified for <amp-aparat> %s',
      this.element);

    /** @private @const {string} */
    this.img_ = (this.element.getAttribute('img') || 'https://www.aparat.com/public/public/images/video/default_thumb.jpg');

    if (!this.getPlaceholder()) {
      this.buildImagePlaceholder_();
    }
  }


  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    // https://www.aparat.com/video/video/embed/videohash/sd3vW/vt/frame
    const src = 'https://www.aparat.com/video/video/embed/videohash/' +
      encodeURIComponent(this.uid_) + '/vt/frame/amp/true';

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    /** @private {?Element} */
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      // The /players page can respond to "play" and "pause" commands from the
      // iframe's parent
      this.iframe_.contentWindow./*OK*/postMessage('pause',
        'https://www.aparat.com');
    }
  }

  /** @private */
  buildImagePlaceholder_() {
    const imgPlaceholder = new Image();

    setStyles(imgPlaceholder, {
      'object-fit': 'cover',
    });

    imgPlaceholder.src = 'http://static.asset.aparat.com/avt/' +
        encodeURIComponent(this.img_) + '.jpg';
    imgPlaceholder.setAttribute('placeholder', '');
    imgPlaceholder.setAttribute('referrerpolicy', 'origin');

    this.applyFillContent(imgPlaceholder);

    // Not every media item has a thumbnail image.  If no image is found,
    // don't add the placeholder to the DOM.
    this.loadPromise(imgPlaceholder).then(() => {
      this.element.appendChild(imgPlaceholder);
    }).catch(() => {
      // If the thumbnail image isn't available, we can safely ignore this
      // error, and no image placeholder will be inserted.
    });
  }

};

AMP.registerElement('amp-aparat', AmpAparat);
