/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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


import {BaseElement} from './base-element';
import {dev} from './log';

/**
 * @implements {VideoPlayerInterface}
 */
export class VideoPlayerBaseElement extends BaseElement {

  videoPlayerBuilt(loadPromise) {
    this.loadPromise_ = dev().assert(loadPromise);

    if (this.canAutoplay()) {
      this.setupAutoplay();
    }
  }

  setupAutoplay() {
    this.boundAutoplayTapHandler_ = this.autoplayTapHandler_.bind(this);

    this.hideControls();
    this.mute();
    if (this.canHaveControls()) {
      this.element.addEventListener('click', this.boundAutoplayTapHandler_);
    }
  }

  viewportCallback(inViewport) {
    this.loadPromise_.then(() => {
      if (this.canAutoplay()) {
        this.autoplayViewportCallback_(inViewport);
      }
    });
  }

  autoplayViewportCallback_(inViewport) {
    if (inViewport) {
      this.play(/*autoplay*/ true);
    } else {
      this.pause();
    }
  }

  autoplayTapHandler_() {
    dev().assert(this.canHaveControls());
    dev().assert(this.canAutoplay());

    this.showControls();
    this.unmute();
    this.element.removeEventListener('click', this.boundAutoplayTapHandler_);
  }


  /* VideoInterface Implementation */

  /** @abstract */
  canAutoplay() {}

  /** @abstract */
  play(isAutoplay) {}

  /** @abstract */
  pause() {}

  /** @abstract */
  mute() {}

  /** @abstract */
  unmute() {}

  /** @abstract */
  canHaveControls() {}

  /** @abstract */
  showControls() {}

  /** @abstract */
  hideControls() {}
}

