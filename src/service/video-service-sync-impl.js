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

import {Services} from '../services';
import {VideoEvents} from '../video-interface';
import {dev} from '../log';
import {getAmpdoc} from '../service';
import {getElementServiceForDoc} from '../element-service';
import {isExperimentOn} from '../experiments';


/** @private @const {string} */
const EXTENSION = 'amp-video-service';


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
 * @implements {./video-manager-impl.VideoService}
 */
export class VideoServiceSync {

  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    const {win} = ampdoc;

    /** @private @const {!Promise<!VideoServiceDef>}  */
    this.asyncImpl_ = VideoServiceSync.videoServiceFor(win, ampdoc);
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
   * @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc
   * @return {!Promise<!VideoServiceDef>}
   * @visibleForTesting
   */
  // Not exposed in ../services.js since we don't want other modules to
  // instantiate or access the service.
  static videoServiceFor(win, nodeOrDoc) {
    const extensions = Services.extensionsFor(win);
    const ampdoc = getAmpdoc(nodeOrDoc);
    return extensions.installExtensionForDoc(ampdoc, EXTENSION)
        .then(() => /** @type {!Promise<!VideoServiceDef>} */ (
          getElementServiceForDoc(nodeOrDoc, 'video-service', EXTENSION)));
  }

  /** @override */
  register(video, unusedFromV1manageAutoplay = true) {
    this.asyncImpl_.then(impl =>
      impl.register(video));
  }

  /** @override */
  delegateAutoplay(video, optObservable = null) {
    // TODO(alanorozco): Make observable required once implementation of
    // `VideoService` finalizes.
    const observable = dev().assert(optObservable,
        '`VideoService` requires an observable for autoplay delegation.');

    this.asyncImpl_.then(impl =>
      impl.delegateAutoplay(video, observable));
  }

  /** @override */
  getAnalyticsDetails(video) {
    return this.asyncImpl_.then(impl =>
      impl.getAnalyticsDetails(video));
  }

  /** @override */
  disable(element, ...varFeatures) {
    dev().assert(!element.signals().get(VideoEvents.REGISTERED));
    const disabled = '__AMP_DISABLED__';
    element[disabled] = (element[disabled] || []).concat(varFeatures);
  }
}
