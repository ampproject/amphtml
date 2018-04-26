/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
import {dict} from '../../../src/utils/object';
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
import {isObject} from '../../../src/types';
import {startsWith} from '../../../src/string';
import {tryParseJson} from '../../../src/json';

const TAG = 'amp-brightcove';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpBrightcove extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?boolean} */
    this.playing_ = false;

    /** @private {?boolean}  */
    this.muted_ = false;

    /** @private {?boolean}  */
    this.hasAmpSupport_ = false;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?number} */
    this.readyTimeout_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /**@private {?string} */
    this.playerId_ = null;
  }

  /** @override */
  preconnectCallback() {
    this.preconnect.url('https://players.brightcove.net');
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  viewportCallback(visible) {
    this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {
      visible,
    });
  }

  /** @override */
  buildCallback() {
    this.iframe_ = null;

    this.playerReadyPromise_ = new Promise(resolve => {
      this.playerReadyResolver_ = resolve;
    });

    // Warn if the player does not have video interface support
    this.readyTimeout_ = window.setTimeout(() => {
      dev().warn(TAG,
          `Did not receive ready callback from player ${this.playerId_}.` +
        ' Ensure it has the videojs-amp-support plugin configured.');
    }, 3000);

    this.playerReadyResolver_(this.iframe_);
  }

  /** @override */
  layoutCallback() {
    const iframe = this.element.ownerDocument.createElement('iframe');

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = this.getIframeSrc_();

    this.applyFillContent(iframe);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
        this.win,
        'message',
        this.handlePlayerMessages_.bind(this)
    );

    return this.loadPromise(iframe)
        .then(() => this.playerReadyPromise_);
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @param {*=} arg
   * @private
   * */
  sendCommand_(command, arg) {
    this.iframe_.contentWindow. /*OK*/ postMessage(JSON.stringify(dict({
      'command': command,
      'args': arg,
    })), 'https://players.brightcove.net');
  }

  /** @private */

  handlePlayerMessages_(event) {
    if (event.origin != 'https://players.brightcove.net' ||
      event.source != this.iframe_.contentWindow) {
      return;
    }
    if (!getData(event) || !(isObject(getData(event)) ||
        startsWith(/** @type {string} */ (getData(event)), '{'))) {
      return; // Doesn't look like JSON.
    }
    /** @const {?JsonObject} */
    const data = /** @type {?JsonObject} */ (isObject(getData(event)) ?
      getData(event) :
      tryParseJson(getData(event)));
    if (data === undefined) {
      return; // We only process valid JSON.
    }

    if (data['event']) {
      if (data['event'] === 'ready') {
        // Clear warning timeout
        window.clearTimeout(this.readyTimeout_);
        dev().info(TAG, `Player ${this.playerId_} ready. ` +
          `Brightcove Player version: ${data['bcVersion']} ` +
          `AMP Support version: ${data['ampSupportVersion']}`);
        this.hasAmpSupport_ = true;
        installVideoManagerForDoc(this.element);
        Services.videoManagerForDoc(this.element).register(this);
        this.element.dispatchCustomEvent(VideoEvents.LOAD);
      }

      if (data['event'] === 'playing') {
        this.playing_ = true;
        this.element.dispatchCustomEvent(VideoEvents.PLAYING);
      }

      if (data['event'] === 'pause') {
        this.playing_ = false;
        this.element.dispatchCustomEvent(VideoEvents.PAUSE);
      }

      if (data['event'] === 'ended') {
        this.element.dispatchCustomEvent(VideoEvents.ENDED);
      }

      if (data['event'] === 'ads-ad-started') {
        this.element.dispatchCustomEvent(VideoEvents.AD_START);
      }

      if (data['event'] === 'ads-ad-ended') {
        this.element.dispatchCustomEvent(VideoEvents.AD_END);
      }

      if (data['event'] === 'volumechange') {
        if (data['muted'] !== undefined) {
          this.muted_ = data['muted'];
          const evt = this.muted_ ? VideoEvents.MUTED : VideoEvents.UNMUTED;
          this.element.dispatchCustomEvent(evt);
        }
      }
    }
  }

  /**
   * @return {string}
   * @private
   */
  getIframeSrc_() {
    const account = user().assert(
        this.element.getAttribute('data-account'),
        'The data-account attribute is required for <amp-brightcove> %s',
        this.element);
    const embed = (this.element.getAttribute('data-embed') || 'default');

    this.playerId_ = (this.element.getAttribute('data-player') ||
      this.element.getAttribute('data-player-id') ||
      'default');

    let src = `https://players.brightcove.net/${encodeURIComponent(account)}` +
      `/${encodeURIComponent(this.playerId_)}` +
      `_${encodeURIComponent(embed)}/index.html`;

    if (this.element.getAttribute('data-playlist-id')) {
      src += '?playlistId=';
      src += this.encodeId_(this.element.getAttribute('data-playlist-id'));
    } else if (this.element.getAttribute('data-video-id')) {
      src += '?videoId=';
      src += this.encodeId_(this.element.getAttribute('data-video-id'));
    }

    this.element.setAttribute('data-param-playsinline', 'true');

    // Pass through data-param-* attributes as params for plugin use
    src = addParamsToUrl(src, getDataParamsFromAttributes(this.element));
    return src;
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    const account = mutations['data-account'];
    const playerId = mutations['data-player'] || mutations['data-player-id'];
    const embed = mutations['data-embed'];
    const playlistId = mutations['data-playlist-id'];
    const videoId = mutations['data-video-id'];
    if (account !== undefined || playerId !== undefined ||
      playlistId !== undefined || embed !== undefined ||
      videoId !== undefined) {
      if (this.iframe_) {
        this.iframe_.src = this.getIframeSrc_();
      }
    }
  }

  /** @private */
  encodeId_(id) {
    /* id is either a Brightcove-assigned id, or a customer-generated reference id.
      reference ids are prefixed 'ref:' and the colon must be preserved unencoded */
    if (id.substring(0, 4) === 'ref:') {
      return `ref:${encodeURIComponent(id.substring(4))}`;
    } else {
      return encodeURIComponent(id);
    }
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow &&
      this.hasAmpSupport_ && this.playing_) {
      this.pause();
    }
  }

  /** @override */
  unlayoutOnPause() {
    if (!this.hasAmpSupport_) {
      return true;
    }
    return false;
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
    return true; // Call layoutCallback again.
  }

  /**
   * @override
   */
  supportsPlatform() {
    return true;
  }

  /**
   * @override
   */
  isInteractive() {
    return true;
  }

  /**
   * @override
   */
  play(unusedIsAutoplay) {
    this.playerReadyPromise_.then(() => {
      this.sendCommand_('play');
    });
  }

  /**
   * @override
   */
  pause() {
    this.playerReadyPromise_.then(() => {
      this.sendCommand_('pause');
    });
  }

  /**
   * @override
   */
  mute() {
    this.playerReadyPromise_.then(() => {
      this.sendCommand_('muted', true);
    });
  }

  /**
   * @override
   */
  unmute() {
    this.playerReadyPromise_.then(() => {
      this.sendCommand_('muted', false);
    });
  }

  /**
   * @override
   */
  showControls() {
    this.playerReadyPromise_.then(() => {
      this.sendCommand_('controls', true);
    });
  }

  /**
   * @override
   */
  hideControls() {
    this.sendCommand_('controls', false);
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
    return true;
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


AMP.extension('amp-brightcove', '0.1', AMP => {
  AMP.registerElement('amp-brightcove', AmpBrightcove);
});
