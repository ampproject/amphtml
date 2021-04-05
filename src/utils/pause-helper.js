/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {observeBorderBoxSize, unobserveBorderBoxSize} from './size-observer';

export class PauseHelper {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    /** @private @const */
    this.element_ = element;

    /** @private {boolean} */
    this.isPlaying_ = false;

    /** @private {boolean} */
    this.hasSize_ = false;

    this.pauseWhenNoSize_ = this.pauseWhenNoSize_.bind(this);
  }

  /**
   * @param {boolean} isPlaying
   */
  updatePlaying(isPlaying) {
    if (isPlaying === this.isPlaying_) {
      return;
    }
    this.isPlaying_ = isPlaying;
    if (isPlaying) {
      // Pause will not be called until transitioning from "has size" to
      // "no size". Which means a measurement must first be received that
      // has size, then a measurement that does not have size.
      this.hasSize_ = false;
      observeBorderBoxSize(this.element_, this.pauseWhenNoSize_);
    } else {
      unobserveBorderBoxSize(this.element_, this.pauseWhenNoSize_);
    }
  }

  /**
   * @param {!ResizeObserverSize} size
   * @private
   */
  pauseWhenNoSize_({inlineSize, blockSize}) {
    const hasSize = inlineSize > 0 && blockSize > 0;
    if (hasSize === this.hasSize_) {
      return;
    }
    this.hasSize_ = hasSize;
    if (!hasSize) {
      this.element_.pause();
    }
  }
}
