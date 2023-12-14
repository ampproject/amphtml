import {ActionTrust_Enum} from '#core/constants/action-constants';
import {dispatchCustomEvent, removeElement} from '#core/dom';
import {measureIntersection} from '#core/dom/layout/intersection';
import {createViewportObserver} from '#core/dom/layout/viewport-observer';
import {toggle} from '#core/dom/style';
import {
  getInternalVideoElementFor,
  isAutoplaySupported,
  tryPlay,
} from '#core/dom/video';
import {clamp} from '#core/math';
import {isFiniteNumber} from '#core/types';
import {once} from '#core/types/function';
import {map} from '#core/types/object';

import {Services} from '#service';

import {
  createCustomEvent,
  getData,
  listen,
  listenOnce,
} from '#utils/event-helper';
import {dev, devAssert, user, userAssert} from '#utils/log';

import {renderIcon, renderInteractionOverlay} from './video/autoplay';
import {installAutoplayStylesForDoc} from './video/install-autoplay-styles';
import {VideoSessionManager} from './video-session-manager';

import {
  EMPTY_METADATA,
  parseFavicon,
  parseOgImage,
  parseSchemaImage,
  setMediaSession,
  validateMediaMetadata,
} from '../mediasession-helper';
import {registerServiceBuilderForDoc} from '../service-helpers';
import {
  MIN_VISIBILITY_RATIO_FOR_AUTOPLAY,
  PlayingStates_Enum,
  VideoAnalyticsEvents_Enum,
  VideoAttributes_Enum,
  VideoEvents_Enum,
  VideoServiceSignals_Enum,
  setIsMediaComponent,
  userInteractedWith,
  videoAnalyticsCustomEventTypeKey,
} from '../video-interface';

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
      installAutoplayStylesForDoc(this.ampdoc)
    );

    /** @private {?Array<!VideoEntry>} */
    this.entries_ = null;

    /** @private {IntersectionObserver} */
    this.viewportObserver_ = null;

    /**
     * Keeps last found entry as a small optimization for multiple state calls
     * during one task.
     * @private {?VideoEntry}
     */
    this.lastFoundEntry_ = null;

    /** @private @const */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @private @const */
    this.actions_ = Services.actionServiceForDoc(ampdoc.getHeadNode());

    /**
     * @private
     * @const
     * @return {undefined}
     */
    this.boundSecondsPlaying_ = () => this.secondsPlaying_();

    /** @private @const {function():!AutoFullscreenManager} */
    this.getAutoFullscreenManager_ = once(
      () => new AutoFullscreenManager(this.ampdoc, this)
    );

    // TODO(cvializ, #10599): It would be nice to only create the timer
    // if video analytics are present, since the timer is not needed if
    // video analytics are not present.
    this.timer_.delay(this.boundSecondsPlaying_, SECONDS_PLAYED_MIN_DELAY);
  }

  /** @override */
  dispose() {
    this.getAutoFullscreenManager_().dispose();
    this.viewportObserver_.disconnect();
    this.viewportObserver_ = null;

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
      if (entry.getPlayingState() !== PlayingStates_Enum.PAUSED) {
        analyticsEvent(entry, VideoAnalyticsEvents_Enum.SECONDS_PLAYED);
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
    if (
      isFiniteNumber(currentTime) &&
      isFiniteNumber(duration) &&
      duration > 0
    ) {
      const perc = currentTime / duration;
      const event = createCustomEvent(this.ampdoc.win, `${TAG}.${name}`, {
        'time': currentTime,
        'percent': perc,
      });
      this.actions_.trigger(
        entry.video.element,
        name,
        event,
        ActionTrust_Enum.LOW
      );
    }
  }

  // TODO(#30723): create unregister() for cleanup.
  /** @param {!../video-interface.VideoInterface} video */
  register(video) {
    devAssert(video);
    const videoBE = /** @type {!AMP.BaseElement} */ (video);

    this.registerCommonActions_(video);

    if (!video.supportsPlatform()) {
      return;
    }

    if (this.getEntryOrNull_(video)) {
      // already registered
      return;
    }

    if (!this.viewportObserver_) {
      const viewportCallback = (
        /** @type {!Array<!IntersectionObserverEntry>} */ records
      ) =>
        records.forEach(({isIntersecting, target}) => {
          this.getEntry_(target).updateVisibility(
            /* isVisible */ isIntersecting
          );
        });
      this.viewportObserver_ = createViewportObserver(
        viewportCallback,
        this.ampdoc.win,
        {threshold: MIN_VISIBILITY_RATIO_FOR_AUTOPLAY}
      );
    }
    this.viewportObserver_.observe(videoBE.element);
    listen(videoBE.element, VideoEvents_Enum.RELOAD, () => entry.videoLoaded());

    this.entries_ = this.entries_ || [];
    const entry = new VideoEntry(this, video);
    this.entries_.push(entry);

    const {element} = entry.video;
    dispatchCustomEvent(element, VideoEvents_Enum.REGISTERED);

    setIsMediaComponent(element);

    // Unlike events, signals are permanent. We can wait for `REGISTERED` at any
    // moment in the element's lifecycle and the promise will resolve
    // appropriately each time.
    const signals = /** @type {!../base-element.BaseElement} */ (
      video
    ).signals();

    signals.signal(VideoEvents_Enum.REGISTERED);

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
    // Only require ActionTrust_Enum.LOW for video actions to defer to platform
    // specific handling (e.g. user gesture requirement for unmuted playback).
    const trust = ActionTrust_Enum.LOW;

    registerAction('play', () => tryPlay(video, /* isAutoplay */ false));
    registerAction('pause', () => video.pause());
    registerAction('mute', () => video.mute());
    registerAction('unmute', () => video.unmute());

    // fullscreen/fullscreenenter are a special case.
    // - fullscreenenter is kept as a standard name for symmetry with internal
    //   internal interfaces
    // - fullscreen is an undocumented alias for backwards compatibility.
    const fullscreenEnter = () => video.fullscreenEnter();
    registerAction('fullscreenenter', fullscreenEnter);
    registerAction('fullscreen', fullscreenEnter);

    /**
     * @param {string} action
     * @param {function()} fn
     */
    function registerAction(action, fn) {
      const videoBE = /** @type {!AMP.BaseElement} */ (video);
      videoBE.registerAction(
        action,
        () => {
          userInteractedWith(video);
          fn();
        },
        trust
      );
    }
  }

  /**
   * Returns the entry in the video manager corresponding to the video or
   * element provided, or null if unavailable.
   * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
   * @return {?VideoEntry} entry
   */
  getEntryOrNull_(videoOrElement) {
    if (isEntryFor(this.lastFoundEntry_, videoOrElement)) {
      return this.lastFoundEntry_;
    }

    for (let i = 0; this.entries_ && i < this.entries_.length; i++) {
      const entry = this.entries_[i];
      if (isEntryFor(entry, videoOrElement)) {
        this.lastFoundEntry_ = entry;
        return entry;
      }
    }

    return null;
  }

  /**
   * Returns the entry in the video manager corresponding to the video or
   * element provided
   * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
   * @return {VideoEntry} entry
   */
  getEntry_(videoOrElement) {
    return devAssert(
      this.getEntryOrNull_(videoOrElement),
      '%s not registered to VideoManager',
      videoOrElement.element || videoOrElement
    );
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

  /**
   * Gets the current analytics details property for the given video.
   * Fails silently if the video is not registered.
   * @param {string} id
   * @param {string} property
   * @return {!Promise<string>}
   */
  getVideoStateProperty(id, property) {
    const root = this.ampdoc.getRootNode();
    const videoElement = user().assertElement(
      root.getElementById(/** @type {string} */ (id)),
      `Could not find an element with id="${id}" for VIDEO_STATE`
    );
    const entry = this.getEntry_(videoElement);
    return (entry ? entry.getAnalyticsDetails() : Promise.resolve()).then(
      (details) => (details ? details[property] : '')
    );
  }

  // TODO(go.amp.dev/issue/27010): For getters below, let's expose VideoEntry
  // instead and use directly. This is better for size and sanity. Users can
  // also then keep the entry reference for their own use.
  // (Can't expose yet due to package-level methods to be restructured, e.g
  // videoLoaded(). See issue)

  /**
   * Returns whether the video is paused or playing after the user interacted
   * with it or playing through autoplay
   *
   * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
   * @return {!../video-interface.PlayingStateDef}
   */
  getPlayingState(videoOrElement) {
    return this.getEntry_(videoOrElement).getPlayingState();
  }

  /**
   * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
   * @return {boolean}
   */
  isMuted(videoOrElement) {
    return this.getEntry_(videoOrElement).isMuted();
  }

  /**
   * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
   * @return {boolean}
   */
  userInteracted(videoOrElement) {
    return this.getEntry_(videoOrElement).userInteracted();
  }

  /**
   * @param {!../video-interface.VideoOrBaseElementDef|!Element} videoOrElement
   * @return {boolean}
   */
  isRollingAd(videoOrElement) {
    return this.getEntry_(videoOrElement).isRollingAd();
  }

  /**
   * @param {!VideoEntry} entryBeingPlayed
   */
  pauseOtherVideos(entryBeingPlayed) {
    this.entries_.forEach((entry) => {
      if (
        entry.isPlaybackManaged() &&
        entry !== entryBeingPlayed &&
        entry.getPlayingState() == PlayingStates_Enum.PLAYING_MANUAL
      ) {
        entry.video.pause();
      }
    });
  }
}

/**
 * @param {?VideoEntry=} entry
 * @param {?../video-interface.VideoOrBaseElementDef|!Element=} videoOrElement
 * @return {boolean}
 */
const isEntryFor = (entry, videoOrElement) =>
  !!entry &&
  (entry.video === videoOrElement || entry.video.element === videoOrElement);

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
    this.managePlayback_ = true;

    /** @private {boolean} */
    this.loaded_ = false;

    /** @private {boolean} */
    this.isPlaying_ = false;

    /** @private {boolean} */
    this.isRollingAd_ = false;

    /** @private {boolean} */
    this.isVisible_ = false;

    /** @private @const */
    this.actionSessionManager_ = new VideoSessionManager();

    this.actionSessionManager_.onSessionEnd(() =>
      analyticsEvent(this, VideoAnalyticsEvents_Enum.SESSION)
    );

    /** @private @const */
    this.visibilitySessionManager_ = new VideoSessionManager();

    this.visibilitySessionManager_.onSessionEnd(() =>
      analyticsEvent(this, VideoAnalyticsEvents_Enum.SESSION_VISIBLE)
    );

    /** @private @const {function(): !AnalyticsPercentageTracker} */
    this.getAnalyticsPercentageTracker_ = once(
      () => new AnalyticsPercentageTracker(this.ampdoc_.win, this)
    );

    // Autoplay Variables

    /** @private {boolean} */
    this.playCalledByAutoplay_ = false;

    /** @private {boolean} */
    this.pauseCalledByAutoplay_ = false;

    /** @private {?Element} */
    this.internalElement_ = null;

    /** @private {boolean} */
    this.muted_ = false;

    /** @private {boolean} */
    this.hasSeenPlayEvent_ = false;

    this.hasAutoplay = video.element.hasAttribute(
      VideoAttributes_Enum.AUTOPLAY
    );

    if (this.hasAutoplay) {
      this.manager_.installAutoplayStyles();
    }

    // Media Session API Variables

    /** @private {!../mediasession-helper.MetadataDef} */
    this.metadata_ = EMPTY_METADATA;

    /** @private @const {function()} */
    this.boundMediasessionPlay_ = () => {
      tryPlay(this.video, /* isAutoplay */ false);
    };

    /** @private @const {function()} */
    this.boundMediasessionPause_ = () => {
      this.video.pause();
    };

    listen(video.element, VideoEvents_Enum.LOAD, () => this.videoLoaded());
    listen(video.element, VideoEvents_Enum.PAUSE, () => this.videoPaused_());
    listen(video.element, VideoEvents_Enum.PLAY, () => {
      this.hasSeenPlayEvent_ = true;
      analyticsEvent(this, VideoAnalyticsEvents_Enum.PLAY);
    });
    listen(video.element, VideoEvents_Enum.PLAYING, () => this.videoPlayed_());
    listen(video.element, VideoEvents_Enum.MUTED, () => (this.muted_ = true));
    listen(video.element, VideoEvents_Enum.UNMUTED, () => {
      this.muted_ = false;
      this.manager_.pauseOtherVideos(this);
    });

    listen(video.element, VideoEvents_Enum.CUSTOM_TICK, (e) => {
      const data = getData(e);
      const eventType = data['eventType'];
      if (!eventType) {
        // CUSTOM_TICK is a generic event for 3p players whose semantics
        // don't fit with other video events.
        // If `eventType` is unset, it's not meant for analytics.
        return;
      }
      this.logCustomAnalytics_(eventType, data['vars']);
    });

    listen(video.element, VideoEvents_Enum.ENDED, () => {
      this.isRollingAd_ = false;
      analyticsEvent(this, VideoAnalyticsEvents_Enum.ENDED);
    });

    listen(video.element, VideoEvents_Enum.AD_START, () => {
      this.isRollingAd_ = true;
      analyticsEvent(this, VideoAnalyticsEvents_Enum.AD_START);
    });

    listen(video.element, VideoEvents_Enum.AD_END, () => {
      this.isRollingAd_ = false;
      analyticsEvent(this, VideoAnalyticsEvents_Enum.AD_END);
    });

    video
      .signals()
      .whenSignal(VideoEvents_Enum.REGISTERED)
      .then(() => this.onRegister_());

    /**
     * Trigger event for first manual play.
     * @private @const {!function()}
     */
    this.firstPlayEventOrNoop_ = once(() => {
      const firstPlay = 'firstPlay';
      const trust = ActionTrust_Enum.LOW;
      const event = createCustomEvent(this.ampdoc_.win, firstPlay, {});
      const {element} = this.video;
      const actions = Services.actionServiceForDoc(element);
      actions.trigger(element, firstPlay, event, trust);
    });

    this.listenForPlaybackDelegation_();
  }

  /** @public */
  dispose() {
    this.getAnalyticsPercentageTracker_().stop();
  }

  /**
   * @param {string} eventType
   * @param {!{[key: string]: string}} vars
   */
  logCustomAnalytics_(eventType, vars) {
    const prefixedVars = {[videoAnalyticsCustomEventTypeKey]: eventType};

    Object.keys(vars).forEach((key) => {
      prefixedVars[`custom_${key}`] = vars[key];
    });

    analyticsEvent(this, VideoAnalyticsEvents_Enum.CUSTOM, prefixedVars);
  }

  /** Listens for signals to delegate playback to a different module. */
  listenForPlaybackDelegation_() {
    const signals = this.video.signals();
    signals.whenSignal(VideoServiceSignals_Enum.PLAYBACK_DELEGATED).then(() => {
      this.managePlayback_ = false;

      if (this.isPlaying_) {
        this.video.pause();
      }
    });
  }

  /** @return {boolean} */
  isMuted() {
    return this.muted_;
  }

  /** @return {boolean} */
  isPlaybackManaged() {
    return this.managePlayback_;
  }

  /** @private */
  onRegister_() {
    if (this.requiresAutoFullscreen_()) {
      this.manager_.registerForAutoFullscreen(this);
    }

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
    if (
      this.video.preimplementsAutoFullscreen() ||
      !element.hasAttribute(VideoAttributes_Enum.ROTATE_TO_FULLSCREEN)
    ) {
      return false;
    }
    return userAssert(
      this.video.isInteractive(),
      'Only interactive videos are allowed to enter fullscreen on rotate. ' +
        'Set the `controls` attribute on %s to enable.',
      element
    );
  }

  /**
   * Callback for when the video starts playing
   * @private
   */
  videoPlayed_() {
    this.isPlaying_ = true;

    if (this.getPlayingState() == PlayingStates_Enum.PLAYING_MANUAL) {
      this.firstPlayEventOrNoop_();
      this.manager_.pauseOtherVideos(this);
    }

    const {video} = this;
    const {element} = video;

    if (
      !video.preimplementsMediaSessionAPI() &&
      !element.classList.contains('i-amphtml-disable-mediasession')
    ) {
      validateMediaMetadata(element, this.metadata_);
      setMediaSession(
        this.ampdoc_.win,
        this.metadata_,
        this.boundMediasessionPlay_,
        this.boundMediasessionPause_
      );
    }

    this.actionSessionManager_.beginSession();
    if (this.isVisible_) {
      this.visibilitySessionManager_.beginSession();
    }

    // The PLAY event was omitted from the original VideoInterface. Thus
    // not every implementation emits it. It should always happen before
    // PLAYING. Hence we treat the PLAYING as an indication to emit the
    // Analytics PLAY event if we haven't seen PLAY.
    if (!this.hasSeenPlayEvent_) {
      analyticsEvent(this, VideoAnalyticsEvents_Enum.PLAY);
    }
  }

  /**
   * Callback for when the video has been paused
   * @private
   */
  videoPaused_() {
    analyticsEvent(this, VideoAnalyticsEvents_Enum.PAUSE);
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

    this.internalElement_ = getInternalVideoElementFor(this.video.element);

    this.fillMediaSessionMetadata_();

    this.getAnalyticsPercentageTracker_().start();

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
      const posterUrl =
        parseSchemaImage(doc) || parseOgImage(doc) || parseFavicon(doc);

      if (posterUrl) {
        this.metadata_.artwork = [
          {
            'src': posterUrl,
          },
        ];
      }
    }

    if (!this.metadata_.title) {
      const title =
        this.video.element.getAttribute('title') ||
        this.video.element.getAttribute('aria-label') ||
        this.internalElement_.getAttribute('title') ||
        this.internalElement_.getAttribute('aria-label') ||
        doc.title;
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
    if (!this.ampdoc_.isVisible()) {
      return;
    }
    isAutoplaySupported(this.ampdoc_.win).then((isAutoplaySupported) => {
      const canAutoplay = this.hasAutoplay && !this.userInteracted();

      if (canAutoplay && isAutoplaySupported) {
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

    isAutoplaySupported(this.ampdoc_.win).then((isAutoplaySupported) => {
      if (!isAutoplaySupported && this.video.isInteractive()) {
        // Autoplay is not supported, show the controls so user can manually
        // initiate playback.
        this.video.showControls();
        return;
      }

      // Only muted videos are allowed to autoplay
      this.video.mute();

      this.installAutoplayElements_();
    });
  }

  /**
   * Installs autoplay animation and interaction mask when interactive.
   * The animated icon is appended always, but only displayed by CSS when
   * `controls` is set. See `video-autoplay.css`.
   * @private
   */
  installAutoplayElements_() {
    const {video} = this;
    const {element, win} = this.video;

    if (
      element.hasAttribute(VideoAttributes_Enum.NO_AUDIO) ||
      element.signals().get(VideoServiceSignals_Enum.USER_INTERACTED)
    ) {
      return;
    }

    const animation = renderIcon(win, element);
    const children = [animation];

    /** @param {boolean} shouldDisplay */
    function toggleElements(shouldDisplay) {
      video.mutateElementSkipRemeasure(() => {
        children.forEach((child) => {
          toggle(child, shouldDisplay);
        });
      });
    }

    /** @param {boolean} isPlaying */
    function toggleAnimation(isPlaying) {
      video.mutateElementSkipRemeasure(() =>
        animation.classList.toggle('amp-video-eq-play', isPlaying)
      );
    }

    const unlisteners = [
      listen(element, VideoEvents_Enum.PAUSE, () => toggleAnimation(false)),
      listen(element, VideoEvents_Enum.PLAYING, () => toggleAnimation(true)),
      listen(element, VideoEvents_Enum.AD_START, () => {
        toggleElements(false);
        video.showControls();
      }),
      listen(element, VideoEvents_Enum.AD_END, () => {
        toggleElements(true);
        video.hideControls();
      }),
      listen(element, VideoEvents_Enum.UNMUTED, () =>
        userInteractedWith(video)
      ),
    ];

    if (video.isInteractive()) {
      video.hideControls();

      const mask = renderInteractionOverlay(element, this.metadata_);
      children.push(mask);
      unlisteners.push(listen(mask, 'click', () => userInteractedWith(video)));
    }

    video.mutateElementSkipRemeasure(() => {
      children.forEach((child) => {
        element.appendChild(child);
      });
    });

    if (this.isRollingAd_) {
      toggleElements(false);
    }

    video
      .signals()
      .whenSignal(VideoServiceSignals_Enum.USER_INTERACTED)
      .then(() => {
        this.firstPlayEventOrNoop_();
        if (video.isInteractive()) {
          video.showControls();
        }
        video.unmute();
        unlisteners.forEach((unlistener) => {
          unlistener();
        });
        video.mutateElementSkipRemeasure(() => {
          children.forEach((child) => {
            removeElement(child);
          });
        });
      });
  }

  /**
   * Called when visibility of a loaded autoplay video changes.
   * @private
   */
  autoplayLoadedVideoVisibilityChanged_() {
    if (!this.managePlayback_) {
      return;
    }
    if (this.isVisible_) {
      this.visibilitySessionManager_.beginSession();
      tryPlay(this.video, /*autoplay*/ true);
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
   * Called by an IntersectionObserver.
   * @param {boolean} isVisible
   * @package
   */
  updateVisibility(isVisible) {
    const wasVisible = this.isVisible_;
    this.isVisible_ = isVisible;
    if (isVisible != wasVisible) {
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
      return PlayingStates_Enum.PAUSED;
    }

    if (
      this.isPlaying_ &&
      this.playCalledByAutoplay_ &&
      !this.userInteracted()
    ) {
      return PlayingStates_Enum.PLAYING_AUTO;
    }

    return PlayingStates_Enum.PLAYING_MANUAL;
  }

  /** @return {boolean} */
  isRollingAd() {
    return this.isRollingAd_;
  }

  /**
   * Returns whether the video was interacted with or not
   * @return {boolean}
   */
  userInteracted() {
    return (
      this.video.signals().get(VideoServiceSignals_Enum.USER_INTERACTED) != null
    );
  }

  /**
   * Collects a snapshot of the current video state for video analytics
   * @return {!Promise<!VideoAnalyticsDetailsDef>}
   */
  getAnalyticsDetails() {
    const {video} = this;
    return Promise.all([
      isAutoplaySupported(this.ampdoc_.win),
      measureIntersection(video.element),
    ]).then((responses) => {
      const isAutoplaySupported = /** @type {boolean} */ (responses[0]);
      const intersection = /** @type {!IntersectionObserverEntry} */ (
        responses[1]
      );
      const {height, width} = intersection.boundingClientRect;
      const autoplay = this.hasAutoplay && isAutoplaySupported;
      const playedRanges = video.getPlayedRanges();
      const playedTotal = playedRanges.reduce(
        (acc, range) => acc + range[1] - range[0],
        0
      );

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
  return !!{
    'amp-dailymotion': true,
    'amp-ima-video': true,
  }[video.tagName.toLowerCase()];
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

    /**
     * Unlisteners for global objects
     * @private {!Array<!UnlistenDef>}
     */
    this.unlisteners_ = [];

    // eslint-disable-next-line jsdoc/require-returns
    /** @private @const {function()} */
    this.boundSelectBestCentered_ = () => this.selectBestCenteredInPortrait_();

    /**
     * @param {!../video-interface.VideoOrBaseElementDef} video
     * @return {boolean}
     */
    this.boundIncludeOnlyPlaying_ = (video) =>
      this.getPlayingState_(video) == PlayingStates_Enum.PLAYING_MANUAL;

    /**
     * @param {!IntersectionObserverEntry} a
     * @param {!IntersectionObserverEntry} b
     * @return {number}
     */
    this.boundCompareEntries_ = (a, b) => this.compareEntries_(a, b);

    this.installOrientationObserver_();
    this.installFullscreenListener_();
  }

  /** @public */
  dispose() {
    this.unlisteners_.forEach((unlisten) => unlisten());
    this.unlisteners_.length = 0;
  }

  /** @param {!VideoEntry} entry */
  register(entry) {
    const {video} = entry;
    const {element} = video;

    if (!this.canFullscreen_(element)) {
      return;
    }

    this.entries_.push(video);

    listen(element, VideoEvents_Enum.PAUSE, this.boundSelectBestCentered_);
    listen(element, VideoEvents_Enum.PLAYING, this.boundSelectBestCentered_);
    listen(element, VideoEvents_Enum.ENDED, this.boundSelectBestCentered_);

    video
      .signals()
      .whenSignal(VideoServiceSignals_Enum.USER_INTERACTED)
      .then(this.boundSelectBestCentered_);

    // Set always
    this.selectBestCenteredInPortrait_();
  }

  /** @private */
  installFullscreenListener_() {
    const root = this.ampdoc_.getRootNode();
    const exitHandler = () => this.onFullscreenExit_();
    this.unlisteners_.push(
      listen(root, 'webkitfullscreenchange', exitHandler),
      listen(root, 'mozfullscreenchange', exitHandler),
      listen(root, 'fullscreenchange', exitHandler),
      listen(root, 'MSFullscreenChange', exitHandler)
    );
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
      this.unlisteners_.push(
        listen(orient, 'change', () => this.onRotation_())
      );
    }
    // iOS Safari does not have screen.orientation but classifies
    // 'orientationchange' as a user interaction.
    this.unlisteners_.push(
      listen(win, 'orientationchange', () => this.onRotation_())
    );
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

    this.scrollIntoIfNotVisible_(video).then(() => video.fullscreenEnter());
  }

  /**
   * @param {!../video-interface.VideoOrBaseElementDef} video
   * @private
   */
  exit_(video) {
    this.currentlyInFullscreen_ = null;

    this.scrollIntoIfNotVisible_(video, 'center').then(() =>
      video.fullscreenExit()
    );
  }

  /**
   * Scrolls to a video if it's not in view.
   * @param {!../video-interface.VideoOrBaseElementDef} video
   * @param {?string=} optPos
   * @return {!Promise}
   * @private
   */
  scrollIntoIfNotVisible_(video, optPos = null) {
    const {element} = video;
    const viewport = this.getViewport_();

    return this.onceOrientationChanges_()
      .then(() => measureIntersection(element))
      .then(({boundingClientRect}) => {
        const {bottom, top} = boundingClientRect;
        const vh = viewport.getSize().height;
        const fullyVisible = top >= 0 && bottom <= vh;
        if (fullyVisible) {
          return Promise.resolve();
        }
        const pos = optPos
          ? dev().assertString(optPos)
          : bottom > vh
            ? 'bottom'
            : 'top';
        return viewport.animateScrollIntoView(element, pos);
      });
  }

  /**
   * @private
   * @return {./viewport/viewport-interface.ViewportInterface}
   */
  getViewport_() {
    return Services.viewportForDoc(this.ampdoc_);
  }

  /**
   * @private
   * @return {!Promise}
   */
  onceOrientationChanges_() {
    const magicNumber = 330;
    return Services.timerFor(this.ampdoc_.win).promise(magicNumber);
  }

  /**
   * @private
   * @return {!Promise<?../video-interface.VideoOrBaseElementDef>}
   */
  selectBestCenteredInPortrait_() {
    if (this.isInLandscape()) {
      return Promise.resolve(this.currentlyCentered_);
    }

    this.currentlyCentered_ = null;

    const intersectionsPromise = this.entries_
      .filter(this.boundIncludeOnlyPlaying_)
      .map((e) => measureIntersection(e.element));

    return Promise.all(intersectionsPromise).then((intersections) => {
      const selected = intersections.sort(this.boundCompareEntries_)[0];

      if (
        selected &&
        selected.intersectionRatio > MIN_VISIBILITY_RATIO_FOR_AUTOPLAY
      ) {
        return selected.target
          .getImpl()
          .then((video) => (this.currentlyCentered_ = video));
      }

      return this.currentlyCentered_;
    });
  }

  /**
   * Compares two videos in order to sort them by "best centered".
   * @param {!IntersectionObserverEntry} a
   * @param {!IntersectionObserverEntry} b
   * @return {number}
   */
  compareEntries_(a, b) {
    const {boundingClientRect: rectA, intersectionRatio: ratioA} = a;
    const {boundingClientRect: rectB, intersectionRatio: ratioB} = b;

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
    if (centerA < centerB || centerA > centerB) {
      return centerA - centerB;
    }

    // Everything else failing, choose the highest element.
    return rectA.top - rectB.top;
  }

  /**
   * @param {!../video-interface.VideoOrBaseElementDef} video
   * @return {!../video-interface.PlayingStateDef}
   * @private
   */
  getPlayingState_(video) {
    return this.manager_.getPlayingState(
      /** @type {!../video-interface.VideoInterface} */ (video)
    );
  }
}

/**
 * @param {!./viewport/viewport-interface.ViewportInterface} viewport
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
    return win.screen.orientation.type.startsWith('landscape');
  }
  return Math.abs(win.orientation) == 90;
}

/** @visibleForTesting */
export const PERCENTAGE_INTERVAL = 5;

/** @visibleForTesting */
export const PERCENTAGE_FREQUENCY_WHEN_PAUSED_MS = 500;

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
    PERCENTAGE_FREQUENCY_MAX_MS
  );
}

/**
 * Handle cases such as livestreams or videos with no duration information is
 * available, where 1 second is the default duration for some video players.
 * @param {?number=} duration
 * @return {boolean}
 */
const isDurationFiniteNonZero = (duration) =>
  !!duration && !isNaN(duration) && duration > 1;

/** @visibleForTesting */
export class AnalyticsPercentageTracker {
  /**
   * @param {!Window} win
   * @param {!VideoEntry} entry
   */
  constructor(win, entry) {
    // This is destructured in `calculate_()`, but the linter thinks it's unused
    /** @private @const {!./timer-impl.Timer} */
    this.timer_ = Services.timerFor(win);

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

    // If the video has already emitted LOADEDMETADATA, the event below
    // will never fire, so we check if it's already available here.
    if (this.hasDuration_()) {
      this.calculate_(this.triggerId_);
    } else {
      this.unlisteners_.push(
        listenOnce(element, VideoEvents_Enum.LOADEDMETADATA, () => {
          if (this.hasDuration_()) {
            this.calculate_(this.triggerId_);
          }
        })
      );
    }

    this.unlisteners_.push(
      listen(element, VideoEvents_Enum.ENDED, () => {
        if (this.hasDuration_()) {
          this.maybeTrigger_(/* normalizedPercentage */ 100);
        }
      })
    );
  }

  /** @public */
  stop() {
    if (!this.unlisteners_) {
      return;
    }
    while (this.unlisteners_.length > 0) {
      this.unlisteners_.pop()();
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

    if (!isDurationFiniteNonZero(duration)) {
      return false;
    }

    if (
      calculateIdealPercentageFrequencyMs(duration) <
      PERCENTAGE_FREQUENCY_MIN_MS
    ) {
      const bestResultLength = Math.ceil(
        (PERCENTAGE_FREQUENCY_MIN_MS * (100 / PERCENTAGE_INTERVAL)) / 1000
      );

      this.warnForTesting_(
        'This video is too short for `video-percentage-played`. ' +
          'Reports may be innacurate. For best results, use videos over',
        bestResultLength,
        'seconds long.',
        video.element
      );
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

    const {entry_: entry, timer_: timer} = this;
    const {video} = entry;

    const calculateAgain = () => this.calculate_(triggerId);

    if (entry.getPlayingState() == PlayingStates_Enum.PAUSED) {
      timer.delay(calculateAgain, PERCENTAGE_FREQUENCY_WHEN_PAUSED_MS);
      return;
    }

    const duration = video.getDuration();
    // TODO(#25954): Further investigate root cause and remove this protection
    // if appropriate.
    if (!isDurationFiniteNonZero(duration)) {
      timer.delay(calculateAgain, PERCENTAGE_FREQUENCY_WHEN_PAUSED_MS);
      return;
    }

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
    analyticsEvent(this.entry_, VideoAnalyticsEvents_Enum.PERCENTAGE_PLAYED, {
      'normalizedPercentage': normalizedPercentage.toString(),
    });
  }
}

/**
 * @param {!VideoEntry} entry
 * @param {!VideoAnalyticsEvents_Enum} eventType
 * @param {!{[key: string]: string}=} opt_vars A map of vars and their values.
 * @private
 */
function analyticsEvent(entry, eventType, opt_vars) {
  const {video} = entry;

  entry.getAnalyticsDetails().then((details) => {
    if (opt_vars) {
      Object.assign(details, opt_vars);
    }
    dispatchCustomEvent(video.element, eventType, details);
  });
}

/** @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc */
export function installVideoManagerForDoc(nodeOrDoc) {
  registerServiceBuilderForDoc(nodeOrDoc, 'video-manager', VideoManager);
}
