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

import {getDataParamsFromAttributes} from '../../../src/dom';
import {loadPromise} from '../../../src/event-helper';
import {tryParseJson} from '../../../src/json';
import {getLengthNumeral, isLayoutSizeDefined} from '../../../src/layout';
import {user} from '../../../src/log';
import {setStyles} from '../../../src/style';
import {addParamsToUrl} from '../../../src/url';
import {timer} from '../../../src/timer';
import {isObject} from '../../../src/types';

/** @type {number} Value of YouTube player state when playing. */
const YT_PLAYER_STATE_PLAYING = 1;

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
  renderOutsideViewport() {
    return false;
  }

  /** @override */
  buildCallback() {
    const width = this.element.getAttribute('width');
    const height = this.element.getAttribute('height');

    /** @private @const {number} */
    this.width_ = getLengthNumeral(width);

    /** @private @const {number} */
    this.height_ = getLengthNumeral(height);

    /** @private {number} */
    this.playerState_ = 0;

    // The video-id is supported only for backward compatibility.
    /** @private @const {string} */
    this.videoid_ = user.assert(
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
    const iframe = this.element.ownerDocument.createElement('iframe');

    let src = `https://www.youtube.com/embed/${encodeURIComponent(this.videoid_)}?enablejsapi=1`;

    const params = getDataParamsFromAttributes(this.element);
    if ('autoplay' in params) {
      delete params['autoplay'];
      user.warn('Autoplay is currently not support with amp-youtube.');
    }
    src = addParamsToUrl(src, params);

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);
    iframe.width = this.width_;
    iframe.height = this.height_;
    this.element.appendChild(iframe);

    /** @private {!Element} */
    this.iframe_ = iframe;

    /** @private @const {!Promise} */
    this.playerReadyPromise_ = new Promise(resolve => {
      /** @private @const {function()} */
      this.playerReadyResolver_ = resolve;
    });

    this.win.addEventListener(
        'message', event => this.handleYoutubeMessages_(event));

    return loadPromise(iframe)
        .then(() => {
          // Make sure the YT player is ready for this. For some reason YT player
          // would send couple of messages but then stop. Waiting for a bit before
          // sending the 'listening' event seems to fix that and allow YT
          // Player to send messages continuously.
          return timer.promise(300);
        })
        .then(() => this.listenToFrame_())
        .then(() => this.playerReadyPromise_);
  }

  /** @override */
  pauseCallback() {
    // Only send pauseVideo command if the player is playing. Otherwise
    // The player breaks if the user haven't played the video yet specially
    // on mobile.
    if (this.iframe_ && this.iframe_.contentWindow &&
        this.playerState_ == YT_PLAYER_STATE_PLAYING) {
      this.pauseVideo_();
    }
  }

  /** @private */
  pauseVideo_() {
    this.iframe_.contentWindow./*OK*/postMessage(JSON.stringify({
      'event': 'command',
      'func': 'pauseVideo',
      'args': '',
    }), '*');
  }

  /** @private */
  handleYoutubeMessages_(event) {
    if (event.origin != 'https://www.youtube.com' ||
        event.source != this.iframe_.contentWindow) {
      return;
    }
    if (!event.data ||
        !(isObject(event.data) || event.data.indexOf('{') == 0)) {
      return;  // Doesn't look like JSON.
    }
    const data = isObject(event.data) ? event.data : tryParseJson(event.data);
    if (data === undefined) {
      return; // We only process valid JSON.
    }
    if (data.event == 'onReady') {
      this.playerReadyResolver_(this.iframe_);
    } else if (data.event == 'infoDelivery' &&
        data.info && data.info.playerState !== undefined) {
      this.playerState_ = data.info.playerState;
    }
  }

  /**
   * Sends 'listening' message to the YouTube iframe to listen for events.
   * @private
   */
  listenToFrame_() {
    this.iframe_.contentWindow./*OK*/postMessage(JSON.stringify({
      'event': 'listening',
    }), '*');
  }

  /** @private */
  buildImagePlaceholder_() {
    const imgPlaceholder = this.element.ownerDocument.createElement('img');
    const videoid = this.videoid_;

    setStyles(imgPlaceholder, {
      // Cover matches YouTube Player styling.
      'object-fit': 'cover',
      // Hiding the placeholder initially to give the browser time to fix
      // the object-fit: cover.
      'visibility': 'hidden',
    });

    // TODO(mkhatib): Maybe add srcset to allow the browser to
    // load the needed size or even better match YTPlayer logic for loading
    // player thumbnails for different screen sizes for a cache win!
    imgPlaceholder.src = 'https://i.ytimg.com/vi/' +
        encodeURIComponent(this.videoid_) + '/sddefault.jpg#404_is_fine';
    imgPlaceholder.setAttribute('placeholder', '');
    imgPlaceholder.width = this.width_;
    imgPlaceholder.height = this.height_;
    imgPlaceholder.setAttribute('referrerpolicy', 'origin');

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
        'visibility': '',
      });
    });
  }
};

AMP.registerElement('amp-youtube', AmpYoutube);
