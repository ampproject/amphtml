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
import {getMode} from '../mode';
import {fromClassForDoc} from '../service';
import {setStyles} from '../style';
import {VideoEvents, VideoAttributes} from '../video-interface';
import {viewerForDoc} from '../viewer';
import {viewportForDoc} from '../viewport';
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

    /** @private @const {!./ampdoc-impl.AmpDoc}  */
    this.ampdoc_ = ampdoc;

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
    if (!video.element.hasAttribute(VideoAttributes.AUTOPLAY)) {
      return;
    }

    if (!video.supportsPlatform()) {
      return;
    }

    this.entries_ = this.entries_ || [];
    const entry = new VideoEntry(this.ampdoc_, video);
    this.maybeInstallVisibilityObserver_(entry);
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
      const viewport = viewportForDoc(this.ampdoc_);
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
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!../video-interface.VideoInterface} video
   */
  constructor(ampdoc, video) {

    /** @private @const {!./ampdoc-impl.AmpDoc}  */
    this.ampdoc_ = ampdoc;

    /** @package @const {!../video-interface.VideoInterface} */
    this.video = video;

    /** @private {boolean} */
    this.loaded_ = false;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private {boolean} */
    this.userInteracted_ = false;

    /** @private @const {!../service/vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(ampdoc.win);

    /** @private @const {function(): !Promise<boolean>} */
    this.boundSupportsAutoplay_ = supportsAutoplay.bind(null, ampdoc,
        getMode(ampdoc.win).lite);

    const element = dev().assert(video.element);

    /** @private {boolean} */
    this.hasAutoplay_ = element.hasAttribute(VideoAttributes.AUTOPLAY);

    listenOncePromise(element, VideoEvents.LOAD)
      .then(() => this.videoLoaded_());

    // Currently we only register after video player is build.
    this.videoBuilt_();
  }

  /**
   * Called when the video element is built.
   * @private
   */
  videoBuilt_() {
    if (this.hasAutoplay_) {
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
    if (this.hasAutoplay_) {
      this.autoplayLoadedVideoVisibilityChanged_();
    }
  }

  /* Autoplay Behaviour */

  /**
   * Called when an autoplay video is built.
   * @private
   */
  autoplayVideoBuilt_() {

    // Hide controls until we know if autoplay is supported, otherwise hiding
    // and showing the controls quickly becomes a bad user experience for the
    // common case where autoplay is supported.
    this.video.hideControls();

    this.boundSupportsAutoplay_().then(supportsAutoplay => {
      if (!supportsAutoplay) {
        // Autoplay is not supported, show the controls so user can manually
        // initiate playback.
        this.video.showControls();
        return;
      }

      // Only muted videos are allowed to autoplay
      this.video.mute();

      // If autoplay video has controls, hide them and only show them on
      // user interaction.
      if (this.video.element.hasAttribute(VideoAttributes.CONTROLS)) {
        this.video.hideControls();

        listenOnce(this.video.element, VideoEvents.USER_TAP, () => {
          this.userInteracted_ = true;
          this.video.showControls();
          this.video.unmute();
        });
      }
    });
  }

  /**
   * Called when visibility of a loaded autoplay video changes.
   * @private
   */
  autoplayLoadedVideoVisibilityChanged_() {
    if (this.userInteracted_ || !viewerForDoc(this.ampdoc_).isVisible()) {
      return;
    }

    this.boundSupportsAutoplay_().then(supportsAutoplay => {
      if (!supportsAutoplay) {
        return;
      }

      if (this.isVisible_) {
        this.video.play(/*autoplay*/ true);
      } else {
        this.video.pause();
      }

    });
  }

  /**
   * Called by all possible events that might change the visibility of the video
   * such as scrolling or {@link ../video-interface.VideoEvents#VISIBILITY}.
   * @package
   */
  updateVisibility() {
    const wasVisible = this.isVisible_;

    // Measure if video is now in viewport and what percentage of it is visible.
    const measure = () => {
      if (!this.video.isInViewport()) {
        this.isVisible_ = false;
        return;
      }

      // Calculate what percentage of the video is in viewport.
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

/* @type {?Promise<boolean>} */
let supportsAutoplayCache_ = null;

/**
 * Detects whether autoplay is supported.
 * Note that even if platfrom supports autoplay, users or browsers can disable
 * autoplay to save data / battery. This function detects both platfrom support
 * and when autoplay is disabled.
 *
 * Service dependencies are taken explicitly for testability.
 *
 * @private visible for testing.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {boolean} isLiteViewer
 * @return {!Promise<boolean>}
 */
export function supportsAutoplay(ampdoc, isLiteViewer) {

  // Use cached result if available.
  if (supportsAutoplayCache_) {
    return supportsAutoplayCache_;
  }

  // We do not support autoplay in amp-lite viewer regardless of platform.
  if (isLiteViewer) {
    return supportsAutoplayCache_ = Promise.resolve(false);
  }

  // To detect autoplay, we create a video element and call play on it, if
  // `paused` is true after `play()` call, autoplay is supported. Although
  // this is unintuitive, it works across browsers and is currently the lightest
  // way to detect autoplay without using a data source.
  const detectionElement = ampdoc.win.document.createElement('video');
  // NOTE(aghassemi): We need both attributes and properties due to Chrome and
  // Safari differences when dealing with non-attached elements.
  detectionElement.setAttribute('muted', '');
  detectionElement.setAttribute('playsinline', '');
  detectionElement.setAttribute('webkit-playsinline', '');
  detectionElement.muted = true;
  detectionElement.playsinline = true;
  detectionElement.webkitPlaysinline = true;
  detectionElement.setAttribute('height', '0');
  detectionElement.setAttribute('width', '0');
  setStyles(detectionElement, {
    position: 'fixed',
    top: '0',
    width: '0',
    height: '0',
    opacity: '0',
  });

  detectionElement.play();
  const supportsAutoplay = !detectionElement.paused;
  return supportsAutoplayCache_ = Promise.resolve(supportsAutoplay);
}

/**
 * Clears the cache used by supportsAutoplay method.
 *
 * @private visible for testing.
 */
export function clearSupportsAutoplayCacheForTesting() {
  supportsAutoplayCache_ = null;
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!VideoManager}
 */
export function installVideoManagerForDoc(ampdoc) {
  return fromClassForDoc(ampdoc, 'video-manager', VideoManager);
};
