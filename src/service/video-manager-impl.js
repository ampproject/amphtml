
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

import * as st from '../style';
import * as tr from '../transition';
import {ActionTrust} from '../action-trust';
import {Animation} from '../animation';
import {
  EMPTY_METADATA,
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
} from '../mediasession-helper';
import {
  PlayingStates,
  VideoAnalyticsEvents,
  VideoAttributes,
  VideoEvents,
} from '../video-interface';
import {
  PositionObserverFidelity,
} from './position-observer/position-observer-worker';
import {RelativePositions, layoutRectLtwh} from '../layout-rect';
import {Services} from '../services';
import {VideoSessionManager} from './video-session-manager';
import {
  createCustomEvent,
  getData,
  listen,
  listenOncePromise,
} from '../event-helper';
import {dev} from '../log';
import {getMode} from '../mode';
import {getServiceForDoc, registerServiceBuilderForDoc} from '../service';
import {
  installPositionObserverServiceForDoc,
} from './position-observer/position-observer-impl';
import {isFiniteNumber} from '../types';
import {isRTL, removeElement, scopedQuerySelector} from '../dom';
import {map} from '../utils/object';
import {mapRange} from '../utils/math';
import {setStyles} from '../style';
import {startsWith} from '../string.js';

const TAG = 'video-manager';

/**
 * @const {number} Percentage of the video that should be in viewport before it
 * is considered visible.
 */
const VISIBILITY_PERCENT = 75;

/**
 * @private {number} The minimum number of milliseconds to wait between each
 * video-seconds-played analytics event.
 */
const SECONDS_PLAYED_MIN_DELAY = 1000;

/**
 * @const {number} How much to scale the video by when minimized.
 */
const DOCK_SCALE = 0.6;
/**
 * @const {string} Docked video's class name as it is minimizing
 */
const DOCK_CLASS = 'i-amphtml-dockable-video-minimizing';
/**
 * @const {number} Margin to leave around a docked video
 */
const DOCK_MARGIN = 20;

/**
 * @const {number} Amount by which the velocity decreseases every frame
 */
const FRICTION_COEFF = 0.55;

/**
 * @const {number} Used to determine at which minmal velocity the element is
 * considered to have stopped moving
 */
const STOP_THRESHOLD = 3;

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
  DRAGGABLE: 'draggable',
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

    /** @private {!../service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);

    /** @private {?Array<!VideoEntry>} */
    this.entries_ = null;

    /** @private {boolean} */
    this.scrollListenerInstalled_ = false;

    /** @private {boolean} */
    this.resizeListenerInstalled_ = false;

    /** @private {./position-observer/position-observer-impl.PositionObserver} */
    this.positionObserver_ = null;

    /** @private {?VideoEntry} */
    this.dockedVideo_ = null;

    /** @private @const */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @private @const */
    this.actions_ = Services.actionServiceForDoc(ampdoc);

    /** @private @const */
    this.boundSecondsPlaying_ = () => this.secondsPlaying_();

    // TODO(cvializ, #10599): It would be nice to only create the timer
    // if video analytics are present, since the timer is not needed if
    // video analytics are not present.
    this.timer_.delay(this.boundSecondsPlaying_, SECONDS_PLAYED_MIN_DELAY);
  }

  /**
   * Each second, trigger video-seconds-played for videos that are playing
   * at trigger time.
   * @private
   */
  secondsPlaying_() {
    for (let i = 0; i < this.entries_.length; i++) {
      const entry = this.entries_[i];
      if (entry.getPlayingState() !== PlayingStates.PAUSED) {
        analyticsEvent(entry, VideoAnalyticsEvents.SECONDS_PLAYED);
        this.timeUpdateActionEvent_(entry);
      }
    }
    this.timer_.delay(this.boundSecondsPlaying_, SECONDS_PLAYED_MIN_DELAY);
  }

  /**
   * Triggers a LOW-TRUST timeupdate event consumable by AMP actions.
   * Frequency of this event is controlled by SECONDS_PLAYED_MIN_DELAY and is
   * every 1 second for now.
   * @private
   */
  timeUpdateActionEvent_(entry) {
    const name = 'timeUpdate';
    const currentTime = entry.video.getCurrentTime();
    const duration = entry.video.getDuration();
    if (isFiniteNumber(currentTime) &&
        isFiniteNumber(duration) &&
        duration > 0) {
      const perc = currentTime / duration;
      const event = createCustomEvent(this.ampdoc.win, `${TAG}.${name}`,
          {time: currentTime, percent: perc});
      this.actions_.trigger(entry.video.element, name, event, ActionTrust.LOW);
    }
  }

  /**
   * Registers a video component that implements the VideoInterface.
   * @param {!../video-interface.VideoInterface} video
   * @param {boolean=} manageAutoplay
   */
  register(video, manageAutoplay = true) {
    dev().assert(video);

    this.registerCommonActions_(video);

    if (!video.supportsPlatform()) {
      return;
    }

    this.entries_ = this.entries_ || [];
    const entry = new VideoEntry(this, video, manageAutoplay);
    this.maybeInstallVisibilityObserver_(entry);
    this.maybeInstallPositionObserver_(entry);
    this.maybeInstallOrientationObserver_(entry);
    this.entries_.push(entry);
    video.element.dispatchCustomEvent(VideoEvents.REGISTERED);
    // Add a class to element to indicate it implements the video interface.
    video.element.classList.add('i-amphtml-video-interface');
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
    // Only require ActionTrust.LOW for video actions to defer to platform
    // specific handling (e.g. user gesture requirement for unmuted playback).
    video.registerAction('play',
        video.play.bind(video, /* isAutoplay */ false), ActionTrust.LOW);
    video.registerAction('pause', video.pause.bind(video), ActionTrust.LOW);
    video.registerAction('mute', video.mute.bind(video), ActionTrust.LOW);
    video.registerAction('unmute', video.unmute.bind(video), ActionTrust.LOW);
    video.registerAction('fullscreen', video.fullscreenEnter.bind(video),
        ActionTrust.LOW);
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
    listen(entry.video.element, VideoEvents.VISIBILITY, details => {
      const data = getData(details);
      if (data && data['visible'] == true) {
        entry.updateVisibility(/* opt_forceVisible */ true);
      } else {
        entry.updateVisibility();
      }
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
      this.viewport_.onScroll(scrollListener);
      this.viewport_.onChanged(scrollListener);
      this.scrollListenerInstalled_ = true;
    }
  }


  /**
   * Install the necessary listeners to be notified when the user changes
   * the orientation of their device
   *
   * @param {VideoEntry} entry
   * @private
   */
  maybeInstallOrientationObserver_(entry) {
    // The orientation observer is only useful for automatically putting videos
    // in fullscreen.
    if (!entry.hasFullscreenOnLandscape) {
      return;
    }

    // TODO(@wassgha) Check support status for orientation API and update
    // this as needed.
    const win = this.ampdoc.win;
    const screen = win.screen;
    const handleOrientationChange = () => {
      let isLandscape;
      if (screen && 'orientation' in screen) {
        isLandscape = startsWith(screen.orientation.type, 'landscape');
      } else {
        isLandscape = win.orientation == -90 || win.orientation == 90;
      }
      entry.orientationChanged_(isLandscape);
    };
    // Chrome apparently considers 'orientationchange' to be an untrusted
    // event, while 'change' on screen.orientation is considered a user
    // interaction. However on Chrome we still need to listen to
    // 'orientationchange' to be able to exit fullscreen since 'change' does not
    // fire when a video is in fullscreen.
    if (screen && 'orientation' in screen) {
      const orient = /** @type {!ScreenOrientation} */ (screen.orientation);
      listen(orient, 'change', handleOrientationChange.bind(this));
    }
    // iOS Safari does not have screen.orientation but classifies
    // 'orientationchange' as a user interaction.
    listen(win, 'orientationchange', handleOrientationChange.bind(this));
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
          this.entries_[i].refreshDockedVideo();
        }
      };
      this.viewport_.onResize(resizeListener);
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
    dev().error(TAG, 'video is not registered to this video manager');
    return null;
  }

  /**
   * Returns the entry in the video manager corresponding to the element
   * provided
   *
   * @param {!AmpElement} element
   * @return {VideoEntry} entry
   * @private
   */
  getEntryForElement_(element) {
    for (let i = 0; i < this.entries_.length; i++) {
      const entry = this.entries_[i];
      if (entry.video.element === element) {
        return entry;
      }
    }
    dev().error(TAG, 'video is not registered to this video manager');
    return null;
  }

  /**
   * Get the current analytics details for the given video.
   * Silently fail if the video is not found in this manager.
   * @param {!AmpElement} videoElement
   * @return {!Promise<!../video-interface.VideoAnalyticsDetailsDef>|!Promise<undefined>}
   */
  getVideoAnalyticsDetails(videoElement) {
    const entry = this.getEntryForElement_(videoElement);
    return entry ? entry.getAnalyticsDetails() : Promise.resolve();
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
   * @param {boolean} allowAutoplay
   */
  constructor(manager, video, allowAutoplay) {

    /** @private @const {!VideoManager} */
    this.manager_ = manager;

    /** @private @const {!./ampdoc-impl.AmpDoc}  */
    this.ampdoc_ = manager.ampdoc;

    /** @private {!../service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc_);

    /** @package @const {!../video-interface.VideoInterface} */
    this.video = video;

    /** @private @const {boolean} */
    this.allowAutoplay_ = allowAutoplay;

    /** @private {?Element} */
    this.autoplayAnimation_ = null;

    /** @private {boolean} */
    this.loaded_ = false;

    /** @private {boolean} */
    this.isPlaying_ = false;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private {boolean} */
    this.isFullscreenByOrientationChange_ = false;

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

    // Autoplay Variables

    /** @private {boolean} */
    this.userInteractedWithAutoPlay_ = false;

    /** @private {boolean} */
    this.playCalledByAutoplay_ = false;

    /** @private {boolean} */
    this.pauseCalledByAutoplay_ = false;

    /** @private {?Element} */
    this.internalElement_ = null;

    /** @private {?Element} */
    this.draggingMask_ = null;

    /** @private {boolean} */
    this.muted_ = false;

    // Dockabled Video Variables

    /** @private {Object} */
    this.inlineVidRect_ = null;

    /** @private {Object} */
    this.minimizedRect_ = null;

    /** @private {string} */
    this.dockPosition_ = DockPositions.INLINE;

    /** @private {string} */
    this.dockState_ = DockStates.INLINE;

    /** @private {number} */
    this.dockVisibleHeight_ = 0;

    /** @private {?./position-observer/position-observer-worker.PositionInViewportEntryDef} */
    this.dockLastPosition_ = null;

    /** @private {boolean} */
    this.dockPreviouslyInView_ = false;

    // Dragging Variables

    /** @private {boolean} */
    this.dragListenerInstalled_ = false;

    /** @private {boolean} */
    this.isTouched_ = false;

    /** @private {boolean} */
    this.isDragging_ = false;

    /** @private {boolean} */
    this.isSnapping_ = false;

    /** @private {boolean} */
    this.isDismissed_ = false;

    /** @private {Object} */
    this.dragCoordinates_ = {
      mouse: {x: 0, y: 0},
      displacement: {x: 0, y: 0},
      initial: {x: 0, y: 0},
      position: {x: 0, y: 0},
      previous: {x: 0, y: 0},
      velocity: {x: 0, y: 0},
    };

    /** @private {Array<!UnlistenDef>} */
    this.dragUnlisteners_ = [];

    this.hasDocking = element.hasAttribute(VideoAttributes.DOCK);

    this.hasAutoplay = element.hasAttribute(VideoAttributes.AUTOPLAY);

    const fsOnLandscapeAttr = element.getAttribute(
        VideoAttributes.FULLSCREEN_ON_LANDSCAPE
    );

    this.hasFullscreenOnLandscape = fsOnLandscapeAttr == ''
                                    || fsOnLandscapeAttr == 'always';

    // Media Session API Variables

    /** @private {!../mediasession-helper.MetadataDef} */
    this.metadata_ = EMPTY_METADATA;

    listenOncePromise(element, VideoEvents.LOAD)
        .then(() => this.videoLoaded());
    listen(element, VideoEvents.PAUSE, () => this.videoPaused_());
    listen(element, VideoEvents.PLAYING, () => this.videoPlayed_());
    listen(element, VideoEvents.MUTED, () => this.muted_ = true);
    listen(element, VideoEvents.UNMUTED, () => this.muted_ = false);
    listen(element, VideoEvents.ENDED, () => this.videoEnded_());

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

    if (!this.video.preimplementsMediaSessionAPI()) {
      const playHandler = () => {
        this.video.play(/*isAutoplay*/ false);
      };
      const pauseHandler = () => {
        this.video.pause();
      };
      // Update the media session
      setMediaSession(
          this.ampdoc_.win,
          this.metadata_,
          playHandler,
          pauseHandler
      );
    }

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
    analyticsEvent(this, VideoAnalyticsEvents.PAUSE);
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
   * Callback for when the video has ended
   * @private
   */
  videoEnded_() {
    analyticsEvent(this, VideoAnalyticsEvents.ENDED);
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
      this.inlineVidRect_ = this.video.element./*OK*/getBoundingClientRect();
    });

    this.fillMediaSessionMetadata_();

    this.updateVisibility();
    if (this.isVisible_) {
      // Handles the case when the video becomes visible before loading
      this.loadedVideoVisibilityChanged_();
    }
  }

  /**
   * Gets the provided metadata and fills in missing fields
   * @private
   */
  fillMediaSessionMetadata_() {
    if (this.video.preimplementsMediaSessionAPI()) {
      return;
    }

    if (this.video.getMetadata()) {
      this.metadata_ = map(
          /** @type {!../mediasession-helper.MetadataDef} */
          (this.video.getMetadata())
      );
    }

    const doc = this.ampdoc_.win.document;

    if (!this.metadata_.artwork || this.metadata_.artwork.length == 0) {
      const posterUrl = parseSchemaImage(doc)
                        || parseOgImage(doc)
                        || parseFavicon(doc);

      if (posterUrl) {
        this.metadata_.artwork = [{
          'src': posterUrl,
        }];
      }
    }

    if (!this.metadata_.title) {
      const title = this.video.element.getAttribute('title')
                    || this.video.element.getAttribute('aria-label')
                    || this.internalElement_.getAttribute('title')
                    || this.internalElement_.getAttribute('aria-label')
                    || doc.title;
      if (title) {
        this.metadata_.title = title;
      }
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
   * Called when the orientation of the device changes
   * @param {boolean} isLandscape
   * @private
   */
  orientationChanged_(isLandscape) {
    if (!this.loaded_) {
      return;
    }
    // Put the video in/out of fullscreen depending on screen orientation
    if (!isLandscape && this.isFullscreenByOrientationChange_) {
    	this.exitFullscreen_();
    } else if (isLandscape
               && this.getPlayingState() == PlayingStates.PLAYING_MANUAL
               && this.isVisible_
               && Services.viewerForDoc(this.ampdoc_).isVisible()) {
    	this.enterFullscreen_();
    }
  }

  /**
   * Makes the video element go fullscreen and updates its status
   * @private
   */
  enterFullscreen_() {
    if (this.video.isFullscreen() || this.isFullscreenByOrientationChange_) {
      return;
    }
    this.video.fullscreenEnter();
    this.isFullscreenByOrientationChange_ = this.video.isFullscreen();
  }

  /**
   * Makes the video element quit fullscreen and updates its status
   * @private
   */
  exitFullscreen_() {
    if (!this.isFullscreenByOrientationChange_) {
      return;
    }
    this.video.fullscreenExit();
    this.isFullscreenByOrientationChange_ = false;
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
    const unlisteners = [];
    unlisteners.push(listen(mask, 'click', onInteraction.bind(this)));
    unlisteners.push(listen(animation, 'click', onInteraction.bind(this)));

    unlisteners.push(listen(this.video.element, VideoEvents.PAUSE,
        toggleAnimation.bind(this, /*playing*/ false)));

    unlisteners.push(listen(this.video.element, VideoEvents.PLAYING,
        toggleAnimation.bind(this, /*playing*/ true)));

    unlisteners.push(listen(this.video.element, VideoEvents.AD_START,
        adStart.bind(this)));

    unlisteners.push(listen(this.video.element, VideoEvents.AD_END,
        adEnd.bind(this)));

    function onInteraction() {
      this.userInteractedWithAutoPlay_ = true;
      this.video.showControls();
      this.video.unmute();
      unlisteners.forEach(unlistener => {
        unlistener();
      });
      removeElement(animation);
      removeElement(mask);
    }

    function adStart() {
      setStyles(mask, {
        'display': 'none',
      });
    }

    function adEnd() {
      setStyles(mask, {
        'display': 'block',
      });
    }
  }

  /**
   * Called when visibility of a loaded autoplay video changes.
   * @private
   */
  autoplayLoadedVideoVisibilityChanged_() {
    if (!this.allowAutoplay_) {
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
        this.inlineVidRect_ = this.video.element./*OK*/getBoundingClientRect();
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
          this.inlineVidRect_.height, 0,
          min, max);
    } else {
      return mapRange(this.dockVisibleHeight_,
          0, this.inlineVidRect_.height,
          min, max);
    }
  }

  /**
   * Performs all re-measuring operations (useful when orientation changes)
   */
  refreshDockedVideo() {
    this.vsync_.run({
      measure: () => {
        this.measureInitialDockableRect_();
        this.measureMinimizedRect_();
      },
      mutate: () => {
        this.repositionMinimizedVideo_();
        this.realignDraggingMask_();
      },
    });
  }

  /**
   * Re-initialize measurements of the video element when the viewport is
   * resized or the orientation is changed.
   * @private
   */
  measureInitialDockableRect_() {
    this.inlineVidRect_ = this.video.element./*OK*/getBoundingClientRect();
  }

  /**
   * Re-measures the bouding rectangle of the minimized video's position and
   * resets dragging Variables
   * @private
   */
  measureMinimizedRect_() {
    this.vsync_.measure(() => {
      this.minimizedRect_ = this.internalElement_./*OK*/getBoundingClientRect();
      this.dragCoordinates_.initial.x = this.minimizedRect_.left;
      this.dragCoordinates_.initial.y = this.minimizedRect_.top;
      this.dragCoordinates_.position.x = this.minimizedRect_.left;
      this.dragCoordinates_.position.y = this.minimizedRect_.top;
      this.dragCoordinates_.previous.x = this.minimizedRect_.left;
      this.dragCoordinates_.previous.y = this.minimizedRect_.top;
      this.dragCoordinates_.displacement.x = 0;
      this.dragCoordinates_.displacement.y = 0;
    });
  }

  /**
   * Fakes a 'position change' event in order to refresh the minimized video's
   * position (usually following a device orientation change)
   * @private
   */
  repositionMinimizedVideo_() {
    this.dockState_ = DockStates.INLINE;
    if (this.dockLastPosition_) {
      this.onDockableVideoPositionChanged(this.dockLastPosition_);
    }
  }

  /**
   * Re-aligns the dragging mask with the position of the minimized video,
   * usually following a device orientation change
   * @private
   */
  realignDraggingMask_() {
    if (!this.draggingMask_ || !this.internalElement_) {
      return;
    }

    this.vsync_.mutate(() => {
      const internalElement = this.internalElement_;
      function cloneStyle(prop) {
        return st.getStyle(dev().assertElement(internalElement), prop);
      };

      st.setStyles(dev().assertElement(this.draggingMask_), {
        'top': cloneStyle('top'),
        'left': cloneStyle('left'),
        'bottom': cloneStyle('bottom'),
        'right': cloneStyle('right'),
        'transform': cloneStyle('transform'),
        'transform-origin': cloneStyle('transform-origin'),
        'borderRadius': cloneStyle('borderRadius'),
        'width': cloneStyle('width'),
        'height': cloneStyle('height'),
        'position': 'fixed',
        'z-index': '17',
        'background': 'transparent',
      });
    });
  }

  /**
   * Called when the video's position in the viewport changed (at most once per
   * animation frame)
   * @param {./position-observer/position-observer-worker.PositionInViewportEntryDef} newPos
   */
  onDockableVideoPositionChanged(newPos) {
    this.vsync_.run({
      measure: () => {
        this.inlineVidRect_ = this.video.element./*OK*/getBoundingClientRect();
        this.updateDockableVideoPosition_(newPos);
      },
      mutate: () => {
        // Short-circuit the position change handler if the video isn't loaded yet
        // or is not playing manually while in-line (paused videos need to go
        // through if they are docked since this method handles the "undocking"
        // animation)
        if (!this.loaded_
          || !this.inlineVidRect_
          || !this.internalElement_
          || (this.getPlayingState() != PlayingStates.PLAYING_MANUAL
                  && !this.internalElement_.classList.contains(DOCK_CLASS))
        ) {
          return;
        }

        // During the docking transition we either perform the docking or
        // undocking scroll-bound animations
        //
        // Conditions for animating the video are:
        // 1. The video is out of view and it has been in-view  before
        const outOfView = (this.dockPosition_ != DockPositions.INLINE)
                          && this.dockPreviouslyInView_;
        // 2. Is either manually playing or paused while docked (so that it is
        // undocked even when paused)
        const manual = this.getPlayingState() == PlayingStates.PLAYING_MANUAL;
        const paused = this.getPlayingState() == PlayingStates.PAUSED;
        const docked = this.internalElement_.classList.contains(DOCK_CLASS);

        if (outOfView && (manual || (paused && docked))) {
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

        if (this.dockState_ == DockStates.DOCKED) {
          this.initializeDragging_();
        } else {
          this.finishDragging_();
        }
      },
    });
  }

  /**
   * Updates the minimization position of the video (in viewport, above or
   * below viewport), also the height of the part of the video that is
   * currently in the viewport (between 0 and the initial video height).
   * @param {./position-observer/position-observer-worker.PositionInViewportEntryDef} newPos
   * @private
   */
  updateDockableVideoPosition_(newPos) {
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
            this.inlineVidRect_.left,
            this.viewport_.getHeight(),
            this.inlineVidRect_.width,
            this.inlineVidRect_.height
        ) :
        // A fake rectangle with same width/height as the video, except it's
        // position right above the viewport
        layoutRectLtwh(
            this.inlineVidRect_.left,
            -this.inlineVidRect_.height,
            this.inlineVidRect_.width,
            this.inlineVidRect_.height
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
            Math.ceil(this.dockVisibleHeight_) >= this.inlineVidRect_.height;

    // Calculate space on top and bottom of the video to see if it is possible
    // for the video to become hidden by scrolling to the top/bottom
    const spaceOnTop = this.video.element./*OK*/offsetTop;
    const spaceOnBottom = this.viewport_.getScrollHeight()
                         - spaceOnTop
                         - this.video.element./*OK*/offsetHeight;
    // Don't minimize if video can never be hidden by scrolling to top/bottom
    if ((isBottom && spaceOnTop < this.viewport_.getHeight())
        || (isTop && spaceOnBottom < this.viewport_.getHeight())) {
      this.dockPosition_ = DockPositions.INLINE;
      return;
    }

    // Don't minimize if the video is bigger than the viewport (will always
    // minimize and never be inline otherwise!)
    if (this.video.element./*OK*/offsetHeight >= this.viewport_.getHeight()) {
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
      // The inline video is outside but the dockPosition has been set, this
      // means the position was manually changed by drag/drop, keep it as is.
    }
  }

  /**
   * Set the initial width and hight when the video is docking
   * so that we scale relative to the initial video's dimensions
   * @private
   */
  initializeDocking_() {
    this.video.hideControls();
    this.internalElement_.classList.add(DOCK_CLASS);
    st.setStyles(dev().assertElement(this.internalElement_), {
      'height': st.px(this.inlineVidRect_.height),
      'width': st.px(this.inlineVidRect_.width),
      'maxWidth': st.px(this.inlineVidRect_.width),
    });
    st.setStyles(dev().assertElement(this.video.element), {
      'background-color': '#222',
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
    // Viewport width & height
    const vw = this.viewport_.getWidth();
    const vh = this.viewport_.getHeight();

    // Calculate offsetXLeft
    const offsetXLeft = DOCK_MARGIN;
    // Calculate offsetXRight
    const scaledWidth = DOCK_SCALE * this.inlineVidRect_.width;
    const offsetXRight = vw - scaledWidth - DOCK_MARGIN;
    // Calculate offsetYTop
    const offsetYTop = DOCK_MARGIN;
    // Calculate offsetYBottom
    const scaledHeight = DOCK_SCALE * this.inlineVidRect_.height;
    const offsetYBottom = vh - scaledHeight - DOCK_MARGIN;

    // Calculate translate
    let minimizedRectTop = 0, minimizedRectLeft = 0;
    switch (this.dockPosition_) {
      case DockPositions.TOP_LEFT:
        minimizedRectLeft = offsetXLeft;
        minimizedRectTop = offsetYTop;
        break;
      case DockPositions.TOP_RIGHT:
        minimizedRectLeft = offsetXRight;
        minimizedRectTop = offsetYTop;
        break;
      case DockPositions.BOTTOM_LEFT:
        minimizedRectTop = offsetYBottom;
        minimizedRectLeft = offsetXLeft;
        break;
      case DockPositions.BOTTOM_RIGHT:
        minimizedRectTop = offsetYBottom;
        minimizedRectLeft = offsetXRight;
        break;
      default:
    }

    // Bound the top position of the inline rectangle by the viewport's rect
    const initialRectTopBounded = Math.max(0,
        Math.min(
            vh - this.inlineVidRect_.height,
            this.inlineVidRect_.top
        )
    );

    // Calculate Translate
    const offsetX = st.px(
        this.scrollMap_(this.inlineVidRect_.left, minimizedRectLeft, true)
    );
    const offsetY = st.px(
        this.scrollMap_(initialRectTopBounded, minimizedRectTop, true)
    );
    const translate = st.translate(offsetX, offsetY);

    // Calculate Scale
    const scale = st.scale(this.scrollMap_(DOCK_SCALE, 1));

    // Tranform from calculated translate and scale
    const transform = translate + ' ' + scale;

    st.setStyles(dev().assertElement(this.internalElement_), {
      'transform': transform,
      'transformOrigin': 'top left',
      'bottom': 'auto',
      'top': '0px',
      'right': 'auto',
      'left': '0px',
    });

    if (this.scrollMap_(DOCK_SCALE, 1) == DOCK_SCALE) {
      this.dockState_ = DockStates.DOCKED;
    } else {
      this.dockState_ = DockStates.DOCKING;
    }
  }

  /**
   * Listens for the specified event on the element and records unlistener
   * @param {!EventTarget} element
   * @param {string} eventType
   * @param {function(!Event)} listener
   * @private
   */
  addDragListener_(element, eventType, listener) {
    this.dragUnlisteners_.push(
        listen(
            element,
            eventType,
            listener
        )
    );
  }

  /**
   * Removes all listeners for touch and mouse events
   * @private
   */
  unlistenToDragEvents_() {
    let unlistener = this.dragUnlisteners_.pop();
    while (unlistener) {
      unlistener.call();
      unlistener = this.dragUnlisteners_.pop();
    }
    this.dragListenerInstalled_ = false;
  }

  /**
   * Creates the dragging handle and listens to touch and mouse events
   *
   * @private
   */
  initializeDragging_() {
    if (this.dragListenerInstalled_) {
      return;
    }

    this.vsync_.run({
      measure: () => {
        this.measureMinimizedRect_();
      },
      mutate: () => {
        this.createDraggingMask_();

        // Desktop listeners
        this.addDragListener_(
            dev().assertElement(this.draggingMask_),
            'mousedown',
            e => {
              e.preventDefault();
              this.isTouched_ = true;
              this.isDragging_ = false;
              this.mouse_(e, true);
            }
        );
        this.addDragListener_(this.ampdoc_.win.document, 'mouseup', () => {
          this.isTouched_ = false;
          this.isDragging_ = false;
          // Call drag one last time to see if the velocity is still not null
          // in which case, drag would call itself again to finish the animation
          this.drag_();
        });
        this.addDragListener_(this.ampdoc_.win.document, 'mousemove', e => {
          this.isDragging_ = this.isTouched_;
          if (this.isDragging_) {
            e.preventDefault();
            // Start dragging
            this.dockState_ = DockStates.DRAGGABLE;
            this.drag_();
          }
          this.mouse_(e);
        });
        // Touch listeners
        this.addDragListener_(
            dev().assertElement(this.draggingMask_),
            'touchstart',
            e => {
              e.preventDefault();
              this.isTouched_ = true;
              this.isDragging_ = false;
              this.mouse_(e, true);
            }
        );
        this.addDragListener_(this.ampdoc_.win.document, 'touchend', () => {
          this.isTouched_ = false;
          this.isDragging_ = false;
          // Call drag one last time to see if the velocity is still not null
          // in which case, drag would call itself again to finish the animation
          this.drag_();
        });
        this.addDragListener_(this.ampdoc_.win.document, 'touchmove', e => {
          this.isDragging_ = this.isTouched_;
          if (this.isDragging_) {
            e.preventDefault();
            // Start dragging
            this.dockState_ = DockStates.DRAGGABLE;
            this.drag_();
          }
          this.mouse_(e);
        });
        this.dragListenerInstalled_ = true;
      },
    });
  }

  /**
   * Handles the dragging, dropping and snapping to corners.
   * Ran once every animation frame
   * @private
   */
  drag_() {
    this.vsync_.run({
      measure: () => {
        const internalElement = this.internalElement_;
        this.minimizedRect_ = internalElement./*OK*/getBoundingClientRect();
      },
      mutate: () => {
        // Stop the loop if the video is no longer in a draggable state
        if (!this.loaded_
          || !this.internalElement_
          || this.dockPosition_ == DockPositions.INLINE
          || this.dockVisibleHeight_ != 0
          || !this.internalElement_.classList.contains(DOCK_CLASS)
          || this.dockState_ != DockStates.DRAGGABLE) {
          return;
        }
        const dragCoord = this.dragCoordinates_;
        if (this.isDragging_) {
          dragCoord.previous.x = dragCoord.position.x;
          dragCoord.previous.y = dragCoord.position.y;

          dragCoord.position.x = dragCoord.mouse.x - dragCoord.displacement.x;
          dragCoord.position.y = dragCoord.mouse.y - dragCoord.displacement.y;

          dragCoord.velocity.x = (dragCoord.position.x - dragCoord.previous.x);
          dragCoord.velocity.y = (dragCoord.position.y - dragCoord.previous.y);

          const minimizedWidth = this.minimizedRect_.width;
          const minimizedHeight = this.minimizedRect_.height;

          const vidCenterX = dragCoord.position.x + minimizedWidth / 2;
          const vidCenterY = dragCoord.position.y + minimizedHeight / 2;

          if (vidCenterX > this.viewport_.getWidth()
              || vidCenterX < 0
              || vidCenterY > this.viewport_.getHeight()
              || vidCenterY < 0) {
            this.isDismissed_ = true;
          }
        } else {
          dragCoord.position.x += dragCoord.velocity.x;
          dragCoord.position.y += dragCoord.velocity.y;

          dragCoord.velocity.x *= FRICTION_COEFF;
          dragCoord.velocity.y *= FRICTION_COEFF;

          if (this.isDismissed_) {
            this.video.pause();
            this.finishDocking_();
            this.isDismissed_ = false;
            return;
          }
        }

        // Snap to corners
        if (!this.isDragging_ && !this.isSnapping_
            && Math.abs(dragCoord.velocity.x) <= STOP_THRESHOLD
            && Math.abs(dragCoord.velocity.y) <= STOP_THRESHOLD) {
          // X/Y Coordinates for each corner
          const top = DOCK_MARGIN;
          const left = DOCK_MARGIN;
          const right = this.viewport_.getWidth()
                        - this.minimizedRect_.width
                        - DOCK_MARGIN;
          const bottom = this.viewport_.getHeight()
                         - this.minimizedRect_.height
                         - DOCK_MARGIN;
          // Determine corner and update this.dockPosition_
          this.calcSnapCorner_();
          // Set coordinates based on corner
          let newPosX = dragCoord.position.x, newPosY = dragCoord.position.y;
          switch (this.dockPosition_) {
            case DockPositions.BOTTOM_RIGHT:
              newPosX = right;
              newPosY = bottom;
              break;
            case DockPositions.TOP_RIGHT:
              newPosX = right;
              newPosY = top;
              break;
            case DockPositions.BOTTOM_LEFT:
              newPosX = left;
              newPosY = bottom;
              break;
            case DockPositions.TOP_LEFT:
              newPosX = left;
              newPosY = top;
              break;
          }
          // Animate the snap transition
          if (dragCoord.position.x != newPosX
              || dragCoord.position.y != newPosY) {
            this.isSnapping_ = true;
            // Snap to the calculated corner
            this.animateSnap_(this.draggingMask_, newPosX, newPosY);
            this.animateSnap_(this.internalElement_, newPosX, newPosY);
            this.dockState_ = DockStates.DOCKED;
          }
        }

        // Update the video's position
        if (!this.isSnapping_) {
          this.dragMove_(this.draggingMask_);
          this.dragMove_(this.internalElement_);
        }

        if (!this.isDragging_) {
          // Continue animating although touch stopped to perform elastic motion
          this.vsync_.mutate(() => {
            this.drag_();
          });
        }
      },
    });
  }

  /**
   * Removes the draggable mask and ends dragging
   * @private
   */
  finishDragging_() {
    this.vsync_.mutate(() => {
      this.unlistenToDragEvents_();
      this.removeDraggingMask_();
    });
  }

  /**
   * Reads mouse coordinate and saves them to an internal variable
   * @param {Event} e
   * @param {boolean} updateDisplacement
   * @private
   */
  mouse_(e, updateDisplacement = false) {
    if (e.x) {
      this.dragCoordinates_.mouse.x = e.x;
      this.dragCoordinates_.mouse.y = e.y;
    } else if (e.touches) {
      this.dragCoordinates_.mouse.x = e.touches[0].clientX;
      this.dragCoordinates_.mouse.y = e.touches[0].clientY;
    }
    if (updateDisplacement) {
      this.dragCoordinates_.displacement.x = Math.abs(
          this.dragCoordinates_.position.x - this.dragCoordinates_.mouse.x
      );
      this.dragCoordinates_.displacement.y = Math.abs(
          this.dragCoordinates_.position.y - this.dragCoordinates_.mouse.y
      );
    }
  }

  /**
   * Calculates which corner to snap to based on the element's position
   * @private
   */
  calcSnapCorner_() {
    const viewportCenterX = this.viewport_.getWidth() / 2;
    const viewportCenterY = this.viewport_.getHeight() / 2;
    const minRectW = this.minimizedRect_.width;
    const minRectH = this.minimizedRect_.height;
    const centerX = this.dragCoordinates_.position.x + minRectW / 2;
    const centerY = this.dragCoordinates_.position.y + minRectH / 2;
    if (centerX >= viewportCenterX) {
      if (centerY >= viewportCenterY) {
        this.dockPosition_ = DockPositions.BOTTOM_RIGHT;
      } else if (centerY < viewportCenterY) {
        this.dockPosition_ = DockPositions.TOP_RIGHT;
      }
    } else if (centerX < viewportCenterX) {
      if (centerY >= viewportCenterY) {
        this.dockPosition_ = DockPositions.BOTTOM_LEFT;
      } else if (centerY < viewportCenterY) {
        this.dockPosition_ = DockPositions.TOP_LEFT;
      }
    }
  }

  /**
   * Restores styling of the video to make it go back to its original inline
   * position.
   *
   * @private
   */
  finishDocking_() {
    // Remove draggable mask and listeners
    this.finishDragging_();
    // Re-enable controls
    this.video.showControls();
    // Restore the video inline
    this.internalElement_.classList.remove(DOCK_CLASS);
    this.internalElement_.setAttribute('style', '');
    st.setStyles(dev().assertElement(this.video.element), {
      'background-color': 'transparent',
    });
    this.dockState_ = DockStates.INLINE;
    this.manager_.unregisterDocked();
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
   * Update's the elements coordinates to one of the set corners with a timeDef
   * animation
   * @private
   * @param {?Element} element
   */
  animateSnap_(element, newPosX, newPosY) {
    Animation.animate(dev().assertElement(element),
        tr.setStyles(dev().assertElement(element), {
          'transform': tr.concat([
            tr.translate(
                tr.px(tr.numeric(this.dragCoordinates_.position.x, newPosX)),
                tr.px(tr.numeric(this.dragCoordinates_.position.y, newPosY))
            ),
            tr.scale(tr.numeric(DOCK_SCALE, DOCK_SCALE)),
          ]),
        }), 200).thenAlways(() => {
      // Update the positions
      this.dragCoordinates_.position.x = newPosX;
      this.dragCoordinates_.position.y = newPosY;
      this.isSnapping_ = false;
    });
  }

  /**
   * Update's the elements coordinates according to the draggable's
   * set coordinates
   * @private
   * @param {?Element} element
   */
  dragMove_(element) {
    const translate = st.translate(
        st.px(this.dragCoordinates_.position.x),
        st.px(this.dragCoordinates_.position.y)
    );
    const scale = st.scale(DOCK_SCALE);
    st.setStyles(dev().assertElement(element), {
      'transform': translate + ' ' + scale,
      'transform-origin': 'top left',
      'bottom': 'auto',
      'top': '0px',
      'right': 'auto',
      'left': '0px',
    });
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
   * Creates a mask to overlay on top of a minimized video to capture drag
   * and drop events on iframe-based players
   * @private
   */
  createDraggingMask_() {
    const doc = this.ampdoc_.win.document;
    this.draggingMask_ = doc.createElement('i-amphtml-dragging-mask');
    this.realignDraggingMask_();
    this.video.element.appendChild(this.draggingMask_);
  }

  /**
   * Removes the draggable mask so that the video can be interacted with
   * again when inline
   * @private
   */
  removeDraggingMask_() {
    if (this.draggingMask_) {
      removeElement(this.draggingMask_);
      this.draggingMask_ = null;
    }
  }

  /**
   * Called by all possible events that might change the visibility of the video
   * such as scrolling or {@link ../video-interface.VideoEvents#VISIBILITY}.
   * @param {?boolean=} opt_forceVisible
   * @package
   */
  updateVisibility(opt_forceVisible) {
    const wasVisible = this.isVisible_;

    // Measure if video is now in viewport and what percentage of it is visible.
    const measure = () => {
      if (opt_forceVisible == true) {
        this.isVisible_ = true;
      } else {
        // Calculate what percentage of the video is in viewport.
        const change = this.video.element.getIntersectionChangeEntry();
        const visiblePercent = !isFiniteNumber(change.intersectionRatio) ? 0
          : change.intersectionRatio * 100;
        this.isVisible_ = visiblePercent >= VISIBILITY_PERCENT;
      }
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
