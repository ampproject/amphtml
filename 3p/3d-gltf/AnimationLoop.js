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

function now() {
  const performance = global.performance;
  return performance && performance.now ? performance.now() : Date.now();
}

export default class AnimationLoop {
  constructor(task) {
    /** @public {number} */
    this.fpsLimit = 0;

    /** @private */
    this.task_ = task;

    /** @private {boolean} */
    this.isRunning_ = false;
    /** @private {(number)} */
    this.currentRAF_ = 0;
    /** @private {number} */
    this.prevFrameTime_ = now();

    /** @public {boolean} */
    this.needsUpdate = true;

    /** @private */
    this.loop_ = this.loop_.bind(this);
  }

  run() {
    if (this.isRunning_) {
      return false;
    }
    this.isRunning_ = true;
    this.loop_();
    return true;
  }

  stop() {
    this.isRunning_ = false;
    if (this.currentRAF_ !== 0) {
      cancelAnimationFrame(this.currentRAF_);
      this.currentRAF_ = 0;
    }
  }

  /** @private */
  loop_() {
    if (this.isNeedToRender_) {
      this.task_();
    }
    this.currentRAF_ = requestAnimationFrame(this.loop_);
  }

  /** @private */
  get isNeedToRender_() {
    if (!this.needsUpdate) {
      return false;
    }

    if (!this.fpsLimit) {
      this.needsUpdate = false;
      return true;
    }

    const time = now();
    const dt = time - this.prevFrameTime_;
    const result = dt > 1000 / this.fpsLimit;
    if (!result) {
      return false;
    }
    this.prevFrameTime_ = time;
    this.needsUpdate = false;
    return true;
  }
}
