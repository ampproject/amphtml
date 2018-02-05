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

import {CSS} from '../../../build/amp-access-laterpay-0.1.css';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getMode} from '../../../src/mode';
import {installStylesForDoc} from '../../../src/style-installer';
import {listen} from '../../../src/event-helper';
import {removeChildren} from '../../../src/dom';

const TAG = 'amp-access-laterpay';

const CONFIG_URLS = {
  live: {
    eu: 'https://connector.laterpay.net',
    us: 'https://connector.uselaterpay.com',
  },
  sandbox: {
    eu: 'https://connector.sandbox.laterpaytest.net',
    us: 'https://connector.sandbox.uselaterpaytest.com',
  },
};

const DEFAULT_REGION = 'eu';

const CONFIG_BASE_PATH = '/api/public/amp?' +
                         'article_url=CANONICAL_URL' +
                         '&amp_reader_id=READER_ID' +
                         '&return_url=RETURN_URL';
const AUTHORIZATION_TIMEOUT = 3000;

const DEFAULT_MESSAGES = {
  premiumContentTitle: 'Buy only this article',
  payLaterButton: 'Buy Now, Pay Later',
  payNowButton: 'Buy Now',
  defaultButton: 'Buy Now',
  alreadyPurchasedLink: 'I already bought this',
  sandbox: 'Site in test mode. No payment required.',
};

/**
 * @typedef {{
 *   articleTitleSelector: string,
 *   configUrl: (string|undefined),
 *   articleId: (string|undefined),
 *   scrollToTopAfterAuth: (boolean|undefined),
 *   locale: (string|undefined),
 *   localeMessages: (Object|undefined),
 *   region: (string|undefined),
 *   sandbox: (boolean|undefined),
 * }}
 */
let LaterpayConfigDef;

/**
 * @typedef {{
 *   description: string,
 *   price: !Object<string, number>,
 *   purchase_type: string,
 *   purchase_url: string,
 *   title: string,
 *   validity_unit: string,
 *   validity_value: number
 * }}
 */
let PurchaseOptionDef;

/**
 * @typedef {{
 *   access: boolean,
 *   apl: string,
 *   premiumcontent: !PurchaseOptionDef,
 *   timepasses: (!Array<PurchaseOptionDef>|undefined),
 *   subscriptions: (!Array<PurchaseOptionDef>|undefined)
 * }}
 */
let PurchaseConfigDef;


/**
 * @implements {../../amp-access/0.1/access-vendor.AccessVendor}
 */
export class LaterpayVendor {

  /**
   * @param {!../../amp-access/0.1/amp-access.AccessService} accessService
   */
  constructor(accessService) {
    /** @const */
    this.ampdoc = accessService.ampdoc;

    /** @const @private {!../../amp-access/0.1/amp-access.AccessService} */
    this.accessService_ = accessService;

    /** @private @const {!../../../src/service/viewport/viewport-impl.Viewport} */
    this.viewport_ = Services.viewportForDoc(this.ampdoc);

    /** @const @private {!JsonObject} For shape see LaterpayConfigDef */
    this.laterpayConfig_ = this.accessService_.getAdapterConfig();

    /** @private {?JsonObject} For shape see PurchaseConfigDef */
    this.purchaseConfig_ = null;

    /** @private {?Function} */
    this.purchaseButtonListener_ = null;

    /** @private {?Function} */
    this.alreadyPurchasedListener_ = null;

    /** @const @private {!Array<function()>} */
    this.purchaseOptionListeners_ = [];

    /** @private {boolean} */
    this.containerEmpty_ = true;

    /** @private {?Node} */
    this.innerContainer_ = null;

    /** @private {?Node} */
    this.selectedPurchaseOption_ = null;

    /** @private {?Node} */
    this.purchaseButton_ = null;

    /** @private {string} */
    this.currentLocale_ = this.laterpayConfig_['locale'] || 'en';

    /** @private {!JsonObject} */
    this.i18n_ = /** @type {!JsonObject} */ (Object.assign(dict(),
        DEFAULT_MESSAGES, this.laterpayConfig_['localeMessages'] || dict()));

    /** @private {string} */
    this.purchaseConfigBaseUrl_ = this.getConfigUrl_() + CONFIG_BASE_PATH;
    const articleId = this.laterpayConfig_['articleId'];
    if (articleId) {
      this.purchaseConfigBaseUrl_ +=
        '&article_id=' + encodeURIComponent(articleId);
    }

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.ampdoc.win);

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.ampdoc.win);

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.ampdoc.win);

    // Install styles.
    installStylesForDoc(this.ampdoc, CSS, () => {}, false, TAG);
  }

  /**
   * @private
   * @return {string}
   */
  getConfigUrl_() {
    const region = this.laterpayConfig_['region'] || DEFAULT_REGION;
    if (
      (getMode().localDev || getMode().development) &&
      this.laterpayConfig_['configUrl']
    ) {
      return this.laterpayConfig_['configUrl'];
    } else if (this.laterpayConfig_['sandbox']) {
      return CONFIG_URLS.sandbox[region];
    } else {
      return CONFIG_URLS.live[region];
    }
  }

  /**
   * @return {!Promise<!JsonObject>}
   */
  authorize() {
    return this.getPurchaseConfig_()
        .then(response => {
          if (response.status === 204) {
            throw user()
                .createError('No merchant domains have been matched for this ' +
            'article, or no paid content configurations are setup.');
          }

          if (this.laterpayConfig_['scrollToTopAfterAuth']) {
            this.vsync_.mutate(() => this.viewport_.setScrollTop(0));
          }
          this.emptyContainer_();
          return {access: response.access};
        }, err => {
          if (!err || !err.response) {
            throw err;
          }
          const {response} = err;
          if (response.status !== 402) {
            throw err;
          }
          return response.json().catch(() => undefined).then(responseJson => {
            this.purchaseConfig_ = responseJson;
            // empty before rendering, in case authorization is being called again
            // with the same state
            this.emptyContainer_()
                .then(this.renderPurchaseOverlay_.bind(this));
            return {access: false};
          });
        });
  }

  /**
   * @return {!Promise<Object>}
   * @private
   */
  getPurchaseConfig_() {
    const url = this.purchaseConfigBaseUrl_ +
                '&article_title=' + encodeURIComponent(this.getArticleTitle_());
    const urlPromise = this.accessService_.buildUrl(
        url, /* useAuthData */ false);
    return urlPromise.then(url => {
      return this.accessService_.getLoginUrl(url);
    }).then(url => {
      dev().info(TAG, 'Authorization URL: ', url);
      return this.timer_.timeoutPromise(
          AUTHORIZATION_TIMEOUT,
          this.xhr_.fetchJson(url, {
            credentials: 'include',
          })).then(res => res.json());
    });
  }

  /**
   * @return {!Element}
   * @private
   */
  createElement_(name) {
    return this.ampdoc.win.document.createElement(name);
  }

  /**
   * @return {string}
   * @private
   */
  getArticleTitle_() {
    const title = this.ampdoc.getRootNode().querySelector(
        this.laterpayConfig_['articleTitleSelector']);
    user().assert(
        title, 'No article title element found with selector %s',
        this.laterpayConfig_['articleTitleSelector']);
    return title.textContent.trim();
  }

  /**
   * @return {!Element}
   * @private
   */
  getContainer_() {
    const id = TAG + '-dialog';
    const dialogContainer = this.ampdoc.getElementById(id);
    return user().assertElement(
        dialogContainer,
        'No element found with id ' + id
    );
  }

  /**
   * @private
   * @return {!Promise}
   */
  emptyContainer_() {
    // no need to do all of this if the container is already empty
    if (this.containerEmpty_) {
      return Promise.resolve();
    }
    let unlistener;
    while ((unlistener = this.purchaseOptionListeners_.shift())) {
      unlistener();
    }
    if (this.purchaseButtonListener_) {
      this.purchaseButtonListener_();
      this.purchaseButtonListener_ = null;
    }
    if (this.alreadyPurchasedListener_) {
      this.alreadyPurchasedListener_();
      this.alreadyPurchasedListener_ = null;
    }
    return this.vsync_.mutatePromise(() => {
      this.containerEmpty_ = true;
      this.innerContainer_ = null;
      removeChildren(this.getContainer_());
    });
  }

  /**
   * @private
   */
  renderPurchaseOverlay_() {
    const dialogContainer = this.getContainer_();
    this.innerContainer_ = this.createElement_('div');
    this.innerContainer_.className = TAG + '-container';
    if (this.laterpayConfig_['sandbox']) {
      this.renderTextBlock_('sandbox');
    }
    this.renderTextBlock_('header');
    const listContainer = this.createElement_('ul');
    this.purchaseConfig_['premiumcontent']['title'] =
      this.i18n_['premiumContentTitle'];
    this.purchaseConfig_['premiumcontent']['description'] =
        this.getArticleTitle_();
    listContainer.appendChild(
        this.createPurchaseOption_(this.purchaseConfig_['premiumcontent'])
    );
    this.purchaseConfig_['timepasses'].forEach(timepass => {
      listContainer.appendChild(this.createPurchaseOption_(timepass));
    });
    this.purchaseConfig_['subscriptions'].forEach(subscription => {
      listContainer.appendChild(this.createPurchaseOption_(subscription));
    });
    const purchaseButton = this.createElement_('button');
    purchaseButton.className = TAG + '-purchase-button';
    purchaseButton.textContent = this.i18n_['defaultButton'];
    this.purchaseButton_ = purchaseButton;
    this.purchaseButtonListener_ = listen(purchaseButton, 'click', ev => {
      const value = this.selectedPurchaseOption_.value;
      const purchaseType = this.selectedPurchaseOption_.dataset['purchaseType'];
      this.handlePurchase_(ev, value, purchaseType);
    });
    this.innerContainer_.appendChild(listContainer);
    this.innerContainer_.appendChild(purchaseButton);
    this.innerContainer_.appendChild(
        this.createAlreadyPurchasedLink_(this.purchaseConfig_['apl']));
    this.renderTextBlock_('footer');
    dialogContainer.appendChild(this.innerContainer_);
    dialogContainer.appendChild(this.createLaterpayBadge_());
    this.containerEmpty_ = false;
    this.preselectFirstOption_(
        dev().assertElement(listContainer.firstElementChild));
  }

  /**
   * @private
   * @param {!Element} firstOption
   */
  preselectFirstOption_(firstOption) {
    const firstInput = firstOption.querySelector('input[type="radio"]');
    firstInput.checked = true;
    this.selectPurchaseOption_(firstInput);
  }

  /**
   * @private
   * @param {string} area
   */
  renderTextBlock_(area) {
    if (this.i18n_[area]) {
      const el = this.createElement_('p');
      el.className = TAG + '-' + area;
      el.textContent = this.i18n_[area];
      this.innerContainer_.appendChild(el);
    }
  }

  /**
   * @private
   * @return {!Element}
   */
  createLaterpayBadge_() {
    const a = this.createElement_('a');
    a.href = 'https://laterpay.net';
    a.target = '_blank';
    a.textContent = 'LaterPay';
    const el = this.createElement_('p');
    el.className = TAG + '-badge';
    el.textContent = 'Powered by ';
    el.appendChild(a);
    return el;
  }

  /**
   * @param {!JsonObject} option Shape: PurchaseOptionDef
   * @return {!Element}
   * @private
   */
  createPurchaseOption_(option) {
    const li = this.createElement_('li');
    const control = this.createElement_('label');
    control.for = option['title'];
    control.appendChild(this.createRadioControl_(option));
    const metadataContainer = this.createElement_('div');
    metadataContainer.className = TAG + '-metadata';
    const title = this.createElement_('span');
    title.className = TAG + '-title';
    title.textContent = option['title'];
    metadataContainer.appendChild(title);
    const description = this.createElement_('p');
    description.className = TAG + '-description';
    description.textContent = option['description'];
    metadataContainer.appendChild(description);
    control.appendChild(metadataContainer);
    li.appendChild(control);
    li.appendChild(this.createPrice_(option['price']));
    return li;
  }

  /**
   * @param {!JsonObject} option Shape: PurchaseOptionDef
   * @return {!Element}
   * @private
   */
  createRadioControl_(option) {
    const radio = this.createElement_('input');
    radio.name = 'purchaseOption';
    radio.type = 'radio';
    radio.id = option['title'];
    radio.value = option['purchase_url'];
    const purchaseType = option['purchase_type'] === 'ppu' ?
      'payLater' :
      'payNow';
    const purchaseActionLabel = this.i18n_[purchaseType + 'Button'];
    radio.setAttribute('data-purchase-action-label', purchaseActionLabel);
    radio.setAttribute('data-purchase-type', purchaseType);
    this.purchaseOptionListeners_.push(listen(
        radio, 'change', this.handlePurchaseOptionSelection_.bind(this)
    ));
    return radio;
  }

  /**
   * @param {!Object<string, number>} price
   * @return {!Element}
   * @private
   */
  createPrice_(price) {
    const currency = Object.keys(price)[0];
    const formattedPrice = this.formatPrice_(price[currency]);
    const valueEl = this.createElement_('span');
    valueEl.className = TAG + '-price';
    valueEl.textContent = formattedPrice;
    const currencyEl = this.createElement_('sup');
    currencyEl.className = TAG + '-currency';
    currencyEl.textContent = currency;
    const priceEl = this.createElement_('p');
    priceEl.className = TAG + '-price-container';
    priceEl.appendChild(valueEl);
    priceEl.appendChild(currencyEl);
    return priceEl;
  }

  /**
   * @param {number} priceValue
   * @return {string}
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
   * @param {string} href
   * @return {!Element}
  */
  createAlreadyPurchasedLink_(href) {
    const p = this.createElement_('p');
    p.className = TAG + '-already-purchased-link-container';
    const a = this.createElement_('a');
    a.href = href;
    a.textContent = this.i18n_['alreadyPurchasedLink'];
    this.alreadyPurchasedListener_ = listen(a, 'click', ev => {
      this.handlePurchase_(ev, href, 'alreadyPurchased');
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
    this.selectPurchaseOption_(dev().assertElement(ev.target));
  }

  /**
   * @param {!Element} target
   * @private
   */
  selectPurchaseOption_(target) {
    const selectedOptionClassname = TAG + '-selected';
    const prevPurchaseOption = this.selectedPurchaseOption_;
    const purchaseActionLabel = target.dataset['purchaseActionLabel'];
    if (prevPurchaseOption &&
        prevPurchaseOption.classList.contains(selectedOptionClassname)) {
      prevPurchaseOption.classList.remove(selectedOptionClassname);
    }
    this.selectedPurchaseOption_ = target;
    this.selectedPurchaseOption_.classList.add(selectedOptionClassname);
    this.purchaseButton_.textContent = purchaseActionLabel;
  }

  /**
   * @param {!Event} ev
   * @param {string} purchaseUrl
   * @param {string} purchaseType
   * @private
   */
  handlePurchase_(ev, purchaseUrl, purchaseType) {
    ev.preventDefault();
    const urlPromise = this.accessService_.buildUrl(
        purchaseUrl, /* useAuthData */ false);
    return urlPromise.then(url => {
      dev().fine(TAG, 'Authorization URL: ', url);
      this.accessService_.loginWithUrl(url, purchaseType);
    });
  }

  /**
   * @return{!Promise}
   */
  pingback() {
    return Promise.resolve();
  }
}
