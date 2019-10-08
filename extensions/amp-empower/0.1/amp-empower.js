/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
import {addParamsToUrl} from '../../../src/url';
import {
  createFrameFor,
  isJsonOrObj,
  mutedOrUnmutedEvent,
  objOrParseJson,
  originMatches,
  redispatch,
} from '../../../src/iframe-video';
import {dev, devAssert, userAssert} from '../../../src/log';
import {
  fullscreenEnter,
  fullscreenExit,
  getDataParamsFromAttributes,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';

const TAG = 'amp-empower';

const PlayerEventMap = {
  'adStart': VideoEvents.AD_START,
  'adComplete': VideoEvents.AD_END,
  'videoStart': VideoEvents.PLAYING,
  'videoComplete': [VideoEvents.ENDED, VideoEvents.PAUSE],
  'videoResume': VideoEvents.PLAYING,
  'videoPause': VideoEvents.PAUSE,
  'videoReplay': VideoEvents.PLAYING,
};

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpEmpower extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?boolean} */
    this.isFirstPlay_ = true;

    /** @private {?string} */
    this.videoId_ = null;

    /** @private {?string} */
    this.videoIframeSrc_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Promise} */
    this.playerLoadedPromise_ = null;

    /** @private {?Function} */
    this.playerLoadedResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    const {preconnect} = this;
    preconnect.url(this.getVideoIframeSrc_());
    preconnect.url('https://cdn.empower.net', opt_onLayout);
    preconnect.url('https://str.empower.net', opt_onLayout);
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
  buildCallback() {
    this.videoId_ = userAssert(
      this.getVideoId_(),
      'The data-video attribute is required for <amp-empower> %s',
      this.element
    );

    const readyDeferred = new Deferred();
    this.playerReadyPromise_ = readyDeferred.promise;
    this.playerReadyResolver_ = readyDeferred.resolve;

    const loadedDeferred = new Deferred();
    this.playerLoadedPromise_ = loadedDeferred.promise;
    this.playerLoadedResolver_ = loadedDeferred.resolve;

    installVideoManagerForDoc(this.element);
  }

  /** @override */
  layoutCallback() {
    devAssert(this.videoId_);

    this.iframe_ = createFrameFor(this, this.getVideoIframeSrc_(), null, [
      'allow-same-origin',
      'allow-scripts',
    ]);

    Services.videoManagerForDoc(this.element).register(this);

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleMessage_.bind(this)
    );

    const loaded = this.loadPromise(this.iframe_).then(() => {
      this.element.dispatchCustomEvent(VideoEvents.LOAD);
    });
    this.playerReadyResolver_(loaded);
    return loaded;
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

    const readyDeferred = new Deferred();
    this.playerReadyPromise_ = readyDeferred.promise;
    this.playerReadyResolver_ = readyDeferred.resolve;

    const loadedDeferred = new Deferred();
    this.playerLoadedPromise_ = loadedDeferred.promise;
    this.playerLoadedResolver_ = loadedDeferred.resolve;

    return true;
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.pause();
    }
  }

  /**
   * @return {?string}
   * @private
   */
  getVideoId_() {
    return this.element.getAttribute('data-video');
  }

  /** @return {string} */
  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }

    devAssert(this.videoId_);
    const baseSrc =
      'https://embed.empower.net/?video=' +
      encodeURIComponent(this.videoId_ || '') +
      '&amp=1#amp=1';

    const params = getDataParamsFromAttributes(this.element);
    if ('autoplay' in params) {
      // Autoplay is managed by video manager, do not pass it.
      delete params['autoplay'];
    }

    return (this.videoIframeSrc_ = addParamsToUrl(baseSrc, params));
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {object} command
   * @private
   */
  sendCommand_(command) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        this.iframe_.contentWindow./*OK*/ postMessage(command, '*');
      }
    });
  }

  /**
   *
   * @param {!Event} event
   * @private
   */
  handleMessage_(event) {
    if (!originMatches(event, this.iframe_, 'https://embed.empower.net')) {
      return;
    }
    const eventData = getData(event);
    if (!isJsonOrObj(eventData)) {
      return;
    }

    const data = objOrParseJson(eventData);
    if (data == null) {
      return;
    }

    const eventType = data['type'];

    redispatch(this.element, eventType, PlayerEventMap);

    if (
      eventType === 'statusChange' &&
      data['status'] &&
      data['status'] === 'loaded'
    ) {
      this.playerLoadedResolver_(true);
    }
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

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
    if (this.isFirstPlay_) {
      this.isFirstPlay_ = false;
      this.playerLoadedPromise_.then(() => {
        this.sendCommand_({'command': 'playVideo'});
      });
    } else {
      this.sendCommand_({'command': 'resume'});
    }
  }

  /** @override */
  pause() {
    this.sendCommand_({'command': 'pause'});
  }

  /** @override */
  seekTo(seconds) {
    this.sendCommand_({'command': 'seekTo', 'time': seconds});
  }

  /** @override */
  mute() {
    this.sendCommand_({'command': 'mute'});
    this.element.dispatchCustomEvent(mutedOrUnmutedEvent(true));
  }

  /** @override */
  unmute() {
    this.sendCommand_({'command': 'unmute'});
    this.element.dispatchCustomEvent(mutedOrUnmutedEvent(false));
  }

  /** @override */
  showControls() {}

  /** @override */
  hideControls() {}

  /** @override */
  fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }
    fullscreenEnter(dev().assertElement(this.iframe_));
  }

  /** @override */
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
  getMetadata() {}

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
  AMP.registerElement(TAG, AmpEmpower);
});
