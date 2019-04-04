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

import {ActionTrust} from '../action-constants';
import {
  EMPTY_METADATA,
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
} from '../mediasession-helper';
import {
  MIN_VISIBILITY_RATIO_FOR_AUTOPLAY,
  PlayingStates,
  VideoAnalyticsEvents,
  VideoAttributes,
  VideoEvents,
  VideoServiceSignals,
  userInteractedWith,
} from '../video-interface';
import {Services} from '../services';
import {VideoSessionManager} from './video-session-manager';
import {VideoUtils, getInternalVideoElementFor} from '../utils/video';
import {clamp} from '../utils/math';
import {
  createCustomEvent,
  getData,
  listen,
  listenOnce,
  listenOncePromise,
} from '../event-helper';
import {dev, devAssert, user, userAssert} from '../log';
import {dict, map} from '../utils/object';
import {getMode} from '../mode';
import {installAutoplayStylesForDoc} from './video/install-autoplay-styles';
import {isFiniteNumber} from '../types';
import {once} from '../utils/function';
import {registerServiceBuilderForDoc} from '../service';
import {removeElement} from '../dom';
import {renderIcon, renderInteractionOverlay} from './video/autoplay';
import {startsWith} from '../string';
import {toggle} from '../style';


/** @private @const {string} */
const TAG = 'video-manager';


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
 * @implements {../service.Disposable}
 */
export class VideoManager {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc}  */
    this.ampdoc = ampdoc;

    /** @const */
    this.installAutoplayStyles = once(() =>
      installAutoplayStylesForDoc(this.ampdoc));

    /** @private {!../service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);

    /** @private {?Array<!VideoEntry>} */
    this.entries_ = null;

    /** @private {boolean} */
    this.scrollListenerInstalled_ = false;

    /** @private @const */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @private @const */
    this.actions_ = Services.actionServiceForDoc(ampdoc.getHeadNode());

    /** @private @const */
    this.boundSecondsPlaying_ = () => this.secondsPlaying_();

    /** @private @const {function():!AutoFullscreenManager} */
    this.getAutoFullscreenManager_ =
        once(() => new AutoFullscreenManager(this.ampdoc, this));

    // TODO(cvializ, #10599): It would be nice to only create the timer
    // if video analytics are present, since the timer is not needed if
    // video analytics are not present.
    this.timer_.delay(this.boundSecondsPlaying_, SECONDS_PLAYED_MIN_DELAY);
  }

  /** @override */
  dispose() {
    if (!this.entries_) {
      return;
    }
    for (let i = 0; i < this.entries_.length; i++) {
      const entry = this.entries_[i];
      entry.dispose();
    }
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
   * @param {!VideoEntry} entry
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
          dict({'time': currentTime, 'percent': perc}));
      this.actions_.trigger(entry.video.element, name, event, ActionTrust.LOW);
    }
  }

  /** @param {!../video-interface.VideoInterface} video */
  register(video) {
    devAssert(video);

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

    element.classList.add('i-amphtml-video-component');

    // Unlike events, signals are permanent. We can wait for `REGISTERED` at any
    // moment in the element's lifecycle and the promise will resolve
    // appropriately each time.
    const signals =
        (/** @type {!../base-element.BaseElement} */ (video)).signals();

    signals.signal(VideoEvents.REGISTERED);

    // Add a class to element to indicate it implements the video interface.
    element.classList.add('i-amphtml-video-interface');
  }

  /**
   * Register common actions such as play, pause, etc... on the video element
   * so they can be called using AMP Actions.
   * For example: <button on="tap:myVideo.play">
   *
   * @param {!../video-interface.VideoOrBaseElementDef} video
   * @private
   */
  registerCommonActions_(video) {
    // Only require ActionTrust.LOW for video actions to defer to platform
    // specific handling (e.g. user gesture requirement for unmuted playback).
    const trust = ActionTrust.LOW;

    registerAction('play', () => video.play(/* isAutoplay */ false));
    registerAction('pause', () => video.pause());
    registerAction('mute', () => video.mute());
    registerAction('unmute', () => video.unmute());
    registerAction('fullscreen', () => video.fullscreenEnter());

    /**
     * @param {string} action
     * @param {function()} fn
     */
    function registerAction(action, fn) {
      video.registerAction(action, () => {
        userInteractedWith(video);
        fn();
      }, trust);
    }
  }

  /**
   * Install the necessary listeners to be notified when a video becomes visible
   * in the viewport.
   *
   * Visibility of a video is defined by being in the viewport AND having
   * {@link MIN_VISIBILITY_RATIO_FOR_AUTOPLAY} of the video element visible.
   *
   * @param {VideoEntry} entry
   * @private
   */
  maybeInstallVisibilityObserver_(entry) {
    const {element} = entry.video;

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

  /**
   * Gets the current analytics details for the given video.
   * Fails silently if the video is not registered.
   * @param {!AmpElement} videoElement
   * @return {!Promise<!VideoAnalyticsDetailsDef|undefined>}
   */
  getAnalyticsDetails(videoElement) {
    const entry = this.getEntryForElement_(videoElement);
    return entry ? entry.getAnalyticsDetails() : Promise.resolve();
  }

  /**
   * Returns whether the video is paused or playing after the user interacted
   * with it or playing through autoplay
   *
   * @param {!../video-interface.VideoInterface} video
   * @return {!../video-interface.PlayingStateDef}
   */
  getPlayingState(video) {
    return this.getEntryForVideo_(video).getPlayingState();
  }

  /**
   * @param {!../video-interface.VideoInterface} video
   * @return {boolean}
   */
  isMuted(video) {
    return this.getEntryForVideo_(video).isMuted();
  }

  /**
   * @param {!../video-interface.VideoInterface} video
   * @return {boolean}
   */
  userInteracted(video) {
    return this.getEntryForVideo_(video).userInteracted();
  }

  /** @param {!VideoEntry} entry */
  registerForAutoFullscreen(entry) {
    this.getAutoFullscreenManager_().register(entry);
  }

  /**
   * @return {!AutoFullscreenManager}
   * @visibleForTesting
   */
  getAutoFullscreenManagerForTesting_() {
    return this.getAutoFullscreenManager_();
  }
}


/**
 * VideoEntry represents an entry in the VideoManager's list.
 */
class VideoEntry {
  /**
   * @param {!VideoManager} manager
   * @param {!../video-interface.VideoOrBaseElementDef} video
   */
  constructor(manager, video) {
    /** @private @const {!VideoManager} */
    this.manager_ = manager;

    /** @private @const {!./ampdoc-impl.AmpDoc}  */
    this.ampdoc_ = manager.ampdoc;

    /** @package @const {!../video-interface.VideoOrBaseElementDef} */
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

    /** @private @const {function(): !AnalyticsPercentageTracker} */
    this.getAnalyticsPercentageTracker_ = once(() =>
      new AnalyticsPercentageTracker(this.ampdoc_.win, this));

    // Autoplay Variables

    /** @private {boolean} */
    this.playCalledByAutoplay_ = false;

    /** @private {boolean} */
    this.pauseCalledByAutoplay_ = false;

    /** @private {?Element} */
    this.internalElement_ = null;

    /** @private {boolean} */
    this.muted_ = false;

    this.hasAutoplay = video.element.hasAttribute(VideoAttributes.AUTOPLAY);

    if (this.hasAutoplay) {
      this.manager_.installAutoplayStyles();
    }

    // Media Session API Variables

    /** @private {!../mediasession-helper.MetadataDef} */
    this.metadata_ = EMPTY_METADATA;

    /** @private @const {function()} */
    this.boundMediasessionPlay_ = () => {
      this.video.play(/* isAutoplay */ false);
    };

    /** @private @const {function()} */
    this.boundMediasessionPause_ = () => {
      this.video.pause();
    };

    listenOncePromise(video.element, VideoEvents.LOAD)
        .then(() => this.videoLoaded());
    listen(video.element, VideoEvents.PAUSE, () => this.videoPaused_());
    listen(video.element, VideoEvents.PLAYING, () => this.videoPlayed_());
    listen(video.element, VideoEvents.MUTED, () => this.muted_ = true);
    listen(video.element, VideoEvents.UNMUTED, () => this.muted_ = false);
    listen(video.element, VideoEvents.ENDED, () => this.videoEnded_());

    listen(video.element, VideoAnalyticsEvents.CUSTOM, e => {
      const data = getData(e);
      const eventType = data['eventType'];
      const vars = data['vars'];
      this.logCustomAnalytics_(
          dev().assertString(eventType, '`eventType` missing'),
          vars);
    });

    video.signals().whenSignal(VideoEvents.REGISTERED)
        .then(() => this.onRegister_());

    /**
     * Trigger event for first manual play.
     * @private @const {!function()}
     */
    this.firstPlayEventOrNoop_ = once(() => {
      const firstPlay = 'firstPlay';
      const trust = ActionTrust.LOW;
      const event = createCustomEvent(this.ampdoc_.win, firstPlay,
          /* detail */ dict({}));
      const {element} = this.video;
      const actions = Services.actionServiceForDoc(element);
      actions.trigger(element, firstPlay, event, trust);
    });

    this.listenForAutoplayDelegation_();
  }

  /** @public */
  dispose() {
    this.getAnalyticsPercentageTracker_().stop();
  }

  /**
   * @param {string} eventType
   * @param {!Object<string, string>} vars
   */
  logCustomAnalytics_(eventType, vars) {
    const prefixedVars = {};

    Object.keys(vars).forEach(key => {
      prefixedVars[`custom_${key}`] = vars[key];
    });

    analyticsEvent(this, eventType, prefixedVars);
  }

  /** Listens for signals to delegate autoplay to a different module. */
  listenForAutoplayDelegation_() {
    const signals = this.video.signals();
    signals.whenSignal(VideoServiceSignals.AUTOPLAY_DELEGATED).then(() => {
      this.allowAutoplay_ = false;

      if (this.isPlaying_) {
        this.video.pause();
      }
    });
  }

  /** @return {boolean} */
  isMuted() {
    return this.muted_;
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
   * @return {boolean}
   * @private
   */
  requiresAutoFullscreen_() {
    const {element} = this.video;
    if (this.video.preimplementsAutoFullscreen() ||
        !element.hasAttribute(VideoAttributes.ROTATE_TO_FULLSCREEN)) {
      return false;
    }
    return userAssert(this.video.isInteractive(),
        'Only interactive videos are allowed to enter fullscreen on rotate. ' +
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

    const {video} = this;
    const {element} = video;

    if (!video.preimplementsMediaSessionAPI() &&
        !element.classList.contains('i-amphtml-disable-mediasession')) {

      setMediaSession(
          element,
          this.ampdoc_.win,
          this.metadata_,
          this.boundMediasessionPlay_,
          this.boundMediasessionPause_);
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

    this.internalElement_ = getInternalVideoElementFor(this.video.element);

    this.fillMediaSessionMetadata_();

    this.getAnalyticsPercentageTracker_().start();

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
   * Only called when visibility of a loaded video changes.
   * @private
   */
  loadedVideoVisibilityChanged_() {
    if (!Services.viewerForDoc(this.ampdoc_).isVisible()) {
      return;
    }
    this.supportsAutoplay_().then(supportsAutoplay => {
      const canAutoplay = this.hasAutoplay &&
          !this.userInteracted();

      if (canAutoplay && supportsAutoplay) {
        this.autoplayLoadedVideoVisibilityChanged_();
      } else {
        this.nonAutoplayLoadedVideoVisibilityChanged_();
      }
    });
  }

  /* Autoplay Behavior */

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

      this.installAutoplayArtifacts_();
    });
  }

  /**
   * Installs autoplay animation and interaction mask when interactive.
   * The animated icon is appended always, but only displayed by CSS when
   * `controls` is set. See `video-autoplay.css`.
   * @private
   */
  installAutoplayArtifacts_() {
    const {video} = this;
    const {element, win} = this.video;

    if (element.hasAttribute(VideoAttributes.NO_AUDIO) ||
        element.signals().get(VideoServiceSignals.USER_INTERACTED)) {
      return;
    }

    const animation = renderIcon(win, element);

    /** @param {boolean} isPlaying */
    const toggleAnimation = isPlaying => {
      video.mutateElement(() => {
        animation.classList.toggle('amp-video-eq-play', isPlaying);
      });
    };

    video.mutateElement(() => {
      element.appendChild(animation);
    });

    const unlisteners = [
      listen(element, VideoEvents.PAUSE, () => toggleAnimation(false)),
      listen(element, VideoEvents.PLAYING, () => toggleAnimation(true)),
    ];

    video.signals().whenSignal(VideoServiceSignals.USER_INTERACTED).then(() => {
      const {video} = this;
      const {element} = video;
      this.firstPlayEventOrNoop_();
      if (video.isInteractive()) {
        video.showControls();
      }
      video.unmute();
      unlisteners.forEach(unlistener => {
        unlistener();
      });
      const animation = element.querySelector('.amp-video-eq');
      const mask = element.querySelector('i-amphtml-video-mask');
      if (animation) {
        removeElement(animation);
      }
      if (mask) {
        removeElement(mask);
      }
    });

    if (!video.isInteractive()) {
      return;
    }

    const mask = renderInteractionOverlay(element);

    /** @param {boolean} display */
    const setMaskDisplay = display => {
      video.mutateElement(() => {
        toggle(mask, display);
      });
    };

    video.hideControls();

    video.mutateElement(() => {
      element.appendChild(mask);
    });

    [
      listen(mask, 'click', () => userInteractedWith(video)),
      listen(element, VideoEvents.AD_START, () => setMaskDisplay(false)),
      listen(element, VideoEvents.AD_END, () => setMaskDisplay(true)),
    ].forEach(unlistener => unlisteners.push(unlistener));
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
   * Called by all possible events that might change the visibility of the video
   * such as scrolling or {@link ../video-interface.VideoEvents#VISIBILITY}.
   * @param {?boolean=} opt_forceVisible
   * @package
   */
  updateVisibility(opt_forceVisible) {
    const wasVisible = this.isVisible_;

    if (opt_forceVisible) {
      this.isVisible_ = true;
    } else {
      const {element} = this.video;
      const ratio = element.getIntersectionChangeEntry().intersectionRatio;
      this.isVisible_ =
          (!isFiniteNumber(ratio) ? 0 : ratio) >=
            MIN_VISIBILITY_RATIO_FOR_AUTOPLAY;
    }

    if (this.isVisible_ != wasVisible) {
      this.videoVisibilityChanged_();
    }
  }

  /**
   * Returns whether the video is paused or playing after the user interacted
   * with it or playing through autoplay
   * @return {!../video-interface.PlayingStateDef}
   */
  getPlayingState() {
    if (!this.isPlaying_) {
      return PlayingStates.PAUSED;
    }

    if (this.isPlaying_
       && this.playCalledByAutoplay_
       && !this.userInteracted()) {
      return PlayingStates.PLAYING_AUTO;
    }

    return PlayingStates.PLAYING_MANUAL;
  }

  /**
   * Returns whether the video was interacted with or not
   * @return {boolean}
   */
  userInteracted() {
    return (
      this.video.signals().get(VideoServiceSignals.USER_INTERACTED) != null);
  }

  /**
   * Collects a snapshot of the current video state for video analytics
   * @return {!Promise<!VideoAnalyticsDetailsDef>}
   */
  getAnalyticsDetails() {
    const {video} = this;
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


/**
 * @param {!AmpElement} video
 * @return {boolean}
 * @restricted
 */
function supportsFullscreenViaApi(video) {
  // TODO(alanorozco): Determine this via a flag in the component itself.
  return !!({
    'amp-dailymotion': true,
    'amp-ima-video': true,
  }[video.tagName.toLowerCase()]);
}


/** Manages rotate-to-fullscreen video. */
export class AutoFullscreenManager {

  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!VideoManager} manager
   */
  constructor(ampdoc, manager) {

    /** @private @const {!VideoManager} */
    this.manager_ = manager;

    /** @private @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {?../video-interface.VideoOrBaseElementDef} */
    this.currentlyInFullscreen_ = null;

    /** @private {?../video-interface.VideoOrBaseElementDef} */
    this.currentlyCentered_ = null;

    /** @private @const {!Array<!../video-interface.VideoOrBaseElementDef>} */
    this.entries_ = [];

    /** @private @const {function()} */
    this.boundSelectBestCentered_ = () => this.selectBestCenteredInPortrait_();

    /**
     * @param {!../video-interface.VideoOrBaseElementDef} video
     * @return {boolean}
     */
    this.boundIncludeOnlyPlaying_ = video =>
      this.getPlayingState_(video) == PlayingStates.PLAYING_MANUAL;

    /**
     * @param {!../video-interface.VideoOrBaseElementDef} a
     * @param {!../video-interface.VideoOrBaseElementDef} b
     * @return {number}
     */
    this.boundCompareEntries_ = (a, b) => this.compareEntries_(a, b);

    this.installOrientationObserver_();
    this.installFullscreenListener_();
  }

  /** @param {!VideoEntry} entry */
  register(entry) {
    const {video} = entry;
    const {element} = video;

    if (!this.canFullscreen_(element)) {
      return;
    }

    this.entries_.push(video);

    listen(element, VideoEvents.PAUSE, this.boundSelectBestCentered_);
    listen(element, VideoEvents.PLAYING, this.boundSelectBestCentered_);
    listen(element, VideoEvents.ENDED, this.boundSelectBestCentered_);

    video.signals().whenSignal(VideoServiceSignals.USER_INTERACTED)
        .then(this.boundSelectBestCentered_);

    // Set always
    this.selectBestCenteredInPortrait_();
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
   * @return {boolean}
   * @visibleForTesting
   */
  isInLandscape() {
    return isLandscape(this.ampdoc_.win);
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
    const internalElement = getInternalVideoElementFor(video);
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
    const {screen} = win;
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
    if (this.isInLandscape()) {
      if (this.currentlyCentered_ != null) {
        this.enter_(this.currentlyCentered_);
      }
      return;
    }
    if (this.currentlyInFullscreen_) {
      this.exit_(this.currentlyInFullscreen_);
    }
  }

  /**
   * @param {!../video-interface.VideoOrBaseElementDef} video
   * @private
   */
  enter_(video) {
    const platform = Services.platformFor(this.ampdoc_.win);

    this.currentlyInFullscreen_ = video;

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
   * @param {!../video-interface.VideoOrBaseElementDef} video
   * @private
   */
  exit_(video) {
    this.currentlyInFullscreen_ = null;

    this.scrollIntoIfNotVisible_(video, 'center')
        .then(() => video.fullscreenExit());
  }

  /**
   * Scrolls to a video if it's not in view.
   * @param {!../video-interface.VideoOrBaseElementDef} video
   * @param {?string=} optPos
   * @private
   */
  scrollIntoIfNotVisible_(video, optPos = null) {
    const {element} = video;
    const viewport = this.getViewport_();

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
      return viewport.animateScrollIntoView(element, pos);
    });
  }

  /** @private */
  getViewport_() {
    return Services.viewportForDoc(this.ampdoc_);
  }

  /** @private @return {!Promise} */
  onceOrientationChanges_() {
    const magicNumber = 330;
    return Services.timerFor(this.ampdoc_.win).promise(magicNumber);
  }

  /** @private */
  selectBestCenteredInPortrait_() {
    if (this.isInLandscape()) {
      return this.currentlyCentered_;
    }

    this.currentlyCentered_ = null;

    const selected = this.entries_
        .filter(this.boundIncludeOnlyPlaying_)
        .sort(this.boundCompareEntries_)[0];

    if (selected) {
      const {intersectionRatio} = selected.element.getIntersectionChangeEntry();
      if (intersectionRatio >= MIN_VISIBILITY_RATIO_FOR_AUTOPLAY) {
        this.currentlyCentered_ = selected;
      }
    }

    return this.currentlyCentered_;
  }

  /**
   * Compares two videos in order to sort them by "best centered".
   * @param {!../video-interface.VideoOrBaseElementDef} a
   * @param {!../video-interface.VideoOrBaseElementDef} b
   * @return {number}
   */
  compareEntries_(a, b) {
    const {
      intersectionRatio: ratioA,
      boundingClientRect: rectA,
    } = a.element.getIntersectionChangeEntry();
    const {
      intersectionRatio: ratioB,
      boundingClientRect: rectB,
    } = b.element.getIntersectionChangeEntry();

    // Prioritize by how visible they are, with a tolerance of 10%
    const ratioTolerance = 0.1;
    const ratioDelta = ratioA - ratioB;
    if (Math.abs(ratioDelta) > ratioTolerance) {
      return ratioDelta;
    }

    // Prioritize by distance from center.
    const viewport = Services.viewportForDoc(this.ampdoc_);
    const centerA = centerDist(viewport, rectA);
    const centerB = centerDist(viewport, rectB);
    if (centerA < centerB ||
        centerA > centerB) {
      return centerA - centerB;
    }

    // Everything else failing, choose the highest element.
    return rectA.top - rectB.top;
  }

  /**
   * @param {!../video-interface.VideoOrBaseElementDef} video
   * @return {string}
   * @private
   */
  getPlayingState_(video) {
    return this.manager_.getPlayingState(
        /** @type {!../video-interface.VideoInterface} */ (video));
  }
}


/**
 * @param {!./viewport/viewport-impl.Viewport} viewport
 * @param {{top: number, height: number}} rect
 * @return {number}
 */
function centerDist(viewport, rect) {
  const centerY = rect.top + (rect.height / 2);
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


/** @visibleForTesting */
export const PERCENTAGE_INTERVAL = 5;

/** @private */
const PERCENTAGE_FREQUENCY_WHEN_PAUSED_MS = 500;

/** @private */
const PERCENTAGE_FREQUENCY_MIN_MS = 250;

/** @private */
const PERCENTAGE_FREQUENCY_MAX_MS = 4000;


/**
 * Calculates the "ideal" analytics check frequency from playback start, e.g.
 * the amount of ms after each PERCENTAGE_INTERVAL.
 * @param {number} durationSeconds
 * @return {number}
 */
function calculateIdealPercentageFrequencyMs(durationSeconds) {
  return durationSeconds * 10 * PERCENTAGE_INTERVAL;
}


/**
 * Calculates the "actual" analytics check frequency by calculating the ideal
 * frequency and clamping it between MIN and MAX.
 * @param {number} durationSeconds
 * @return {number}
 */
function calculateActualPercentageFrequencyMs(durationSeconds) {
  return clamp(
      calculateIdealPercentageFrequencyMs(durationSeconds),
      PERCENTAGE_FREQUENCY_MIN_MS,
      PERCENTAGE_FREQUENCY_MAX_MS);
}


/** @visibleForTesting */
export class AnalyticsPercentageTracker {
  /**
   * @param {!Window} win
   * @param {!VideoEntry} entry
   */
  constructor(win, entry) {

    // This is destructured in `calculate_()`, but the linter thinks it's unused
    /** @private @const {!./timer-impl.Timer} */
    this.timer_ = Services.timerFor(win); // eslint-disable-line

    /** @private @const {!VideoEntry} */
    this.entry_ = entry;

    /** @private {?Array<!UnlistenDef>} */
    this.unlisteners_ = null;

    /** @private {number} */
    this.last_ = 0;

    /**
     * Counter for each trigger `start`. This is to prevent duplicate events if
     * two consecutive triggers take place, or to prevent events firing once
     * the tracker is stopped.
     * @private {number}
     */
    this.triggerId_ = 0;
  }

  /** @public */
  start() {
    const {element} = this.entry_.video;

    this.stop();

    this.unlisteners_ = this.unlisteners_ || [];

    this.unlisteners_.push(
        listenOnce(element, VideoEvents.LOADEDMETADATA, () => {
          if (this.hasDuration_()) {
            this.calculate_(this.triggerId_);
          }
        }),

        listen(element, VideoEvents.ENDED, () => {
          if (this.hasDuration_()) {
            this.maybeTrigger_(/* normalizedPercentage */ 100);
          }
        }));
  }

  /** @public */
  stop() {
    if (!this.unlisteners_) {
      return;
    }
    while (this.unlisteners_.length > 0) {
      this.unlisteners_.pop().call();
    }
    this.triggerId_++;
  }

  /**
   * @return {boolean}
   * @private
   */
  hasDuration_() {
    const {video} = this.entry_;
    const duration = video.getDuration();

    // Livestreams or videos with no duration information available.
    if (!duration ||
      isNaN(duration) ||
      duration <= 0) {
      return false;
    }

    if (calculateIdealPercentageFrequencyMs(duration) <
        PERCENTAGE_FREQUENCY_MIN_MS) {

      const bestResultLength = Math.ceil(
          PERCENTAGE_FREQUENCY_MIN_MS * (100 / PERCENTAGE_INTERVAL) / 1000);

      this.warnForTesting_(
          'This video is too short for `video-percentage-played`. ' +
          'Reports may be innacurate. For best results, use videos over',
          bestResultLength,
          'seconds long.',
          video.element);
    }

    return true;
  }

  /**
   * @param  {...*} args
   * @private
   */
  warnForTesting_(...args) {
    user().warn.apply(user(), [TAG].concat(args));
  }

  /**
   * @param {number=} triggerId
   * @private
   */
  calculate_(triggerId) {
    if (triggerId != this.triggerId_) {
      return;
    }

    const {
      entry_: entry,
      timer_: timer,
    } = this;
    const {video} = entry;

    const calculateAgain = () => this.calculate_(triggerId);

    if (entry.getPlayingState() == PlayingStates.PAUSED) {
      timer.delay(calculateAgain, PERCENTAGE_FREQUENCY_WHEN_PAUSED_MS);
      return;
    }

    const duration = video.getDuration();

    const frequencyMs = calculateActualPercentageFrequencyMs(duration);

    const percentage = (video.getCurrentTime() / duration) * 100;
    const normalizedPercentage =
      Math.floor(percentage / PERCENTAGE_INTERVAL) * PERCENTAGE_INTERVAL;

    devAssert(isFiniteNumber(normalizedPercentage));

    this.maybeTrigger_(normalizedPercentage);

    timer.delay(calculateAgain, frequencyMs);
  }

  /**
   * @param {number} normalizedPercentage
   * @private
   */
  maybeTrigger_(normalizedPercentage) {
    if (normalizedPercentage <= 0) {
      return;
    }

    if (this.last_ == normalizedPercentage) {
      return;
    }

    this.last_ = normalizedPercentage;

    this.analyticsEventForTesting_(normalizedPercentage);
  }

  /**
   * @param {number} normalizedPercentage
   * @private
   */
  analyticsEventForTesting_(normalizedPercentage) {
    analyticsEvent(this.entry_, VideoAnalyticsEvents.PERCENTAGE_PLAYED, {
      'normalizedPercentage': normalizedPercentage.toString(),
    });
  }
}


/**
 * @param {!VideoEntry} entry
 * @param {!VideoAnalyticsEvents|string} eventType
 * @param {!Object<string, string>=} opt_vars A map of vars and their values.
 * @private
 */
function analyticsEvent(entry, eventType, opt_vars) {
  const {video} = entry;

  entry.getAnalyticsDetails().then(details => {
    if (opt_vars) {
      Object.assign(details, opt_vars);
    }
    video.element.dispatchCustomEvent(eventType, details);
  });
}


/** @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc */
export function installVideoManagerForDoc(nodeOrDoc) {
  registerServiceBuilderForDoc(nodeOrDoc, 'video-manager', VideoManager);
}
