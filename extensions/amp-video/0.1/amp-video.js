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
import {assertHttpsUrl, isProxyOrigin} from '../../../src/url';
import {
  childElementByTag,
  childElementsByTag,
  closestByTag,
  elementByTag,
  fullscreenEnter,
  fullscreenExit,
  insertAfterOrAtStart,
  isFullscreenElement,
} from '../../../src/dom';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isExperimentOn} from '../../../src/experiments';
import {isLayoutSizeDefined} from '../../../src/layout';
import {listen} from '../../../src/event-helper';
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
  'poster',
  'controlsList',
];

/**
 * @note Do not propagate `autoplay`. Autoplay behaviour is managed by
 *       video manager since amp-video implements the VideoInterface.
 * @private {!Array<string>}
 */
const ATTRS_TO_PROPAGATE_ON_LAYOUT = ['loop', 'preload'];

/** @private {!Array<string>} */
const ATTRS_TO_PROPAGATE =
    ATTRS_TO_PROPAGATE_ON_BUILD.concat(ATTRS_TO_PROPAGATE_ON_LAYOUT);

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

    /** @private {boolean} */
    this.isPrerenderAllowed_ = false;

    /** @private {!../../../src/mediasession-helper.MetadataDef} */
    this.metadata_ = EMPTY_METADATA;

    /** @private @const {!Array<!UnlistenDef>} */
    this.unlisteners_ = [];

    /** @private @const {boolean} */
    this.isStoryVideo_ = !!closestByTag(this.element, 'amp-story');

    /** @private @const {boolean} */
    this.storySupportsHls_ = !isExperimentOn(this.win, 'disable-amp-story-hls');
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    const videoSrc = this.getVideoSourceForPreconnect_();
    if (videoSrc) {
      assertHttpsUrl(videoSrc, this.element);
      this.preconnect.url(videoSrc, opt_onLayout);
    }
  }

  /**
   * @override
   *
   * @overview
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
   */
  prerenderAllowed() {
    return this.isPrerenderAllowed_;
  }

  /**
   * @private
   * @return {string}
   */
  getVideoSourceForPreconnect_() {
    let videoSrc = this.element.getAttribute('src');
    if (!videoSrc) {
      const source = elementByTag(this.element, 'source');
      if (source) {
        videoSrc = source.getAttribute('src');
      }
    }
    return videoSrc;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.video_ = this.element.ownerDocument.createElement('video');

    const poster = this.element.getAttribute('poster');
    if (!poster && getMode().development) {
      console/*OK*/.error(
          'No "poster" attribute has been provided for amp-video.');
    }

    this.isPrerenderAllowed_ = this.hasAnyCachedSources_();

    // Enable inline play for iOS.
    this.video_.setAttribute('playsinline', '');
    this.video_.setAttribute('webkit-playsinline', '');
    // Disable video preload in prerender mode.
    this.video_.setAttribute('preload', 'none');
    this.propagateAttributes(ATTRS_TO_PROPAGATE_ON_BUILD, this.video_,
        /* opt_removeMissingAttrs */ true);
    this.installEventHandlers_();
    this.applyFillContent(this.video_, true);
    this.element.appendChild(this.video_);

    // Gather metadata
    const artist = this.element.getAttribute('artist');
    const title = this.element.getAttribute('title');
    const album = this.element.getAttribute('album');
    const artwork = this.element.getAttribute('artwork');
    this.metadata_ = {
      'title': title || '',
      'artist': artist || '',
      'album': album || '',
      'artwork': [
        {'src': artwork || poster || ''},
      ],
    };

    installVideoManagerForDoc(this.element);

    // amp-story coordinates playback based on page activation, as opposed to
    // visibility.
    // TODO(alanorozco, #12712): amp-story should coordinate resumeCallback.
    Services.videoManagerForDoc(this.element).register(this,
        /* manageAutoplay */ !this.isStoryVideo_);
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (!this.video_) {
      return;
    }
    if (mutations['src']) {
      assertHttpsUrl(this.element.getAttribute('src'), this.element);
      this.propagateAttributes(['src'], dev().assertElement(this.video_));
    }
    const attrs = ATTRS_TO_PROPAGATE.filter(
        value => mutations[value] !== undefined);
    this.propagateAttributes(
        attrs,
        dev().assertElement(this.video_),
        /* opt_removeMissingAttrs */ true);
    if (mutations['src']) {
      this.element.dispatchCustomEvent(VideoEvents.RELOAD);
    }
    if (mutations['artwork'] || mutations['poster']) {
      const artwork = this.element.getAttribute('artwork');
      const poster = this.element.getAttribute('poster');
      this.metadata_['artwork'] = [
        {'src': artwork || poster || ''},
      ];
    }
    if (mutations['album']) {
      const album = this.element.getAttribute('album');
      this.metadata_['album'] = album || '';
    }
    if (mutations['title']) {
      const title = this.element.getAttribute('title');
      this.metadata_['title'] = title || '';
    }
    if (mutations['artist']) {
      const artist = this.element.getAttribute('artist');
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

    const viewer = Services.viewerForDoc(this.getAmpDoc());

    this.propagateAttributes(ATTRS_TO_PROPAGATE_ON_LAYOUT,
        dev().assertElement(this.video_),
        /* opt_removeMissingAttrs */ true);

    this.propagateCachedSources_();

    // If we are in prerender mode, only propagate cached sources and then
    // when document becomes visible propagate origin sources and other children
    // If not in prerender mode, propagate everything.
    if (viewer.getVisibilityState() == VisibilityState.PRERENDER) {
      if (!this.element.hasAttribute('preload')) {
        this.video_.setAttribute('preload', 'auto');
      }
      viewer.whenFirstVisible().then(() => {
        this.propagateLayoutChildren_();
      });
    } else {
      this.propagateLayoutChildren_();
    }

    // loadPromise for media elements listens to `loadstart`
    return this.loadPromise(this.video_).then(() => {
      this.element.dispatchCustomEvent(VideoEvents.LOAD);
    });
  }

  /**
   * @private
   * Propagate sources that are cached by the CDN.
   */
  propagateCachedSources_() {
    dev().assert(this.video_);

    const sources = toArray(childElementsByTag(this.element, 'source'));

    // if the `src` of `amp-video` itself is cached, move it to <source>
    if (this.element.hasAttribute('src') && this.isCachedByCDN_(this.element)) {
      const src = this.element.getAttribute('src');
      const type = this.element.getAttribute('type');
      const srcSource = this.createSourceElement_(src, type);
      const ampOrigSrc = this.element.getAttribute('amp-orig-src');
      srcSource.setAttribute('amp-orig-src', ampOrigSrc);
      sources.unshift(srcSource);
    }

    // Only cached sources are added during prerender.
    // Origin sources will only be added when document becomes visible.
    sources.forEach(source => {
      if (this.isCachedByCDN_(source) && this.isValidSource_(source)) {
        this.video_.appendChild(source);
      }
    });
  }

  /**
   * Propagate origin sources and tracks
   * @private
   */
  propagateLayoutChildren_() {
    dev().assert(this.video_);

    const sources = toArray(childElementsByTag(this.element, 'source'));

    // If the `src` of `amp-video` itself is NOT cached, set it on video
    if (this.element.hasAttribute('src') &&
        !this.isCachedByCDN_(this.element)) {
      assertHttpsUrl(this.element.getAttribute('src'), this.element);
      this.propagateAttributes(['src'], dev().assertElement(this.video_));
    }

    sources.forEach(source => {
      if (this.isValidSource_(source)) {
        // Cached sources should have been moved from <amp-video> to <video>.
        dev().assert(!this.isCachedByCDN_(source));
        assertHttpsUrl(source.getAttribute('src'), source);
        this.video_.appendChild(source);
      } else {
        this.element.removeChild(source);
      }
    });

    // To handle cases where cached source may 404 if not primed yet,
    // duplicate the `origin` Urls for cached sources and insert them after each
    const cached = toArray(this.video_.querySelectorAll('[amp-orig-src]'));
    cached.forEach(cachedSource => {
      const origSrc = cachedSource.getAttribute('amp-orig-src');
      const origType = cachedSource.getAttribute('type');
      const origSource = this.createSourceElement_(origSrc, origType);
      insertAfterOrAtStart(dev().assertElement(this.video_),
          origSource, cachedSource);
    });

    const tracks = toArray(childElementsByTag(this.element, 'track'));
    tracks.forEach(track => {
      this.video_.appendChild(track);
    });
  }

  /**
   * @private
   */
  isCachedByCDN_(element) {
    const src = element.getAttribute('src');
    const hasOrigSrcAttr = element.hasAttribute('amp-orig-src');
    return hasOrigSrcAttr && isProxyOrigin(src);
  }

  /**
   * @param {string} src
   * @param {?string} type
   * @return {!Element} source element
   * @private
   */
  createSourceElement_(src, type) {
    assertHttpsUrl(src, this.element);
    const source = this.element.ownerDocument.createElement('source');
    source.setAttribute('src', src);
    if (type) {
      source.setAttribute('type', type);
    }
    return source;
  }

  /**
   * @private
   */
  hasAnyCachedSources_() {
    const sources = toArray(childElementsByTag(this.element, 'source'));
    sources.push(this.element);

    for (let i = 0; i < sources.length; i++) {
      if (this.isCachedByCDN_(sources[i])) {
        return true;
      }
    }

    return false;
  }

  /**
   * @param {!Element} source The <source> element to check for validity.
   * @return {boolean} true if the source is allowed to be propagated to the
   *     created video.
   * @private
   */
  isValidSource_(source) {
    if (!this.isStoryVideo_ || this.storySupportsHls_) {
      return true;
    }

    const type = (source.getAttribute('type') || '').toLowerCase();
    return type !== 'application/x-mpegurl' &&
        type !== 'application/vnd.apple.mpegurl';
  }

  /**
   * @private
   */
  installEventHandlers_() {
    const video = dev().assertElement(this.video_);

    this.unlisteners_.push(this.forwardEvents(
        [VideoEvents.PLAYING, VideoEvents.PAUSE, VideoEvents.ENDED], video));

    this.unlisteners_.push(listen(video, 'volumechange', () => {
      if (this.muted_ != this.video_.muted) {
        this.muted_ = this.video_.muted;
        const evt = this.muted_ ? VideoEvents.MUTED : VideoEvents.UNMUTED;
        this.element.dispatchCustomEvent(evt);
      }
    }));
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
        'Tried to reset amp-video without an underlying <video>.');

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
   * @override
   */
  pause() {
    this.video_.pause();
  }

  /**
   * @override
   */
  mute() {
    this.video_.muted = true;
  }

  /**
   * @override
   */
  unmute() {
    this.video_.muted = false;
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
    const played = this.video_.played;
    const length = played.length;
    const ranges = [];
    for (let i = 0; i < length; i++) {
      ranges.push([played.start(i), played.end(i)]);
    }
    return ranges;
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpVideo);
});
