/**
 * Copyright 2022 The AMP HTML Authors. All Rights Reserved.
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

import {createElementWithAttributes, removeChildren} from '#core/dom';

import {Services} from '#service';

import {listen} from '#utils/event-helper';
import {user} from '#utils/log';

import {parseUrlDeprecated} from 'src/url';

import {
  AUTHORIZATION_TIMEOUT,
  CONFIG_BASE_PATH,
  CONFIG_PATH_PARAMS,
  DEFAULT_MESSAGES,
  TAG,
  TAG_SHORTHAND,
} from './fewcents-constants';

import {CSS} from '../../../build/amp-access-fewcents-0.1.css';
import {installStylesForDoc} from '../../../src/style-installer';

/**
 * @implements {../../amp-access/0.1/access-vendor.AccessVendor}
 */
export class AmpAccessFewcents {
  /**
   * @constructor
   * @param {!../../amp-access/0.1/amp-access.AccessService} accessService
   * @param {!../../amp-access/0.1/amp-access-source.AccessSource} accessSource
   */
  constructor(accessService, accessSource) {
    /** @const */
    this.ampdoc = accessService.ampdoc;

    /** @const @private {!../../amp-access/0.1/amp-access-source.AccessSource} */
    this.accessSource_ = accessSource;

    /** @private {?Node} */
    this.innerContainer_ = null;

    /** @private {?Node} Main container where paywall will be rendered */
    this.dialogContainer_ = null;

    /** @const @private {JsonObject}  Stores the config passed by the publisher */
    this.fewcentsConfig_ = this.accessSource_.getAdapterConfig();

    /** @private {string} Authorize endpoint to get paywall data*/
    this.authorizeUrl_ = this.prepareAuthorizeUrl_();

    /** @private {!JsonObject} */
    this.i18n_ = {...DEFAULT_MESSAGES};

    /** @private {string} */
    this.fewCentsBidId_ = null;

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(this.ampdoc.win);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(this.ampdoc.win);

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.ampdoc.win);

    /** @private {JsonObject} */
    this.purchaseOptions_ = null;

    /** @private {string} */
    this.loginDialogUrl_ = null;

    installStylesForDoc(this.ampdoc, CSS, () => {}, false, TAG);
  }

  /**
   * Decides whether to show the paywall or not
   * @return {!Promise<!JsonObject>}
   */
  authorize() {
    return this.getPaywallData_()
      .then(
        (response) => {
          // removing the paywall if shown and showing the content
          this.emptyContainer_();
          return {
            access: response.data.access,
            data: JSON.stringify(response),
          };
        },
        (err) => {
          // showing the paywall
          if (!err || !err.response) {
            throw err;
          }

          const {response} = err;
          // showing paywall when error code is 402 i.e payment required
          if (response.status !== 402) {
            throw err;
          }

          // rendering the paywall
          return response
            .json()
            .catch(() => {
              throw err;
            })
            .then((responseJson) => {
              this.parseAuthorizeResponse_(responseJson);
              this.emptyContainer_().then(
                this.renderPurchaseOverlay_.bind(this)
              );
              return {access: false, data: JSON.stringify(responseJson)};
            });
        }
      )
      .catch(() => {
        // showing the content when authorize endpoint fails
        this.emptyContainer_();
        return {access: true};
      });
  }

  /**
   * Add request parameters for the authorize endpoint
   * @return {string}
   * @private
   */
  prepareAuthorizeUrl_() {
    const accessKey = this.fewcentsConfig_['accessKey'];
    const articleIdentifier = this.fewcentsConfig_['articleIdentifier'];
    const category = this.fewcentsConfig_['category'];

    const {hostname} = parseUrlDeprecated();
    const basePath = this.getConfigBasePath_() + CONFIG_PATH_PARAMS;

    const url =
      basePath +
      '&accessKey=' +
      encodeURIComponent(accessKey) +
      '&category=' +
      encodeURIComponent(category) +
      '&articleIdentifier=' +
      encodeURIComponent(articleIdentifier) +
      '&domain=' +
      encodeURIComponent(hostname);

    return url;
  }

  /**
   * Returns the base path for authorize endpoint
   * @private
   * @return {string}
   */
  getConfigBasePath_() {
    const env = this.fewcentsConfig_['environment'];
    if (env === 'development') {
      return CONFIG_BASE_PATH.development;
    } else if (env === 'demo') {
      return CONFIG_BASE_PATH.demo;
    } else {
      return CONFIG_BASE_PATH.production;
    }
  }

  /**
   * Parse the response from authorize endpoint
   * @param {json} response
   * @private
   */
  parseAuthorizeResponse_(response) {
    const purchaseOptionsList = response?.data?.purchaseOptions;
    this.purchaseOptions_ = purchaseOptionsList?.[0];
    this.loginDialogUrl_ = response?.data?.loginUrl;
    const fewCentsBidId = response?.data?.bidId;

    // Setting the fewcentsBidId for re-authorize
    if (fewCentsBidId) {
      this.fewCentsBidId_ = fewCentsBidId;
    }
  }

  /**
   * Get paywall data by calling authorize endpoint
   * @return {!Promise<Object>}
   * @private
   */
  getPaywallData_() {
    let authorizeUrl = this.authorizeUrl_;

    // appending bidId in the authorize url during re-authorize
    if (this.fewCentsBidId_) {
      authorizeUrl = authorizeUrl + '&bidId=' + this.fewCentsBidId_;
    }

    // replacing variable READER_Id, CANONICAL_URL in the authorize url
    const urlPromise = this.accessSource_.buildUrl(
      authorizeUrl,
      /* useAuthData */ false
    );

    return urlPromise
      .then((url) => {
        // replacing variable RETURN_URL in the authorize url
        return this.accessSource_.getLoginUrl(url);
      })
      .then((url) => {
        return this.timer_
          .timeoutPromise(AUTHORIZATION_TIMEOUT, this.xhr_.fetchJson(url, {}))
          .then((res) => {
            return res.json();
          });
      });
  }

  /**
   * Removes the paywall from the element on publisher's page where paywall is displayed
   * @private
   * @return {!Promise}
   */
  emptyContainer_() {
    if (this.containerEmpty_) {
      return Promise.resolve();
    }

    if (this.unlockButtonListener_) {
      this.unlockButtonListener_ = null;
    }

    if (this.alreadyPurchasedListener_) {
      this.alreadyPurchasedListener_ = null;
    }

    return this.vsync_.mutatePromise(() => {
      this.containerEmpty_ = true;
      this.innerContainer_ = null;
      removeChildren(this.getPaywallContainer_());
    });
  }

  /**
   * Return element on publisher's page where paywall will be displayed
   * @return {!Element}
   * @private
   */
  getPaywallContainer_() {
    const containerId = this.fewcentsConfig_['contentSelector'];
    const dialogContainer = this.ampdoc.getElementById(containerId);
    return user().assertElement(
      dialogContainer,
      'No element found with given id',
      containerId
    );
  }

  /**
   * Creates the paywall component and append it to dialog container
   * @private
   */
  renderPurchaseOverlay_() {
    this.dialogContainer_ = this.getPaywallContainer_();
    this.innerContainer_ = createElementWithAttributes(
      this.ampdoc.win.document,
      'div',
      {
        class: TAG_SHORTHAND + '-container',
      }
    );

    this.createLogoAndHeader_();

    this.createAlreadyBoughtElement_();

    this.createPriceAndButton_();

    // 'div' element for reference row and fewcents logo
    const bottomDiv = createElementWithAttributes(
      this.ampdoc.win.document,
      'div',
      {
        class: TAG_SHORTHAND + '-bottom-div',
      }
    );

    // Reference row for terms and conditions
    const refRow = this.createRefRowElement_();
    bottomDiv.appendChild(refRow);

    // Creating fewcents logo for the paywall
    const fewcentsLogo = createElementWithAttributes(
      this.ampdoc.win.document,
      'img',
      {
        class: TAG_SHORTHAND + '-fewcents-image-tag',
        src: this.i18n_['fcPoweredImageRef'],
      }
    );
    bottomDiv.appendChild(fewcentsLogo);
    this.innerContainer_.appendChild(bottomDiv);

    this.dialogContainer_.appendChild(this.innerContainer_);
    this.containerEmpty_ = false;
  }

  /**
   * Creates publisher logo and header text for the paywall
   * @private
   */
  createLogoAndHeader_() {
    const publisherLogo = createElementWithAttributes(
      this.ampdoc.win.document,
      'img',
      {
        class: TAG_SHORTHAND + '-imageTag',
        src: this.fewcentsConfig_['publisherLogoUrl'],
      }
    );
    this.innerContainer_.appendChild(publisherLogo);

    const headerText = createElementWithAttributes(
      this.ampdoc.win.document,
      'div',
      {
        class: TAG_SHORTHAND + '-headerText',
      }
    );

    headerText.textContent = this.i18n_['fcTitleText'];
    this.innerContainer_.appendChild(headerText);
  }

  /**
   * Creates already bought link
   * @private
   */
  createAlreadyBoughtElement_() {
    const alreadyBought = createElementWithAttributes(
      this.ampdoc.win.document,
      'a',
      {
        class: TAG_SHORTHAND + '-already-bought',
        href: this.loginDialogUrl_,
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    );

    alreadyBought.textContent = this.i18n_['fcPromptText'];
    this.alreadyPurchasedListener_ = listen(alreadyBought, 'click', (ev) => {
      this.handlePurchase_(ev);
    });
    this.innerContainer_.appendChild(alreadyBought);
  }

  /**
   * Create elements for article price and unlock button
   * @private
   */
  createPriceAndButton_() {
    const priceAndButtonDiv = createElementWithAttributes(
      this.ampdoc.win.document,
      'div',
      {
        class: TAG_SHORTHAND + '-price-btn-div',
      }
    );
    this.innerContainer_.appendChild(priceAndButtonDiv);

    // Article price element
    const articlePrice = createElementWithAttributes(
      this.ampdoc.win.document,
      'div',
      {
        class: TAG_SHORTHAND + '-article-price',
      }
    );

    articlePrice.textContent = this.purchaseOptions_?.price?.price;
    priceAndButtonDiv.appendChild(articlePrice);

    // Unlock button div element
    const unlockButtonDiv = createElementWithAttributes(
      this.ampdoc.win.document,
      'div',
      {
        class: TAG_SHORTHAND + '-btn-div',
      }
    );

    // Creating unlock button on paywall
    const unlockButton = createElementWithAttributes(
      this.ampdoc.win.document,
      'button',
      {
        class: TAG_SHORTHAND + '-purchase-button',
        style: 'background:'.concat(this.fewcentsConfig_['primaryColor']),
      }
    );

    unlockButton.textContent = this.i18n_['fcButtonText'];
    this.unlockButtonListener_ = listen(unlockButton, 'click', (ev) => {
      this.handlePurchase_(ev);
    });
    unlockButtonDiv.appendChild(unlockButton);
    priceAndButtonDiv.appendChild(unlockButtonDiv);
  }

  /**
   * Create reference elements on paywall
   * @private
   */
  createRefRowElement_() {
    const refRow = createElementWithAttributes(
      this.ampdoc.win.document,
      'div',
      {
        class: TAG_SHORTHAND + '-refRow',
      }
    );

    const terms = createElementWithAttributes(this.ampdoc.win.document, 'a', {
      class: TAG_SHORTHAND + '-refElements',
      href: this.i18n_['fcTermsRef'],
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    terms.textContent = 'Terms';
    refRow.appendChild(terms);
    this.createPartitionbar_(refRow);

    const privacy = createElementWithAttributes(this.ampdoc.win.document, 'a', {
      class: TAG_SHORTHAND + '-refElements',
      href: this.i18n_['fcPrivacyRef'],
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    privacy.textContent = 'Privacy';
    refRow.appendChild(privacy);
    this.createPartitionbar_(refRow);

    const contactUs = createElementWithAttributes(
      this.ampdoc.win.document,
      'a',
      {
        class: TAG_SHORTHAND + '-refElements',
        href: this.i18n_['fcContactUsRef'],
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    );
    contactUs.textContent = 'Contact Us';
    refRow.appendChild(contactUs);
    this.createPartitionbar_(refRow);

    return refRow;
  }

  /**
   * Create partition bar for the reference elements
   * @private
   */
  createPartitionbar_(refRow) {
    const partitionBar = createElementWithAttributes(
      this.ampdoc.win.document,
      'span',
      {
        class: TAG_SHORTHAND + '-partition-bar',
      }
    );
    partitionBar.textContent = '|';
    refRow.appendChild(partitionBar);
  }

  /**
   * Open login dialog when click on unlock button
   * @param {!Event} ev
   * @private
   */
  handlePurchase_(ev) {
    ev.preventDefault();
    const urlPromise = this.accessSource_.buildUrl(
      this.loginDialogUrl_,
      /* useAuthData */ false
    );

    return urlPromise.then((url) => {
      this.accessSource_.loginWithUrl(url);
    });
  }
}
