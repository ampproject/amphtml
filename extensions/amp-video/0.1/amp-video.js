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

import {EMPTY_METADATA} from '../../../src/mediasession-helper';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {VisibilityState} from '../../../src/visibility-state';
import {
  childElement,
  childElementByTag,
  childElementsByTag,
  fullscreenEnter,
  fullscreenExit,
  insertAfterOrAtStart,
  isFullscreenElement,
  removeElement,
} from '../../../src/dom';
import {descendsFromStory} from '../../../src/utils/story';
import {dev, devAssert, user} from '../../../src/log';
import {getBitrateManager} from './flexible-bitrate';
import {getMode} from '../../../src/mode';
import {htmlFor} from '../../../src/static-template';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listen} from '../../../src/event-helper';
import {mutedOrUnmutedEvent} from '../../../src/iframe-video';
import {
  propagateObjectFitStyles,
  setImportantStyles,
  setInitialDisplay,
  setStyles,
} from '../../../src/style';
import {toArray} from '../../../src/types';

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
class AmpVideo extends AMP.BaseElement {
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
   * AMP Cache may selectively cache certain video sources (based on various
   * heuristics such as video type, extensions, etc...).
   * When AMP Cache does so, it rewrites the `src` for `amp-video` and
   * `source` children that are cached and adds a `amp-orig-src` attribute
   * pointing to the original source.
   *
   * There are two separate runtime concerns that we handle here:
   *
   * 1) Handling 404s
   * Eventhough AMP Cache rewrites the `src` to point to the CDN, the actual
   * video may not be ready in the cache yet, in those cases the CDN will
   * return a 404.
   * AMP Cache also rewrites Urls for all sources and returns 404 for types
   * that are not supported to be cached.
   *
   * Runtime handles this situation by appending an additional
   * <source> pointing to the original src AFTER the cached source so browser
   * will automatically proceed to the next source if one fails.
   * Original sources are added only when page becomes visible and not during
   * prerender mode.
   *
   * 2) Prerendering
   * Now that some sources might be cached, we can preload them during prerender
   * phase. Runtime handles this by adding any cached sources to the <video>
   * element during prerender and automatically sets the `preload` to `auto`
   * so browsers (based on their own heuristics) can start fetching the cached
   * videos. If `preload` is specified by the author, then it takes precedence.
   *
   * Note that this flag does not impact prerendering of the `poster` as poster
   * is fetched (and is always cached) during `buildCallback` which is not
   * dependent on the value of `prerenderAllowed()`.
   *
   * @override
   */
  prerenderAllowed() {
    // Only allow prerender if video sources are cached on CDN, or if video has
    // a poster image. 
    const posterAttr = this.element.getAttribute('poster');
    return !!posterAttr || this.hasAnyCachedSources_();
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
      // We also want to preconnect to the origin src to make fallback faster.
      const origSrc = source.getAttribute('amp-orig-src');
      if (origSrc) {
        srcs.push(origSrc);
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
    if (this.element.querySelector('source[data-bitrate]')) {
      getBitrateManager(this.win).manage(this.video_);
    }

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
    this.propagateAttributes(
      ATTRS_TO_PROPAGATE_ON_BUILD,
      this.video_,
      /* opt_removeMissingAttrs */ true
    );
    this.installEventHandlers_();
    this.applyFillContent(this.video_, true);
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

    installVideoManagerForDoc(element);

    Services.videoManagerForDoc(element).register(this);
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
      this.propagateAttributes(['src'], dev().assertElement(this.video_));
    }
    const attrs = ATTRS_TO_PROPAGATE.filter(
      (value) => mutations[value] !== undefined
    );
    this.propagateAttributes(
      attrs,
      dev().assertElement(this.video_),
      /* opt_removeMissingAttrs */ true
    );
    if (mutations['src']) {
      element.dispatchCustomEvent(VideoEvents.RELOAD);
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
  viewportCallback(visible) {
    this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
  }

  /** @override */
  layoutCallback() {
    this.video_ = dev().assertElement(this.video_);

    if (!this.isVideoSupported_()) {
      this.toggleFallback(true);
      return Promise.resolve();
    }

    this.propagateAttributes(
      ATTRS_TO_PROPAGATE_ON_LAYOUT,
      dev().assertElement(this.video_),
      /* opt_removeMissingAttrs */ true
    );

    this.createPosterForAndroidBug_();
    this.onPosterLoaded_(() => this.hideBlurryPlaceholder_());

    this.propagateCachedSources_();

    // If we are in prerender mode, only propagate cached sources and then
    // when document becomes visible propagate origin sources and other children
    // If not in prerender mode, propagate everything.
    let pendingOriginPromise;
    if (this.getAmpDoc().getVisibilityState() == VisibilityState.PRERENDER) {
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
      .then(() => {
        this.element.dispatchCustomEvent(VideoEvents.LOAD);
      });

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
   * @private
   * Propagate sources that are cached by the CDN.
   */
  propagateCachedSources_() {
    devAssert(this.video_);

    const sources = toArray(childElementsByTag(this.element, 'source'));

    // if the `src` of `amp-video` itself is cached, move it to <source>
    if (this.element.hasAttribute('src') && this.isCachedByCDN_(this.element)) {
      const src = this.element.getAttribute('src');
      const type = this.element.getAttribute('type');
      const srcSource = this.createSourceElement_(src, type);
      const ampOrigSrc = this.element.getAttribute('amp-orig-src');
      srcSource.setAttribute('amp-orig-src', ampOrigSrc);
      // Also make sure src is removed from amp-video since Stories media-pool
      // may copy it back from amp-video.
      this.element.removeAttribute('src');
      this.element.removeAttribute('type');
      sources.unshift(srcSource);
    }

    // Only cached sources are added during prerender.
    // Origin sources will only be added when document becomes visible.
    sources.forEach((source) => {
      if (this.isCachedByCDN_(source)) {
        this.video_.appendChild(source);
      }
    });

    if (this.video_.changedSources) {
      this.video_.changedSources();
    }
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
    if (element.hasAttribute('src') && !this.isCachedByCDN_(element)) {
      urlService.assertHttpsUrl(element.getAttribute('src'), element);
      this.propagateAttributes(['src'], dev().assertElement(this.video_));
    }

    sources.forEach((source) => {
      // Cached sources should have been moved from <amp-video> to <video>.
      devAssert(!this.isCachedByCDN_(source));
      urlService.assertHttpsUrl(source.getAttribute('src'), source);
      this.video_.appendChild(source);
    });

    // To handle cases where cached source may 404 if not primed yet,
    // duplicate the `origin` Urls for cached sources and insert them after each
    const cached = toArray(this.video_.querySelectorAll('[amp-orig-src]'));
    cached.forEach((cachedSource) => {
      const origSrc = cachedSource.getAttribute('amp-orig-src');
      const origType = cachedSource.getAttribute('type');
      const origSource = this.createSourceElement_(origSrc, origType);
      const bitrate = cachedSource.getAttribute('data-bitrate');
      if (bitrate) {
        origSource.setAttribute('data-bitrate', bitrate);
      }
      insertAfterOrAtStart(
        dev().assertElement(this.video_),
        origSource,
        cachedSource
      );
    });

    const tracks = toArray(childElementsByTag(element, 'track'));
    tracks.forEach((track) => {
      this.video_.appendChild(track);
    });

    if (this.video_.changedSources) {
      this.video_.changedSources();
    }
  }

  /**
   * @param {!Element} element
   * @return {boolean}
   * @private
   */
  isCachedByCDN_(element) {
    const src = element.getAttribute('src');
    const hasOrigSrcAttr = element.hasAttribute('amp-orig-src');
    return hasOrigSrcAttr && this.getUrlService_().isProxyOrigin(src);
  }

  /**
   * @param {string} src
   * @param {?string} type
   * @return {!Element} source element
   * @private
   */
  createSourceElement_(src, type) {
    const {element} = this;
    this.getUrlService_().assertHttpsUrl(src, element);
    const source = element.ownerDocument.createElement('source');
    source.setAttribute('src', src);
    if (type) {
      source.setAttribute('type', type);
    }
    return source;
  }

  /**
   * @private
   * @return {boolean}
   */
  hasAnyCachedSources_() {
    return !!this.getFirstCachedSource_();
  }

  /**
   * @private
   * @return {?Element}
   */
  getFirstCachedSource_() {
    const {element} = this;
    const sources = toArray(childElementsByTag(element, 'source'));
    sources.push(element);
    for (let i = 0; i < sources.length; i++) {
      if (this.isCachedByCDN_(sources[i])) {
        return sources[i];
      }
    }
    return null;
  }

  /**
   * @private
   */
  installEventHandlers_() {
    const video = dev().assertElement(this.video_);
    video.addEventListener('error', (e) => this.handleMediaError_(e));

    const forwardEventsUnlisten = this.forwardEvents(
      [
        VideoEvents.ENDED,
        VideoEvents.LOADEDMETADATA,
        VideoEvents.PAUSE,
        VideoEvents.PLAYING,
        VideoEvents.PLAY,
      ],
      video
    );

    const mutedOrUnmutedEventUnlisten = listen(video, 'volumechange', () => {
      const {muted} = this.video_;
      if (this.muted_ == muted) {
        return;
      }
      this.muted_ = muted;
      this.element.dispatchCustomEvent(mutedOrUnmutedEvent(this.muted_));
    });

    this.unlisteners_.push(forwardEventsUnlisten, mutedOrUnmutedEventUnlisten);
  }

  /** @private */
  uninstallEventHandlers_() {
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
  }

  /** @override */
  pauseCallback() {
    if (this.video_) {
      this.video_.pause();
    }
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
    const ret = this.video_.play();

    if (ret && ret.catch) {
      ret.catch(() => {
        // Empty catch to prevent useless unhandled promise rejection logging.
        // Play can fail for many reasons such as video getting paused before
        // play() is finished.
        // We use events to know the state of the video and do not care about
        // the success or failure of the play()'s returned promise.
      });
    }
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
    const poster = htmlFor(element)`<i-amphtml-poster></i-amphtml-poster>`;
    const src = element.getAttribute('poster');
    setInitialDisplay(poster, 'block');
    setStyles(poster, {
      'background-image': `url(${src})`,
      'background-size': 'cover',
      'background-position': 'center',
    });
    poster.classList.add('i-amphtml-android-poster-bug');
    this.applyFillContent(poster);
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
