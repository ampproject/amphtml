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

import {Autoplay, AutoplayEvents} from './video/autoplay';
import {PlayingStates, VideoAttributes, VideoEvents} from '../video-interface';
import {Services} from '../services';
import {VideoServiceSignals} from './video-service-interface';
import {dev} from '../log';
import {getElementServiceForDoc} from '../element-service';
import {isExperimentOn} from '../experiments';
import {listen, listenOncePromise} from '../event-helper';
import {once} from '../utils/function';


/** @private @const {string} */
const EXTENSION = 'amp-video-service';


/** @private @const {string} */
const TAG = 'video-service';


/**
 * @typedef
 * {../../extensions/amp-video-service/0.1/amp-video-service.VideoService}
 */
let VideoServiceDef; // alias for line length.


/**
 * Provides unified behavior for all videos regardless of implementation.
 *
 * This service is a façade around an async-loaded implementation.
 * See {@link AmpVideoService} for the underlying service.
 *
 * This co-eexists with `VideoManager` (deprecated) while the implementation
 * is migrated.
 *
 * @implements {./video-service-interface.VideoServiceInterface}
 */
export class VideoServiceSync {

  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    const {win} = ampdoc;

    /** @private @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private @const {!Promise<!VideoServiceDef>}  */
    this.asyncImpl_ = VideoServiceSync.videoServiceFor(win, ampdoc);

    /**
     * @return {!Autoplay}
     * @private
     */
    this.getAutoplay_ = once(() => new Autoplay(this.ampdoc_));
  }

  /**
   * @param {!Window} win
   * @return {boolean}
   * @visibleForTesting
   */
  static shouldBeUsedIn(win) {
    return isExperimentOn(win, 'video-service');
  }

  /**
   * @param {!Window} win
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @return {!Promise<!VideoServiceDef>}
   * @visibleForTesting
   */
  static videoServiceFor(win, ampdoc) {
    // Not exposed in ../services.js since we don't want other modules to
    // instantiate or access the service.
    const extensions = Services.extensionsFor(win);
    return extensions.installExtensionForDoc(ampdoc, EXTENSION)
        .then(() => {
          const element = ampdoc.getHeadNode();
          return /** @type {!Promise<!VideoServiceDef>} */ (
            getElementServiceForDoc(element, 'video-service', EXTENSION));
        });
  }

  /** @override */
  register(video) {
    this.asyncImpl_.then(impl =>
      impl.register(video));

    this.maybeInstallAutoplay_(video);

    new VideoEntry(video);
  }

  /**
   * @param  {!../video-interface.VideoOrBaseElementDef} video
   * @private
   */
  maybeInstallAutoplay_(video) {
    if (!video.element.hasAttribute(VideoAttributes.AUTOPLAY)) {
      return;
    }

    this.getAutoplay_().register(video);

    const autoplayDelegated = VideoServiceSignals.AUTOPLAY_DELEGATED;
    video.signals().whenSignal(autoplayDelegated).then(() => {
      this.getAutoplay_().delegate(video.element);
    });
  }

  /**
   * @param {!AmpElement|!../base-element.BaseElement} video
   */
  static delegateAutoplay(video) {
    video.signals().signal(VideoServiceSignals.AUTOPLAY_DELEGATED);
  }

  /** @override */
  getAnalyticsDetails(video) {
    return this.asyncImpl_.then(impl =>
      impl.getAnalyticsDetails(video));
  }

  /** @override */
  isMuted(unusedVideo) {
    dev().warn(TAG, 'isMuted is not implemented');
    return false;
  }

  /** @override */
  getPlayingState(unusedVideo) {
    dev().warn(TAG, 'getPlayingState is not implemented');
    return PlayingStates.PAUSED;
  }
}


/** @visibleForTesting */
export class VideoEntry {

  /** @param {!../video-interface.VideoOrBaseElementDef} video */
  constructor(video) {

    /** @private @const {!../video-interface.VideoOrBaseElementDef} */
    this.video_ = video;

    /** @private @const {!AmpElement} */
    this.element_ = video.element;

    /** @private @const {!Promise} */
    this.loadPromise_ = listenOncePromise(this.element_, VideoEvents.LOAD);

    this.listenToAutoplayEvents_();

    setVideoComponentClassname(this.element_);
  }

  /**
   * @param {string} event
   * @param {function(!Event)} handler
   * @private
   */
  listenOnLoad_(event, handler) {
    listen(this.element_, event, e => {
      this.loadPromise_.then(() => {
        handler(e);
      });
    });
  }

  /** @private */
  listenToAutoplayEvents_() {
    // TODO(alanorozco): Keep track of session
    this.listenOnLoad_(AutoplayEvents.PLAY, () => {
      this.video_.play(/* auto */ true);
    });

    this.listenOnLoad_(AutoplayEvents.PAUSE, () => {
      this.video_.pause();
    });
  }
}

/**
 * @param {!Element} element
 */
export function setVideoComponentClassname(element) {
  element.classList.add('i-amphtml-video-component');
}
