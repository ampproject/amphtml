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
import {
  IntermediatePropagationMixin,
  MediaPoolVideoMixin,
  VideoElementMixin,
} from './mixins';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {VisibilityState} from '../../../src/visibility-state';
import {assertHttpsUrl, isProxyOrigin} from '../../../src/url';
import {
  childElementsByTag,
  closestByTag,
  elementByTag,
  insertAfterOrAtStart,
} from '../../../src/dom';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {isLayoutSizeDefined} from '../../../src/layout';
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
 * @package
 */
export class AmpVideo extends AMP.BaseElement {

  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.muted_ = false;

    /** @private {boolean} */
    this.isPrerenderAllowed_ = false;

    /** @private {!../../../src/mediasession-helper.MetadataDef} */
    this.metadata_ = EMPTY_METADATA;

    /** @private {?./mixins.AmpVideoMixinDef} */
    this.mixin_ = null;

    /** @private {?./mixins.PlaybackMixin} */
    this.playbackMixin_ = null;

    /** @private {boolean} */
    this.isConnected_ = false;
  }

  /** @return {boolean} @visibleForTesting */
  // TODO(alanorozco): Use mediapool service to determine mixin.
  static isInsideStory(element) {
    // Small optimization to short-circuit on amp-story-grid-layer instead of
    // amp-story. Validation defines that all content inside a Story should be
    // inside an <amp-story-grid-layer>.
    return !!closestByTag(element, 'amp-story-grid-layer');
  }

  /** @override */
  firstAttachedCallback() {
    this.isConnected_ = true;
  }

  /**
   * @param {boolean=} isLaidOut
   * @return {!./mixins.AmpVideoMixinDef}
   */
  getMixin_(isLaidOut = false) {
    // Use a ascendant-agnostic mixin before we know whether the component
    // descends from a mediapool-bound element. Determine whether it comes from
    // a mediapool on `layoutCallback`.
    //
    // Note that this can be determined by SSR, via the `i-amphtml-mediapool`
    // and `i-amphtml-not-mediapool` classnames. See `determineMixinFromSsr_`.

    if (this.mixin_ &&
        (this.mixin_.isIntermediate() && !isLaidOut ||
        this.mixin_.controlsPlayback())) {
      return this.assertMixin_();
    }

    const ctor = this.determineMixin_(isLaidOut);
    const mixin = new ctor(this);

    if (mixin.controlsPlayback()) {
      this.playbackMixin_ = mixin;
    }

    if (this.mixin_ !== null) {
      dev().assert(this.mixin_.isIntermediate());

      const intermediateMixin = /** @type {!IntermediatePropagationMixin} */ (
        dev().assert(this.mixin_));

      intermediateMixin.transferState(mixin);
    }

    this.mixin_ = mixin;

    return this.assertMixin_();
  }

  /** @private @return {!./mixins.AmpVideoMixinDef} */
  assertMixin_() {
    return /** @type {!./mixins.AmpVideoMixinDef} */ (
      dev().assert(this.mixin_));
  }

  /**
   * @param {boolean} isLaidOut
   * @return {./mixins.AmpVideoMixinConstructorDef}
   * @private
   */
  determineMixin_(isLaidOut) {
    const ctorFromCacheDetermination = this.determineMixinFromSsr_();

    if (ctorFromCacheDetermination) {
      return dev().assert(ctorFromCacheDetermination);
    }

    const viewer = Services.viewerForDoc(this.getAmpDoc());

    if (viewer.getVisibilityState() != VisibilityState.PRERENDER &&
        !isLaidOut) {
      return IntermediatePropagationMixin;
    }

    const {element} = this;
    const isInsideStory = AmpVideo.isInsideStory(element);

    return isInsideStory ? MediaPoolVideoMixin : VideoElementMixin;
  }

  /** @private @return {null|./mixins.AmpVideoMixinConstructorDef} */
  determineMixinFromSsr_() {
    const {element} = this;

    if (element.classList.contains('i-amphtml-no-media-pool')) {
      return /** @type {function(new:VideoElementMixin)} */ (VideoElementMixin);
    }
    if (element.classList.contains('i-amphtml-media-pool')) {
      return /** @type {function(new:MediaPoolVideoMixin)} */ (
        MediaPoolVideoMixin);
    }
    return null;
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
    const mixin = this.getMixin_();
    const baseElement = mixin.getBaseElement();
    const poster = this.element.getAttribute('poster');

    if (!poster && getMode().development) {
      console/*OK*/.error(TAG, 'No "poster" attribute provided.');
    }

    this.isPrerenderAllowed_ = this.hasAnyCachedSources_();

    // Enable inline play for iOS.
    baseElement.setAttribute('playsinline', '');
    baseElement.setAttribute('webkit-playsinline', '');
    // Disable video preload in prerender mode.
    baseElement.setAttribute('preload', 'none');
    this.propagateAttributes(ATTRS_TO_PROPAGATE_ON_BUILD, baseElement,
        /* opt_removeMissingAttrs */ true);

    this.applyFillContent(baseElement, true);

    mixin.installEventHandlers(
        [VideoEvents.PLAYING, VideoEvents.PAUSE, VideoEvents.ENDED],
        muted => this.setMuted_(muted));

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

    Services.videoManagerForDoc(this.element).register(this);
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (!this.isConnected_) {
      return;
    }

    const {element} = this;
    const resource = element.getResources().getResourceForElement(element);
    const isLaidOut = !resource.isLayoutPending();
    const baseElement = this.getMixin_(isLaidOut).getBaseElement();

    if (mutations['src']) {
      // TODO(alanorozco): Update for mediapool.
      assertHttpsUrl(this.element.getAttribute('src'), this.element);
      this.propagateAttributes(['src'], dev().assertElement(baseElement));
    }
    const attrs = ATTRS_TO_PROPAGATE.filter(
        value => mutations[value] !== undefined);
    this.propagateAttributes(
        attrs,
        dev().assertElement(baseElement),
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
    const isLaidOut = true;
    const mixin = this.getMixin_(isLaidOut);
    const baseElement = mixin.getBaseElement();

    if (!this.isVideoSupported_()) {
      this.toggleFallback(true);
      return Promise.resolve();
    }

    const viewer = Services.viewerForDoc(this.getAmpDoc());

    this.propagateAttributes(ATTRS_TO_PROPAGATE_ON_LAYOUT, baseElement,
        /* opt_removeMissingAttrs */ true);

    this.propagateCachedSources_(isLaidOut);

    // If we are in prerender mode, only propagate cached sources and then
    // when document becomes visible propagate origin sources and other children
    // If not in prerender mode, propagate everything.
    if (viewer.getVisibilityState() == VisibilityState.PRERENDER) {
      if (!this.element.hasAttribute('preload')) {
        baseElement.setAttribute('preload', 'auto');
      }
      viewer.whenFirstVisible().then(() => {
        this.propagateLayoutChildren_();
      });
    } else {
      this.propagateLayoutChildren_();
    }

    return mixin.whenLoadStarts().then(() => {
      this.element.dispatchCustomEvent(VideoEvents.LOAD);
    });
  }

  /**
   * @private
   * Propagate sources that are cached by the CDN.
   */
  propagateCachedSources_(isLaidOut) {
    const mixin = this.getMixin_(isLaidOut);
    const sources = toArray(childElementsByTag(this.element, 'source'));
    const baseElement = mixin.getBaseElement();

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
      if (this.isCachedByCDN_(source)) {
        baseElement.appendChild(source);
      }
    });
  }

  /**
   * Propagate origin sources and tracks
   * @private
   */
  propagateLayoutChildren_() {
    const isLaidOut = true;
    const mixin = this.getMixin_(isLaidOut);
    const baseElement = mixin.getBaseElement();

    const sources = toArray(childElementsByTag(this.element, 'source'));

    // If the `src` of `amp-video` itself is NOT cached, set it on base node.
    if (this.element.hasAttribute('src') &&
        !this.isCachedByCDN_(this.element)) {
      assertHttpsUrl(this.element.getAttribute('src'), this.element);
      this.propagateAttributes(['src'], baseElement);
    }

    sources.forEach(source => {
      // Cached sources should have been moved from <amp-video> to base node.
      dev().assert(!this.isCachedByCDN_(source));
      assertHttpsUrl(source.getAttribute('src'), source);
      baseElement.appendChild(source);
    });

    // To handle cases where cached source may 404 if not primed yet,
    // duplicate the `origin` Urls for cached sources and insert them after each
    const cached = toArray(baseElement.querySelectorAll('[amp-orig-src]'));
    cached.forEach(cachedSource => {
      const origSrc = cachedSource.getAttribute('amp-orig-src');
      const origType = cachedSource.getAttribute('type');
      const origSource = this.createSourceElement_(origSrc, origType);
      insertAfterOrAtStart(baseElement, origSource, cachedSource);
    });

    const tracks = toArray(childElementsByTag(this.element, 'track'));
    tracks.forEach(track => {
      baseElement.appendChild(track);
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
   * @param {boolean} muted
   * @private
   */
  setMuted_(muted) {
    if (this.muted_ == muted) {
      return;
    }
    const evt = muted ? VideoEvents.MUTED : VideoEvents.UNMUTED;
    this.muted_ = muted;
    this.element.dispatchCustomEvent(evt);
  }

  /** @override */
  pauseCallback() {
    this.getMixin_().pause();
  }

  /** @private */
  isVideoSupported_() {
    // TODO(alanorozco): Agh.
    return true;
    // return this.getMixin_().isVideoSupported();
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /** @override */
  supportsPlatform() {
    return this.isVideoSupported_();
  }

  /** @override */
  isInteractive() {
    return this.element.hasAttribute('controls');
  }

  /** @override */
  play(unusedIsAutoplay) {
    if (this.playbackMixin_ === null) {
      return;
    }
    this.playbackMixin_.play();
  }

  /** @override */
  pause() {
    if (this.playbackMixin_ === null) {
      return;
    }
    this.playbackMixin_.pause();
  }

  /** @override */
  mute() {
    if (this.playbackMixin_ === null) {
      return;
    }
    this.playbackMixin_.toggleMuted(true);
  }

  /** @override */
  unmute() {
    if (this.playbackMixin_ === null) {
      return;
    }
    this.playbackMixin_.toggleMuted(false);
  }

  /** @override */
  showControls() {
    if (this.playbackMixin_ === null) {
      return;
    }
    this.playbackMixin_.toggleControls(true);
  }

  /** @override */
  hideControls() {
    if (this.playbackMixin_ === null) {
      return;
    }
    this.playbackMixin_.toggleControls(false);
  }

  /** @override */
  fullscreenEnter() {
    if (this.playbackMixin_ === null) {
      return;
    }
    this.playbackMixin_.fullscreenEnter();
  }

  /** @override */
  fullscreenExit() {
    if (this.playbackMixin_ === null) {
      return;
    }
    this.playbackMixin_.fullscreenExit();
  }

  /** @override */
  isFullscreen() {
    if (this.playbackMixin_ === null) {
      return false;
    }
    return this.playbackMixin_.isFullscreen();
  }

  /** @override */
  getMetadata() {
    return this.metadata_;
  }

  /** @override */
  getCurrentTime() {
    if (this.playbackMixin_ === null) {
      return 0;
    }
    return this.playbackMixin_.getCurrentTime();
  }

  /** @override */
  getDuration() {
    if (this.playbackMixin_ === null) {
      return 0;
    }
    return this.playbackMixin_.getDuration();
  }

  /** @override */
  getPlayedRanges() {
    if (this.playbackMixin_ === null) {
      return [];
    }
    return this.playbackMixin_.getPlayedRanges();
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpVideo);
});
