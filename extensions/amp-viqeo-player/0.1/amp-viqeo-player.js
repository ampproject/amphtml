/* eslint-disable no-unused-vars */
/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Deferred} from '../../../src/utils/promise';
import {Layout, isLayoutSizeDefined} from '../../../src/layout';
import {Services} from '../../../src/services';
import {VideoAttributes, VideoEvents} from '../../../src/video-interface';

import {dev, userAssert} from '../../../src/log';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {getIframe} from '../../../src/3p-frame';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';

const TAG = 'amp-viqeo-player';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpViqeoPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?number} */
    this.volume_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?Object} */
    this.viqeoPlayer_ = null;

    /** @private {boolean} */
    this.hasAutoplay_ = false;

    /** @private {string} */
    this.videoId_ = '';
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://api.viqeo.tv', opt_onLayout);
    this.preconnect.url('https://cdn.viqeo.tv', opt_onLayout);
  }

  /**
   * @param {!Layout} layout
   * @return {boolean}
   * @override
   */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {

    this.videoId_ = userAssert(
        this.element.getAttribute('data-videoid'),
        'The data-videoid attribute is required for <amp-viqeo-player> %s',
        this.element);

    userAssert(
        this.element.getAttribute('data-profileid'),
        'The data-profileid attribute is required for <amp-viqeo-player> %s',
        this.element);

    this.hasAutoplay_ = this.element.hasAttribute(VideoAttributes.AUTOPLAY);

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  layoutCallback() {

    const iframe = getIframe(
        this.win,
        this.element,
        'viqeoplayer',
        {
          'autoplay': this.hasAutoplay_,
        },
        {
          allowFullscreen: true,
        });

    // required to display the user gesture in the iframe
    iframe.setAttribute('allow', 'autoplay');

    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.handleViqeoMessages_.bind(this)
    );

    return this.mutateElement(() => {
      this.element.appendChild(iframe);
      this.iframe_ = /** @type {?HTMLIFrameElement} */ (iframe);
      this.applyFillContent(iframe);
    }).then(() => {
      return this.playerReadyPromise_;
    });
  }

  /**
   * @param {!Event|{data: !JsonObject}} event
   * @return {?JsonObject|string|undefined}
   * @private
   * */
  handleViqeoMessages_(event) {
    const eventData = getData(event);
    if (!eventData ||
        event.source !== (this.iframe_ && this.iframe_.contentWindow) ||
        eventData['source'] !== 'ViqeoPlayer') {
      return;
    }

    const action = eventData['action'];
    if (action === 'ready') {
      this.element.dispatchCustomEvent(VideoEvents.LOAD);
      this.playerReadyResolver_(this.iframe_);
    } else if (action === 'play') {
      this.element.dispatchCustomEvent(VideoEvents.PLAYING);
    } else if (action === 'pause') {
      this.element.dispatchCustomEvent(VideoEvents.PAUSE);
    } else if (action === 'mute') {
      this.element.dispatchCustomEvent(VideoEvents.MUTED);
    } else if (action === 'unmute') {
      this.element.dispatchCustomEvent(VideoEvents.UNMUTED);
    } else if (action === 'volume') {
      this.volume_ = parseFloat(eventData['value']);
      if (this.volume_ === 0) {
        this.element.dispatchCustomEvent(VideoEvents.MUTED);
      } else {
        this.element.dispatchCustomEvent(VideoEvents.UNMUTED);
      }
    }
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

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;
    return true; // Call layoutCallback again.
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.element.ownerDocument.createElement('amp-img');
    this.propagateAttributes(['aria-label'], placeholder);
    if (placeholder.hasAttribute('aria-label')) {
      placeholder.setAttribute('alt',
          'Loading video - ' + placeholder.getAttribute('aria-label')
      );
    } else {
      placeholder.setAttribute('alt', 'Loading video');
    }
    placeholder.setAttribute('src',
        `https://cdn.viqeo.tv/preview/${encodeURIComponent(this.videoId_)}.jpg`);
    placeholder.setAttribute('layout', 'fill');
    placeholder.setAttribute('placeholder', '');
    placeholder.setAttribute('referrerpolicy', 'origin');
    this.applyFillContent(placeholder);
    return placeholder;
  }

  /** @override */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  play() {
    this.sendCommand_('play');
  }

  /** @override */
  pause() {
    this.sendCommand_('pause');
  }

  /** @override */
  mute() {
    this.sendCommand_('mute');
  }

  /** @override */
  unmute() {
    this.sendCommand_('unmute');
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
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  getCurrentTime() {
    if (!this.viqeoPlayer_) {
      return 0;
    }
    return this.viqeoPlayer_.getCurrentTime();
  }

  /** @override */
  getDuration() {
    if (!this.viqeoPlayer_) {
      return 1;
    }
    return this.viqeoPlayer_.getDuration();
  }

  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }

  /**
   * Sends a command to the player
   * @param {string|JsonObject} command
   * @private
   */
  sendCommand_(command) {
    if (!this.iframe_) {
      return;
    }
    const {contentWindow} = this.iframe_;
    if (!contentWindow) {
      return;
    }

    if (typeof command === 'string') {
      command = /** @type {JsonObject} */ ({
        action: command,
      });
    }
    contentWindow./*OK*/postMessage(command, '*');
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpViqeoPlayer);
});

export default AmpViqeoPlayer;
