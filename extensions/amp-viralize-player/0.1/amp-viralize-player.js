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
import {VideoEvents} from '../../../src/video-interface';
import {addParamsToUrl} from '../../../src/url';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isFullscreenElement, removeElement} from '../../../src/dom';
import {parseJson} from '../../../src/json';
import {userAssert} from '../../../src/log';

/** @private @const {!string} */
const TAG = 'amp-viralize-player';

/** @private @const {!string} */
const BASE_URL = 'https://content.viralize.tv/display/';

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
    this.extraParams_['activation'] = 'click';
    this.extraParams_['vip_mode'] = 'no';
    this.extraParams_['location'] = 'inline';
    this.extraParams_['pub_platform'] = 'amp-viralize-player';

    this.win.vpt = this.win.vpt || {};
    this.win.vpt.queue = this.win.vpt.queue || [];

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
    this.element.dispatchCustomEvent(VideoEvents.REGISTERED);
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

    const script = this.element.ownerDocument.createElement('script');
    script.src = this.getPlayerUrl_(this.zid_);
    script.async = true;
    this.container_.appendChild(script);

    return new Promise((resolve) => {
      this.win.vpt.queue.push(() => {
        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.PLAYER_READY, zid: this.zid_},
          () => {
            this.iframe_ = Array.from(
              this.element.ownerDocument.getElementsByTagName('iframe')
            ).find((el) => el.id.match(/vr-[A-Za-z0-9]*-player-iframe/));
            this.element.dispatchCustomEvent(VideoEvents.LOAD);
            resolve();
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.START, zid: this.zid_},
          () => {
            this.element.dispatchCustomEvent(VideoEvents.AD_START);
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.COMPLETE, zid: this.zid_},
          () => {
            this.element.dispatchCustomEvent(VideoEvents.AD_END);
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.CONTENT_END, zid: this.zid_},
          () => {
            this.element.dispatchCustomEvent(VideoEvents.ENDED);
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.PLAYING, zid: this.zid_},
          () => {
            this.element.dispatchCustomEvent(VideoEvents.PLAYING);
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.PAUSED, zid: this.zid_},
          () => {
            this.element.dispatchCustomEvent(VideoEvents.PAUSE);
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.MUTED, zid: this.zid_},
          () => {
            this.element.dispatchCustomEvent(VideoEvents.MUTED);
          }
        );

        this.win.vpt.on(
          {event: this.win.vpt.EVENTS.UNMUTED, zid: this.zid_},
          () => {
            this.element.dispatchCustomEvent(VideoEvents.UNMUTED);
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
    this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
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
    this.win.vpt.queue.push(() => {
      this.win.vpt.play(this.zid_);
    });
  }

  /** @override */
  pause() {
    this.win.vpt.queue.push(() => {
      this.win.vpt.pause(this.zid_);
    });
  }

  /** @override */
  mute() {
    this.win.vpt.queue.push(() => {
      this.win.vpt.mute(this.zid_);
    });
  }

  /** @override */
  unmute() {
    this.win.vpt.queue.push(() => {
      this.win.vpt.unmute(this.zid_);
    });
  }

  /** @override */
  showControls() {
    this.win.vpt.queue.push(() => {
      this.win.vpt.showControls(this.zid_);
    });
  }

  /** @override */
  hideControls() {
    this.win.vpt.queue.push(() => {
      this.win.vpt.hideControls(this.zid_);
    });
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
    this.win.vpt.queue.push(() => {
      this.win.vpt.enterFullscreen(this.zid_);
    });
  }

  /** @override */
  fullscreenExit() {
    this.win.vpt.queue.push(() => {
      this.win.vpt.exitFullscreen(this.zid_);
    });
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
    return addParamsToUrl(`${BASE_URL}?zid=${zid}`, this.extraParams_);
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpViralizePlayer);
});
