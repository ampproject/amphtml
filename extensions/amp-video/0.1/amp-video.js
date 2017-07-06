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

import {elementByTag} from '../../../src/dom';
import {listen} from '../../../src/event-helper';
import {isLayoutSizeDefined} from '../../../src/layout';
import {getMode} from '../../../src/mode';
import {dev} from '../../../src/log';
import {
  installVideoManagerForDoc,
} from '../../../src/service/video-manager-impl';
import {VideoEvents} from '../../../src/video-interface';
import {videoManagerForDoc} from '../../../src/services';
import {assertHttpsUrl} from '../../../src/url';

const TAG = 'amp-video';

/** @private {!Array<string>} */
const ATTRS_TO_PROPAGATE_ON_BUILD = ['poster', 'controls', 'aria-label',
  'aria-describedby', 'aria-labelledby'];

/**
 * @note Do not propagate `autoplay`. Autoplay behaviour is managed by
 *       video manager since amp-video implements the VideoInterface.
 * @private {!Array<string>}
 */
const ATTRS_TO_PROPAGATE_ON_LAYOUT = ['src', 'loop', 'preload'];

/** @private {!Array<string>} */
const ATTRS_TO_PROPAGATE =
    ATTRS_TO_PROPAGATE_ON_BUILD.concat(ATTRS_TO_PROPAGATE_ON_LAYOUT);

/**
 * @implements {../../../src/video-interface.TrackingVideoInterface}
 */
class AmpVideo extends AMP.BaseElement {

    /**
     * @param {!AmpElement} element
     */
  constructor(element) {
    super(element);

      /** @private {?Element} */
    this.video_ = null;

      /** @private {?boolean}  */
    this.muted_ = false;
  }

    /**
     * @param {boolean=} opt_onLayout
     * @override
     */
  preconnectCallback(opt_onLayout) {
    const videoSrc = this.getVideoSource_();
    if (videoSrc) {
      assertHttpsUrl(videoSrc, this.element);
      this.preconnect.url(videoSrc, opt_onLayout);
    }
  }

    /**
     * @private
     * @return {string}
     */
  getVideoSource_() {
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

    const posterAttr = this.element.getAttribute('poster');
    if (!posterAttr && getMode().development) {
      console/*OK*/.error(
          'No "poster" attribute has been provided for amp-video.');
    }

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

    installVideoManagerForDoc(this.element);
    videoManagerForDoc(this.element).register(this);
  }

    /** @override */
  mutatedAttributesCallback(mutations) {
    if (!this.video_) {
      return;
    }
    if (mutations['src']) {
      assertHttpsUrl(this.element.getAttribute('src'), this.element);
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

    if (this.element.getAttribute('src')) {
      assertHttpsUrl(this.element.getAttribute('src'), this.element);
    }

    this.propagateAttributes(ATTRS_TO_PROPAGATE_ON_LAYOUT, this.video_,
        /* opt_removeMissingAttrs */ true);

    this.getRealChildNodes().forEach(child => {
        // Skip the video we already added to the element.
      if (this.video_ === child) {
        return;
      }
      if (child.getAttribute && child.getAttribute('src')) {
        assertHttpsUrl(child.getAttribute('src'),
            dev().assertElement(child));
      }
      this.video_.appendChild(child);
    });

      // loadPromise for media elements listens to `loadstart`
    return this.loadPromise(this.video_).then(() => {
      this.element.dispatchCustomEvent(VideoEvents.LOAD);
    });
  }

    /**
     * @private
     */
  installEventHandlers_() {
    const video = dev().assertElement(this.video_);
    this.forwardEvents([VideoEvents.PLAY, VideoEvents.PAUSE], video);
    listen(video, 'volumechange', () => {
      if (this.muted_ != this.video_.muted) {
        this.muted_ = this.video_.muted;
        const evt = this.muted_ ? VideoEvents.MUTED : VideoEvents.UNMUTED;
        this.element.dispatchCustomEvent(evt);
      }
    });
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

  /** @override */
  isTrackingVideo() {
    return true;
  }

  /** @override */
  getId() {
    return this.video_.id;
  }

  /** @override */
  getCurrentTime() {
    return this.video_.currentTime;
  }

  /** @override */
  getWidth() {
    return this.video_.width;
  }

  /** @override */
  getHeight() {
    return this.video_.height;
  }

  /** @override */
  getDuration() {
    return this.video_.duration;
  }

  /** @override */
  getPaused() {
    return this.video_.paused;
  }

  /** @override */
  getPlayedRanges() {
    return this.video_.played;
  }

  /** @override */
  getPlayedTotal() {
    return this.video_.played.reduce(
        (acc, range) => acc + range[1] - range[0], 0);
  }

  /** @override */
  getMuted() {
    return this.muted_;
  }

  /** @override */
  getEnded() {
    return this.video_.ended;
  }
}

AMP.registerElement(TAG, AmpVideo);
