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

import {Deferred} from '../../../src/utils/promise';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {
  addParamToUrl,
  addParamsToUrl,
  parseQueryString,
} from '../../../src/url';
import {
  createFrameFor,
  mutedOrUnmutedEvent,
  originMatches,
  redispatch,
} from '../../../src/iframe-video';
import {dev, devAssert, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  fullscreenEnter,
  fullscreenExit,
  getDataParamsFromAttributes,
  isFullscreenElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';


const TAG = 'amp-dailymotion';


/**
 * Player events reverse-engineered from the Dailymotion API
 * NOTE: 'unstarted' isn't part of the API, just a placeholder
 * as an initial state
 *
 * @enum {string}
 * @private
 */
const DailymotionEvents = {
  UNSTARTED: 'unstarted',
  API_READY: 'apiready',
  // Events fired for both the original content or ads
  START: 'start',
  PLAY: 'play',
  PAUSE: 'pause',
  END: 'end',
  // Events fired only for ads
  AD_START: 'ad_start',
  AD_PLAY: 'ad_play',
  AD_PAUSE: 'ad_pause',
  AD_END: 'ad_end',
  // Events fired only for the original content
  VIDEO_START: 'video_start',
  VIDEO_END: 'video_end',
  // Other events
  VOLUMECHANGE: 'volumechange',
  STARTED_BUFFERING: 'progress',
  FULLSCREEN_CHANGE: 'fullscreenchange',
};

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpDailymotion extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private {string} */
    this.playerState_ = DailymotionEvents.UNSTARTED;

    /** @private {?string}  */
    this.videoid_ = null;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {boolean}  */
    this.muted_ = false;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Promise} */
    this.startedBufferingPromise_ = null;

    /** @private {?Function} */
    this.startedBufferingResolver_ = null;

    /** @private {boolean} */
    this.isFullscreen_ = false;

  }

  /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://www.dailymotion.com', opt_onLayout);
    // Host that Dailymotion uses to serve JS needed by player.
    this.preconnect.url('https://static1.dmcdn.net', opt_onLayout);
  }

  /**
   * @override
   */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    // Dailymotion videos are always interactive. There is no Dailymotion param
    // that makes the video non-interactive. Even controls=false will not
    // prevent user from pausing or resuming the video.
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
  buildCallback() {
    this.videoid_ = userAssert(
        this.element.getAttribute('data-videoid'),
        'The data-videoid attribute is required for <amp-dailymotion> %s',
        this.element);

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
    const readyDeferred = new Deferred();
    this.playerReadyPromise_ = readyDeferred.promise;
    this.playerReadyResolver_ = readyDeferred.resolve;

    const bufferingDeferred = new Deferred();
    this.startedBufferingPromise_ = bufferingDeferred.promise;
    this.startedBufferingResolver_ = bufferingDeferred.resolve;
  }

  /** @override */
  layoutCallback() {
    devAssert(this.videoid_);

    this.iframe_ = createFrameFor(this, this.getIframeSrc_());

    listen(this.win, 'message', this.handleEvents_.bind(this));

    return this.loadPromise(this.iframe_);
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleEvents_(event) {
    if (!originMatches(event, this.iframe_, 'https://www.dailymotion.com')) {
      return;
    }
    const eventData = getData(event);
    if (!eventData || !event.type || event.type != 'message') {
      return; // Event empty
    }
    const data = parseQueryString(/** @type {string} */ (eventData));
    if (data === undefined) {
      return; // The message isn't valid
    }

    redispatch(this.element, data['event'], {
      [DailymotionEvents.API_READY]: VideoEvents.LOAD,
      [DailymotionEvents.END]: [VideoEvents.ENDED, VideoEvents.PAUSE],
      [DailymotionEvents.PAUSE]: VideoEvents.PAUSE,
      [DailymotionEvents.PLAY]: VideoEvents.PLAYING,
    });

    switch (data['event']) {
      case DailymotionEvents.API_READY:
        this.playerReadyResolver_(true);
        break;

      case DailymotionEvents.END:
        this.playerState_ = DailymotionEvents.PAUSE;
        break;

      case DailymotionEvents.PAUSE:
      case DailymotionEvents.PLAY:
        this.playerState_ = data['event'];
        break;

      case DailymotionEvents.VOLUMECHANGE:
        const isMuted =
            data['volume'] == 0 ||
              (data['muted'] == 'true');
        if (this.playerState_ == DailymotionEvents.UNSTARTED
            || this.muted_ != isMuted) {
          this.muted_ = isMuted;
          this.element.dispatchCustomEvent(mutedOrUnmutedEvent(isMuted));
        }
        break;

      case DailymotionEvents.STARTED_BUFFERING:
        this.startedBufferingResolver_(true);
        break;

      case DailymotionEvents.FULLSCREEN_CHANGE:
        this.isFullscreen_ = data['fullscreen'] == 'true';
        break;

      default: // nothing
    }
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @param {Array<boolean>=} opt_args
   * @private
   */
  sendCommand_(command, opt_args) {
    const endpoint = 'https://www.dailymotion.com';
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        const message = JSON.stringify(dict({
          'command': command,
          'parameters': opt_args || [],
        }));
        this.iframe_.contentWindow./*OK*/postMessage(message, endpoint);
      }
    });
  }

  /** @private */
  getIframeSrc_() {

    let iframeSrc = 'https://www.dailymotion.com/embed/video/' +
       encodeURIComponent(this.videoid_ || '') + '?api=1&html=1&app=amp';

    const explicitParamsAttributes = [
      'mute',
      'endscreen-enable',
      'sharing-enable',
      'start',
      'ui-highlight',
      'ui-logo',
      'info',
    ];

    explicitParamsAttributes.forEach(explicitParam => {
      const val = this.element.getAttribute(`data-${explicitParam}`);
      if (val) {
        iframeSrc = addParamToUrl(iframeSrc, explicitParam, val);
      }
    });

    const implicitParams = getDataParamsFromAttributes(this.element);
    iframeSrc = addParamsToUrl(iframeSrc, implicitParams);

    return iframeSrc;
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /**
   * @override
   */
  createLoaderBrandCallback() {
    return createVideoLoaderBrand(this.element);
  }

  /**
   * @override
   */
  play(isAutoplay) {
    this.sendCommand_('play');
    // Hack to solve autoplay problem on Chrome Android
    // (first play always fails)
    if (isAutoplay && this.playerState_ != DailymotionEvents.PAUSE) {
      this.startedBufferingPromise_.then(() => {
        this.sendCommand_('play');
      });
    }
  }

  /**
   * @override
   */
  pause() {
    this.sendCommand_('pause');
  }

  /**
   * @override
   */
  mute() {
    this.sendCommand_('muted', [true]);
    // Hack to simulate firing mute events when video is not playing
    // since Dailymotion only fires volume changes when the video has started
    this.playerReadyPromise_.then(() => {
      this.element.dispatchCustomEvent(VideoEvents.MUTED);
      this.muted_ = true;
    });
  }

  /**
   * @override
   */
  unmute() {
    this.sendCommand_('muted', [false]);
    // Hack to simulate firing mute events when video is not playing
    // since Dailymotion only fires volume changes when the video has started
    this.playerReadyPromise_.then(() => {
      this.element.dispatchCustomEvent(VideoEvents.UNMUTED);
      this.muted_ = false;
    });
  }

  /**
   * @override
   */
  showControls() {
    this.sendCommand_('controls', [true]);
  }

  /**
   * @override
   */
  hideControls() {
    this.sendCommand_('controls', [false]);
  }

  /**
   * @override
   */
  fullscreenEnter() {
    const platform = Services.platformFor(this.win);
    if (platform.isSafari() || platform.isIos()) {
      this.sendCommand_('fullscreen', [true]);
    } else {
      if (!this.iframe_) {
        return;
      }
      fullscreenEnter(dev().assertElement(this.iframe_));
    }
  }

  /**
   * @override
   */
  fullscreenExit() {
    const platform = Services.platformFor(this.win);
    if (platform.isSafari() || platform.isIos()) {
      this.sendCommand_('fullscreen', [false]);
    } else {
      if (!this.iframe_) {
        return;
      }
      fullscreenExit(dev().assertElement(this.iframe_));
    }
  }

  /** @override */
  isFullscreen() {
    const platform = Services.platformFor(this.win);
    if (platform.isSafari() || platform.isIos()) {
      return this.isFullscreen_;
    } else {
      if (!this.iframe_) {
        return false;
      }
      return isFullscreenElement(dev().assertElement(this.iframe_));
    }
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

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpDailymotion);
});
