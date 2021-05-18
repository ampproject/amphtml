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
import {getChildJsonConfig} from '../../../src/json';
import {isProtocolValid} from '../../../src/url';
import {once} from '../../../src/core/types/function';
import {registerServiceBuilder} from '../../../src/service';
import {user, userAssert} from '../../../src/log';

/** @private @const {string} */
export const CONFIG_SRC_ATTRIBUTE_NAME = 'src';

/** @private const {string} */
export const CREDENTIALS_ATTRIBUTE_NAME = 'data-credentials';

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
    this.loadShareConfig = once(() => this.loadShareConfigImpl_());
  }

  /**
   * @param {string} rawUrl
   * @param {Object=} opts
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   */
  executeRequest(rawUrl, opts = {}) {
    if (!isProtocolValid(rawUrl)) {
      user().error(TAG, 'Invalid config url.');
      return Promise.resolve(null);
    }

    return Services.urlReplacementsForDoc(this.storyElement_)
      .expandUrlAsync(user().assertString(rawUrl))
      .then((url) => this.xhr_.fetchJson(url, opts))
      .then((response) => {
        userAssert(response.ok, 'Invalid HTTP response');
        return response.json();
      });
  }

  /**
   * Retrieves the publisher share providers.
   * Has to be called through `loadShareConfig`.
   * @return {(!Promise<!JsonObject>|!Promise<null>)}
   */
  loadShareConfigImpl_() {
    const shareConfigEl = this.storyElement_.querySelector(
      'amp-story-social-share, amp-story-bookend'
    );
    if (!shareConfigEl) {
      return Promise.resolve();
    }

    if (shareConfigEl.hasAttribute(CONFIG_SRC_ATTRIBUTE_NAME)) {
      const rawUrl = shareConfigEl.getAttribute(CONFIG_SRC_ATTRIBUTE_NAME);
      const credentials = shareConfigEl.getAttribute(
        CREDENTIALS_ATTRIBUTE_NAME
      );
      return this.executeRequest(rawUrl, credentials ? {credentials} : {});
    }

    // Fallback. Check for an inline json config.
    let config = null;
    try {
      config = getChildJsonConfig(shareConfigEl);
    } catch (err) {}

    return Promise.resolve(config);
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
    registerServiceBuilder(win, 'story-request', function () {
      return service;
    });
  }

  return service;
};
