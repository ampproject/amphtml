/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
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
 /** Version: 0.1.19-1520269025428 */
'use strict';



/**
 * The holder of the entitlements for a service.
 */
class Entitlements {

  /**
   * @param {string} service
   * @param {string} raw
   * @param {!Array<!Entitlement>} entitlements
   * @param {?string} currentProduct
   */
  constructor(service, raw, entitlements, currentProduct) {
    /** @const {string} */
    this.service = service;
    /** @const {string} */
    this.raw = raw;
    /** @const {!Array<!Entitlement>} */
    this.entitlements = entitlements;

    /** @private @const {?string} */
    this.product_ = currentProduct;
  }

  /**
   * @return {!Entitlements}
   */
  clone() {
    return new Entitlements(
        this.service,
        this.raw,
        this.entitlements.map(ent => ent.clone()),
        this.product_);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'service': this.service,
      'entitlements': this.entitlements.map(item => item.json()),
    };
  }

  /**
   * @return {boolean}
   */
  enablesThis() {
    return this.enables(this.product_);
  }

  /**
   * @return {boolean}
   */
  enablesAny() {
    for (let i = 0; i < this.entitlements.length; i++) {
      if (this.entitlements[i].products.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {?string} product
   * @return {boolean}
   */
  enables(product) {
    if (!product) {
      return false;
    }
    return !!this.getEntitlementFor(product);
  }

  /**
   * @return {?Entitlement}
   */
  getEntitlementForThis() {
    return this.getEntitlementFor(this.product_);
  }

  /**
   * @param {?string} product
   * @return {?Entitlement}
   */
  getEntitlementFor(product) {
    if (product && this.entitlements.length > 0) {
      for (let i = 0; i < this.entitlements.length; i++) {
        if (this.entitlements[i].enables(product)) {
          return this.entitlements[i];
        }
      }
    }
    return null;
  }
}


/**
 * The single entitlement object.
 */
class Entitlement {

  /**
   * @param {string} source
   * @param {!Array<string>} products
   * @param {string} subscriptionToken
   */
  constructor(source, products, subscriptionToken) {
    /** @const {string} */
    this.source = source;
    /** @const {!Array<string>} */
    this.products = products;
    /** @const {string} */
    this.subscriptionToken = subscriptionToken;
  }

  /**
   * @return {!Entitlement}
   */
  clone() {
    return new Entitlement(
        this.source,
        this.products.slice(0),
        this.subscriptionToken);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'source': this.source,
      'products': this.products,
      'subscriptionToken': this.subscriptionToken,
    };
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
   * @param {?Object} json
   * @return {!Entitlement}
   */
  static parseFromJson(json) {
    if (!json) {
      json = {};
    }
    const source = json['source'] || '';
    const products = json['products'] || [];
    const subscriptionToken = json['subscriptionToken'];
    return new Entitlement(source, products, subscriptionToken);
  }

  /**
   * The JSON is expected in one of the forms:
   * - Single entitlement: `{products: [], ...}`.
   * - A list of entitlements: `[{products: [], ...}, {...}]`.
   * @param {!Object|!Array<!Object>} json
   * @return {!Array<!Entitlement>}
   */
  static parseListFromJson(json) {
    const jsonList = Array.isArray(json) ?
        /** @type {!Array<Object>} */ (json) : [json];
    return jsonList.map(json => Entitlement.parseFromJson(json));
  }
}




export {
  Entitlements,
  Entitlement,
};
