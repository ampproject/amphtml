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
import {isExperimentOn} from '../../../src/experiments';
import {dev, user} from '../../../src/log';
import {listen, listenOnce} from '../../../src/event-helper';
import {xhrFor} from '../../../src/xhr';

const TAG = 'amp-access-laterpay';
const CONFIG_URL = 'http://localhost:8080/api/public/initial_config';
const AUTHORIZATION_TIMEOUT = 3000;

/**
 * @implements {AccessVendor}
 */
export class LaterpayVendor {

  /**
   * @param {!AccessService} accessService
   */
  constructor(accessService) {
    /** @private @const */
    this.accessService_ = accessService;
    this.win_ = this.accessService_.win;
    this.doc_ = this.win_.document;

    /** @private @const {!LaterpayConfig} */
    this.laterpayConfig_ = this.accessService_.getAdapterConfig();

    /** @private @const {!PurchaseConfig} */
    this.purchaseConfig_ = null;
    this.purchaseOptionListeners_ = [];
    this.selectedPurchaseOption_ = null;
    this.purchaseButton_ = null;

    /** @const @private {!Xhr} */
    this.xhr_ = xhrFor(this.win_);
  }

  /**
   * @return {!Promise<!JSONType>}
   */
  authorize() {
    user().assert(isExperimentOn(this.win_, 'amp-access-laterpay'),
        'Enable "amp-access-laterpay" experiment');
    return this.getInitialPurchaseConfig_().then(purchaseConfig => {
      this.purchaseConfig_ = purchaseConfig;
      if (!purchaseConfig.access) {
        this.renderPurchaseOverlay_();
      }
      return {access: purchaseConfig.access};
    });
  }

  getInitialPurchaseConfig_() {
    const urlPromise = this.accessService_.buildUrl_(CONFIG_URL,
        /* useAuthData */ false);
    return urlPromise.then(url => {
      dev().fine(TAG, 'Authorization URL: ', url);
      return this.accessService_.timer_.timeoutPromise(
          AUTHORIZATION_TIMEOUT,
          this.xhr_.fetchJson(url, {
            credentials: 'include',
            requireAmpResponseSourceOrigin: true,
          }));
    });
  }

  renderPurchaseOverlay_() {
    const laterpayList = this.doc_.querySelector(
      'amp-access-laterpay-list');
    const listContainer = this.doc_.createElement('ul');
    // TODO set these up somewhere else and make them configurable
    this.purchaseConfig_.premiumcontent.title = 'Buy this article';
    this.purchaseConfig_.premiumcontent.description =
      'title of the article should go here';
    listContainer.appendChild(
      this.createPurchaseOption_(this.purchaseConfig_.premiumcontent)
    );
    this.purchaseConfig_.timepasses.forEach(timepass => {
      listContainer.appendChild(this.createPurchaseOption_(timepass));
    });
    const purchaseButton = this.doc_.createElement('button');
    purchaseButton.textContent = 'Confirm your selection';
    purchaseButton.disabled = true;
    this.purchaseButton_ = purchaseButton;
    listenOnce(purchaseButton, 'click', this.handlePurchase_.bind(this));
    // TODO figure out if there's some specific way of triggering this last render
    laterpayList.appendChild(listContainer);
    laterpayList.appendChild(purchaseButton);
  }

  createPurchaseOption_(option) {
    const li = this.doc_.createElement('li');
    const title = this.doc_.createElement('h3');
    const link = this.doc_.createElement('a');
    link.href = option.purchase_url;
    link.textContent = option.title;
    this.purchaseOptionListeners_.push(listen(
      link, 'click', this.handlePurchaseOptionSelection_.bind(this)
    ));
    title.appendChild(link);
    const description = this.doc_.createElement('p');
    description.textContent = option.description;
    const price = this.doc_.createElement('p');
    price.textContent = this.formatPrice_(option.price);
    li.appendChild(title);
    li.appendChild(description);
    li.appendChild(price);
    return li;
  }

  formatPrice_(price) {
    // TODO do the actual formatting of the currency value based on the
    // currency type
    const currency = Object.keys(price)[0];
    return price[currency] + currency;
  }

  handlePurchaseOptionSelection_(ev) {
    const selectedOptionClassname = 'amp-access-laterpay-selected';
    const prevPurchaseOption = this.selectedPurchaseOption_;
    ev.preventDefault();
    if (prevPurchaseOption &&
        prevPurchaseOption.classList.contains(selectedOptionClassname)) {
      prevPurchaseOption.classList.remove(selectedOptionClassname);
    }
    this.selectedPurchaseOption_ = ev.target;
    this.selectedPurchaseOption_.classList.add(selectedOptionClassname);
    if (this.purchaseButton_.disabled) {
      this.purchaseButton_.disabled = false;
    }
  }

  handlePurchase_() {
    //const purchaseUrl = this.selectedPurchaseOption_.href;
    let unlistener;
    while (unlistener = this.purchaseOptionListeners_.shift()) {
      unlistener();
    }
    // TODO
    // this.accessService_.login(purchaseUrl);
  }

  /**
   * @return {!Promise}
   */
  pingback() {
    // TODO: implement
    return Promise.resolve();
  }
}


// Register the vendor within the access service.
accessServiceFor(AMP.win).then(accessService => {
  accessService.registerVendor('laterpay', new LaterpayVendor(accessService));
});
