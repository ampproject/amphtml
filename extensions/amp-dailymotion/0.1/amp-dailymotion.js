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
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {VideoEvents} from '../../../src/video-interface';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {getData, listen} from '../../../src/event-helper';
import {videoManagerForDoc} from '../../../src/services';
import {parseQueryString} from '../../../src/url';
import {getDataParamsFromAttributes} from '../../../src/dom';
import {addParamsToUrl} from '../../../src/url';


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

    /** @private {?boolean}  */
    this.hasAutoplay_ = false;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Promise} */
    this.startedBufferingPromise_ = null;

    /** @private {?Function} */
    this.startedBufferingResolver_ = null;

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
    this.videoid_ = user().assert(
        this.element.getAttribute('data-videoid'),
        'The data-videoid attribute is required for <amp-dailymotion> %s',
        this.element);

    installVideoManagerForDoc(this.element);
    videoManagerForDoc(this.element).register(this);
    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });

    this.startedBufferingPromise_ = new Promise(resolve => {
      this.startedBufferingResolver_ = resolve;
    });
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    dev().assert(this.videoid_);
    iframe.src = this.getIframeSrc_();
    // iframe.src = 'https://www.dailymotion.com/embed/video/' +
    //  encodeURIComponent(this.videoid_ || '') + '?' + this.getQuery_();

    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.handleEvents_.bind(this)
    );

    this.hasAutoplay_ = this.element.hasAttribute('autoplay');

    return this.loadPromise(this.iframe_);
  }

  /** @private */
  addDictParam_(param, dict) {
    const val = this.element.getAttribute(`data-${param}`);
    if (val) {
      dict[ encodeURIComponent(param) ] = encodeURIComponent(val);
    }
  }

  /** @private */
  handleEvents_(event) {
    if (event.origin != 'https://www.dailymotion.com' ||
        event.source != this.iframe_.contentWindow) {
      return;
    }
    if (!getData(event) || !event.type || event.type != 'message') {
      return;  // Event empty
    }
    const data = parseQueryString(/** @type {string} */ (getData(event)));
    if (data === undefined) {
      return; // The message isn't valid
    }

    switch (data['event']) {
      case DailymotionEvents.API_READY:
        this.playerReadyResolver_(true);
        this.element.dispatchCustomEvent(VideoEvents.LOAD);
        break;
      case DailymotionEvents.END:
      case DailymotionEvents.PAUSE:
        this.element.dispatchCustomEvent(VideoEvents.PAUSE);
        this.playerState_ = DailymotionEvents.PAUSE;
        break;
      case DailymotionEvents.PLAY:
        this.element.dispatchCustomEvent(VideoEvents.PLAY);
        this.playerState_ = DailymotionEvents.PLAY;
        break;
      case DailymotionEvents.VOLUMECHANGE:
        if (this.playerState_ == DailymotionEvents.UNSTARTED
            || this.muted_ != (
                data['volume'] == 0 || (data['muted'] == 'true'))) {
          this.muted_ = (data['volume'] == 0 || (data['muted'] == 'true'));
          if (this.muted_) {
            this.element.dispatchCustomEvent(VideoEvents.MUTED);
          } else {
            this.element.dispatchCustomEvent(VideoEvents.UNMUTED);
          }
        }
        break;
      case DailymotionEvents.STARTED_BUFFERING:
        this.startedBufferingResolver_(true);
        break;
      default:

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

    iframeSrc = 'https://www.dailymotion.com/embed/video/' +
       encodeURIComponent(this.videoid_ || '');

    const fixedParams = {
      api: 1,
      html: 1,
      app: 'amp',
    };

    iframeSrc = addParamsToUrl(iframeSrc, fixedParams);

    const explicitParamsAttributes = [
      'mute',
      'endscreen-enable',
      'sharing-enable',
      'start',
      'ui-highlight',
      'ui-logo',
      'info',
    ];

    var explicitParams = dict();

    explicitParamsAttributes.forEach(explicitParam => {
      this.addDictParam_(explicitParam, explicitParams);
    });
    iframeSrc = addParamsToUrl(iframeSrc, explicitParams);

    var implicitParams = getDataParamsFromAttributes(this.element);
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
    // Not supported
  }

  /**
   * @override
   */
  hideControls() {
    // Not supported
  }
};

AMP.registerElement('amp-dailymotion', AmpDailymotion);
