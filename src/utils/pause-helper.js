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

import {observeSize, unobserveSize} from './size-observer';

export class PauseHelper {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    /** @private @const */
    this.element_ = element;

    /** @private {boolean} */
    this.isPlaying_ = false;

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
      observeSize(this.element_, this.pauseWhenNoSize_);
    } else {
      unobserveSize(this.element_, this.pauseWhenNoSize_);
    }
  }

  /**
   * @param {!ResizeObserverEntry} entry
   * @private
   */
  pauseWhenNoSize_(({contentRect, borderBoxSize})) {
    const hasSize = (
      // The most accurate information is in the `borderBoxSize`, but it's not
      // available on all platforms.
      borderBoxSize?.length > 0 && borderBoxSize[0].inlineSize > 0 && borderBoxSize[0].blockSize > 0 ||
      // If content size is non-zero - then the whole element is also non-zero.
      // This helps because the `contentRect` is available on all platforms.
      contentRect.width > 0 && contentRect.height > 0 ||
      // Fallback to offsetWidth/Height. This will cause a blocking measure,
      // but a collision with a mutation is less likely inside the `ResizeObserver`
      // callback.
      this.element_.offsetWidth > 0 && this.element_.offsetHeight > 0
    );
    if (!hasSize) {
      this.element_.pause();
    }
  }
}
