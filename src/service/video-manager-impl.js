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
import {removeElement} from '../dom.js';
import {listen, listenOncePromise} from '../event-helper';
import {dev} from '../log';
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
    video.registerAction('play', video.play.bind(video, /* isAutoplay */ false),
        ActionTrust.HIGH);
    video.registerAction('pause', video.pause.bind(video), ActionTrust.LOW);
    video.registerAction('mute', video.mute.bind(video), ActionTrust.LOW);
    video.registerAction('unmute', video.unmute.bind(video),
        ActionTrust.HIGH);
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
    // TODO(aghassemi): Remove this later. For now, the visibility observer
    // only matters for autoplay videos so no point in monitoring arbitrary
    // videos yet.
    if (!entry.hasAutoplay) {
      return;
    }

    listen(entry.video.element, VideoEvents.VISIBILITY, () => {
      entry.updateVisibility();
    });

    listen(entry.video.element, VideoEvents.RELOAD, () => {
      entry.videoLoaded_();
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
          entry.onDockableVideoPositionChanged_(newPos);
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

    /** @private @const {function(): !Promise<boolean>} */
    this.boundSupportsAutoplay_ = supportsAutoplay.bind(null, ampdoc.win,
        getMode(ampdoc.win).lite);

    const element = dev().assert(video.element);

    /** @private {boolean} */
    this.userInteractedWithAutoPlay_ = false;

    /** @private {boolean} */
    this.playCalledByAutoplay_ = false;

    /** @private {number} */
    this.initialWidth_ = 0;

    /** @private {number} */
    this.initialHeight_ = 0;

    /** @private {number} */
    this.initialLeft_ = 0;

    /** @private {number} */
    this.minimizePosition_ = MinimizePositions.DEFAULT;

    /** @private {?Element} */
    this.internalElement_ = null;

    /** @private {Object} */
    this.internalStyle_ = null;

    /** @private {Object} */
    this.internalClasses_ = null;

    this.hasDocking = element.hasAttribute(VideoAttributes.DOCK);

    this.hasAutoplay = element.hasAttribute(VideoAttributes.AUTOPLAY);

    listenOncePromise(element, VideoEvents.LOAD)
        .then(() => this.videoLoaded_());

    listen(this.video.element, VideoEvents.PAUSE, this.videoPaused_.bind(this));

    listen(this.video.element, VideoEvents.PLAY, this.videoPlayed_.bind(this));

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
  }

  /**
  * Callback for when the video has been paused
   * @private
   */
  videoPaused_() {
    this.isPlaying_ = false;
  }

  /**
   * Called when the video is loaded and can play.
   * @private
   */
  videoLoaded_() {
    this.loaded_ = true;

    // Get the internal element (the actual video/iframe)
    this.internalElement_ = scopedQuerySelector(
        this.video.element,
        'video, iframe'
    );
    // Get its style and classlist
    this.internalStyle_ = this.internalElement_.style;
    this.internalClasses_ = this.internalElement_.classList;

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
    }
  }

  /* Docking Behaviour */

  /**
   * Called when a dockable video is built.
   * @private
   */
  dockableVideoBuilt_() {
    this.video.element.classList.add('i-amphtml-dockable-video');

    const vidRect = this.video.element./*OK*/getBoundingClientRect();

    this.initialWidth_ = vidRect.width;
    this.initialHeight_ = vidRect.height;
    this.initialLeft_ = vidRect.left;

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
        this.video.play(/*autoplay*/ true);
        this.playCalledByAutoplay_ = true;
      } else {
        this.video.pause();
      }
    });
  }

  /**
   * Called when the video's position in the viewport changed (at most once per
   * animation frame)
   * @param {PositionInViewportEntryDef} newPos
   * @private
   */
  onDockableVideoPositionChanged_(newPos) {


    const inViewportHeight = this.calculateDockableVideoPosition_(newPos);

    // Short-circuit the position change handler if the video isn't loaded yet
    // or is not playing manually while in-line (paused videos need to go
    // through if they are docked since this method handles the "undocking"
    // animation)
    if (!this.loaded_
      || !this.internalElement_
      || (
        this.getPlayingState() != PlayingStates.PLAYING_MANUAL
        && !this.internalElement_.classList.contains(DOCK_CLASS)
      )
    ) {
      return;
    }

    // Temporary fix until PositionObserver somehow tracks objects outside of
    // the viewport
    if (inViewportHeight == 0
       && this.getPlayingState() == PlayingStates.PLAYING_MANUAL
       && this.minimizePosition_ != MinimizePositions.DEFAULT) {
      this.endDocking_();
      return;
    }

    if (
      // Minimize the video if it's out of view and it has been viewed
      // at least once before
      this.minimizePosition_ != MinimizePositions.INVIEW
      && this.minimizePosition_ != MinimizePositions.DEFAULT
      && (
          // Only minimize manually playing videos
          this.getPlayingState() == PlayingStates.PLAYING_MANUAL
          || (
              // .. and paused videos except when the video is about to be
              // reverted to its inline position
              this.getPlayingState() == PlayingStates.PAUSED
              && this.internalElement_.classList.contains(DOCK_CLASS)
             )
        )
      )
    {

      this.animateDocking_(inViewportHeight);

    } else if (this.minimizePosition_ == MinimizePositions.INVIEW) {

      this.unDockVideo_();

    }

    // Set the initial width and hight when the video is docking
    // so that we scale relative to the initial video's dimensions
    if (this.minimizePosition_ != MinimizePositions.INVIEW) {
      this.internalStyle_.height = this.initialHeight_ + 'px';
      this.internalStyle_.width = this.initialWidth_ + 'px';
      this.internalStyle_.maxWidth = this.initialWidth_ + 'px';
    }
  }

  /**
   * Updates the minimization position of the video (in viewport, above or
   * below viewport) and returns the height of the part of the video that is
   * currently in the viewport (between 0 and the initial video height).
   * @param {PositionInViewportEntryDef} newPos
   * @private
   * @return {number}
   */
  calculateDockableVideoPosition_(newPos) {

    let inViewportHeight = 0;

    if (newPos.positionRect) {

      const docViewTop = newPos.viewportRect.top;
      const docViewBottom = newPos.viewportRect.bottom;

      const elemTop = newPos.positionRect.top;
      const elemBottom = newPos.positionRect.bottom;

      // Calculate height currently displayed
      if (elemTop <= docViewTop) {
        inViewportHeight = elemBottom - docViewTop;
        this.minimizePosition_ = MinimizePositions.TOP;
      } else if (elemBottom >= docViewBottom) {
        inViewportHeight = docViewBottom - elemTop;
        this.minimizePosition_ = MinimizePositions.BOTTOM;
      } else {
        this.minimizePosition_ = MinimizePositions.INVIEW;
        inViewportHeight = elemBottom - elemTop;
      }
    }

    return inViewportHeight;
  }

  /**
   * Performs scroll-bound animations on the video as it is being scrolled
   * out of the viewport
   * @param {number} inViewportHeight calculated currently visible video height
   * @private
   */
  animateDocking_(inViewportHeight) {
    // Minimize the video

    this.video.hideControls();
    this.internalClasses_.add(DOCK_CLASS);
    this.internalStyle_.transform = 'scale(' + mapRange(inViewportHeight,
        0, this.initialHeight_,
        DOCK_SCALE, 1
    ) + ')';
    this.internalStyle_.borderRadius = mapRange(inViewportHeight,
        this.initialHeight_, 0,
        0, 6
    ) + 'px';
    // Shadow position
    const sPos = '0px 0px 20px 0px';
    // Shadow color
    const sCol = '0, 0, 0'; // rgb black
    // Shadow opacity
    const sOpac = mapRange(inViewportHeight,
        this.initialHeight_, 0,
        0, 0.3
    );
    this.internalStyle_.boxShadow = sPos + ' rgba(' + sCol + ',' + sOpac + ')';
    this.internalStyle_.left = mapRange(inViewportHeight,
        this.initialHeight_, 0,
        this.initialLeft_, 20
    ) + 'px';

    // Different behavior based on whether the video got minimized
    // from the top or the bottom
    if (this.minimizePosition_ == MinimizePositions.TOP) {

      this.internalStyle_.top = mapRange(inViewportHeight,
          this.initialHeight_, 0,
          0, 20
      ) + 'px';
      this.internalStyle_.bottom = 'auto';
      this.internalStyle_.transformOrigin = 'top left';

    } else {

      // Revert back to inline viewing

      this.internalStyle_.bottom = mapRange(inViewportHeight,
          this.initialHeight_, 0,
          0, 20
      ) + 'px';
      this.internalStyle_.top = 'auto';
      this.internalStyle_.transformOrigin = 'bottom left';
    }

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
    this.internalClasses_.add(DOCK_CLASS);
    this.internalStyle_.transform = 'scale(' + DOCK_SCALE + ')';
    this.internalStyle_.borderRadius = '6px';
    this.internalStyle_.left = '20px';
    this.internalStyle_.boxShadow = '0px 0px 20px 0px rgba(0, 0, 0, 0.3)';
    if (this.minimizePosition_ == MinimizePositions.BOTTOM) {
      this.minimizePosition_ = MinimizePositions.TOP;
      this.internalStyle_.bottom = '20px';
      this.internalStyle_.top = 'auto';
      this.internalStyle_.transformOrigin = 'bottom left';
    } else {
      this.minimizePosition_ = MinimizePositions.BOTTOM;
      this.internalStyle_.top = '20px';
      this.internalStyle_.bottom = 'auto';
      this.internalStyle_.transformOrigin = 'top left';
    }
  }

  /**
   * Restores styling of the video to make it go back to its original inline
   * position.
   *
   * @private
   */
  unDockVideo_() {
    // Restore the video inline
    this.internalClasses_.remove(DOCK_CLASS);
    this.internalElement_.setAttribute('style', '');
    if (!this.hasAutoplay || this.userInteractedWithAutoPlay_) {
      this.video.showControls();
    }
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
   * Returns whether the video was interacted with or not
   * @return {boolean}
   */
  userInteractedWithAutoPlay() {
    return this.userInteractedWithAutoPlay_;
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
