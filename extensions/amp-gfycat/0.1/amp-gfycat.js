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

import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {addParamsToUrl} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpGfycat extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string}  */
    this.videoid_ = '';

    /**
     * @private {?Element}
     */
    this.iframe_ = null;

    /** @private {?string} */
    this.videoIframeSrc_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;
  }

  /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback(opt_onLayout) {
    // Gfycat iframe
    this.preconnect.url('https://gfycat.com', opt_onLayout);

    // Iframe video and poster urls
    this.preconnect.url('https://giant.gfycat.com', opt_onLayout);
    this.preconnect.url('https://thumbs.gfycat.com', opt_onLayout);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.videoid_ = this.getVideoId_();

    // Enable autoplay by default
    if (!this.element.hasAttribute('noautoplay')) {
      this.element.setAttribute('autoplay', '');
    }

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('amp-img');
    const videoid = dev().assertString(this.videoid_);

    placeholder.setAttribute('src',
        'https://thumbs.gfycat.com/' +
        encodeURIComponent(videoid) + '-poster.jpg');
    placeholder.setAttribute('layout', 'fill');
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('referrerpolicy', 'origin');
    this.applyFillContent(placeholder);

    return placeholder;
  }

  /**
   * @return {string}
   * @private
   */
  getVideoId_() {
    return user().assert(
        this.element.getAttribute('data-gfyid'),
        'The data-gfyid attribute is required for <amp-gfycat> %s',
        this.element);
  }

  /** @return {string} */
  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }

    const videoid = dev().assertString(this.videoid_);
    let src = 'https://gfycat.com/ifr/' + encodeURIComponent(videoid);

    const params = getDataParamsFromAttributes(this.element);

    const noautoplay = this.element.hasAttribute('noautoplay');
    if (noautoplay) {
      params['autoplay'] = '0';
    }
    src = addParamsToUrl(src, params);
    return this.videoIframeSrc_ = src;
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    const src = this.getVideoIframeSrc_();

    iframe.setAttribute('frameborder', '0');
    iframe.src = src;
    this.applyFillContent(iframe);
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.handleGfycatMessages_.bind(this)
    );

    this.element.appendChild(iframe);
    return this.loadPromise(this.iframe_).then(() => {
      this.element.dispatchCustomEvent(VideoEvents.LOAD);
    });
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }
    return true; // Call layoutCallback again.
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @param {*=} opt_arg
   * @private
   * */
  sendCommand_(command, opt_arg) {
    if (this.iframe_ && this.iframe_.contentWindow) {
      const message = command;
      this.iframe_.contentWindow./*OK*/postMessage(message, '*');
    }
  }

  /** @private */
  handleGfycatMessages_(event) {
    const eventData = /** @type {?string|undefined} */ (getData(event));

    if (event.origin !== 'https://gfycat.com' ||
        event.source != this.iframe_.contentWindow ||
        typeof eventData !== 'string') {
      return;
    }

    if (eventData == 'paused') {
      this.element.dispatchCustomEvent(VideoEvents.PAUSE);
    } else if (eventData == 'playing') {
      this.element.dispatchCustomEvent(VideoEvents.PLAYING);
    }
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /**
   * @override
   */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return false;
  }

  /** @override */
  play(unusedIsAutoplay) {
    this.sendCommand_('play');
  }

  /** @override */
  pause() {
    this.sendCommand_('pause');
  }

  /** @override */

  mute() {
    // All Gfycat videos have no sound.
  }

  /** @override */
  unmute() {
    // All Gfycat videos have no sound.
  }

  /** @override */
  showControls() {
    // Not supported.
  }

  /** @override */
  hideControls() {
    // Not supported.
  }

  /**
   * @override
   */
  fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }
    fullscreenEnter(dev().assertElement(this.iframe_));
  }

  /**
   * @override
   */
  fullscreenExit() {
    if (!this.iframe_) {
      return;
    }
    fullscreenExit(dev().assertElement(this.iframe_));
  }

  /** @override */
  isFullscreen() {
    if (!this.iframe_) {
      return false;
    }
    return isFullscreenElement(dev().assertElement(this.iframe_));
  }

  /** @override */
  getMetadata() {
    // Not implemented
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /** @override */
  getCurrentTime() {
    // Not supported.
    return 0;
  }

  /** @override */
  getDuration() {
    // Not supported.
    return 1;
  }

  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }
}


AMP.extension('amp-gfycat', '0.1', AMP => {
  AMP.registerElement('amp-gfycat', AmpGfycat);
});
