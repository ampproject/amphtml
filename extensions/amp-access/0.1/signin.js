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

import {isArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {user} from '../../../src/log';


/** @const */
const TAG = 'amp-access-signin';


/**
 */
export class SignInProtocol {

  /**
   * @param {!Window} win
   * @param {!Viewer} viewer
   * @param {string} pubOrigin
   * @param {!JSONObject} configJson
   */
  constructor(win, viewer, pubOrigin, configJson) {

    /** @const {!Window} */
    this.win = win;

    /** @private @const {!Viewer} */
    this.viewer_ = viewer;

    /** @private @const {string} */
    this.pubOrigin_ = pubOrigin;

    /** @private @const {boolean} */
    this.isEnabled_ =
        isExperimentOn(this.win, TAG) &&
        this.viewer_.isEmbedded() &&
        this.viewer_.getParam('signin') == '1';

    if (this.isEnabled_) {

      /** @private @const {boolean} */
      this.acceptAccessToken_ = !!configJson['acceptAccessToken'];

      const viewerSignInService = this.viewer_.getParam('signinService');
      const configSignInServices = configJson['signinServices'];
      if (configSignInServices) {
        user.assert(isArray(configSignInServices),
            '"signinServices" must be an array');
      }

      /** @private @const {boolean} */
      this.supportsSignInService_ = configSignInServices &&
          configSignInServices.indexOf(viewerSignInService) != -1;

      /** @private {!Promise<?string>} */
      this.accessTokenPromise_ = null;
    }
  }

  /**
   * @return {boolean}
   */
  isEnabled() {
    return this.isEnabled_;
  }

  /**
   */
  start() {
    this.getAccessTokenPassive();
  }

  /**
   * @return {?Promise<?string>}
   */
  getAccessTokenPassive() {
    if (!this.acceptAccessToken_) {
      return null;
    }
    if (!this.accessTokenPromise_) {
      this.accessTokenPromise_ = this.viewer_.sendMessage(
          'getAccessTokenPassive', {
            origin: this.pubOrigin_,
          }).then(resp => {
            return /** @type {?string} */ (resp.accessToken);
          }).catch(reason => {
            user.error(TAG, 'Failed to retrieve access token: ', reason);
            return null;
          });
    }
    return this.accessTokenPromise_;
  }

  /**
   * @param {?string} accessToken
   * @private
   */
  updateAccessToken_(accessToken) {
    this.accessTokenPromise_ = Promise.resolve(accessToken);
  }

  /**
   * @param {!Object<string, string>} query
   * @return {?Promise<?string>}
   */
  postLoginResult(query) {
    if (!this.acceptAccessToken_) {
      return null;
    }
    const grant = query['access_grant'];
    if (!grant) {
      return null;
    }
    return this.viewer_.sendMessage('storeAccessToken', {
      origin: this.pubOrigin_,
      accessGrant: grant,
    }).then(resp => {
      const accessToken = resp.accessToken;
      this.updateAccessToken_(accessToken);
      return accessToken;
    }).catch(reason => {
      user.error(TAG, 'Failed to retrieve access token: ', reason);
      return null;
    });
  }

  /**
   * @param {string} url
   * @return {?Promise<?string>}
   */
  requestSignIn(url) {
    if (!this.supportsSignInService_) {
      return null;
    }
    return this.viewer_.sendMessage('requestSignIn', {
      origin: this.pubOrigin_,
      url,
    }).then(resp => {
      const accessToken = resp.accessToken;
      this.updateAccessToken_(accessToken);
      // Return empty dialog result.
      return '';
    });
  }
}
