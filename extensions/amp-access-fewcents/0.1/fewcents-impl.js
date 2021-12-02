/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {dict} from '#core/types/object';

import {dev, user} from '#utils/log';

import {CSS} from '../../../build/amp-access-fewcents-0.1.css';
import {installStylesForDoc} from '../../../src/style-installer';

const TAG = 'amp-access-fewcents';

const TAG_SHORTHAND = 'aaf';

const CONFIG_BASE_PATH =
  'https://api.hounds.fewcents.co/v1/amp/authorizeBid?articleUrl=SOURCE_URL&ampReaderId=READER_ID&returnUrl=RETURN_URL';

const DEFAULT_MESSAGES = {
  /* fc denotes fewcents */
  fcTitleText: 'Instant Access With Fewcents.',
  fcButtonText: 'Unlock',
};

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
    this.i18n_ = Object.assign(dict(), DEFAULT_MESSAGES);

    // Install styles.
    installStylesForDoc(this.ampdoc, CSS, () => {}, false, TAG);
  }

  /**
   * Decides to show the paywall or publisher content by calling authorize endpoint
   * @return {!Promise<!JsonObject>}
   */
  authorize() {
    return this.getPaywallData_().then(
      // [TODO] : More edge cases to be added with actual call
      (response) => {
        // Removing the paywall from dialogContainer
        this.emptyContainer_();
        // Showing the publisher's content
        return {access: response.data.access};
      },
      (err) => {
        // Rendering the paywall when request promise is rejected
        const {response} = err;
        return response.json().then(() => {
          this.emptyContainer_().then(this.renderPurchaseOverlay_.bind(this));
          return {access: false};
        });
      }
    );
  }

  /**
   * Add request parameters for the authorize endpoint
   * @return {string}
   * @private
   */
  prepareAuthorizeUrl_() {
    // [TODO]: Actual implementation
    dev().fine(TAG, 'Publishers config', this.fewcentsConfig_);
    return;
  }

  /**
   * Get paywall data by calling authorize endpoint
   * @return {!Promise<Object>}
   * @private
   */
  getPaywallData_() {
    // [TODO]: Actual API implementation using fetch
    dev().fine(TAG, 'authorizeUrl', this.authorizeUrl_, CONFIG_BASE_PATH);

    return Promise.reject({
      response: {
        status: 402,
        json() {
          return Promise.resolve({success: true});
        },
      },
    });
  }

  /**
   * Removes the paywall from the element on publisher's page where paywall is displayed
   * @private
   * @return {!Promise}
   */
  emptyContainer_() {
    // [TODO]: Actual implementation
    return Promise.resolve();
  }

  /**
   * Creates new element for the paywall
   * @param {string} name
   * @return {!Element}
   * @private
   */
  createElement_(name) {
    return this.ampdoc.win.document.createElement(name);
  }

  /**
   * Return element on publisher's page where paywall will be displayed
   * @return {!Element}
   * @private
   */
  getPaywallContainer_() {
    const dialogContainer = this.ampdoc.getElementById(
      'amp-access-fewcents-dialog'
    );
    return user().assertElement(
      dialogContainer,
      'No element found with given id '
    );
  }

  /**
   * Creates the paywall component and append it to dialog container
   * @private
   */
  renderPurchaseOverlay_() {
    // [TODO]: Create entire paywall element with button event listener for login flow
    this.dialogContainer_ = this.getPaywallContainer_();
    this.innerContainer_ = this.createElement_('div');
    this.innerContainer_.className = TAG_SHORTHAND + '-container';

    // Creating header text of paywall
    const headerText = this.createElement_('div');
    headerText.className = TAG_SHORTHAND + '-headerText';
    headerText.textContent = this.i18n_['fcTitleText'];

    this.innerContainer_.appendChild(headerText);

    // Creating unlock button on paywall
    const unlockButton = this.createElement_('button');
    unlockButton.className = TAG_SHORTHAND + '-purchase-button';
    unlockButton.textContent = this.i18n_['fcButtonText'];

    this.innerContainer_.appendChild(unlockButton);

    this.dialogContainer_.appendChild(this.innerContainer_);
    this.containerEmpty_ = false;
  }
}
