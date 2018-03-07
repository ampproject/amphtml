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

import {dev} from '../../../src/log';
import {dict} from '../../../src/utils/object';

/**
 * The single entitlement object.
 */
export class Entitlement {

  /**
   * @param {string} service
   * @return {!Entitlement}
   */
  static empty(service) {
    return new Entitlement(
        /* source */ '',
        /* raw */ '',
        service,
        /* products */ [],
        /* subscriptionToken */ null,
        /* loggedIn */ false);
  }

  /**
   * @param {string} source
   * @param {string} raw
   * @param {string} service
   * @param {!Array<string>} products
   * @param {?string} subscriptionToken
   * @param {boolean} loggedIn
   */
  constructor(source, raw, service, products,
      subscriptionToken, loggedIn = false) {
    /** @const {string} */
    this.raw = raw;
    /** @const {string} */
    this.source = source;
    /** {string} */
    this.service = service;
    /** @const {!Array<string>} */
    this.products = products;
    /** @const {?string} */
    this.subscriptionToken = subscriptionToken;
    /** @const {boolean} */
    this.loggedIn = loggedIn;

    /** @private {?string} */
    this.product_ = null;
  }

  /**
   * Returns json format of entitlements
   * @return {!JsonObject}
   */
  json() {
    const entitlementJson = dict({
      'raw': this.raw,
      'source': this.source,
      'service': this.service,
      'products': this.products,
      'loggedIn': this.loggedIn,
      'subscriptionToken': this.subscriptionToken,
    });
    return (entitlementJson);
  }

  /**
   * @param {?string} product
   * @return {boolean}
   */
  enables(product) {
    if (!product) {
      return false;
    }
    return this.products.includes(product);
  }

  /**
   * @return {boolean}
   */
  enablesThis() {
    dev().assert(this.product_, 'Current product is not set');
    return this.enables(this.product_);
  }

  /**
   * Sets the current product
   * @param {string} product
   */
  setCurrentProduct(product) {
    this.product_ = product;
  }

  /**
   * @param {?JsonObject} json
   * @return {!Entitlement}
   */
  static parseFromJson(json) {
    if (!json) {
      json = dict();
    }
    const raw = JSON.stringify(json);
    const source = json['source'] || '';
    const products = json['products'] || [];
    const subscriptionToken = json['subscriptionToken'];
    const loggedIn = json['loggedIn'];
    return new Entitlement(source, raw, /* service */ '',
        products, subscriptionToken, loggedIn);
  }
}
