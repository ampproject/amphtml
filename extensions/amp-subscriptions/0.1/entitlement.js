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

/** @enum {string} */
export const GrantReason = {
  'SUBSCRIBER': 'SUBSCRIBER',
  'METERING': 'METERING',
};

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
      granted: false,
    });
  }

  /**
   * @param {Object} input
   * @param {string} [input.source]
   * @param {string} [input.raw]
   * @param {string} [input.service]
   * @param {boolean} [input.granted]
   * @param {?GrantReason} [input.grantReason]
   * @param {?JsonObject} [input.dataObject]
   * @param {?string} [input.decryptedDocumentKey]
   */
  constructor({source, raw = '', service, granted = false,
    grantReason = '', dataObject, decryptedDocumentKey}) {
    /** @const {string} */
    this.raw = raw;
    /** @const {string} */
    this.source = source;
    /** @type {string} */
    this.service = service;
    /** @const {boolean} */
    this.granted = granted;
    /** @const {?string} */
    this.grantReason = grantReason;
    /** @const {?JsonObject} */
    this.data = dataObject;
    /** @const {?string} */
    this.decryptedDocumentKey = decryptedDocumentKey;
  }

  /**
   * Returns json format of entitlements
   * @return {!JsonObject}
   */
  json() {
    const entitlementJson = dict({
      'source': this.source,
      'service': this.service,
      'granted': this.granted,
      'grantReason': this.grantReason,
      'data': this.data,
    });
    return (entitlementJson);
  }

  /**
   * Returns json to be used for pingback.
   *
   * @return {!JsonObject}
   */
  jsonForPingback() {
    return /** @type {!JsonObject} */ (Object.assign({},
        {'raw': this.raw},
        this.json()));
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
    const granted = json['granted'] || false;
    const grantReason = json['grantReason'];
    const dataObject = json['data'] || null;
    const decryptedDocumentKey = json['decryptedDocumentKey'] || null;
    return new Entitlement({source, raw, service: '',
      granted, grantReason, dataObject, decryptedDocumentKey});
  }

  /**
   * Returns if the user is a subscriber.
   * @return {boolean}
   */
  isSubscriber() {
    return this.granted && this.grantReason === GrantReason.SUBSCRIBER;
  }
}
