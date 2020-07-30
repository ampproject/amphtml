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

    /** @private {?boolean}  */
    this.muted_ = false;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    const preconnect = Services.preconnectFor(this.win);
    preconnect.url(this.getAmpDoc(), this.getVideoIframeSrc_());
    // Host that mowplayer uses to serve JS needed by player.
    preconnect.url(this.getAmpDoc(), 'https://mowplayer.com', opt_onLayout);
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
   * Get iframe src url
   * @return {string}
   * @private
   */
  getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }

    return (this.videoIframeSrc_ =
      'https://mowplayer.com/watch/' + this.mediaid_ + '?script=1');
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

  /**
   * Sends a message to the player through postMessage.
   * @param {string} type
   * @param {Object=} data
   * @private
   */
  sendMessage_(type, data) {
    this.playerReadyPromise_.then(() => {
      if (this.iframe_ && this.iframe_.contentWindow) {
        const message = JSON.stringify(
          dict({
            'mowplayer': {
              'type': type,
              'data': data,
            },
          })
        );
        this.iframe_.contentWindow./*OK*/ postMessage(
          message,
          'https://mowplayer.com'
        );
      }
    });
  }

  /**
   * Receive messages from player
   * @param {!Event} event
   * @private
   */
  handleMowMessage_(event) {
    if (!originMatches(event, this.iframe_, 'https://mowplayer.com')) {
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

    if (data['mowplayer'] === undefined) {
      return;
    }

    const eventType = data['mowplayer']['type'];
    const info = getData(data['mowplayer']) || {};

    const {element} = this;

    if (eventType === 'handshake') {
      this.sendMessage_('handshake_done', {});
    } else if (eventType === 'visibility_observer') {
      this.onVisibilityObserver_();
    }

    const playerState = info['playerState'];

    if (eventType == 'infoDelivery' && playerState !== undefined) {
      redispatch(element, playerState.toString(), {
        [PlayerStates.PLAYING]: VideoEvents.PLAYING,
        [PlayerStates.PAUSED]: VideoEvents.PAUSE,
        // mowplayer does not fire pause and ended together.
        [PlayerStates.ENDED]: [VideoEvents.ENDED, VideoEvents.PAUSE],
      });
      return;
    }

    const muted = info['muted'];

    if (eventType == 'infoDelivery' && muted !== undefined) {
      if (this.muted_ == muted) {
        return;
      }
      this.muted_ = muted;
      element.dispatchCustomEvent(mutedOrUnmutedEvent(this.muted_));
      return;
    }
  }

  /**
   * Check player is visible or not based on breakpoint and send message to player
   * @private
   */
  onVisibilityObserver_() {
    const {intersectionRatio} = this.element.getIntersectionChangeEntry();
    const visible = intersectionRatio > 0.5 ? true : false;
    this.sendMessage_('visibility_observer_visibility', {'visible': visible});
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

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpMowplayer);
});
