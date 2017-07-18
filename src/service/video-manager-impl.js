
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

import {ActionTrust} from '../action-trust';
import {VideoSessionManager} from './video-session-manager';
import {removeElement, isRTL} from '../dom';
import {listen, listenOncePromise} from '../event-helper';
import {dev} from '../log';
import {getMode} from '../mode';
import {registerServiceBuilderForDoc, getServiceForDoc} from '../service';
import {setStyles} from '../style';
import {isFiniteNumber} from '../types';
import {mapRange} from '../utils/math';
import {
  PlayingStates,
  VideoAnalyticsEvents,
  VideoAttributes,
  VideoEvents,
} from '../video-interface';
import {Services} from '../services';
import {
  installPositionObserverServiceForDoc,
  PositionObserverFidelity,
  PositionInViewportEntryDef,
} from './position-observer-impl';
import {
  scopedQuerySelector,
} from '../dom';
import {layoutRectLtwh, RelativePositions} from '../layout-rect';
import * as st from '../style';

/**
 * @const {number} Percentage of the video that should be in viewport before it
 * is considered visible.
 */
const VISIBILITY_PERCENT = 75;

/**
 * @const {number} How much to scale the video by when minimized.
 */
const DOCK_SCALE = 0.6;
const DOCK_CLASS = 'i-amphtml-dockable-video-minimizing';
const DOCK_MARGIN = 20;


/**
* Docking Positions
*
* Internal states used to describe whether the video is inline
* or minimizing in each of the corners
*
* @enum {string}
*/
export const DockPositions = {
  INLINE: 'inline',
  TOP_LEFT: 'top_left',
  BOTTOM_LEFT: 'bottom_left',
  TOP_RIGHT: 'top_right',
  BOTTOM_RIGHT: 'bottom_right',
};

/**
* Docking states
*
* Internal states used to describe whether the video is inline,
* currently docking or fully docked
*
* @enum {string}
*/
export const DockStates = {
  INLINE: 'inline',
  DOCKING: 'docking',
  DOCKED: 'docked',
};

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

    /** @const {!./ampdoc-impl.AmpDoc}  */
    this.ampdoc = ampdoc;

    /** @private {?Array<!VideoEntry>} */
    this.entries_ = null;

    /** @private {boolean} */
    this.scrollListenerInstalled_ = false;

    /** @private {boolean} */
    this.resizeListenerInstalled_ = false;

    /** @private {./position-observer-impl.AmpDocPositionObserver} */
    this.positionObserver_ = null;

    /** @private {?VideoEntry} */
    this.dockedVideo_ = null;
  }

  /**
   * Registers a video component that implements the VideoInterface.
   * @param {!../video-interface.VideoInterface} video
   */
  register(video) {
    dev().assert(video);

    this.registerCommonActions_(video);

    if (!video.supportsPlatform()) {
      return;
    }

    this.entries_ = this.entries_ || [];
    const entry = new VideoEntry(this, video);
    this.maybeInstallVisibilityObserver_(entry);
    this.maybeInstallPositionObserver_(entry);
    this.entries_.push(entry);
    video.element.dispatchCustomEvent(VideoEvents.REGISTERED);
  }

  /**
   * Register common actions such as play, pause, etc... on the video element
   * so they can be called using AMP Actions.
   * For example: <button on="tap:myVideo.play">
   *
   * @param {!../video-interface.VideoInterface} video
   * @private
   */
  registerCommonActions_(video) {
    // TODO(choumx, #9699): HIGH for unmuted play, LOW for muted play.
    video.registerAction('play', video.play.bind(video, /* isAutoplay */ false),
        ActionTrust.MEDIUM);
    // TODO(choumx, #9699): LOW.
    video.registerAction('pause', video.pause.bind(video), ActionTrust.MEDIUM);
    video.registerAction('mute', video.mute.bind(video), ActionTrust.MEDIUM);
    // TODO(choumx, #9699): HIGH.
    video.registerAction('unmute', video.unmute.bind(video),
        ActionTrust.MEDIUM);
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

    listen(entry.video.element, VideoEvents.RELOAD, () => {
      entry.videoLoaded();
    });

    // TODO(aghassemi, #6425): Use IntersectionObserver
    if (!this.scrollListenerInstalled_) {
      const scrollListener = () => {
        for (let i = 0; i < this.entries_.length; i++) {
          this.entries_[i].updateVisibility();
        }
      };
      const viewport = Services.viewportForDoc(this.ampdoc);
      viewport.onScroll(scrollListener);
      viewport.onChanged(scrollListener);
      this.scrollListenerInstalled_ = true;
    }
  }

  /**
   * Install the necessary listeners to be notified when a video scrolls in the
   * viewport
   *
   * @param {VideoEntry} entry
   * @private
   */
  maybeInstallPositionObserver_(entry) {
    if (!entry.hasDocking) {
      return;
    }

    if (!this.positionObserver_) {
      installPositionObserverServiceForDoc(this.ampdoc);
      this.positionObserver_ = getServiceForDoc(
          this.ampdoc,
          'position-observer'
      );
    }


    this.positionObserver_.observe(
        entry.video.element,
        PositionObserverFidelity.HIGH,
        newPos => {
          entry.onDockableVideoPositionChanged(newPos);
        }
    );

    if (!this.resizeListenerInstalled_) {
      const resizeListener = () => {
        for (let i = 0; i < this.entries_.length; i++) {
          this.entries_[i].updateDockableInitialRect();
        }
      };
      const viewport = Services.viewportForDoc(this.ampdoc);
      viewport.onResize(resizeListener);
      this.resizeListenerInstalled_ = true;
    }

  }

  /**
   * Returns the entry in the video manager corresponding to the video
   * provided
   *
   * @param {!../video-interface.VideoInterface} video
   * @return {VideoEntry} entry
   * @private
   */
  getEntryForVideo_(video) {
    for (let i = 0; i < this.entries_.length; i++) {
      if (this.entries_[i].video === video) {
        return this.entries_[i];
      }
    }
    dev().assert(false, 'video is not registered to this video manager');
    return null;
  }

  /**
   * Returns whether the video is paused or playing after the user interacted
   * with it or playing through autoplay
   *
   * @param {!../video-interface.VideoInterface} video
   * @return {!../video-interface.VideoInterface} PlayingStates
   */
  getPlayingState(video) {
    return this.getEntryForVideo_(video).getPlayingState();
  }

  /**
   * Returns whether the video was interacted with or not
   *
   * @param {!../video-interface.VideoInterface} video
   * @return {boolean}
   */
  userInteractedWithAutoPlay(video) {
    return this.getEntryForVideo_(video).userInteractedWithAutoPlay();
  }

  /**
   * Checks whether there's no video already docked
   *
   * @param {VideoEntry} entry
   * @return {boolean}
   */
  canDock(entry) {
    return !this.dockedVideo_ || this.dockedVideo_ == entry;
  }

  /**
   * Registers the provided video as docked
   *
   * @param {VideoEntry} entry
   */
  registerDocked(entry) {
    this.dockedVideo_ = entry;
  }

  /**
   * Un-registers the currently docked video
   */
  unregisterDocked() {
    this.dockedVideo_ = null;
    for (let i = 0; i < this.entries_.length; i++) {
      this.entries_[i].dockPreviouslyInView_ = false;
    }
  }
}

/**
 * VideoEntry represents an entry in the VideoManager's list.
 */
class VideoEntry {
  /**
   * @param {!VideoManager} manager
   * @param {!../video-interface.VideoInterface} video
   */
  constructor(manager, video) {

    /** @private @const {!VideoManager} */
    this.manager_ = manager;

    /** @private @const {!./ampdoc-impl.AmpDoc}  */
    this.ampdoc_ = manager.ampdoc;

    /** @package @const {!../video-interface.VideoInterface} */
    this.video = video;

    /** @private {?Element} */
    this.autoplayAnimation_ = null;

    /** @private {boolean} */
    this.loaded_ = false;

    /** @private {boolean} */
    this.isPlaying_ = false;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private @const {!../service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.ampdoc_.win);

    /** @private @const */
    this.actionSessionManager_ = new VideoSessionManager();

    this.actionSessionManager_.onSessionEnd(
        () => analyticsEvent(this, VideoAnalyticsEvents.SESSION));

    /** @private @const */
    this.visibilitySessionManager_ = new VideoSessionManager();

    this.visibilitySessionManager_.onSessionEnd(
        () => analyticsEvent(this, VideoAnalyticsEvents.SESSION_VISIBLE));

    /** @private @const {function(): !Promise<boolean>} */
    this.boundSupportsAutoplay_ = supportsAutoplay.bind(null, this.ampdoc_.win,
        getMode(this.ampdoc_.win).lite);

    const element = dev().assert(video.element);

    /** @private {boolean} */
    this.userInteractedWithAutoPlay_ = false;

    /** @private */
    this.playCalledByAutoplay_ = false;

    /** @private */
    this.pauseCalledByAutoplay_ = false;

    /** @private {?Element} */
    this.internalElement_ = null;

    /** @private */
    this.muted_ = false;

    // Dockabled Video Variables

    /** @private {Object} */
    this.initialRect_ = null;

    /** @private {string} */
    this.dockPosition_ = DockPositions.INLINE;

    /** @private {string} */
    this.dockState_ = DockStates.INLINE;

    /** @private {number} */
    this.dockVisibleHeight_ = 0;

    /** @private {?PositionInViewportEntryDef} */
    this.dockLastPosition_ = null;

    /** @private {boolean} */
    this.dockPreviouslyInView_ = false;

    this.hasDocking = element.hasAttribute(VideoAttributes.DOCK);

    this.hasAutoplay = element.hasAttribute(VideoAttributes.AUTOPLAY);

    listenOncePromise(element, VideoEvents.LOAD)
        .then(() => this.videoLoaded());


    listen(element, VideoEvents.PAUSE, () => this.videoPaused_());
    listen(element, VideoEvents.PLAYING, () => this.videoPlayed_());
    listen(element, VideoEvents.MUTED, () => this.muted_ = true);
    listen(element, VideoEvents.UNMUTED, () => this.muted_ = false);

    // Currently we only register after video player is build.
    this.videoBuilt_();
  }

  /**
   * Called when the video element is built.
   * @private
   */
  videoBuilt_() {
    this.updateVisibility();
    if (this.hasAutoplay) {
      this.autoplayVideoBuilt_();
    }
    if (this.hasDocking) {
      this.dockableVideoBuilt_();
    }
  }

  /**
   * Callback for when the video starts playing
   * @private
   */
  videoPlayed_() {
    this.isPlaying_ = true;
    this.actionSessionManager_.beginSession();
    if (this.isVisible_) {
      this.visibilitySessionManager_.beginSession();
    }
    analyticsEvent(this, VideoAnalyticsEvents.PLAY);
  }

  /**
   * Callback for when the video has been paused
   * @private
   */
  videoPaused_() {
    if (this.video.getCurrentTime() === this.video.getDuration()) {
      analyticsEvent(this, VideoAnalyticsEvents.ENDED);
    } else {
      analyticsEvent(this, VideoAnalyticsEvents.PAUSE);
    }
    this.isPlaying_ = false;

    // Prevent double-trigger of session if video is autoplay and the video
    // is paused by a the user scrolling the video out of view.
    if (!this.pauseCalledByAutoplay_) {
      this.actionSessionManager_.endSession();
    } else {
      // reset the flag
      this.pauseCalledByAutoplay_ = false;
    }
  }

  /**
   * Called when the video is loaded and can play.
   */
  videoLoaded() {
    this.loaded_ = true;

    // Get the internal element (the actual video/iframe)
    this.internalElement_ = scopedQuerySelector(
        this.video.element,
        'video, iframe'
    );

    // Just in case the video's size changed during layout
    this.vsync_.measure(() => {
      this.initialRect_ = this.video.element.getLayoutBox();
    });

    this.updateVisibility();
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
    if (!Services.viewerForDoc(this.ampdoc_).isVisible()) {
      return;
    }

    this.boundSupportsAutoplay_().then(supportsAutoplay => {
      const canAutoplay = this.hasAutoplay && !this.userInteractedWithAutoPlay_;

      if (canAutoplay && supportsAutoplay) {
        this.autoplayLoadedVideoVisibilityChanged_();
      } else {
        this.nonAutoplayLoadedVideoVisibilityChanged_();
      }
    });
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
    if (this.video.isInteractive()) {
      this.video.hideControls();
    }

    this.boundSupportsAutoplay_().then(supportsAutoplay => {
      if (!supportsAutoplay && this.video.isInteractive()) {
        // Autoplay is not supported, show the controls so user can manually
        // initiate playback.
        this.video.showControls();
        return;
      }

      // Only muted videos are allowed to autoplay
      this.video.mute();

      if (this.video.isInteractive()) {
        this.autoplayInteractiveVideoBuilt_();
      }
    });
  }

  /**
   * Called by autoplayVideoBuilt_ when an interactive autoplay video is built.
   * It handles hiding controls, installing autoplay animation and handling
   * user interaction by unmuting and showing controls.
   * @private
   */
  autoplayInteractiveVideoBuilt_() {
    const toggleAnimation = playing => {
      this.vsync_.mutate(() => {
        animation.classList.toggle('amp-video-eq-play', playing);
      });
    };

    // Hide the controls.
    this.video.hideControls();

    // Create autoplay animation and the mask to detect user interaction.
    const animation = this.createAutoplayAnimation_();
    const mask = this.createAutoplayMask_();
    this.vsync_.mutate(() => {
      this.video.element.appendChild(animation);
      this.video.element.appendChild(mask);
    });

    // Listen to pause, play and user interaction events.
    const unlistenInteraction = listen(mask, 'click', onInteraction.bind(this));

    const unlistenPause = listen(this.video.element, VideoEvents.PAUSE,
        toggleAnimation.bind(this, /*playing*/ false));

    const unlistenPlaying = listen(this.video.element, VideoEvents.PLAYING,
        toggleAnimation.bind(this, /*playing*/ true));

    function onInteraction() {
      this.userInteractedWithAutoPlay_ = true;
      this.video.showControls();
      this.video.unmute();
      unlistenInteraction();
      unlistenPause();
      unlistenPlaying();
      removeElement(animation);
      removeElement(mask);
    }
  }

  /**
   * Called when visibility of a loaded autoplay video changes.
   * @private
   */
  autoplayLoadedVideoVisibilityChanged_() {
    if (this.isVisible_) {
      this.visibilitySessionManager_.beginSession();
      this.video.play(/*autoplay*/ true);
      this.playCalledByAutoplay_ = true;
    } else {
      if (this.isPlaying_) {
        this.visibilitySessionManager_.endSession();
      }
      this.video.pause();
      this.pauseCalledByAutoplay_ = true;
    }
  }

  /**
   * Called when visibility of a loaded non-autoplay video changes.
   * @private
   */
  nonAutoplayLoadedVideoVisibilityChanged_() {
    if (this.isVisible_) {
      this.visibilitySessionManager_.beginSession();
    } else if (this.isPlaying_) {
      this.visibilitySessionManager_.endSession();
    }
  }

  /* Docking Behaviour */

  /**
   * Called when a dockable video is built.
   * @private
   */
  dockableVideoBuilt_() {
    this.vsync_.run({
      measure: () => {
        this.initialRect_ = this.video.element.getLayoutBox();
      },
      mutate: () => {
        this.video.element.classList.add('i-amphtml-dockable-video');
      },
    });

    // TODO(@wassgha) Add video element wrapper here
  }

  /**
   * Maps the visible height of the video (viewport height scrolled) to a value
   * in a specified number range
   * @param {number} min the lower bound of the range
   * @param {number} max the upper bound of the range
   * @param {boolean} reverse whether the mapping is proportional or inversely
   * proportional to the viewport height scrolled
   * @private
   */
  scrollMap_(min, max, reverse = false) {
    if (reverse) {
      return mapRange(this.dockVisibleHeight_,
          this.initialRect_.height, 0,
          min, max);
    } else {
      return mapRange(this.dockVisibleHeight_,
          0, this.initialRect_.height,
          min, max);
    }
  }

  /**
   * Re-initialize measurements of the video element when the viewport is
   * resized or the orientation is changed.
   */
  updateDockableInitialRect() {
    this.vsync_.run({
      measure: () => {
        this.initialRect_ = this.video.element.getLayoutBox();
      },
      mutate: () => {
        this.dockState_ = DockStates.INLINE;
        if (this.dockLastPosition_) {
          this.onDockableVideoPositionChanged(this.dockLastPosition_);
        }
      },
    });
  }

  /**
   * Called when the video's position in the viewport changed (at most once per
   * animation frame)
   * @param {PositionInViewportEntryDef} newPos
   */
  onDockableVideoPositionChanged(newPos) {
    this.vsync_.run({
      measure: () => {
        this.updateDockableVideoPosition_(newPos);
      },
      mutate: () => {
        // Short-circuit the position change handler if the video isn't loaded yet
        // or is not playing manually while in-line (paused videos need to go
        // through if they are docked since this method handles the "undocking"
        // animation)
        if (!this.loaded_
          || !this.initialRect_
          || !this.internalElement_
          || (this.getPlayingState() != PlayingStates.PLAYING_MANUAL
                  && !this.internalElement_.classList.contains(DOCK_CLASS))
        ) {
          return;
        }

        // During the docking transition we either perform the docking or undocking
        // scroll-bound animations
        //
        // Conditions for animating the video are:
        // 1. The video is out of view and it has been in-view at least once before
        const outOfView = (this.dockPosition_ != DockPositions.INLINE)
                          && this.dockPreviouslyInView_;
        // 2. Is either manually playing or paused while docked (so that it is
        // undocked even when paused)
        const manPlaying =
                         this.getPlayingState() == PlayingStates.PLAYING_MANUAL;
        const paused = this.getPlayingState() == PlayingStates.PAUSED;
        const docked = this.internalElement_.classList.contains(DOCK_CLASS);

        if (outOfView && (manPlaying || (paused && docked))) {
          // On the first time, we initialize the docking animation
          if (this.dockState_ == DockStates.INLINE
              && this.manager_.canDock(this)) {
            this.initializeDocking_();
          }
          // Then we animate docking or undocking
          if (this.dockState_ != DockStates.INLINE) {
            this.animateDocking_();
          }
        } else if (docked) {
          // Here undocking animations are done so we restore the element
          // inline by clearing all styles and removing the position:fixed
          this.finishDocking_();
        }
      },
    });
  }

  /**
   * Updates the minimization position of the video (in viewport, above or
   * below viewport), also the height of the part of the video that is
   * currently in the viewport (between 0 and the initial video height).
   * @param {PositionInViewportEntryDef} newPos
   * @private
   */
  updateDockableVideoPosition_(newPos) {
    const viewport = Services.viewportForDoc(this.ampdoc_);
    const isBottom = newPos.relativePos == RelativePositions.BOTTOM;
    const isTop = newPos.relativePos == RelativePositions.TOP;
    const isInside = newPos.relativePos == RelativePositions.INSIDE;

    // Record last position in case we need to redraw (ex. on resize);
    this.dockLastPosition_ = newPos;

    // If the video is out of view, newPos.positionRect will be null so we can
    // fake the position to be right above or below the viewport based on the
    // relativePos field
    if (!newPos.positionRect) {
      newPos.positionRect = isBottom ?
        // A fake rectangle with same width/height as the video, except it's
        // position right below the viewport
        layoutRectLtwh(
            this.initialRect_.left,
            viewport.getHeight(),
            this.initialRect_.width,
            this.initialRect_.height
        ) :
        // A fake rectangle with same width/height as the video, except it's
        // position right above the viewport
        layoutRectLtwh(
            this.initialRect_.left,
            -this.initialRect_.height,
            this.initialRect_.width,
            this.initialRect_.height
        );
    }

    const docViewTop = newPos.viewportRect.top;
    const docViewBottom = newPos.viewportRect.bottom;
    const elemTop = newPos.positionRect.top;
    const elemBottom = newPos.positionRect.bottom;

    // Calculate height currently displayed
    if (elemTop <= docViewTop) {
      this.dockVisibleHeight_ = elemBottom - docViewTop;
    } else if (elemBottom >= docViewBottom) {
      this.dockVisibleHeight_ = docViewBottom - elemTop;
    } else {
      this.dockVisibleHeight_ = elemBottom - elemTop;
    }

    // Calculate whether the video has been in view at least once
    this.dockPreviouslyInView_ = this.dockPreviouslyInView_ ||
                Math.ceil(this.dockVisibleHeight_) >= this.initialRect_.height;

    // Calculate space on top and bottom of the video to see if it is possible
    // for the video to become hidden by scrolling to the top/bottom
    const spaceOnTop = this.video.element./*OK*/offsetTop;
    const spaceOnBottom = viewport.getScrollHeight()
                         - spaceOnTop
                         - this.video.element./*OK*/offsetHeight;
    // Don't minimize if video can never be hidden by scrolling to top/bottom
    if ((isBottom && spaceOnTop < viewport.getHeight())
        || (isTop && spaceOnBottom < viewport.getHeight())) {
      this.dockPosition_ = DockPositions.INLINE;
      return;
    }

    // Don't minimize if the video is bigger than the viewport (will always
    // minimize and never be inline otherwise!)
    if (this.video.element./*OK*/offsetHeight >= viewport.getHeight()) {
      this.dockPosition_ = DockPositions.INLINE;
      return;
    }

    const doc = this.ampdoc_.win.document;

    // Calculate where the video should be docked if it hasn't been dragged
    if (this.dockPosition_ == DockPositions.INLINE && !isInside) {
      if (isTop) {
        this.dockPosition_ = isRTL(doc) ? DockPositions.TOP_LEFT
                                       : DockPositions.TOP_RIGHT;
      } else if (isBottom) {
        this.dockPosition_ = isRTL(doc) ? DockPositions.BOTTOM_LEFT
                                       : DockPositions.BOTTOM_RIGHT;
      }
    } else if (isInside) {
      this.dockPosition_ = DockPositions.INLINE;
    } else {
      // The inline video is outside but the minimizePosition has been set, this
      // means the position was manually changed by drag/drop, keep it as is.
    }
  }

  /**
   * Set the initial width and hight when the video is docking
   * so that we scale relative to the initial video's dimensions
   * @private
   */
  initializeDocking_() {
    this.internalElement_.classList.add(DOCK_CLASS);
    st.setStyles(dev().assertElement(this.internalElement_), {
      'height': st.px(this.initialRect_.height),
      'width': st.px(this.initialRect_.width),
      'maxWidth': st.px(this.initialRect_.width),
    });
    this.dockState_ = DockStates.DOCKING;
    this.manager_.registerDocked(this);
  }

  /**
   * Performs scroll-bound animations on the video as it is being scrolled
   * out of the viewport
   * @private
   */
  animateDocking_() {
    // Calculate offsetXLeft
    const offsetXLeft = this.calcDockOffsetXLeft_();
    // Calculate offsetXRight
    const offsetXRight = this.calcDockOffsetXRight_();
    // Calculate offsetYTop
    const offsetYTop = this.calcDockOffsetYTop_();
    // Calculate offsetYBottom
    const offsetYBottom = this.calcDockOffsetYBottom_();

    // Calculate translate
    let translate;
    switch (this.dockPosition_) {
      case DockPositions.TOP_LEFT:
        translate = st.translate(offsetXLeft, offsetYTop);
        break;
      case DockPositions.TOP_RIGHT:
        translate = st.translate(offsetXRight, offsetYTop);
        break;
      case DockPositions.BOTTOM_LEFT:
        translate = st.translate(offsetXLeft, offsetYBottom);
        break;
      case DockPositions.BOTTOM_RIGHT:
        translate = st.translate(offsetXRight, offsetYBottom);
        break;
      default:
    }

    const scale = st.scale(this.scrollMap_(DOCK_SCALE, 1));
    const transform = translate + ' ' + scale;

    st.setStyles(dev().assertElement(this.internalElement_), {
      'transform': transform,
      'transformOrigin': 'top left',
      'bottom': 'auto',
      'top': '0px',
      'right': 'auto',
      'left': '0px',
    });

    // Update docking state
    if (this.scrollMap_(DOCK_SCALE, 1) == DOCK_SCALE) {
      this.dockState_ = DockStates.DOCKED;
    } else {
      this.dockState_ = DockStates.DOCKING;
    }

    // TODO(@wassim) Make minimized video draggable
  }

  /**
   * Restores styling of the video to make it go back to its original inline
   * position.
   *
   * @private
   */
  finishDocking_() {
    // Restore the video inline
    this.internalElement_.classList.remove(DOCK_CLASS);
    this.internalElement_.setAttribute('style', '');
    this.dockState_ = DockStates.INLINE;
    this.manager_.unregisterDocked();
  }

  /**
   * Calculates the x-axis offset when the video is docked to the left
   * @private
   * @return {string}
   */
  calcDockOffsetXLeft_() {
    return st.px(this.scrollMap_(this.initialRect_.left, DOCK_MARGIN, true));
  }

  /**
   * Calculates the x-axis offset when the video is docked to the right
   * @private
   * @return {string}
   */
  calcDockOffsetXRight_() {
    const viewport = Services.viewportForDoc(this.ampdoc_);
    const initialOffsetRight = viewport.getWidth()
                        - this.initialRect_.left
                        - this.initialRect_.width;
    const scaledWidth = DOCK_SCALE * this.initialRect_.width;
    return st.px(
        this.scrollMap_(
            viewport.getWidth() - this.initialRect_.width - initialOffsetRight,
            viewport.getWidth() - scaledWidth - DOCK_MARGIN,
            true
        )
    );
  }

  /**
   * Calculates the y-axis offset when the video is docked to the top
   * @private
   * @return {string}
   */
  calcDockOffsetYTop_() {
    return st.px(this.scrollMap_(0, DOCK_MARGIN, true));
  }

  /**
   * Calculates the y-axis offset when the video is docked to the bottom
   * @private
   * @return {string}
   */
  calcDockOffsetYBottom_() {
    const viewport = Services.viewportForDoc(this.ampdoc_);
    const scaledHeight = DOCK_SCALE * this.initialRect_.height;
    return st.px(
        this.scrollMap_(
            viewport.getHeight() - this.initialRect_.height,
            viewport.getHeight() - scaledHeight - DOCK_MARGIN,
            true
        )
    );
  }

  /**
   * Creates a pure CSS animated equalizer icon.
   * @private
   * @return {!Element}
   */
  createAutoplayAnimation_() {
    const doc = this.ampdoc_.win.document;
    const anim = doc.createElement('i-amphtml-video-eq');
    anim.classList.add('amp-video-eq');
    // Four columns for the equalizer.
    for (let i = 1; i <= 4; i++) {
      const column = doc.createElement('div');
      column.classList.add('amp-video-eq-col');
      // Two overlapping filler divs that animate at different rates creating
      // randomness illusion.
      for (let j = 1; j <= 2; j++) {
        const filler = doc.createElement('div');
        filler.classList.add(`amp-video-eq-${i}-${j}`);
        column.appendChild(filler);
      }
      anim.appendChild(column);
    }
    const platform = Services.platformFor(this.ampdoc_.win);
    if (platform.isIos()) {
      // iOS can not pause hardware accelerated animations.
      anim.setAttribute('unpausable', '');
    }
    return anim;
  }

  /**
   * Creates a mask to overlay on top of an autoplay video to detect the first
   * user tap.
   * We have to do this since many players are iframe-based and we can not get
   * the click event from the iframe.
   * We also can not rely on hacks such as constantly checking doc.activeElement
   * to know if user has tapped on the iframe since they won't be a trusted
   * event that would allow us to unmuted the video as only trusted
   * user-initiated events can be used to interact with the video.
   * @private
   * @return {!Element}
   */
  createAutoplayMask_() {
    const doc = this.ampdoc_.win.document;
    const mask = doc.createElement('i-amphtml-video-mask');
    mask.classList.add('i-amphtml-fill-content');
    return mask;
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
      // Calculate what percentage of the video is in viewport.
      const change = this.video.element.getIntersectionChangeEntry();
      const visiblePercent = !isFiniteNumber(change.intersectionRatio) ? 0
          : change.intersectionRatio * 100;
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


  /**
   * Returns whether the video is paused or playing after the user interacted
   * with it or playing through autoplay
   * @return {!../video-interface.VideoInterface} PlayingStates
   */
  getPlayingState() {
    if (!this.isPlaying_) {
      return PlayingStates.PAUSED;
    }

    if (this.isPlaying_
       && this.playCalledByAutoplay_
       && !this.userInteractedWithAutoPlay_) {
      return PlayingStates.PLAYING_AUTO;
    }

    return PlayingStates.PLAYING_MANUAL;
  }

  /**
   * Returns whether the video was interacted with or not
   * @return {boolean}
   */
  userInteractedWithAutoPlay() {
    return this.userInteractedWithAutoPlay_;
  }


  /**
   * Collects a snapshot of the current video state for video analytics
   * @return {!Promise<!../video-interface.VideoAnalyticsDetailsDef>}
   */
  getAnalyticsDetails() {
    const video = this.video;
    return this.boundSupportsAutoplay_().then(supportsAutoplay => {
      const {width, height} = this.video.element.getLayoutBox();
      const autoplay = this.hasAutoplay && supportsAutoplay;
      const playedRanges = video.getPlayedRanges();
      const playedTotal = playedRanges.reduce(
          (acc, range) => acc + range[1] - range[0], 0);

      return {
        'autoplay': autoplay,
        'currentTime': video.getCurrentTime(),
        'duration': video.getDuration(),
        // TODO(cvializ): add fullscreen
        'height': height,
        'id': video.element.id,
        'muted': this.muted_,
        'playedTotal': playedTotal,
        'playedRangesJson': JSON.stringify(playedRanges),
        'state': this.getPlayingState(),
        'width': width,
      };
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
 * @param {!Window} win
 * @param {boolean} isLiteViewer
 * @return {!Promise<boolean>}
 */
export function supportsAutoplay(win, isLiteViewer) {

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
  const detectionElement = win.document.createElement('video');
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

  try {
    const playPromise = detectionElement.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {
        // Suppress any errors, useless to report as they are expected.
      });
    }
  } catch (e) {
    // Suppress any errors, useless to report as they are expected.
  }

  const supportsAutoplay = !detectionElement.paused;
  return supportsAutoplayCache_ = Promise.resolve(supportsAutoplay);
}

/**
 * @param {!VideoEntry} entry
 * @param {!VideoAnalyticsEvents} eventType
 * @param {!Object<string, string>=} opt_vars A map of vars and their values.
 * @private
 */
function analyticsEvent(entry, eventType, opt_vars) {
  const video = entry.video;
  const detailsPromise = opt_vars ? Promise.resolve(opt_vars) :
      entry.getAnalyticsDetails();

  detailsPromise.then(details => {
    video.element.dispatchCustomEvent(
        eventType, details);
  });
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
 * @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc
 */
export function installVideoManagerForDoc(nodeOrDoc) {
  registerServiceBuilderForDoc(nodeOrDoc, 'video-manager', VideoManager);
};
