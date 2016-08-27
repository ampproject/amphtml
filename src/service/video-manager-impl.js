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

import {dev} from '../log';
import {fromClassForDoc} from '../service';
import * as events from '../event-helper';

export class VideoManager {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {

    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** {?Array<!{../video-interface.VideoInterface}>} */
    this.entries_;
  }

  /**
   * @param !{../video-interface.VideoInterface} video
   */
  register(video) {
    this.entries_ = this.entries_ || [];

    const entry = new VideoEntry(video);
    this.entries_.push(entry);
  }
}

class VideoEntry {
  /**
   * @param !{../video-interface.VideoInterface} video
   */
  constructor(video) {
    /** @public @const !{../video-interface.VideoInterface} */
    this.video = video;

    // TODO(aghassemi): constant file and helper for events names.
    events.listenOncePromise(video, 'amp:video:built')
      .then(() => this.videoBuilt_());

    this.loadPromise_ = events.listenOncePromise(video, 'amp:video:loaded')
      .then(() => this.videoLoaded_());

    this.installIntersectionObserver_();
  }

  videoBuilt_() {
    if (this.video.canAutoplay()) {
      this.autoplayVideoBuilt_();
    }
  }

  videoLoaded_() {

  }

  loadedVideoInViewport_(inViewport) {
    if (this.video.canAutoplay()) {
      this.autoplayLoadedVideoInViewport_(inViewport);
    }
  }

  /* Autoplay behaviour */

  autoplayVideoBuilt_() {
    this.boundAutoplayTapHandler_ = this.autoplayTapHandler_.bind(this);

    this.video.hideControls();
    this.video.mute();
    if (this.canHaveControls()) {
      events.listenOnce(this.video, 'click', () => {
        dev().assert(this.video.canHaveControls());
        dev().assert(this.video.canAutoplay());

        this.video.showControls();
        this.video.unmute();
      });
    }
  }

  autoplayLoadedVideoInViewport_(inViewport) {
    if (inViewport) {
      this.video.play(/*autoplay*/ true);
    } else {
      this.video.pause();
    }
  }

  installIntersectionObserver_() {

  }

}

export function installVideoManagerForDoc(ampdoc) {
  return fromClassForDoc(ampdoc, 'video-manager', VideoManager);
};
