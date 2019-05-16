/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {dev, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';

const TAG = 'amp-mowplayer';

/**
 * @enum {number}
 * @private
 */
const PlayerStates = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
};

/** @implements {../../../src/video-interface.VideoInterface} */
class AmpMowplayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?string}  */
    this.mediaid_ = '';

    /** @private {?boolean}  */
    this.muted_ = false;

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?string} */
    this.videoIframeSrc_ = null;

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
    const {preconnect} = this;
    preconnect.url(this.getVideoIframeSrc_());
    // Host that mowplayer uses to serve JS needed by player.
    preconnect.url('https://cdn.mowplayer.com', opt_onLayout);
    // Load player settings
    preconnect.url('https://code.mowplayer.com', opt_onLayout);
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
    this.mediaid_ = userAssert(
      this.element.getAttribute('data-mediaid'),
      '/The data-mediaid attribute is required for <amp-mowplayer> %s',
      this.element
    );

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /**
   * @return {string}
   * @private
   */
  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }
    const params = dict({
      'code': this.mediaid_,
    });
    const src = addParamsToUrl(
      'https://cdn.mowplayer.com/player.html',
      /** @type {!JsonObject} */ (params)
    );

    return (this.videoIframeSrc_ = src);
  }

  /** @override */
  layoutCallback() {
    const iframe = createFrameFor(this, this.getVideoIframeSrc_());
    this.iframe_ = iframe;
    this.unlistenMessage_ = listen(
      this.win,
      'message',
      this.handleMowMessage_.bind(this)
    );
    const loaded = this.loadPromise(this.iframe_).then(() => {
      // Tell mowplayer that we want to receive messages
      this.listenToFrame_();
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
    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;
    return true; // Call layoutCallback again.
  }

  /** @override */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.pause();
    }
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (mutations['data-mediaid'] == null) {
      return;
    }
    if (!this.iframe_) {
      return;
    }
    this.sendCommand_('loadVideoById', [this.mediaid_]);
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @param {Array=} opt_args
   * @private
   */
  sendCommand_(command, opt_args) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        const message = JSON.stringify(
          dict({
            'event': 'command',
            'func': command,
            'args': opt_args || '',
          })
        );
        this.iframe_.contentWindow./*OK*/ postMessage(
          message,
          'https://cdn.mowplayer.com'
        );
      }
    });
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleMowMessage_(event) {
    if (!originMatches(event, this.iframe_, 'https://cdn.mowplayer.com')) {
      return;
    }
    const eventData = getData(event);

    if (!isJsonOrObj(eventData)) {
      return;
    }

    const data = objOrParseJson(eventData);

    if (data == null) {
      return; // We only process valid JSON.
    }

    const eventType = data['event'];
    const info = data['info'] || {};

    const {element} = this;

    if (eventType === 'set_aspect_ratio') {
      this.attemptChangeHeight(info['new_height']).catch(() => {});
    }

    const playerState = info['playerState'];
    if (eventType == 'infoDelivery' && playerState != null) {
      redispatch(element, playerState.toString(), {
        [PlayerStates.PLAYING]: VideoEvents.PLAYING,
        [PlayerStates.PAUSED]: VideoEvents.PAUSE,
        // mowplayer does not fire pause and ended together.
        [PlayerStates.ENDED]: [VideoEvents.ENDED, VideoEvents.PAUSE],
      });
      return;
    }

    const muted = info['muted'];
    if (eventType == 'infoDelivery' && info && muted != null) {
      if (this.muted_ == muted) {
        return;
      }
      this.muted_ = muted;
      element.dispatchCustomEvent(mutedOrUnmutedEvent(this.muted_));
      return;
    }
  }

  /**
   * Sends 'listening' message to the Mowplayer iframe to listen for events.
   * @private
   */
  listenToFrame_() {
    if (!this.iframe_) {
      return;
    }

    this.sendCommand_('listening', [
      'amp',
      window.location.href,
      window.location.origin,
      true,
    ]);
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
    this.sendCommand_('playVideo');
  }

  /** @override */
  pause() {
    this.sendCommand_('pauseVideo');
  }

  /** @override */
  mute() {
    this.sendCommand_('mute');
  }

  /** @override */
  unmute() {
    this.sendCommand_('unMute');
  }

  /** @override */
  showControls() {
    // Not supported.
  }

  /** @override */
  hideControls() {
    // Not supported.
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
  getMetadata() {
    // Not implemented
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return true;
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
  AMP.registerElement(TAG, AmpMowplayer);
});
