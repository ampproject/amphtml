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

import {listen, listenOnce, listenOncePromise} from '../event-helper';
import {dev} from '../log';
import {platformFor} from '../platform';
import {fromClassForDoc} from '../service';
import {VideoEvents, VideoAttributes} from '../video-interface';
import {viewerFor} from '../viewer';
import {viewportFor} from '../viewport';
import {vsyncFor} from '../vsync';

/**
 * @const {number} Percentage of the video that should be in viewport before it
 * is considered visible.
 */
const VISIBILITY_PERCENT = 75;

/**
 * VideoManager keeps track of all AMP video players that implement
 * the common Video API {@see ../video-interface.VideoInterface}.
 *
 * It is responsible for providing a unified user experience and analytics for
 * all videos within a document.
 */
export class VideoManager {

  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {

    /** @private @const {!Window} */
    this.win_ = ampdoc.win;

    /** @private {?Array<!VideoEntry>} */
    this.entries_ = null;

    /** @private {boolean} */
    this.scrollListenerInstalled_ = false;
  }

  /**
   * Registers a video component that implements the VideoInterface.
   * @param {!../video-interface.VideoInterface} video
   */
  register(video) {
    dev().assert(video);

    // TODO(aghassemi): Remove this later. For now, VideoManager only matters
    // for autoplay videos so no point in registering arbitrary videos yet.
    if (!video.element.hasAttribute(VideoAttributes.AUTOPLAY) ||
        !platformSupportsAutoplay(platformFor(this.win_))) {
      return;
    }

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

  /**
   * Install the necessary listeners to be notified when a video becomes visible
   * in the viewport.
   *
   * Visibility of a video is defined by being in the viewport AND having
   * {@link VISIBILITY_PERCENT} of the video element visible.
   *
   * @param {VideoEntry} entry
   * @private
   */
  maybeInstallVisibilityObserver_(entry) {
    listen(entry.video.element, VideoEvents.VISIBILITY, () => {
      entry.updateVisibility();
    });

    // TODO(aghassemi, #4780): Create a new IntersectionObserver service.
    if (!this.scrollListenerInstalled_) {
      const scrollListener = () => {
        for (let i = 0; i < this.entries_.length; i++) {
          this.entries_[i].updateVisibility();
        }
      };
      const viewport = viewportFor(this.win_);
      viewport.onScroll(scrollListener);
      viewport.onChanged(scrollListener);
      this.scrollListenerInstalled_ = true;
    }
  }
}

/**
 * VideoEntry represents an entry in the VideoManager's list.
 */
class VideoEntry {
  /**
   * @param {!Window} win
   * @param {!../video-interface.VideoInterface} video
   */
  constructor(win, video) {

    /** @private @const {!Window} */
    this.win_ = win;

    /** @package @const {!../video-interface.VideoInterface} */
    this.video = video;

    /** @private {boolean} */
    this.loaded_ = false;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private {boolean} */
    this.userInteracted_ = false;

    /** @private @const {!../service/vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(win);

    /** @private {boolean} */
    this.canAutoplay_ = video.element.hasAttribute(VideoAttributes.AUTOPLAY) &&
        platformSupportsAutoplay(platformFor(win));

    const element = dev().assert(video.element);

    listenOncePromise(element, VideoEvents.CANPLAY)
      .then(() => this.videoLoaded_());

    // Currently we only register after video player is build.
    this.videoBuilt_();
  }

  /**
   * Called when the video element is built.
   * @private
   */
  videoBuilt_() {
    if (this.canAutoplay_) {
      this.autoplayVideoBuilt_();
    }
  }

  /**
   * Called when the video is loaded and can play.
   * @private
   */
  videoLoaded_() {
    this.loaded_ = true;
    if (this.isVisible_) {
      // Handles the case when the video becomes visible before loading
      this.loadedVideoVisibilityChanged_();
    }
  }

  /**
   * Called when visibility of a video changes.
   * @private
   */
  videoVisibilityChanged_() {
    if (this.loaded_) {
      this.loadedVideoVisibilityChanged_();
    }
  }

  /**
   * Only called when visibility of a loaded video changes.
   * @private
   */
  loadedVideoVisibilityChanged_() {
    if (this.canAutoplay_) {
      this.autoplayLoadedVideoVisibilityChanged_();
    }
  }

  /**
   * Whether there is a need to monitor visibility of this video.
   * @return {boolean}
   * @package
   */
  needsVisibilityObserver() {
    return this.canAutoplay_;
  }

  /* Autoplay Behaviour */

  /**
   * Called when an autoplay video is built.
   * @private
   */
  autoplayVideoBuilt_() {
    this.video.mute();

    // If autoplay video has controls, hide them and only show them on
    // user-ineraction.
    if (this.video.element.hasAttribute(VideoAttributes.CONTROLS)) {
      this.video.hideControls();

      // TODO(aghassemi): This won't work for iframes, needs a transparent shim
      listenOnce(this.video.element, 'click', () => {
        this.userInteracted_ = true;
        this.video.showControls();
        this.video.unmute();
      });
    }
  }

  /**
   * Called when visibility of a loaded autoplay video changes.
   * @private
   */
  autoplayLoadedVideoVisibilityChanged_() {
    if (this.userInteracted_ || !viewerFor(this.win_).isVisible()) {
      return;
    }

    if (this.isVisible_) {
      this.video.play(/*autoplay*/ true);
    } else {
      this.video.pause();
    }
  }

  /**
   * Called by all possible events that might change the visibility of the video
   * such as scrolling or {@link ../video-interface.VideoEvents#VISIBILITY}.
   * @package
   */
  updateVisibility() {
    const wasVisible = this.isVisible_;

    // Measure if video is now in viewport and what percentage of it is visible
    const measure = () => {
      if (!this.video.isInViewport()) {
        this.isVisible_ = false;
        return;
      }

      // Calculate what percentage of the video is in viewport
      const change = this.video.element.getIntersectionChangeEntry();
      const ir = change.intersectionRect;
      const br = change.boundingClientRect;
      const visiblePercent = br.height * br.width == 0 ? 0 :
        ir.width * ir.height * 100 / (br.height * br.width);

      this.isVisible_ = visiblePercent >= VISIBILITY_PERCENT;
    };

    // Mutate if visibility changed from previous state
    const mutate = () => {
      if (this.isVisible_ != wasVisible) {
        this.videoVisibilityChanged_();
      }
    };

    this.vsync_.run({
      measure,
      mutate,
    });
  }
}

/**
 * Detects whether the platform even supports autoplay videos.
 * @param {!../service/platform-impl.Platform} platform
 * @return {boolean}
 */
function platformSupportsAutoplay(platform) {
  // non-mobile platforms always supported autoplay
  if (!platform.isAndroid() && !platform.isIos()) {
    return true;
  }

  const version = platform.getMajorVersion();
  if (platform.isAndroid()) {
    if (platform.isFirefox() && version >= 37) {
      return true;
    }
    if (platform.isChrome() && version >= 53) {
      return true;
    }
  }

  if (platform.isIos()) {
    if (platform.isSafari() && version >= 10) {
      return true;
    }
  }

  // TODO(aghassemi): Test other combinations and add support.
  // TODO(aghassemi): Is there a way to detect that autoplay has been disabled
  // in the user preferences of the browser?
  return false;
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!VideoManager}
 */
export function installVideoManagerForDoc(ampdoc) {
  return fromClassForDoc(ampdoc, 'video-manager', VideoManager);
};
