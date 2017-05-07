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

//TODO(aghassemi): Add interface def for Web Animation player object
export class ScrollboundPlayer {

  constructor(request) {
    this.request_ = request;
    this.paused_ = false;
    // If no duration, wait until duration arrives via onScrollDurationChanged
    if (request.timing.duration == 0) {
      return;
    } else {
      this.createAnimation_();
    }
  }

  onScrollDurationChanged() {
    let currentTime = 0;
    if (this.animation_) {
      currentTime = this.animation_.currentTime;
    }
    // we have to recreate the animation to change its duration
    this.createAnimation_();
    this.animation_.currentTime = currentTime;
  }

  pause() {
    this.paused_ = true;
  }

  play() {
    this.paused_ = false;
  }

  cancel() {
    this.paused_ = true;
    this.animation_.cancel();
  }

  tick(pos) {
    if (this.paused_ || !this.animation_) {
      return;
    }
    this.animation_.currentTime = pos;
  }

  createAnimation_() {
    this.animation_ = this.request_.target.animate(
        this.request_.keyframes, this.request_.timing);
    this.animation_.pause();
  }
}
