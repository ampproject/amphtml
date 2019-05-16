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

import {assertHttpsUrl, parseQueryString} from '../../../src/url';
import {dev, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {openLoginDialog} from '../../amp-access/0.1/login-dialog';

const TAG = 'amp-subscriptions';
const LOCAL = 'local';

/**
 */
export class Actions {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!./url-builder.UrlBuilder} urlBuilder
   * @param {!./analytics.SubscriptionAnalytics} analytics
   * @param {!Object<string, string>} actionMap
   */
  constructor(ampdoc, urlBuilder, analytics, actionMap) {
    // Check that all URLs are valid.
    for (const k in actionMap) {
      assertHttpsUrl(actionMap[k], `action ${k}`);
    }

    /** @private @const {!Object<string, string>} */
    this.actionsConfig_ = actionMap;
    /** @private @const {!Object<string, string>} */
    this.builtActionUrlMap_ = dict();
    /** @private @const {!./url-builder.UrlBuilder} */
    this.urlBuilder_ = urlBuilder;
    /** @private @const {!./analytics.SubscriptionAnalytics} */
    this.analytics_ = analytics;
    /** @private {?Promise} */
    this.actionPromise_ = null;
    /** @private {number} */
    this.actionStartTime_ = 0;
    /** @private @const {function(string):Promise<string>} */
    this.openPopup_ = openLoginDialog.bind(null, ampdoc);

    // Build all URLs.
    this.build();
  }

  /**
   * @return {?Promise<!Object<string, string>>}
   */
  build() {
    if (Object.keys(this.actionsConfig_).length == 0) {
      return null;
    }
    const promises = [];
    for (const k in this.actionsConfig_) {
      promises.push(
        this.urlBuilder_
          .buildUrl(this.actionsConfig_[k], /* useAuthData */ true)
          .then(url => {
            this.builtActionUrlMap_[k] = url;
          })
      );
    }
    return Promise.all(promises).then(() => {
      return this.builtActionUrlMap_;
    });
  }

  /**
   * @param {string} action
   * @return {!Promise<string>}
   */
  execute(action) {
    userAssert(
      this.actionsConfig_[action],
      'Action URL is not configured: %s',
      action
    );
    // URL should always be available at this time.
    const url = userAssert(
      this.builtActionUrlMap_[action],
      'Action URL is not ready: %s',
      action
    );
    return this.execute_(url, action);
  }

  /**
   * @param {string} url
   * @param {string} action
   * @return {!Promise}
   * @private
   */
  execute_(url, action) {
    const now = Date.now();

    // If action is pending, block a new one from starting for 1 second. After
    // 1 second, however, the new action request will be allowed to proceed,
    // given that we cannot always determine fully if the previous attempt is
    // "stuck".
    if (this.actionPromise_ && now - this.actionStartTime_ < 1000) {
      return this.actionPromise_;
    }

    dev().fine(TAG, 'Start action: ', url, action);

    this.analytics_.actionEvent(LOCAL, action, 'started');
    const dialogPromise = this.openPopup_(url);
    const actionPromise = dialogPromise
      .then(result => {
        dev().fine(TAG, 'Action completed: ', action, result);
        this.actionPromise_ = null;
        const query = parseQueryString(result);
        const s = query['success'];
        const success = s == 'true' || s == 'yes' || s == '1';
        if (success) {
          this.analytics_.actionEvent(LOCAL, action, 'success');
        } else {
          this.analytics_.actionEvent(LOCAL, action, 'rejected');
        }
        return success || !s;
      })
      .catch(reason => {
        dev().fine(TAG, 'Action failed: ', action, reason);
        this.analytics_.actionEvent(LOCAL, action, 'failed');
        if (this.actionPromise_ == actionPromise) {
          this.actionPromise_ = null;
        }
        throw reason;
      });
    this.actionPromise_ = actionPromise;
    this.actionStartTime_ = now;
    return this.actionPromise_;
  }
}
