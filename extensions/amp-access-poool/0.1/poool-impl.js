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
import {installStylesForDoc} from '../../../src/style-installer';
import {loadScript} from '../../../3p/3p';

const TAG = 'amp-access-poool';
const CONFIG = {
  debug: false,
  forceWidget: null,
  loginButtonEnabled: true,
  signatureEnabled: true,
  userIsPremium: false,
  videoClient: 'vast',
  customSegment: null,
  cookiesEnabled: false,
};

const EVENTS = [
  'lock',
  'release',
  'hidden',
  'disabled',
  'register',
  'error',
  'adblock',
  'outdatedBrowser',
  'userOutsideCohort',
  'identityAvailable',
  'subscribeClick',
  'loginClick',
  'dataPolicyClick',
];

/**
 * @typedef {{
 *   appId: string,
 *   pageType: (string),
 *   debug: (string|null),
 *   forceWidget: (string|null),
 *   loginButtonEnabled: (boolean),
 *   signatureEnabled: (boolean),
 *   userIsPremium: (boolean),
 *   videoClient: (string|null)
 *   customSegment: (string|null),
 *   cookiesEnabled: (boolean),
 * }}
 */
let PooolConfigDef;

/**
 * @implements {../../amp-access/0.1/access-vendor.AccessVendor}
 */
export class PooolVendor {
  /**
   * @param {!../../amp-access/0.1/amp-access.AccessService} accessService
   * @param {!../../amp-access/0.1/amp-access-source.AccessSource} accessSource
   */
  constructor(accessService, accessSource) {

    /** @const */
    this.ampdoc = accessService.ampdoc;

    /** @private {!../../amp-access/0.1/amp-access-source.AccessSource} */
    this.accessSource_ = accessSource;

    /** @const @private {!JsonObject} For shape see PooolConfigDef */
    this.pooolConfig_ = this.accessSource_.getAdapterConfig();

    /** @private {string} */
    this.bundleID_ = this.pooolConfig_['bundleID'] || '';

    /** @private {string} */
    this.pageType_ = this.pooolConfig_['pageType'] || '';
    installStylesForDoc(this.ampdoc, CSS, () => {}, false, TAG);
  /**
   * @return {!Promise<!JsonObject>}
   */
  authorize() {
    return {access: true};
  /**
   * Produces the Poool SDK object for the passed in callback.
   *
   * @param {!Window} global
   * @param {function(!Object)} cb
   */
  getPooolSDK_(global, cb) {
    loadScript(global, 'https://assets.poool.fr/poool.min.js', function() {
      cb(global.poool);
    });
  }

  /**
   * @return {!Promise}
   */
  pingback() {
    return Promise.resolve();
  }
}
