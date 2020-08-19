/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {
  addUnsafeAllowAutoplay,
  createFrameFor,
  isJsonOrObj,
  mutedOrUnmutedEvent,
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {dev, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {disableScrollingOnIframe} from '../../../src/iframe-helper';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {getMode} from '../../../src/mode';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';

/** @private @const */
const TAG = 'amp-adplayer-pro';

/** @private @const */
const EVENTS = {
  'ready': VideoEvents.LOAD,
  'play': VideoEvents.PLAYING,
  'pause': VideoEvents.PAUSE,
  'complete': VideoEvents.ENDED,
  'AdStarted': VideoEvents.AD_START,
  'AdCompleted': VideoEvents.AD_END,
};

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpAdPlayerPro extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.placement_ = '';

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?function()} */
    this.unlistenFullscreen_ = null;

    /** @private {?number}  */
    this.currentTime_ = 0;

    /** @private {?number}  */
    this.duration_ = 0;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      this.getVideoIframeSrc_(),
      opt_onLayout
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * Gets the source of video
   *
   * @return {string}
   */
  getVideoIframeSrc_() {
    if (getMode(this.win).localDev) {
      const testSrc = new URLSearchParams(document.location.search).get(
        'testAmpSrc'
      );
      if (testSrc) {
        return testSrc + '#amp';
      }
    }

    return (
      'https://serving.stat-rock.com/v1/placements/' +
      this.placement_ +
      '/code/amp/1#amp'
    );
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    this.placement_ = userAssert(
      element.getAttribute('data-placement'),
      'The data-placement attribute is required for <amp-adplayer-pro> %s',
      element
    );

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(element);
    Services.videoManagerForDoc(element).register(this);
  }

  /** @override */
  layoutCallback() {
    const iframe = createFrameFor(this, this.getVideoIframeSrc_());
    addUnsafeAllowAutoplay(iframe);
    disableScrollingOnIframe(iframe);

    this.iframe_ = /** @type {HTMLIFrameElement} */ (iframe);

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.onMessage_.bind(this)
    );

    this.unlistenFullscreen_ = listen(iframe, 'fullscreenchange', () => {
      this.sendCommand_('fullscreen', this.isFullscreen());
    });

    return this.loadPromise(iframe).then(() => this.playerReadyPromise_);
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

    if (this.unlistenFullscreen_) {
      this.unlistenFullscreen_();
    }

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;
    return true; // Call layoutCallback again.
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  // /** @override */
  // createPlaceholderCallback() {
  //
  // }

  /**
   * @param {string} method
   * @param {number|boolean|string|Object|undefined} [params]
   * @private
   */
  sendCommand_(method, params) {
    this.playerReadyPromise_.then(() => {
      if (!this.iframe_ || !this.iframe_.contentWindow) {
        return;
      }

      dev().info(TAG, 'send:', method, params);

      this.iframe_.contentWindow./*OK*/ postMessage(
        JSON.stringify(
          dict({
            'method': method,
            'params': params,
          })
        ),
        '*'
      );
    });
  }

  /**
   * @param {Event} messageEvent
   * @private
   */
  onMessage_(messageEvent) {
    if (
      !this.iframe_ ||
      !messageEvent ||
      messageEvent.source != this.iframe_.contentWindow
    ) {
      return;
    }

    const messageData = getData(messageEvent);

    if (!isJsonOrObj(messageData)) {
      return;
    }

    const data = objOrParseJson(messageData);
    dev().info(TAG, 'onMessage:', data);
    const event = data['event'];
    const params = data['params'];

    if (event === 'ready') {
      this.playerReadyResolver_(this.iframe_);
      return;
    }

    const {element} = this;

    if (redispatch(element, event, EVENTS)) {
      return;
    }

    if (event === 'muted') {
      element.dispatchCustomEvent(mutedOrUnmutedEvent(params.muted));
    } else if (event === 'time') {
      this.currentTime_ = params.currentTime;
      this.duration_ = params.duration;
    } else if (event === 'fullscreen') {
      if (params['fullscreen'] !== this.isFullscreen()) {
        params.fullscreen ? this.fullscreenEnter() : this.fullscreenExit();
      }
    }
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
  play(unusedIsAutoplay) {
    this.sendCommand_('play');
  }

  /** @override */
  pause() {
    this.sendCommand_('pause');
  }

  /** @override */
  mute() {
    this.sendCommand_('muted', true);
  }

  /** @override */
  unmute() {
    this.sendCommand_('muted', false);
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
    return /** @type {number} */ (this.currentTime_);
  }

  /** @override */
  getDuration() {
    return /** @type {number} */ (this.duration_);
  }

  /** @override */
  getPlayedRanges() {
    // Not supported.
    return [];
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdPlayerPro);
});
