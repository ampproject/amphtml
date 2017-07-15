
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
import {removeElement, scopedQuerySelector, isRTL} from '../dom';
import {listen, listenOncePromise} from '../event-helper';
import {dev} from '../log';
import {getMode} from '../mode';
import {registerServiceBuilderForDoc, getServiceForDoc} from '../service';
import {setStyles} from '../style';
import {isFiniteNumber} from '../types';
import {mapRange} from '../utils/math';
import {startsWith} from '../string.js';
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
import {layoutRectLtwh, RelativePositions} from '../layout-rect';
import {Animation} from '../animation';
import * as st from '../style';
import * as tr from '../transition';

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

    /** @private {!../service/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);

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

    /** @private @const */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @private @const */
    this.boundSecondsPlaying_ = () => this.secondsPlaying_();;

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
      }
    }
    this.timer_.delay(this.boundSecondsPlaying_, SECONDS_PLAYED_MIN_DELAY);
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
    this.maybeInstallOrientationObserver_(entry);
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

    /** @private {!../service/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc_);

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

    /** @private {?PositionInViewportEntryDef} */
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
    if (!this.preimplementsMediaSession()) {
      this.mediaSessionUpdate_();
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
      this.inlineVidRect_ = this.video.element./*OK*/getBoundingClientRect();
    });

    if (!this.preimplementsMediaSession()) {
      this.metaData_ = this.getMetaData_();
      this.mediaSessionUpdate_();
    }

    this.updateVisibility();
    if (this.isVisible_) {
      // Handles the case when the video becomes visible before loading
      this.loadedVideoVisibilityChanged_();
    }
  }

  /**
   * Gets the provided metadata and fills in missing fields
   * @return {!../video-interface.VideoMetaDef}
   * @private
   */
  getMetaData_() {
    let metaData = this.video.metaData;
    if (!metaData) {
      metaData = {};
    }
    if (!metaData.artist) {
      metaData.artist = 'No artist';
    }
    if (!metaData.posterUrl) {
      metaData.posterUrl = this.video.element.getAttribute('poster')
                           || this.internalElement_.getAttribute('poster')
                           || this.getDefaultPoster_();
    }
    if (!metaData.title) {
      metaData.title = this.video.element.getAttribute('title')
                       || this.video.element.getAttribute('aria-label')
                       || this.internalElement_.getAttribute('title')
                       || this.internalElement_.getAttribute('aria-label')
                       || this.ampdoc_.win.document.title;
    }
    if (!metaData.album) {
      metaData.album = 'No album';
    }
    return metaData;
  }

  /**
   * Gets the provided metadata and fills in missing fields
   * @private
   */
  mediaSessionUpdate_() {
    const win = this.ampdoc_.win;
    const navigator = win.navigator;
    if ('mediaSession' in navigator && win.MediaMetadata) {

      navigator.mediaSession.metadata = new win.MediaMetadata({
        title: this.metaData_.title,
        artist: this.metaData_.artist,
        album: this.metaData_.album,
        artwork: [
          {
            src: this.metaData_.posterUrl,
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', function() {
        this.video.play();
      });
      navigator.mediaSession.setActionHandler('pause', function() {
        this.video.pause();
      });

      // TODO(@wassgha) Implement seek & next/previous
    }

  }

  getDefaultPoster_() {
    /*eslint-disable */
    const ampLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKs2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjarZZnUFPpHsb/55z0QksIRUroTZAiXSB0QhGkg42QUAIhxCQgInYWV3AtqIhgWVEpouBaAFkrFiwsgg37BllUlHWxYEPlfmAJe+fO/XBn7n/mzPnNM+/7vM97zpcHgNbDk0hEqBpAjlgujQ72YycmJbOJ/YAHLaACC4DHl0l8o6LCAQAm3/8YBODDXUAAAG7Z8iQSEfxvoy5Ik/EBkCgASBXI+DkAyHEApIUvkcoBMBEAmCyWS+QA2CYAYEoTk5IBsP0AwMyY4DYAYKZOcBcAMKWx0f4AmAKAROPxpBkA1GEAYOfzM+QANBoA2IsFQjEAbRYAePMzeQIAWhEATM/JyRUA0OoBwDL1Hz4Z/+aZqvTk8TKUPHEXAAAgBQhlEhFvCfy/J0eUN3mGMQDQMqUh0QCgAoDUZ+eGKVmcOjtykoUCgEnOzAuJm2S+zD95kgW8gLBJzsuO851knnRqr1DOjZ1kaW600l8smh2u9E/jKjlNFhgzyenCIO4kF2bGJkxyvjB+9iTLsmPCptb4K3VpXrQyc7o0SHnHHNlUNj5v6ix5ZmzIVIZEZR5BWkCgUhfHKddL5H5KT4koaiq/KFipy/JjlHvl0lilnsULjZryiVJ+HwiBKGBDMjiCK4gB5GkFcgAA/1zJEqkwI1PO9pVIRGlsrphvN53taO/gCpCYlMye+LXv7gECAAiLNKXl9gC4NgBA3ZTGSwFokwFomkxpZgcAVP8AOM3n50nzJzQcAAAeKKAKTNABAzABS7AFR3ABT+BAIIRCJMRCEiwAPmRCDkhhMRTBKiiBMtgE26AK9sA+qIfDcBRa4RSch8twHXrgDjwEBQzCKxiBDzCGIAgRoSMMRAcxRMwQG8QRcUO8kUAkHIlGkpAUJAMRI3lIEbIGKUPKkSpkL9KA/IKcRM4jV5Fe5D7Sjwwhb5EvKIbSUCaqj5qjM1A31BcNQ2PR+WgGuggtRIvRDWglWoMeQlvQ8+h19A6qQF+hoxhgVIyFGWG2mBvmj0ViyVg6JsWWY6VYBVaDNWHtWCd2C1Ngw9hnHAHHwLFxtjhPXAguDsfHLcItx63HVeHqcS24i7hbuH7cCO47no7Xw9vgPfBcfCI+A78YX4KvwNfiT+Av4e/gB/EfCAQCi2BBcCWEEJIIWYSlhPWEXYRmwjlCL2GAMEokEnWINkQvYiSRR5QTS4g7iIeIZ4k3iYPETyQqyZDkSAoiJZPEpNWkCtJB0hnSTdJz0hhZjWxG9iBHkgXkJeSN5P3kdvIN8iB5jKJOsaB4UWIpWZRVlEpKE+US5RHlHZVKNaa6U+dQhdSV1ErqEeoVaj/1M02DZk3zp82j5dE20Opo52j3ae/odLo5nUNPpsvpG+gN9Av0J/RPKgwVOxWuikBlhUq1SovKTZXXqmRVM1Vf1QWqhaoVqsdUb6gOq5HVzNX81Xhqy9Wq1U6q9amNqjPUHdQj1XPU16sfVL+q/kKDqGGuEagh0CjW2KdxQWOAgTFMGP4MPmMNYz/jEmOQSWBaMLnMLGYZ8zCzmzmiqaE5UzNes0CzWvO0poKFscxZXJaItZF1lHWX9UVLX8tXK01rnVaT1k2tj9rTtDnaadql2s3ad7S/6LB1AnWydTbrtOo81sXpWuvO0V2su1v3ku7wNOY0z2n8aaXTjk57oIfqWetF6y3V26fXpTeqb6AfrC/R36F/QX/YgGXAMcgy2GpwxmDIkGHobSg03Gp41vAlW5PtyxaxK9kX2SNGekYhRnlGe426jcaMLYzjjFcbNxs/NqGYuJmkm2w16TAZMTU0jTAtMm00fWBGNnMzyzTbbtZp9tHcwjzBfK15q/kLC20LrkWhRaPFI0u6pY/lIssay9tWBCs3q2yrXVY91qi1s3WmdbX1DRvUxsVGaLPLpnc6frr7dPH0mul9tjRbX9t820bbfjuWXbjdartWu9czTGckz9g8o3PGd3tne5H9fvuHDhoOoQ6rHdod3jpaO/Idqx1vO9GdgpxWOLU5vZlpMzNt5u6Z95wZzhHOa507nL+5uLpIXZpchlxNXVNcd7r2uTHdotzWu11xx7v7ua9wP+X+2cPFQ+5x1OMvT1vPbM+Dni9mWcxKm7V/1oCXsRfPa6+XwpvtneL9s7fCx8iH51Pj85RjwhFwajnPfa18s3wP+b72s/eT+p3w++jv4b/M/1wAFhAcUBrQHagRGBdYFfgkyDgoI6gxaCTYOXhp8LkQfEhYyOaQPq4+l89t4I6EuoYuC70YRguLCasKexpuHS4Nb49AI0IjtkQ8mm02Wzy7NRIiuZFbIh9HWUQtivp1DmFO1JzqOc+iHaKLojtjGDELYw7GfIj1i90Y+zDOMi4vriNeNX5efEP8x4SAhPIEReKMxGWJ15N0k4RJbcnE5Pjk2uTRuYFzt80dnOc8r2Te3fkW8wvmX12gu0C04PRC1YW8hcdS8CkJKQdTvvIieTW80VRu6s7UEb4/fzv/lYAj2CoYSvNKK097nu6VXp7+IsMrY0vGUKZPZkXmsNBfWCV8kxWStSfrY3Zkdl32uChB1JxDyknJOSnWEGeLL+Ya5Bbk9kpsJCUSxSKPRdsWjUjDpLUyRDZf1iZnyiXyrjzLvB/y+vO986vzPy2OX3ysQL1AXNC1xHrJuiXPC4MKDyzFLeUv7SgyKlpV1L/Md9ne5cjy1OUdK0xWFK8YXBm8sn4VZVX2qt9W268uX/1+TcKa9mL94pXFAz8E/9BYolIiLelb67l2z4+4H4U/dq9zWrdj3fdSQem1MvuyirKv6/nrr/3k8FPlT+Mb0jd0b3TZuHsTYZN4093NPpvry9XLC8sHtkRsadnK3lq69f22hduuVsys2LOdsj1vu6IyvLJth+mOTTu+VmVW3an2q27eqbdz3c6PuwS7bu7m7G7ao7+nbM+Xn4U/39sbvLelxrymYh9hX/6+Z/vj93cecDvQUKtbW1b7rU5cp6iPrr/Y4NrQcFDv4MZGtDGvcejQvEM9hwMOtzXZNu1tZjWXHYEjeUde/pLyy92jYUc7jrkdazpudnznCcaJ0hakZUnLSGtmq6Itqa33ZOjJjnbP9hO/2v1ad8roVPVpzdMbz1DOFJ8ZP1t4dvSc5Nzw+YzzAx0LOx5eSLxw++Kci92Xwi5duRx0+UKnb+fZK15XTl31uHrymtu11usu11u6nLtO/Ob824lul+6WG6432nrce9p7Z/Weuelz8/ytgFuXb3NvX78z+07v3bi79/rm9SnuCe69uC+6/+ZB/oOxhysf4R+VPlZ7XPFE70nN71a/NytcFKf7A/q7nsY8fTjAH3j1h+yPr4PFz+jPKp4bPm944fji1FDQUM/LuS8HX0lejQ2X/Kn+587Xlq+P/8X5q2skcWTwjfTN+Nv173Te1b2f+b5jNGr0yYecD2MfSz/pfKr/7Pa580vCl+dji78Sv1Z+s/rW/j3s+6PxnPFxCU/KAwAADADQ9HSAt3UA9CQARg8ARWWiG//d6ZGpdv/feKI/AwCAC0ADByAOACI4ALsAwJwDoMoBiOIAxHIAdXJSPn+PLN3JccKL2gqArxgff5cAQLQC+NY3Pj7WOj7+rRYAewBw7sNEJwcAMB4BcGQBANwu+P0/uvG/AOoFAaYCPpR4AAA8yGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMTEgNzkuMTU4MzI1LCAyMDE1LzA5LzEwLTAxOjEwOjIwICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgICAgICAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgICAgICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoTWFjaW50b3NoKTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wOkNyZWF0ZURhdGU+MjAxNy0wNy0xNVQwMTozMTo0Ni0wNzowMDwveG1wOkNyZWF0ZURhdGU+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMTctMDctMTVUMDE6MzE6NDYtMDc6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDE3LTA3LTE1VDAxOjMxOjQ2LTA3OjAwPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDozN2EwZTYyZC04M2E2LTQ1MjYtOGQ2Zi1iOTRiOTI3MmY2MTA8L3htcE1NOkluc3RhbmNlSUQ+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo2OTQ3ZjZiMC1hNzU5LTExN2EtYTQ2ZC04MDc0MjMwNTY3MDY8L3htcE1NOkRvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDo1ZjJiMmQzZC1kNGJmLTRlNDgtYjlhOC05NjFhODFlOGVlODc8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkhpc3Rvcnk+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jcmVhdGVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6NWYyYjJkM2QtZDRiZi00ZTQ4LWI5YTgtOTYxYTgxZThlZTg3PC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDE3LTA3LTE1VDAxOjMxOjQ2LTA3OjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoTWFjaW50b3NoKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6YWN0aW9uPnNhdmVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6MzdhMGU2MmQtODNhNi00NTI2LThkNmYtYjk0YjkyNzJmNjEwPC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDE3LTA3LTE1VDAxOjMxOjQ2LTA3OjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgMjAxNSAoTWFjaW50b3NoKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmNoYW5nZWQ+Lzwvc3RFdnQ6Y2hhbmdlZD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICAgICA8cGhvdG9zaG9wOlRleHRMYXllcnM+CiAgICAgICAgICAgIDxyZGY6QmFnPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHBob3Rvc2hvcDpMYXllck5hbWU+TGF5ZXIgMzwvcGhvdG9zaG9wOkxheWVyTmFtZT4KICAgICAgICAgICAgICAgICAgPHBob3Rvc2hvcDpMYXllclRleHQvPgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxwaG90b3Nob3A6TGF5ZXJOYW1lPkxheWVyIDQ8L3Bob3Rvc2hvcDpMYXllck5hbWU+CiAgICAgICAgICAgICAgICAgIDxwaG90b3Nob3A6TGF5ZXJUZXh0Lz4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICAgICAgICA8cGhvdG9zaG9wOkxheWVyTmFtZT5MYXllciA1PC9waG90b3Nob3A6TGF5ZXJOYW1lPgogICAgICAgICAgICAgICAgICA8cGhvdG9zaG9wOkxheWVyVGV4dC8+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpCYWc+CiAgICAgICAgIDwvcGhvdG9zaG9wOlRleHRMYXllcnM+CiAgICAgICAgIDxwaG90b3Nob3A6Q29sb3JNb2RlPjM8L3Bob3Rvc2hvcDpDb2xvck1vZGU+CiAgICAgICAgIDxwaG90b3Nob3A6SUNDUHJvZmlsZT5EaXNwbGF5PC9waG90b3Nob3A6SUNDUHJvZmlsZT4KICAgICAgICAgPGRjOmZvcm1hdD5pbWFnZS9wbmc8L2RjOmZvcm1hdD4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjUxMjwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj41MTI8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pn46GdsAAAAgY0hSTQAAbicAAHOvAAEAtAAAgpsAAHHJAADpTwAAMVsAABOcy5g2HwAAT+tJREFUeNrs3WmTXNd9Jvjn7pl5c8/adwCFwk4CpEiCqzZSXCTLkmXLbTtmul909ER09xfwu/kOY0/MdMxEuDumbbctWzal5iZuIsVVJEhsBFFAAbXvuee9mXefF7cAURIXAFWZlZn1/CIYAFigqnTq1r3P/Z9z/kfAX74TgIiIiPYUkUNARETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABARETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABARETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABARETEAEBEREQMAERERMQAQERERAwARERExABAREREDABERETEAEBEREQMAERERMQAQERERAwARERExABARERE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P1zg5wdwvAB+wIc/EQMA0Q68dYaNhn7zUMkjXEi4ULZxdsXEh0sGhpIKBhMqkpqEbExGNiojHZWQiylIRyQkNE4b3Iqq5aHU8JA3HZTqHgp1FwXTRdX2sFi2MVeyMJMPOz+yQQ/RnRPwl+8wKhPtEE0WkYvJGE9r2J/VMJEJFxaOpcI/9+oKOxF+AcP2sWE4uFawMF8OF+zNFi1cK1iYK1nImy7b8BKxAkDUnizXx/LW1rK5koXMVgUgtVUViKsisjEZqUhYIchEJWSi4e+TEQk9se4NCIbtY9N0UGmEb/XFuovi1ht+uRG+5ddsHwXTRdkKKwDFuodi3UXd4YOfiAGAqAPUHR91x8ZyBQDqv/UxSRTQp8sYTqoYSKgYSCgYSaro0RWMplQMJVX06jIisghJECAIgCgAohA2JhIEQMBnfw8IgrD162//GbjzVgY3ptEDAEEQbP36+3/2AyBAcPP3fhCE/y4AvCBAw/WxYbhYroRTJpuGg8WKjdWqg9VquBVz3XDhcdEeEQMAUTfz/ABrNQdVy8dcyUZMCbccRmQRuiqGf1YkRBURCU1ESpOR0CSko+E6gqQWfkxXRKhy+PcjsoiIHPYo0ORwkaK4zWYFN4KD7wcwHR+WG4R77d3woW46PmzXh+H4qDs+KpYXzt/Xw1/LlouqFX7MdDyYjg9ja0ueaYf//Y2P8dlPxABAtCf4AVCzPdRs73M/LgpARBaRjso3txv2xGSkIzKyMQm6GgaBiCwiroWBQVdFxNUwHMS3AoUqCRC3WhvLEn6rzbG09YD3frddrge4friS3vbCh33NDh/WNduDYYcP7ZoVPswrlgfD9lAwPZQaLjZN9+b2vFLdRcP1+YAnYgAgolsNCKbjw3RsrnQnoqbgcmQiIiIGACIiImIAICIiIgYAIiIiYgAgIiIiBgAiIiJiACAiIiIGACIiImIAICIiIgYAIiIiYgAgIiIiBgAiIiJiACAiIiIGACIiImIAICIiIgYAIiIiYgAgIiIiBgAiIiIGACIiImIAICIiIgYAIiIiYgAgIiIiBgAiIiJiACAiIiIGACIiImIAICIiIgYAIiIiYgAgIiIiBgAiIiJiACAiIiIGACIiImIAICIiIgYAIiIiYgAgIiIiBgAiIiIGACIiImIAICIiIgYAIiIiYgAgIiIiBgAiIiJiACAiIiIGACIiImIAICIiIgYAIiIiYgAgIiIiBgAiIiJiACAiIiIGACIiImIAICIiIgYAIiIiYgAgIiIiBgAiIiIGACIiImIAICIiIgYAIiIiYgAgIiIiBgAiIiJiACAiIiIGACIiImIAICIiIgYAIiIiYgAgIiIiBgAiIiJiACAiIiIGACIiImIAICIiIgYAIiIiYgAgIiIiBgAiIiIGACIiImIAICIiIgYAIiIiYgAgIiIiBgAiIiJiACAiIqKO8P8PAJkqi3WN70gIAAAAAElFTkSuQmCC';
    return ampLogo;
    /*eslint-enable */
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
   * @param {PositionInViewportEntryDef} newPos
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
   * @param {PositionInViewportEntryDef} newPos
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
