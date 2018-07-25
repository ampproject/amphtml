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
import {CSS} from '../../../build/amp-access-poool-0.1.css';
import {Services} from '../../../src/services';
import {camelCaseToDash, dashToUnderline} from '../../../src/string';
import {dev, user} from '../../../src/log';
import {installStylesForDoc} from '../../../src/style-installer';
import {loadScript} from '../../../3p/3p';

const TAG = 'amp-access-poool';

const ACCESS_CONFIG = {
  'authorization':
    'http://localhost:8001/api/v2/amp/access?rid=READER_ID',
};

const AUTHORIZATION_TIMEOUT = 3000;

const CONFIG = {
  debug: false,
  mode: 'custom',
  forceWidget: null,
  loginButtonEnabled: true,
  signatureEnabled: true,
  videoClient: 'vast',
  customSegment: null,
  cookiesEnabled: false,
};

/**
 * @typedef {{
 *   appId: string,
 *   pageType: (string),
 *   debug: (string|null),
 *   forceWidget: (string|null),
 *   loginButtonEnabled: (boolean),
 *   signatureEnabled: (boolean),
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

    /** @private {string} */
    this.accessUrl_ = ACCESS_CONFIG['authorization'];

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.ampdoc.win);

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.ampdoc.win);

    /** @const @private {!JsonObject} For shape see PooolConfigDef */
    this.pooolConfig_ = this.accessSource_.getAdapterConfig();

    /** @private {string} */
    this.bundleID_ = this.pooolConfig_['bundleID'] || '';

    /** @private {string} */
    this.pageType_ = this.pooolConfig_['pageType'] || '';

    /** @protected {string} */
    this.readerID_ = '';

    /** @private {string} */
    this.itemID_ = this.pooolConfig_['itemID'] || '';

    installStylesForDoc(this.ampdoc, CSS, () => {}, false, TAG);

    this.checkMandatoryParams_();
  }

  /**
   * @return {!Promise<!JsonObject>}
   */
  authorize() {
    return this.getPooolAccess_()
        .then(response => {
          return {access: response.access};
        }, err => {
          if (!err || !err.response) {
            throw err;
          }
          const {response} = err;
          if (response.status !== 402) {
            throw err;
          }
          this.renderPoool_();
          return {access: false};
        });
  }

  /**
   * @private
   */
  checkMandatoryParams_() {
    user().assert(this.bundleID_, 'BundleID is incorrect or not provided.');
    user().assert(this.pageType_, 'Page type is incorrect or not provided.');
    user().assert(this.itemID_, 'ItemID is not provided.');
  }

  /**
   * @return {!Promise<Object>}
   * @private
   */
  getPooolAccess_() {
    const url = this.accessUrl_ + '&iid=' + this.itemID_;
    const urlPromise = this.accessSource_.buildUrl(url, false);
    return urlPromise.then(url => {
      return this.accessSource_.getLoginUrl(url);
    }).then(url => {
      dev().info(TAG, 'Authorization URL: ', url);
      return this.timer_.timeoutPromise(
          AUTHORIZATION_TIMEOUT,
          this.xhr_.fetchJson(url)).then(res => res.json());
    });
  }

  /**
   * @private
   */
  renderPoool_() {
    this.getPooolSDK_(global, _poool => {

      // Init poool
      _poool('init', this.bundleID_);

      // Get AMP reader id and assign it to poool config
      this.accessSource_.getReaderId_().then(rid => {
        this.readerID_ = rid;

        // Set poool amp basic config
        _poool(
            'config',
            {
              mode: 'custom',
              'amp_reader_id': this.readerID_,
              'amp_item_id': this.itemID_,
            },
            true
        );
      });


      // Set config
      Object.entries(CONFIG).forEach(configEntry => {

        const configKey = configEntry[0],
            configDefaultValue = configEntry[1];

        let configValue = this.pooolConfig_[configKey] || configDefaultValue;

        if (configValue) {
          if (typeof configDefaultValue === 'boolean') {
            configValue = `${configValue}` === 'true';
          }

          _poool('config', dashToUnderline(camelCaseToDash(configKey)),
              configValue);
        }
      });

      // Unlock content after onRelease event
      _poool('event', 'onrelease', this.giveAccessOnPooolRelease_.bind(this));

      // Create hit
      _poool('send', 'page-view', this.pageType_);

    });
  }

  /**
   * @private
   */
  giveAccessOnPooolRelease_() {
    const articleBody = document.getElementsByClassName('article-body')[0];
    articleBody.setAttribute('amp-access-poool', '');
  }

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
