/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {dev, user} from '../../../src/log';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {isObject} from '../../../src/types';
import {tryParseJson} from '../../../src/json';

const TAG = 'amp-3q-player';


/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class Amp3QPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    this.dataId = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://playout.3qsdn.com', opt_onLayout);
  }

  /** @override */
  buildCallback() {

    this.dataId = user().assert(
        this.element.getAttribute('data-id'),
        'The data-id attribute is required for <amp-3q-player> %s',
        this.element);

    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  layoutCallback() {

    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.sdnBridge_.bind(this)
    );

    this.applyFillContent(iframe, true);
    iframe.src = 'https://playout.3qsdn.com/'
        + encodeURIComponent(dev().assertString(this.dataId))
        + '?autoplay=false&amp=true';
    this.element.appendChild(iframe);

    return this.loadPromise(this.iframe_).then(() =>
      this.playerReadyPromise_);
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

    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });

    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  viewportCallback(visible) {
    this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_) {
      this.pause();
    }
  }

  sdnBridge_(event) {
    if (event.source) {
      if (event.source != this.iframe_.contentWindow) {
        return;
      }
    }

    const data = isObject(getData(event))
      ? getData(event)
      : tryParseJson(getData(event));
    if (data === undefined) {
      return;
    }

    switch (data['data']) {
      case 'ready':
        this.element.dispatchCustomEvent(VideoEvents.LOAD);
        this.playerReadyResolver_();
        break;
      case 'playing':
        this.element.dispatchCustomEvent(VideoEvents.PLAYING);
        break;
      case 'paused':
        this.element.dispatchCustomEvent(VideoEvents.PAUSE);
        break;
      case 'muted':
        this.element.dispatchCustomEvent(VideoEvents.MUTED);
        break;
      case 'unmuted':
        this.element.dispatchCustomEvent(VideoEvents.UNMUTED);
        break;
    }
  }

  sdnPostMessage_(message) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        this.iframe_.contentWindow./*OK*/postMessage(message, '*');
      }
    });
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface
  /** @override */
  play() {
    this.sdnPostMessage_('play2');
  }

  /** @override */
  pause() {
    this.sdnPostMessage_('pause');
  }

  /** @override */
  mute() {
    this.sdnPostMessage_('mute');
  }

  /** @override */
  unmute() {
    this.sdnPostMessage_('unmute');
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
  showControls() {
    this.sdnPostMessage_('showControlbar');
  }

  /** @override */
  hideControls() {
    this.sdnPostMessage_('hideControlbar');
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


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, Amp3QPlayer);
});
