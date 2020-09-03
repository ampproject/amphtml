/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../../src/services';
import {dev} from '../../../src/log';
import {registerServiceBuilder} from '../../../src/service';

/**
 * Util function to retrieve the media query service. Ensures we can retrieve
 * the service synchronously from the amp-story codebase without running into
 * race conditions.
 * @param  {!Window} win
 * @return {!AmpStoryMediaQueryService}
 */
export const getMediaQueryService = (win) => {
  let service = Services.storyMediaQueryService(win);

  if (!service) {
    service = new AmpStoryMediaQueryService(win);
    registerServiceBuilder(win, 'story-media-query', function () {
      return service;
    });
  }

  return service;
};

/**
 * Media query service.
 */
export class AmpStoryMediaQueryService {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Promise} */
    this.initializePromise_ = null;

    /** @private {?Element} Iframe matcher. */
    this.matcher_ = null;

    /** @private @const {!Element} */
    this.storyEl_ = dev().assertElement(
      this.win_.document.querySelector('amp-story')
    );
  }

  /**
   * Registers the media query and triggering the provided callback on match.
   * @param {string} media The media query, ie: '(orientation: portrait)'
   * @param {function(boolean)} callback Called when the media query matches.
   * @return {!Promise<!MediaQueryList>}
   */
  onMediaQueryMatch(media, callback) {
    return this.initialize_().then(() => {
      const mediaQueryList = this.matcher_.contentWindow.matchMedia(media);
      mediaQueryList.addListener((event) => callback(event.matches));
      callback(mediaQueryList.matches);
      return mediaQueryList;
    });
  }

  /**
   * Creates an iframe that is positioned like an amp-story-page, used to match
   * media queries.
   * @return {!Promise} Resolves when the iframe is ready.
   * @private
   */
  initialize_() {
    if (this.initializePromise_) {
      return this.initializePromise_;
    }

    this.initializePromise_ = new Promise((resolve) => {
      this.matcher_ = this.win_.document.createElement('iframe');
      this.matcher_.classList.add('i-amphtml-story-media-query-matcher');
      this.matcher_.onload = resolve;
      this.storyEl_.appendChild(this.matcher_);
    });

    return this.initializePromise_;
  }
}
