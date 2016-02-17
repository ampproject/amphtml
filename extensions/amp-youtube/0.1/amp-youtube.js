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


class AmpYoutube extends AMP.BaseElement {

  /** @override */
  preconnectCallback(onLayout) {
    this.preconnect.url('https://www.youtube.com', onLayout);
    // Host that YT uses to serve JS needed by player.
    this.preconnect.url('https://s.ytimg.com', onLayout);
    // Load high resolution placeholder images for videos in prerender mode.
    this.preconnect.url('https://i.ytimg.com', onLayout);
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

    // The video-id is supported only for backward compatibility.
    /** @private @const {string} */
    this.videoid_ = AMP.assert(
        (this.element.getAttribute('data-videoid') ||
        this.element.getAttribute('video-id')),
        'The data-videoid attribute is required for <amp-youtube> %s',
        this.element);

    if (!this.getPlaceholder()) {
      this.buildImagePlaceholder_();
    }
  }

  /** @override */
  layoutCallback() {
    // See
    // https://developers.google.com/youtube/iframe_api_reference
    const iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(
        this.videoid_) + '?enablejsapi=1';
    this.applyFillContent(iframe);
    iframe.width = this.width_;
    iframe.height = this.height_;
    this.element.appendChild(iframe);
    /** @private {?Element} */
    this.iframe_ = iframe;

    // TODO(mkhatib, #2050): Use PlayerReady message for layout promise.
    return loadPromise(iframe);
  }

  /** @override */
  documentInactiveCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage(JSON.stringify({
        'event': 'command',
        'func': 'pauseVideo',
        'args': ''
      }), '*');
    }
    // No need to do layout later - user action will be expect to resume
    // the playback.
    return false;
  }

  /** @private */
  buildImagePlaceholder_() {
    const imgPlaceholder = new Image();
    const videoid = this.videoid_;

    setStyles(imgPlaceholder, {
      // Cover matches YouTube Player styling.
      'object-fit': 'cover',
      // Hiding the placeholder initially to give the browser time to fix
      // the object-fit: cover.
      'visibility': 'hidden'
    });

    // TODO(mkhatib): Maybe add srcset to allow the browser to
    // load the needed size or even better match YTPlayer logic for loading
    // player thumbnails for different screen sizes for a cache win!
    imgPlaceholder.src = 'https://i.ytimg.com/vi/' +
        encodeURIComponent(this.videoid_) + '/sddefault.jpg';
    imgPlaceholder.setAttribute('placeholder', '');
    imgPlaceholder.width = this.width_;
    imgPlaceholder.height = this.height_;

    this.element.appendChild(imgPlaceholder);
    this.applyFillContent(imgPlaceholder);

    // Because sddefault.jpg isn't available for all videos, we try to load
    // it and fallback to hqdefault.jpg.
    loadPromise(imgPlaceholder).then(() => {
      // A pretty ugly hack since onerror won't fire on YouTube image 404.
      // This might be due to the fact that YouTube returns data to the request
      // even when the status is 404. YouTube returns a placeholder image that
      // is 120x90.
      if (imgPlaceholder.naturalWidth == 120 &&
          imgPlaceholder.naturalHeight == 90) {
        throw new Error('sddefault.jpg is not found');
      }
    }).catch(() => {
      imgPlaceholder.src = 'https://i.ytimg.com/vi/' +
          encodeURIComponent(videoid) + '/hqdefault.jpg';
      return loadPromise(imgPlaceholder);
    }).then(() => {
      setStyles(imgPlaceholder, {
        'visibility': ''
      });
    });
  }
};

AMP.registerElement('amp-youtube', AmpYoutube);
