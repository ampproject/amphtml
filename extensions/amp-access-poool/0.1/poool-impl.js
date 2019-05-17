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
import {addParamToUrl, addParamsToUrl} from '../../../src/url';
import {dev, userAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {listenFor} from '../../../src/iframe-helper';
import {resetStyles, setStyle, setStyles} from '../../../src/style';

const TAG = 'amp-access-poool';

const ACCESS_CONFIG = {
  'authorization': 'https://api.poool.fr/api/v2/amp/access?rid=READER_ID',
  'iframe':
    'https://assets.poool.fr/amp.html' +
    '?rid=READER_ID' +
    '&c=CANONICAL_URL' +
    '&o=AMPDOC_URL' +
    '&r=DOCUMENT_REFERRER',
};

const AUTHORIZATION_TIMEOUT = 3000;

/**
 * @typedef {{
 *   appId: string,
 *   pageType: (string),
 *   debug: (boolean|null),
 *   forceWidget: (string|null),
 *   loginButtonEnabled: (boolean),
 *   videoClient: (string|null),
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

    /** @private {string} */
    this.iframeUrl_ = ACCESS_CONFIG['iframe'];

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.ampdoc.win);

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.ampdoc.win);

    /** @const @private {!JsonObject} For shape see PooolConfigDef */
    this.pooolConfig_ = this.accessSource_.getAdapterConfig();

    /** @private {string} */
    this.bundleID_ = this.pooolConfig_['bundleID'] || '';

    /** @protected {string} */
    this.readerID_ = '';

    /** @private {string} */
    this.itemID_ = this.pooolConfig_['itemID'] || '';

    /** @const {!Element} */
    this.iframe_ = document.createElement('iframe');

    this.initializeIframe_();

    this.checkMandatoryParams_();
  }

  /**
   * @return {!Promise<!JsonObject>}
   */
  authorize() {
    return this.getPooolAccess_().then(
      response => {
        return {access: response.access};
      },
      err => {
        if (!err || !err.response) {
          throw err;
        }
        const {response} = err;
        if (response.status !== 402) {
          throw err;
        }
        this.renderPoool_();
        return {access: false};
      }
    );
  }

  /**
   * @private
   */
  initializeIframe_() {
    this.iframe_.setAttribute('id', 'poool-iframe');
    this.iframe_.setAttribute('scrolling', 'no');
    this.iframe_.setAttribute('frameborder', '0');
    setStyle(this.iframe_, 'width', '100%');

    if (this.pooolConfig_['forceWidget'] == 'unlock') {
      setStyles(this.iframe_, {
        'height': '250px',
        'position': 'fixed',
        'bottom': '0',
      });
    } else {
      setStyles(this.iframe_, {
        'height': '500px',
        'transform': 'translateY(-70px)',
      });
    }
  }

  /**
   * @private
   */
  checkMandatoryParams_() {
    userAssert(this.bundleID_, 'BundleID is incorrect or not provided.');
    userAssert(this.itemID_, 'ItemID is not provided.');
  }

  /**
   * @return {!Promise<Object>}
   * @private
   */
  getPooolAccess_() {
    const url = addParamToUrl(this.accessUrl_, 'iid', this.itemID_);
    const urlPromise = this.accessSource_.buildUrl(url, false);
    return urlPromise
      .then(url => {
        return this.accessSource_.getLoginUrl(url);
      })
      .then(url => {
        dev().info(TAG, 'Authorization URL: ', url);
        return this.timer_
          .timeoutPromise(AUTHORIZATION_TIMEOUT, this.xhr_.fetchJson(url))
          .then(res => res.json());
      });
  }

  /**
   * @private
   */
  renderPoool_() {
    const pooolContainer = document.getElementById('poool');
    const urlPromise = this.accessSource_.buildUrl(
      addParamsToUrl(
        this.iframeUrl_,
        dict({
          'bi': this.pooolConfig_['bundleID'],
          'iid': this.pooolConfig_['itemID'],
          'ce': this.pooolConfig_['cookiesEnabled'],
          'd':
            typeof this.pooolConfig_['debug'] !== 'undefined' &&
            this.pooolConfig_['debug'] !== null
              ? this.pooolConfig_['debug']
              : getMode().development || getMode().localDev,
          'fw': this.pooolConfig_['forceWidget'],
          'cs': this.pooolConfig_['customSegment'],
        })
      ),
      false
    );

    return urlPromise.then(url => {
      this.iframe_.src = url;
      listenFor(this.iframe_, 'release', this.onRelease_.bind(this));
      listenFor(this.iframe_, 'resize', this.onResize_.bind(this));
      pooolContainer.appendChild(this.iframe_);
    });
  }

  /**
   * @private
   */
  onRelease_() {
    const articlePreview = document.querySelector('[poool-access-preview]');
    articlePreview.setAttribute('amp-access-hide', '');
    const articleContent = document.querySelector('[poool-access-content]');
    articleContent.removeAttribute('amp-access-hide');
    resetStyles(this.iframe_, ['transform']);
  }

  /**
   * @private
   * @param {!Object} msg
   */
  onResize_(msg) {
    setStyle(this.iframe_, 'height', msg.height);
  }

  /**
   * @return {!Promise}
   */
  pingback() {
    return Promise.resolve();
  }
}
