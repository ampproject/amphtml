
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
  asBaseElement,
} from '../video-interface';
import {Services} from '../services';
import {VideoServiceSync} from './video-service-sync-impl';
import {VideoSessionManager} from './video-session-manager';
import {VideoUtils} from '../utils/video';
import {
  createCustomEvent,
  getData,
  listen,
  listenOncePromise,
} from '../event-helper';
import {dev, user} from '../log';
import {getMode} from '../mode';
import {isFiniteNumber} from '../types';
import {map} from '../utils/object';
import {once} from '../utils/function';
import {registerServiceBuilderForDoc} from '../service';
import {removeElement} from '../dom';
import {setStyles} from '../style';
import {startsWith} from '../string';
import {throttle} from '../utils/rate-limit';


/** @private @const {string} */
const TAG = 'video-manager';


/** @typedef {../video-interface.VideoAnalyticsDetailsDef} */
let VideoAnalyticsDef; // alias for line length


/**
 * Internal event triggered when a video's visibility changes.
 * @private @const {string}
 */
const VISIBILITY_CHANGED = 'amp:visibilitychanged';


/** @interface */
export class VideoService {

  /** @param {!../video-interface.VideoInterface} unusedVideo */
  register(unusedVideo) {}

  /**
   * Gets the current analytics details for the given video.
   * Fails silently if the video is not registered.
   * @param {!AmpElement} unusedVideo
   * @return {!Promise<!VideoAnalyticsDef>|!Promise<void>}
   */
  getAnalyticsDetails(unusedVideo) {}

  /**
   * Delegates autoplay.
   * @param {!AmpElement} unusedVideo
   * @param {!../observable.Observable<boolean>=} opt_unusedObservable
   *    If provided, video will be played or paused when this observable fires.
   */
  delegateAutoplay(unusedVideo, opt_unusedObservable) {}
}


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
 * VideoManager keeps track of all AMP video players that implement
 * the common Video API {@see ../video-interface.VideoInterface}.
 *
 * It is responsible for providing a unified user experience and analytics for
 * all videos within a document.
 *
 * @implements {VideoService}
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

    /** @private @const */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @private @const */
    this.actions_ = Services.actionServiceForDoc(ampdoc);

    /** @private @const */
    this.boundSecondsPlaying_ = () => this.secondsPlaying_();

    /** @private @const {function():!AutoFullscreenManager} */
    this.getAutoFullscreenManager_ =
        once(() => new AutoFullscreenManager(this.ampdoc));

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

  /** @override */
  register(video) {
    dev().assert(video);

    this.registerCommonActions_(video);

    if (!video.supportsPlatform()) {
      return;
    }

    this.entries_ = this.entries_ || [];
    const entry = new VideoEntry(this, video);
    this.maybeInstallVisibilityObserver_(entry);
    this.entries_.push(entry);

    const {element} = entry.video;
    element.dispatchCustomEvent(VideoEvents.REGISTERED);

    // Unlike events, signals are permanent. We can wait for `REGISTERED` at any
    // moment in the element's lifecycle and the promise will resolve
    // appropriately each time.
    element.signals().signal(VideoEvents.REGISTERED);

    // Add a class to element to indicate it implements the video interface.
    element.classList.add('i-amphtml-video-interface');
  }

  /** @override */
  delegateAutoplay(videoElement, opt_unusedObservable) {
    videoElement.signals().whenSignal(VideoEvents.REGISTERED).then(() => {
      const entry = this.getEntryForElement_(videoElement);
      entry.delegateAutoplay();
    });
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
    const videoImpl = asBaseElement(video);

    // Only require ActionTrust.LOW for video actions to defer to platform
    // specific handling (e.g. user gesture requirement for unmuted playback).
    const trust = ActionTrust.LOW;

    videoImpl.registerAction('play', () => video.play(/* isAutoplay */ false),
        trust);
    videoImpl.registerAction('pause', () => video.pause(), trust);
    videoImpl.registerAction('mute', () => video.mute(), trust);
    videoImpl.registerAction('unmute', () => video.unmute(), trust);
    videoImpl.registerAction('fullscreen', () => video.fullscreenEnter(),
        trust);
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
    const element = entry.video.element;

    listen(element, VideoEvents.VISIBILITY, details => {
      const data = getData(details);
      if (data && data['visible'] == true) {
        entry.updateVisibility(/* opt_forceVisible */ true);
      } else {
        entry.updateVisibility();
      }
    });

    listen(element, VideoEvents.RELOAD, () => {
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

  /** @override */
  getAnalyticsDetails(videoElement) {
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

  /** @param {!VideoEntry} entry */
  registerForAutoFullscreen(entry) {
    this.getAutoFullscreenManager_().register(entry);
  }
}


/**
 * This union type allows the compiler to treat VideoInterface objects as
 * `BaseElement`s, which they should be anyway.
 *
 * WARNING: Don't use this at the service level. Its `register` method should
 * only allow `VideoInterface` as a guarding measure.
 *
 * @typedef {!../video-interface.VideoInterface|!../base-element.BaseElement}
 */
let VideoOrBaseElementDef;


/**
 * @param {!Element} element
 * @return {!Element}
 * @restricted
 */
function getInternalElementFor(element) {
  return dev().assertElement(element.querySelector('video, iframe'));
}


/**
 * VideoEntry represents an entry in the VideoManager's list.
 */
class VideoEntry {
  /**
   * @param {!VideoManager} manager
   * @param {!VideoOrBaseElementDef} video
   */
  constructor(manager, video) {
    /** @private @const {!VideoManager} */
    this.manager_ = manager;

    /** @private @const {!./ampdoc-impl.AmpDoc}  */
    this.ampdoc_ = manager.ampdoc;

    /** @package @const {!VideoOrBaseElementDef} */
    this.video = video;

    /** @private {boolean} */
    this.allowAutoplay_ = true;

    /** @private {boolean} */
    this.loaded_ = false;

    /** @private {boolean} */
    this.isPlaying_ = false;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private @const */
    this.actionSessionManager_ = new VideoSessionManager();

    this.actionSessionManager_.onSessionEnd(
        () => analyticsEvent(this, VideoAnalyticsEvents.SESSION));

    /** @private @const */
    this.visibilitySessionManager_ = new VideoSessionManager();

    this.visibilitySessionManager_.onSessionEnd(
        () => analyticsEvent(this, VideoAnalyticsEvents.SESSION_VISIBLE));

    /** @private @const {function(): !Promise<boolean>} */
    this.supportsAutoplay_ = () => {
      const {win} = this.ampdoc_;
      return VideoUtils.isAutoplaySupported(win, getMode(win).lite);
    };

    // Autoplay Variables

    /** @private {boolean} */
    this.userInteractedWithAutoPlay_ = false;

    /** @private {boolean} */
    this.playCalledByAutoplay_ = false;

    /** @private {boolean} */
    this.pauseCalledByAutoplay_ = false;

    /** @private {?Element} */
    this.internalElement_ = null;

    /** @private {boolean} */
    this.muted_ = false;

    this.hasAutoplay = video.element.hasAttribute(VideoAttributes.AUTOPLAY);

    // Media Session API Variables

    /** @private {!../mediasession-helper.MetadataDef} */
    this.metadata_ = EMPTY_METADATA;

    listenOncePromise(video.element, VideoEvents.LOAD)
        .then(() => this.videoLoaded());
    listen(video.element, VideoEvents.PAUSE, () => this.videoPaused_());
    listen(video.element, VideoEvents.PLAYING, () => this.videoPlayed_());
    listen(video.element, VideoEvents.MUTED, () => this.muted_ = true);
    listen(video.element, VideoEvents.UNMUTED, () => this.muted_ = false);
    listen(video.element, VideoEvents.ENDED, () => this.videoEnded_());

    video.element.signals().whenSignal(VideoEvents.REGISTERED)
        .then(() => this.onRegister_());

    /**
     * Trigger event for first manual play.
     * @private @const {!function()}
     */
    this.firstPlayEventOrNoop_ = once(() => {
      const firstPlay = 'firstPlay';
      const trust = ActionTrust.LOW;
      const event = createCustomEvent(this.ampdoc_.win, firstPlay,
          /* detail */ {});
      const actions = Services.actionServiceForDoc(this.ampdoc_);
      actions.trigger(this.video.element, firstPlay, event, trust);
    });
  }

  /** Delegates autoplay to a different module. */
  delegateAutoplay() {
    this.allowAutoplay_ = false;

    if (this.isPlaying_) {
      this.video.pause();
    }
  }

  /** @private */
  onRegister_() {
    if (this.requiresAutoFullscreen_()) {
      this.manager_.registerForAutoFullscreen(this);
    }

    this.updateVisibility();
    if (this.hasAutoplay) {
      this.autoplayVideoBuilt_();
    }
  }

  /**
   * @retun {boolean}
   * @private
   */
  requiresAutoFullscreen_() {
    const element = this.video.element;
    if (this.video.preimplementsAutoFullscreen() ||
        !element.hasAttribute(VideoAttributes.ROTATE_TO_FULLSCREEN)) {
      return false;
    }
    return user().assert(this.video.isInteractive(),
        'Only interactive videos are allowed to enter fullscreen on rotate.',
        'Set the `controls` attribute on %s to enable.',
        element);
  }

  /**
   * Callback for when the video starts playing
   * @private
   */
  videoPlayed_() {
    this.isPlaying_ = true;

    if (this.getPlayingState() == PlayingStates.PLAYING_MANUAL) {
      this.firstPlayEventOrNoop_();
    }

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

    this.internalElement_ = getInternalElementFor(this.video.element);

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
    this.video.element.dispatchCustomEvent(VISIBILITY_CHANGED);
  }

  /**
   * Only called when visibility of a loaded video changes.
   * @private
   */
  loadedVideoVisibilityChanged_() {
    if (!Services.viewerForDoc(this.ampdoc_).isVisible()) {
      return;
    }
    this.supportsAutoplay_().then(supportsAutoplay => {
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

    this.supportsAutoplay_().then(supportsAutoplay => {
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
      this.video.mutateElement(() => {
        animation.classList.toggle('amp-video-eq-play', playing);
      });
    };

    // Hide the controls.
    this.video.hideControls();

    // Create autoplay animation and the mask to detect user interaction.
    const animation = this.createAutoplayAnimation_();
    const mask = this.createAutoplayMask_();
    this.video.mutateElement(() => {
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
      this.firstPlayEventOrNoop_();
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
   * @param {?boolean=} opt_forceVisible
   * @package
   */
  updateVisibility(opt_forceVisible) {
    const wasVisible = this.isVisible_;

    this.video.measureMutateElement(() => {
      if (opt_forceVisible == true) {
        this.isVisible_ = true;
      } else {
        // Calculate what percentage of the video is in viewport.
        const change = this.video.element.getIntersectionChangeEntry();
        const visiblePercent = !isFiniteNumber(change.intersectionRatio) ? 0
          : change.intersectionRatio * 100;
        this.isVisible_ = visiblePercent >= VISIBILITY_PERCENT;
      }
    }, () => {
      if (this.isVisible_ != wasVisible) {
        this.videoVisibilityChanged_();
      }
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
    return this.supportsAutoplay_().then(supportsAutoplay => {
      const {width, height} = video.element.getLayoutBox();
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


/** @private @const {string} */
const AUTO_FULLSCREEN_ID_PROP = '__AMP_AUTO_FULLSCREEN_ID__';


/**
 * @param {!AmpElement} video
 * @return {boolean}
 * @restricted
 */
function supportsFullscreenViaApi(video) {
  // TODO(alanorozco): Determine this via a flag in the component itself.
  return video.tagName.toLowerCase() == 'amp-dailymotion';
}


/** Manages rotate-to-fullscreen video. */
export class AutoFullscreenManager {

  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    const {win} = ampdoc;

    /** @private @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {number} */
    this.nextId_ = 0;

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?VideoEntry} */
    this.currentlyInFullscreen_ = null;

    /** @private {?Element} */
    this.currentlyCentered_ = null;

    /** @private @const {!Array<!Element>} */
    this.visibleElements_ = [];

    /**
     * Maps rotate-to-fullscreen entry id to entry.
     * @private @const {!Object<string, !VideoEntry>}
     */
    this.entries_ = {};

    /** @private @const {function()} */
    this.trackOnScroll_ = once(() =>
      Services.viewportForDoc(ampdoc).onScroll(
          throttle(this.ampdoc_.win, () => this.selectOnScroll_(), 300)));

    this.installOrientationObserver_();
    this.installFullscreenListener_();
  }

  /** @param {!VideoEntry} entry */
  register(entry) {
    if (!this.canFullscreen_(entry.video.element)) {
      return;
    }

    const id = this.nextId_++;
    const {element} = entry.video;

    element[AUTO_FULLSCREEN_ID_PROP] = id.toString();

    this.entries_[id.toString()] = entry;

    listen(element, VISIBILITY_CHANGED, e => {
      if (isLandscape(this.ampdoc_.win)) {
        return;
      }
      this.updateVisibility_(dev().assertElement(e.target));
    });

    this.trackOnScroll_();

    // Set always
    this.updateVisibility_(element);
  }

  /** @private */
  installFullscreenListener_() {
    const root = this.ampdoc_.getRootNode();
    const exitHandler = () => this.onFullscreenExit_();
    listen(root, 'webkitfullscreenchange', exitHandler);
    listen(root, 'mozfullscreenchange', exitHandler);
    listen(root, 'fullscreenchange', exitHandler);
    listen(root, 'MSFullscreenChange', exitHandler);
  }

  /**
   * @param {!AmpElement} video
   * @return {boolean}
   * @private
   */
  canFullscreen_(video) {
    // Safari and iOS can only fullscreen <video> elements directly. In cases
    // where the player component is implemented via an <iframe>, we need to
    // rely on a postMessage API to fullscreen. Such an API is not necessarily
    // provided by every player.
    const internalElement = getInternalElementFor(video);
    if (internalElement.tagName.toLowerCase() == 'video') {
      return true;
    }
    const platform = Services.platformFor(this.ampdoc_.win);
    if (!(platform.isIos() || platform.isSafari())) {
      return true;
    }
    return supportsFullscreenViaApi(video);
  }

  /** @private */
  onFullscreenExit_() {
    this.currentlyInFullscreen_ = null;
  }

  /** @private */
  installOrientationObserver_() {
    // TODO(alanorozco) Update based on support
    const {win} = this.ampdoc_;
    const screen = win.screen;
    // Chrome considers 'orientationchange' to be an untrusted event, but
    // 'change' on screen.orientation is considered a user interaction.
    // We still need to listen to 'orientationchange' on Chrome in order to
    // exit fullscreen since 'change' does not fire in this case.
    if (screen && 'orientation' in screen) {
      const orient = /** @type {!ScreenOrientation} */ (screen.orientation);
      listen(orient, 'change', () => this.onRotation_());
    }
    // iOS Safari does not have screen.orientation but classifies
    // 'orientationchange' as a user interaction.
    listen(win, 'orientationchange', () => this.onRotation_());
  }

  /** @private */
  onRotation_() {
    if (isLandscape(this.ampdoc_.win)) {
      if (!this.currentlyCentered_) {
        return;
      }
      this.enter_(this.getEntryForElement_(this.currentlyCentered_));
      return;
    }
    if (this.currentlyInFullscreen_) {
      this.exit_(this.currentlyInFullscreen_);
    }
  }

  /**
   * @param {!VideoEntry} entry
   * @private
   */
  enter_(entry) {
    const {video} = entry;

    if (entry.getPlayingState() !== PlayingStates.PLAYING_MANUAL) {
      return;
    }

    const platform = Services.platformFor(this.win_);

    this.currentlyInFullscreen_ = entry;

    if (platform.isAndroid() && platform.isChrome()) {
      // Chrome on Android somehow knows what we're doing and executes a nice
      // transition by default. Delegating to browser.
      video.fullscreenEnter();
      return;
    }

    this.scrollIntoIfNotVisible_(video)
        .then(() => video.fullscreenEnter());
  }

  /**
   * @param {!VideoEntry} entry
   * @private
   */
  exit_(entry) {
    this.currentlyInFullscreen_ = null;

    const {video} = entry;

    this.scrollIntoIfNotVisible_(video, 'center')
        .then(() => video.fullscreenExit());
  }

  /**
   * Scrolls to a video if it's not in view.
   * @param {!VideoOrBaseElementDef} video
   * @param {?string=} optPos
   * @private
   */
  scrollIntoIfNotVisible_(video, optPos = null) {
    const {element} = video;
    const viewport = this.getViewport_();

    const duration = 300;
    const curve = 'ease-in';

    return this.onceOrientationChanges_().then(() => {
      const {boundingClientRect} = element.getIntersectionChangeEntry();
      const {top, bottom} = boundingClientRect;
      const vh = viewport.getSize().height;
      const fullyVisible = top >= 0 && bottom <= vh;
      if (fullyVisible) {
        return Promise.resolve();
      }
      const pos = optPos ? dev().assertString(optPos) :
        bottom > vh ? 'bottom' : 'top';
      return viewport.animateScrollIntoView(element, duration, curve, pos);
    });
  }

  /** @private */
  getViewport_() {
    return Services.viewportForDoc(this.ampdoc_);
  }

  /** @private @return {!Promise} */
  onceOrientationChanges_() {
    const magicNumber = 330;
    return Services.timerFor(this.win_).promise(magicNumber);
  }

  /**
   * @param {!AmpElement} element
   * @private
   */
  updateVisibility_(element) {
    const intersectionChangeEntry = element.getIntersectionChangeEntry();
    const isVisible = intersectionChangeEntry.intersectionRatio > 0.75;
    const i = this.visibleElements_.indexOf(element);

    if (!isVisible) {
      if (i >= 0) {
        this.visibleElements_.splice(i, 1);
      }
      return;
    }

    if (i < 0) {
      this.visibleElements_.push(element);
    }

    this.selectBestCenteredInPortrait_();
  }

  /** @private */
  selectOnScroll_() {
    if (isLandscape(this.ampdoc_.win)) {
      return;
    }
    this.selectBestCenteredInPortrait_();
  }

  /** @private */
  selectBestCenteredInPortrait_() {
    this.currentlyCentered_ = null;
    this.visibleElements_
        .map(el => Object.assign({target: el}, el.getIntersectionChangeEntry()))
        .sort((a, b) => this.compareIntersectionEntries_(a, b))
        .forEach((entry, i) => {
          if (entry.intersectionRatio >= 0.8 && i == 0) {
            this.currentlyCentered_ = entry.target;
          }
        });
    return this.currentlyCentered_;
  }

  /**
   * Compares two intersection entries in order to sort them by "best centered".
   * @param {!IntersectionObserverEntry} a
   * @param {!IntersectionObserverEntry} b
   * @return {number}
   */
  compareIntersectionEntries_(a, b) {
    // Prioritize videos that are playing
    const aPlayingState = this.getEntryForElement_(a.target).getPlayingState();
    const bPlayingState = this.getEntryForElement_(b.target).getPlayingState();
    if (aPlayingState == PlayingStates.PLAYING_MANUAL &&
        bPlayingState != PlayingStates.PLAYING_MANUAL) {
      return -1;
    }
    if (aPlayingState != PlayingStates.PLAYING_MANUAL &&
        bPlayingState == PlayingStates.PLAYING_MANUAL) {
      return 1;
    }

    // Prioritize by how visible they are, with a tolerance of 10%
    const ratioTolerance = 0.1;
    const ratioDelta = (a.intersectionRatio - b.intersectionRatio);
    if (ratioDelta < -ratioTolerance) {
      return -1;
    }
    if (ratioDelta > ratioTolerance) {
      return 1;
    }

    // Prioritize by distance from center.
    const viewport = Services.viewportForDoc(this.ampdoc_);
    const aCenter = centerDist(viewport, a.boundingClientRect);
    const bCenter = centerDist(viewport, b.boundingClientRect);
    if (aCenter < bCenter) {
      return -1;
    }
    if (aCenter > bCenter) {
      return 1;
    }

    // Everything else failing, choose the highest element.
    const topDelta = (a.boundingClientRect.top - b.boundingClientRect.top);
    return topDelta < 0 ? -1 : (topDelta > 0 ? 1 : 0);
  }

  /**
   * @param {!Element} element
   * @return {!VideoEntry}
   * @private
   */
  getEntryForElement_(element) {
    const id = dev().assertString(element[AUTO_FULLSCREEN_ID_PROP]);
    return dev().assert(this.entries_[id]);
  }
}


/**
 * @param {!./viewport/viewport-impl.Viewport} viewport
 * @param {{top: number, height: number}} rect
 * @return {number}
 */
function centerDist(viewport, rect) {
  const centerY = rect.top + rect.height / 2;
  const centerViewport = viewport.getSize().height / 2;
  return Math.abs(centerY - centerViewport);
}


/**
 * @param {!Window} win
 * @return {boolean}
 */
function isLandscape(win) {
  if (win.screen && 'orientation' in win.screen) {
    return startsWith(win.screen.orientation.type, 'landscape');
  }
  return Math.abs(win.orientation) == 90;
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


/** @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc */
// TODO(alanorozco, #13674): Rename to `installVideoServiceForDoc`
export function installVideoManagerForDoc(nodeOrDoc) {
  // TODO(alanorozco, #13674): Rename to `video-service`
  registerServiceBuilderForDoc(nodeOrDoc, 'video-manager', ampdoc => {
    const {win} = ampdoc;
    if (VideoServiceSync.shouldBeUsedIn(win)) {
      return new VideoServiceSync(ampdoc);
    }
    return new VideoManager(ampdoc);
  });
}
