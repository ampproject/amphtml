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

import {dict} from '../../../src/utils/object';
import {isArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {user} from '../../../src/log';


/** @const */
const TAG = 'amp-access-signin';


/**
 * This class represents the sign-in protocol, by means of which the source
 * origin can take advantage of the identity system of the viewer.
 *
 * This kind of exchange strictly requires three-way opt-in: the user, the
 * viewer and the source origin must all explicitly opt-in into this system.
 * The source origin opts in by setting sign-in parameters in amp-access
 * configuration. The viewer opts in by supplying `#signin=1` viewer parameter
 * and user opt-in must be ensured by the viewer.
 *
 * There are two sub-protocols: access token and request sign-in.
 *
 * Access token is configured via `acceptAccessToken: true` configuration
 * option. If the viewer can be asked for the access token in this case via
 * `getAccessTokenPassive` message. Most likely, the viewer has exchanged
 * the access token with the source origin using OAuth2 mechanism or similar.
 * No special security measures are applied in AMP Runtime since the token is
 * expected to be encrypted or signed by the source origin.
 *
 * Login dialog may return an authorization code via `#code=` in the hash
 * response. When `acceptAccessToken: true` is specified, the viewer may be
 * asked to exchange this authorization code for an access token using the
 * `storeAccessToken` message.
 *
 * Request sign-in is configured via `signinServices: []` configuration option.
 * E.g. `signinServices: ["https://accounts.google.com"]`. By using this option,
 * the source origin states that it's ready to accept ID tokens produced by
 * this authority. The viewer may be asked to implement sign-in with ID token
 * via the `requestSignIn` message. The viewer must ensure the user's consent
 * before sending any tokens to the source origin.
 */
export class SignInProtocol {

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!../../../src/service/viewer-impl.Viewer} viewer
   * @param {string} pubOrigin
   * @param {!JsonObject} configJson
   */
  constructor(ampdoc, viewer, pubOrigin, configJson) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewer;

    /** @private @const {string} */
    this.pubOrigin_ = pubOrigin;

    /** @private @const {boolean} */
    this.isEnabled_ =
        isExperimentOn(ampdoc.win, TAG) &&
        this.viewer_.isEmbedded() &&
        this.viewer_.getParam('signin') == '1';

    let acceptAccessToken;
    let supportsSignInService;
    if (this.isEnabled_) {

      acceptAccessToken = !!configJson['acceptAccessToken'];

      const viewerSignInService = this.viewer_.getParam('signinService');
      const configSignInServices = configJson['signinServices'];
      if (configSignInServices) {
        user().assert(isArray(configSignInServices),
            '"signinServices" must be an array');
      }

      supportsSignInService = configSignInServices &&
          configSignInServices.indexOf(viewerSignInService) != -1;
    } else {
      acceptAccessToken = false;
      supportsSignInService = false;
    }

    /** @private @const {boolean} */
    this.acceptAccessToken_ = acceptAccessToken;
    /** @private @const {boolean} */
    this.supportsSignInService_ = supportsSignInService;
    /** @private {?Promise<?string>} */
    this.accessTokenPromise_ = null;
  }

  /**
   * Whether this protocol has been enabled by the viewer.
   * @return {boolean}
   */
  isEnabled() {
    return this.isEnabled_;
  }

  /**
   * Starts up the sign-in protocol by passively pre-fetching the access token.
   */
  start() {
    this.getAccessTokenPassive();
  }

  /**
   * Return the promise that will possibly yield the access token from the
   * viewer.
   *
   * If viewer has not opted-in into signin protocol, this method returns
   * `null`. If source origin has not opted-in into signin protocol via
   * `acceptAccessToken: true` configration option, this method returns `null`.
   *
   * If an access token is not found or cannot be retrieved, this method
   * returns a promise that will resolve `null`.
   *
   * @return {?Promise<?string>}
   */
  getAccessTokenPassive() {
    if (!this.acceptAccessToken_) {
      return null;
    }
    if (!this.accessTokenPromise_) {
      this.accessTokenPromise_ = this.viewer_.sendMessageAwaitResponse(
          'getAccessTokenPassive', dict({
            'origin': this.pubOrigin_,
          })).then(resp => {
        return /** @type {?string} */ (resp);
      }).catch(reason => {
        user().error(TAG, 'Failed to retrieve access token: ', reason);
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
   * Processes login dialog's result. And if `#code=` hash parameter
   * is specified, will send this authorization code to the viewer to exchange
   * for the access token. This method returns promise that will resolve the
   * exchanged access token.
   *
   * If viewer has not opted-in into signin protocol, this method returns
   * `null`. If source origin has not opted-in into signin protocol via
   * `acceptAccessToken: true` configration option and by returning
   * `#code=` response from the login dialog, this method returns
   * `null`.
   *
   * The viewer is allowed to store the access token, but only when the user
   * explicitly consents to it.
   *
   * @param {!Object<string, string>} query
   * @return {?Promise<?string>}
   */
  postLoginResult(query) {
    if (!this.acceptAccessToken_) {
      return null;
    }
    const authorizationCode = query['code'];
    if (!authorizationCode) {
      return null;
    }
    return this.viewer_.sendMessageAwaitResponse('storeAccessToken', dict({
      'origin': this.pubOrigin_,
      'authorizationCode': authorizationCode,
    })).then(resp => {
      const accessToken = /** @type {?string} */ (resp);
      this.updateAccessToken_(accessToken);
      return accessToken;
    }).catch(reason => {
      user().error(TAG, 'Failed to retrieve access token: ', reason);
      return null;
    });
  }

  /**
   * Requests the viewer to perform login on behalf of the source origin
   * with the optional ID token. The result is the promise that will resolve
   * with the dialog's response.
   *
   * If viewer has not opted-in into signin protocol, this method returns
   * `null`. If source origin has not opted-in into signin protocol via
   * `signinServices: []` configration option that includes this viewer's
   * service, this method returns `null`.
   *
   * The viewer is only allowed to propagate ID token to the login dialog
   * when the user explicitly consents to it.
   *
   * @param {string} url
   * @return {?Promise<?string>}
   */
  requestSignIn(url) {
    if (!this.supportsSignInService_) {
      return null;
    }
    return this.viewer_.sendMessageAwaitResponse('requestSignIn', dict({
      'origin': this.pubOrigin_,
      'url': url,
    })).then(resp => {
      const accessToken = /** @type {?string} */ (resp);
      this.updateAccessToken_(accessToken);
      // Return empty dialog result.
      return '';
    });
  }
}
