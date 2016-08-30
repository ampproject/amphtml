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
import {vsyncFor} from '../vsync';

const VISIBILITY_PERCENT = 75;

export class VideoManager {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {

    this.win_ = ampdoc.win;

    /** {?Array<!{../video-interface.VideoInterface}>} */
    this.entries_;

    this.scrollListenerInstalled_ = false;
  }

  /**
   * @param !{../video-interface.VideoInterface} video
   */
  register(video) {
    if (!video.supportsPlatform()) {
      return;
    }

    this.entries_ = this.entries_ || [];
    const entry = new VideoEntry(this.win_, video);

    if (entry.needsVisibilityObserver()) {
      this.maybeInstallVisibilityObserver_(entry);
    }

    this.entries_.push(entry);
  }


  maybeInstallVisibilityObserver_(entry) {
    events.listen(entry.video.element, 'amp:video:visibility', () => {
      entry.updateVisibility_();
    });

    if (!this.scrollListenerInstalled_) {
      const scrollListener = () => {
        for (let i = 0; i < this.entries_.length; i++) {
          this.entries_[i].updateVisibility_();
        }
      };
      const viewport = viewportFor(this.win_);
      viewport.onScroll(scrollListener);
      viewport.onChanged(scrollListener);
      this.scrollListenerInstalled_ = true;
    }
  }
}

class VideoEntry {
  /**
   * @param !{../video-interface.VideoInterface} video
   */
  constructor(win, video) {
    /** @public @const !{../video-interface.VideoInterface} */
    this.video = video;

    this.loaded_ = false;
    this.isVisible_ = false;
    this.mightBecomeVisibleSoon_ = false;

    const element = dev().assert(video.element);
    // TODO(aghassemi): constant file and helper for events names.
    events.listenOncePromise(element, 'amp:video:built')
      .then(() => this.videoBuilt_());

    events.listenOncePromise(element, 'amp:video:loaded')
      .then(() => this.videoLoaded_());

    /** @const @private {!../../src/service/vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(win);
  }

  videoBuilt_() {
    if (this.video.canAutoplay()) {
      this.autoplayVideoBuilt_();
    }
  }

  videoLoaded_() {
    this.loaded_ = true;
    if (this.isVisible_) {
      this.loadedVideoVisibilityChanged_();
    }
  }

  videoVisibilityChanged() {
    if (this.loaded_) {
      this.loadedVideoVisibilityChanged_();
    }
  }

  loadedVideoVisibilityChanged_() {
    if (this.video.canAutoplay()) {
      this.autoplayLoadedVideoVisibilityChanged_();
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

  needsVisibilityObserver() {
    return this.video.canAutoplay();
  }

  autoplayLoadedVideoVisibilityChanged_() {
    if (this.isVisible_) {
      this.video.play(/*autoplay*/ true);
    } else {
      this.video.pause();
    }
  }

  updateVisibility_() {
    const wasVisible = this.isVisible_;
    const measure = () => {
      if (!this.video.isInViewport()) {
        this.isVisible_ = false;
        return;
      }

      const change = this.video.element.getIntersectionChangeEntry();
      const ir = change.intersectionRect;
      const br = change.boundingClientRect;
      const visiblePercent = br.height * br.width == 0 ? 0 :
        ir.width * ir.height * 100 / (br.height * br.width);

      this.isVisible_ = visiblePercent >= VISIBILITY_PERCENT;
    };

    const mutate = () => {
      if (this.isVisible_ != wasVisible) {
        this.videoVisibilityChanged();
      }
    };

    this.vsync_.run({
      measure,
      mutate,
    });
  }
}

export function installVideoManagerForDoc(ampdoc) {
  return fromClassForDoc(ampdoc, 'video-manager', VideoManager);
};
