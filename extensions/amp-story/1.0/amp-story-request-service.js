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
import {getChildJsonConfig} from '../../../src/json';
import {isProtocolValid} from '../../../src/url';
import {once} from '../../../src/utils/function';
import {registerServiceBuilder} from '../../../src/service';
import {user, userAssert} from '../../../src/log';

/** @private @const {string} */
export const BOOKEND_CONFIG_ATTRIBUTE_NAME = 'src';

/** @private const {string} */
export const BOOKEND_CREDENTIALS_ATTRIBUTE_NAME = 'data-credentials';

/** @private @const {string} */
const TAG = 'amp-story-request-service';

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
    const bookendEl = childElementByTag(
      this.storyElement_,
      'amp-story-bookend'
    );
    if (!bookendEl) {
      return Promise.resolve(null);
    }

    if (bookendEl.hasAttribute(BOOKEND_CONFIG_ATTRIBUTE_NAME)) {
      const rawUrl = bookendEl.getAttribute(BOOKEND_CONFIG_ATTRIBUTE_NAME);
      const credentials = bookendEl.getAttribute(
        BOOKEND_CREDENTIALS_ATTRIBUTE_NAME
      );
      return this.loadJsonFromAttribute_(rawUrl, credentials);
    }

    // Fallback. Check for an inline json config.
    let config = null;
    try {
      config = getChildJsonConfig(bookendEl);
    } catch (err) {}

    return Promise.resolve(config);
  }

  /**
   * @param {string} rawUrl
   * @param {string|null} credentials
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   * @private
   */
  loadJsonFromAttribute_(rawUrl, credentials) {
    const opts = {};

    if (!isProtocolValid(rawUrl)) {
      user().error(TAG, 'Invalid config url.');
      return Promise.resolve(null);
    }

    if (credentials) {
      opts.credentials = credentials;
    }

    return Services.urlReplacementsForDoc(this.storyElement_)
      .expandUrlAsync(user().assertString(rawUrl))
      .then(url => this.xhr_.fetchJson(url, opts))
      .then(response => {
        userAssert(response.ok, 'Invalid HTTP response');
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
