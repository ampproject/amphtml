/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {VideoAttributes, VideoEvents} from '../../../src/video-interface';
import {addParamsToUrl} from '../../../src/url';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isFullscreenElement, removeElement} from '../../../src/dom';
import {parseJson} from '../../../src/json';
import {setStyle} from '../../../src/style';
import {userAssert} from '../../../src/log';

/** @private @const {!string} */
const TAG = 'amp-viralize-player';

/** @private @const {!string} */
const BASE_URL = 'https://content.viralize.tv';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpViralizePlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.zid_ = null;

    /** @private {object} */
    this.extraParams_ = null;

    /** @private {Element} */
    this.container_ = null;

    /** @private {Element} */
    this.iframe_ = null;

    /** @private {Array} */
    this.preloadCmdQueue_ = [];

    /** @private {boolean} */
    this.playerReady_ = false;
  }

  /**
   * BaseElement overrides
   */

  /** @override */
  buildCallback() {
    this.zid_ = userAssert(
      this.element.getAttribute('data-zid'),
      `The data-zid attribute is required for <${TAG}> %s`,
      this.element
    );
    this.extraParams_ = parseJson(
      this.element.getAttribute('data-extra') || '{}'
    );
    this.extraParams_['activation'] = 'click'; // Autoplay is handled through tag attribute
    if (this.element.hasAttribute(VideoAttributes.AUTOPLAY)) {
      // If autoplay, immediately force audio off otherwise AMP framework will assume that player
      // want to start audio on and will not play it
      this.extraParams_['sound'] = 'never';
    }
    this.extraParams_['vip_mode'] = 'no';
    this.extraParams_['location'] = 'inline';
    this.extraParams_['pub_platform'] = 'amp-viralize-player';

    this.win.vpt = this.win.vpt || {};
    this.win.vpt.queue = this.win.vpt.queue || [];

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  preconnectCallback(opt_onLayout) {
    const ampDoc = this.getAmpDoc();
    Services.preconnectFor(this.win).url(ampDoc, BASE_URL, opt_onLayout);
  }

  /** @override */
  layoutCallback() {
    this.container_ = this.element.ownerDocument.createElement('div');
    this.element.appendChild(this.container_);
    this.applyFillContent(this.container_);
    // Required to force the creation of a new stacking context. This guarantee that user
    // interaction are always caught by the amp mask instead that from an internal element with
    // higher z-index
    setStyle(this.container_, 'z-index', '0');

    const script = this.element.ownerDocument.createElement('script');
    script.src = this.getPlayerUrl_(this.zid_);
    script.async = true;
    this.container_.appendChild(script);

    return new Promise((resolve) => {
      this.win.vpt.queue.push(() => {
        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.PLAYER_READY, zid: this.zid_},
          () => {
            this.playerReady_ = true;
            this.iframe_ = Array.from(
              this.element.ownerDocument.getElementsByTagName('iframe')
            ).find((el) => el.id.match(/vr-[A-Za-z0-9]*-player-iframe/));
            this.dispatchEvent_(VideoEvents.LOAD);
            this.executeCmdQueue_();
            resolve();
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.START, zid: this.zid_},
          () => {
            this.dispatchEvent_(VideoEvents.AD_START);
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.COMPLETE, zid: this.zid_},
          () => {
            this.dispatchEvent_(VideoEvents.AD_END);
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.SKIP, zid: this.zid_},
          () => {
            this.dispatchEvent_(VideoEvents.AD_END);
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.CONTENT_END, zid: this.zid_},
          () => {
            this.dispatchEvent_(VideoEvents.ENDED);
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.PLAYING, zid: this.zid_},
          () => {
            this.dispatchEvent_(VideoEvents.PLAYING);
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.PAUSED, zid: this.zid_},
          () => {
            this.dispatchEvent_(VideoEvents.PAUSE);
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.MUTED, zid: this.zid_},
          () => {
            this.dispatchEvent_(VideoEvents.MUTED);
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.UNMUTED, zid: this.zid_},
          () => {
            this.dispatchEvent_(VideoEvents.UNMUTED);
          }
        );
      });
    });
  }

  /** @override */
  unlayoutCallback() {
    if (this.container_) {
      removeElement(this.container_);
      this.container_ = null;
    }
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.RESPONSIVE;
  }

  /** @override */
  viewportCallback(visible) {
    this.dispatchEvent_(VideoEvents.VISIBILITY, {visible});
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /**
   * VideoInterface implementations
   */

  /** @override */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
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

  /** @override */
  play(unusedIsAutoplay) {
    this.VPTCmd_('play');
  }

  /** @override */
  pause() {
    this.VPTCmd_('pause');
  }

  /** @override */
  mute() {
    this.VPTCmd_('mute');
  }

  /** @override */
  unmute() {
    this.VPTCmd_('unmute');
  }

  /** @override */
  showControls() {
    this.VPTCmd_('showControls');
  }

  /** @override */
  hideControls() {
    this.VPTCmd_('hideControls');
  }

  /** @override */
  getMetadata() {
    // Not implemented
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /** @override */
  fullscreenEnter() {
    this.VPTCmd_('enterFullscreen');
  }

  /** @override */
  fullscreenExit() {
    this.VPTCmd_('exitFullscreen');
  }

  /** @override */
  isFullscreen() {
    if (this.iframe_) {
      return isFullscreenElement(this.iframe_);
    }
    return false;
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    // Not implemented
  }

  /**
   * Private methods
   */

  /**
   * Evaluate the player url
   * @param {string} zid
   * @return {string}
   * @private
   */
  getPlayerUrl_(zid) {
    return addParamsToUrl(`${BASE_URL}/display/?zid=${zid}`, this.extraParams_);
  }

  /**
   * Ask player to execute specified command. If player is not yet ready to receive it,
   * command will be enqueued waiting for player to be loaded
   *
   * @param {string} cmd the command to be executed
   * @private
   */
  VPTCmd_(cmd) {
    if (this.playerReady_) {
      this.executeVPTCmd_(cmd);
    } else {
      this.preloadCmdQueue_.push(cmd);
    }
  }

  /**
   * Send all enqueued commands to the player
   *
   * @private
   */
  executeCmdQueue_() {
    for (let i = 0; i < this.preloadCmdQueue_.length; i++) {
      this.executeVPTCmd_(this.preloadCmdQueue_[i]);
    }
    this.preloadCmdQueue_ = [];
  }

  /**
   * Immediately send the command to the player. This method assumes that the player is ready
   * to receive commands
   *
   * @param {string} cmd the command to be executed
   * @private
   */
  executeVPTCmd_(cmd) {
    this.win.vpt.queue.push(() => {
      this.win.vpt[cmd](this.zid_);
    });
  }

  /**
   * Dispatch an event from the element
   *
   * @param {string} event the event to be dispatched
   * @param {string} opt_data optional event data
   * @private
   */
  dispatchEvent_(event, opt_data) {
    this.element.dispatchCustomEvent(event, opt_data);
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpViralizePlayer);
});
