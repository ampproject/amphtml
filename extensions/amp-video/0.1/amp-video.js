import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {dispatchCustomEvent, removeElement} from '#core/dom';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '#core/dom/fullscreen';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';
import {
  childElement,
  childElementByTag,
  childElementsByTag,
  matches,
} from '#core/dom/query';
import {htmlFor} from '#core/dom/static-template';
import {
  propagateObjectFitStyles,
  setImportantStyles,
  setInitialDisplay,
  setStyles,
} from '#core/dom/style';
import {tryPlay} from '#core/dom/video';
import {PauseHelper} from '#core/dom/video/pause-helper';
import {toArray} from '#core/types/array';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';
import {installVideoManagerForDoc} from '#service/video-manager-impl';

import {listen, listenOncePromise} from '#utils/event-helper';
import {dev, devAssert, user} from '#utils/log';
import {descendsFromStory} from '#utils/story';

import {getBitrateManager} from './flexible-bitrate';
import {fetchCachedSources} from './video-cache';

import {mutedOrUnmutedEvent} from '../../../src/iframe-video';
import {EMPTY_METADATA} from '../../../src/mediasession-helper';
import {getMode} from '../../../src/mode';
import {VideoEvents_Enum} from '../../../src/video-interface';

const TAG = 'amp-video';

/** @private {!Array<string>} */
const ATTRS_TO_PROPAGATE_ON_BUILD = [
  'aria-describedby',
  'aria-label',
  'aria-labelledby',
  'controls',
  'crossorigin',
  'disableremoteplayback',
  'controlsList',
  'title',
];

/**
 * Do not propagate `autoplay`. Autoplay behavior is managed by
 *       video manager since amp-video implements the VideoInterface.
 * @private {!Array<string>}
 */
const ATTRS_TO_PROPAGATE_ON_LAYOUT = ['loop', 'poster', 'preload'];

/** @private {!Array<string>} */
const ATTRS_TO_PROPAGATE = ATTRS_TO_PROPAGATE_ON_BUILD.concat(
  ATTRS_TO_PROPAGATE_ON_LAYOUT
);

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
export class AmpVideo extends AMP.BaseElement {
  /**
   * @override
   * @nocollapse
   */
  static prerenderAllowed(element) {
    // Only allow prerender if video sources are cached, or if video has a poster image.
    return !!element.getAttribute('poster') || element.hasAttribute('cache');
  }

  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.video_ = null;

    /** @private {boolean} */
    this.muted_ = false;

    /** @private {!../../../src/mediasession-helper.MetadataDef} */
    this.metadata_ = EMPTY_METADATA;

    /** @private @const {!Array<!UnlistenDef>} */
    this.unlisteners_ = [];

    /** @visibleForTesting {?Element} */
    this.posterDummyImageForTesting_ = null;

    /** @private {?boolean} whether there are sources that will use a BitrateManager */
    this.hasBitrateSources_ = null;

    /** @private @const */
    this.pauseHelper_ = new PauseHelper(this.element);
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.getVideoSourcesForPreconnect_().forEach((videoSrc) => {
      Services.preconnectFor(this.win).url(
        this.getAmpDoc(),
        videoSrc,
        opt_onLayout
      );
    });
  }

  /**
   * @private
   * @return {!Array<string>}
   */
  getVideoSourcesForPreconnect_() {
    const videoSrc = this.element.getAttribute('src');
    if (videoSrc) {
      return [videoSrc];
    }
    const srcs = [];
    toArray(childElementsByTag(this.element, 'source')).forEach((source) => {
      const src = source.getAttribute('src');
      if (src) {
        srcs.push(src);
      }
    });
    return srcs;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    this.configure_();

    this.video_ = element.ownerDocument.createElement('video');

    const poster = element.getAttribute('poster');
    if (!poster && getMode().development) {
      console /*OK*/
        .error('No "poster" attribute has been provided for amp-video.');
    }

    // Enable inline play for iOS.
    this.video_.setAttribute('playsinline', '');
    this.video_.setAttribute('webkit-playsinline', '');
    // Disable video preload in prerender mode.
    this.video_.setAttribute('preload', 'none');
    this.checkA11yAttributeText_();
    propagateAttributes(
      ATTRS_TO_PROPAGATE_ON_BUILD,
      this.element,
      this.video_,
      /* opt_removeMissingAttrs */ true
    );
    this.installEventHandlers_();
    applyFillContent(this.video_, true);
    propagateObjectFitStyles(this.element, this.video_);

    element.appendChild(this.video_);

    // Gather metadata
    const artist = element.getAttribute('artist');
    const title = element.getAttribute('title');
    const album = element.getAttribute('album');
    const artwork = element.getAttribute('artwork');
    this.metadata_ = {
      'title': title || '',
      'artist': artist || '',
      'album': album || '',
      'artwork': [{'src': artwork || poster || ''}],
    };

    // Cached so mediapool operations (eg: swapping sources) don't interfere with this bool.
    this.hasBitrateSources_ =
      !!this.element.querySelector('source[data-bitrate]') ||
      this.element.hasAttribute('cache');

    installVideoManagerForDoc(element);

    Services.videoManagerForDoc(element).register(this);

    if (this.element.hasAttribute('cache')) {
      // Fetch new sources from remote video cache, opted-in through the "cache"
      // attribute.
      return fetchCachedSources(
        this.element,
        this.getAmpDoc(),
        this.getMaxBitrate_()
      );
    }
  }

  /**
   * @private
   * Overrides aria-label with alt if aria-label or title is not specified.
   */
  checkA11yAttributeText_() {
    const altText = this.element.getAttribute('alt');
    const hasTitle = this.element.hasAttribute('title');
    const hasAriaLabel = this.element.hasAttribute('aria-label');
    if (altText && !hasTitle && !hasAriaLabel) {
      this.element.setAttribute('aria-label', altText);
    }
  }

  /** @override */
  detachedCallback() {
    this.updateIsPlaying_(false);
  }

  /** @private */
  configure_() {
    const {element} = this;
    if (!descendsFromStory(element)) {
      return;
    }
    ['i-amphtml-disable-mediasession', 'i-amphtml-poolbound'].forEach(
      (className) => {
        element.classList.add(className);
      }
    );
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (!this.video_) {
      return;
    }
    const {element} = this;
    if (mutations['src']) {
      const urlService = this.getUrlService_();
      urlService.assertHttpsUrl(element.getAttribute('src'), element);
      propagateAttributes(
        ['src'],
        this.element,
        dev().assertElement(this.video_)
      );
    }
    const attrs = ATTRS_TO_PROPAGATE.filter(
      (value) => mutations[value] !== undefined
    );
    propagateAttributes(
      attrs,
      this.element,
      dev().assertElement(this.video_),
      /* opt_removeMissingAttrs */ true
    );
    if (mutations['src']) {
      dispatchCustomEvent(element, VideoEvents_Enum.RELOAD);
    }
    if (mutations['artwork'] || mutations['poster']) {
      const artwork = element.getAttribute('artwork');
      const poster = element.getAttribute('poster');
      this.metadata_['artwork'] = [{'src': artwork || poster || ''}];
    }
    if (mutations['album']) {
      const album = element.getAttribute('album');
      this.metadata_['album'] = album || '';
    }
    if (mutations['title']) {
      const title = element.getAttribute('title');
      this.metadata_['title'] = title || '';
    }
    if (mutations['artist']) {
      const artist = element.getAttribute('artist');
      this.metadata_['artist'] = artist || '';
    }
    // TODO(@aghassemi, 10756) Either make metadata observable or submit
    // an event indicating metadata changed (in case metadata changes
    // while the video is playing).
  }

  /** @override */
  layoutCallback() {
    this.video_ = dev().assertElement(this.video_);

    if (!this.isVideoSupported_()) {
      this.toggleFallback(true);
      return Promise.resolve();
    }

    propagateAttributes(
      ATTRS_TO_PROPAGATE_ON_LAYOUT,
      this.element,
      dev().assertElement(this.video_),
      /* opt_removeMissingAttrs */ true
    );

    this.createPosterForAndroidBug_();
    this.onPosterLoaded_(() => this.hideBlurryPlaceholder_());

    // If we are in prerender mode, only propagate cached sources and then
    // when document becomes visible propagate origin sources and other children
    // If not in prerender mode, propagate everything.
    let pendingOriginPromise;
    if (
      this.getAmpDoc().getVisibilityState() == VisibilityState_Enum.PRERENDER
    ) {
      if (!this.element.hasAttribute('preload')) {
        this.video_.setAttribute('preload', 'auto');
      }
      pendingOriginPromise = this.getAmpDoc()
        .whenFirstVisible()
        .then(() => {
          this.propagateLayoutChildren_();
          // We need to yield to the event queue before listing for loadPromise
          // because this element may still be in error state from the pre-render
          // load.
          return Services.timerFor(this.win)
            .promise(1)
            .then(() => {
              // Don't wait for the source to load if media pool is taking over.
              if (this.isManagedByPool_()) {
                return;
              }
              return this.loadPromise(this.video_);
            });
        });
    } else {
      this.propagateLayoutChildren_();
    }

    // loadPromise for media elements listens to `loadedmetadata`.
    const promise = this.loadPromise(this.video_)
      .then(null, (reason) => {
        if (pendingOriginPromise) {
          return pendingOriginPromise;
        }
        throw reason;
      })
      .then(() => this.onVideoLoaded_());

    // Resolve layoutCallback right away if the video won't preload.
    if (this.element.getAttribute('preload') === 'none') {
      return;
    }

    // Resolve layoutCallback as soon as all sources are appended when within a
    // story, so it can be handled by the media pool as soon as possible.
    if (this.isManagedByPool_()) {
      return pendingOriginPromise;
    }

    return promise;
  }

  /**
   * Gracefully handle media errors if possible.
   * @param {!Event} event
   */
  handleMediaError_(event) {
    if (
      !this.video_.error ||
      this.video_.error.code != MediaError.MEDIA_ERR_DECODE
    ) {
      return;
    }
    // HTMLMediaElements automatically fallback to the next source if a load fails
    // but they don't try the next source upon a decode error.
    // This code does this fallback manually.
    user().error(
      TAG,
      `Decode error in ${this.video_.currentSrc}`,
      this.element
    );
    // No fallback available for bare src.
    if (this.video_.src) {
      return;
    }
    // Find the source element that caused the decode error.
    let sourceCount = 0;
    const currentSource = childElement(this.video_, (source) => {
      if (source.tagName != 'SOURCE') {
        return false;
      }
      sourceCount++;
      return source.src == this.video_.currentSrc;
    });
    if (sourceCount == 0) {
      return;
    }
    dev().assertElement(
      currentSource,
      `Can't find source element for currentSrc ${this.video_.currentSrc}`
    );
    removeElement(dev().assertElement(currentSource));
    // Resets the loading and will catch the new source if any.
    event.stopImmediatePropagation();
    this.video_.load();
    // Unfortunately we don't know exactly what operation caused the decode to
    // fail. But to help, we need to retry. Since play is most common, we're
    // doing that.
    this.play(false);
  }

  /**
   * Propagate origin sources and tracks
   * @private
   */
  propagateLayoutChildren_() {
    devAssert(this.video_);

    const sources = toArray(childElementsByTag(this.element, 'source'));

    const {element} = this;
    const urlService = this.getUrlService_();

    // If the `src` of `amp-video` itself is NOT cached, set it on video
    if (element.hasAttribute('src')) {
      urlService.assertHttpsUrl(element.getAttribute('src'), element);
      propagateAttributes(
        ['src'],
        this.element,
        dev().assertElement(this.video_)
      );
    }

    sources.forEach((source) => {
      // Cached sources should have been moved from <amp-video> to <video>.
      urlService.assertHttpsUrl(source.getAttribute('src'), source);
      this.video_.appendChild(source);
    });

    const tracks = toArray(childElementsByTag(element, 'track'));
    tracks.forEach((track) => {
      this.video_.appendChild(track);
    });
    this.setUpCaptions_();

    if (this.video_.changedSources) {
      this.video_.changedSources();
    }
  }

  /**
   * Sets a max bitrate if video is on the first page of an amp-story doc.
   * @return {number}
   */
  getMaxBitrate_() {
    if (
      this.isManagedByPool_() &&
      isExperimentOn(this.win, 'amp-story-first-page-max-bitrate') &&
      matches(this.element, 'amp-story-page:first-of-type amp-video')
    ) {
      Services.performanceFor(this.win).addEnabledExperiment(
        'amp-story-first-page-max-bitrate'
      );
      return 1000;
    }
    return Number.POSITIVE_INFINITY;
  }

  /**
   * @private
   */
  installEventHandlers_() {
    const video = dev().assertElement(this.video_);
    video.addEventListener('error', (e) => this.handleMediaError_(e));

    this.unlisteners_.push(
      this.forwardEvents(
        [
          VideoEvents_Enum.ENDED,
          VideoEvents_Enum.LOADEDMETADATA,
          VideoEvents_Enum.LOADEDDATA,
          VideoEvents_Enum.PAUSE,
          VideoEvents_Enum.PLAYING,
          VideoEvents_Enum.PLAY,
        ],
        video
      )
    );

    this.unlisteners_.push(
      listen(video, 'volumechange', () => {
        const {muted} = this.video_;
        if (this.muted_ == muted) {
          return;
        }
        this.muted_ = muted;
        dispatchCustomEvent(this.element, mutedOrUnmutedEvent(this.muted_));
      })
    );

    ['play', 'pause', 'ended'].forEach((type) => {
      this.unlisteners_.push(
        listen(video, type, () => this.updateIsPlaying_(type == 'play'))
      );
    });
  }

  /** @private */
  uninstallEventHandlers_() {
    this.updateIsPlaying_(false);
    while (this.unlisteners_.length) {
      this.unlisteners_.pop().call();
    }
  }

  /**
   * Resets the component if the underlying <video> was changed.
   * This should only be used in cases when a higher-level component manages
   * this element's DOM.
   */
  resetOnDomChange() {
    this.video_ = dev().assertElement(
      childElementByTag(this.element, 'video'),
      'Tried to reset amp-video without an underlying <video>.'
    );
    this.uninstallEventHandlers_();
    this.installEventHandlers_();
    if (this.hasBitrateSources_) {
      getBitrateManager(this.win).manage(this.video_);
    }
    // When source changes, video needs to trigger loaded again.
    if (this.video_.readyState >= 1) {
      this.onVideoLoaded_();
      return;
    }
    // Video might not have the sources yet, so instead of loadPromise (which would fail),
    // we listen for loadedmetadata.
    listenOncePromise(this.video_, 'loadedmetadata').then(() =>
      this.onVideoLoaded_()
    );
    this.setUpCaptions_();
  }

  /**
   * Connects to amp-story-captions component.
   * @private
   */
  setUpCaptions_() {
    const captionsId = this.element.getAttribute('captions-id');
    if (!captionsId) {
      return;
    }
    const captionsElement = this.win.document.querySelector(
      `amp-story-captions#${escapeCssSelectorIdent(captionsId)}`
    );
    if (!captionsElement) {
      return;
    }
    captionsElement.getImpl().then((impl) => {
      if (impl.setVideoElement) {
        impl.setVideoElement(this.video_);
      }
    });
  }

  /** @private */
  onVideoLoaded_() {
    dispatchCustomEvent(this.element, VideoEvents_Enum.LOAD);
  }

  /** @override */
  pauseCallback() {
    if (this.video_) {
      this.video_.pause();
    }
  }

  /** @private */
  updateIsPlaying_(isPlaying) {
    if (this.isManagedByPool_()) {
      return;
    }
    this.pauseHelper_.updatePlaying(isPlaying);
  }

  /** @private */
  isVideoSupported_() {
    return !!this.video_.play;
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /**
   * @override
   */
  supportsPlatform() {
    return this.isVideoSupported_();
  }

  /**
   * @override
   */
  isInteractive() {
    return this.element.hasAttribute('controls');
  }

  /**
   * @override
   */
  play(unusedIsAutoplay) {
    tryPlay(this.video_);
  }

  /**
   * Android will show a blank frame between the poster and the first frame in
   * some cases. In these cases, the video element is transparent. By setting
   * a poster layer underneath, the poster is still shown while the first frame
   * buffers, so no FOUC.
   * @private
   */
  createPosterForAndroidBug_() {
    if (!Services.platformFor(this.win).isAndroid()) {
      return;
    }
    const {element} = this;
    if (element.querySelector('i-amphtml-poster')) {
      return;
    }
    const src = element.getAttribute('poster');
    if (!src) {
      return;
    }
    const poster = htmlFor(element)`<i-amphtml-poster></i-amphtml-poster>`;
    setInitialDisplay(poster, 'block');
    setStyles(poster, {
      'background-image': `url(${src})`,
      'background-size': 'cover',
      'background-position': 'center',
    });
    poster.classList.add('i-amphtml-android-poster-bug');
    applyFillContent(poster);
    element.appendChild(poster);
  }

  /**
   * @override
   */
  pause() {
    this.video_.pause();
  }

  /**
   * @override
   */
  mute() {
    if (this.isManagedByPool_()) {
      return;
    }
    this.video_.muted = true;
  }

  /**
   * @override
   */
  unmute() {
    if (this.isManagedByPool_()) {
      return;
    }
    this.video_.muted = false;
  }

  /**
   * @return {boolean}
   * @private
   */
  isManagedByPool_() {
    return this.element.classList.contains('i-amphtml-poolbound');
  }

  /**
   * @override
   */
  showControls() {
    this.video_.controls = true;
  }

  /**
   * @override
   */
  hideControls() {
    this.video_.controls = false;
  }

  /**
   * @override
   */
  fullscreenEnter() {
    fullscreenEnter(dev().assertElement(this.video_));
  }

  /**
   * @override
   */
  fullscreenExit() {
    fullscreenExit(dev().assertElement(this.video_));
  }

  /** @override */
  isFullscreen() {
    return isFullscreenElement(dev().assertElement(this.video_));
  }

  /** @override */
  getMetadata() {
    return this.metadata_;
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  getCurrentTime() {
    return this.video_.currentTime;
  }

  /** @override */
  getDuration() {
    return this.video_.duration;
  }

  /** @override */
  getPlayedRanges() {
    // TODO(cvializ): remove this because it can be inferred by other events
    const {played} = this.video_;
    const {length} = played;
    const ranges = [];
    for (let i = 0; i < length; i++) {
      ranges.push([played.start(i), played.end(i)]);
    }
    return ranges;
  }

  /**
   * Called when video is first loaded.
   * @override
   */
  firstLayoutCompleted() {
    if (!this.hideBlurryPlaceholder_()) {
      this.togglePlaceholder(false);
    }
    this.removePosterForAndroidBug_();
  }

  /**
   * See `createPosterForAndroidBug_`.
   * @private
   */
  removePosterForAndroidBug_() {
    const poster = this.element.querySelector('i-amphtml-poster');
    if (!poster) {
      return;
    }
    removeElement(poster);
  }

  /**
   * @return {!../../../src/service/url-impl.Url}
   * @private
   */
  getUrlService_() {
    return Services.urlForDoc(this.element);
  }

  /**
   * Fades out a blurry placeholder if one currently exists.
   * @return {boolean} if there was a blurred image placeholder that was hidden.
   */
  hideBlurryPlaceholder_() {
    const placeholder = this.getPlaceholder();
    // checks for the existence of a visible blurry placeholder
    if (placeholder) {
      if (placeholder.classList.contains('i-amphtml-blurry-placeholder')) {
        setImportantStyles(placeholder, {'opacity': 0.0});
        return true;
      }
    }
    return false;
  }

  /**
   * Sets a callback when the poster is loaded.
   * @param {function()} callback The function that executes when the poster is
   * loaded.
   * @private
   */
  onPosterLoaded_(callback) {
    const poster = this.video_.getAttribute('poster');
    if (poster) {
      const posterImg = new Image();
      if (getMode().test) {
        this.posterDummyImageForTesting_ = posterImg;
      }
      posterImg.onload = callback;
      posterImg.src = poster;
    }
  }

  /** @override */
  seekTo(timeSeconds) {
    this.video_.currentTime = timeSeconds;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpVideo);
});
