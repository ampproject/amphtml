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
import {removeElement} from '../dom.js';
import {listen, listenOncePromise} from '../event-helper';
import {dev} from '../log';
import {dict} from '../utils/object';
import {getMode} from '../mode';
import {registerServiceBuilderForDoc, getServiceForDoc} from '../service';
import {setStyles} from '../style';
import {isFiniteNumber} from '../types';
import {mapRange} from '../utils/math';
import {VideoEvents, VideoAttributes} from '../video-interface';
import {
  viewerForDoc,
  viewportForDoc,
  vsyncFor,
  platformFor,
} from '../services';
import {
  installPositionObserverServiceForDoc,
  PositionObserverFidelity,
  PositionInViewportEntryDef,
} from './position-observer-impl';
import {
  scopedQuerySelector,
} from '../dom';
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


/**
 * Playing States
 *
 * Internal playing states used to distinguish between video playing on user's
 * command and videos playing automatically
 *
 * @constant {!Object<string, string>}
 */
export const PlayingStates = {
  /**
   * playing_manual
   *
   * When the video user manually interacted with the video and the video
   * is now playing
   *
   * @event playing_manual
   */
  PLAYING_MANUAL: 'playing_manual',

  /**
   * playing_auto
   *
   * When the video has autoplay and the user hasn't interacted with it yet
   *
   * @event playing_auto
   */
  PLAYING_AUTO: 'playing_auto',

  /**
   * paused
   *
   * When the video is paused.
   *
   * @event paused
   */
  PAUSED: 'paused',
};

/**
* Minimization Positions
*
* Internal states used to describe whether the video is inside the viewport
* or minimizing starting from the bottom or minimizing starting from the top
*
* @enum {number}
*/
export const MinimizePositions = {
  DEFAULT: -1,
  INVIEW: 0,
  TOP: 1,
  BOTTOM: 2,
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

    /** @private @const {!./ampdoc-impl.AmpDoc}  */
    this.ampdoc_ = ampdoc;

    /** @private {?Array<!VideoEntry>} */
    this.entries_ = null;

    /** @private {boolean} */
    this.scrollListenerInstalled_ = false;

    /** @private {./position-observer-impl.AmpDocPositionObserver} */
    this.positionObserver_ = null;
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
    const entry = new VideoEntry(this.ampdoc_, video);
    this.maybeInstallVisibilityObserver_(entry);
    this.maybeInstallPositionObserver_(entry);
    this.entries_.push(entry);
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
      const viewport = viewportForDoc(this.ampdoc_);
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
      installPositionObserverServiceForDoc(this.ampdoc_);
      this.positionObserver_ = getServiceForDoc(
          this.ampdoc_,
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

    /** @private {?Element} */
    this.autoplayAnimation_ = null;

    /** @private {boolean} */
    this.loaded_ = false;

    /** @private {boolean} */
    this.isPlaying_ = false;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private @const {!../service/vsync-impl.Vsync} */
    this.vsync_ = vsyncFor(ampdoc.win);

    /** @private @const */
    this.actionSessionManager_ = new VideoSessionManager();

    this.actionSessionManager_.onSessionEnd(
        () => this.analyticsEvent_('video-session'));

    /** @private @const */
    this.visibilitySessionManager_ = new VideoSessionManager();

    this.visibilitySessionManager_.onSessionEnd(
        () => this.analyticsEvent_('video-session-visible'));

    /** @private @const {function(): !Promise<boolean>} */
    this.boundSupportsAutoplay_ = supportsAutoplay.bind(null, ampdoc.win,
        getMode(ampdoc.win).lite);

    const element = dev().assert(video.element);

    /** @private {boolean} */
    this.userInteractedWithAutoPlay_ = false;

    /** @private {boolean} */
    this.playCalledByAutoplay_ = false;

    /** @private {Object} */
    this.initialRect_ = null;

    /** @private {number} */
    this.minimizePosition_ = MinimizePositions.DEFAULT;

    /** @private {number} */
    this.inViewportHeight_ = 0;

    /** @private {?Element} */
    this.internalElement_ = null;

    this.hasDocking = element.hasAttribute(VideoAttributes.DOCK);

    this.hasAutoplay = element.hasAttribute(VideoAttributes.AUTOPLAY);

    listenOncePromise(element, VideoEvents.LOAD)
        .then(() => this.videoLoaded());


    listen(element, VideoEvents.PAUSE, () => this.videoPaused_());
    listen(element, VideoEvents.PLAY, () => this.videoPlayed_());
    // TODO(cvializ): understand why capture needs to be true for ended : /
    listen(element, VideoEvents.ENDED, () => this.videoEnded_(),
        /* opt_capture */ true);

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
    this.analyticsEvent_('video-play');
  }

  /**
  * Callback for when the video has been paused
   * @private
   */
  videoPaused_() {
    const previousState = this.getPlayingState();
    const trackingVideo = assertTrackingVideo_(this.video);
    if (trackingVideo &&
        trackingVideo.getCurrentTime() !== trackingVideo.getDuration()) {
      this.analyticsEvent_('video-pause');
    }
    this.isPlaying_ = false;

    // Don't trigger session end for autoplay pauses, since session end
    // is already covered for autoplay in the visibility tracking
    if (previousState !== PlayingStates.PLAYING_AUTO) {
      this.actionSessionManager_.endSession();
    }
  }

  /**
   * Callback for when the video ends
   * @private
   */
  videoEnded_() {
    this.isPlaying_ = false;
    this.analyticsEvent_('video-ended');
    this.actionSessionManager_.endSession();
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
    if (this.hasAutoplay) {
      this.autoplayLoadedVideoVisibilityChanged_();
    } else {
      this.nonAutoplayLoadedVideoVisibilityChanged_();
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
        this.initialRect_ = this.video.element./*OK*/getBoundingClientRect();
      },
      mutate: () => {
        this.video.element.classList.add('i-amphtml-dockable-video');
      },
    });

    // TODO(@wassgha) Add video element wrapper here
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

    const unlistenPlay = listen(this.video.element, VideoEvents.PLAY,
        toggleAnimation.bind(this, /*playing*/ true));

    function onInteraction() {
      this.userInteractedWithAutoPlay_ = true;
      this.video.showControls();
      this.video.unmute();
      unlistenInteraction();
      unlistenPause();
      unlistenPlay();
      removeElement(animation);
      removeElement(mask);
    }
  }

  /**
   * Called when visibility of a loaded autoplay video changes.
   * @private
   */
  autoplayLoadedVideoVisibilityChanged_() {
    if (this.userInteractedWithAutoPlay_
       || !viewerForDoc(this.ampdoc_).isVisible()) {
      return;
    }

    this.boundSupportsAutoplay_().then(supportsAutoplay => {
      if (!supportsAutoplay) {
        return;
      }

      if (this.isVisible_) {
        this.visibilitySessionManager_.beginSession();
        this.video.play(/*autoplay*/ true);
        this.playCalledByAutoplay_ = true;
      } else {
        if (this.isPlaying_) {
          this.visibilitySessionManager_.endSession();
        }
        this.video.pause();
      }
    });
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
      return mapRange(this.inViewportHeight_,
          this.initialRect_.height, 0,
          min, max);
    } else {
      return mapRange(this.inViewportHeight_,
          0, this.initialRect_.height,
          min, max);
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

  /**
   * Called when the video's position in the viewport changed (at most once per
   * animation frame)
   * @param {PositionInViewportEntryDef} newPos
   */
  onDockableVideoPositionChanged(newPos) {
    this.updateDockableVideoPosition_(newPos);

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

    // Initialize docking width/height
    if (this.minimizePosition_ != MinimizePositions.INVIEW) {
      this.vsync_.mutate(() => {
        this.startDocking_();
      });
    }

    // Temporary fix until PositionObserver somehow tracks objects outside of
    // the viewport (forces the style to be what we want in the final state)
    if (this.inViewportHeight_ == 0
       && this.getPlayingState() == PlayingStates.PLAYING_MANUAL
       && this.minimizePosition_ != MinimizePositions.DEFAULT) {
      this.vsync_.mutate(() => {
        this.endDocking_();
      });
      return;
    }

    // During the docking transition we either perform the docking or undocking
    // scroll-bound animations
    //
    // Conditions for animating the video are:
    // 1. The video is out of view and it has been in-view at least once before
    const outOfView = this.minimizePosition_ != MinimizePositions.INVIEW
                      && this.minimizePosition_ != MinimizePositions.DEFAULT;
    // 2. Is either manually playing or paused while docked (so that it is
    // undocked even when paused)
    const manPlaying = (this.getPlayingState() == PlayingStates.PLAYING_MANUAL);
    const paused = this.getPlayingState() == PlayingStates.PAUSED;
    const docked = this.internalElement_.classList.contains(DOCK_CLASS);

    if (outOfView && (manPlaying || (paused && docked))) {
      // We animate docking or undocking
      this.vsync_.mutate(() => {
        this.animateDocking_();
      });
    } else if (this.minimizePosition_ == MinimizePositions.INVIEW) {
      // Here undocking animations are done so we restore the element
      // inline by clearing all styles and removing the position:fixed
      this.vsync_.mutate(() => {
        this.unDockVideo_();
      });
    }
  }

  /**
   * Updates the minimization position of the video (in viewport, above or
   * below viewport), also the height of the part of the video that is
   * currently in the viewport (between 0 and the initial video height).
   * @param {PositionInViewportEntryDef} newPos
   * @private
   */
  updateDockableVideoPosition_(newPos) {
    if (newPos.positionRect) {

      const docViewTop = newPos.viewportRect.top;
      const docViewBottom = newPos.viewportRect.bottom;

      const elemTop = newPos.positionRect.top;
      const elemBottom = newPos.positionRect.bottom;

      // Calculate height currently displayed
      if (elemTop <= docViewTop) {
        this.inViewportHeight_ = elemBottom - docViewTop;
        this.minimizePosition_ = MinimizePositions.TOP;
      } else if (elemBottom >= docViewBottom) {
        this.inViewportHeight_ = docViewBottom - elemTop;
        this.minimizePosition_ = MinimizePositions.BOTTOM;
      } else {
        this.minimizePosition_ = MinimizePositions.INVIEW;
        this.inViewportHeight_ = elemBottom - elemTop;
      }
    } else {
      if (this.minimizePosition_ == MinimizePositions.INVIEW
        || this.minimizePosition_ == MinimizePositions.DEFAULT)
      {
        // Here we're just guessing, until #9208 is fixed
        // (until position observer returns more information when out of view )
        this.minimizePosition_ = MinimizePositions.TOP;
      }
      this.inViewportHeight_ = 0;
    }
  }

  /**
   * Set the initial width and hight when the video is docking
   * so that we scale relative to the initial video's dimensions
   * @private
   */
  startDocking_() {
    st.setStyles(dev().assertElement(this.internalElement_), {
      'height': st.px(this.initialRect_.height),
      'width': st.px(this.initialRect_.width),
      'maxWidth': st.px(this.initialRect_.width),
    });
  }

  /**
   * Performs scroll-bound animations on the video as it is being scrolled
   * out of the viewport
   * @private
   */
  animateDocking_() {
    // Minimize the video
    this.video.hideControls();
    this.internalElement_.classList.add(DOCK_CLASS);

    const isTop = this.minimizePosition_ == MinimizePositions.TOP;
    const offsetX = st.px(this.scrollMap_(this.initialRect_.left, 20, true));
    // Different behavior based on whether the video got minimized
    // from the top or the bottom
    const offsetY = st.px((isTop ? 1 : -1) * this.scrollMap_(0, 20, true));
    const transform = st.scale(this.scrollMap_(DOCK_SCALE, 1)) + ' '
                      + st.translate(offsetX, offsetY);

    st.setStyles(dev().assertElement(this.internalElement_), {
      'transform': transform,
      'transformOrigin': isTop ? 'top left' : 'bottom left',
      'bottom': isTop ? 'auto' : '0px',
      'top': isTop ? '0px' : 'auto',
    });

    // TODO(@wassim) Make minimized video draggable
  }

  /**
   * Applies final transformations to the docked video to assert that the final
   * position and scale of the docked video are correct (in case user scrolls
   * too fast for startDocking_ to kick in)
   *
   * NOTE(@wassgha) : won't be needed if PositionObserver returned the element's
   * position when it goes out of view.
   * @private
   */
  endDocking_() {
    // Hide the controls.
    this.video.hideControls();
    this.internalElement_.classList.add(DOCK_CLASS);

    const isTop = this.minimizePosition_ == MinimizePositions.TOP;
    if (isTop) {
      this.minimizePosition_ = MinimizePositions.BOTTOM;
    } else {
      this.minimizePosition_ = MinimizePositions.TOP;
    }

    const offsetX = st.px(20);
    // Different behavior based on whether the video got minimized
    // from the top or the bottom
    const offsetY = st.px((isTop ? 1 : -1) * 20);
    const transform = st.scale(DOCK_SCALE) + ' '
                      + st.translate(offsetX, offsetY);

    st.setStyles(dev().assertElement(this.internalElement_), {
      'transform': transform,
      'transformOrigin': isTop ? 'top left' : 'bottom left',
      'bottom': isTop ? 'auto' : '0px',
      'top': isTop ? '0px' : 'auto',
    });
  }

  /**
   * Restores styling of the video to make it go back to its original inline
   * position.
   *
   * @private
   */
  unDockVideo_() {
    // Restore the video inline
    this.internalElement_.classList.remove(DOCK_CLASS);
    this.internalElement_.setAttribute('style', '');
    this.video.showControls();
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
    const platform = platformFor(this.ampdoc_.win);
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
      if (!this.video.isInViewport()) {
        this.isVisible_ = false;
        return;
      }

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
   * Get the autoplay state distinct from paused by user and paused by
   * the video scrolling out of view.
   * @return {boolean}
   */
  isAutoplay() {
    return (this.getPlayingState() === PlayingStates.PLAYING_AUTO) ||
        (this.playCalledByAutoplay_ && !this.userInteractedWithAutoPlay_);
  }

  /**
   * Returns whether the video was interacted with or not
   * @return {boolean}
   */
  userInteractedWithAutoPlay() {
    return this.userInteractedWithAutoPlay_;
  }

  /**
   * @param {string} eventType
   * @param {!Object<string, string>=} opt_vars A map of vars and their values.
   * @private
   */
  analyticsEvent_(eventType, opt_vars) {
    const trackingVideo = assertTrackingVideo_(this.video);
    if (trackingVideo) {
      opt_vars = opt_vars || this.getAnalyticsData(trackingVideo);
      trackingVideo.element.dispatchCustomEvent('amp:video',
          {type: eventType, details: opt_vars});
    }
  }

  /**
   * Collects a snapshot of the current video state for video analytics
   * @param {!../video-interface.TrackingVideoInterface} video
   * @return {!JsonObject}
   */
  getAnalyticsData(video) {
    return dict({
      'id': video.getId(),
      'autoplay': this.isAutoplay(),
      'width': video.getWidth(),
      'height': video.getHeight(),
      'currentTime': video.getCurrentTime(),
      'duration': video.getDuration(),
      'muted': video.getMuted(),
      'paused': video.getPaused(),
      'ended': video.getEnded(),
      // TODO(cvializ): add fullscreen
    });
  }
}

/**
 * Asserts that a video is a tracking video
 * @param {!../video-interface.VideoInterface} video
 * @return {?../video-interface.TrackingVideoInterface}
 * @private
 */
function assertTrackingVideo_(video) {
  const trackingVideo =
      /** @type {?../video-interface.TrackingVideoInterface} */ (video);
  if (trackingVideo.isTrackingVideo && trackingVideo.isTrackingVideo()) {
    return /** @type {?../video-interface.TrackingVideoInterface} */ (video);
  } else {
    return null;
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
