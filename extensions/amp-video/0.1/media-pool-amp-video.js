/**
  * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {assertHttpsUrl} from '../../../src/url';
import {listenOnce} from '../../../src/event-helper';
import {
  createElementWithAttributes,
  scopedQuerySelector,
} from '../../../src/dom';
import {setImportantStyles} from '../../../src/style';
import {Services} from '../../../src/services';
import {
  getVideoSourceForPreconnect,
  hasAnyCachedSources,
  maybePlay,
  videoMetadataFor,
} from './utils';
import {dev, user} from '../../../src/log';
import {isLayoutSizeDefined} from '../../../src/layout';
import {MediaType} from '../../../src/service/media-pool-impl';
import {VideoProperties} from './video-lifecycle';
import {VideoEvents} from '../../../src/video-interface';
import {EMPTY_METADATA} from '../../../src/mediasession-helper';
import {isExperimentOn} from '../../../src/experiments';


/** @const {string} */
const MEDIA_PLACEHOLDER_CLASS_NAME = 'i-amphtml-media-placeholder';


/**
 * @param {string} src
 * @return {!Promise<!Image>}
 */
function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = resolve;
    img.src = src;
    return img;
  });
}


/**
 * Creates placeholder that is displyated when the container does not have a
 * <video> resource.
 * @param {string} posterSrc
 * @return {!Promise}
 */
function createVideoPlaceholder(doc, container, posterSrc) {
  return loadImage(posterSrc).then(() => {
    const placeholderEl = createElementWithAttributes(doc, 'amp-layout', {
      'class': MEDIA_PLACEHOLDER_CLASS_NAME,
      'layout': 'fill',
    });
    setImportantStyles(placeholderEl, {
      'background-image': `url(${posterSrc})`,
    });
    return placeholderEl;
  });
}


/**
 * @param {!Window} win
 * @param {!Element} source The <source> element to check for validity.
 * @return {boolean} true if the source is allowed to be propagated to the
 *     created video.
 * @private
 */
export function isValidSource(win, source) {
  if (!isExperimentOn(win, 'disable-amp-story-hls')) {
    return true;
  }
  const type = (source.getAttribute('type') || '').toLowerCase();
  return type !== 'application/x-mpegurl' &&
      type !== 'application/vnd.apple.mpegurl';
}


/**
 * AmpVideo that uses <video> elements provided by a media pool.
 * Instantiated only inside <amp-story>.
 * @implements {../../../src/video-interface.VideoInterface}
 * @implements {../../../src/media-pool-impl.MediaOptionalInterface}
 */
export class MediaPoolAmpVideo extends AMP.BaseElement {
  constructor(element) {
    super(element);

    /**
     * <video> resource optional. Since this uses a media pool, this could or
     * not exist at any given time.
     * @private {?HTMLMediaElement}
     */
    this.video_ = null;

    /**
     * Media pool this component can use.
     * @private {!../../../src/media-pool-impl.MediaPool}
     */
    this.pool_ = Services.mediaPoolFor(this.win).for(this.element);

    /** @private {!../../../src/mediasession-helper.MetadataDef} */

    /**
     * Support is known as soon as <video> is available.
     * @private {boolean}
     */
    this.isVideoSupported_ = false;

    /**
     * Media id for pool.
     * @public @const {string}
     */
    this.mediaId_ = this.element.id || this.pool_.createMediaId();

    this.properties_ = new VideoProperties(this,
        source => isValidSource(this.win, source));

    this.lifecycle_ = null;
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
   * See documentation for AmpVideo#prerenderAllowed.
   * The prerender logic here is mirrored from the standard implementation with
   * the exception that, if the media pool rejects this component's request for
   * a video element, only a poster image will be prerendered.
   */
  prerenderAllowed() {
    return this.isPrerenderAllowed_;
  }


  /** @override */
  buildCallback() {
    this.isPrerenderAllowed_ = hasAnyCachedSources(this.element);
    this.metadata_ = videoMetadataFor(this.element);

    this.isBuilt_ = true;

    if (!this.requestResource_()) {
      this.buildOrShowPlaceholder_();
    }
  }

  /** @override */
  mutatedAttributesCallback(unusedMutations) {
    // TODO(alanorozco): Implement.
  }

  /** @override */
  viewportCallback(visible) {
    this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
  }

  /** @override */
  layoutCallback() {
    this.isLaidOut_ = true;

    if (!this.requestResource_()) {
      this.buildOrShowPlaceholder_();
      return Promise.resolve();
    }

    return this.onLifecycleLayout_();
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  pauseCallback() {
    this.pause();
  }

  /**
   * @return {?Element}
   * @private
   */
  getPlaceholderElement_() {
    return scopedQuerySelector(this.element,
        `> .${MEDIA_PLACEHOLDER_CLASS_NAME}`);
  }

  /**
   * @private
   * @return {!Promise}
   */
  buildOrShowPlaceholder_() {
    const placeholder = this.getPlaceholderElement_();
    if (placeholder) {
      placeholder.classList.remove('i-amphtml-hidden');
      return Promise.resolve();
    }
    const posterSrc = this.element.getAttribute('poster');
    if (!posterSrc) {
      return Promise.resolve();
    }
    if (!this.videoPlaceholderPromise_) {
      this.videoPlaceholderPromise_ =
          createVideoPlaceholder(this.win.document, this.element, posterSrc);

      this.videoPlaceholderPromise_.then(placeholder => {
        this.element.appendChild(placeholder);
        if (this.video_) {
          // Resource available before image loaded.
          this.hidePlaceholder_();
          return;
        }
      });
    }
    return this.videoPlaceholderPromise_;
  }

  /** @private */
  hidePlaceholder_() {
    const placeholder = this.getPlaceholderElement_();
    if (placeholder) {
      placeholder.classList.add('i-amphtml-hidden');
    }
  }

  /**
   * Requests a <video> resource from the pool.
   * @return {?HTMLMediaElement}
   * @private
   */
  requestResource_() {
    if (!this.video_) {
      this.attachVideo_(this.pool_.requestResource(MediaType.VIDEO, this));
    }
    return this.video_;
  }

  attachVideo_(video) {
    if (!video) {
      return;
    }

    this.video_ = dev().assertElement(video);

    this.lifecycle_ = this.properties_.lifecycleFor(this.video_);

    this.element.appendChild(this.video_);
    this.applyFillContent(this.video_, true);

    if (this.isBuilt_) {
      this.lifecycle_.build();
    }

    if (this.isLaidOut_) {
      this.onLifecycleLayout_();
    }

    this.lifecycle_.listenOnce(VideoEvents.PLAYING, () => {
      this.hidePlaceholder_();
    });
  }

  onLifecycleLayout_() {
    if (this.lifecycle_.isLaidOut()) {
      return;
    }
    return this.lifecycle_.layout().then(() => {
      this.isVideoSupported_ = !!this.video_.play;
      this.duration_ = this.video_.duration;

      if (!this.isVideoSupported_) {
        this.toggleFallback(true);
        return Promise.resolve();
      }
    });
  }

  /**
   * @return {boolean}
   * @private
   */
  isSuspended_() {
    return !this.video_;
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /** @override */
  supportsPlatform() {
    return this.isVideoSupported_;
  }

  /** @override */
  isInteractive() {
    return false;
  }

  /** @override */
  play(unusedIsAutoplay) {
    if (this.isSuspended_()) {
      this.requestResource_();
    }
    // TODO(alanorozco): Use MediaPool queue per #13259.
    maybePlay(dev().assertElement(this.video_));
  }

  /** @override */
  pause() {
    if (this.isSuspended_()) {
      return;
    }
    // TODO(alanorozco): Use MediaPool queue per #13259.
    this.video_.pause();
  }

  /** @override */
  mute() {
    if (this.isSuspended_()) {
      return;
    }
    // TODO(alanorozco): Use MediaPool queue per #13259.
    this.video_.muted = true;
  }

  /** @override */
  unmute() {
    if (this.isSuspended_()) {
      return;
    }
    // TODO(alanorozco): Use MediaPool queue per #13259.
    this.video_.muted = false;
  }

  /** @override */
  showControls() {
    // NOOP
  }

  /** @override */
  hideControls() {
    // NOOP
  }

  /** @override */
  fullscreenEnter() {
    // NOOP
  }

  /** @override */
  fullscreenExit() {
    // NOOP
  }

  /** @override */
  isFullscreen() {
    // NOOP
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
    if (this.isSuspended_()) {
      return this.lastCurrentTime_;
    }
    return this.video_.currentTime;
  }

  /** @override */
  getDuration() {
    if (this.isSuspended_()) {
      return this.duration_;
    }
    return this.video_.duration;
  }

  /** @override */
  getPlayedRanges() {
    // TODO(alanorozco): Do we need this?
    return [];
  }

  // MediaOptionalInterface Implementation.
  // See ../src/service/media-pool-impl.MediaOptionalInterface

  /** @override */
  getMediaId() {
    return this.mediaId_;
  }

  /** @override */
  freeResource() {
    const resource = dev().assertElement(this.video_, 'No resource.');

    dev().assert(this.lifecycle_);

    this.buildOrShowPlaceholder_();
    this.lifecycle_.suspend();

    this.lastCurrentTime_ = resource.currentTime;

    this.video_ = null;
    this.lifecycle_ = null;

    return resource;
  }

  /** @override */
  getResource() {
    return this.video_;
  }
}

