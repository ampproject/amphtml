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
import {dict} from '../../../src/utils/object';
import { dev } from '../../../src/log';

/** @typedef {{left: number, total: number, resetTime: number, durationUnit: string, token: string}} */
export let MeteringData;

/**
 * The single entitlement object.
 */
export class Entitlement {

  /**
   * @param {string} service
   * @return {!Entitlement}
   */
  static empty(service) {
    return new Entitlement({
      source: '',
      raw: '',
      service,
      products: [],
      subscriptionToken: null,
      loggedIn: false,
      metering: null,
    });
  }

  /**
   * @param {Object} input
   * @param {string} [input.source]
   * @param {string} [input.raw]
   * @param {string} [input.service]
   * @param {!Array<string>} [input.products]
   * @param {?string} [input.subscriptionToken]
   * @param {boolean} [input.loggedIn]
   * @param {?MeteringData} [input.metering]
   */
  constructor({source, raw = '', service, products = [],
    subscriptionToken = '', loggedIn = false, metering = null}) {
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
    /** @const {?MeteringData} */
    this.metering = metering;
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
      'metering': this.metering,
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
    dev().assert(this.product_, 'Current Product is not set');
    return this.product_ ? this.enables(this.product_) : false;
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
   * @param {?string} rawData
   * @return {!Entitlement}
   */
  static parseFromJson(json, rawData = null) {
    if (!json) {
      json = dict();
    }
    const raw = rawData || JSON.stringify(json);
    const source = json['source'] || '';
    const products = json['products'] || [];
    const subscriptionToken = json['subscriptionToken'];
    const loggedIn = json['loggedIn'];
    const meteringData = json['metering'];
    let metering = null;
    if (meteringData) {
      metering = {
        left: meteringData['left'],
        total: meteringData['total'],
        resetTime: meteringData['resetTime'],
        durationUnit: meteringData['durationUnit'],
        token: meteringData['token'],
      };
    }
    return new Entitlement({source, raw, service: '',
      products, subscriptionToken, loggedIn, metering});
  }
}
