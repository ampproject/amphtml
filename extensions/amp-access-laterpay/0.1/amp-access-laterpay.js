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

import {accessServiceFor} from '../../../src/access-service';
import {dev, user} from '../../../src/log';
import {isExperimentOn} from '../../../src/experiments';
import {getMode} from '../../../src/mode';
import {listen} from '../../../src/event-helper';
import {removeChildren} from '../../../src/dom';
import {timerFor} from '../../../src/timer';
import {vsyncFor} from '../../../src/vsync';
import {xhrFor} from '../../../src/xhr';

const TAG = 'amp-access-laterpay';
const CONFIG_URL = 'https://connector.laterpay.net';
const CONFIG_BASE_PATH = '/api/public/amp?' +
                         'article_url=CANONICAL_URL' +
                         '&amp_reader_id=READER_ID' +
                         '&return_url=RETURN_URL';
const AUTHORIZATION_TIMEOUT = 3000;

const DEFAULT_MESSAGES = {
  decimalDelimeter: '.',
  premiumContentTitle: 'Buy only this article',
  ppuButton: 'Buy Now, Pay Later',
  sisButton: 'Buy Now',
  defaultButton: 'Buy Now',
  alreadyPurchasedLink: 'I already bought this',
};

/**
 * @typedef {{
 *   articleTitleSelector: !string,
 *   configUrl: string=,
 *   articleId: string=
 * }}
 */
let LaterpayConfig;

/**
 * @typedef {{
 *   description: !string,
 *   price: !Object<string, number>,
 *   purchase_type: !string,
 *   purchase_url: !string,
 *   title: !string,
 *   tp_title: !string,
 *   validity_unit: !string,
 *   validity_value: !number
 * }}
 */
let PurchaseOption;

/**
 * @typedef {{
 *   access: boolean,
 *   apl: string,
 *   premiumcontent: !PurchaseOption,
 *   timepasses: Array<PurchaseOption>=
 * }}
 */
let PurchaseConfig;


/**
 * @implements {AccessVendor}
 */
export class LaterpayVendor {

  /**
   * @param {!AccessService} accessService
   */
  constructor(accessService) {
    /** @private @const {!AccessService} */
    this.accessService_ = accessService;

    /** @private @const {!Window} */
    this.win_ = this.accessService_.win;

    /** @private @const {!Document} */
    this.doc_ = this.win_.document;

    /** @private @const {!LaterpayConfig} */
    this.laterpayConfig_ = this.accessService_.getAdapterConfig();

    /** @private @const {!PurchaseConfig} */
    this.purchaseConfig_ = null;

    /** @private @const {?Function} */
    this.purchaseButtonListener_ = null;

    /** @private @const {?Function} */
    this.alreadyPurchasedListener_ = null;
    /** @private @const {!Array<Event>} */
    this.purchaseOptionListeners_ = [];

    /** @private @const {!boolean} */
    this.containerEmpty_ = true;

    /** @private @const {?Node} */
    this.selectedPurchaseOption_ = null;

    /** @private @const {?Node} */
    this.purchaseButton_ = null;

    const configUrl = (getMode().development && this.laterpayConfig_.configUrl)
                    ? this.laterpayConfig_.configUrl
                    : CONFIG_URL;
    /** @private {string} */
    this.currentLocale_ = this.laterpayConfig_.locale || 'en';

    /** @private {Object} */
    this.i18n_ = Object.assign(DEFAULT_MESSAGES,
                  this.laterpayConfig_.localeMessages || {});

    /** @private {string} */
    this.purchaseConfigBaseUrl_ = configUrl + CONFIG_BASE_PATH;
    const articleId = this.laterpayConfig_.articleId;
    if (articleId) {
      this.purchaseConfigBaseUrl_ += '&article_id=' + articleId;
    }

    /** @const @private {!Timer} */
    this.timer_ = timerFor(this.win_);

    /** @private @const {!Vsync} */
    this.vsync_ = vsyncFor(this.win_);

    /** @private @const {!Xhr} */
    this.xhr_ = xhrFor(this.win_);
  }

  /**
   * @return {!Promise<!JSONType>}
   */
  authorize() {
    user().assert(isExperimentOn(this.win_, TAG),
        'Enable "amp-access-laterpay" experiment');
    return this.getPurchaseConfig_()
    .then(response => {
      if (response.status === 204) {
        throw user()
          .createError('No merchant domains have been matched for this ' +
            'article, or no paid content configurations are setup.');
      }
      this.emptyContainer_();
      return {access: response.access};
    }, err => {
      const status = err && err.response && err.response.status;
      if (status === 402) {
        this.purchaseConfig_ = err.responseJson;
        // empty before rendering, in case authorization is being called again
        // with the same state
        this.emptyContainer_()
          .then(this.renderPurchaseOverlay_.bind(this));
      } else {
        throw err;
      }
      return {access: err.responseJson.access};
    });
  }

  /**
   * @return {!Promise<Object>}
   * @private
   */
  getPurchaseConfig_() {
    const url = this.purchaseConfigBaseUrl_ +
                '&article_title=' + this.getArticleTitle_();
    const urlPromise = this.accessService_.buildUrl_(
      url, /* useAuthData */ false);
    return urlPromise.then(url => {
      dev().fine(TAG, 'Authorization URL: ', url);
      return this.timer_.timeoutPromise(
          AUTHORIZATION_TIMEOUT,
          this.xhr_.fetchJson(url, {
            credentials: 'include',
            requireAmpResponseSourceOrigin: true,
          }));
    });
  }

  /**
   * @return {!string}
   * @private
   */
  getArticleTitle_() {
    const title = this.doc_.querySelector(
      this.laterpayConfig_.articleTitleSelector);
    dev().assert(
      title, 'No article title element found with selector %s',
      this.laterpayConfig_.articleTitleSelector);
    return title.textContent.trim();
  }

  /**
   * @return {!Node}
   * @private
   */
  getContainer_() {
    return this.doc_.getElementById(TAG + '-dialog');
  }

  /**
   * @private
   * @returns Promise
   */
  emptyContainer_() {
    // no need to do all of this if the container is already empty
    if (this.containerEmpty_) {
      return Promise.resolve();
    }
    let unlistener;
    while (unlistener = this.purchaseOptionListeners_.shift()) {
      unlistener();
    }
    if (this.purchaseButtonListener_) {
      this.purchaseButtonListener_();
    }
    if (this.alreadyPurchasedListener_) {
      this.alreadyPurchasedListener_();
    }
    return this.vsync_.mutatePromise(() => {
      this.containerEmpty_ = true;
      removeChildren(this.getContainer_());
    });
  }

  /**
   * @private
   */
  renderPurchaseOverlay_() {
    const laterpayList = this.getContainer_();
    const listContainer = this.doc_.createElement('ul');
    this.purchaseConfig_.premiumcontent['tp_title'] =
      this.i18n_.premiumContentTitle;
    this.purchaseConfig_.premiumcontent.description = this.getArticleTitle_();
    listContainer.appendChild(
      this.createPurchaseOption_(
        this.purchaseConfig_.premiumcontent, this.i18n_.ppuButton)
    );
    this.purchaseConfig_.timepasses.forEach(timepass => {
      listContainer.appendChild(
        this.createPurchaseOption_(timepass, this.i18n_.sisButton)
      );
    });
    const purchaseButton = this.doc_.createElement('button');
    purchaseButton.className = TAG + '-purchase-button';
    purchaseButton.textContent = this.i18n_.defaultButton;
    purchaseButton.disabled = true;
    this.purchaseButton_ = purchaseButton;
    this.purchaseButtonListener_ = listen(purchaseButton, 'click', ev => {
      this.handlePurchase_(ev, this.selectedPurchaseOption_.value);
    });
    laterpayList.appendChild(listContainer);
    laterpayList.appendChild(purchaseButton);
    laterpayList.appendChild(
      this.createAlreadyPurchasedLink_(this.purchaseConfig_.apl));
    this.containerEmpty_ = false;
  }

  /**
   * @param {!PurchaseOption} option
   * @param {!string} purchaseActionLabel
   * @return {!Node}
   * @private
   */
  createPurchaseOption_(option, purchaseActionLabel) {
    const li = this.doc_.createElement('li');
    const control = this.doc_.createElement('label');
    control.for = option.tp_title;
    control.appendChild(this.createRadioControl_(option, purchaseActionLabel));
    const metadataContainer = this.doc_.createElement('div');
    metadataContainer.className = TAG + '-metadata';
    const title = this.doc_.createElement('span');
    title.className = TAG + '-title';
    title.textContent = option.tp_title;
    metadataContainer.appendChild(title);
    const description = this.doc_.createElement('p');
    description.className = TAG + '-description';
    description.textContent = option.description;
    metadataContainer.appendChild(description);
    control.appendChild(metadataContainer);
    li.appendChild(control);
    li.appendChild(this.createPrice_(option.price));
    return li;
  }

  /**
   * @param {!PurchaseOption} option
   * @param {!string} purchaseActionLabel
   * @return {!Node}
   * @private
   */
  createRadioControl_(option, purchaseActionLabel) {
    const radio = this.doc_.createElement('input');
    radio.name = 'purchaseOption';
    radio.type = 'radio';
    radio.id = option.tp_title;
    radio.value = option.purchase_url;
    radio.setAttribute('data-purchase-action-label', purchaseActionLabel);
    this.purchaseOptionListeners_.push(listen(
      radio, 'change', this.handlePurchaseOptionSelection_.bind(this)
    ));
    return radio;
  }

  /**
   * @param {!Object<string, number>} price
   * @return {!Node}
   * @private
   */
  createPrice_(price) {
    const currency = Object.keys(price)[0];
    const formattedPrice = this.formatPrice_(price[currency]);
    const valueEl = this.doc_.createElement('span');
    valueEl.className = TAG + '-price';
    valueEl.textContent = formattedPrice;
    const currencyEl = this.doc_.createElement('sup');
    currencyEl.className = TAG + '-currency';
    currencyEl.textContent = currency;
    const priceEl = this.doc_.createElement('p');
    priceEl.className = TAG + '-price-container';
    priceEl.appendChild(valueEl);
    priceEl.appendChild(currencyEl);
    return priceEl;
  }

  /**
   * @param {!number} priceValue
   * @return {!string}
   * @private
   */
  formatPrice_(priceValue) {
    const value = (priceValue / 100);
    const props = {
      style: 'decimal',
      minimumFractionDigits: 0,
    };
    return value.toLocaleString(this.currentLocale_, props);
  }

  /**
   * @param {!string} href
   * @returns {!Node}
  */
  createAlreadyPurchasedLink_(href) {
    const p = this.doc_.createElement('p');
    p.className = TAG + '-already-purchased-container';
    const a = this.doc_.createElement('a');
    a.href = href;
    a.textContent = this.i18n_.alreadyPurchasedLink;
    this.alreadyPurchasedListener_ = listen(a, 'click', ev => {
      this.handlePurchase_(ev, href);
    });
    p.appendChild(a);
    return p;
  }

  /**
   * @param {!Event} ev
   * @private
   */
  handlePurchaseOptionSelection_(ev) {
    ev.preventDefault();
    const selectedOptionClassname = TAG + '-selected';
    const prevPurchaseOption = this.selectedPurchaseOption_;
    const purchaseActionLabel = ev.target.dataset.purchaseActionLabel;
    if (prevPurchaseOption &&
        prevPurchaseOption.classList.contains(selectedOptionClassname)) {
      prevPurchaseOption.classList.remove(selectedOptionClassname);
    }
    this.selectedPurchaseOption_ = ev.target;
    this.selectedPurchaseOption_.classList.add(selectedOptionClassname);
    if (this.purchaseButton_.disabled) {
      this.purchaseButton_.disabled = false;
    }
    this.purchaseButton_.textContent = purchaseActionLabel;
  }

  /**
   * @param {!Event} ev
   * @private
   */
  handlePurchase_(ev, purchaseUrl) {
    ev.preventDefault();
    const configuredUrl = purchaseUrl +
                '?return_url=RETURN_URL' +
                '&article_url=SOURCE_URL' +
                '&amp_reader_id=READER_ID';
    const urlPromise = this.accessService_.buildUrl_(
      configuredUrl, /* useAuthData */ false);
    return urlPromise.then(url => {
      dev().fine(TAG, 'Authorization URL: ', url);
      this.accessService_.loginWithUrl(url);
    });
  }
}


// Register the vendor within the access service.
accessServiceFor(AMP.win).then(accessService => {
  accessService.registerVendor('laterpay', new LaterpayVendor(accessService));
});
