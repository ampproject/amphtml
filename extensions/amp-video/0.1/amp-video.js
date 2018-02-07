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
import {MediaPoolAmpVideo} from './media-pool-amp-video';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {VideoProperties} from './video-lifecycle';
import {VisibilityState} from '../../../src/visibility-state';
import {assertHttpsUrl, isProxyOrigin} from '../../../src/url';
import {dev} from '../../../src/log';
import {getMode} from '../../../src/mode';
import {
  fullscreenEnter,
  fullscreenExit,
  isFullscreenElement,
} from '../../../src/dom';
import {
  getOriginSourcesAndTracks,
  getVideoSourceForPreconnect,
  hasAnyCachedSources,
  maybePlay,
  propagateSourcesOnPrerender,
  removeCachedSources,
  setDefaultAttributes,
  videoMetadataFor,
} from './utils';
import {listen} from '../../../src/event-helper';
import {isLayoutSizeDefined} from '../../../src/layout';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';


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
 * Selects the required implenentation for a given <amp-video>.
 * If the element descends from an element with a media pool, the corresponding
 * implementation will be instantiated. Otherwise, a standard AmpVideo will
 * be instantiated.
 */
class AmpVideoUpgrader extends AMP.BaseElement {
  /** @override */
  upgradeCallback() {
    const mediaPoolService = Services.mediaPoolFor(this.win);
    if (mediaPoolService.hasMediaPool(this.element)) {
      return new MediaPoolAmpVideo(this.element);
    }
    return new AmpVideo(this.element);
  }
}


/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpVideo extends AMP.BaseElement {

  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {?./video-properties.VideoProperties} */
    this.properties_ = new VideoProperties(this);

    /** @private {?Element} */
    this.video_ = null;

    /** @private {?./video-properties.VideoLifecycle} */
    this.lifecycle_ = null;

    /** @private {boolean} */
    this.isPrerenderAllowed_ = false;

    /** @private {!../../../src/mediasession-helper.MetadataDef} */
    this.metadata_ = EMPTY_METADATA;
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    const videoSrc = getVideoSourceForPreconnect(this.element);
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

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.video_ = this.element.ownerDocument.createElement('video');
    this.lifecycle_ = this.properties_.lifecycleFor(this.video_);

    this.isPrerenderAllowed_ = hasAnyCachedSources(this.element);
    this.metadata_ = videoMetadataFor(this.element);

    this.lifecycle_.build();

    this.applyFillContent(this.video_, true);
    this.element.appendChild(this.video_);

    installVideoManagerForDoc(this.element);
    Services.videoManagerForDoc(this.element).register(this);
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
    if (!this.isVideoSupported_()) {
      this.toggleFallback(true);
      return Promise.resolve();
    }
    return this.lifecycle_.layout();
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
    maybePlay(this.video_);
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
  AMP.registerElement(TAG, AmpVideoUpgrader);
});
