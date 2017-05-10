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
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isObject} from '../../../src/types';
import {listen} from '../../../src/event-helper';
import {VideoEvents} from '../../../src/video-interface';
import {videoManagerForDoc} from '../../../src/services';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpOoyalaPlayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://player.ooyala.com', opt_onLayout);
  }

  /** @override */
  buildCallback() {
    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });

    installVideoManagerForDoc(this.element);
    videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  layoutCallback() {
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
      src = 'https://player.ooyala.com/static/v4/sandbox/amp_iframe/' +
        'skin-plugin/amp_iframe.html?pcode=' + encodeURIComponent(pCode);
      const configUrl = this.element.getAttribute('data-config');
      if (configUrl) {
        src += '&options[skin.config]=' + encodeURIComponent(configUrl);
      }
    }

    src += '&ec=' + encodeURIComponent(embedCode) +
      '&pbid=' + encodeURIComponent(playerId);

    const iframe = this.element.ownerDocument.createElement('iframe');
    this.applyFillContent(iframe, true);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = src;

    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(this.win, 'message', event => {
      this.handleOoyalaMessages_(event);
    });

    this.element.appendChild(this.iframe_);
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
    // Only send pauseVideo command if the player is playing. Otherwise
    // The player breaks if the user haven't played the video yet specially
    // on mobile.
    if (this.iframe_) {
      this.pause();
    }
  }

  /** @private */
  handleOoyalaMessages_(event) {
    const data = isObject(event.data) ? event.data : tryParseJson(event.data);
    if (data === undefined) {
      return; // We only process valid JSON.
    }
    if (data.data == 'playing') {
      this.element.dispatchCustomEvent(VideoEvents.PLAY);
    } else if (data.data == 'paused') {
      this.element.dispatchCustomEvent(VideoEvents.PAUSE);
    } else if (data.data == 'muted') {
      this.element.dispatchCustomEvent('mute');
    } else if (data.data == 'unmuted') {
      this.element.dispatchCustomEvent('unmute');
    }
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @private
   */
  sendCommand_(command) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        this.iframe_.contentWindow./*OK*/postMessage(command, '*');
      }
    });
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

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
    this.sendCommand_('mute');
  }

  /** @override */
  unmute() {
    this.sendCommand_('unmute');
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
