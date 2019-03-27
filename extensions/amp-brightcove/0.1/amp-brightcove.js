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
import {
  createFrameFor,
  isJsonOrObj,
  mutedOrUnmutedEvent,
  objOrParseJson,
  redispatch,
} from '../../../src/iframe-video';
import {dev, user, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  fullscreenEnter,
  fullscreenExit,
  getDataParamsFromAttributes,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';


/** @private @const {string} */
const TAG = 'amp-brightcove';


/** @implements {../../../src/video-interface.VideoInterface} */
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

    /** @private {?number}  */
    this.currentTime_ = null;

    /** @private {?number}  */
    this.duration_ = null;

    /** @private {Array}  */
    this.playedRanges_ = [];

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

    /** @private {?../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacements_ = null;
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
    this.urlReplacements_ = Services.urlReplacementsForDoc(this.element);

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    // Warn if the player does not have video interface support
    this.readyTimeout_ = /** @type {number} */ (
      Services.timerFor(window).delay(() => {
        user().warn(TAG,
            'Did not receive ready callback from player %s.' +
          ' Ensure it has the videojs-amp-support plugin.', this.playerId_);
      }, 3000));

    this.playerReadyResolver_(this.iframe_);
  }

  /** @override */
  layoutCallback() {
    const iframe = createFrameFor(this, this.getIframeSrc_());

    this.iframe_ = iframe;

    this.unlistenMessage_ = listen(
        this.win,
        'message',
        e => this.handlePlayerMessage_(e));

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
    this.playerReadyPromise_.then(() => {
      // We still need to check this.iframe_ as the component may have
      // been unlaid out by now.
      if (this.iframe_ && this.iframe_.contentWindow) {
        this.iframe_.contentWindow. /*OK*/ postMessage(JSON.stringify(dict({
          'command': command,
          'args': arg,
        })), 'https://players.brightcove.net');
      }
    });
  }

  /**
   * @param {!Event} event
   * @private
   */
  handlePlayerMessage_(event) {
    const {element} = this;

    if (event.source != this.iframe_.contentWindow) {
      return;
    }

    const eventData = getData(event);
    if (!isJsonOrObj(eventData)) {
      return;
    }

    const data = objOrParseJson(eventData);
    if (data === undefined) {
      return; // We only process valid JSON.
    }

    const eventType = data['event'];
    if (!eventType) {
      return;
    }

    if (eventType === 'ready') {
      this.onReady_(data);
    }

    if (eventType === 'playing') {
      this.playing_ = true;
    }
    if (eventType === 'pause') {
      this.playing_ = false;
    }

    if (data['ct']) {
      this.currentTime_ = data['ct'];
    }
    if (data['pr']) {
      this.playedRanges_ = data['pr'];
    }
    if (data['dur']) {
      this.duration_ = data['dur'];
    }

    if (redispatch(element, eventType, {
      'ready': VideoEvents.LOAD,
      'playing': VideoEvents.PLAYING,
      'pause': VideoEvents.PAUSE,
      'ended': VideoEvents.ENDED,
      'ads-ad-started': VideoEvents.AD_START,
      'ads-ad-ended': VideoEvents.AD_END,
    })) {
      return;
    }

    if (eventType === 'volumechange') {
      const muted = data['muted'];
      if (muted == null ||
          this.muted_ == muted) {
        return;
      }
      this.muted_ = muted;
      element.dispatchCustomEvent(mutedOrUnmutedEvent(this.muted_));
      return;
    }
  }

  /**
   * @param {!JsonObject} data
   * @private
   */
  onReady_(data) {
    this.hasAmpSupport_ = true;

    Services.timerFor(this.win)
        .cancel(this.readyTimeout_);

    const {element} = this;

    installVideoManagerForDoc(element);
    Services.videoManagerForDoc(element).register(this);

    dev().info(TAG,
        'Player %s ready. ' +
        'Brightcove Player version: %s AMP Support version: %s',
        this.playerId_, data['bcVersion'], data['ampSupportVersion']
    );
  }

  /**
   * @return {string}
   * @private
   */
  getIframeSrc_() {
    const {element: el} = this;
    const account = userAssert(
        el.getAttribute('data-account'),
        'The data-account attribute is required for <amp-brightcove> %s',
        el);
    const embed = (el.getAttribute('data-embed') || 'default');

    this.playerId_ = (el.getAttribute('data-player') ||
      el.getAttribute('data-player-id') ||
      'default');

    const src =
        `https://players.brightcove.net/${encodeURIComponent(account)}` +
        `/${encodeURIComponent(this.playerId_)}` +
        `_${encodeURIComponent(embed)}/index.html` +
        // These are encodeURIComponent'd in encodeId_().
        (el.getAttribute('data-playlist-id') ?
          '?playlistId=' + this.encodeId_(el.getAttribute('data-playlist-id')) :
          (el.getAttribute('data-video-id') ?
            '?videoId=' + this.encodeId_(el.getAttribute('data-video-id')) :
            ''
          )
        );

    const customReferrer = el.getAttribute('data-referrer');

    if (customReferrer) {
      el.setAttribute(
          'data-param-referrer',
          this.urlReplacements_.expandUrlSync(customReferrer)
      );
    }

    el.setAttribute('data-param-playsinline', 'true');

    // Pass through data-param-* attributes as params for plugin use
    return addParamsToUrl(src, getDataParamsFromAttributes(el));
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
    this.sendCommand_('controls', true);
  }

  /** @override */
  hideControls() {
    this.sendCommand_('controls', false);
  }

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
    return /** @type {number} */ (this.currentTime_);
  }

  /** @override */
  getDuration() {
    return /** @type {number} */ (this.duration_);
  }

  /** @override */
  getPlayedRanges() {
    return /** @type {!Array<Array<number>>} */ (this.playedRanges_);
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpBrightcove);
});
