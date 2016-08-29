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

import * as events from '../event-helper';
import {dev} from '../log';
import {fromClassForDoc} from '../service';
import {viewportFor} from '../viewport';

const VISIBILITY_PERCENT = 75;

export class VideoManager {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {

    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** {?Array<!{../video-interface.VideoInterface}>} */
    this.entries_;

    this.built_ = false;

  }

  lazyBuild_() {
    if (this.built_) {
      return;
    }

    this.entries_ = [];

    this.boundScrollListener_ = this.scrollListener_.bind(this);

    const viewport = viewportFor(this.ampdoc_.win);

    viewport.onScroll(this.boundScrollListener_);
    viewport.onChanged(this.boundScrollListener_);

    this.built_ = true;
  }

  /**
   * @param !{../video-interface.VideoInterface} video
   */
  register(video) {
    this.lazyBuild_();

    const entry = new VideoEntry(video);
    this.entries_.push(entry);
  }

  scrollListener_() {
    for (let i = 0; i < this.entries_.length; i++) {
      const entry = this.entries_[i];
      entry.updateVisibility_();
    }
  }
}

class VideoEntry {
  /**
   * @param !{../video-interface.VideoInterface} video
   */
  constructor(video) {
    /** @public @const !{../video-interface.VideoInterface} */
    this.video = video;

    this.loaded_ = false;
    this.isVisible_ = false;

    const element = dev().assert(video.element);
    // TODO(aghassemi): constant file and helper for events names.
    events.listenOncePromise(element, 'amp:video:built')
      .then(() => this.videoBuilt_());

    events.listenOncePromise(element, 'amp:video:loaded')
      .then(() => this.videoLoaded_());
  }

  videoBuilt_() {
    if (this.video.canAutoplay()) {
      this.autoplayVideoBuilt_();
    }
  }

  videoLoaded_() {
    this.loaded_ = true;
    this.updateVisibility_();
    if (this.isVisible_) {
      this.loadedVideoVisibilityChanged_(this.isVisible_);
    }
  }

  videoVisibilityChanged(visible) {
    this.visible_ = visible;
    if (this.loaded_) {
      this.loadedVideoVisibilityChanged_(visible);
    }
  }

  loadedVideoVisibilityChanged_(visible) {
    if (this.video.canAutoplay()) {
      this.autoplayLoadedVideoVisibilityChanged_(visible);
    }
  }

  /* Autoplay behaviour */
  autoplayVideoBuilt_() {
    this.video.hideControls();
    this.video.mute();
    if (this.video.canHaveControls()) {
      events.listenOnce(this.video.element, 'click', () => {
        dev().assert(this.video.canHaveControls());
        dev().assert(this.video.canAutoplay());

        this.video.showControls();
        this.video.unmute();
      });
    }
  }

  autoplayLoadedVideoVisibilityChanged_(visible) {
    if (visible) {
      this.video.play(/*autoplay*/ true);
    } else {
      this.video.pause();
    }
  }

  updateVisibility_() {
    const change = this.video.element.getIntersectionChangeEntry();
    const ir = change.intersectionRect;
    const br = change.boundingClientRect;
    const visiblePercent = br.height * br.width == 0 ? 0 :
      ir.width * ir.height * 100 / (br.height * br.width);
    if (visiblePercent >= VISIBILITY_PERCENT && !this.isVisible_) {
      this.isVisible_ = true;
      this.videoVisibilityChanged(true);
    }

    if (visiblePercent <= VISIBILITY_PERCENT && this.isVisible_) {
      this.isVisible_ = false;
      this.videoVisibilityChanged(false);
    }
  }
}

export function installVideoManagerForDoc(ampdoc) {
  return fromClassForDoc(ampdoc, 'video-manager', VideoManager);
};
