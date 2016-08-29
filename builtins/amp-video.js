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

import {ampdocFor} from '../src/ampdoc';
import {BaseElement} from '../src/base-element';
import {assertHttpsUrl} from '../src/url';
import {isLayoutSizeDefined} from '../src/layout';
import {loadPromise} from '../src/event-helper';
import {registerElement} from '../src/custom-element';
import {getMode} from '../src/mode';
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
      /** @private @const {!HTMLVideoElement} */
      this.video_ = this.element.ownerDocument.createElement('video');

      const posterAttr = this.element.getAttribute('poster');
      if (!posterAttr && getMode().development) {
        console/*OK*/.error(
            'No "poster" attribute has been provided for amp-video.');
      }

      const ampDoc = ampdocFor(this.win).getAmpDoc(this.element);
      const videoManager = videoManagerForDoc(ampDoc);
      videoManager.register(this);

      // Disable video preload in prerender mode.
      this.video_.setAttribute('preload', 'none');
      this.propagateAttributes(['poster', 'controls'], this.video_);
      this.applyFillContent(this.video_, true);
      this.element.appendChild(this.video_);
      this.element.dispatchCustomEvent('amp:video:built');
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
      this.propagateAttributes(
          ['src', 'muted', 'loop'],
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
          assertHttpsUrl(child.getAttribute('src'), child);
        }
        this.video_.appendChild(child);
      });

      return loadPromise(this.video_).then(() => {
        this.element.dispatchCustomEvent('amp:video:loaded');
      });
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

    /* VideoInterface Implementation */

    supportsPlatform() {
      return this.isVideoSupported_();
    }

    canAutoplay() {
      return this.element.hasAttribute('autoplay');
    }

    play(isAutoplay) {
      this.video_.play();
    }

    pause() {
      this.video_.pause();
    }

    mute() {
      this.video_.setAttribute('muted', '');
    }

    unmute() {
      this.video_.removeAttribute('muted');
    }

    canHaveControls() {
      return this.element.hasAttribute('controls');
    }

    showControls() {
      this.video_.setAttribute('controls', '');
    }

    hideControls() {
      this.video_.removeAttribute('controls');
    }
  }

  registerElement(win, 'amp-video', AmpVideo);
}
