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
import {tryParseJson} from '../../../src/json';
import {user} from '../../../src/log';
import {removeElement} from '../../../src/dom';
import {isObject} from '../../../src/types';
import {VideoEvents} from '../../../src/video-interface';

/**
 * @enum {number}
 * @private
 */
const PlayerStates = {
  PLAYING: 1,
  PAUSED: 2,
};

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpOoyalaPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {number} */
    this.playerState_ = 0;

    /** @private {?Element} */
    this.iframe_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://player.ooyala.com', opt_onLayout);
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');
    this.iframe_ = iframe;

    const embedCode = user().assert(
        this.element.getAttribute('data-embedcode'),
        'The data-embedcode attribute is required for <amp-ooyala-player> %s',
        this.element);
    const pCode = user().assert(
        this.element.getAttribute('data-pcode'),
        'The data-pcode attribute is required for <amp-ooyala-player> %s',
        this.element);
    const playerId = user().assert(
        this.element.getAttribute('data-playerid'),
        'The data-playerid attribute is required for <amp-ooyala-player> %s',
        this.element);

    let src = 'https://player.ooyala.com/iframe.html?platform=html5-priority';
    const playerVersion = this.element.getAttribute('data-playerversion') || '';
    if (playerVersion.toLowerCase() == 'v4') {
      src = 'https://player.ooyala.com/static/v4/stable/latest/skin-plugin/amp_iframe.html?pcode='
        + encodeURIComponent(pCode);
      const configUrl = this.element.getAttribute('data-config');
      if (configUrl) {
        src += '&options[skin.config]=' + encodeURIComponent(configUrl);
      }
    }

    src += '&ec=' + encodeURIComponent(embedCode) +
      '&pbid=' + encodeURIComponent(playerId);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;
    this.applyFillContent(iframe);
    this.element.appendChild(iframe);

    this.win.addEventListener(
        'message', event => this.handleOoyalaMessages_(event));

    return this.loadPromise(iframe).then(() => {
      this.element.dispatchCustomEvent(VideoEvents.LOAD);
    });
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
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
    // Only send pauseVideo command if the player is playing. Otherwise
    // The player breaks if the user haven't played the video yet specially
    // on mobile.
    if (this.iframe_ && this.iframe_.contentWindow &&
        this.playerState_ == PlayerStates.PLAYING) {
      this.pause();
    }
  }

  /** @private */
  handleOoyalaMessages_(event) {
    if (event.origin != 'https://player.ooyala.com' ||
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
    if (data.event == 'infoDelivery' &&
        data.info && data.info.playerState !== undefined) {
      this.playerState_ = data.info.playerState;
      if (this.playerState_ == PlayerStates.PAUSED) {
        this.element.dispatchCustomEvent(VideoEvents.PAUSE);
      } else if (this.playerState_ == PlayerStates.PLAYING) {
        this.element.dispatchCustomEvent(VideoEvents.PLAY);
      }
    }
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /** @override */
  play(unusedIsAutoplay) {
    this.iframe_.contentWindow.postMessage(JSON.stringify(
      {'event': 'command', 'func': VideoEvents.PLAY, 'args': ''}
    ));
  }

  /** @override */
  pause() {
    this.iframe_.contentWindow.postMessage(JSON.stringify(
      {'event': 'command', 'func': VideoEvents.PAUSE, 'args': ''}
    ));
  }

  /** @override */
  mute() {
    this.iframe_.contentWindow.postMessage(JSON.stringify(
      {'event': 'command', 'func': 'mute', 'args': ''}
    ));
  }

  /** @override */
  unmute() {
    this.iframe_.contentWindow.postMessage(JSON.stringify(
      {'event': 'command', 'func': 'unmute', 'args': ''}
    ));
  }

  /** @override */
  unlayoutOnPause() {
    return false;
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
  }

  /** @override */
  hideControls() {
  }
};

AMP.registerElement('amp-ooyala-player', AmpOoyalaPlayer);
