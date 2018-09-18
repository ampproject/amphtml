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

import {Services} from '../../../src/services';
import {childElementByTag} from '../../../src/dom';
import {getAmpdoc, registerServiceBuilder} from '../../../src/service';
import {once} from '../../../src/utils/function';
import {user} from '../../../src/log';

/** @private @const {string} */
export const BOOKEND_CONFIG_ATTRIBUTE_NAME = 'src';

/**
 * Service to send XHRs.
 */
export class AmpStoryRequestService {
  /**
   * @param {!Window} win
   * @param {!Element} storyElement
   */
  constructor(win, storyElement) {
    /** @private @const {!Element} */
    this.storyElement_ = storyElement;

    /** @private @const {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(win);

    /** @const @type {function():(!Promise<!JsonObject>|!Promise<null>)} */
    this.loadBookendConfig = once(() => this.loadBookendConfigImpl_());
  }

  /**
   * Retrieves the publisher bookend configuration, including the share
   * providers.
   * Has to be called through `loadBookendConfig`.
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   * @private
   */
  loadBookendConfigImpl_() {
    return this.loadJsonFromAttribute_(BOOKEND_CONFIG_ATTRIBUTE_NAME);
  }

  /**
   * @param {string} attributeName
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   * @private
   */
  loadJsonFromAttribute_(attributeName) {
    const bookendEl = childElementByTag(this.storyElement_,
        'amp-story-bookend');

    if (!bookendEl || !bookendEl.hasAttribute(attributeName)) {
      return Promise.resolve(null);
    }

    const rawUrl = bookendEl.getAttribute(attributeName);
    const opts = {};
    opts.requireAmpResponseSourceOrigin = false;

    return Services.urlReplacementsForDoc(getAmpdoc(this.storyElement_))
        .expandUrlAsync(user().assertString(rawUrl))
        .then(url => this.xhr_.fetchJson(url, opts))
        .then(response => {
          user().assert(response.ok, 'Invalid HTTP response');
          return response.json();
        });
  }
}

/**
 * Util function to retrieve the request service. Ensures we can retrieve the
 * service synchronously from the amp-story codebase without running into race
 * conditions.
 * @param  {!Window} win
 * @param  {!Element} storyEl
 * @return {!AmpStoryRequestService}
 */
export const getRequestService = (win, storyEl) => {
  let service = Services.storyRequestService(win);

  if (!service) {
    service = new AmpStoryRequestService(win, storyEl);
    registerServiceBuilder(win, 'story-request', () => service);
  }

  return service;
};
