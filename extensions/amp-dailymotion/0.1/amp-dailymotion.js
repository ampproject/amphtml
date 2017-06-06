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
import {user} from '../../../src/log';
import {VideoEvents} from '../../../src/video-interface';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {listen} from '../../../src/event-helper';
import {videoManagerForDoc} from '../../../src/services';
import {parseQueryString} from '../../../src/url';

const PlayerEvents = {
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
  LOADED: 'progress',
};

class AmpDailymotion extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    /** @private {number} */
    this.playerState_ = PlayerEvents.UNSTARTED;

    /** @private {?string}  */
    this.videoid_ = null;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {boolean}  */
    this.muted_ = false;

    /** @private {?boolean}  */
    this.hasAutoplay_ = false;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Promise} */
    this.loadedPromise_ = null;

    /** @private {?Function} */
    this.loadingResolver_ = null;

  }

 /**
  * @param {boolean=} opt_onLayout
  * @override
  */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://www.dailymotion.com', opt_onLayout);
  }

  /**
   * @override
   */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    // Dailymotion videos are always interactive. There is no YouTube param that
    // makes the video non-interactive. Even data-param-control=0 will not
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
    installVideoManagerForDoc(this.element);
    videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  layoutCallback() {
    this.videoid_ = user().assert(
        this.element.getAttribute('data-videoid'),
        'The data-videoid attribute is required for <amp-dailymotion> %s',
        this.element);
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = 'https://www.dailymotion.com/embed/video/' + encodeURIComponent(
        this.videoid_) + '?' + this.getQuery_();

    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleEvents_.bind(this)
    );

    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });

    this.loadedPromise_ = new Promise(resolve => {
      this.loadingResolver_ = resolve;
    });

    this.hasAutoplay_ = this.element.hasAttribute('autoplay');

    return this.playerReadyPromise_;
  }

  /** @private */
  addQueryParam_(param, query) {
    const val = this.element.getAttribute(`data-${param}`);
    if (val) {
      query.push(`${encodeURIComponent(param)}=${encodeURIComponent(val)}`);
    }
  }

  /** @private */
  handleEvents_(event) {
    if (event.origin != 'https://www.dailymotion.com' ||
        event.source != this.iframe_.contentWindow) {
      return;
    }
    if (!event.data || !event.type || event.type != 'message') {
      return;  // Event empty
    }
    const data = parseQueryString(event.data);
    if (data === undefined) {
      return; // The message isn't valid
    }

    switch (data.event) {
      case PlayerEvents.API_READY:
        this.playerReadyResolver_(true);
        this.element.dispatchCustomEvent(VideoEvents.LOAD);
        break;
      case PlayerEvents.END:
      case PlayerEvents.PAUSE:
        this.element.dispatchCustomEvent(VideoEvents.PAUSE);
        this.playerState_ = PlayerEvents.PAUSE;
        break;
      case PlayerEvents.PLAY:
        this.element.dispatchCustomEvent(VideoEvents.PLAY);
        this.playerState_ = PlayerEvents.PLAY;
        break;
      case PlayerEvents.VOLUMECHANGE:
        if (this.muted != (data.muted == 'true')) {
          this.muted = (data.muted == 'true');
          if (data.volume == 0 || this.muted) {
            this.element.dispatchCustomEvent(VideoEvents.MUTED);
          } else {
            this.element.dispatchCustomEvent(VideoEvents.UNMUTED);
          }
        }
        break;
      case PlayerEvents.LOADED:
        this.loadingResolver_(true);
        break;
      default:

    }
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @param {Array=} opt_args
   * @private
   */
  sendCommand_(command, opt_args) {
    const endpoint = 'https://www.dailymotion.com';
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        const message = JSON.stringify({
          command,
          parameters: opt_args || [],
        });
        this.iframe_.contentWindow./*OK*/postMessage(message, endpoint);
      }
    });
  }

  /** @private */
  getQuery_() {
    const query = [
      'api=1',
      'html=1',
      'app=amp',
    ];

    const settings = [
      'mute',
      'endscreen-enable',
      'sharing-enable',
      'start',
      'ui-highlight',
      'ui-logo',
      'info',
    ];

    settings.forEach(setting => {
      this.addQueryParam_(setting, query);
    });

    return query.join('&');
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.pause();
    }
  }

  /**
   * @override
   */
  play(isAutoplay) {
    this.sendCommand_('play');
    // Hack to solve autoplay problem on Chrome Android
    // (first play always fails)
    if (isAutoplay) {
      this.loadedPromise_.then(() => {
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
    if (this.playerState_ == PlayerEvents.UNSTARTED) {
      this.element.dispatchCustomEvent(PlayerEvents.MUTED);
    }
  }

  /**
   * @override
   */
  unmute() {
    this.sendCommand_('muted', [false]);
    // Hack to simulate firing mute events when video is not playing
    // since Dailymotion only fires volume changes when the video has started
    if (this.playerState_ == PlayerEvents.UNSTARTED) {
      this.element.dispatchCustomEvent(PlayerEvents.UNMUTED);
    }
  }

  /**
   * @override
   */
  showControls() {
    // Not supported.
  }

  /**
   * @override
   */
  hideControls() {
    // Not supported.
  }
};

AMP.registerElement('amp-dailymotion', AmpDailymotion);
