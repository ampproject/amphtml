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

import {BaseElement} from '../src/base-element';
import {listenOnce} from '../src/event-helper';
import {assertHttpsUrl} from '../src/url';
import {isLayoutSizeDefined} from '../src/layout';
import {registerElement} from '../src/custom-element';
import {getMode} from '../src/mode';
import {dev} from '../src/log';
import {platformFor} from '../src/platform';
import {VideoEvents} from '../src/video-interface';
import {videoManagerForDoc} from '../src/video-manager';

/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 * @return {undefined}
 */
export function installVideo(win) {

  /**
   * @implements {../src/video-interface.VideoInterface}
   */
  class AmpVideo extends BaseElement {

    /** @override */
    isLayoutSupported(layout) {
      return isLayoutSizeDefined(layout);
    }

    /** @override */
    buildCallback() {
      /** @private @const {!Element} */
      this.video_ = this.element.ownerDocument.createElement('video');

      /** @private @const {!../src/service/platform-impl.Platform} */
      this.platform_ = platformFor(this.win);

      const posterAttr = this.element.getAttribute('poster');
      if (!posterAttr && getMode().development) {
        console/*OK*/.error(
            'No "poster" attribute has been provided for amp-video.');
      }

      // Enable inline play for iOS.
      this.video_.setAttribute('playsinline', '');
      this.video_.setAttribute('webkit-playsinline', '');
      // Disable video preload in prerender mode.
      this.video_.setAttribute('preload', 'none');
      this.propagateAttributes(['poster', 'controls'], this.video_);
      this.forwardEvents([VideoEvents.CANPLAY], this.video_);
      this.fixIOSCanplayEventForAutoplay_();
      this.applyFillContent(this.video_, true);
      this.element.appendChild(this.video_);

      videoManagerForDoc(this.win.document).register(this);
    }

    /** @override */
    viewportCallback(visible) {
      this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
    }

    /** @override */
    layoutCallback() {
      if (!this.isVideoSupported_()) {
        this.toggleFallback(true);
        return Promise.resolve();
      }

      if (this.element.getAttribute('src')) {
        assertHttpsUrl(this.element.getAttribute('src'), this.element);
      }

      // Do not propagate `autoplay`. Autoplay behaviour is managed by
      // video manager since amp-video implements the VideoInterface
      this.propagateAttributes(
          ['src', 'loop'],
          this.video_);

      if (this.element.hasAttribute('preload')) {
        this.video_.setAttribute(
            'preload', this.element.getAttribute('preload'));
      } else {
        this.video_.removeAttribute('preload');
      }

      this.getRealChildNodes().forEach(child => {
        // Skip the video we already added to the element.
        if (this.video_ === child) {
          return;
        }
        if (child.getAttribute && child.getAttribute('src')) {
          assertHttpsUrl(child.getAttribute('src'),
              dev().assertElement(child));
        }
        this.video_.appendChild(child);
      });

      return this.loadPromise(this.video_);
    }

    /** @override */
    pauseCallback() {
      if (this.video_) {
        this.video_.pause();
      }
    }

    /** @private */
    isVideoSupported_() {
      return !!this.video_.play;
    }

    /**
     * Safari on iOS does not trigger the `canplay` event for muted inline
     * videos despite the fact that calls to `play` are allowed for muted inline
     * videos in iOS 10.
     * It does trigger `canplay` if `autoplay` attribute is set however.
     * Since VideoManager handles autoplay behaviour for AMP, we do not
     * propagate the `autoplay` attribute to the underlying video element but
     * to get around the iOS bug, we will temporarily propagate `autoplay`
     * attribute until we get the `canplay` event and then remove it.
     * {@see https://bugs.webkit.org/show_bug.cgi?id=161804}
     * @private
     */
    fixIOSCanplayEventForAutoplay_() {
      if (!this.element.hasAttribute('autoplay') || !this.platform_.isIos()) {
        return;
      }

      this.propagateAttributes(['autoplay'], this.video_);
      listenOnce(this.video_, VideoEvents.CANPLAY, () => {
        this.video_.removeAttribute('autoplay');
      });
    }

    // VideoInterface Implementation. See ../src/video-interface.VideoInterface

    /**
     * @override
     */
    supportsPlatform() {
      return this.isVideoSupported_();
    }

    /**
     * @override
     */
    play(unusedIsAutoplay) {
      this.video_.play();
    }

    /**
     * @override
     */
    pause() {
      this.video_.pause();
    }

    /**
     * @override
     */
    mute() {
      this.video_.muted = true;
    }

    /**
     * @override
     */
    unmute() {
      this.video_.muted = false;
    }

    /**
     * @override
     */
    showControls() {
      this.video_.controls = true;
    }

    /**
     * @override
     */
    hideControls() {
      this.video_.controls = false;
    }
  }

  registerElement(win, 'amp-video', AmpVideo);
}
