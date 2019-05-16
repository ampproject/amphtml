/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {ImaPlayerData} from '../../../ads/google/ima-player-data';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {addUnsafeAllowAutoplay} from '../../../src/iframe-video';
import {assertHttpsUrl} from '../../../src/url';
import {
  childElementsByTag,
  isJsonScriptTag,
  removeElement,
} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {getConsentPolicyState} from '../../../src/consent';
import {getData, listen} from '../../../src/event-helper';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isEnumValue, isObject, toArray} from '../../../src/types';
import {isLayoutSizeDefined} from '../../../src/layout';

/** @const */
const TAG = 'amp-ima-video';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpImaVideo extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?string} */
    this.preconnectSource_ = null;

    /** @private {?string} */
    this.preconnectTrack_ = null;

    /** @private {boolean} */
    this.isFullscreen_ = false;

    /**
     * Maps events to their unlisteners.
     * @private {!Object<string, function()>}
     */
    this.unlisteners_ = {};

    /** @private {!ImaPlayerData} */
    this.playerData_ = new ImaPlayerData();
  }

  /** @override */
  buildCallback() {
    this.viewport_ = this.getViewport();
    if (this.element.getAttribute('data-delay-ad-request') === 'true') {
      this.unlisteners_['onFirstScroll'] = this.viewport_.onScroll(() => {
        this.sendCommand_('onFirstScroll');
      });
      // Request ads after 3 seconds, if something else doesn't trigger an ad
      // request before that.
      Services.timerFor(this.win).delay(() => {
        this.sendCommand_('onAdRequestDelayTimeout');
      }, 3000);
    }

    assertHttpsUrl(
      this.element.getAttribute('data-tag'),
      'The data-tag attribute is required for <amp-video-ima> and must be ' +
        'https'
    );

    // Handle <source> and <track> children
    const sourceElements = childElementsByTag(this.element, 'SOURCE');
    const trackElements = childElementsByTag(this.element, 'TRACK');
    const childElements = toArray(sourceElements).concat(
      toArray(trackElements)
    );
    if (childElements.length > 0) {
      const children = [];
      childElements.forEach(child => {
        // Save the first source and first track to preconnect.
        if (child.tagName == 'SOURCE' && !this.preconnectSource_) {
          this.preconnectSource_ = child.src;
        } else if (child.tagName == 'TRACK' && !this.preconnectTrack_) {
          this.preconnectTrack_ = child.src;
        }
        children.push(child./*OK*/ outerHTML);
      });
      this.element.setAttribute(
        'data-child-elements',
        JSON.stringify(children)
      );
    }

    // Handle IMASetting JSON
    const scriptElement = childElementsByTag(this.element, 'SCRIPT')[0];
    if (scriptElement && isJsonScriptTag(scriptElement)) {
      this.element.setAttribute(
        'data-ima-settings',
        scriptElement./*OK*/ innerHTML
      );
    }
  }

  /** @override */
  preconnectCallback() {
    const {element, preconnect} = this;
    preconnect.preload(
      'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
      'script'
    );
    const source = element.getAttribute('data-src');
    if (source) {
      preconnect.url(source);
    }
    if (this.preconnectSource_) {
      preconnect.url(this.preconnectSource_);
    }
    if (this.preconnectTrack_) {
      preconnect.url(this.preconnectTrack_);
    }
    preconnect.url(element.getAttribute('data-tag'));
    preloadBootstrap(this.win, preconnect);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  getConsentPolicy() {
    return null;
  }

  /** @override */
  layoutCallback() {
    const {element, win} = this;
    const consentPolicyId = super.getConsentPolicy();
    const consentPromise = consentPolicyId
      ? getConsentPolicyState(element, consentPolicyId)
      : Promise.resolve(null);
    return consentPromise.then(initialConsentState => {
      const iframe = getIframe(
        win,
        element,
        'ima-video',
        {initialConsentState},
        {allowFullscreen: true}
      );

      this.applyFillContent(iframe);

      // This is temporary until M74 launches.
      // TODO(aghassemi, #21247)
      addUnsafeAllowAutoplay(iframe);

      this.iframe_ = iframe;

      const deferred = new Deferred();
      this.playerReadyPromise_ = deferred.promise;
      this.playerReadyResolver_ = deferred.resolve;

      this.unlistenMessage_ = listen(this.win, 'message', e =>
        this.handlePlayerMessage_(/** @type {!Event} */ (e))
      );

      element.appendChild(iframe);

      installVideoManagerForDoc(element);
      Services.videoManagerForDoc(element).register(this);

      return this.loadPromise(iframe).then(() => this.playerReadyPromise_);
    });
  }

  /** @override */
  viewportCallback(visible) {
    this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
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
    return true;
  }

  /** @override */
  onLayoutMeasure() {
    if (!this.iframe_) {
      return;
    }
    const {width, height} = this.getLayoutBox();
    this.sendCommand_('resize', {'width': width, 'height': height});
  }

  /**
   * Sends a command to the player through postMessage. NOTE: All commands sent
   * before imaVideo fires VideoEvents.LOAD will be queued until that event
   * fires.
   * @param {string} command
   * @param {Object=} opt_args
   * @private
   */
  sendCommand_(command, opt_args) {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.playerReadyPromise_.then(() => {
        this.iframe_.contentWindow./*OK*/ postMessage(
          JSON.stringify(
            dict({
              'event': 'command',
              'func': command,
              'args': opt_args || '',
            })
          ),
          '*'
        );
      });
    }
    // If we have an unlistener for this command, call it.
    if (this.unlisteners_[command]) {
      this.unlisteners_[command]();
    }
  }

  /**
   * @param {!Event} event
   * @private
   */
  handlePlayerMessage_(event) {
    if (event.source != this.iframe_.contentWindow) {
      return;
    }

    const eventData = getData(event);
    if (!isObject(eventData)) {
      return;
    }

    const videoEvent = eventData['event'];
    if (isEnumValue(VideoEvents, videoEvent)) {
      if (videoEvent == VideoEvents.LOAD) {
        this.playerReadyResolver_(this.iframe_);
      }
      this.element.dispatchCustomEvent(videoEvent);
      return;
    }
    if (videoEvent == ImaPlayerData.IMA_PLAYER_DATA) {
      this.playerData_ = /** @type {!ImaPlayerData} */ (eventData['data']);
      return;
    }
    if (videoEvent == 'fullscreenchange') {
      this.isFullscreen_ = !!eventData['isFullscreen'];
      return;
    }
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

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
    this.sendCommand_('showControls');
  }

  /** @override */
  hideControls() {
    this.sendCommand_('hideControls');
  }

  /** @override */
  fullscreenEnter() {
    this.sendCommand_('enterFullscreen');
  }

  /** @override */
  fullscreenExit() {
    this.sendCommand_('exitFullscreen');
  }

  /** @override */
  isFullscreen() {
    return this.isFullscreen_;
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
    return this.playerData_.currentTime;
  }

  /** @override */
  getDuration() {
    return this.playerData_.duration;
  }

  /** @override */
  getPlayedRanges() {
    return this.playerData_.playedRanges;
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpImaVideo);
});
