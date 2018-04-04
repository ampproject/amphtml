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
import {VideoElementMixin, MediaPoolVideoMixin} from './mixins';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {VisibilityState} from '../../../src/visibility-state';
import {assertHttpsUrl, isProxyOrigin} from '../../../src/url';
import {
  childElementByTag,
  childElementsByTag,
  elementByTag,
  insertAfterOrAtStart,
} from '../../../src/dom';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
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
 * @package
 */
export class AmpVideo extends AMP.BaseElement {

  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    const isStoryVideo = AmpVideo.isStoryVideo(element);
    const mixin = isStoryVideo ?
        MediaPoolVideoMixin :
        VideoElementMixin;

    /** @private {?Element} */
    this.baseNode_ = null;

    /** @private {boolean} */
    this.muted_ = false;

    /** @private {boolean} */
    this.isPrerenderAllowed_ = false;

    /** @private {!../../../src/mediasession-helper.MetadataDef} */
    this.metadata_ = EMPTY_METADATA;

    /** @private @const {boolean} */
    this.isStoryVideo_ = isStoryVideo;

    /** @private @const {./mixins.AmpVideoMixin} */
    this.mixin_ = new mixin(this);
  }

  /** @return {boolean} @visibleForTesting */
  // TODO(alanorozco): Use mediapool service to determine mixin.
  static isStoryVideo(element) {
    return !!closestByTag(element, 'amp-story');
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
    const baseNode = this.mixin_.createBaseNode();
    const poster = this.element.getAttribute('poster');

    if (!poster && getMode().development) {
      console/*OK*/.error(TAG, 'No "poster" attribute provided.');
    }

    this.isPrerenderAllowed_ = this.hasAnyCachedSources_();

    // Enable inline play for iOS.
    baseNode.setAttribute('playsinline', '');
    baseNode.setAttribute('webkit-playsinline', '');
    // Disable video preload in prerender mode.
    baseNode.setAttribute('preload', 'none');
    this.propagateAttributes(ATTRS_TO_PROPAGATE_ON_BUILD, baseNode,
        /* opt_removeMissingAttrs */ true);

    this.applyFillContent(baseNode, true);

    this.mixin_.installEventHandlers(
        [VideoEvents.PLAYING, VideoEvents.PAUSE, VideoEvents.ENDED],
        muted => this.setMuted_(muted));

    this.baseNode_ = baseNode;

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
    if (!this.baseNode_) {
      return;
    }
    if (mutations['src']) {
      // TODO(alanorozco): Update for mediapool.
      assertHttpsUrl(this.element.getAttribute('src'), this.element);
      this.propagateAttributes(['src'], dev().assertElement(this.baseNode_));
    }
    const attrs = ATTRS_TO_PROPAGATE.filter(
        value => mutations[value] !== undefined);
    this.propagateAttributes(
        attrs,
        dev().assertElement(this.baseNode_),
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
    this.baseNode_ = dev().assertElement(this.baseNode_);

    if (!this.isVideoSupported_()) {
      this.toggleFallback(true);
      return Promise.resolve();
    }

    const viewer = Services.viewerForDoc(this.getAmpDoc());

    this.propagateAttributes(ATTRS_TO_PROPAGATE_ON_LAYOUT,
        dev().assertElement(this.baseNode_),
        /* opt_removeMissingAttrs */ true);

    this.propagateCachedSources_();

    // If we are in prerender mode, only propagate cached sources and then
    // when document becomes visible propagate origin sources and other children
    // If not in prerender mode, propagate everything.
    if (viewer.getVisibilityState() == VisibilityState.PRERENDER) {
      if (!this.element.hasAttribute('preload')) {
        this.baseNode_.setAttribute('preload', 'auto');
      }
      viewer.whenFirstVisible().then(() => {
        this.propagateLayoutChildren_();
      });
    } else {
      this.propagateLayoutChildren_();
    }

    return this.mixin_.whenLoadStarts().then(() => {
      this.element.dispatchCustomEvent(VideoEvents.LOAD);
    });
  }

  /**
   * @private
   * Propagate sources that are cached by the CDN.
   */
  propagateCachedSources_() {
    const fragment = new DocumentFragment();

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
      if (this.isCachedByCDN_(source)) {
        fragment.appendChild(source);
      }
    });

    this.mixin_.appendSources(fragment);
  }

  /**
   * Propagate origin sources and tracks
   * @private
   */
  propagateLayoutChildren_() {
    const fragment = new DocumentFragment();

    const sources = toArray(childElementsByTag(this.element, 'source'));

    // If the `src` of `amp-video` itself is NOT cached, set it on video
    if (this.element.hasAttribute('src') &&
        !this.isCachedByCDN_(this.element)) {
      assertHttpsUrl(this.element.getAttribute('src'), this.element);
      this.propagateAttributes(['src'], dev().assertElement(this.baseNode_));
    }

    sources.forEach(source => {
      // Cached sources should have been moved from <amp-video> to <video>.
      dev().assert(!this.isCachedByCDN_(source));
      assertHttpsUrl(source.getAttribute('src'), source);
      fragment.appendChild(source);
    });

    // To handle cases where cached source may 404 if not primed yet,
    // duplicate the `origin` Urls for cached sources and insert them after each
    const cached = toArray(this.baseNode_.querySelectorAll('[amp-orig-src]'));
    cached.forEach(cachedSource => {
      const origSrc = cachedSource.getAttribute('amp-orig-src');
      const origType = cachedSource.getAttribute('type');
      const origSource = this.createSourceElement_(origSrc, origType);
      insertAfterOrAtStart(dev().assertElement(this.baseNode_),
          origSource, cachedSource);
    });

    const tracks = toArray(childElementsByTag(this.element, 'track'));
    tracks.forEach(track => {
      fragment.appendChild(track);
    });

    this.mixin_.appendSources(fragment);
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
    this.mixin_.pauseCallback();
  }

  /** @private */
  isVideoSupported_() {
    return this.mixin_.isVideoSupported();
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

  // TODO(alanorozco): Implement mixin methods.

  /** @override */
  play(unusedIsAutoplay) {
    this.mixin_.play();
  }

  /** @override */
  pause() {
    this.mixin_.pause();
  }

  /** @override */
  mute() {
    this.mixin_.toggleMuted(true);
  }

  /** @override */
  unmute() {
    this.mixin_.toggleMuted(false);
  }

  /** @override */
  showControls() {
    this.mixin_.toggleControls(true);
  }

  /** @override */
  hideControls() {
    this.mixin_.toggleControls(false);
  }

  /** @override */
  fullscreenEnter() {
    this.mixin_.fullscreenEnter();
  }

  /** @override */
  fullscreenExit() {
    this.mixin_.fullscreenExit();
  }

  /** @override */
  isFullscreen() {
    return this.mixin_.isFullscreen();
  }

  /** @override */
  getMetadata() {
    return this.metadata_;
  }

  /** @override */
  getCurrentTime() {
    return this.mixin_.getCurrentTime();
  }

  /** @override */
  getDuration() {
    return this.mixin_.getDuration();
  }

  getPlayedRanges() {
    return this.mixin_.getPlayedRanges();
  }
}


AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpVideo);
});
