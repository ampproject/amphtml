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

import {Deferred} from '../../../src/utils/promise';
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

    const deferred = new Deferred();

    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    // Warn if the player does not have video interface support
    this.readyTimeout_ = Services.timerFor(window).delay(() => {
      dev().warn(TAG,
          `Did not receive ready callback from player ${this.playerId_}.` +
        ' Ensure it has the videojs-amp-support plugin.');
    }, 3000);

    this.playerReadyResolver_(this.iframe_);
  }

  /** @override */
  layoutCallback() {
    const el = this.element;
    const iframe = el.ownerDocument.createElement('iframe');

    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = this.getIframeSrc_();

    this.applyFillContent(iframe);
    el.appendChild(iframe);
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
    const el = this.element;

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
        Services.timerFor(window).cancel(this.readyTimeout_);
        dev().info(TAG, `Player ${this.playerId_} ready. ` +
          `Brightcove Player version: ${data['bcVersion']} ` +
          `AMP Support version: ${data['ampSupportVersion']}`);
        this.hasAmpSupport_ = true;
        installVideoManagerForDoc(el);
        Services.videoManagerForDoc(el).register(this);
        el.dispatchCustomEvent(VideoEvents.LOAD);
      }

      if (data['event'] === 'playing') {
        this.playing_ = true;
        el.dispatchCustomEvent(VideoEvents.PLAYING);
        return;
      }

      if (data['event'] === 'pause') {
        this.playing_ = false;
        el.dispatchCustomEvent(VideoEvents.PAUSE);
        return;
      }

      if (data['event'] === 'ended') {
        el.dispatchCustomEvent(VideoEvents.ENDED);
        return;
      }

      if (data['event'] === 'ads-ad-started') {
        el.dispatchCustomEvent(VideoEvents.AD_START);
        return;
      }

      if (data['event'] === 'ads-ad-ended') {
        el.dispatchCustomEvent(VideoEvents.AD_END);
        return;
      }

      if (data['event'] === 'volumechange') {
        if (data['muted'] !== undefined) {
          this.muted_ = data['muted'];
          const evt = this.muted_ ? VideoEvents.MUTED : VideoEvents.UNMUTED;
          el.dispatchCustomEvent(evt);
        }
        return;
      }
    }
  }

  /**
   * @return {string}
   * @private
   */
  getIframeSrc_() {
    const el = this.element;
    const account = user().assert(
        el.getAttribute('data-account'),
        'The data-account attribute is required for <amp-brightcove> %s',
        el);
    const embed = (el.getAttribute('data-embed') || 'default');

    this.playerId_ = (el.getAttribute('data-player') ||
      el.getAttribute('data-player-id') ||
      'default');

    let src = `https://players.brightcove.net/${encodeURIComponent(account)}` +
      `/${encodeURIComponent(this.playerId_)}` +
      `_${encodeURIComponent(embed)}/index.html`;

    if (el.getAttribute('data-playlist-id')) {
      src += '?playlistId=';
      src += this.encodeId_(el.getAttribute('data-playlist-id'));
    } else if (el.getAttribute('data-video-id')) {
      src += '?videoId=';
      src += this.encodeId_(el.getAttribute('data-video-id'));
    }

    el.setAttribute('data-param-playsinline', 'true');

    // Pass through data-param-* attributes as params for plugin use
    src = addParamsToUrl(src, getDataParamsFromAttributes(el));
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

  /**
    * @param {string} id
    * @return {string}
    * @private
    */
  encodeId_(id) {
    /* id is either a Brightcove-assigned id, or a customer-generated
       reference id. reference ids are prefixed 'ref:' and the colon
       must be preserved unencoded */
    if (id.substring(0, 4) === 'ref:') {
      return `ref:${encodeURIComponent(id.substring(4))}`;
    }
    return encodeURIComponent(id);
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

    const deferred = new Deferred();

    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

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
  preimplementsAutoFullscreen() {
    return false;
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
