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
import {IFrameManager} from './iframe-manager';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {createCustomEvent} from '../../../src/event-helper';
import {createFrameFor, objOrParseJson} from '../../../src/iframe-video';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {getData, listen} from '../../../src/event-helper';
import {getStyle, setStyle} from '../../../src/style';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';

import {CSS} from '../../../build/amp-delight-0.1.css';

/** @const */
const TAG = 'amp-delight';

/** @const @enum {string} */
const DelightState = {
  PLAY: 'x-dl8-iframe-play',
  PAUSE: 'x-dl8-iframe-pause',
  END: 'x-dl8-iframe-ended',
  TIME_UPDATE: 'x-dl8-iframe-timeupdate',
  MUTED: 'x-dl8-iframe-muted',
  UNMUTED: 'x-dl8-iframe-unmuted',
  ENTER_FULLSCREEN: 'x-dl8-iframe-enter-fullscreen',
  EXIT_FULLSCREEN: 'x-dl8-iframe-exit-fullscreen',
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

    /** @private {string} */
    this.iframe_ = null;

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

    return this.loadPromise(iframe).then(() => {
      this.triggerAction_('load', null);
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
      case DelightState.PLAY:
        this.triggerAction_('play', null);
        element.dispatchCustomEvent(VideoEvents.PLAYING);
        break;

      case DelightState.PAUSE:
        this.triggerAction_('pause', null);
        element.dispatchCustomEvent(VideoEvents.PAUSE);
        break;

      case DelightState.END:
        this.triggerAction_('end', null);
        element.dispatchCustomEvent(VideoEvents.ENDED);
        break;

      case DelightState.TIME_UPDATE:
        this.triggerAction_('timeupdate', null);
        element.dispatchCustomEvent(VideoEvents.SECONDS_PLAYED);
        break;

      case DelightState.MUTED:
        this.triggerAction_('mute', null);
        element.dispatchCustomEvent(VideoEvents.MUTED);
        break;

      case DelightState.UNMUTED:
        this.triggerAction_('unmute', null);
        element.dispatchCustomEvent(VideoEvents.UNMUTED);
        break;

      case DelightState.ENTER_FULLSCREEN:
        this.setFullHeight_();
        break;

      case DelightState.EXIT_FULLSCREEN:
        this.setInlineHeight_();
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
   * @param {string} command
   * @private
   */
  sendCommand_(command) {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.iframe_.contentWindow./*OK*/postMessage(command, '*');
    }
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
    this.sendCommand_(DelightState.MUTED);
  }

  /** @override */
  unmute() {
    this.sendCommand_(DelightState.UNMUTED);
  }

  /** @override */
  showControls() {
    // Not supported
  }

  /** @override */
  hideControls() {
    // Not supported
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

  /**c
   * @override
   */
  fullscreenit() {
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
    return false;
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

}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpDelight, CSS);
});
