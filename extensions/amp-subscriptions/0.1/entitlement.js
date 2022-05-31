/** @enum {string} */
export const GrantReason = {
  'SUBSCRIBER': 'SUBSCRIBER',
  'METERING': 'METERING',
  'FREE': 'UNLOCKED',
  'LAA': 'LAA',
};

/**
 * The constructor arg for an {@link Entitlement}
 *
 * @typedef {{
 *   source: string,
 *   raw: string,
 *   service: string,
 *   granted: boolean,
 *   grantReason: ?GrantReason,
 *   dataObject: ?JsonObject,
 *   decryptedDocumentKey: ?string
 * }} EntitlementConstructorInputDef
 */

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
   * @param {!EntitlementConstructorInputDef} input
   */
  constructor(input) {
    const {
      dataObject,
      decryptedDocumentKey,
      grantReason = '',
      granted = false,
      raw = '',
      service,
      source,
    } = input;
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
    const entitlementJson = {
      'source': this.source,
      'service': this.service,
      'granted': this.granted,
      'grantReason': this.grantReason,
      'data': this.data,
    };
    return entitlementJson;
  }

  /**
   * Returns json to be used for pingback.
   *
   * @return {!JsonObject}
   */
  jsonForPingback() {
    return /** @type {!JsonObject} */ ({'raw': this.raw, ...this.json()});
  }

  /**
   * @param {?JsonObject} json
   * @param {?string} rawData
   * @return {!Entitlement}
   */
  static parseFromJson(json, rawData = null) {
    if (!json) {
      json = {};
    }
    const raw = rawData || JSON.stringify(json);
    const source = json['source'] || '';
    const granted = json['granted'] || false;
    const grantReason = json['grantReason'];
    const dataObject = json['data'] || null;
    const decryptedDocumentKey = json['decryptedDocumentKey'] || null;
    return new Entitlement({
      source,
      raw,
      service: '',
      granted,
      grantReason,
      dataObject,
      decryptedDocumentKey,
    });
  }

  /**
   * Returns true if the user is a subscriber.
   * @return {boolean}
   */
  isSubscriber() {
    return this.granted && this.grantReason === GrantReason.SUBSCRIBER;
  }

  /**
   * Returns true if the article is free.
   * @return {boolean}
   */
  isFree() {
    return this.granted && this.grantReason === GrantReason.FREE;
  }
}
