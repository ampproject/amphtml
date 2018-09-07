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
import {ActionTrust} from '../../../src/action-constants';
import {Deferred} from '../../../src/utils/promise';
import {IFrameManager} from './iframe-manager';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {createCustomEvent} from '../../../src/event-helper';
import {createFrameFor, objOrParseJson} from '../../../src/iframe-video';
import {dict} from '../../../src/utils/object';
import {getData, listen} from '../../../src/event-helper';
import {getStyle, setStyle} from '../../../src/style';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {removeElement} from '../../../src/dom';
import {user} from '../../../src/log';

import {CSS} from '../../../build/amp-delight-player-0.1.css';

/** @const */
const TAG = 'amp-delight-player';

/** @const @enum {string} */
const DelightState = {
  READY: 'x-dl8-to-parent-ready',
  PLAYING: 'x-dl8-to-parent-playing',
  PAUSED: 'x-dl8-to-parent-paused',
  ENDED: 'x-dl8-to-parent-ended',
  TIME_UPDATE: 'x-dl8-to-parent-timeupdate',
  DURATION: 'x-dl8-to-parent-duration',
  MUTED: 'x-dl8-to-parent-muted',
  UNMUTED: 'x-dl8-to-parent-unmuted',
  ENTERED_FULLSCREEN: 'x-dl8-to-parent-entered-fullscreen',
  EXITED_FULLSCREEN: 'x-dl8-to-parent-exited-fullscreen',
  PLAY: 'x-dl8-to-iframe-play',
  PAUSE: 'x-dl8-to-iframe-pause',
  ENTER_FULLSCREEN: 'x-dl8-to-iframe-enter-fullscreen',
  EXIT_FULLSCREEN: 'x-dl8-to-iframe-exit-fullscreen',
  MUTE: 'x-dl8-to-iframe-mute',
  UNMUTE: 'x-dl8-to-iframe-unmute',
  ENABLE_INTERFACE: 'x-dl8-to-iframe-enable-interface',
  DISABLE_INTERFACE: 'x-dl8-to-iframe-disable-interface',
  EXPANDED: 'x-dl8-iframe-enter-fullscreen',
  MINIMIZED: 'x-dl8-iframe-exit-fullscreen',
};

/**
 * Instantiate communication channel between AMP and our Delight iframe
 */
new IFrameManager();

class AmpDelight extends AMP.BaseElement {

  /** @param {!AmpDelight} element */
  constructor(element) {
    super(element);

    /** @const @private {!../../../src/service/action-impl.ActionService} */
    this.actions_ = Services.actionServiceForDoc(element);

    /** @private {string} */
    this.baseURL_ = 'https://players.delight-vr.com';

    /** @private {string} */
    this.contentID_ = '';

    /** @private {Object} */
    this.styleCache_ = {};

    /** @private {number} */
    this.totalDuration_ = 1;

    /** @private {number} */
    this.currentTime_ = 0;

    /** @private {Array} */
    this.playedRanges_ = [];

    /** @private {boolean} */
    this.isFullscreen_ = false;

    /** @private {string} */
    this.iframe_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {HTMLElement} */
    this.placeholderEl_ = null;

  }

  /** @override */
  preconnectCallback(onLayout) {
    this.preconnect.url(this.baseURL_, onLayout);
  }

  /** @override */
  renderOutsideViewport() {
    return false;
  }

  /** @override */
  buildCallback() {
    this.contentID_ = user().assert(
        (this.element.getAttribute('data-content-id') ||
    this.element.getAttribute('data-content-id')),
        'The data-content-id attribute is required',
        this.element);

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  layoutCallback() {
    const src = this.baseURL_ + '/player/' + this.contentID_;
    const iframe = createFrameFor(this, src);

    iframe.setAttribute('allow', 'vr');

    this.unlistenMessage_ = listen(this.win, 'message', event => {
      this.handleDelightMessage_(event);
    });

    this.iframe_ = iframe;

    return this.loadPromise(iframe);
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
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  createPlaceholderCallback() {
    const placeholder = this.win.document.createElement('div');
    const src = this.baseURL_ + '/poster/' + this.contentID_;
    placeholder.setAttribute('placeholder', '');

    setStyle(placeholder, 'background-image', 'url(' + src + ')');
    setStyle(placeholder, 'background-repeat', 'no-repeat');
    setStyle(placeholder, 'background-size', 'cover');
    setStyle(placeholder, 'background-position', '50%');
    setStyle(placeholder, 'width', '100%');
    setStyle(placeholder, 'height', '100%');

    this.placeholderEl_ = placeholder;

    return placeholder;
  }

  /** @override */
  firstLayoutCompleted() {
    const el = this.placeholderEl_;
    const isInViewport = this.isInViewport();

    if (el && isInViewport) {
      return new Promise(resolve => {

        const onTransitionEnd = () => {
          el.removeEventListener('transitionend', onTransitionEnd, false);
          resolve();
        };

        el.classList.add('faded');
        el.addEventListener('transitionend', onTransitionEnd, false);
      }).then(() => super.firstLayoutCompleted());
    } else {
      return super.firstLayoutCompleted();
    }
  }

  /** @override  */
  pauseCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.pause();
    }
    return super.pauseCallback();
  }

  /** @override */
  resumeCallback() {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.play();
    }
    return super.resumeCallback();
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleDelightMessage_(event) {
    if (event.source != this.iframe_.contentWindow) {
      return;
    }

    const data = objOrParseJson(getData(event));
    if (data === undefined || data['type'] === undefined) {
      return; // We only process valid JSON.
    }

    const {element} = this;

    switch (data['type']) {
      case DelightState.READY:
        this.triggerAction_(VideoEvents.LOAD, null);
        element.dispatchCustomEvent(VideoEvents.LOAD);
        this.playerReadyResolver_(this.iframe_);
        break;

      case DelightState.PLAYING:
        this.triggerAction_(VideoEvents.PLAYING, null);
        element.dispatchCustomEvent(VideoEvents.PLAYING);
        break;

      case DelightState.PAUSED:
        this.triggerAction_(VideoEvents.PAUSE, null);
        element.dispatchCustomEvent(VideoEvents.PAUSE);
        break;

      case DelightState.ENDED:
        this.triggerAction_(VideoEvents.ENDED, null);
        element.dispatchCustomEvent(VideoEvents.ENDED);
        break;

      case DelightState.TIME_UPDATE:
        this.triggerAction_(VideoEvents.SECONDS_PLAYED, null);
        element.dispatchCustomEvent(VideoEvents.SECONDS_PLAYED);

        this.currentTime_ = data.payload.currentTime;
        this.playedRanges_ = data.payload.playedRanges;
        break;

      case DelightState.MUTED:
        this.triggerAction_(VideoEvents.MUTED, null);
        element.dispatchCustomEvent(VideoEvents.MUTED);
        break;

      case DelightState.UNMUTED:
        this.triggerAction_(VideoEvents.UNMUTED, null);
        element.dispatchCustomEvent(VideoEvents.UNMUTED);
        break;

      case DelightState.DURATION:
        this.totalDuration_ = data.payload.duration;
        break;

      case DelightState.EXPANDED:
        this.setFullHeight_();
        break;

      case DelightState.MINIMIZED:
        this.setInlineHeight_();
        break;

      case DelightState.ENTERED_FULLSCREEN:
        this.isFullscreen_ = true;
        break;

      case DelightState.EXITED_FULLSCREEN:
        this.isFullscreen_ = false;
        break;
    }
  }

  /**
   * Triggers either a submit-success or submit-error action with response data.
   * @param {!FormEvents} name
   * @param {?Object} detail
   * @private
   */
  triggerAction_(name, detail) {
    const {element} = this;
    const event =
        createCustomEvent(this.win, `${TAG}.${name}`,
            dict({'response': detail}));
    this.actions_.trigger(element, name, event, ActionTrust.HIGH);
  }

  /**
   * Sends a command to the player through postMessage.
   * @param {string} type
   * @param {Object} [payload={}]
   * @private
   */
  sendCommand_(type, payload = {}) {
    this.playerReadyPromise_.then(iframe => {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow./*OK*/postMessage(
            JSON.stringify({type, payload}), '*'
        );
      }
    });
  }

  /**
   * Expands the player's height in the DOM
   * @private
   */
  setFullHeight_() {
    this.styleCache_.width = getStyle(this.element, 'width');
    this.styleCache_.height = getStyle(this.element, 'height');
    this.styleCache_.left = getStyle(this.element, 'left');
    this.styleCache_.top = getStyle(this.element, 'top');
    this.styleCache_.margin = getStyle(this.element, 'margin');
    this.styleCache_.padding = getStyle(this.element, 'padding');
    this.styleCache_.zIndex = getStyle(this.element, 'zIndex');
    this.styleCache_.position = getStyle(this.element, 'position');
    this.styleCache_.display = getStyle(this.element, 'display');

    setStyle(this.element, 'width', '100%');
    setStyle(this.element, 'height', '100%');
    setStyle(this.element, 'top', '0');
    setStyle(this.element, 'left', '0');
    setStyle(this.element, 'margin', '0');
    setStyle(this.element, 'padding', '0');
    setStyle(this.element, 'z-index', '9999999');
    setStyle(this.element, 'position', 'fixed');
    setStyle(this.element, 'display', 'block');
  }

  /**
   * Retracts the player's height in the DOM
   * @private
   */
  setInlineHeight_() {
    setStyle(this.element, 'width', this.styleCache_.width);
    setStyle(this.element, 'height', this.styleCache_.height);
    setStyle(this.element, 'top', this.styleCache_.top);
    setStyle(this.element, 'left', this.styleCache_.left);
    setStyle(this.element, 'margin', this.styleCache_.margin);
    setStyle(this.element, 'padding', this.styleCache_.padding);
    setStyle(this.element, 'z-index', this.styleCache_.zIndex);
    setStyle(this.element, 'position', this.styleCache_.position);
    setStyle(this.element, 'display', this.styleCache_.display);
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
    this.sendCommand_(DelightState.PLAY);
  }

  /** @override */
  pause() {
    this.sendCommand_(DelightState.PAUSE);
  }

  /** @override */
  mute() {
    this.sendCommand_(DelightState.MUTE);
  }

  /** @override */
  unmute() {
    this.sendCommand_(DelightState.UNMUTE);
  }

  /** @override */
  showControls() {
    this.sendCommand_(DelightState.ENABLE_INTERFACE);
  }

  /** @override */
  hideControls() {
    this.sendCommand_(DelightState.DISABLE_INTERFACE);
  }

  /**
   * @override
   */
  fullscreenEnter() {
    this.sendCommand_(DelightState.ENTER_FULLSCREEN);
  }

  /**
   * @override
   */
  fullscreenExit() {
    this.sendCommand_(DelightState.EXIT_FULLSCREEN);
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
    return this.currentTime_;
  }

  /** @override */
  getDuration() {
    return this.totalDuration_;
  }

  /** @override */
  getPlayedRanges() {
    return this.playedRanges_;
  }

}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpDelight, CSS);
});
