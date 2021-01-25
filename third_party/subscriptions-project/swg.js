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
/** Version: 0.1.22.141 */
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
/** @enum {number} */
const AnalyticsEvent = {
  UNKNOWN: 0,
  IMPRESSION_PAYWALL: 1,
  IMPRESSION_AD: 2,
  IMPRESSION_OFFERS: 3,
  IMPRESSION_SUBSCRIBE_BUTTON: 4,
  IMPRESSION_SMARTBOX: 5,
  IMPRESSION_SWG_BUTTON: 6,
  IMPRESSION_CLICK_TO_SHOW_OFFERS: 7,
  IMPRESSION_CLICK_TO_SHOW_OFFERS_OR_ALREADY_SUBSCRIBED: 8,
  IMPRESSION_SUBSCRIPTION_COMPLETE: 9,
  IMPRESSION_ACCOUNT_CHANGED: 10,
  IMPRESSION_PAGE_LOAD: 11,
  IMPRESSION_LINK: 12,
  IMPRESSION_SAVE_SUBSCR_TO_GOOGLE: 13,
  IMPRESSION_GOOGLE_UPDATED: 14,
  IMPRESSION_SHOW_OFFERS_SMARTBOX: 15,
  IMPRESSION_SHOW_OFFERS_SWG_BUTTON: 16,
  IMPRESSION_SELECT_OFFER_SMARTBOX: 17,
  IMPRESSION_SELECT_OFFER_SWG_BUTTON: 18,
  IMPRESSION_SHOW_CONTRIBUTIONS_SWG_BUTTON: 19,
  IMPRESSION_SELECT_CONTRIBUTION_SWG_BUTTON: 20,
  IMPRESSION_METER_TOAST: 21,
  IMPRESSION_REGWALL: 22,
  IMPRESSION_SHOWCASE_REGWALL: 23,
  ACTION_SUBSCRIBE: 1000,
  ACTION_PAYMENT_COMPLETE: 1001,
  ACTION_ACCOUNT_CREATED: 1002,
  ACTION_ACCOUNT_ACKNOWLEDGED: 1003,
  ACTION_SUBSCRIPTIONS_LANDING_PAGE: 1004,
  ACTION_PAYMENT_FLOW_STARTED: 1005,
  ACTION_OFFER_SELECTED: 1006,
  ACTION_SWG_BUTTON_CLICK: 1007,
  ACTION_VIEW_OFFERS: 1008,
  ACTION_ALREADY_SUBSCRIBED: 1009,
  ACTION_NEW_DEFERRED_ACCOUNT: 1010,
  ACTION_LINK_CONTINUE: 1011,
  ACTION_LINK_CANCEL: 1012,
  ACTION_GOOGLE_UPDATED_CLOSE: 1013,
  ACTION_USER_CANCELED_PAYFLOW: 1014,
  ACTION_SAVE_SUBSCR_TO_GOOGLE_CONTINUE: 1015,
  ACTION_SAVE_SUBSCR_TO_GOOGLE_CANCEL: 1016,
  ACTION_SWG_BUTTON_SHOW_OFFERS_CLICK: 1017,
  ACTION_SWG_BUTTON_SELECT_OFFER_CLICK: 1018,
  ACTION_SWG_BUTTON_SHOW_CONTRIBUTIONS_CLICK: 1019,
  ACTION_SWG_BUTTON_SELECT_CONTRIBUTION_CLICK: 1020,
  ACTION_USER_CONSENT_DEFERRED_ACCOUNT: 1021,
  ACTION_USER_DENY_DEFERRED_ACCOUNT: 1022,
  ACTION_DEFERRED_ACCOUNT_REDIRECT: 1023,
  ACTION_GET_ENTITLEMENTS: 1024,
  ACTION_METER_TOAST_SUBSCRIBE_CLICK: 1025,
  ACTION_METER_TOAST_EXPANDED: 1026,
  ACTION_METER_TOAST_CLOSED_BY_ARTICLE_INTERACTION: 1027,
  ACTION_METER_TOAST_CLOSED_BY_SWIPE_DOWN: 1028,
  ACTION_METER_TOAST_CLOSED_BY_X_CLICKED: 1029,
  EVENT_PAYMENT_FAILED: 2000,
  EVENT_CUSTOM: 3000,
  EVENT_CONFIRM_TX_ID: 3001,
  EVENT_CHANGED_TX_ID: 3002,
  EVENT_GPAY_NO_TX_ID: 3003,
  EVENT_GPAY_CANNOT_CONFIRM_TX_ID: 3004,
  EVENT_GOOGLE_UPDATED: 3005,
  EVENT_NEW_TX_ID: 3006,
  EVENT_UNLOCKED_BY_SUBSCRIPTION: 3007,
  EVENT_UNLOCKED_BY_METER: 3008,
  EVENT_NO_ENTITLEMENTS: 3009,
  EVENT_HAS_METERING_ENTITLEMENTS: 3010,
  EVENT_OFFERED_METER: 3011,
  EVENT_UNLOCKED_FREE_PAGE: 3012,
  EVENT_SUBSCRIPTION_STATE: 4000,
};
/** @enum {number} */
const EventOriginator = {
  UNKNOWN_CLIENT: 0,
  SWG_CLIENT: 1,
  AMP_CLIENT: 2,
  PROPENSITY_CLIENT: 3,
  SWG_SERVER: 4,
  PUBLISHER_CLIENT: 5,
  SHOWCASE_CLIENT: 6,
};

/**
 * @implements {Message}
 */
class AccountCreationRequest {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?boolean} */
    this.complete_ = data[base] == null ? null : data[base];
  }

  /**
   * @return {?boolean}
   */
  getComplete() {
    return this.complete_;
  }

  /**
   * @param {boolean} value
   */
  setComplete(value) {
    this.complete_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.complete_, // field 1 - complete
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'AccountCreationRequest';
  }
}

/**
 * @implements {Message}
 */
class AlreadySubscribedResponse {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?boolean} */
    this.subscriberOrMember_ = data[base] == null ? null : data[base];

    /** @private {?boolean} */
    this.linkRequested_ = data[1 + base] == null ? null : data[1 + base];
  }

  /**
   * @return {?boolean}
   */
  getSubscriberOrMember() {
    return this.subscriberOrMember_;
  }

  /**
   * @param {boolean} value
   */
  setSubscriberOrMember(value) {
    this.subscriberOrMember_ = value;
  }

  /**
   * @return {?boolean}
   */
  getLinkRequested() {
    return this.linkRequested_;
  }

  /**
   * @param {boolean} value
   */
  setLinkRequested(value) {
    this.linkRequested_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.subscriberOrMember_, // field 1 - subscriber_or_member
        this.linkRequested_, // field 2 - link_requested
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'AlreadySubscribedResponse';
  }
}

/**
 * @implements {Message}
 */
class AnalyticsContext {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?string} */
    this.embedderOrigin_ = data[base] == null ? null : data[base];

    /** @private {?string} */
    this.transactionId_ = data[1 + base] == null ? null : data[1 + base];

    /** @private {?string} */
    this.referringOrigin_ = data[2 + base] == null ? null : data[2 + base];

    /** @private {?string} */
    this.utmSource_ = data[3 + base] == null ? null : data[3 + base];

    /** @private {?string} */
    this.utmCampaign_ = data[4 + base] == null ? null : data[4 + base];

    /** @private {?string} */
    this.utmMedium_ = data[5 + base] == null ? null : data[5 + base];

    /** @private {?string} */
    this.sku_ = data[6 + base] == null ? null : data[6 + base];

    /** @private {?boolean} */
    this.readyToPay_ = data[7 + base] == null ? null : data[7 + base];

    /** @private {!Array<string>} */
    this.label_ = data[8 + base] || [];

    /** @private {?string} */
    this.clientVersion_ = data[9 + base] == null ? null : data[9 + base];

    /** @private {?string} */
    this.url_ = data[10 + base] == null ? null : data[10 + base];
  }

  /**
   * @return {?string}
   */
  getEmbedderOrigin() {
    return this.embedderOrigin_;
  }

  /**
   * @param {string} value
   */
  setEmbedderOrigin(value) {
    this.embedderOrigin_ = value;
  }

  /**
   * @return {?string}
   */
  getTransactionId() {
    return this.transactionId_;
  }

  /**
   * @param {string} value
   */
  setTransactionId(value) {
    this.transactionId_ = value;
  }

  /**
   * @return {?string}
   */
  getReferringOrigin() {
    return this.referringOrigin_;
  }

  /**
   * @param {string} value
   */
  setReferringOrigin(value) {
    this.referringOrigin_ = value;
  }

  /**
   * @return {?string}
   */
  getUtmSource() {
    return this.utmSource_;
  }

  /**
   * @param {string} value
   */
  setUtmSource(value) {
    this.utmSource_ = value;
  }

  /**
   * @return {?string}
   */
  getUtmCampaign() {
    return this.utmCampaign_;
  }

  /**
   * @param {string} value
   */
  setUtmCampaign(value) {
    this.utmCampaign_ = value;
  }

  /**
   * @return {?string}
   */
  getUtmMedium() {
    return this.utmMedium_;
  }

  /**
   * @param {string} value
   */
  setUtmMedium(value) {
    this.utmMedium_ = value;
  }

  /**
   * @return {?string}
   */
  getSku() {
    return this.sku_;
  }

  /**
   * @param {string} value
   */
  setSku(value) {
    this.sku_ = value;
  }

  /**
   * @return {?boolean}
   */
  getReadyToPay() {
    return this.readyToPay_;
  }

  /**
   * @param {boolean} value
   */
  setReadyToPay(value) {
    this.readyToPay_ = value;
  }

  /**
   * @return {!Array<string>}
   */
  getLabelList() {
    return this.label_;
  }

  /**
   * @param {!Array<string>} value
   */
  setLabelList(value) {
    this.label_ = value;
  }

  /**
   * @return {?string}
   */
  getClientVersion() {
    return this.clientVersion_;
  }

  /**
   * @param {string} value
   */
  setClientVersion(value) {
    this.clientVersion_ = value;
  }

  /**
   * @return {?string}
   */
  getUrl() {
    return this.url_;
  }

  /**
   * @param {string} value
   */
  setUrl(value) {
    this.url_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.embedderOrigin_, // field 1 - embedder_origin
        this.transactionId_, // field 2 - transaction_id
        this.referringOrigin_, // field 3 - referring_origin
        this.utmSource_, // field 4 - utm_source
        this.utmCampaign_, // field 5 - utm_campaign
        this.utmMedium_, // field 6 - utm_medium
        this.sku_, // field 7 - sku
        this.readyToPay_, // field 8 - ready_to_pay
        this.label_, // field 9 - label
        this.clientVersion_, // field 10 - client_version
        this.url_, // field 11 - url
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'AnalyticsContext';
  }
}

/**
 * @implements {Message}
 */
class AnalyticsEventMeta {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?EventOriginator} */
    this.eventOriginator_ = data[base] == null ? null : data[base];

    /** @private {?boolean} */
    this.isFromUserAction_ = data[1 + base] == null ? null : data[1 + base];
  }

  /**
   * @return {?EventOriginator}
   */
  getEventOriginator() {
    return this.eventOriginator_;
  }

  /**
   * @param {!EventOriginator} value
   */
  setEventOriginator(value) {
    this.eventOriginator_ = value;
  }

  /**
   * @return {?boolean}
   */
  getIsFromUserAction() {
    return this.isFromUserAction_;
  }

  /**
   * @param {boolean} value
   */
  setIsFromUserAction(value) {
    this.isFromUserAction_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.eventOriginator_, // field 1 - event_originator
        this.isFromUserAction_, // field 2 - is_from_user_action
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'AnalyticsEventMeta';
  }
}

/**
 * @implements {Message}
 */
class AnalyticsRequest {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?AnalyticsContext} */
    this.context_ =
      data[base] == null || data[base] == undefined
        ? null
        : new AnalyticsContext(data[base], includesLabel);

    /** @private {?AnalyticsEvent} */
    this.event_ = data[1 + base] == null ? null : data[1 + base];

    /** @private {?AnalyticsEventMeta} */
    this.meta_ =
      data[2 + base] == null || data[2 + base] == undefined
        ? null
        : new AnalyticsEventMeta(data[2 + base], includesLabel);

    /** @private {?EventParams} */
    this.params_ =
      data[3 + base] == null || data[3 + base] == undefined
        ? null
        : new EventParams(data[3 + base], includesLabel);
  }

  /**
   * @return {?AnalyticsContext}
   */
  getContext() {
    return this.context_;
  }

  /**
   * @param {!AnalyticsContext} value
   */
  setContext(value) {
    this.context_ = value;
  }

  /**
   * @return {?AnalyticsEvent}
   */
  getEvent() {
    return this.event_;
  }

  /**
   * @param {!AnalyticsEvent} value
   */
  setEvent(value) {
    this.event_ = value;
  }

  /**
   * @return {?AnalyticsEventMeta}
   */
  getMeta() {
    return this.meta_;
  }

  /**
   * @param {!AnalyticsEventMeta} value
   */
  setMeta(value) {
    this.meta_ = value;
  }

  /**
   * @return {?EventParams}
   */
  getParams() {
    return this.params_;
  }

  /**
   * @param {!EventParams} value
   */
  setParams(value) {
    this.params_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.context_ ? this.context_.toArray(includeLabel) : [], // field 1 - context
        this.event_, // field 2 - event
        this.meta_ ? this.meta_.toArray(includeLabel) : [], // field 3 - meta
        this.params_ ? this.params_.toArray(includeLabel) : [], // field 4 - params
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'AnalyticsRequest';
  }
}

/**
 * @implements {Message}
 */
class EntitlementJwt {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?string} */
    this.jwt_ = data[base] == null ? null : data[base];

    /** @private {?string} */
    this.source_ = data[1 + base] == null ? null : data[1 + base];
  }

  /**
   * @return {?string}
   */
  getJwt() {
    return this.jwt_;
  }

  /**
   * @param {string} value
   */
  setJwt(value) {
    this.jwt_ = value;
  }

  /**
   * @return {?string}
   */
  getSource() {
    return this.source_;
  }

  /**
   * @param {string} value
   */
  setSource(value) {
    this.source_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.jwt_, // field 1 - jwt
        this.source_, // field 2 - source
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'EntitlementJwt';
  }
}

/**
 * @implements {Message}
 */
class EntitlementsRequest {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?EntitlementJwt} */
    this.usedEntitlement_ =
      data[base] == null || data[base] == undefined
        ? null
        : new EntitlementJwt(data[base], includesLabel);

    /** @private {?Timestamp} */
    this.clientEventTime_ =
      data[1 + base] == null || data[1 + base] == undefined
        ? null
        : new Timestamp(data[1 + base], includesLabel);
  }

  /**
   * @return {?EntitlementJwt}
   */
  getUsedEntitlement() {
    return this.usedEntitlement_;
  }

  /**
   * @param {!EntitlementJwt} value
   */
  setUsedEntitlement(value) {
    this.usedEntitlement_ = value;
  }

  /**
   * @return {?Timestamp}
   */
  getClientEventTime() {
    return this.clientEventTime_;
  }

  /**
   * @param {!Timestamp} value
   */
  setClientEventTime(value) {
    this.clientEventTime_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.usedEntitlement_ ? this.usedEntitlement_.toArray(includeLabel) : [], // field 1 - used_entitlement
        this.clientEventTime_ ? this.clientEventTime_.toArray(includeLabel) : [], // field 2 - client_event_time
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'EntitlementsRequest';
  }
}

/**
 * @implements {Message}
 */
class EntitlementsResponse {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?string} */
    this.jwt_ = data[base] == null ? null : data[base];
  }

  /**
   * @return {?string}
   */
  getJwt() {
    return this.jwt_;
  }

  /**
   * @param {string} value
   */
  setJwt(value) {
    this.jwt_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.jwt_, // field 1 - jwt
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'EntitlementsResponse';
  }
}

/**
 * @implements {Message}
 */
class EventParams {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?string} */
    this.smartboxMessage_ = data[base] == null ? null : data[base];

    /** @private {?string} */
    this.gpayTransactionId_ = data[1 + base] == null ? null : data[1 + base];

    /** @private {?boolean} */
    this.hadLogged_ = data[2 + base] == null ? null : data[2 + base];

    /** @private {?string} */
    this.sku_ = data[3 + base] == null ? null : data[3 + base];

    /** @private {?string} */
    this.oldTransactionId_ = data[4 + base] == null ? null : data[4 + base];

    /** @private {?boolean} */
    this.isUserRegistered_ = data[5 + base] == null ? null : data[5 + base];
  }

  /**
   * @return {?string}
   */
  getSmartboxMessage() {
    return this.smartboxMessage_;
  }

  /**
   * @param {string} value
   */
  setSmartboxMessage(value) {
    this.smartboxMessage_ = value;
  }

  /**
   * @return {?string}
   */
  getGpayTransactionId() {
    return this.gpayTransactionId_;
  }

  /**
   * @param {string} value
   */
  setGpayTransactionId(value) {
    this.gpayTransactionId_ = value;
  }

  /**
   * @return {?boolean}
   */
  getHadLogged() {
    return this.hadLogged_;
  }

  /**
   * @param {boolean} value
   */
  setHadLogged(value) {
    this.hadLogged_ = value;
  }

  /**
   * @return {?string}
   */
  getSku() {
    return this.sku_;
  }

  /**
   * @param {string} value
   */
  setSku(value) {
    this.sku_ = value;
  }

  /**
   * @return {?string}
   */
  getOldTransactionId() {
    return this.oldTransactionId_;
  }

  /**
   * @param {string} value
   */
  setOldTransactionId(value) {
    this.oldTransactionId_ = value;
  }

  /**
   * @return {?boolean}
   */
  getIsUserRegistered() {
    return this.isUserRegistered_;
  }

  /**
   * @param {boolean} value
   */
  setIsUserRegistered(value) {
    this.isUserRegistered_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.smartboxMessage_, // field 1 - smartbox_message
        this.gpayTransactionId_, // field 2 - gpay_transaction_id
        this.hadLogged_, // field 3 - had_logged
        this.sku_, // field 4 - sku
        this.oldTransactionId_, // field 5 - old_transaction_id
        this.isUserRegistered_, // field 6 - is_user_registered
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'EventParams';
  }
}

/**
 * @implements {Message}
 */
class FinishedLoggingResponse {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?boolean} */
    this.complete_ = data[base] == null ? null : data[base];

    /** @private {?string} */
    this.error_ = data[1 + base] == null ? null : data[1 + base];
  }

  /**
   * @return {?boolean}
   */
  getComplete() {
    return this.complete_;
  }

  /**
   * @param {boolean} value
   */
  setComplete(value) {
    this.complete_ = value;
  }

  /**
   * @return {?string}
   */
  getError() {
    return this.error_;
  }

  /**
   * @param {string} value
   */
  setError(value) {
    this.error_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.complete_, // field 1 - complete
        this.error_, // field 2 - error
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'FinishedLoggingResponse';
  }
}

/**
 * @implements {Message}
 */
class LinkSaveTokenRequest {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?string} */
    this.authCode_ = data[base] == null ? null : data[base];

    /** @private {?string} */
    this.token_ = data[1 + base] == null ? null : data[1 + base];
  }

  /**
   * @return {?string}
   */
  getAuthCode() {
    return this.authCode_;
  }

  /**
   * @param {string} value
   */
  setAuthCode(value) {
    this.authCode_ = value;
  }

  /**
   * @return {?string}
   */
  getToken() {
    return this.token_;
  }

  /**
   * @param {string} value
   */
  setToken(value) {
    this.token_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.authCode_, // field 1 - auth_code
        this.token_, // field 2 - token
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'LinkSaveTokenRequest';
  }
}

/**
 * @implements {Message}
 */
class LinkingInfoResponse {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?boolean} */
    this.requested_ = data[base] == null ? null : data[base];
  }

  /**
   * @return {?boolean}
   */
  getRequested() {
    return this.requested_;
  }

  /**
   * @param {boolean} value
   */
  setRequested(value) {
    this.requested_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.requested_, // field 1 - requested
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'LinkingInfoResponse';
  }
}

/**
 * @implements {Message}
 */
class SkuSelectedResponse {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?string} */
    this.sku_ = data[base] == null ? null : data[base];

    /** @private {?string} */
    this.oldSku_ = data[1 + base] == null ? null : data[1 + base];

    /** @private {?boolean} */
    this.oneTime_ = data[2 + base] == null ? null : data[2 + base];

    /** @private {?string} */
    this.playOffer_ = data[3 + base] == null ? null : data[3 + base];

    /** @private {?string} */
    this.oldPlayOffer_ = data[4 + base] == null ? null : data[4 + base];
  }

  /**
   * @return {?string}
   */
  getSku() {
    return this.sku_;
  }

  /**
   * @param {string} value
   */
  setSku(value) {
    this.sku_ = value;
  }

  /**
   * @return {?string}
   */
  getOldSku() {
    return this.oldSku_;
  }

  /**
   * @param {string} value
   */
  setOldSku(value) {
    this.oldSku_ = value;
  }

  /**
   * @return {?boolean}
   */
  getOneTime() {
    return this.oneTime_;
  }

  /**
   * @param {boolean} value
   */
  setOneTime(value) {
    this.oneTime_ = value;
  }

  /**
   * @return {?string}
   */
  getPlayOffer() {
    return this.playOffer_;
  }

  /**
   * @param {string} value
   */
  setPlayOffer(value) {
    this.playOffer_ = value;
  }

  /**
   * @return {?string}
   */
  getOldPlayOffer() {
    return this.oldPlayOffer_;
  }

  /**
   * @param {string} value
   */
  setOldPlayOffer(value) {
    this.oldPlayOffer_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.sku_, // field 1 - sku
        this.oldSku_, // field 2 - old_sku
        this.oneTime_, // field 3 - one_time
        this.playOffer_, // field 4 - play_offer
        this.oldPlayOffer_, // field 5 - old_play_offer
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'SkuSelectedResponse';
  }
}

/**
 * @implements {Message}
 */
class SmartBoxMessage {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?boolean} */
    this.isClicked_ = data[base] == null ? null : data[base];
  }

  /**
   * @return {?boolean}
   */
  getIsClicked() {
    return this.isClicked_;
  }

  /**
   * @param {boolean} value
   */
  setIsClicked(value) {
    this.isClicked_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.isClicked_, // field 1 - is_clicked
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'SmartBoxMessage';
  }
}

/**
 * @implements {Message}
 */
class SubscribeResponse {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?boolean} */
    this.subscribe_ = data[base] == null ? null : data[base];
  }

  /**
   * @return {?boolean}
   */
  getSubscribe() {
    return this.subscribe_;
  }

  /**
   * @param {boolean} value
   */
  setSubscribe(value) {
    this.subscribe_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.subscribe_, // field 1 - subscribe
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'SubscribeResponse';
  }
}

/**
 * @implements {Message}
 */
class Timestamp {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?number} */
    this.seconds_ = data[base] == null ? null : data[base];

    /** @private {?number} */
    this.nanos_ = data[1 + base] == null ? null : data[1 + base];
  }

  /**
   * @return {?number}
   */
  getSeconds() {
    return this.seconds_;
  }

  /**
   * @param {number} value
   */
  setSeconds(value) {
    this.seconds_ = value;
  }

  /**
   * @return {?number}
   */
  getNanos() {
    return this.nanos_;
  }

  /**
   * @param {number} value
   */
  setNanos(value) {
    this.nanos_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.seconds_, // field 1 - seconds
        this.nanos_, // field 2 - nanos
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'Timestamp';
  }
}

/**
 * @implements {Message}
 */
class ToastCloseRequest {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?boolean} */
    this.close_ = data[base] == null ? null : data[base];
  }

  /**
   * @return {?boolean}
   */
  getClose() {
    return this.close_;
  }

  /**
   * @param {boolean} value
   */
  setClose(value) {
    this.close_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.close_, // field 1 - close
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'ToastCloseRequest';
  }
}

/**
 * @implements {Message}
 */
class ViewSubscriptionsResponse {
  /**
   * @param {!Array<*>=} data
   * @param {boolean=} includesLabel
   */
  constructor(data = [], includesLabel = true) {
    const base = includesLabel ? 1 : 0;

    /** @private {?boolean} */
    this.native_ = data[base] == null ? null : data[base];
  }

  /**
   * @return {?boolean}
   */
  getNative() {
    return this.native_;
  }

  /**
   * @param {boolean} value
   */
  setNative(value) {
    this.native_ = value;
  }

  /**
   * @param {boolean} includeLabel
   * @return {!Array<?>}
   * @override
   */
  toArray(includeLabel = true) {
    const arr = [
        this.native_, // field 1 - native
    ];
    if (includeLabel) {
      arr.unshift(this.label());
    }
    return arr;
  }

  /**
   * @return {string}
   * @override
   */
  label() {
    return 'ViewSubscriptionsResponse';
  }
}

const PROTO_MAP = {
  'AccountCreationRequest': AccountCreationRequest,
  'AlreadySubscribedResponse': AlreadySubscribedResponse,
  'AnalyticsContext': AnalyticsContext,
  'AnalyticsEventMeta': AnalyticsEventMeta,
  'AnalyticsRequest': AnalyticsRequest,
  'EntitlementJwt': EntitlementJwt,
  'EntitlementsRequest': EntitlementsRequest,
  'EntitlementsResponse': EntitlementsResponse,
  'EventParams': EventParams,
  'FinishedLoggingResponse': FinishedLoggingResponse,
  'LinkSaveTokenRequest': LinkSaveTokenRequest,
  'LinkingInfoResponse': LinkingInfoResponse,
  'SkuSelectedResponse': SkuSelectedResponse,
  'SmartBoxMessage': SmartBoxMessage,
  'SubscribeResponse': SubscribeResponse,
  'Timestamp': Timestamp,
  'ToastCloseRequest': ToastCloseRequest,
  'ViewSubscriptionsResponse': ViewSubscriptionsResponse,
};

/**
 * Utility to deserialize a buffer
 * @param {!Array<*>} data
 * @return {!Message}
 */
function deserialize(data) {
  /** {?string} */
  const key = data ? data[0] : null;
  if (key) {
    const ctor = PROTO_MAP[key];
    if (ctor) {
      return new ctor(data);
    }
  }
  throw new Error('Deserialization failed for ' + data);
}

/**
 * @param {function(new: T)} messageType
 * @return {string}
 * @template T
 */
function getLabel(messageType) {
  const message = /** @type {!Message} */ (new messageType());
  return message.label();
}

/**
 * Copyright 2019 The Subscribe with Google Authors. All Rights Reserved.
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

/** @enum {number}  */
const FilterResult = {
  /** The event is allowed to proceed to the listeners. */
  PROCESS_EVENT: 0,
  /** The event is canceled and the listeners are not informed about it. */
  CANCEL_EVENT: 1,
};

/**
 * Defines a client event in SwG
 * Properties:
 * - eventType: Required. The AnalyticsEvent type that occurred.
 * - eventOriginator: Required.  The codebase that initiated the event.
 * - isFromUserAction: Optional.  True if the user took an action to generate
 *   the event.
 * - additionalParameters: Optional.  A JSON object to store generic data.
 *
 *  @typedef {{
 *    eventType: !AnalyticsEvent,
 *    eventOriginator: !EventOriginator,
 *    isFromUserAction: ?boolean,
 *    additionalParameters: ?Object,
 * }}
 */
let ClientEvent;

/**
 * @interface
 */
class ClientEventManagerApi {
  /**
   * Call this function to log an event. The registered listeners will be
   * invoked unless the event is filtered.
   * @param {!function(!ClientEvent)} listener
   */
  registerEventListener(listener) {}

  /**
   * Register a filterer for events if you need to potentially prevent the
   * listeners from hearing about it.  A filterer should return
   * FilterResult.CANCEL_EVENT to prevent listeners from hearing about the
   * event.
   * @param {!function(!ClientEvent):FilterResult} filterer
   */
  registerEventFilterer(filterer) {}

  /**
   * Call this function to log an event.  It will immediately throw an error if
   * the event is invalid.  It will then asynchronously call the filterers and
   * stop the event if a filterer cancels it.  After that, it will call each
   * listener asynchronously.
   * @param {!ClientEvent} event
   */
  logEvent(event) {}
}

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

/**
 * abstract View Class. Used to render the content within the Dialog. The
 * extended class has actual content.
 * @abstract
 */
class View {
  /**
   * Empty constructor.
   */
  constructor() {}

  /**
   * Gets the iframe element.
   * @return {!Element}
   * @abstract
   */
  getElement() {}

  /**
   * @param {!./dialog.Dialog} unusedDialog
   * @return {!Promise}
   * @abstract
   */
  init(unusedDialog) {}

  /**
   * Resizes the content.
   */
  resized() {
    // Do nothing by default. Override if needed.
  }

  /**
   * Accept the result.
   * @return {!Promise}
   * @abstract
   */
  whenComplete() {}

  /**
   * @return {boolean}
   * @abstract
   */
  shouldFadeBody() {}

  /**
   * @return {boolean}
   * @abstract
   */
  hasLoadingIndicator() {}
}

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

/**
 * @param {!../components/activities.ActivityPortDef} port
 * @param {string} requireOrigin
 * @param {boolean} requireOriginVerified
 * @param {boolean} requireSecureChannel
 * @return {!Promise<!Object>}
 */
function acceptPortResultData(
  port,
  requireOrigin,
  requireOriginVerified,
  requireSecureChannel
) {
  return port.acceptResult().then((result) => {
    if (
      result.origin != requireOrigin ||
      (requireOriginVerified && !result.originVerified) ||
      (requireSecureChannel && !result.secureChannel)
    ) {
      throw new Error('channel mismatch');
    }
    return result.data;
  });
}

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

/**
 * Debug logger, only log message if #swg.log=1
 * @param {...*} var_args [decription]
 */

/* eslint-disable */

function debugLog(var_args) {
  if (/swg.debug=1/.test(self.location.hash)) {
    const logArgs = Array.prototype.slice.call(arguments, 0);
    logArgs.unshift('[Subscriptions]');
    log.apply(log, logArgs);
  }
}

/**
 * @param  {...*} var_args [description]
 */
function log(var_args) {
  console.log.apply(console, arguments);
}

/**
 * @param  {...*} var_args [description]
 */
function warn(var_args) {
  console.warn.apply(console, arguments);
}

/**
 * Throws an error if the first argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders.
 *
 * Throws an error object that has two extra properties:
 * - associatedElement: This is the first element provided in the var args.
 *   It can be used for improved display of error messages.
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this yields
 *   native displays of things like HTML elements.
 *
 * @param {T} shouldBeTrueish The value to assert. The assert fails if it does
 *     not evaluate to true.
 * @param {string=} message The assertion message
 * @param {...*} var_args Arguments substituted into %s in the message.
 * @return {T} The value of shouldBeTrueish.
 * @template T
 */
function assert(shouldBeTrueish, message, var_args) {
  let firstElement;
  if (!shouldBeTrueish) {
    message = message || 'Assertion failed';
    const splitMessage = message.split('%s');
    const first = splitMessage.shift();
    let formatted = first;
    const messageArray = [];
    pushIfNonEmpty(messageArray, first);
    for (let i = 2; i < arguments.length; i++) {
      const val = arguments[i];
      if (val && val.tagName) {
        firstElement = val;
      }
      const nextConstant = splitMessage.shift();
      messageArray.push(val);
      pushIfNonEmpty(messageArray, nextConstant.trim());
      formatted += toString(val) + nextConstant;
    }
    const e = new Error(formatted);
    e.fromAssert = true;
    e.associatedElement = firstElement;
    e.messageArray = messageArray;
    throw e;
  }
  return shouldBeTrueish;
}

/**
 * @param {!Array} array
 * @param {*} val
 */
function pushIfNonEmpty(array, val) {
  if (val != '') {
    array.push(val);
  }
}

function toString(val) {
  // Do check equivalent to `val instanceof Element` without cross-window bug
  if (val && val.nodeType == 1) {
    return val.tagName.toLowerCase() + (val.id ? '#' + val.id : '');
  }
  return /** @type {string} */ (val);
}

var log_1 = {
  assert,
  debugLog,
  warn,
  log
};
var log_2 = log_1.assert;
var log_4 = log_1.warn;
var log_5 = log_1.log;

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

/**
 * Returns a map-like object.
 * If initial is provided, copies its own properties into the
 * newly created object.
 * @param {Object=} initial This should typically be an object literal.
 * @return {!Object}
 * @template T
 */
function map(initial) {
  const obj = Object.create(null);
  if (initial) {
    Object.assign(obj, initial);
  }
  return obj;
}

/**
 * Implements `Array.find()` method that's not yet available in all browsers.
 *
 * @param {?Array<T>} array
 * @param {function(T, number, !Array<T>):boolean} predicate
 * @return {?T}
 * @template T
 */
function findInArray(array, predicate) {
  if (!array) {
    return null;
  }
  const len = array.length || 0;
  if (len > 0) {
    for (let i = 0; i < len; i++) {
      const other = array[i];
      if (predicate(other, i, array)) {
        return other;
      }
    }
  }
  return null;
}

/**
 * Copyright 2019 The Subscribe with Google Authors. All Rights Reserved.
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

/**
 * Returns an array of random values.  The length of the array is numInts.  Each
 * int will be >= 0 and < maxVal.
 * @param {!number} numInts
 * @param {!number} maxVal
 */
function getRandomInts(numInts, maxVal) {
  // Ensure array type is appropriate for the max value (performance)
  const arr =
    maxVal < 256
      ? new Uint8Array(numInts)
      : maxVal < 32768
      ? new Uint16Array(numInts)
      : new Uint32Array(numInts);

  const isIE = !!self['msCrypto'];
  const localCrypto = isIE ? self['msCrypto'] : self.crypto;
  if (localCrypto && localCrypto.getRandomValues) {
    localCrypto.getRandomValues(arr);
    for (let i = arr.length - 1; i > -1; i--) {
      arr[i] = arr[i] % maxVal;
    }
  } else {
    // For older browsers
    for (let i = arr.length - 1; i > -1; i--) {
      arr[i] = Math.floor(Math.random() * maxVal);
    }
  }

  return arr;
}

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

/**
 * Character mapping from base64url to base64.
 * @const {!Object<string, string>}
 */
const base64UrlDecodeSubs = {'-': '+', '_': '/', '.': '='};

/**
 * Converts a string which holds 8-bit code points, such as the result of atob,
 * into a Uint8Array with the corresponding bytes.
 * If you have a string of characters, you probably want to be using utf8Encode.
 * @param {string} str
 * @return {!Uint8Array}
 */
function stringToBytes(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    log_2(charCode <= 255, 'Characters must be in range [0,255]');
    bytes[i] = charCode;
  }
  return bytes;
}

/**
 * Converts a 8-bit bytes array into a string
 * @param {!Uint8Array} bytes
 * @return {string}
 */
function bytesToString(bytes) {
  // Intentionally avoids String.fromCharCode.apply so we don't suffer a
  // stack overflow. #10495, https://jsperf.com/bytesToString-2
  const array = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    array[i] = String.fromCharCode(bytes[i]);
  }
  return array.join('');
}

/**
 * Interpret a byte array as a UTF-8 string.
 * @param {!Uint8Array} bytes
 * @return {string}
 */
function utf8DecodeSync(bytes) {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }
  const asciiString = bytesToString(new Uint8Array(bytes));
  return decodeURIComponent(escape(asciiString));
}

/**
 * Turn a string into UTF-8 bytes.
 * @param {string} string
 * @return {!Uint8Array}
 */
function utf8EncodeSync(string) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder('utf-8').encode(string);
  }
  return stringToBytes(unescape(encodeURIComponent(string)));
}

/**
 * Converts a string which is in base64url encoding into a Uint8Array
 * containing the decoded value.
 * @param {string} str
 * @return {!Uint8Array}
 */
function base64UrlDecodeToBytes(str) {
  const encoded = atob(str.replace(/[-_.]/g, (ch) => base64UrlDecodeSubs[ch]));
  return stringToBytes(encoded);
}

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

const CHARS = '0123456789ABCDEF';

/**
 * Polyfill for String.prototype.startsWith.
 * @param {string} string
 * @param {string} prefix
 * @return {boolean}
 */
function startsWith(string, prefix) {
  if (prefix.length > string.length) {
    return false;
  }
  return string.lastIndexOf(prefix, 0) == 0;
}

/**
 * Ensures the passed value is safe to use for character 19 per rfc4122,
 * sec. 4.1.5.  "Sets the high bits of clock sequence".
 * @param {!number} v
 */
function getChar19(v) {
  return CHARS[(v & 0x3) | 0x8];
}

/**
 * The returned identifier will always be an 8 digit valid hexidecimal number
 * and will be unique for each MS within a given month.
 * @return {string}
 */
function getMonthlyTimeIdentifier() {
  const hexTime = Date.now().toString(16);
  return hexTime.substring(hexTime.length - 8).toUpperCase();
}

/**
 * Generates a RFC 4122 V4 UUID. Ex: "92329D39-6F5C-4520-ABFC-AAB64544E172"
 * The first 8 digits are unique for the millisecond of the month.  The rest
 * are randomly generated.
 */
function getUuid() {
  let uuid = getMonthlyTimeIdentifier() + '-';
  let rIndex = 0;
  const rands = getRandomInts(23, 16);
  for (let i = 9; i < 36; i++) {
    switch (i) {
      case 13:
      case 18:
      case 23:
        uuid += '-';
        break;
      case 14:
        uuid += '4';
        break;
      case 19:
        uuid += getChar19(rands[rIndex++]);
        break;
      default:
        uuid += CHARS[rands[rIndex++]];
        break;
    }
  }
  return uuid;
}

function getSwgTransactionId() {
  return getUuid() + '.swg';
}

/**
 * Returns a string whose length matches the length of format.
 * @param {string} str
 * @param {string} format
 * @return {string}
 */
function padString(str, format) {
  return (format + str).slice(-format.length);
}

const PADDING = '00000000';
function toHex(buffer) {
  const hexCodes = [];
  const view = new DataView(buffer);
  for (let i = 0; i < view.byteLength; i += 4) {
    // toString(16) will give the hex representation of the number without padding
    const stringValue = view.getUint32(i).toString(16);
    hexCodes.push(padString(stringValue, PADDING));
  }
  return hexCodes.join('');
}

/**
 * Returns a hexadecimal 128 character string that is the
 * SHA-512 hash of the passed string.
 * @param {string} stringToHash
 * @return {!Promise<string>}
 */
function hash(stringToHash) {
  const crypto = self.crypto || self.msCrypto;
  const subtle = crypto.subtle;
  return subtle
    .digest('SHA-512', utf8EncodeSync(stringToHash))
    .then((digest) => toHex(digest));
}

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

/** @type {Object<string, string>} */
let propertyNameCache;

/** @const {!Array<string>} */
const vendorPrefixes = ['Webkit', 'webkit', 'Moz', 'moz', 'ms', 'O', 'o'];

/**
 * Default styles to be set for top level friendly iframe.
 * Some attributes are not included such as height, left, margin-left; since
 * these attributes are updated by @media queries and having these values
 * defined here as !important does not work on IE/edge browsers.
 * @const {!Object<string, string|number>}
 */
const defaultStyles = {
  'align-content': 'normal',
  'animation': 'none',
  'align-items': 'normal',
  'align-self': 'auto',
  'alignment-baseline': 'auto',
  'backface-visibility': 'hidden',
  'background-clip': 'border-box',
  'background-image': 'none',
  'baseline-shift': '0',
  'block-size': 'auto',
  'border': 'none',
  'border-collapse': 'separate',
  'bottom': '0',
  'box-sizing': 'border-box',
  'break-after': 'auto',
  'break-before': 'auto',
  'break-inside': 'auto',
  'buffered-rendering': 'auto',
  'caption-side': 'top',
  'caret-color': 'rgb(51, 51, 51)',
  'clear': 'none',
  'color': 'rgb(51, 51, 51)',
  'color-rendering': 'auto',
  'column-count': 'auto',
  'column-fill': 'balance',
  'column-gap': 'normal',
  'column-rule-color': 'rgb(51, 51, 51)',
  'column-rule-style': 'none',
  'column-rule-width': '0',
  'column-span': 'none',
  'column-width': 'auto',
  'contain': 'none',
  'counter-increment': 'none',
  'counter-reset': 'none',
  'cursor': 'auto',
  'direction': 'inherit',
  'display': 'block',
  'empty-cells': 'show',
  'filter': 'none',
  'flex': 'none', // flex-grow, flex-shrink, and flex-basis.
  'flex-flow': 'row nowrap', // flex-direction, flex-wrap.
  'float': 'none',
  'flood-color': 'rgb(0, 0, 0)',
  'flood-opacity': '1',
  'font': 'none',
  'font-size': 'medium',
  'font-family': '',
  'height': 'auto',
  'hyphens': 'manual',
  'image-rendering': 'auto',
  'inline-size': '', // Setting to 'auto' will not allow override.
  'isolation': 'auto',
  'justify-content': 'normal',
  'justify-items': 'normal',
  'justify-self': 'auto',
  'letter-spacing': 'normal',
  'lighting-color': 'rgb(255, 255, 255)',
  'line-break': 'auto',
  'line-height': 'normal',
  'mask': 'none',
  'max-block-size': 'none',
  'max-height': 'none',
  'max-inline-size': 'none',
  'max-width': 'none',
  'min-block-size': 'none',
  'min-height': '0',
  'min-inline-size': '0',
  'min-width': '0',
  'mix-blend-mode': 'normal',
  'object-fit': 'fill', // Important for Safari browser.
  'offset-distance': 'none', // Chrome only (Experimental).
  'offset-path': 'none', // Chrome only (Experimental).
  'offset-rotate': 'auto 0deg', // Chrome only (Experimental).
  'opacity': '1',
  'order': '0',
  'orphans': '2',
  'outline': 'none',
  'overflow-anchor': 'auto',
  'overflow-wrap': 'normal',
  'overflow': 'visible',
  'padding': '0',
  'page': '',
  'perspective': 'none',
  'pointer-events': 'auto',
  'position': 'static',
  'quotes': '',
  'resize': 'none',
  'right': '0',
  'scroll-behavior': 'auto',
  'tab-size': '8', // Only Chrome, Safari (Experimental).
  'table-layout': 'auto',
  'text-align': 'start',
  'text-align-last': 'auto',
  'text-anchor': 'start',
  'text-combine-upright': 'none',
  'text-decoration': 'none',
  'text-indent': '0',
  'text-orientation': 'mixed',
  'text-overflow': 'clip',
  'text-rendering': 'auto',
  'text-shadow': 'none',
  'text-size-adjust': 'auto',
  'text-transform': 'none',
  'text-underline-position': 'auto',
  'top': 'auto',
  'touch-action': 'auto',
  'transform': 'none',
  'transition': 'none 0s ease 0s',
  'unicode-bidi': 'normal',
  'user-select': 'auto',
  'vector-effect': 'none',
  'vertical-align': 'baseline',
  'visibility': 'visible',
  'white-space': 'normal',
  'widows': '2',
  'word-break': 'normal',
  'word-spacing': '0',
  'word-wrap': 'normal',
  'writing-mode': 'horizontal-tb',
  'zoom': '1',
  'z-index': 'auto',
};

/**
 * @export
 * @param {string} camelCase camel cased string
 * @return {string} title cased string
 */
function camelCaseToTitleCase(camelCase) {
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

/**
 * Checks the style if a prefixed version of a property exists and returns
 * it or returns an empty string.
 * @private
 * @param {!Object} style
 * @param {string} titleCase the title case version of a css property name
 * @return {string} the prefixed property name or null.
 */
function getVendorJsPropertyName_(style, titleCase) {
  for (let i = 0; i < vendorPrefixes.length; i++) {
    const propertyName = vendorPrefixes[i] + titleCase;
    if (style[propertyName] !== undefined) {
      return propertyName;
    }
  }
  return '';
}

/**
 * Returns the possibly prefixed JavaScript property name of a style property
 * (ex. WebkitTransitionDuration) given a camelCase'd version of the property
 * (ex. transitionDuration).
 * @export
 * @param {!Object} style
 * @param {string} camelCase the camel cased version of a css property name
 * @param {boolean=} bypassCache bypass the memoized cache of property
 *   mapping
 * @return {string}
 */
function getVendorJsPropertyName(style, camelCase, bypassCache) {
  if (startsWith(camelCase, '--')) {
    // CSS vars are returned as is.
    return camelCase;
  }
  if (!propertyNameCache) {
    propertyNameCache = map();
  }
  let propertyName = propertyNameCache[camelCase];
  if (!propertyName || bypassCache) {
    propertyName = camelCase;
    if (style[camelCase] === undefined) {
      const titleCase = camelCaseToTitleCase(camelCase);
      const prefixedPropertyName = getVendorJsPropertyName_(style, titleCase);

      if (style[prefixedPropertyName] !== undefined) {
        propertyName = prefixedPropertyName;
      }
    }
    if (!bypassCache) {
      propertyNameCache[camelCase] = propertyName;
    }
  }
  return propertyName;
}

/**
 * Sets the CSS styles of the specified element with !important. The styles
 * are specified as a map from CSS property names to their values.
 * @param {!Element} element
 * @param {!Object<string, string|number>} styles
 */
function setImportantStyles(element, styles) {
  for (const k in styles) {
    element.style.setProperty(
      getVendorJsPropertyName(styles, k),
      styles[k].toString(),
      'important'
    );
  }
}

/**
 * Sets the CSS style of the specified element with optional units, e.g. "px".
 * @param {Element} element
 * @param {string} property
 * @param {?string|number|boolean} value
 * @param {string=} units
 * @param {boolean=} bypassCache
 */
function setStyle(element, property, value, units, bypassCache) {
  const propertyName = getVendorJsPropertyName(
    element.style,
    property,
    bypassCache
  );
  if (propertyName) {
    element.style[propertyName] = /** @type {string} */ (units
      ? value + units
      : value);
  }
}

/**
 * Sets the CSS styles of the specified element. The styles
 * a specified as a map from CSS property names to their values.
 * @param {!Element} element
 * @param {!Object<string, ?string|number|boolean>} styles
 */
function setStyles(element, styles) {
  for (const k in styles) {
    setStyle(element, k, styles[k]);
  }
}

/**
 * Resets styles that were set dynamically (i.e. inline)
 * @param {!Element} element
 * @param {!Array<string>} properties
 */
function resetStyles(element, properties) {
  const styleObj = {};
  properties.forEach((prop) => {
    styleObj[prop] = null;
  });
  setStyles(element, styleObj);
}

/**
 * Resets all the styles of an element to a given value. Defaults to null.
 * The valid values are 'inherit', 'initial', 'unset' or null.
 * @param {!Element} element
 */
function resetAllStyles(element) {
  setImportantStyles(element, defaultStyles);
}

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

/** @const {string} */
const styleType = 'text/css';

/**
 * Add attributes to an element.
 * @param {!Element} element
 * @param {!Object<string, string|number|boolean|!Object<string, string|number|boolean>>} attributes
 * @return {!Element} updated element.
 */
function addAttributesToElement(element, attributes) {
  for (const attr in attributes) {
    if (attr == 'style') {
      setStyles(
        element,
        /** @type {!Object<string, string|boolean|number>} */
        (attributes[attr])
      );
    } else {
      element.setAttribute(
        attr,
        /** @type {string|boolean|number} */ (attributes[attr])
      );
    }
  }
  return element;
}

/**
 * Create a new element on document with specified tagName and attributes.
 * @param {!Document} doc
 * @param {string} tagName
 * @param {!Object<string, string>} attributes
 * @param {?(string|!Node|!ArrayLike<!Node>|!Array<!Node>)=} content
 * @return {!Element} created element.
 */
function createElement(doc, tagName, attributes, content) {
  const element = doc.createElement(tagName);
  addAttributesToElement(element, attributes);
  if (content != null) {
    if (typeof content == 'string') {
      element.textContent = content;
    } else if (content.nodeType) {
      element.appendChild(content);
    } else if ('length' in content) {
      for (let i = 0; i < content.length; i++) {
        element.appendChild(content[i]);
      }
    } else {
      log_2(false, 'Unsupported content: %s', content);
    }
  }
  return element;
}

/**
 * Removes the element.
 * @param {!Element} element
 */
function removeElement(element) {
  if (element.parentElement) {
    element.parentElement.removeChild(element);
  }
}

/**
 * Removes all children from the parent element.
 * @param {!Element} parent
 */
function removeChildren(parent) {
  parent.textContent = '';
}

/**
 * Injects the provided styles in the HEAD section of the document.
 * @param {!../model/doc.Doc} doc The document object.
 * @param {string} styleText The style string.
 * @return {!Element}
 */
function injectStyleSheet(doc, styleText) {
  const styleElement = createElement(doc.getWin().document, 'style', {
    'type': styleType,
  });
  styleElement.textContent = styleText;
  doc.getHead().appendChild(styleElement);
  return styleElement;
}

/**
 * Polyfill of the `Node.isConnected` API. See
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected.
 * @param {!Node} node
 * @return {boolean}
 */
function isConnected(node) {
  // Ensure that node is attached if specified. This check uses a new and
  // fast `isConnected` API and thus only checked on platforms that have it.
  // See https://www.chromestatus.com/feature/5676110549352448.
  if ('isConnected' in node) {
    return node['isConnected'];
  }
  // Polyfill.
  const root = node.ownerDocument && node.ownerDocument.documentElement;
  return (root && root.contains(node)) || false;
}

/**
 * Returns true if current browser is a legacy version of Edge.
 *
 * Starting in January 2020, new versions of Edge will use the Chromium engine.
 * These versions won't include the word "Edge" in their useragent.
 * Instead, they'll include the word "Edg".
 * So far, it seems safe to avoid detecting these new versions of Edge.
 * @param {!Window} win
 * @return {boolean}
 */
function isLegacyEdgeBrowser(win) {
  const nav = win.navigator;
  return /Edge/i.test(nav && nav.userAgent);
}

/**
 * @license
 * Copyright 2017 The Web Activities Authors. All Rights Reserved.
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

/*eslint no-unused-vars: 0*/


/**
 * @enum {string}
 */
const ActivityMode = {
  IFRAME: 'iframe',
  POPUP: 'popup',
  REDIRECT: 'redirect',
};


/**
 * The result code used for `ActivityResult`.
 * @enum {string}
 */
const ActivityResultCode = {
  OK: 'ok',
  CANCELED: 'canceled',
  FAILED: 'failed',
};


/**
 * The result of an activity. The activity implementation returns this object
 * for a successful result, a cancelation or a failure.
 * @struct
 */
class ActivityResult {
  /**
   * @param {!ActivityResultCode} code
   * @param {*} data
   * @param {!ActivityMode} mode
   * @param {string} origin
   * @param {boolean} originVerified
   * @param {boolean} secureChannel
   */
  constructor(code, data, mode, origin, originVerified, secureChannel) {
    /** @const {!ActivityResultCode} */
    this.code = code;
    /** @const {*} */
    this.data = code == ActivityResultCode.OK ? data : null;
    /** @const {!ActivityMode} */
    this.mode = mode;
    /** @const {string} */
    this.origin = origin;
    /** @const {boolean} */
    this.originVerified = originVerified;
    /** @const {boolean} */
    this.secureChannel = secureChannel;
    /** @const {boolean} */
    this.ok = code == ActivityResultCode.OK;
    /** @const {?Error} */
    this.error = code == ActivityResultCode.FAILED ?
        new Error(String(data) || '') :
        null;
  }
}


/**
 * The activity request that different types of hosts can be started with.
 * @typedef {{
 *   requestId: string,
 *   returnUrl: string,
 *   args: ?Object,
 *   origin: (string|undefined),
 *   originVerified: (boolean|undefined),
 * }}
 */
let ActivityRequest;


/**
 * The activity "open" options used for popups and redirects.
 *
 * - returnUrl: override the return URL. By default, the current URL will be
 *   used.
 * - skipRequestInUrl: removes the activity request from the URL, in case
 *   redirect is used. By default, the activity request is appended to the
 *   activity URL. This option can be used if the activity request is passed
 *   to the activity by some alternative means.
 * - disableRedirectFallback: disallows popup fallback to redirect. By default
 *   the redirect fallback is allowed. This option has to be used very carefully
 *   because there are many user agents that may fail to open a popup and it
 *   won't be always possible for the opener window to even be aware of such
 *   failures.
 *
 * @typedef {{
 *   returnUrl: (string|undefined),
 *   skipRequestInUrl: (boolean|undefined),
 *   disableRedirectFallback: (boolean|undefined),
 *   width: (number|undefined),
 *   height: (number|undefined),
 * }}
 */
let ActivityOpenOptions;


/**
 * Activity client-side binding. The port provides limited ways to communicate
 * with the activity and receive signals and results from it. Not every type
 * of activity exposes a port.
 *
 * @interface
 */
class ActivityPort {

  /**
   * Returns the mode of the activity: iframe, popup or redirect.
   * @return {!ActivityMode}
   */
  getMode() {}

  /**
   * Accepts the result when ready. The client should verify the activity's
   * mode, origin, verification and secure channel flags before deciding
   * whether or not to trust the result.
   *
   * Returns the promise that yields when the activity has been completed and
   * either a result, a cancelation or a failure has been returned.
   *
   * @return {!Promise<!ActivityResult>}
   */
  acceptResult() {}
}


/**
 * Activity client-side binding for messaging.
 *
 * Whether the host can or cannot receive a message depends on the type of
 * host and its state. Ensure that the code has an alternative path if
 * messaging is not available.
 *
 * @interface
 */
class ActivityMessagingPort {

  /**
   * Returns the target window where host is loaded. May be unavailable.
   * @return {?Window}
   */
  getTargetWin() {}

  /**
   * Sends a message to the host.
   * @param {!Object} payload
   */
  message(payload) {}

  /**
   * Registers a callback to receive messages from the host.
   * @param {function(!Object)} callback
   */
  onMessage(callback) {}

  /**
   * Creates a new communication channel or returns an existing one.
   * @param {string=} opt_name
   * @return {!Promise<!MessagePort>}
   */
  messageChannel(opt_name) {}
}



/** DOMException.ABORT_ERR name */
const ABORT_ERR_NAME = 'AbortError';

/** DOMException.ABORT_ERR = 20 */
const ABORT_ERR_CODE = 20;

/** @type {?HTMLAnchorElement} */
let aResolver;


/**
 * @param {string} urlString
 * @return {!HTMLAnchorElement}
 */
function parseUrl(urlString) {
  if (!aResolver) {
    aResolver = /** @type {!HTMLAnchorElement} */ (document.createElement('a'));
  }
  aResolver.href = urlString;
  return /** @type {!HTMLAnchorElement} */ (aResolver);
}


/**
 * @param {!Location|!URL|!HTMLAnchorElement} loc
 * @return {string}
 */
function getOrigin(loc) {
  if (loc.origin) {
    return loc.origin;
  }
  // Make sure that the origin is normalized. Specifically on IE, host sometimes
  // includes the default port, which is not per standard.
  const protocol = loc.protocol;
  let host = loc.host;
  if (protocol == 'https:' && host.indexOf(':443') == host.length - 4) {
    host = host.replace(':443', '');
  } else if (protocol == 'http:' && host.indexOf(':80') == host.length - 3) {
    host = host.replace(':80', '');
  }
  return protocol + '//' + host;
}


/**
 * @param {string} urlString
 * @return {string}
 */
function getOriginFromUrl(urlString) {
  return getOrigin(parseUrl(urlString));
}


/**
 * @param {string} urlString
 * @return {string}
 */
function removeFragment(urlString) {
  const index = urlString.indexOf('#');
  if (index == -1) {
    return urlString;
  }
  return urlString.substring(0, index);
}


/**
 * Parses and builds Object of URL query string.
 * @param {string} query The URL query string.
 * @return {!Object<string, string>}
 */
function parseQueryString(query) {
  if (!query) {
    return {};
  }
  return (/^[?#]/.test(query) ? query.slice(1) : query)
      .split('&')
      .reduce((params, param) => {
        const item = param.split('=');
        const key = decodeURIComponent(item[0] || '');
        const value = decodeURIComponent(item[1] || '');
        if (key) {
          params[key] = value;
        }
        return params;
      }, {});
}


/**
 * @param {string} queryString  A query string in the form of "a=b&c=d". Could
 *   be optionally prefixed with "?" or "#".
 * @param {string} param The param to get from the query string.
 * @return {?string}
 */
function getQueryParam(queryString, param) {
  return parseQueryString(queryString)[param];
}


/**
 * Add a query-like parameter to the fragment string.
 * @param {string} url
 * @param {string} param
 * @param {string} value
 * @return {string}
 */
function addFragmentParam(url, param, value) {
  return url +
      (url.indexOf('#') == -1 ? '#' : '&') +
      encodeURIComponent(param) + '=' + encodeURIComponent(value);
}


/**
 * @param {string} queryString  A query string in the form of "a=b&c=d". Could
 *   be optionally prefixed with "?" or "#".
 * @param {string} param The param to remove from the query string.
 * @return {?string}
 */
function removeQueryParam(queryString, param) {
  if (!queryString) {
    return queryString;
  }
  const search = encodeURIComponent(param) + '=';
  let index = -1;
  do {
    index = queryString.indexOf(search, index);
    if (index != -1) {
      const prev = index > 0 ? queryString.substring(index - 1, index) : '';
      if (prev == '' || prev == '?' || prev == '#' || prev == '&') {
        let end = queryString.indexOf('&', index + 1);
        if (end == -1) {
          end = queryString.length;
        }
        queryString =
            queryString.substring(0, index) +
            queryString.substring(end + 1);
      } else {
        index++;
      }
    }
  } while (index != -1 && index < queryString.length);
  return queryString;
}


/**
 * @param {!ActivityRequest} request
 * @return {string}
 */
function serializeRequest(request) {
  const map = {
    'requestId': request.requestId,
    'returnUrl': request.returnUrl,
    'args': request.args,
  };
  if (request.origin !== undefined) {
    map['origin'] = request.origin;
  }
  if (request.originVerified !== undefined) {
    map['originVerified'] = request.originVerified;
  }
  return JSON.stringify(map);
}


/**
 * @param {*} error
 * @return {boolean}
 */
function isAbortError(error) {
  if (!error || typeof error != 'object') {
    return false;
  }
  return (error['name'] === ABORT_ERR_NAME);
}


/**
 * Creates or emulates a DOMException of AbortError type.
 * See https://heycam.github.io/webidl/#aborterror.
 * @param {!Window} win
 * @param {string=} opt_message
 * @return {!DOMException}
 */
function createAbortError(win, opt_message) {
  const message = 'AbortError' + (opt_message ? ': ' + opt_message : '');
  let error = null;
  if (typeof win['DOMException'] == 'function') {
    // TODO(dvoytenko): remove typecast once externs are fixed.
    const constr = /** @type {function(new:DOMException, string, string)} */ (
        win['DOMException']);
    try {
      error = new constr(message, ABORT_ERR_NAME);
    } catch (e) {
      // Ignore. In particular, `new DOMException()` fails in Edge.
    }
  }
  if (!error) {
    // TODO(dvoytenko): remove typecast once externs are fixed.
    const constr = /** @type {function(new:DOMException, string)} */ (
        Error);
    error = new constr(message);
    error.name = ABORT_ERR_NAME;
    error.code = ABORT_ERR_CODE;
  }
  return error;
}


/**
 * Resolves the activity result as a promise:
 *  - `OK` result is yielded as the promise's payload;
 *  - `CANCEL` result is rejected with the `AbortError`;
 *  - `FAILED` result is rejected with the embedded error.
 *
 * @param {!Window} win
 * @param {!ActivityResult} result
 * @param {function((!ActivityResult|!Promise))} resolver
 */
function resolveResult(win, result, resolver) {
  if (result.ok) {
    resolver(result);
  } else {
    const error = result.error || createAbortError(win);
    error.activityResult = result;
    resolver(Promise.reject(error));
  }
}


/**
 * @param {!Window} win
 * @return {boolean}
 */
function isIeBrowser(win) {
  // MSIE and Trident are typical user agents for IE browsers.
  const nav = win.navigator;
  return /Trident|MSIE|IEMobile/i.test(nav && nav.userAgent);
}


/**
 * @param {!Window} win
 * @return {boolean}
 */
function isEdgeBrowser(win) {
  const nav = win.navigator;
  return /Edge/i.test(nav && nav.userAgent);
}


/**
 * @param {!Error} e
 */
function throwAsync(e) {
  setTimeout(() => {throw e;});
}


/**
 * Polyfill of the `Node.isConnected` API. See
 * https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected.
 * @param {!Node} node
 * @return {boolean}
 */
function isNodeConnected(node) {
  // Ensure that node is attached if specified. This check uses a new and
  // fast `isConnected` API and thus only checked on platforms that have it.
  // See https://www.chromestatus.com/feature/5676110549352448.
  if ('isConnected' in node) {
    return node['isConnected'];
  }
  // Polyfill.
  const root = node.ownerDocument && node.ownerDocument.documentElement;
  return (root && root.contains(node)) || false;
}



const SENTINEL = '__ACTIVITIES__';


/**
 * The messenger helper for activity's port and host.
 */
class Messenger {

  /**
   * @param {!Window} win
   * @param {!Window|function():?Window} targetOrCallback
   * @param {?string} targetOrigin
   * @param {boolean} requireTarget
   */
  constructor(win, targetOrCallback, targetOrigin, requireTarget) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Window|function():?Window} */
    this.targetOrCallback_ = targetOrCallback;

    /**
     * May start as unknown (`null`) until received in the first message.
     * @private {?string}
     */
    this.targetOrigin_ = targetOrigin;

    /** @private @const {boolean} */
    this.requireTarget_ = requireTarget;

    /** @private {?Window} */
    this.target_ = null;

    /** @private {boolean} */
    this.acceptsChannel_ = false;

    /** @private {?MessagePort} */
    this.port_ = null;

    /** @private {?function(string, ?Object)} */
    this.onCommand_ = null;

    /** @private {?function(!Object)} */
    this.onCustomMessage_ = null;

    /**
     * @private {?Object<string, !ChannelHolder>}
     */
    this.channels_ = null;

    /** @private @const */
    this.boundHandleEvent_ = this.handleEvent_.bind(this);
  }

  /**
   * Connect the port to the host or vice versa.
   * @param {function(string, ?Object)} onCommand
   */
  connect(onCommand) {
    if (this.onCommand_) {
      throw new Error('already connected');
    }
    this.onCommand_ = onCommand;
    this.win_.addEventListener('message', this.boundHandleEvent_);
  }

  /**
   * Disconnect messenger.
   */
  disconnect() {
    if (this.onCommand_) {
      this.onCommand_ = null;
      if (this.port_) {
        closePort(this.port_);
        this.port_ = null;
      }
      this.win_.removeEventListener('message', this.boundHandleEvent_);
      if (this.channels_) {
        for (const k in this.channels_) {
          const channelObj = this.channels_[k];
          if (channelObj.port1) {
            closePort(channelObj.port1);
          }
          if (channelObj.port2) {
            closePort(channelObj.port2);
          }
        }
        this.channels_ = null;
      }
    }
  }

  /**
   * Returns whether the messenger has been connected already.
   * @return {boolean}
   */
  isConnected() {
    return this.targetOrigin_ != null;
  }

  /**
   * Returns the messaging target. Only available when connection has been
   * establihsed.
   * @return {!Window}
   */
  getTarget() {
    const target = this.getOptionalTarget_();
    if (!target) {
      throw new Error('not connected');
    }
    return target;
  }

  /**
   * @return {?Window}
   * @private
   */
  getOptionalTarget_() {
    if (this.onCommand_ && !this.target_) {
      if (typeof this.targetOrCallback_ == 'function') {
        this.target_ = this.targetOrCallback_();
      } else {
        this.target_ = /** @type {!Window} */ (this.targetOrCallback_);
      }
    }
    return this.target_;
  }

  /**
   * Returns the messaging origin. Only available when connection has been
   * establihsed.
   * @return {string}
   */
  getTargetOrigin() {
    if (this.targetOrigin_ == null) {
      throw new Error('not connected');
    }
    return this.targetOrigin_;
  }

  /**
   * The host sends this message to the client to indicate that it's ready to
   * start communicating. The client is expected to respond back with the
   * "start" command. See `sendStartCommand` method.
   */
  sendConnectCommand() {
    // TODO(dvoytenko): MessageChannel is critically necessary for IE/Edge,
    // since window messaging doesn't always work. It's also preferred as an API
    // for other browsers: it's newer, cleaner and arguably more secure.
    // Unfortunately, browsers currently do not propagate user gestures via
    // MessageChannel, only via window messaging. This should be re-enabled
    // once browsers fix user gesture propagation.
    // See:
    // Safari: https://bugs.webkit.org/show_bug.cgi?id=186593
    // Chrome: https://bugs.chromium.org/p/chromium/issues/detail?id=851493
    // Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1469422
    const acceptsChannel = isIeBrowser(this.win_) || isEdgeBrowser(this.win_);
    this.sendCommand('connect', {'acceptsChannel': acceptsChannel});
  }

  /**
   * The client sends this message to the host upon receiving the "connect"
   * message to start the main communication channel. As a payload, the message
   * will contain the provided start arguments.
   * @param {?Object} args
   */
  sendStartCommand(args) {
    let channel = null;
    if (this.acceptsChannel_ && typeof this.win_.MessageChannel == 'function') {
      channel = new this.win_.MessageChannel();
    }
    if (channel) {
      this.sendCommand('start', args, [channel.port2]);
      // It's critical to switch to port messaging only after "start" has been
      // sent. Otherwise, it won't be delivered.
      this.switchToChannel_(channel.port1);
    } else {
      this.sendCommand('start', args);
    }
  }

  /**
   * Sends the specified command from the port to the host or vice versa.
   * @param {string} cmd
   * @param {?Object=} opt_payload
   * @param {?Array=} opt_transfer
   */
  sendCommand(cmd, opt_payload, opt_transfer) {
    const data = {
      'sentinel': SENTINEL,
      'cmd': cmd,
      'payload': opt_payload || null,
    };
    if (this.port_) {
      this.port_.postMessage(data, opt_transfer || undefined);
    } else {
      const target = this.getTarget();
      // Only "connect" command is allowed to use `targetOrigin == '*'`
      const targetOrigin =
          cmd == 'connect' ?
          (this.targetOrigin_ != null ? this.targetOrigin_ : '*') :
          this.getTargetOrigin();
      target.postMessage(data, targetOrigin, opt_transfer || undefined);
    }
  }

  /**
   * Sends a message to the client.
   * @param {!Object} payload
   */
  customMessage(payload) {
    this.sendCommand('msg', payload);
  }

  /**
   * Registers a callback to receive messages from the client.
   * @param {function(!Object)} callback
   */
  onCustomMessage(callback) {
    this.onCustomMessage_ = callback;
  }

  /**
   * @param {string=} opt_name
   * @return {!Promise<!MessagePort>}
   */
  startChannel(opt_name) {
    const name = opt_name || '';
    const channelObj = this.getChannelObj_(name);
    if (!channelObj.port1) {
      const channel = new this.win_.MessageChannel();
      channelObj.port1 = channel.port1;
      channelObj.port2 = channel.port2;
      channelObj.resolver(channelObj.port1);
    }
    if (channelObj.port2) {
      // Not yet sent.
      this.sendCommand('cnset', {'name': name}, [channelObj.port2]);
      channelObj.port2 = null;
    }
    return channelObj.promise;
  }

  /**
   * @param {string=} opt_name
   * @return {!Promise<!MessagePort>}
   */
  askChannel(opt_name) {
    const name = opt_name || '';
    const channelObj = this.getChannelObj_(name);
    if (!channelObj.port1) {
      this.sendCommand('cnget', {'name': name});
    }
    return channelObj.promise;
  }

  /**
   * @param {string} name
   * @param {!MessagePort} port
   * @private
   */
  receiveChannel_(name, port) {
    const channelObj = this.getChannelObj_(name);
    channelObj.port1 = port;
    channelObj.resolver(port);
  }

  /**
   * @param {string} name
   * @return {!ChannelHolder}
   */
  getChannelObj_(name) {
    if (!this.channels_) {
      this.channels_ = {};
    }
    let channelObj = this.channels_[name];
    if (!channelObj) {
      let resolver;
      const promise = new Promise(resolve => {
        resolver = resolve;
      });
      channelObj = {
        port1: null,
        port2: null,
        resolver,
        promise,
      };
      this.channels_[name] = channelObj;
    }
    return channelObj;
  }

  /**
   * @param {!MessagePort} port
   * @private
   */
  switchToChannel_(port) {
    if (this.port_) {
      closePort(this.port_);
    }
    this.port_ = port;
    this.port_.onmessage = event => {
      const data = event.data;
      const cmd = data && data['cmd'];
      const payload = data && data['payload'] || null;
      if (cmd) {
        this.handleCommand_(cmd, payload, event);
      }
    };
    // Even though all messaging will switch to ports, the window-based message
    // listener will be preserved just in case the host is refreshed and needs
    // another connection.
  }

  /**
   * @param {!MessageEvent} event
   * @private
   */
  handleEvent_(event) {
    if (this.requireTarget_ && this.getOptionalTarget_() != event.source) {
      // When target is required, confirm it against the event.source. This
      // is normally only needed for ports where a single window can include
      // multiple iframes to match the event to a specific iframe. Otherwise,
      // the origin checks below are sufficient.
      return;
    }
    const data = event.data;
    if (!data || data['sentinel'] != SENTINEL) {
      return;
    }
    const cmd = data['cmd'];
    if (this.port_ && cmd != 'connect' && cmd != 'start') {
      // Messaging channel has already taken over. However, the "connect" and
      // "start" commands are allowed to proceed in case re-connection is
      // requested.
      return;
    }
    const origin = /** @type {string} */ (event.origin);
    const payload = data['payload'] || null;
    if (this.targetOrigin_ == null && cmd == 'start') {
      this.targetOrigin_ = origin;
    }
    if (this.targetOrigin_ == null && event.source) {
      if (this.getOptionalTarget_() == event.source) {
        this.targetOrigin_ = origin;
      }
    }
    // Notice that event.source may differ from the target because of
    // friendly-iframe intermediaries.
    if (origin != this.targetOrigin_) {
      return;
    }
    this.handleCommand_(cmd, payload, event);
  }

  /**
   * @param {string} cmd
   * @param {?Object} payload
   * @param {!MessageEvent} event
   * @private
   */
  handleCommand_(cmd, payload, event) {
    if (cmd == 'connect') {
      if (this.port_) {
        // In case the port has already been open - close it to reopen it
        // again later.
        closePort(this.port_);
        this.port_ = null;
      }
      this.acceptsChannel_ = payload && payload['acceptsChannel'] || false;
      this.onCommand_(cmd, payload);
    } else if (cmd == 'start') {
      const port = event.ports && event.ports[0];
      if (port) {
        this.switchToChannel_(port);
      }
      this.onCommand_(cmd, payload);
    } else if (cmd == 'msg') {
      if (this.onCustomMessage_ != null && payload != null) {
        this.onCustomMessage_(payload);
      }
    } else if (cmd == 'cnget') {
      const name = payload['name'];
      this.startChannel(name);
    } else if (cmd == 'cnset') {
      const name = payload['name'];
      const port = event.ports[0];
      this.receiveChannel_(name, /** @type {!MessagePort} */ (port));
    } else {
      this.onCommand_(cmd, payload);
    }
  }
}


/**
 * @param {!MessagePort} port
 */
function closePort(port) {
  try {
    port.close();
  } catch (e) {
    // Ignore.
  }
}




/**
 * The `ActivityPort` implementation for the iframe case. Unlike other types
 * of activities, iframe-based activities are always connected and can react
 * to size requests.
 *
 * @implements {ActivityPort}
 * @implements {ActivityMessagingPort}
 */
class ActivityIframePort {

  /**
   * @param {!HTMLIFrameElement} iframe
   * @param {string} url
   * @param {?Object=} opt_args
   */
  constructor(iframe, url, opt_args) {
    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ = iframe;
    /** @private @const {string} */
    this.url_ = url;
    /** @private @const {?Object} */
    this.args_ = opt_args || null;

    /** @private @const {!Window} */
    this.win_ = /** @type {!Window} */ (this.iframe_.ownerDocument.defaultView);

    /** @private @const {string} */
    this.targetOrigin_ = getOriginFromUrl(url);

    /** @private {boolean} */
    this.connected_ = false;

    /** @private {?function()} */
    this.connectedResolver_ = null;

    /** @private @const {!Promise} */
    this.connectedPromise_ = new Promise(resolve => {
      this.connectedResolver_ = resolve;
    });

    /** @private {?function()} */
    this.readyResolver_ = null;

    /** @private @const {!Promise} */
    this.readyPromise_ = new Promise(resolve => {
      this.readyResolver_ = resolve;
    });

    /** @private {?function((!ActivityResult|!Promise))} */
    this.resultResolver_ = null;

    /** @private @const {!Promise<!ActivityResult>} */
    this.resultPromise_ = new Promise(resolve => {
      this.resultResolver_ = resolve;
    });

    /** @private {?function(number)} */
    this.onResizeRequest_ = null;

    /** @private {?number} */
    this.requestedHeight_ = null;

    /** @private @const {!Messenger} */
    this.messenger_ = new Messenger(
        this.win_,
        () => this.iframe_.contentWindow,
        this.targetOrigin_,
        /* requireTarget */ true);
  }

  /** @override */
  getMode() {
    return ActivityMode.IFRAME;
  }

  /**
   * Waits until the activity port is connected to the host.
   * @return {!Promise}
   */
  connect() {
    if (!isNodeConnected(this.iframe_)) {
      throw new Error('iframe must be in DOM');
    }
    this.messenger_.connect(this.handleCommand_.bind(this));
    this.iframe_.src = this.url_;
    return this.connectedPromise_;
  }

  /**
   * Disconnect the activity binding and cleanup listeners.
   */
  disconnect() {
    this.connected_ = false;
    this.messenger_.disconnect();
  }

  /** @override */
  acceptResult() {
    return this.resultPromise_;
  }

  /** @override */
  getTargetWin() {
    return this.iframe_.contentWindow || null;
  }

  /** @override */
  message(payload) {
    this.messenger_.customMessage(payload);
  }

  /** @override */
  onMessage(callback) {
    this.messenger_.onCustomMessage(callback);
  }

  /** @override */
  messageChannel(opt_name) {
    return this.messenger_.askChannel(opt_name);
  }

  /**
   * Returns a promise that yields when the iframe is ready to be interacted
   * with.
   * @return {!Promise}
   */
  whenReady() {
    return this.readyPromise_;
  }

  /**
   * Register a callback to handle resize requests. Once successfully resized,
   * ensure to call `resized()` method.
   * @param {function(number)} callback
   */
  onResizeRequest(callback) {
    this.onResizeRequest_ = callback;
    Promise.resolve().then(() => {
      if (this.requestedHeight_ != null) {
        callback(this.requestedHeight_);
      }
    });
  }

  /**
   * Signals back to the activity implementation that the client has updated
   * the activity's size.
   */
  resized() {
    if (!this.connected_) {
      return;
    }
    const height = this.iframe_.offsetHeight;
    this.messenger_.sendCommand('resized', {'height': height});
  }

  /**
   * @param {string} cmd
   * @param {?Object} payload
   * @private
   */
  handleCommand_(cmd, payload) {
    if (cmd == 'connect') {
      // First ever message. Indicates that the receiver is listening.
      this.connected_ = true;
      this.messenger_.sendStartCommand(this.args_);
      this.connectedResolver_();
    } else if (cmd == 'result') {
      // The last message. Indicates that the result has been received.
      if (this.resultResolver_) {
        const code = /** @type {!ActivityResultCode} */ (payload['code']);
        const data =
            code == ActivityResultCode.FAILED ?
            new Error(payload['data'] || '') :
            payload['data'];
        const result = new ActivityResult(
            code,
            data,
            ActivityMode.IFRAME,
            this.messenger_.getTargetOrigin(),
            /* originVerified */ true,
            /* secureChannel */ true);
        resolveResult(this.win_, result, this.resultResolver_);
        this.resultResolver_ = null;
        this.messenger_.sendCommand('close');
        this.disconnect();
      }
    } else if (cmd == 'ready') {
      if (this.readyResolver_) {
        this.readyResolver_();
        this.readyResolver_ = null;
      }
    } else if (cmd == 'resize') {
      this.requestedHeight_ = /** @type {number} */ (payload['height']);
      if (this.onResizeRequest_) {
        this.onResizeRequest_(this.requestedHeight_);
      }
    }
  }
}




/**
 * The `ActivityPort` implementation for the standalone window activity
 * client executed as a popup.
 *
 * @implements {ActivityPort}
 * @implements {ActivityMessagingPort}
 */
class ActivityWindowPort {

  /**
   * @param {!Window} win
   * @param {string} requestId
   * @param {string} url
   * @param {string} target
   * @param {?Object=} opt_args
   * @param {?ActivityOpenOptions=} opt_options
   */
  constructor(win, requestId, url, target, opt_args, opt_options) {
    const isValidTarget =
        target &&
        (target == '_blank' || target == '_top' || target[0] != '_');
    if (!isValidTarget) {
      throw new Error('The only allowed targets are "_blank", "_top"' +
          ' and name targets');
    }

    /** @private @const {!Window} */
    this.win_ = win;
    /** @private @const {string} */
    this.requestId_ = requestId;
    /** @private @const {string} */
    this.url_ = url;
    /** @private @const {string} */
    this.openTarget_ = target;
    /** @private @const {?Object} */
    this.args_ = opt_args || null;
    /** @private @const {!ActivityOpenOptions} */
    this.options_ = opt_options || {};

    /** @private {?function()} */
    this.connectedResolver_ = null;

    /** @private @const {!Promise} */
    this.connectedPromise_ = new Promise(resolve => {
      this.connectedResolver_ = resolve;
    });

    /** @private {?function((!ActivityResult|!Promise))} */
    this.resultResolver_ = null;

    /** @private @const {!Promise<!ActivityResult>} */
    this.resultPromise_ = new Promise(resolve => {
      this.resultResolver_ = resolve;
    });

    /** @private {?Window} */
    this.targetWin_ = null;

    /** @private {?number} */
    this.heartbeatInterval_ = null;

    /** @private {?Messenger} */
    this.messenger_ = null;
  }

  /** @override */
  getMode() {
    return this.openTarget_ == '_top' ?
        ActivityMode.REDIRECT :
        ActivityMode.POPUP;
  }

  /**
   * Opens the activity in a window, either as a popup or via redirect.
   *
   * Returns the promise that will yield when the window returns or closed.
   * Notice, that this promise may never complete if "redirect" mode was used.
   *
   * @return {!Promise}
   */
  open() {
    return this.openInternal_();
  }

  /**
   * Waits until the activity port is connected to the host.
   * @return {!Promise}
   */
  whenConnected() {
    return this.connectedPromise_;
  }

  /**
   * Disconnect the activity binding and cleanup listeners.
   */
  disconnect() {
    if (this.heartbeatInterval_) {
      this.win_.clearInterval(this.heartbeatInterval_);
      this.heartbeatInterval_ = null;
    }
    if (this.messenger_) {
      this.messenger_.disconnect();
      this.messenger_ = null;
    }
    if (this.targetWin_) {
      // Try to close the popup window. The host will also try to do the same.
      try {
        this.targetWin_.close();
      } catch (e) {
        // Ignore.
      }
      this.targetWin_ = null;
    }
    this.resultResolver_ = null;
  }

  /** @override */
  getTargetWin() {
    return this.targetWin_;
  }

  /** @override */
  acceptResult() {
    return this.resultPromise_;
  }

  /**
   * Sends a message to the host.
   * Whether the host can or cannot receive a message depends on the type of
   * host and its state. Ensure that the code has an alternative path if
   * messaging is not available.
   * @override
   */
  message(payload) {
    this.messenger_.customMessage(payload);
  }

  /**
   * Registers a callback to receive messages from the host.
   * Whether the host can or cannot receive a message depends on the type of
   * host and its state. Ensure that the code has an alternative path if
   * messaging is not available.
   * @override
   */
  onMessage(callback) {
    this.messenger_.onCustomMessage(callback);
  }

  /**
   * Creates a new communication channel or returns an existing one.
   * Whether the host can or cannot receive a message depends on the type of
   * host and its state. Ensure that the code has an alternative path if
   * messaging is not available.
   * @override
   */
  messageChannel(opt_name) {
    return this.messenger_.askChannel(opt_name);
  }

  /**
   * This method wraps around window's open method. It first tries to execute
   * `open` call with the provided target and if it fails, it retries the call
   * with the `_top` target. This is necessary given that in some embedding
   * scenarios, such as iOS' WKWebView, navigation to `_blank` and other targets
   * is blocked by default.
   * @return {!Promise}
   * @private
   */
  openInternal_() {
    const featuresStr = this.buildFeatures_();

    // Protectively, the URL will contain the request payload, unless explicitly
    // directed not to via `skipRequestInUrl` option.
    let url = this.url_;
    if (!this.options_.skipRequestInUrl) {
      const returnUrl =
          this.options_.returnUrl ||
          removeFragment(this.win_.location.href);
      const requestString = serializeRequest({
        requestId: this.requestId_,
        returnUrl,
        args: this.args_,
      });
      url = addFragmentParam(url, '__WA__', requestString);
    }

    // Open the window.
    let targetWin;
    let openTarget = this.openTarget_;
    // IE does not support CORS popups - the popup has to fallback to redirect
    // mode.
    if (openTarget != '_top') {
      if (isIeBrowser(this.win_)) {
        openTarget = '_top';
      }
    }
    // Try first with the specified target. If we're inside the WKWebView or
    // a similar environments, this method is expected to fail by default for
    // all targets except `_top`.
    try {
      targetWin = this.win_.open(url, openTarget, featuresStr);
    } catch (e) {
      // Ignore.
    }
    // Then try with `_top` target.
    if (!targetWin &&
        openTarget != '_top' &&
        !this.options_.disableRedirectFallback) {
      openTarget = '_top';
      try {
        targetWin = this.win_.open(url, openTarget);
      } catch (e) {
        // Ignore.
      }
    }

    // Setup the target window.
    if (targetWin) {
      this.targetWin_ = targetWin;
      if (openTarget != '_top') {
        this.setupPopup_();
      }
    } else {
      this.disconnectWithError_(new Error('failed to open window'));
    }

    // Return result promise, even though it may never complete.
    return this.resultPromise_.catch(() => {
      // Ignore. Call to the `acceptResult()` should fail if needed.
    });
  }

  /**
   * @return {string}
   * @private
   */
  buildFeatures_() {
    // The max width and heights are calculated as following:
    // MaxSize = AvailSize - ControlsSize
    // ControlsSize = OuterSize - InnerSize
    const screen = this.win_.screen;
    const availWidth = screen.availWidth || screen.width;
    const availHeight = screen.availHeight || screen.height;
    const isTop = this.isTopWindow_();
    const isEdge = isEdgeBrowser(this.win_);
    // Limit controls to 100px width and height. Notice that it's only
    // possible to calculate controls size in the top window, not in iframes.
    // Notice that the Edge behavior is somewhat unique. If we can't find the
    // right width/height, it will launch in the full-screen. Other browsers
    // deal with such cases more gracefully.
    const controlsWidth =
        isTop && this.win_.outerWidth > this.win_.innerWidth ?
        Math.min(100, this.win_.outerWidth - this.win_.innerWidth) :
        (isEdge ? 100 : 0);
    const controlsHeight =
        isTop && this.win_.outerHeight > this.win_.innerHeight ?
        Math.min(100, this.win_.outerHeight - this.win_.innerHeight) :
        (isEdge ? 100 : 0);
    // With all the adjustments, at least 50% of the available width/height
    // should be made available to a popup.
    const maxWidth = Math.max(availWidth - controlsWidth, availWidth * 0.5);
    const maxHeight = Math.max(availHeight - controlsHeight, availHeight * 0.5);
    let w = Math.floor(Math.min(600, maxWidth * 0.9));
    let h = Math.floor(Math.min(600, maxHeight * 0.9));
    if (this.options_.width) {
      w = Math.min(this.options_.width, maxWidth);
    }
    if (this.options_.height) {
      h = Math.min(this.options_.height, maxHeight);
    }
    const x = Math.floor((screen.width - w) / 2);
    const y = Math.floor((screen.height - h) / 2);
    const features = {
      'height': h,
      'width': w,
      'resizable': 'yes',
      'scrollbars': 'yes',
    };
    // Do not set left/top in Edge: it fails.
    if (!isEdge) {
      features['left'] = x;
      features['top'] = y;
    }
    let featuresStr = '';
    for (const f in features) {
      if (featuresStr) {
        featuresStr += ',';
      }
      featuresStr += `${f}=${features[f]}`;
    }
    return featuresStr;
  }

  /**
   * This method only exists to make iframe/top emulation possible in tests.
   * Otherwise `window.top` cannot be overridden.
   * @return {boolean}
   * @private
   */
  isTopWindow_() {
    return this.win_ == this.win_.top;
  }

  /** @private */
  setupPopup_() {
    // Keep alive to catch the window closing, which would indicate
    // "cancel" signal.
    this.heartbeatInterval_ = this.win_.setInterval(() => {
      this.check_(/* delayCancel */ true);
    }, 500);

    // Start up messaging. The messaging is explicitly allowed to proceed
    // without origin check b/c all arguments have already been passed in
    // the URL and special handling is enforced when result is delivered.
    this.messenger_ = new Messenger(
        this.win_,
        /** @type {!Window} */ (this.targetWin_),
        /* targetOrigin */ null,
        /* requireTarget */ true);
    this.messenger_.connect(this.handleCommand_.bind(this));
  }

  /**
   * @param {boolean=} opt_delayCancel
   * @private
   */
  check_(opt_delayCancel) {
    if (!this.targetWin_ || this.targetWin_.closed) {
      if (this.heartbeatInterval_) {
        this.win_.clearInterval(this.heartbeatInterval_);
        this.heartbeatInterval_ = null;
      }
      // Give a chance for the result to arrive, but otherwise consider the
      // responce to be empty.
      this.win_.setTimeout(() => {
        try {
          this.result_(ActivityResultCode.CANCELED, /* data */ null);
        } catch (e) {
          this.disconnectWithError_(e);
        }
      }, opt_delayCancel ? 3000 : 0);
    }
  }

  /**
   * @param {!Error} reason
   * @private
   */
  disconnectWithError_(reason) {
    if (this.resultResolver_) {
      this.resultResolver_(Promise.reject(reason));
    }
    this.disconnect();
  }

  /**
   * @param {!ActivityResultCode} code
   * @param {*} data
   * @private
   */
  result_(code, data) {
    if (this.resultResolver_) {
      const isConnected = this.messenger_.isConnected();
      const result = new ActivityResult(
          code,
          data,
          ActivityMode.POPUP,
          isConnected ?
              this.messenger_.getTargetOrigin() :
              getOriginFromUrl(this.url_),
          /* originVerified */ isConnected,
          /* secureChannel */ isConnected);
      resolveResult(this.win_, result, this.resultResolver_);
      this.resultResolver_ = null;
    }
    if (this.messenger_) {
      this.messenger_.sendCommand('close');
    }
    this.disconnect();
  }

  /**
   * @param {string} cmd
   * @param {?Object} payload
   * @private
   */
  handleCommand_(cmd, payload) {
    if (cmd == 'connect') {
      // First ever message. Indicates that the receiver is listening.
      this.messenger_.sendStartCommand(this.args_);
      this.connectedResolver_();
    } else if (cmd == 'result') {
      // The last message. Indicates that the result has been received.
      const code = /** @type {!ActivityResultCode} */ (payload['code']);
      const data =
          code == ActivityResultCode.FAILED ?
          new Error(payload['data'] || '') :
          payload['data'];
      this.result_(code, data);
    } else if (cmd == 'check') {
      this.win_.setTimeout(() => this.check_(), 200);
    }
  }
}


/**
 * @param {!Window} win
 * @param {string} fragment
 * @param {string} requestId
 * @return {?ActivityPort}
 */
function discoverRedirectPort(win, fragment, requestId) {
  // Try to find the result in the fragment.
  const paramName = '__WA_RES__';
  const fragmentParam = getQueryParam(fragment, paramName);
  if (!fragmentParam) {
    return null;
  }
  const response = /** @type {?Object} */ (JSON.parse(fragmentParam));
  if (!response || response['requestId'] != requestId) {
    return null;
  }

  // Remove the found param from the fragment.
  const cleanFragment = removeQueryParam(win.location.hash, paramName) || '';
  if (cleanFragment != win.location.hash) {
    if (win.history && win.history.replaceState) {
      try {
        win.history.replaceState(win.history.state, '', cleanFragment);
      } catch (e) {
        // Ignore.
      }
    }
  }

  const code = response['code'];
  const data = response['data'];
  const origin = response['origin'];
  const referrerOrigin = win.document.referrer &&
      getOriginFromUrl(win.document.referrer);
  const originVerified = origin == referrerOrigin;
  return new ActivityWindowRedirectPort(
      win,
      code,
      data,
      origin,
      originVerified);
}


/**
 * The `ActivityPort` implementation for the standalone window activity
 * client executed as a popup.
 *
 * @implements {ActivityPort}
 */
class ActivityWindowRedirectPort {

  /**
   * @param {!Window} win
   * @param {!ActivityResultCode} code
   * @param {*} data
   * @param {string} targetOrigin
   * @param {boolean} targetOriginVerified
   */
  constructor(win, code, data, targetOrigin, targetOriginVerified) {
    /** @private @const {!Window} */
    this.win_ = win;
    /** @private @const {!ActivityResultCode} */
    this.code_ = code;
    /** @private @const {*} */
    this.data_ = data;
    /** @private {string} */
    this.targetOrigin_ = targetOrigin;
    /** @private {boolean} */
    this.targetOriginVerified_ = targetOriginVerified;
  }

  /** @override */
  getMode() {
    return ActivityMode.REDIRECT;
  }

  /** @override */
  acceptResult() {
    const result = new ActivityResult(
        this.code_,
        this.data_,
        ActivityMode.REDIRECT,
        this.targetOrigin_,
        this.targetOriginVerified_,
        /* secureChannel */ false);
    return new Promise(resolve => {
      resolveResult(this.win_, result, resolve);
    });
  }
}




/**
 * The page-level activities manager ports. This class is intended to be used
 * as a singleton. It can start activities of all modes: iframe, popup, and
 * redirect.
 */
class ActivityPorts {

  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {string} */
    this.version = '1.24';

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {string} */
    this.fragment_ = win.location.hash;

    /**
     * @private @const {!Object<string, !Array<function(!ActivityPort)>>}
     */
    this.requestHandlers_ = {};

    /**
     * The result buffer is indexed by `requestId`.
     * @private @const {!Object<string, !ActivityPort>}
     */
    this.resultBuffer_ = {};

    /** @private {?function(!Error)} */
    this.redirectErrorResolver_ = null;

    /** @private {!Promise<!Error>} */
    this.redirectErrorPromise_ = new Promise(resolve => {
      this.redirectErrorResolver_ = resolve;
    });
  }

  /**
   * Start an activity within the specified iframe.
   * @param {!HTMLIFrameElement} iframe
   * @param {string} url
   * @param {?Object=} opt_args
   * @return {!Promise<!ActivityIframePort>}
   */
  openIframe(iframe, url, opt_args) {
    const port = new ActivityIframePort(iframe, url, opt_args);
    return port.connect().then(() => port);
  }

  /**
   * Start an activity in a separate window. The result will be delivered
   * to the `onResult` callback.
   *
   * The activity can be opened in two modes: "popup" and "redirect". This
   * depends on the `target` value, but also on the browser/environment.
   *
   * The allowed `target` values are `_blank`, `_top` and name targets. The
   * `_self`, `_parent` and similar targets are not allowed.
   *
   * The `_top` target indicates that the activity should be opened as a
   * "redirect", while other targets indicate that the activity should be
   * opened as a popup. The activity client will try to honor the requested
   * target. However, it's not always possible. Some environments do not
   * allow popups and they either force redirect or fail the window open
   * request. In this case, the activity will try to fallback to the "redirect"
   * mode.
   *
   * @param {string} requestId
   * @param {string} url
   * @param {string} target
   * @param {?Object=} opt_args
   * @param {?ActivityOpenOptions=} opt_options
   * @return {{targetWin: ?Window}}
   */
  open(requestId, url, target, opt_args, opt_options) {
    const port = this.openWin_(requestId, url, target, opt_args, opt_options);
    return {targetWin: port.getTargetWin()};
  }

  /**
   * Start an activity in a separate window and tries to setup messaging with
   * this window.
   *
   * See `open()` method for more details, including `onResult` callback.
   *
   * @param {string} requestId
   * @param {string} url
   * @param {string} target
   * @param {?Object=} opt_args
   * @param {?ActivityOpenOptions=} opt_options
   * @return {!Promise<!ActivityMessagingPort>}
   */
  openWithMessaging(requestId, url, target, opt_args, opt_options) {
    const port = this.openWin_(requestId, url, target, opt_args, opt_options);
    return port.whenConnected().then(() => port);
  }

  /**
   * Registers the callback for the result of the activity opened with the
   * specified `requestId` (see the `open()` method). The callback is a
   * function that takes a single `ActivityPort` argument. The client
   * can use this object to verify the port using it's origin, verified and
   * secure channel flags. Then the client can call
   * `ActivityPort.acceptResult()` method to accept the result.
   *
   * The activity result is handled via a separate callback because of a
   * possible redirect. So use of direct callbacks and/or promises is not
   * possible in that case.
   *
   * A typical implementation would look like:
   * ```
   * ports.onResult('request1', function(port) {
   *   port.acceptResult().then(function(result) {
   *     // Only verified origins are allowed.
   *     if (result.origin == expectedOrigin &&
   *         result.originVerified &&
   *         result.secureChannel) {
   *       handleResultForRequest1(result);
   *     }
   *   });
   * })
   *
   * ports.open('request1', request1Url, '_blank');
   * ```
   *
   * @param {string} requestId
   * @param {function(!ActivityPort)} callback
   */
  onResult(requestId, callback) {
    let handlers = this.requestHandlers_[requestId];
    if (!handlers) {
      handlers = [];
      this.requestHandlers_[requestId] = handlers;
    }
    handlers.push(callback);

    // Consume available result.
    const availableResult = this.discoverResult_(requestId);
    if (availableResult) {
      this.consumeResult_(availableResult, callback);
    }
  }

  /**
   * @param {function(!Error)} handler
   */
  onRedirectError(handler) {
    this.redirectErrorPromise_.then(handler);
  }

  /**
   * @param {string} requestId
   * @param {string} url
   * @param {string} target
   * @param {?Object=} opt_args
   * @param {?ActivityOpenOptions=} opt_options
   * @return {!ActivityWindowPort}
   */
  openWin_(requestId, url, target, opt_args, opt_options) {
    const port = new ActivityWindowPort(
        this.win_, requestId, url, target, opt_args, opt_options);
    port.open().then(() => {
      // Await result if possible. Notice that when falling back to "redirect",
      // the result will never arrive through this port.
      this.consumeResultAll_(requestId, port);
    });
    return port;
  }

  /**
   * @param {string} requestId
   * @return {?ActivityPort}
   * @private
   */
  discoverResult_(requestId) {
    let port = this.resultBuffer_[requestId];
    if (!port && this.fragment_) {
      try {
        port = discoverRedirectPort(
            this.win_, this.fragment_, requestId);
      } catch (e) {
        throwAsync(e);
        this.redirectErrorResolver_(e);
      }
      if (port) {
        this.resultBuffer_[requestId] = port;
      }
    }
    return port;
  }

  /**
   * @param {!ActivityPort} port
   * @param {function(!ActivityPort)} callback
   * @private
   */
  consumeResult_(port, callback) {
    Promise.resolve().then(() => {
      callback(port);
    });
  }

  /**
   * @param {string} requestId
   * @param {!ActivityPort} port
   * @private
   */
  consumeResultAll_(requestId, port) {
    // Find and execute handlers.
    const handlers = this.requestHandlers_[requestId];
    if (handlers) {
      handlers.forEach(handler => {
        this.consumeResult_(port, handler);
      });
    }
    // Buffer the result for callbacks that may arrive in the future.
    this.resultBuffer_[requestId] = port;
  }
}



var activityPorts = {
  ActivityPorts,
  ActivityIframePort,
  ActivityMessagingPort,
  ActivityMode,
  ActivityOpenOptions,
  ActivityPort,
  ActivityRequest,
  ActivityResult,
  ActivityResultCode,
  ActivityWindowPort,
  createAbortError,
  isAbortError,
};
var activityPorts_1 = activityPorts.ActivityPorts;
var activityPorts_2 = activityPorts.ActivityIframePort;
var activityPorts_11 = activityPorts.createAbortError;
var activityPorts_12 = activityPorts.isAbortError;

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

/**
 * Whether the specified error is an AbortError type.
 * See https://heycam.github.io/webidl/#aborterror.
 * @param {*} error
 * @return {boolean}
 */
function isCancelError(error) {
  return activityPorts_12(error);
}

/**
 * Creates or emulates a DOMException of AbortError type.
 * See https://heycam.github.io/webidl/#aborterror.
 * @param {!Window} win
 * @param {string=} message
 * @return {!DOMException}
 */
function createCancelError(win, message) {
  return activityPorts_11(win, message);
}

/**
 * A set of error utilities combined in a class to allow easy stubbing in tests.
 */
class ErrorUtils {
  /**
   * @param {!Error} error
   */
  static throwAsync(error) {
    setTimeout(() => {
      throw error;
    });
  }
}

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

/** @const {!Object<string, string>} */
const iframeAttributes = {
  'frameborder': '0',
  'scrolling': 'no',
};

/**
 * Class to build and render Activity iframe view.
 */
class ActivityIframeView extends View {
  /**
   * @param {!Window} win
   * @param {!../components/activities.ActivityPorts} activityPorts
   * @param {string} src
   * @param {!Object<string, ?>=} args
   * @param {boolean=} shouldFadeBody
   * @param {boolean=} hasLoadingIndicator
   */
  constructor(
    win,
    activityPorts,
    src,
    args,
    shouldFadeBody = false,
    hasLoadingIndicator = false
  ) {
    super();

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Document} */
    this.doc_ = this.win_.document;

    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ = /** @type {!HTMLIFrameElement} */ (createElement(
      this.doc_,
      'iframe',
      iframeAttributes
    ));

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = activityPorts;

    /** @private @const {string} */
    this.src_ = src;

    /** @private @const {!Object<string, ?>} */
    this.args_ = args || {};

    /** @private @const {boolean} */
    this.shouldFadeBody_ = shouldFadeBody;

    /** @private @const {boolean} */
    this.hasLoadingIndicator_ = hasLoadingIndicator;

    /** @private {?../components/activities.ActivityIframePort} */
    this.port_ = null;

    /**
     * @private
     * {?function<!web-activities/activity-ports.ActivityIframePort|!Promise>}
     */
    this.portResolver_ = null;

    /**
     * @private @const
     * {!Promise<!web-activities/activity-ports.ActivityIframePort>}
     */
    this.portPromise_ = new Promise((resolve) => {
      this.portResolver_ = resolve;
    });
  }

  /** @override */
  getElement() {
    return this.iframe_;
  }

  /** @override */
  init(dialog) {
    return this.activityPorts_
      .openIframe(this.iframe_, this.src_, this.args_)
      .then((port) => this.onOpenIframeResponse_(port, dialog));
  }

  /**
   * Returns if document should fade for this view.
   * @return {boolean}
   */
  shouldFadeBody() {
    return this.shouldFadeBody_;
  }

  /**
   * Returns if the view shows loading indicator.
   * @return {boolean}
   */
  hasLoadingIndicator() {
    return this.hasLoadingIndicator_;
  }

  /**
   * @param {!../components/activities.ActivityIframePort} port
   * @param {!../components/dialog.Dialog} dialog
   * @return {!Promise}
   */
  onOpenIframeResponse_(port, dialog) {
    this.port_ = port;
    this.portResolver_(port);

    this.port_.onResizeRequest((height) => {
      dialog.resizeView(this, height);
    });

    return this.port_.whenReady();
  }

  /**
   * @return {!Promise<!../components/activities.ActivityIframePort>}
   * @private
   */
  getPortPromise_() {
    return this.portPromise_;
  }

  /**
   * @param {!function(new: T)}  message
   * @param {function(../proto/api_messages.Message)} callback
   * @template T
   */
  on(message, callback) {
    this.getPortPromise_().then((port) => {
      port.on(message, callback);
    });
  }

  /**
   * @param {!../proto/api_messages.Message} request
   */
  execute(request) {
    this.getPortPromise_().then((port) => {
      port.execute(request);
    });
  }

  /**
   * Accepts results from the caller.
   * @return {!Promise<!web-activities/activity-ports.ActivityResult>}
   */
  acceptResult() {
    return this.getPortPromise_().then((port) => port.acceptResult());
  }

  /**
   * Accepts results from the caller and verifies origin.
   * @param {string} requireOrigin
   * @param {boolean} requireOriginVerified
   * @param {boolean} requireSecureChannel
   * @return {!Promise<!Object>}
   */
  acceptResultAndVerify(
    requireOrigin,
    requireOriginVerified,
    requireSecureChannel
  ) {
    return this.getPortPromise_().then((port) => {
      return acceptPortResultData(
        port,
        requireOrigin,
        requireOriginVerified,
        requireSecureChannel
      );
    });
  }

  /**
   * Completes the flow.
   * @return {!Promise}
   */
  whenComplete() {
    return this.acceptResult();
  }

  /**
   * @param {function()} callback
   */
  onCancel(callback) {
    this.acceptResult().catch((reason) => {
      if (isCancelError(reason)) {
        callback();
      }
      throw reason;
    });
  }

  /** @override */
  resized() {
    if (this.port_) {
      this.port_.resized();
    }
  }
}

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

/**
 * @fileoverview This module declares JSON types as defined in the
 * {@link http://json.org/}.
 */

/**
 * Simple wrapper around JSON.parse that casts the return value
 * to JsonObject.
 * Create a new wrapper if an array return value is desired.
 * @param {*} json JSON string to parse
 * @return {?JsonObject|undefined} May be extend to parse arrays.
 */
function parseJson(json) {
  return /** @type {?JsonObject} */ (JSON.parse(/** @type {string} */ (json)));
}

/**
 * Parses the given `json` string without throwing an exception if not valid.
 * Returns `undefined` if parsing fails.
 * Returns the `Object` corresponding to the JSON string when parsing succeeds.
 * @param {*} json JSON string to parse
 * @param {function(!Error)=} onFailed Optional function that will be called
 *     with the error if parsing fails.
 * @return {?JsonObject|undefined} May be extend to parse arrays.
 */
function tryParseJson(json, onFailed) {
  try {
    return parseJson(json);
  } catch (e) {
    if (onFailed) {
      onFailed(e);
    }
    return undefined;
  }
}

/**
 * Converts the passed string into a JSON object (if possible) and returns the
 * value of the propertyName on that object.
 * @param {string} jsonString
 * @param {string} propertyName
 * @return {*}
 */
function getPropertyFromJsonString(jsonString, propertyName) {
  const json = tryParseJson(jsonString);
  return (json && json[propertyName]) || null;
}

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

/**
 * Provides helper methods to decode and verify JWT tokens.
 */
class JwtHelper {
  constructor() {}

  /**
   * Decodes JWT token and returns its payload.
   * @param {string} encodedToken
   * @return {?JsonObject|undefined}
   */
  decode(encodedToken) {
    return this.decodeInternal_(encodedToken).payload;
  }

  /**
   * @param {string} encodedToken
   * @return {!JwtTokenInternalDef}
   * @private
   */
  decodeInternal_(encodedToken) {
    // See https://jwt.io/introduction/
    /**
     * Throws error about invalid token.
     */
    function invalidToken() {
      throw new Error(`Invalid token: "${encodedToken}"`);
    }

    // Encoded token has three parts: header.payload.sig
    // Note! The padding is not allowed by JWT spec:
    // http://self-issued.info/docs/draft-goland-json-web-token-00.html#rfc.section.5
    const parts = encodedToken.split('.');
    if (parts.length != 3) {
      invalidToken();
    }
    const headerUtf8Bytes = base64UrlDecodeToBytes(parts[0]);
    const payloadUtf8Bytes = base64UrlDecodeToBytes(parts[1]);
    return {
      header: tryParseJson(utf8DecodeSync(headerUtf8Bytes), invalidToken),
      payload: tryParseJson(utf8DecodeSync(payloadUtf8Bytes), invalidToken),
      verifiable: `${parts[0]}.${parts[1]}`,
      sig: parts[2],
    };
  }
}

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

/** Source for Google-provided metering entitlements. */
const GOOGLE_METERING_SOURCE = 'google:metering';

/**
 * The holder of the entitlements for a service.
 */
class Entitlements {
  /**
   * @param {string} service
   * @param {string} raw
   * @param {!Array<!Entitlement>} entitlements
   * @param {?string} currentProduct
   * @param {function(!Entitlements)} ackHandler
   * @param {function(!Entitlements, ?Function=)} consumeHandler
   * @param {?boolean|undefined} isReadyToPay
   * @param {?string|undefined} decryptedDocumentKey
   */
  constructor(
    service,
    raw,
    entitlements,
    currentProduct,
    ackHandler,
    consumeHandler,
    isReadyToPay,
    decryptedDocumentKey
  ) {
    /** @const {string} */
    this.service = service;
    /** @const {string} */
    this.raw = raw;
    /** @const {!Array<!Entitlement>} */
    this.entitlements = entitlements;
    /** @const {boolean} */
    this.isReadyToPay = isReadyToPay || false;
    /** @const {?string} */
    this.decryptedDocumentKey = decryptedDocumentKey || null;

    /** @private @const {?string} */
    this.product_ = currentProduct;
    /** @private @const {function(!Entitlements)} */
    this.ackHandler_ = ackHandler;
    /** @private @const {function(!Entitlements, ?Function=)} */
    this.consumeHandler_ = consumeHandler;
  }

  /**
   * @return {!Entitlements}
   */
  clone() {
    return new Entitlements(
      this.service,
      this.raw,
      this.entitlements.map((ent) => ent.clone()),
      this.product_,
      this.ackHandler_,
      this.consumeHandler_,
      this.isReadyToPay,
      this.decryptedDocumentKey
    );
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'service': this.service,
      'entitlements': this.entitlements.map((item) => item.json()),
      'isReadyToPay': this.isReadyToPay,
    };
  }

  /**
   * Returns true if the current article is unlocked by a
   * cacheable entitlement. Metering entitlements aren't cacheable,
   * because each metering entitlement is meant to be used for one article.
   * Subscription entitlements are cacheable, because subscription entitlements
   * are meant to be used across multiple articles on a publication.
   * @return {boolean}
   */
  enablesThisWithCacheableEntitlements() {
    const entitlement = this.getEntitlementForThis();
    return !!entitlement && entitlement.source !== GOOGLE_METERING_SOURCE;
  }

  /**
   * Returns true if the current article is unlocked by a
   * Google metering entitlement. These entitlements come
   * from Google News Intiative's licensing program to support news.
   * https://www.blog.google/outreach-initiatives/google-news-initiative/licensing-program-support-news-industry-/
   * @return {boolean}
   */
  enablesThisWithGoogleMetering() {
    const entitlement = this.getEntitlementForThis();
    return !!entitlement && entitlement.source === GOOGLE_METERING_SOURCE;
  }

  /**
   * @param {string=} source
   * @return {boolean}
   */
  enablesThis(source) {
    return this.enables(this.product_, source);
  }

  /**
   * @param {string=} source
   * @return {boolean}
   */
  enablesAny(source) {
    for (let i = 0; i < this.entitlements.length; i++) {
      if (
        this.entitlements[i].products.length > 0 &&
        (!source || source == this.entitlements[i].source)
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Whether these entitlements enable the specified product, optionally also
   * restricting the source.
   * @param {?string} product
   * @param {string=} source
   * @return {boolean}
   */
  enables(product, source) {
    if (!product) {
      return false;
    }
    return !!this.getEntitlementFor(product, source);
  }

  /**
   * Returns the first matching entitlement for the current product,
   * optionally also matching the specified source.
   * @param {string=} source
   * @return {?Entitlement}
   */
  getEntitlementForThis(source) {
    return this.getEntitlementFor(this.product_, source);
  }

  /**
   * Returns the first matching entitlement for the specified product,
   * optionally also matching the specified source.
   *
   * Returns non-metering entitlements if possible, to avoid consuming
   * metered reads unnecessarily.
   *
   * @param {?string} product
   * @param {string=} source
   * @return {?Entitlement}
   */
  getEntitlementFor(product, source) {
    if (!product) {
      // Require a product ID.
      log_4(
        'SwG needs this article to define a product ID (e.g. example.com:premium). Articles can define a product ID using JSON+LD. SwG can check entitlements after this article defines a product ID.'
      );
      return null;
    }

    // Prefer subscription entitlements over metering entitlements.
    // Metering entitlements are a limited resource. When a metering entitlement
    // unlocks an article, that depletes the user's remaining "free reads".
    // Subscription entitlements are *not* depleted when they unlock articles.
    // They are essentially unlimited if the subscription remains valid.
    // For this reason, subscription entitlements are preferred.
    const entitlementsThatUnlockArticle = this.entitlements.filter(
      (entitlement) =>
        entitlement.enables(product) &&
        (!source || source === entitlement.source)
    );

    const subscriptionEntitlement = findInArray(
      entitlementsThatUnlockArticle,
      (entitlement) => entitlement.source !== GOOGLE_METERING_SOURCE
    );

    const meteringEntitlement = findInArray(
      entitlementsThatUnlockArticle,
      (entitlement) => entitlement.source === GOOGLE_METERING_SOURCE
    );

    return subscriptionEntitlement || meteringEntitlement || null;
  }

  /**
   * Returns the first matching entitlement for the specified source w/o
   * matching any specific products.
   * @param {string} source
   * @return {?Entitlement}
   */
  getEntitlementForSource(source) {
    if (this.entitlements.length > 0) {
      for (let i = 0; i < this.entitlements.length; i++) {
        if (
          this.entitlements[i].subscriptionToken &&
          source == this.entitlements[i].source
        ) {
          return this.entitlements[i];
        }
      }
    }
    return null;
  }

  /**
   * A 3p site should call this method to acknowledge that it "saw" and
   * "understood" entitlements.
   */
  ack() {
    this.ackHandler_(this);
  }

  /**
   * A 3p site should call this method to consume a Google metering entitlement.
   * When a metering entitlement is consumed, SwG shows the user a metering dialog.
   * When the user closes the dialog, SwG depletes one of the user's remaining
   * "free reads".
   * @param {?Function=} onCloseDialog Called after the user closes the dialog.
   */
  consume(onCloseDialog) {
    this.consumeHandler_(this, onCloseDialog);
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
      this.subscriptionToken
    );
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
    // Wildcard allows this product.
    const eq = product.indexOf(':');
    if (
      eq != -1 &&
      this.products.includes(product.substring(0, eq + 1) + '*')
    ) {
      return true;
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
    const jsonList = Array.isArray(json)
      ? /** @type {!Array<Object>} */ (json)
      : [json];
    return jsonList.map((json) => Entitlement.parseFromJson(json));
  }

  /**
   * Returns the SKU associated with this entitlement.
   * @return {?string}
   */
  getSku() {
    if (this.source !== 'google') {
      return null;
    }
    const sku = /** @type {?string} */ (getPropertyFromJsonString(
      this.subscriptionToken,
      'productId'
    ) || null);
    if (!sku) {
      log_4('Unable to retrieve SKU from SwG subscription token');
    }
    return sku;
  }
}

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

/**
 */
class UserData {
  /**
   * @param {string} idToken
   * @param {!Object} data
   */
  constructor(idToken, data) {
    /** @const {string} */
    this.idToken = idToken;
    /** @const {!Object} */
    this.data = data;

    /** @const {string} */
    this.id = data['sub'];
    /** @const {string} */
    this.email = data['email'];
    /** @const {boolean} */
    this.emailVerified = data['email_verified'];
    /** @const {string} */
    this.name = data['name'];
    /** @const {string} */
    this.givenName = data['given_name'];
    /** @const {string} */
    this.familyName = data['family_name'];
    /** @const {string} */
    this.pictureUrl = data['picture'];
  }

  /**
   * @return {!UserData}
   */
  clone() {
    return new UserData(this.idToken, this.data);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'id': this.id,
      'email': this.email,
      'emailVerified': this.emailVerified,
      'name': this.name,
      'givenName': this.givenName,
      'familyName': this.familyName,
      'pictureUrl': this.pictureUrl,
    };
  }
}

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

/**
 */
class SubscribeResponse$1 {
  /**
   * @param {string} raw
   * @param {!PurchaseData} purchaseData
   * @param {?UserData} userData
   * @param {?Entitlements} entitlements
   * @param {!string} productType
   * @param {function():!Promise} completeHandler
   * @param {?string=} oldSku
   * @param {?number=} paymentRecurrence
   */
  constructor(
    raw,
    purchaseData,
    userData,
    entitlements,
    productType,
    completeHandler,
    oldSku = null,
    paymentRecurrence = null
  ) {
    /** @const {string} */
    this.raw = raw;
    /** @const {!PurchaseData} */
    this.purchaseData = purchaseData;
    /** @const {?UserData} */
    this.userData = userData;
    /** @const {?Entitlements} */
    this.entitlements = entitlements;
    /** @const {string} */
    this.productType = productType;
    /** @private @const {function():!Promise} */
    this.completeHandler_ = completeHandler;
    /** @const {?string} */
    this.oldSku = oldSku;
    /** @const {?number} */
    this.paymentRecurrence = paymentRecurrence;
  }

  /**
   * @return {!SubscribeResponse}
   */
  clone() {
    return new SubscribeResponse$1(
      this.raw,
      this.purchaseData,
      this.userData,
      this.entitlements,
      this.productType,
      this.completeHandler_,
      this.oldSku
    );
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'purchaseData': this.purchaseData.json(),
      'userData': this.userData ? this.userData.json() : null,
      'entitlements': this.entitlements ? this.entitlements.json() : null,
      'oldSku': this.oldSku,
      'productType': this.productType,
    };
  }

  /**
   * Allows the receiving site to complete/acknowledge that it registered
   * the subscription purchase. The typical action would be to create an
   * account (or match an existing one) and associated the purchase with
   * that account.
   *
   * SwG will display progress indicator until this method is called and
   * upon receiving this call will show the confirmation to the user.
   * The promise returned by this method will yield once the user closes
   * the confirmation.
   *
   * @return {!Promise}
   */
  complete() {
    return this.completeHandler_();
  }
}

/**
 */
class PurchaseData {
  /**
   * @param {string} raw
   * @param {string} signature
   */
  constructor(raw, signature) {
    /** @const {string} */
    this.raw = raw;
    /** @const {string} */
    this.data = raw;
    /** @const {string} */
    this.signature = signature;
  }

  /**
   * @return {!PurchaseData}
   */
  clone() {
    return new PurchaseData(this.raw, this.signature);
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'data': this.raw,
      'signature': this.signature,
    };
  }
}

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

/**
 */
class DeferredAccountCreationResponse {
  /**
   * @param {!Entitlements} entitlements
   * @param {!UserData} userData
   * @param {!Array<!PurchaseData>} purchaseDataList
   * @param {function():!Promise} completeHandler
   */
  constructor(entitlements, userData, purchaseDataList, completeHandler) {
    /** @const {!Entitlements} */
    this.entitlements = entitlements;
    /** @const {!UserData} */
    this.userData = userData;
    /** @const {!Array<!PurchaseData>} */
    this.purchaseDataList = purchaseDataList;
    // TODO(dvoytenko): deprecate.
    /** @const {!PurchaseData} */
    this.purchaseData = purchaseDataList[0];
    /** @private @const {function():!Promise} */
    this.completeHandler_ = completeHandler;
  }

  /**
   * @return {!DeferredAccountCreationResponse}
   */
  clone() {
    return new DeferredAccountCreationResponse(
      this.entitlements,
      this.userData,
      this.purchaseDataList,
      this.completeHandler_
    );
  }

  /**
   * @return {!Object}
   */
  json() {
    return {
      'entitlements': this.entitlements.json(),
      'userData': this.userData.json(),
      'purchaseDataList': this.purchaseDataList.map((pd) => pd.json()),
      // TODO(dvoytenko): deprecate.
      'purchaseData': this.purchaseData.json(),
    };
  }

  /**
   * Allows the receiving site to complete/acknowledge that it registered
   * the subscription info. The typical action would be to create an
   * account (or match an existing one) and associated the subscription with
   * that account.
   *
   * SwG will display progress indicator until this method is called and
   * upon receiving this call will show the confirmation to the user.
   * The promise returned by this method will yield once the user closes
   * the confirmation.
   *
   * @return {!Promise}
   */
  complete() {
    return this.completeHandler_();
  }
}

/**
 * Copyright 2019 The Subscribe with Google Authors. All Rights Reserved.
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

/**
 * @enum {string}
 */
const SubscriptionState = {
  // user's subscription state not known.
  UNKNOWN: 'unknown',
  // user is not a subscriber.
  NON_SUBSCRIBER: 'non_subscriber',
  // user is a subscriber.
  SUBSCRIBER: 'subscriber',
  // user's subscription has expired.
  PAST_SUBSCRIBER: 'past_subscriber',
};

/**
 * Subscription related events. Listed below are enum strings that
 * represent events related to Subscription flow. Event parameters
 * that provide more context about the event are sent as a JSON
 * block of depth 1 in the sendEvent() API call.
 * @enum {string}
 */
const Event = {
  /**
   * IMPRESSION_PAYWALL event.
   * User hits a paywall.
   * Every impression should be qualified as active or passive.
   * The field 'active' of PropensityEvent, which carries this
   * event, must be set to true or false to indicate this.
   * If the user has run out of metering, and that’s why was shown
   * a paywall, that would be a passive impression of the paywall.
   * For example:
   * const propensityEvent = {
   *  name: 'paywall',
   *  active: false,
   * }
   */
  IMPRESSION_PAYWALL: 'paywall',
  /**
   * IMPRESSION_AD event.
   * User has been shown a subscription ad.
   * Every impression should be qualified as active or passive.
   * The field 'active' of PropensityEvent, which carries this
   * event, must be set to true or false to indicate this.
   * The JSON block can provide the name of the subscription ad
   * creative or campaign. Ad impressions are usually passive.
   * const propensityEvent = {
   *   name: 'ad_shown',
   *   active: false,
   *   data: {'ad_name': 'fall_ad'}
   * }
   */
  IMPRESSION_AD: 'ad_shown',
  /**
   * IMPRESSION_OFFERS event.
   * User has been shown a list of available offers for subscription.
   * Every impression should be qualified as active or passive.
   * The field 'active' of PropensityEvent, which carries this
   * event, must be set to true or false to indicate this.
   * The JSON block can provide a list of products displayed,
   * and the source to indicate why the user was shown the offer.
   * Note: source is not the same as referrer.
   * In the cases below, the user took action before seeing the offers,
   * and therefore considered active impression.
   * For example:
   * const propensityEvent = {
   *   name: 'offers_shown',
   *   active: true,
   *   data: {'offers': ['basic-monthly', 'premium-weekly'],
   *           'source': 'ad-click'}
   * }
   * For example:
   * const propensityEvent = {
   *   name: 'offers_shown',
   *   active: true,
   *   data: {'offers': ['basic-monthly', 'premium-weekly'],
   *           'source': ‘navigate-to-offers-page’}
   * }
   * If the user was shown the offers as a result of paywall metering
   * expiration, it is considered a passive impression.
   * For example:
   * const propensityEvent = {
   *   name: 'offers_shown',
   *   active: false,
   *   data: {'offers': ['basic-monthly', 'premium-weekly'],
   *           'source': ‘paywall-metering-expired’}
   * }
   */
  IMPRESSION_OFFERS: 'offers_shown',
  /**
   * ACTION_SUBSCRIPTIONS_LANDING_PAGE event.
   * User has taken the action to arrive at a landing page of the
   * subscription workflow. The landing page should satisfy one of
   * the following conditions and hence be a part of the funnel to
   * get the user to subscribe:
   * - have a button to navigate the user to an offers page, (in
   *   this case, the next event will be IMPRESSION_OFFERS, with
   *   parameter 'source' as subscriptions-landing-page and
   *   'is_active' set to true),
   * - show offers the user can select, (in this case, the next
   *   event will be IMPRESSION_OFFERS, with a parameter 'source'
   *   as navigate-to-offers-page and 'is_active' set to true),
   * - provide a way to start the payment flow for a specific offer.
   *   (in this case, the next event will be ACTION_OFFER_SELECTED
   *   or ACTION_PAYMENT_FLOW_STARTED depending on if that button
   *   took the user to a checkout page on the publishers site or
   *   directly started the payment flow).
   * The field 'active' of PropensityEvent, which carries this
   * event, must be set to true since this is a user action.
   * The JSON block with this event can provide additional information
   * such as the source, indicating what caused the user to navigate
   * to this page.
   * For example:
   * const propensityEvent = {
   *   name: 'subscriptions_landing_page',
   *   active: true,
   *   data: {'source': 'marketing_via_email'}
   * }
   */
  ACTION_SUBSCRIPTIONS_LANDING_PAGE: 'subscriptions_landing_page',
  /**
   * ACTION_OFFER_SELECTED event.
   * User has selected an offer.
   * The field 'active' of PropensityEvent, which carries this
   * event, must be set to true since this is a user action.
   * The JSON block can provide the product selected.
   * For example: {
   *   name: 'offer_selected',
   *   active: true,
   *   data: {product': 'basic-monthly'}
   * }
   * When offer selection starts the payment flow directly,
   * use the next event ACTION_PAYMENT_FLOW_STARTED instead.
   */
  ACTION_OFFER_SELECTED: 'offer_selected',
  /**
   * ACTION_PAYMENT_FLOW_STARTED event.
   * User has started payment flow.
   * The field 'active' of PropensityEvent, which carries this
   * event, must be set to true since this is a user action.
   * The JSON block can provide the product selected.
   * For example:
   * const propensityEvent = {
   *   name: 'payment_flow_started',
   *   active: true,
   *   data: {product': 'basic-monthly'}
   * }
   */
  ACTION_PAYMENT_FLOW_STARTED: 'payment_flow_start',
  /**
   * ACTION_PAYMENT_COMPLETED.
   * User has made the payment for a subscription.
   * The field 'active' of PropensityEvent, which carries this
   * event, must be set to true since this is a user action.
   * The JSON block can provide the product user paid for.
   * For example:
   * const propensityEvent = {
   *   name: 'payment_complete',
   *   active: true,
   *   data: {product': 'basic-monthly'}
   * }
   */
  ACTION_PAYMENT_COMPLETED: 'payment_complete',
  /**
   * EVENT_CUSTOM: custom publisher event.
   * The field 'active' of PropensityEvent, which carries this
   * event, must be set to true or false depending on if the event
   * was generated as a result of a user action.
   * The JSON block can provide the event name for the custom event.
   * For example:
   * const propensityEvent = {
   *   name: 'custom',
   *   active: true,
   *   data: {
   *     'event_name': 'social_share',
   *     'platform_used': 'whatsapp'
   *   }
   *  }
   */
  EVENT_CUSTOM: 'custom',
};

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

/**
 * @enum {string}
 */
const PropensityType = {
  // Propensity score for a user to subscribe to a publication.
  GENERAL: 'general',
  // Propensity score when blocked access to content by paywall.
  PAYWALL: 'paywall',
};

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

/** @enum {string} */
const SubscriptionFlows = {
  SHOW_OFFERS: 'showOffers',
  SHOW_SUBSCRIBE_OPTION: 'showSubscribeOption',
  SHOW_ABBRV_OFFER: 'showAbbrvOffer',
  SHOW_CONTRIBUTION_OPTIONS: 'showContributionOptions',
  SUBSCRIBE: 'subscribe',
  CONTRIBUTE: 'contribute',
  COMPLETE_DEFERRED_ACCOUNT_CREATION: 'completeDeferredAccountCreation',
  LINK_ACCOUNT: 'linkAccount',
  SHOW_LOGIN_PROMPT: 'showLoginPrompt',
  SHOW_METER_REGWALL: 'showMeterRegwall',
  SHOW_LOGIN_NOTIFICATION: 'showLoginNotification',
  SHOW_METER_TOAST: 'showMeterToast',
};

/**
 * @enum {number}
 */
const AnalyticsMode = {
  DEFAULT: 0,
  IMPRESSIONS: 1,
};

/**
 * @enum {string}
 */
const WindowOpenMode = {
  AUTO: 'auto',
  REDIRECT: 'redirect',
};

/**
 * The Offers/Contributions UI is rendered differently based on the
 * ProductType. The ProductType parameter is passed to the Payments flow, and
 * then passed back to the Payments confirmation page to render messages/text
 * based on the ProductType.
 * @enum {string}
 */
const ProductType = {
  SUBSCRIPTION: 'SUBSCRIPTION',
  UI_CONTRIBUTION: 'UI_CONTRIBUTION',
};

/**
 * @return {!Config}
 */
function defaultConfig() {
  return {
    windowOpenMode: WindowOpenMode.AUTO,
    analyticsMode: AnalyticsMode.DEFAULT,
    enableSwgAnalytics: false,
    enablePropensity: false,
  };
}

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

/**
 * Cached a-tag to avoid memory allocation during URL parsing.
 * @type {HTMLAnchorElement}
 */
let a;

/**
 * We cached all parsed URLs. As of now there are no use cases
 * of AMP docs that would ever parse an actual large number of URLs,
 * but we often parse the same one over and over again.
 * @type {Object<string, !LocationDef>}
 */
let cache;

/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * Consider the returned object immutable. This is enforced during
 * testing by freezing the object.
 * @param {string} url
 * @return {!LocationDef}
 */
function parseUrl$1(url) {
  if (!a) {
    a = /** @type {!HTMLAnchorElement} */ (self.document.createElement('a'));
    cache = self.UrlCache || (self.UrlCache = Object.create(null));
  }

  const fromCache = cache[url];
  if (fromCache) {
    return fromCache;
  }

  const info = parseUrlWithA(a, url);

  return (cache[url] = info);
}

/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * @param {!HTMLAnchorElement} a
 * @param {string} url
 * @return {!LocationDef}
 */
function parseUrlWithA(a, url) {
  a.href = url;

  // IE11 doesn't provide full URL components when parsing relative URLs.
  // Assigning to itself again does the trick.
  if (!a.protocol) {
    a.href = a.href;
  }

  /** @type {!LocationDef} */
  const info = {
    href: a.href,
    protocol: a.protocol,
    host: a.host,
    hostname: a.hostname,
    port: a.port == '0' ? '' : a.port,
    pathname: a.pathname,
    search: a.search,
    hash: a.hash,
    origin: '', // Set below.
  };

  // Some IE11 specific polyfills.
  // 1) IE11 strips out the leading '/' in the pathname.
  if (info.pathname[0] !== '/') {
    info.pathname = '/' + info.pathname;
  }

  // 2) For URLs with implicit ports, IE11 parses to default ports while
  // other browsers leave the port field empty.
  if (
    (info.protocol == 'http:' && info.port == 80) ||
    (info.protocol == 'https:' && info.port == 443)
  ) {
    info.port = '';
    info.host = info.hostname;
  }

  // For data URI a.origin is equal to the string 'null' which is not useful.
  // We instead return the actual origin which is the full URL.
  if (a.origin && a.origin != 'null') {
    info.origin = a.origin;
  } else if (info.protocol == 'data:' || !info.host) {
    info.origin = info.href;
  } else {
    info.origin = info.protocol + '//' + info.host;
  }
  return info;
}

/**
 * Parses and builds Object of URL query string.
 * @param {string} query The URL query string.
 * @return {!Object<string, string>}
 */
function parseQueryString$1(query) {
  if (!query) {
    return {};
  }
  return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce((params, param) => {
      const item = param.split('=');
      try {
        const key = decodeURIComponent(item[0] || '');
        const value = decodeURIComponent(item[1] || '');
        if (key) {
          params[key] = value;
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        log_4(`SwG could not parse a URL query param: ${item[0]}`);
      }
      return params;
    }, {});
}

/**
 * Adds a parameter to a query string.
 * @param {string} url
 * @param {string} param
 * @param {string} value
 * @return {string}
 */
function addQueryParam(url, param, value) {
  const queryIndex = url.indexOf('?');
  const fragmentIndex = url.indexOf('#');
  let fragment = '';
  if (fragmentIndex != -1) {
    fragment = url.substring(fragmentIndex);
    url = url.substring(0, fragmentIndex);
  }
  if (queryIndex == -1) {
    url += '?';
  } else if (queryIndex < url.length - 1) {
    url += '&';
  }
  url += encodeURIComponent(param) + '=' + encodeURIComponent(value);
  return url + fragment;
}

/**
 * @param {!../proto/api_messages.Message} message
 * @return {string}
 */
function serializeProtoMessageForUrl(message) {
  return JSON.stringify(/** @type {JsonObject} */ (message.toArray(false)));
}

/**
 * @param {!../model/doc.Doc} doc
 * @return {string}
 */
function getCanonicalUrl(doc) {
  const node = doc.getRootNode().querySelector("link[rel='canonical']");
  return (node && node.href) || '';
}

const PARSED_URL = parseUrl$1(self.window.location.href);
const PARSED_REFERRER = parseUrl$1(self.document.referrer);

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

/**
 * Have to put these in the map to avoid compiler optimization. Due to
 * optimization issues, this map only allows property-style keys. E.g. "hr1",
 * as opposed to "1hr".
 * @type {!Object<string, number>}
 * @package Visible for testing only.
 */
const CACHE_KEYS = {
  'nocache': 1,
  'hr1': 3600000, // 1hr = 1000 * 60 * 60
  'hr12': 43200000, // 12hr = 1000 * 60 * 60 * 12
};

/**
 * @return {string}
 */
function feOrigin() {
  return parseUrl$1('https://news.google.com').origin;
}

/**
 * @param {string} url Relative URL, e.g. "/service1".
 * @return {string} The complete URL.
 */
function serviceUrl(url) {
  return 'https://news.google.com/swg/_/api/v1' + url;
}

/**
 * @param {string} url  Relative URL, e.g. "/service1".
 * @return {string} The complete URL.
 */
function adsUrl(url) {
  return 'https://pubads.g.doubleclick.net' + url;
}

/**
 * @param {string} url Relative URL, e.g. "/offersiframe".
 * @param {string=} prefix
 * @return {string} The complete URL.
 */
function feUrl(url, prefix = '') {
  // Add cache param.
  url = feCached('https://news.google.com' + prefix + '/swg/_/ui/v1' + url);

  // Optionally add jsmode param. This allows us to test against "aggressively" compiled Boq JS.
  const query = parseQueryString$1(self.location.hash);
  const boqJsMode = query['swg.boqjsmode'];
  if (boqJsMode !== undefined) {
    url = addQueryParam(url, 'jsmode', boqJsMode);
  }

  return url;
}

/**
 * @param {string} url FE URL.
 * @return {string} The complete URL including cache param.
 */
function feCached(url) {
  return addQueryParam(url, '_', cacheParam('hr1'));
}

/**
 * @param {!Object<string, ?>} args
 * @return {!Object<string, ?>}
 */
function feArgs(args) {
  return Object.assign(args, {
    '_client': 'SwG 0.1.22.141',
  });
}

/**
 * @param {string} cacheKey
 * @return {string}
 * @package Visible for testing only.
 */
function cacheParam(cacheKey) {
  let period = CACHE_KEYS[cacheKey];
  if (period == null) {
    period = 1;
  }
  if (period === 0) {
    return '_';
  }
  const now = Date.now();
  return String(period <= 1 ? now : Math.floor(now / period));
}

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
 *
 * The Flow goes like this:
 * a. Start Payments
 * b. Complete Payments
 * c. Create Account
 * d. Acknowledge Account
 *
 * In other words, Flow = Payments + Account Creation.
 */

/**
 * String values input by the publisher are mapped to the number values.
 * @type {!Object<string, number>}
 */
const ReplaceSkuProrationModeMapping = {
  // The replacement takes effect immediately, and the remaining time will
  // be prorated and credited to the user. This is the current default
  // behavior.
  'IMMEDIATE_WITH_TIME_PRORATION': 1,
};

const RecurrenceMapping = {
  'AUTO': 1,
  'ONE_TIME': 2,
};

/**
 * @param {string} sku
 * @return {!EventParams}
 */
function getEventParams(sku) {
  return new EventParams([, , , , sku]);
}

/**
 * The flow to initiate payment process.
 */
class PayStartFlow {
  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.SubscriptionRequest} subscriptionRequest
   * @param {!../api/subscriptions.ProductType} productType
   */
  constructor(
    deps,
    subscriptionRequest,
    productType = ProductType.SUBSCRIPTION
  ) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!./pay-client.PayClient} */
    this.payClient_ = deps.payClient();

    /** @private @const {!../model/page-config.PageConfig} */
    this.pageConfig_ = deps.pageConfig();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!../api/subscriptions.SubscriptionRequest} */
    this.subscriptionRequest_ = subscriptionRequest;

    /**@private @const {!ProductType} */
    this.productType_ = productType;

    /** @private @const {!../runtime/analytics-service.AnalyticsService} */
    this.analyticsService_ = deps.analytics();

    /** @private @const {!../runtime/client-event-manager.ClientEventManager} */
    this.eventManager_ = deps.eventManager();
  }

  /**
   * Starts the payments flow.
   * @return {!Promise}
   */
  start() {
    // Add the 'publicationId' key to the subscriptionRequest_ object.
    const swgPaymentRequest = Object.assign({}, this.subscriptionRequest_, {
      'publicationId': this.pageConfig_.getPublicationId(),
    });

    // Map the proration mode to the enum value (if proration exists).
    const prorationMode = swgPaymentRequest['replaceSkuProrationMode'];
    if (prorationMode) {
      swgPaymentRequest['replaceSkuProrationMode'] =
        ReplaceSkuProrationModeMapping[prorationMode];
    } else if (swgPaymentRequest['oldSku']) {
      swgPaymentRequest['replaceSkuProrationMode'] =
        ReplaceSkuProrationModeMapping['IMMEDIATE_WITH_TIME_PRORATION'];
    }
    // Assign one-time recurrence enum if applicable
    if (swgPaymentRequest['oneTime']) {
      swgPaymentRequest['paymentRecurrence'] = RecurrenceMapping['ONE_TIME'];
      delete swgPaymentRequest['oneTime'];
    }

    // Start/cancel events.
    const flow =
      this.productType_ == ProductType.UI_CONTRIBUTION
        ? SubscriptionFlows.CONTRIBUTE
        : SubscriptionFlows.SUBSCRIBE;

    this.deps_.callbacks().triggerFlowStarted(flow, this.subscriptionRequest_);
    if (swgPaymentRequest['oldSku']) {
      this.analyticsService_.setSku(swgPaymentRequest['oldSku']);
    }
    this.eventManager_.logSwgEvent(
      AnalyticsEvent.ACTION_PAYMENT_FLOW_STARTED,
      true,
      getEventParams(swgPaymentRequest['skuId'])
    );
    PayCompleteFlow.waitingForPayClient_ = true;
    this.payClient_.start(
      /** @type {!PaymentDataRequest} */
      ({
        'apiVersion': 1,
        'allowedPaymentMethods': ['CARD'],
        'environment': 'PRODUCTION',
        'playEnvironment': 'PROD',
        'swg': swgPaymentRequest,
        'i': {
          'startTimeMs': Date.now(),
          'productType': this.productType_,
        },
      }),
      {
        forceRedirect:
          this.deps_.config().windowOpenMode == WindowOpenMode.REDIRECT,
      }
    );
    return Promise.resolve();
  }
}

/**
 * The flow for successful payments completion.
 */
class PayCompleteFlow {
  /**
   * @param {!./deps.DepsDef} deps
   */
  static configurePending(deps) {
    /** @const @type {./client-event-manager.ClientEventManager} */
    const eventManager = deps.eventManager();

    deps.payClient().onResponse((payPromise) => {
      deps.entitlementsManager().blockNextNotification();
      const flow = new PayCompleteFlow(deps);
      const promise = validatePayResponse(
        deps,
        payPromise,
        flow.complete.bind(flow)
      );
      deps.callbacks().triggerPaymentResponse(promise);
      return promise.then(
        (response) => {
          const sku = parseSkuFromPurchaseDataSafe(response.purchaseData);
          deps.analytics().setSku(sku || '');
          eventManager.logSwgEvent(
            AnalyticsEvent.ACTION_PAYMENT_COMPLETE,
            true,
            getEventParams(sku || '')
          );
          flow.start(response);
        },
        (reason) => {
          if (isCancelError(reason)) {
            const productType = /** @type {!Object} */ (reason)['productType'];
            const flow =
              productType == ProductType.UI_CONTRIBUTION
                ? SubscriptionFlows.CONTRIBUTE
                : SubscriptionFlows.SUBSCRIBE;
            deps.callbacks().triggerFlowCanceled(flow);
            deps
              .eventManager()
              .logSwgEvent(AnalyticsEvent.ACTION_USER_CANCELED_PAYFLOW, true);
          } else {
            deps
              .eventManager()
              .logSwgEvent(AnalyticsEvent.EVENT_PAYMENT_FAILED, false);
            deps.jserror().error('Pay failed', reason);
            throw reason;
          }
        }
      );
    });
  }

  /**
   * @param {!./deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {?ActivityIframeView} */
    this.activityIframeView_ = null;

    /** @private {?SubscribeResponse} */
    this.response_ = null;

    /** @private {?Promise} */
    this.readyPromise_ = null;

    /** @private @const {!../runtime/analytics-service.AnalyticsService} */
    this.analyticsService_ = deps.analytics();

    /** @private @const {!../runtime/client-event-manager.ClientEventManager} */
    this.eventManager_ = deps.eventManager();

    /** @private {?string} */
    this.sku_ = null;
  }

  /**
   * Starts the payments completion flow.
   * @param {!SubscribeResponse} response
   * @return {!Promise}
   */
  start(response) {
    this.sku_ = parseSkuFromPurchaseDataSafe(response.purchaseData);
    this.eventManager_.logSwgEvent(
      AnalyticsEvent.IMPRESSION_ACCOUNT_CHANGED,
      true,
      getEventParams(this.sku_ || '')
    );
    this.deps_.entitlementsManager().reset(true);
    this.response_ = response;
    // TODO(dianajing): future-proof isOneTime flag
    const args = {
      'publicationId': this.deps_.pageConfig().getPublicationId(),
      'productType': this.response_['productType'],
      'isSubscriptionUpdate': !!this.response_['oldSku'],
      'isOneTime': !!this.response_['paymentRecurrence'],
    };
    // TODO(dvoytenko, #400): cleanup once entitlements is launched everywhere.
    if (response.userData && response.entitlements) {
      args['idToken'] = response.userData.idToken;
      this.deps_
        .entitlementsManager()
        .pushNextEntitlements(response.entitlements.raw);
    } else {
      args['loginHint'] = response.userData && response.userData.email;
    }
    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/payconfirmiframe'),
      feArgs(args),
      /* shouldFadeBody */ true
    );

    this.activityIframeView_.on(
      EntitlementsResponse,
      this.handleEntitlementsResponse_.bind(this)
    );

    this.activityIframeView_.acceptResult().then(() => {
      // The flow is complete.
      this.dialogManager_.completeView(this.activityIframeView_);
    });
    this.readyPromise_ = this.dialogManager_.openView(this.activityIframeView_);
    return this.readyPromise_;
  }

  /**
   * @param {!EntitlementsResponse} response
   * @private
   */
  handleEntitlementsResponse_(response) {
    const jwt = response.getJwt();
    if (jwt) {
      this.deps_.entitlementsManager().pushNextEntitlements(jwt);
    }
  }

  /**
   * @return {!Promise}
   */
  complete() {
    this.eventManager_.logSwgEvent(
      AnalyticsEvent.ACTION_ACCOUNT_CREATED,
      true,
      getEventParams(this.sku_ || '')
    );
    this.deps_.entitlementsManager().unblockNextNotification();
    this.readyPromise_.then(() => {
      const accountCompletionRequest = new AccountCreationRequest();
      accountCompletionRequest.setComplete(true);
      this.activityIframeView_.execute(accountCompletionRequest);
    });
    return this.activityIframeView_
      .acceptResult()
      .catch(() => {
        // Ignore errors.
      })
      .then(() => {
        this.eventManager_.logSwgEvent(
          AnalyticsEvent.ACTION_ACCOUNT_ACKNOWLEDGED,
          true,
          getEventParams(this.sku_ || '')
        );
        this.deps_.entitlementsManager().setToastShown(true);
      });
  }
}

/** @private {boolean} */
PayCompleteFlow.waitingForPayClient_ = false;

/**
 * @param {!./deps.DepsDef} deps
 * @param {!Promise<!Object>} payPromise
 * @param {function():!Promise} completeHandler
 * @return {!Promise<!SubscribeResponse>}
 */
function validatePayResponse(deps, payPromise, completeHandler) {
  const wasRedirect = !PayCompleteFlow.waitingForPayClient_;
  PayCompleteFlow.waitingForPayClient_ = false;
  return payPromise.then((data) => {
    // 1) We log against a random TX ID which is how we track a specific user
    //    anonymously.
    // 2) If there was a redirect to gPay, we may have lost our stored TX ID.
    // 3) Pay service is supposed to give us the TX ID it logged against.
    let eventType = AnalyticsEvent.UNKNOWN;
    let eventParams = undefined;
    if (typeof data !== 'object' || !data['googleTransactionId']) {
      // If gPay doesn't give us a TX ID it means that something may
      // be wrong.  If we previously logged then we are at least continuing to
      // log against the same TX ID.  If we didn't previously log then we have
      // lost all connection to the events that preceded the payment event and
      // we at least want to know why that data was lost.
      eventParams = new EventParams();
      eventParams.setHadLogged(!wasRedirect);
      eventType = AnalyticsEvent.EVENT_GPAY_NO_TX_ID;
    } else {
      const oldTxId = deps.analytics().getTransactionId();
      const newTxId = data['googleTransactionId'];

      if (wasRedirect) {
        // This is the expected case for full redirects.  It may be happening
        // unexpectedly at other times too though and we want to be aware of
        // it if it does.
        deps.analytics().setTransactionId(newTxId);
        eventType = AnalyticsEvent.EVENT_GPAY_CANNOT_CONFIRM_TX_ID;
      } else {
        if (oldTxId === newTxId) {
          // This is the expected case for non-redirect pay events
          eventType = AnalyticsEvent.EVENT_CONFIRM_TX_ID;
        } else {
          // This is an unexpected case: gPay rejected our TX ID and created
          // its own.  Log the gPay TX ID but keep our logging consistent.
          eventParams = new EventParams();
          eventParams.setGpayTransactionId(newTxId);
          eventType = AnalyticsEvent.EVENT_CHANGED_TX_ID;
        }
      }
    }
    deps.eventManager().logSwgEvent(eventType, true, eventParams);
    return parseSubscriptionResponse(deps, data, completeHandler);
  });
}

/**
 * @param {!./deps.DepsDef} deps
 * @param {*} data
 * @param {function():!Promise} completeHandler
 * @return {!SubscribeResponse}
 */
function parseSubscriptionResponse(deps, data, completeHandler) {
  let swgData = null;
  let raw = null;
  let productType = ProductType.SUBSCRIPTION;
  let oldSku = null;
  let paymentRecurrence = null;

  if (data) {
    if (typeof data == 'string') {
      raw = /** @type {string} */ (data);
    } else {
      // Assume it's a json object in the format:
      // `{integratorClientCallbackData: "..."}` or `{swgCallbackData: "..."}`.
      const json = /** @type {!Object} */ (data);
      if ('swgCallbackData' in json) {
        swgData = /** @type {!Object} */ (json['swgCallbackData']);
      } else if ('integratorClientCallbackData' in json) {
        raw = json['integratorClientCallbackData'];
      }
      if ('paymentRequest' in data) {
        oldSku = (data['paymentRequest']['swg'] || {})['oldSku'];
        paymentRecurrence = (data['paymentRequest']['swg'] || {})[
          'paymentRecurrence'
        ];
        productType =
          (data['paymentRequest']['i'] || {})['productType'] ||
          ProductType.SUBSCRIPTION;
      }
    }
  }
  if (raw && !swgData) {
    raw = atob(raw);
    if (raw) {
      const parsed = parseJson(raw);
      swgData = parsed['swgCallbackData'];
    }
  }
  if (!swgData) {
    throw new Error('unexpected payment response');
  }
  raw = JSON.stringify(/** @type {!JsonObject} */ (swgData));
  return new SubscribeResponse$1(
    raw,
    parsePurchaseData(swgData),
    parseUserData(swgData),
    parseEntitlements(deps, swgData),
    productType,
    completeHandler,
    oldSku,
    paymentRecurrence
  );
}

/**
 * @param {!Object} swgData
 * @return {!PurchaseData}
 */
function parsePurchaseData(swgData) {
  const raw = swgData['purchaseData'];
  const signature = swgData['purchaseDataSignature'];
  return new PurchaseData(raw, signature);
}

/**
 * @param {!Object} swgData
 * @return {?UserData}
 * @package Visible for testing.
 */
function parseUserData(swgData) {
  const idToken = swgData['idToken'];
  if (!idToken) {
    return null;
  }
  const jwt = /** @type {!Object} */ (new JwtHelper().decode(idToken));
  return new UserData(idToken, jwt);
}

/**
 * @param {!./deps.DepsDef} deps
 * @param {!Object} swgData
 * @return {?../api/entitlements.Entitlements}
 * @package Visible for testing.
 */
function parseEntitlements(deps, swgData) {
  if (swgData['signedEntitlements']) {
    return deps.entitlementsManager().parseEntitlements(swgData);
  }
  return null;
}

/**
 * @param {!PurchaseData} purchaseData
 * @return {?string}
 */
function parseSkuFromPurchaseDataSafe(purchaseData) {
  return /** @type {?string} */ (getPropertyFromJsonString(
    purchaseData.raw,
    'productId'
  ) || null);
}

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

/**
 * @param {string} sku
 * @return {!EventParams}
 */
function getEventParams$1(sku) {
  return new EventParams([, , , , sku]);
}

/**
 * Offers view is closable when request was originated from 'AbbrvOfferFlow'
 * or from 'SubscribeOptionFlow'.
 */
const OFFERS_VIEW_CLOSABLE = true;

// The value logged when the offers screen shows all available SKUs.
const ALL_SKUS = '*';

/**
 * The class for Offers flow.
 */
class OffersFlow {
  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.OffersRequest|undefined} options
   */
  constructor(deps, options) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!../runtime/client-event-manager.ClientEventManager} */
    this.eventManager_ = deps.eventManager();

    let isClosable = options && options.isClosable;
    if (isClosable == undefined) {
      isClosable = false; // Default is to hide Close button.
    }

    const feArgsObj = deps.activities().addDefaultArguments({
      'showNative': deps.callbacks().hasSubscribeRequestCallback(),
      'productType': ProductType.SUBSCRIPTION,
      'list': (options && options.list) || 'default',
      'skus': (options && options.skus) || null,
      'isClosable': isClosable,
    });

    if (options && options.oldSku) {
      feArgsObj['oldSku'] = options.oldSku;
      log_2(feArgsObj['skus'], 'Need a sku list if old sku is provided!');

      // Remove old sku from offers if in list.
      let skuList = feArgsObj['skus'];
      const /** @type {string} */ oldSku = feArgsObj['oldSku'];
      skuList = skuList.filter((sku) => sku !== oldSku);

      log_2(
        skuList.length > 0,
        'Sku list only contained offer user already has'
      );
      feArgsObj['skus'] = skuList;
    }

    // Redirect to payments if only one upgrade option is passed.
    if (feArgsObj['skus'] && feArgsObj['skus'].length === 1) {
      const sku = feArgsObj['skus'][0];
      const /** @type {string|undefined} */ oldSku = feArgsObj['oldSku'];
      // Update subscription triggers experimental flag if oldSku is passed,
      // so we need to check for oldSku to decide if it needs to be sent.
      // Otherwise we might accidentally block a regular subscription request.
      if (oldSku) {
        const skuSelectedResponse = new SkuSelectedResponse();
        skuSelectedResponse.setSku(sku);
        skuSelectedResponse.setOldSku(oldSku);
        this.startPayFlow_(skuSelectedResponse);
        return;
      }
    }

    /** @private  @const {!Array<!string>} */
    this.skus_ = feArgsObj['skus'] || [ALL_SKUS];

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/offersiframe'),
      feArgsObj,
      /* shouldFadeBody */ true
    );
  }

  /**
   * @param {SkuSelectedResponse} response
   * @private
   */
  startPayFlow_(response) {
    const sku = response.getSku();
    if (sku) {
      const /** @type {../api/subscriptions.SubscriptionRequest} */ subscriptionRequest = {
          'skuId': sku,
        };
      const oldSku = response.getOldSku();
      if (oldSku) {
        subscriptionRequest['oldSku'] = oldSku;
        this.deps_.analytics().setSku(oldSku);
      }
      this.eventManager_.logSwgEvent(
        AnalyticsEvent.ACTION_OFFER_SELECTED,
        true,
        getEventParams$1(sku)
      );
      new PayStartFlow(this.deps_, subscriptionRequest).start();
    }
  }

  /**
   * @param {AlreadySubscribedResponse} response
   * @private
   */
  handleLinkRequest_(response) {
    if (response.getSubscriberOrMember()) {
      this.eventManager_.logSwgEvent(
        AnalyticsEvent.ACTION_ALREADY_SUBSCRIBED,
        true
      );
      this.deps_.callbacks().triggerLoginRequest({
        linkRequested: !!response.getLinkRequested(),
      });
    }
  }

  /**
   * @param {ViewSubscriptionsResponse} response
   * @private
   */
  startNativeFlow_(response) {
    if (response.getNative()) {
      this.deps_.callbacks().triggerSubscribeRequest();
    }
  }

  /**
   * Starts the offers flow or alreadySubscribed flow.
   * @return {!Promise}
   */
  start() {
    if (this.activityIframeView_) {
      // So no error if skipped to payment screen.
      // Start/cancel events.
      // The second parameter is required by Propensity in AMP.
      this.deps_.callbacks().triggerFlowStarted(SubscriptionFlows.SHOW_OFFERS, {
        skus: this.skus_,
        source: 'SwG',
      });
      this.activityIframeView_.onCancel(() => {
        this.deps_
          .callbacks()
          .triggerFlowCanceled(SubscriptionFlows.SHOW_OFFERS);
      });
      this.activityIframeView_.on(
        SkuSelectedResponse,
        this.startPayFlow_.bind(this)
      );
      this.activityIframeView_.on(
        AlreadySubscribedResponse,
        this.handleLinkRequest_.bind(this)
      );
      this.activityIframeView_.on(
        ViewSubscriptionsResponse,
        this.startNativeFlow_.bind(this)
      );

      return this.dialogManager_.openView(this.activityIframeView_);
    }
    return Promise.resolve();
  }
}

/**
 * The class for subscribe option flow.
 */
class SubscribeOptionFlow {
  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.OffersRequest|undefined} options
   */
  constructor(deps, options) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!../api/subscriptions.OffersRequest|undefined} */
    this.options_ = options;

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!../runtime/client-event-manager.ClientEventManager} */
    this.eventManager_ = deps.eventManager();

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
      deps.win(),
      this.activityPorts_,
      feUrl('/optionsiframe'),
      feArgs({
        'publicationId': deps.pageConfig().getPublicationId(),
        'productId': deps.pageConfig().getProductId(),
        'list': (options && options.list) || 'default',
        'skus': (options && options.skus) || null,
        'isClosable': true,
      }),
      /* shouldFadeBody */ false
    );
  }

  /**
   * Starts the offers flow or alreadySubscribed flow.
   * @return {!Promise}
   */
  start() {
    // Start/cancel events.
    this.deps_
      .callbacks()
      .triggerFlowStarted(SubscriptionFlows.SHOW_SUBSCRIBE_OPTION);
    this.activityIframeView_.onCancel(() => {
      this.deps_
        .callbacks()
        .triggerFlowCanceled(SubscriptionFlows.SHOW_SUBSCRIBE_OPTION);
    });
    this.activityIframeView_.on(
      SubscribeResponse,
      this.maybeOpenOffersFlow_.bind(this)
    );

    this.activityIframeView_.acceptResult().then(
      (result) => {
        const data = result.data;
        const response = new SubscribeResponse();
        if (data['subscribe']) {
          response.setSubscribe(true);
        }
        this.maybeOpenOffersFlow_(response);
      },
      (reason) => {
        this.dialogManager_.completeView(this.activityIframeView_);
        throw reason;
      }
    );
    this.eventManager_.logSwgEvent(
      AnalyticsEvent.IMPRESSION_CLICK_TO_SHOW_OFFERS
    );
    return this.dialogManager_.openView(this.activityIframeView_);
  }

  /**
   * @param {SubscribeResponse} response
   * @private
   */
  maybeOpenOffersFlow_(response) {
    if (response.getSubscribe()) {
      const options = this.options_ || {};
      if (options.isClosable == undefined) {
        options.isClosable = OFFERS_VIEW_CLOSABLE;
      }
      this.eventManager_.logSwgEvent(AnalyticsEvent.ACTION_VIEW_OFFERS, true);
      new OffersFlow(this.deps_, options).start();
    }
  }
}

/**
 * The class for Abbreviated Offer flow.
 *
 */
class AbbrvOfferFlow {
  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.OffersRequest=} options
   */
  constructor(deps, options = {}) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!../api/subscriptions.OffersRequest|undefined} */
    this.options_ = options;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!../runtime/client-event-manager.ClientEventManager} */
    this.eventManager_ = deps.eventManager();

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/abbrvofferiframe'),
      feArgs({
        'publicationId': deps.pageConfig().getPublicationId(),
        'productId': deps.pageConfig().getProductId(),
        'showNative': deps.callbacks().hasSubscribeRequestCallback(),
        'list': (options && options.list) || 'default',
        'skus': (options && options.skus) || null,
        'isClosable': true,
      }),
      /* shouldFadeBody */ false
    );
  }

  /**
   * @param {AlreadySubscribedResponse} response
   * @private
   */
  handleLinkRequest_(response) {
    if (response.getSubscriberOrMember()) {
      this.eventManager_.logSwgEvent(
        AnalyticsEvent.ACTION_ALREADY_SUBSCRIBED,
        true
      );
      this.deps_.callbacks().triggerLoginRequest({
        linkRequested: !!response.getLinkRequested(),
      });
    }
  }

  /**
   * Starts the offers flow
   * @return {!Promise}
   */
  start() {
    // Start/cancel events.
    this.deps_
      .callbacks()
      .triggerFlowStarted(SubscriptionFlows.SHOW_ABBRV_OFFER);
    this.activityIframeView_.onCancel(() => {
      this.deps_
        .callbacks()
        .triggerFlowCanceled(SubscriptionFlows.SHOW_ABBRV_OFFER);
    });

    // If the user is already subscribed, trigger login flow
    this.activityIframeView_.on(
      AlreadySubscribedResponse,
      this.handleLinkRequest_.bind(this)
    );

    // If result is due to requesting offers, redirect to offers flow
    this.activityIframeView_.acceptResult().then((result) => {
      if (result.data['viewOffers']) {
        const options = this.options_ || {};
        if (options.isClosable == undefined) {
          options.isClosable = OFFERS_VIEW_CLOSABLE;
        }
        this.eventManager_.logSwgEvent(AnalyticsEvent.ACTION_VIEW_OFFERS, true);
        new OffersFlow(this.deps_, options).start();
        return;
      }
      if (result.data['native']) {
        this.deps_.callbacks().triggerSubscribeRequest();
        // The flow is complete.
        this.dialogManager_.completeView(this.activityIframeView_);
        return;
      }
    });

    this.eventManager_.logSwgEvent(
      AnalyticsEvent.IMPRESSION_CLICK_TO_SHOW_OFFERS_OR_ALREADY_SUBSCRIBED
    );

    return this.dialogManager_.openView(this.activityIframeView_);
  }
}

/**
 * Copyright 2019 The Subscribe with Google Authors. All Rights Reserved.
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
/**
 * @implements {ActivityPortDef}
 */
class ActivityPortDeprecated {
  /**
   * @param {!web-activities/activity-ports.ActivityPort} port
   */
  constructor(port) {
    /** @private @const {!web-activities/activity-ports.ActivityPort} */
    this.port_ = port;
  }

  /**
   * @return {!Promise<!web-activities/activity-ports.ActivityResult>}
   */
  acceptResult() {
    return this.port_.acceptResult();
  }
}

/**
 * @implements {ActivityPortDef}
 */
class ActivityIframePort$1 {
  /**
   * @param {!HTMLIFrameElement} iframe
   * @param {string} url
   * @param {!../runtime/deps.DepsDef} deps
   * @param {?Object=} args
   */
  constructor(iframe, url, deps, args) {
    /** @private @const {!web-activities/activity-ports.ActivityIframePort} */
    this.iframePort_ = new activityPorts_2(iframe, url, args);
    /** @private @const {!Object<string, function(!Object)>} */
    this.callbackMap_ = {};

    /** @private @const {../runtime/deps.DepsDef} */
    this.deps_ = deps;
  }

  /**
   * Returns a promise that yields when the iframe is ready to be interacted
   * with.
   * @return {!Promise}
   */
  whenReady() {
    return this.iframePort_.whenReady();
  }

  /**
   * Waits until the activity port is connected to the host.
   * @return {!Promise}
   */
  connect() {
    return this.iframePort_.connect().then(() => {
      // Attach a callback to receive messages after connection complete
      this.iframePort_.onMessage((data) => {
        const response = data && data['RESPONSE'];
        if (!response) {
          return;
        }
        const cb = this.callbackMap_[response[0]];
        if (cb) {
          cb(deserialize(response));
        }
      });

      if (this.deps_ && this.deps_.eventManager()) {
        this.on(AnalyticsRequest, (request) => {
          this.deps_.eventManager().logEvent({
            eventType: request.getEvent(),
            eventOriginator: EventOriginator.SWG_SERVER,
            isFromUserAction: request.getMeta().getIsFromUserAction(),
            additionalParameters: request.getParams(),
          });
        });
      }
    });
  }

  /**
   * Disconnect the activity binding and cleanup listeners.
   */
  disconnect() {
    this.iframePort_.disconnect();
  }

  /**
   * Returns the mode of the activity: iframe, popup or redirect.
   * @return {!web-activities/activity-ports.ActivityMode}
   */
  getMode() {
    return this.iframePort_.getMode();
  }

  /**
   * Accepts the result when ready. The client should verify the activity's
   * mode, origin, verification and secure channel flags before deciding
   * whether or not to trust the result.
   *
   * Returns the promise that yields when the activity has been completed and
   * either a result, a cancelation or a failure has been returned.
   *
   * @return {!Promise<!web-activities/activity-ports.ActivityResult>}
   * @override
   */
  acceptResult() {
    return this.iframePort_.acceptResult();
  }

  /**
   * Register a callback to handle resize requests. Once successfully resized,
   * ensure to call `resized()` method.
   * @param {function(number)} callback
   */
  onResizeRequest(callback) {
    return this.iframePort_.onResizeRequest(callback);
  }

  /**
   * @param {!../proto/api_messages.Message} request
   */
  execute(request) {
    this.iframePort_.message({'REQUEST': request.toArray()});
  }

  /**
   * @param {!function(new: T)} message
   * @param {function(!../proto/api_messages.Message)} callback
   * @template T
   */
  on(message, callback) {
    let label = null;
    try {
      label = getLabel(message);
    } catch (ex) {
      // Thrown if message is not a proto object and has no label
      label = null;
    }
    if (!label) {
      throw new Error('Invalid data type');
    } else if (this.callbackMap_[label]) {
      throw new Error('Invalid type or duplicate callback for ', label);
    }
    this.callbackMap_[label] = callback;
  }

  /**
   * Signals back to the activity implementation that the client has updated
   * the activity's size.
   */
  resized() {
    this.iframePort_.resized();
  }
}

class ActivityPorts$1 {
  /**
   * @param {!../runtime/deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!../runtime/deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!web-activities/activity-ports.ActivityPorts} */
    this.activityPorts_ = new activityPorts_1(deps.win());
  }

  /**
   * Adds client version, publication, product and logging context information.
   * @param {?Object=} args
   * @return {!Object}
   */
  addDefaultArguments(args) {
    const deps = this.deps_;
    const pageConfig = deps.pageConfig();
    const context = deps.analytics().getContext();
    return Object.assign(
      {
        'analyticsContext': context.toArray(),
        'publicationId': pageConfig.getPublicationId(),
        'productId': pageConfig.getProductId(),
        '_client': 'SwG 0.1.22.141',
        'supportsEventManager': true,
      },
      args || {}
    );
  }

  /*
   * Start an activity within the specified iframe.
   * @param {!HTMLIFrameElement} iframe
   * @param {string} url
   * @param {?Object=} args
   * @return {!Promise<!ActivityIframePort>}
   */
  openActivityIframePort_(iframe, url, args) {
    const activityPort = new ActivityIframePort$1(iframe, url, this.deps_, args);
    return activityPort.connect().then(() => activityPort);
  }

  /**
   * Start an activity within the specified iframe.
   * @param {!HTMLIFrameElement} iframe
   * @param {string} url
   * @param {?Object=} args
   * @param {boolean=} addDefaultArguments
   * @return {!Promise<!ActivityIframePort>}
   */
  openIframe(iframe, url, args, addDefaultArguments = false) {
    if (addDefaultArguments) {
      args = this.addDefaultArguments(args);
    }
    return this.openActivityIframePort_(iframe, url, args);
  }

  /**
   * Start an activity in a separate window. The result will be delivered
   * to the `onResult` callback.
   *
   * The activity can be opened in two modes: "popup" and "redirect". This
   * depends on the `target` value, but also on the browser/environment.
   *
   * The allowed `target` values are `_blank`, `_top` and name targets. The
   * `_self`, `_parent` and similar targets are not allowed.
   *
   * The `_top` target indicates that the activity should be opened as a
   * "redirect", while other targets indicate that the activity should be
   * opened as a popup. The activity client will try to honor the requested
   * target. However, it's not always possible. Some environments do not
   * allow popups and they either force redirect or fail the window open
   * request. In this case, the activity will try to fallback to the "redirect"
   * mode.
   *
   * @param {string} requestId
   * @param {string} url
   * @param {string} target
   * @param {?Object=} args
   * @param {?web-activities/activity-ports.ActivityOpenOptions=} options
   * @param {boolean=} addDefaultArguments
   * @return {{targetWin: ?Window}}
   */
  open(requestId, url, target, args, options, addDefaultArguments = false) {
    if (addDefaultArguments) {
      args = this.addDefaultArguments(args);
    }
    return this.activityPorts_.open(requestId, url, target, args, options);
  }

  /**
   * Registers the callback for the result of the activity opened with the
   * specified `requestId` (see the `open()` method). The callback is a
   * function that takes a single `ActivityPort` argument. The client
   * can use this object to verify the port using it's origin, verified and
   * secure channel flags. Then the client can call
   * `ActivityPort.acceptResult()` method to accept the result.
   *
   * The activity result is handled via a separate callback because of a
   * possible redirect. So use of direct callbacks and/or promises is not
   * possible in that case.
   *
   * A typical implementation would look like:
   * ```
   * ports.onResult('request1', function(port) {
   *   port.acceptResult().then(function(result) {
   *     // Only verified origins are allowed.
   *     if (result.origin == expectedOrigin &&
   *         result.originVerified &&
   *         result.secureChannel) {
   *       handleResultForRequest1(result);
   *     }
   *   });
   * })
   *
   * ports.open('request1', request1Url, '_blank');
   * ```
   *
   * @param {string} requestId
   * @param {function(!ActivityPortDef)} callback
   */
  onResult(requestId, callback) {
    this.activityPorts_.onResult(requestId, (port) => {
      callback(new ActivityPortDeprecated(port));
    });
  }

  /**
   * @param {function(!Error)} handler
   */
  onRedirectError(handler) {
    this.activityPorts_.onRedirectError(handler);
  }

  /**
   * @return {!web-activities/activity-ports.ActivityPorts}
   */
  getOriginalWebActivityPorts() {
    return this.activityPorts_;
  }
}

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

/**
 * Determines if value is actually an Object.
 * @param {*} value
 * @return {boolean}
 */
function isObject(value) {
  const str = Object.prototype.toString.call(value);
  return str === '[object Object]';
}

/**
 * Checks whether `s` is a valid value of `enumObj`.
 *
 * @param {!Object<T>} enumObj
 * @param {T} s
 * @return {boolean}
 * @template T
 */
function isEnumValue(enumObj, s) {
  for (const k in enumObj) {
    if (enumObj[k] === s) {
      return true;
    }
  }
  return false;
}

/**
 * True if the value is a function.
 * @param {*} value
 * @return {boolean}
 */
function isFunction(value) {
  return typeof value === 'function';
}

/**
 * True if the value is either true or false.
 * @param {?*} value
 * @return {boolean}
 */
function isBoolean(value) {
  return typeof value === 'boolean';
}

/**
 * Copyright 2019 The Subscribe with Google Authors. All Rights Reserved.
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

/**
 * Helper function to describe an issue with an event object
 * @param {!string} valueName
 * @param {?*} value
 * @returns {!string}
 */
function createEventErrorMessage(valueName, value) {
  return 'Event has an invalid ' + valueName + '(' + value + ')';
}

/**
 * Throws an error if the event is invalid.
 * @param {!../api/client-event-manager-api.ClientEvent} event
 */
function validateEvent(event) {
  if (!isObject(event)) {
    throw new Error('Event must be a valid object');
  }

  if (!isEnumValue(AnalyticsEvent, event.eventType)) {
    throw new Error(createEventErrorMessage('eventType', event.eventType));
  }

  if (!isEnumValue(EventOriginator, event.eventOriginator)) {
    throw new Error(
      createEventErrorMessage('eventOriginator', event.eventOriginator)
    );
  }

  if (
    !isObject(event.additionalParameters) &&
    event.additionalParameters != null
  ) {
    throw new Error(
      createEventErrorMessage(
        'additionalParameters',
        event.additionalParameters
      )
    );
  }

  if (event.isFromUserAction != null && !isBoolean(event.isFromUserAction)) {
    throw new Error(
      createEventErrorMessage('isFromUserAction', event.isFromUserAction)
    );
  }
}

/** @implements {../api/client-event-manager-api.ClientEventManagerApi} */
class ClientEventManager {
  /**
   * @param {!../api/client-event-manager-api.ClientEvent} event
   * @return {boolean}
   */
  static isPublisherEvent(event) {
    return (
      event.eventOriginator === EventOriginator.PROPENSITY_CLIENT ||
      event.eventOriginator === EventOriginator.PUBLISHER_CLIENT ||
      event.eventOriginator === EventOriginator.AMP_CLIENT
    );
  }

  /**
   *
   * @param {!Promise} configuredPromise
   */
  constructor(configuredPromise) {
    /** @private {!Array<function(!../api/client-event-manager-api.ClientEvent)>} */
    this.listeners_ = [];

    /** @private {!Array<function(!../api/client-event-manager-api.ClientEvent):!FilterResult>} */
    this.filterers_ = [];

    /** @private {?Promise} */
    this.lastAction_ = null;

    /** @private @const {!Promise} */
    this.isReadyPromise_ = configuredPromise;
  }

  /**
   * @overrides
   */
  registerEventListener(listener) {
    if (!isFunction(listener)) {
      throw new Error('Event manager listeners must be a function');
    }
    this.listeners_.push(listener);
  }

  /**
   * @overrides
   */
  registerEventFilterer(filterer) {
    if (!isFunction(filterer)) {
      throw new Error('Event manager filterers must be a function');
    }
    this.filterers_.push(filterer);
  }

  /**
   * @overrides
   */
  logEvent(event) {
    validateEvent(event);
    this.lastAction_ = this.isReadyPromise_.then(() => {
      for (let filterer = 0; filterer < this.filterers_.length; filterer++) {
        try {
          if (this.filterers_[filterer](event) === FilterResult.CANCEL_EVENT) {
            return Promise.resolve();
          }
        } catch (e) {
          log_5(e);
        }
      }
      for (let listener = 0; listener < this.listeners_.length; listener++) {
        try {
          this.listeners_[listener](event);
        } catch (e) {
          log_5(e);
        }
      }
      return Promise.resolve();
    });
  }

  /**
   * Creates an event with the arguments provided and calls logEvent.
   * @param {!AnalyticsEvent} eventType
   * @param {?boolean=} isFromUserAction
   * @param {../proto/api_messages.EventParams=} eventParams
   */
  logSwgEvent(eventType, isFromUserAction = false, eventParams = null) {
    this.logEvent({
      eventType,
      eventOriginator: EventOriginator.SWG_CLIENT,
      isFromUserAction,
      additionalParameters: eventParams,
    });
  }

  /** @return {!Promise<null>} */
  getReadyPromise() {
    return this.isReadyPromise_;
  }
}

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

/**
 * @enum {string}
 */
const ExperimentFlags = {
  /**
   * Enables the feature that allows you to replace one subscription
   * for another in the subscribe() API.
   */
  REPLACE_SUBSCRIPTION: 'replace-subscription',

  /**
   * Enables the contributions feature.
   * DEPRECATED. This flag can be removed once not used by anyone.
   */
  CONTRIBUTIONS: 'contributions',

  /**
   * Enables the Propensity feature
   */
  PROPENSITY: 'propensity',

  /**
   * Enables the Smartbox feature.
   */
  SMARTBOX: 'smartbox',

  /**
   * Enables using new Activities APIs
   */
  HEJIRA: 'hejira',

  /** Enables logging to both the new SwG Clearcut service and the pre-existing
   *  Clearcut iframe while we verify the new logging system works.
   *  Publishers should not activate this experiment.
   */
  LOGGING_BEACON: 'logging-beacon',

  /** Enables googleTransactionID change. With the experiment on the ID is
   *  changed from '<uuid>' to '<uuid>.swg'.
   */
  UPDATE_GOOGLE_TRANSACTION_ID: 'update-google-transaction-id',
};

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

/**
 * @fileoverview
 *
 * Client-side experiments in SwG.
 *
 * The experiments can be set in a few different ways:
 *  1. By gulp build rules using `--experiments=${experimentsString}` argument.
 *  2. By `#swg.experiments=${experimentsString}` parameter in the URL's
 *     fragment.
 *  3. By `swg.configure({experiments: [array]})` call.
 *
 * The `${experimentsString}` is defined as following:
 *  - experimentString = (experimentSpec,)*
 *  - experimentSpec = experimentId | experimentId '=' num100 ('c')?
 *
 * Some examples:
 *  - `A,B` - defines two experiments "A" and "B" that will be turned on.
 *  - `A:100,B:100` - the same: "A" and "B" will be turned on.
 *  - `A:0` - the experiment "A" will be disabled.
 *  - `A:1` - enable the experiment "A" in 1% of impressions.
 *  - `A:10c` - enable the experiment "A" in 10% of impressions with 10%
 *    control. In this case, 20% of the impressions will be split into two
 *    categories: experiment and control. Notice, a control can be requested
 *    only for the fraction under 20%.
 */

/**
 * @enum {string}
 */
const Selection = {
  EXPERIMENT: 'e',
  CONTROL: 'c',
};

/**
 * A comma-separated set of experiments.
 * @type {string}
 */
let experimentsString = '';

/**
 * A parsed map of experiments.
 * @type {?Object<string, boolean>}
 */
let experimentMap = null;

/**
 * Ensures that the experiments have been initialized and returns them.
 * @param {!Window} win
 * @return {!Object<string, boolean>}
 */
function getExperiments(win) {
  if (!experimentMap) {
    experimentMap = {};
    let combinedExperimentString = experimentsString;
    try {
      const query = parseQueryString$1(win.location.hash);
      const experimentStringFromHash = query['swg.experiments'];
      if (experimentStringFromHash) {
        combinedExperimentString += ',' + experimentStringFromHash;
      }
    } catch (e) {
      // Ignore: experiment parsing cannot block runtime.
      ErrorUtils.throwAsync(e);
    }

    // Format:
    // - experimentString = (experimentSpec,)*
    combinedExperimentString.split(',').forEach((s) => {
      s = s.trim();
      if (!s) {
        return;
      }
      try {
        parseSetExperiment(win, experimentMap, s);
      } catch (e) {
        // Ignore: experiment parsing cannot block runtime.
        ErrorUtils.throwAsync(e);
      }
    });
  }
  return experimentMap;
}

/**
 * @param {!Window} win
 * @param {?Object<string, boolean>} experimentMap
 * @param {string} spec
 */
function parseSetExperiment(win, experimentMap, spec) {
  // Format:
  // - experimentSpec = experimentId | experimentId '=' num100 ('c')?
  let experimentId;
  let fraction;
  let control = false;
  const eq = spec.indexOf(':');
  if (eq == -1) {
    experimentId = spec;
    fraction = 100;
    control = false;
  } else {
    experimentId = spec.substring(0, eq).trim();
    spec = spec.substring(eq + 1);
    if (spec.substring(spec.length - 1) == Selection.CONTROL) {
      control = true;
      spec = spec.substring(0, spec.length - 1);
    }
    fraction = parseInt(spec, 10);
  }
  if (isNaN(fraction)) {
    throw new Error('invalid fraction');
  }

  // Calculate "on"/"off".
  let on;
  if (fraction > 99) {
    // Explicitly "on".
    on = true;
  } else if (fraction < 1) {
    // Explicitly "off".
    on = false;
  } else if (win.sessionStorage) {
    // Fractional and possibly with the control.
    // Note that:
    // a. We can't do persistent experiments if storage is not available.
    // b. We can't run control on more than 20%.
    control = control && fraction <= 20;
    try {
      // Set fraction in the experiment to make it unlaunchable.
      const storageKey =
        'subscribe.google.com:e:' +
        experimentId +
        ':' +
        fraction +
        (control ? 'c' : '');
      let selection = parseSelection(win.sessionStorage.getItem(storageKey));
      if (!selection) {
        // Is experiment/control range?
        if (win.Math.random() * 100 <= fraction * (control ? 2 : 1)) {
          const inExperiment = control ? win.Math.random() <= 0.5 : true;
          selection = inExperiment ? Selection.EXPERIMENT : Selection.CONTROL;
          win.sessionStorage.setItem(storageKey, selection);
        }
      }
      on = !!selection;
      if (selection == Selection.CONTROL) {
        experimentId = 'c-' + experimentId;
      }
    } catch (e) {
      // Ignore: experiment parsing cannot block runtime.
      on = false;
      ErrorUtils.throwAsync(e);
    }
  } else {
    on = false;
  }

  experimentMap[experimentId] = on;
}

/**
 * @param {?string} s
 * @return {?Selection}
 */
function parseSelection(s) {
  // Do a simple if-then to inline the whole Selection enum.
  return s == Selection.EXPERIMENT
    ? Selection.EXPERIMENT
    : s == Selection.CONTROL
    ? Selection.CONTROL
    : null;
}

/**
 * Whether the specified experiment is on or off.
 * @param {!Window} win
 * @param {string} experimentId
 * @return {boolean}
 */
function isExperimentOn(win, experimentId) {
  return getExperiments(win)[experimentId] || false;
}

/**
 * Toggles the experiment on or off. Returns the actual value of the experiment
 * after toggling is done.
 * @param {!Window} win
 * @param {string} experimentId
 * @param {boolean} on
 */
function setExperiment(win, experimentId, on) {
  getExperiments(win)[experimentId] = on;
}

/**
 * @return {!Array<string>}
 */
function getOnExperiments(win) {
  const experimentMap = getExperiments(win);
  const experiments = [];
  for (const experiment in experimentMap) {
    if (experimentMap[experiment]) {
      experiments.push(experiment);
    }
  }
  return experiments;
}

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

/** @const {!Object<string, string>} */
const iframeStyles = {
  opacity: '0',
  position: 'absolute',
  top: '-10px',
  left: '-10px',
  height: '1px',
  width: '1px',
};

// The initial iframe load takes ~500 ms.  We will wait at least that long
// before a page redirect.  Subsequent logs are much faster.  We will wait at
// most 100 ms.
const MAX_FIRST_WAIT = 500;
const MAX_WAIT = 200;
// If we logged and rapidly redirected, we will add a short delay in case
// a message hasn't been transmitted yet.
const TIMEOUT_ERROR = 'AnalyticsService timed out waiting for a response';

/**
 *
 * @param {!string} error
 */
function createErrorResponse(error) {
  const response = new FinishedLoggingResponse();
  response.setComplete(false);
  response.setError(error);
  return response;
}

class AnalyticsService {
  /**
   * @param {!./deps.DepsDef} deps
   * @param {!./fetcher.Fetcher} fetcher
   */
  constructor(deps, fetcher) {
    /** @private @const {!./fetcher.Fetcher} */
    this.fetcher_ = fetcher;

    /** @private @const {!../model/doc.Doc} */
    this.doc_ = deps.doc();

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ = /** @type {!HTMLIFrameElement} */ (createElement(
      this.doc_.getWin().document,
      'iframe',
      {}
    ));
    setImportantStyles(this.iframe_, iframeStyles);
    this.doc_.getBody().appendChild(this.getElement());

    /** @private @type {!boolean} */
    this.everFinishedLog_ = false;

    /**
     * @private @const {!AnalyticsContext}
     */
    this.context_ = new AnalyticsContext();
    this.setStaticContext_();

    /** @private {?Promise<!web-activities/activity-ports.ActivityIframePort>} */
    this.serviceReady_ = null;

    /** @private {?Promise} */
    this.lastAction_ = null;

    /** @private @const {!ClientEventManager} */
    this.eventManager_ = deps.eventManager();
    this.eventManager_.registerEventListener(
      this.handleClientEvent_.bind(this)
    );

    // This code creates a 'promise to log' that we can use to ensure all
    // logging is finished prior to redirecting the page.
    /** @private {!number} */
    this.unfinishedLogs_ = 0;

    /** @private {?function(boolean)} */
    this.loggingResolver_ = null;

    /** @private {?Promise} */
    this.promiseToLog_ = null;

    // If logging doesn't work don't force the user to wait
    /** @private {!boolean} */
    this.loggingBroken_ = false;

    // If logging exceeds the timeouts (see const comments above) don't make
    // the user wait too long.
    /** @private {?number} */
    this.timeout_ = null;
  }

  /**
   * @param {string} transactionId
   */
  setTransactionId(transactionId) {
    const oldTransactionId = this.context_.getTransactionId();
    this.context_.setTransactionId(transactionId);
    if (oldTransactionId != null && oldTransactionId != transactionId) {
      const eventType = AnalyticsEvent.EVENT_NEW_TX_ID;
      const eventParams = new EventParams();
      eventParams.setOldTransactionId(oldTransactionId);
      this.eventManager_.logSwgEvent(
        eventType,
        /* isFromUserAction= */ true,
        eventParams
      );
    }
  }

  /**
   * @return {string}
   */
  getTransactionId() {
    return /** @type {string} */ (this.context_.getTransactionId());
  }

  /**
   * @return {?string}
   */
  getSku() {
    return this.context_.getSku();
  }

  /**
   * @param {string} sku
   */
  setSku(sku) {
    this.context_.setSku(sku);
  }

  /**
   * @param {string} url
   */
  setUrl(url) {
    this.context_.setUrl(url);
  }

  /**
   * @param {!Array<string>} labels
   */
  addLabels(labels) {
    if (labels && labels.length > 0) {
      const newLabels = [].concat(this.context_.getLabelList());
      labels.forEach((label) => {
        if (newLabels.indexOf(label) == -1) {
          newLabels.push(label);
        }
      });
      this.context_.setLabelList(newLabels);
    }
  }

  /**
   * @return {!HTMLIFrameElement}
   */
  getElement() {
    return this.iframe_;
  }

  /**
   * @return {string}
   * @private
   */
  getQueryString_() {
    return this.doc_.getWin().location.search;
  }

  /**
   * @return {string}
   * @private
   */
  getReferrer_() {
    return this.doc_.getWin().document.referrer;
  }

  /**
   * @private
   */
  setStaticContext_() {
    const context = this.context_;
    // These values should all be available during page load.
    if (
      isExperimentOn(
        this.doc_.getWin(),
        ExperimentFlags.UPDATE_GOOGLE_TRANSACTION_ID
      )
    ) {
      context.setTransactionId(getSwgTransactionId());
    } else {
      context.setTransactionId(getUuid());
    }
    context.setReferringOrigin(parseUrl$1(this.getReferrer_()).origin);
    context.setClientVersion('SwG 0.1.22.141');
    context.setUrl(getCanonicalUrl(this.doc_));

    const utmParams = parseQueryString$1(this.getQueryString_());
    const campaign = utmParams['utm_campaign'];
    const medium = utmParams['utm_medium'];
    const source = utmParams['utm_source'];
    if (campaign) {
      context.setUtmCampaign(campaign);
    }
    if (medium) {
      context.setUtmMedium(medium);
    }
    if (source) {
      context.setUtmSource(source);
    }
  }

  /**
   * @return {!Promise<!../components/activities.ActivityIframePort>}
   */
  start() {
    if (!this.serviceReady_) {
      // Please note that currently openIframe reads the current analytics
      // context and that it may not contain experiments activated late during
      // the publishers code lifecycle.
      this.addLabels(getOnExperiments(this.doc_.getWin()));
      this.serviceReady_ = this.activityPorts_
        .openIframe(this.iframe_, feUrl('/serviceiframe'), null, true)
        .then(
          (port) => {
            // Register a listener for the logging to code indicate it is
            // finished logging.
            port.on(FinishedLoggingResponse, this.afterLogging_.bind(this));
            return port.whenReady().then(() => {
              // The publisher should be done setting experiments but runtime
              // will forward them here if they aren't.
              this.addLabels(getOnExperiments(this.doc_.getWin()));
              return port;
            });
          },
          (message) => {
            // If the port doesn't open register that logging is broken so
            // nothing is just waiting.
            this.loggingBroken_ = true;
            this.afterLogging_(
              createErrorResponse('Could not connect [' + message + ']')
            );
          }
        );
    }
    return this.serviceReady_;
  }

  /**
   * @param {boolean} isReadyToPay
   */
  setReadyToPay(isReadyToPay) {
    this.context_.setReadyToPay(isReadyToPay);
  }

  /**
   */
  close() {
    this.doc_.getBody().removeChild(this.getElement());
  }

  /**
   * @return {!AnalyticsContext}
   */
  getContext() {
    return this.context_;
  }

  /**
   * @param {!../api/client-event-manager-api.ClientEvent} event
   * @return {!AnalyticsRequest}
   */
  createLogRequest_(event) {
    const meta = new AnalyticsEventMeta();
    meta.setEventOriginator(event.eventOriginator);
    meta.setIsFromUserAction(event.isFromUserAction);

    const request = new AnalyticsRequest();
    request.setEvent(event.eventType);
    request.setContext(this.context_);
    request.setMeta(meta);
    if (event.additionalParameters instanceof EventParams) {
      request.setParams(event.additionalParameters);
    } // Ignore event.additionalParameters.  It may have data we shouldn't log.
    return request;
  }

  /**
   * @return {boolean}
   */
  shouldLogPublisherEvents_() {
    return this.deps_.config().enableSwgAnalytics === true;
  }

  /**
   * @param {!../api/client-event-manager-api.ClientEvent} event
   * @return {boolean}
   */
  shouldAlwaysLogEvent_(event) {
    /* AMP_CLIENT events are considered publisher events and we generally only
     * log those if the publisher decided to enable publisher event logging for
     * privacy purposes.  The page load event is not private and is necessary
     * just so we know the user is in AMP, so we will log it regardless of
     * configuration.
     */
    return (
      event.eventType === AnalyticsEvent.IMPRESSION_PAGE_LOAD &&
      event.eventOriginator === EventOriginator.AMP_CLIENT
    );
  }

  /**
   *  Listens for new events from the events manager and handles logging
   * @param {!../api/client-event-manager-api.ClientEvent} event
   */
  handleClientEvent_(event) {
    //this event is just used to communicate information internally.  It should
    //not be reported to the SwG analytics service.
    if (event.eventType === AnalyticsEvent.EVENT_SUBSCRIPTION_STATE) {
      return;
    }

    if (
      ClientEventManager.isPublisherEvent(event) &&
      !this.shouldLogPublisherEvents_() &&
      !this.shouldAlwaysLogEvent_(event)
    ) {
      return;
    }
    // Register we sent a log, the port will call this.afterLogging_ when done.
    this.unfinishedLogs_++;
    this.lastAction_ = this.start().then((port) => {
      const analyticsRequest = this.createLogRequest_(event);
      port.execute(analyticsRequest);
      if (isExperimentOn(this.doc_.getWin(), ExperimentFlags.LOGGING_BEACON)) {
        this.sendBeacon_(analyticsRequest);
      }
    });
  }

  /**
   * This function is called by the iframe after it sends the log to the server.
   * @param {FinishedLoggingResponse=} response
   */
  afterLogging_(response) {
    const success = (response && response.getComplete()) || false;
    const error = (response && response.getError()) || 'Unknown logging Error';
    const isTimeout = error === TIMEOUT_ERROR;

    if (!success) {
      log_5('Error when logging: ' + error);
    }

    this.unfinishedLogs_--;
    if (!isTimeout) {
      this.everFinishedLog_ = true;
    }

    // Nothing is waiting
    if (this.loggingResolver_ === null) {
      return;
    }

    if (this.unfinishedLogs_ === 0 || this.loggingBroken_ || isTimeout) {
      if (this.timeout_ !== null) {
        clearTimeout(this.timeout_);
        this.timeout_ = null;
      }
      this.loggingResolver_(success);
      this.promiseToLog_ = null;
      this.loggingResolver_ = null;
    }
  }

  /**
   * Please note that logs sent after getLoggingPromise is called are not
   * guaranteed to be finished when the promise is resolved.  You should call
   * this function just prior to redirecting the page after SwG is finished
   * logging.
   * @return {!Promise}
   */
  getLoggingPromise() {
    if (this.unfinishedLogs_ === 0 || this.loggingBroken_) {
      return Promise.resolve(true);
    }
    if (this.promiseToLog_ === null) {
      this.promiseToLog_ = new Promise((resolve) => {
        this.loggingResolver_ = resolve;
      });

      // The promise above should not wait forever if things go wrong.  Let
      // the user proceed!
      const whenDone = this.afterLogging_.bind(this);
      this.timeout_ = setTimeout(
        () => {
          this.timeout_ = null;
          whenDone(createErrorResponse(TIMEOUT_ERROR));
        },
        this.everFinishedLog_ ? MAX_WAIT : MAX_FIRST_WAIT
      );
    }

    return this.promiseToLog_;
  }

  /**
   * A beacon is a rapid fire browser request that does not wait for a response
   * from the server.  It is guaranteed to go out before the page redirects.
   * @param {!AnalyticsRequest} analyticsRequest
   */
  sendBeacon_(analyticsRequest) {
    const pubId = encodeURIComponent(
      this.deps_.pageConfig().getPublicationId()
    );
    const url = serviceUrl('/publication/' + pubId + '/clientlogs');
    this.fetcher_.sendBeacon(url, analyticsRequest);
  }
}

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

/** @const {!Object<string, string>} */
const iframeAttributes$1 = {
  'frameborder': '0',
  'scrolling': 'no',
};

/**
 * @enum {string}
 */
const Theme = {
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * The class for Smart button Api.
 */
class SmartSubscriptionButtonApi {
  /**
   * @param {!./deps.DepsDef} deps
   * @param {!Element} button
   * @param {!../api/subscriptions.SmartButtonOptions} options
   * @param {function()=} callback
   */
  constructor(deps, button, options, callback) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!Document} */
    this.doc_ = this.win_.document;

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ = /** @type {!HTMLIFrameElement} */ (createElement(
      this.doc_,
      'iframe',
      iframeAttributes$1
    ));

    /** @private @const {!Element} */
    this.button_ = button;

    /** @private {!../api/subscriptions.SmartButtonOptions} */
    this.options_ = options;

    /** @private const {function()=} */
    this.callback_ = callback;

    /** @private @const {string} */
    this.src_ = feUrl('/smartboxiframe');

    const frontendArguments = {
      'productId': this.deps_.pageConfig().getProductId(),
      'publicationId': this.deps_.pageConfig().getPublicationId(),
      'theme': (this.options_ && this.options_.theme) || 'light',
      'lang': (this.options_ && this.options_.lang) || 'en',
    };
    const messageTextColor = this.options_ && this.options_.messageTextColor;
    if (messageTextColor) {
      frontendArguments['messageTextColor'] = messageTextColor;
    }

    /** @private @const {!Object} */
    this.args_ = feArgs(frontendArguments);
  }

  /**
   * @param {SmartBoxMessage} smartBoxMessage
   */
  handleSmartBoxClick_(smartBoxMessage) {
    if (smartBoxMessage && smartBoxMessage.getIsClicked()) {
      if (!this.callback_) {
        throw new Error('No callback!');
      }
      this.callback_();
      return;
    }
  }

  /**
   * Make a call to build button content and listens for the 'click' message.
   * @return {!Element}
   */
  start() {
    setImportantStyles(this.iframe_, {
      'opacity': 1,
      'position': 'absolute',
      'top': 0,
      'bottom': 0,
      'left': 0,
      'height': '100%',
      'right': 0,
      'width': '100%',
    });
    this.button_.appendChild(this.iframe_);
    const args = this.activityPorts_.addDefaultArguments(this.args_);
    this.activityPorts_
      .openIframe(this.iframe_, this.src_, args)
      .then((port) => {
        port.on(SmartBoxMessage, this.handleSmartBoxClick_.bind(this));
      });
    return this.iframe_;
  }
}

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

/** English is the default language. */
const DEFAULT_LANGUAGE_CODE = 'en';

/**
 * Gets a message for a given language code, from a map of messages.
 * @param {!Object<string, string>} map
 * @param {?string|?Element} languageCodeOrElement
 * @return {?string}
 */
function msg(map, languageCodeOrElement) {
  const defaultMsg = map[DEFAULT_LANGUAGE_CODE];

  // Verify params.
  if (typeof map !== 'object' || !languageCodeOrElement) {
    return defaultMsg;
  }

  // Get language code.
  let languageCode =
    typeof languageCodeOrElement === 'string'
      ? languageCodeOrElement
      : getLanguageCodeFromElement(languageCodeOrElement);

  // Normalize language code.
  languageCode = languageCode.toLowerCase();
  languageCode = languageCode.replace(/_/g, '-');

  // Search for a message matching the language code.
  // If a message can't be found, try again with a less specific language code.
  const languageCodeSegments = languageCode.split('-');
  while (languageCodeSegments.length) {
    const key = languageCodeSegments.join('-');
    if (key in map) {
      return map[key];
    }

    // Simplify language code.
    // Ex: "en-US-SF" => "en-US"
    languageCodeSegments.pop();
  }

  // There was an attempt.
  return defaultMsg;
}

/**
 * Gets a language code (ex: "en-US") from a given Element.
 * @param {!Element} element
 * @return {string}
 */
function getLanguageCodeFromElement(element) {
  if (element.lang) {
    // Get language from element itself.
    return element.lang;
  }

  if (element.ownerDocument && element.ownerDocument.documentElement.lang) {
    // Get language from element's document.
    return element.ownerDocument.documentElement.lang;
  }

  // There was an attempt.
  return DEFAULT_LANGUAGE_CODE;
}

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

/**
 * The button title should match that of button's SVG.
 */
/** @type {!Object<string, string>} */
const TITLE_LANG_MAP = {
  'en': 'Subscribe with Google',
  'ar': 'Google اشترك مع',
  'de': 'Abonnieren mit Google',
  'es': 'Suscríbete con Google',
  'es-latam': 'Suscríbete con Google',
  'es-latn': 'Suscríbete con Google',
  'fr': "S'abonner avec Google",
  'hi': 'Google के ज़रिये सदस्यता',
  'id': 'Berlangganan dengan Google',
  'it': 'Abbonati con Google',
  'jp': 'Google で購読',
  'ko': 'Google 을 통한구독',
  'ms': 'Langgan dengan Google',
  'nl': 'Abonneren via Google',
  'no': 'Abonner med Google',
  'pl': 'Subskrybuj z Google',
  'pt': 'Subscrever com o Google',
  'pt-br': 'Assine com o Google',
  'ru': 'Подпиcka через Google',
  'se': 'Prenumerera med Google',
  'th': 'สมัครฟาน Google',
  'tr': 'Google ile Abone Ol',
  'uk': 'Підписатися через Google',
  'zh-tw': '透過 Google 訂閱',
};

/**
 * The button stylesheet can be found in the `/assets/swg-button.css`.
 * It's produced by the `gulp assets` task and deployed to
 * `https://news.google.com/swg/js/v1/swg-button.css`.
 */
class ButtonApi {
  /**
   * @param {!../model/doc.Doc} doc
   * @param {!Promise<!./runtime.ConfiguredRuntime>} configuredRuntimePromise
   */
  constructor(doc, configuredRuntimePromise) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = doc;

    /** @private @const {!Promise<!./runtime.ConfiguredRuntime>} */
    this.configuredRuntimePromise_ = configuredRuntimePromise;
  }

  /**
   */
  init() {
    const head = this.doc_.getHead();
    if (!head) {
      return;
    }

    const url = 'https://news.google.com/swg/js/v1/swg-button.css';
    const existing = head.querySelector(`link[href="${url}"]`);
    if (existing) {
      return;
    }

    // <link rel="stylesheet" href="..." type="text/css">
    head.appendChild(
      createElement(this.doc_.getWin().document, 'link', {
        'rel': 'stylesheet',
        'type': 'text/css',
        'href': url,
      })
    );
  }

  /**
   * @param {!../api/subscriptions.ButtonOptions|function()} optionsOrCallback
   * @param {function()=} callback
   * @return {!Element}
   */
  create(optionsOrCallback, callback) {
    const button = createElement(this.doc_.getWin().document, 'button', {});
    return this.attach(button, optionsOrCallback, callback);
  }

  /**
   * @param {!Element} button
   * @param {../api/subscriptions.ButtonOptions|function()} optionsOrCallback
   * @param {function()=} callback
   * @return {!Element}
   */
  attach(button, optionsOrCallback, callback) {
    const options = this.setupButtonAndGetParams_(
      button,
      optionsOrCallback,
      callback
    ).options;

    const theme = options['theme'];
    button.classList.add(`swg-button-${theme}`);
    button.setAttribute('role', 'button');
    if (options['lang']) {
      button.setAttribute('lang', options['lang']);
    }
    button.setAttribute('title', msg(TITLE_LANG_MAP, button) || '');
    this.logSwgEvent_(AnalyticsEvent.IMPRESSION_SWG_BUTTON);

    return button;
  }

  /**
   * @param {!AnalyticsEvent} eventType
   * @param {boolean=} isFromUserAction
   */
  logSwgEvent_(eventType, isFromUserAction) {
    this.configuredRuntimePromise_.then((configuredRuntime) => {
      configuredRuntime.eventManager().logSwgEvent(eventType, isFromUserAction);
    });
  }

  /**
   *
   * @param {../api/subscriptions.ButtonOptions|../api/subscriptions.SmartButtonOptions|function()} optionsOrCallback
   * @return {!../api/subscriptions.ButtonOptions|!../api/subscriptions.SmartButtonOptions}
   * @private
   */
  getOptions_(optionsOrCallback) {
    const options = /** @type {!../api/subscriptions.ButtonOptions|!../api/subscriptions.SmartButtonOptions} */ (optionsOrCallback &&
    typeof optionsOrCallback != 'function'
      ? optionsOrCallback
      : {'theme': Theme.LIGHT});

    const theme = options['theme'];
    if (theme !== Theme.LIGHT && theme !== Theme.DARK) {
      options['theme'] = Theme.LIGHT;
    }
    return options;
  }

  /**
   *
   * @param {?../api/subscriptions.ButtonOptions|?../api/subscriptions.SmartButtonOptions|function()} optionsOrCallback
   * @param {function()=} callback
   * @return {function()|function(Event):boolean}
   * @private
   */
  getCallback_(optionsOrCallback, callback) {
    return /** @type {function()|function(Event):boolean} */ ((typeof optionsOrCallback ==
    'function'
      ? optionsOrCallback
      : null) || callback);
  }

  /**
   * @param {!Element} button
   * @param {../api/subscriptions.SmartButtonOptions|function()|../api/subscriptions.ButtonOptions} optionsOrCallback
   * @param {function()=} callbackFun
   * @return {ButtonParams}
   */
  setupButtonAndGetParams_(button, optionsOrCallback, callbackFun) {
    const options = this.getOptions_(optionsOrCallback);
    const callback = this.getCallback_(optionsOrCallback, callbackFun);
    const clickFun = (event) => {
      this.logSwgEvent_(AnalyticsEvent.ACTION_SWG_BUTTON_CLICK, true);
      if (typeof callback === 'function') {
        callback(event);
      }
    };
    button.addEventListener('click', clickFun);
    return {options, clickFun};
  }

  /**
   * @param {!./deps.DepsDef} deps
   * @param {!Element} button
   * @param {../api/subscriptions.SmartButtonOptions|function()} optionsOrCallback
   * @param {function()=} callback
   * @return {!Element}
   */
  attachSmartButton(deps, button, optionsOrCallback, callback) {
    const params = this.setupButtonAndGetParams_(
      button,
      optionsOrCallback,
      callback
    );
    // Add required CSS class, if missing.
    button.classList.add('swg-smart-button');
    return new SmartSubscriptionButtonApi(
      deps,
      button,
      params.options,
      params.clickFun
    ).start();
  }
}

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

/** @enum {number} */
const CallbackId = {
  ENTITLEMENTS: 1,
  SUBSCRIBE_REQUEST: 2,
  PAYMENT_RESPONSE: 3,
  LOGIN_REQUEST: 4,
  LINK_PROGRESS: 5,
  LINK_COMPLETE: 6,
  FLOW_STARTED: 7,
  FLOW_CANCELED: 8,
};

/**
 */
class Callbacks {
  /**
   */
  constructor() {
    /** @private @const {!Object<CallbackId, function(*)>} */
    this.callbacks_ = {};
    /** @private @const {!Object<CallbackId, *>} */
    this.resultBuffer_ = {};
    /** @private {?Promise} */
    this.paymentResponsePromise_ = null;
  }

  /**
   * @param {function(!Promise<!../api/entitlements.Entitlements>)} callback
   */
  setOnEntitlementsResponse(callback) {
    this.setCallback_(CallbackId.ENTITLEMENTS, callback);
  }

  /**
   * @param {!Promise<!../api/entitlements.Entitlements>} promise
   */
  triggerEntitlementsResponse(promise) {
    return this.trigger_(
      CallbackId.ENTITLEMENTS,
      promise.then((res) => res.clone())
    );
  }

  /**
   * @return {boolean}
   */
  hasEntitlementsResponsePending() {
    return !!this.resultBuffer_[CallbackId.ENTITLEMENTS];
  }

  /**
   * @param {function(!../api/subscriptions.LoginRequest)} callback
   */
  setOnLoginRequest(callback) {
    this.setCallback_(CallbackId.LOGIN_REQUEST, callback);
  }

  /**
   * @param {!../api/subscriptions.LoginRequest} request
   * @return {boolean} Whether the callback has been found.
   */
  triggerLoginRequest(request) {
    return this.trigger_(CallbackId.LOGIN_REQUEST, request);
  }

  /**
   * @param {function()} callback
   */
  setOnLinkProgress(callback) {
    this.setCallback_(CallbackId.LINK_PROGRESS, callback);
  }

  /**
   * @return {boolean} Whether the callback has been found.
   */
  triggerLinkProgress() {
    return this.trigger_(CallbackId.LINK_PROGRESS, true);
  }

  /**
   */
  resetLinkProgress() {
    this.resetCallback_(CallbackId.LINK_PROGRESS);
  }

  /**
   * @param {function()} callback
   */
  setOnLinkComplete(callback) {
    this.setCallback_(CallbackId.LINK_COMPLETE, callback);
  }

  /**
   * @return {boolean} Whether the callback has been found.
   */
  triggerLinkComplete() {
    return this.trigger_(CallbackId.LINK_COMPLETE, true);
  }

  /**
   * @return {boolean}
   */
  hasLinkCompletePending() {
    return !!this.resultBuffer_[CallbackId.LINK_COMPLETE];
  }

  /**
   * @param {function()} callback
   */
  setOnSubscribeRequest(callback) {
    this.setCallback_(CallbackId.SUBSCRIBE_REQUEST, callback);
  }

  /**
   * @return {boolean} Whether the callback has been found.
   */
  triggerSubscribeRequest() {
    return this.trigger_(CallbackId.SUBSCRIBE_REQUEST, true);
  }

  /**
   * @return {boolean}
   */
  hasSubscribeRequestCallback() {
    return !!this.callbacks_[CallbackId.SUBSCRIBE_REQUEST];
  }

  /**
   * @param {function(!Promise<!../api/subscribe-response.SubscribeResponse>)} callback
   */
  setOnSubscribeResponse(callback) {
    log_4(
      `[swg.js:setOnSubscribeResponse]: This method has been deprecated, please switch usages to 'setOnPaymentResponse'`
    );
    this.setCallback_(CallbackId.PAYMENT_RESPONSE, callback);
  }

  /**
   * @param {function(!Promise<!../api/subscribe-response.SubscribeResponse>)} callback
   */
  setOnContributionResponse(callback) {
    log_4(
      `[swg.js:setOnContributionResponse]: This method has been deprecated, please switch usages to 'setOnPaymentResponse'`
    );
    this.setCallback_(CallbackId.PAYMENT_RESPONSE, callback);
  }

  /**
   * @param {function(!Promise<!../api/subscribe-response.SubscribeResponse>)} callback
   */
  setOnPaymentResponse(callback) {
    this.setCallback_(CallbackId.PAYMENT_RESPONSE, callback);
  }

  /**
   * @param {!Promise<!../api/subscribe-response.SubscribeResponse>} responsePromise
   * @return {boolean} Whether the callback has been found.
   */
  triggerPaymentResponse(responsePromise) {
    this.paymentResponsePromise_ = responsePromise.then(
      (res) => {
        this.trigger_(
          CallbackId.PAYMENT_RESPONSE,
          Promise.resolve(res.clone())
        );
      },
      (reason) => {
        if (isCancelError(reason)) {
          return;
        }
        throw reason;
      }
    );
    return !!this.callbacks_[CallbackId.PAYMENT_RESPONSE];
  }

  /**
   * @return {boolean}
   */
  hasPaymentResponsePending() {
    return !!this.resultBuffer_[CallbackId.PAYMENT_RESPONSE];
  }

  /**
   * @param {function({flow: string, data: !Object})} callback
   */
  setOnFlowStarted(callback) {
    this.setCallback_(CallbackId.FLOW_STARTED, callback);
  }

  /**
   * @param {string} flow
   * @param {!Object=} data
   * @return {boolean} Whether the callback has been found.
   */
  triggerFlowStarted(flow, data = {}) {
    return this.trigger_(CallbackId.FLOW_STARTED, {
      flow,
      data,
    });
  }

  /**
   * @param {function({flow: string, data: !Object})} callback
   */
  setOnFlowCanceled(callback) {
    this.setCallback_(CallbackId.FLOW_CANCELED, callback);
  }

  /**
   * @param {string} flow
   * @param {!Object=} data
   * @return {boolean} Whether the callback has been found.
   */
  triggerFlowCanceled(flow, data = {}) {
    return this.trigger_(CallbackId.FLOW_CANCELED, {
      flow,
      data,
    });
  }

  /**
   * @param {!CallbackId} id
   * @param {function(?)} callback
   * @private
   */
  setCallback_(id, callback) {
    if (this.callbacks_[id]) {
      log_4(
        `[swg.js]: You have registered multiple callbacks for the same response.`
      );
    }
    this.callbacks_[id] = callback;
    // If result already exist, execute the callback right away.
    if (id in this.resultBuffer_) {
      this.executeCallback_(id, callback, this.resultBuffer_[id]);
    }
  }

  /**
   * @param {!CallbackId} id
   * @param {*} data
   * @return {boolean}
   * @private
   */
  trigger_(id, data) {
    this.resultBuffer_[id] = data;
    const callback = this.callbacks_[id];
    if (callback) {
      this.executeCallback_(id, callback, data);
    }
    return !!callback;
  }

  /**
   * @param {!CallbackId} id
   * @private
   */
  resetCallback_(id) {
    if (id in this.resultBuffer_) {
      delete this.resultBuffer_[id];
    }
  }

  /**
   * @param {!CallbackId} id
   * @param {function(*)} callback
   * @param {*} data
   * @private
   */
  executeCallback_(id, callback, data) {
    // Always execute callbacks in a microtask.
    Promise.resolve().then(() => {
      callback(data);
      this.resetCallback_(id);
    });
  }
}

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

/**
 * The class for Contributions flow.
 */
class ContributionsFlow {
  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.OffersRequest|undefined} options
   */
  constructor(deps, options) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!../api/subscriptions.OffersRequest|undefined} */
    this.options_ = options;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    const isClosable = (options && options.isClosable) || true;

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/contributionsiframe'),
      feArgs({
        'productId': deps.pageConfig().getProductId(),
        'publicationId': deps.pageConfig().getPublicationId(),
        'productType': ProductType.UI_CONTRIBUTION,
        'list': (options && options.list) || 'default',
        'skus': (options && options.skus) || null,
        'isClosable': isClosable,
      }),
      /* shouldFadeBody */ true
    );
  }

  /**
   * @param {AlreadySubscribedResponse} response
   */
  handleLinkRequest_(response) {
    if (response.getSubscriberOrMember()) {
      this.deps_.callbacks().triggerLoginRequest({
        linkRequested: !!response.getLinkRequested(),
      });
    }
  }

  /**
   * @param {SkuSelectedResponse} response
   */
  startPayFlow_(response) {
    const sku = response.getSku();
    const isOneTime = response.getOneTime();
    if (sku) {
      const /** @type {../api/subscriptions.SubscriptionRequest} */ contributionRequest = {
          'skuId': sku,
        };
      if (isOneTime) {
        contributionRequest['oneTime'] = isOneTime;
      }
      new PayStartFlow(
        this.deps_,
        contributionRequest,
        ProductType.UI_CONTRIBUTION
      ).start();
    }
  }

  /**
   * Starts the contributions flow or alreadyMember flow.
   * @return {!Promise}
   */
  start() {
    // Start/cancel events.
    this.deps_
      .callbacks()
      .triggerFlowStarted(SubscriptionFlows.SHOW_CONTRIBUTION_OPTIONS);
    this.activityIframeView_.onCancel(() => {
      this.deps_
        .callbacks()
        .triggerFlowCanceled(SubscriptionFlows.SHOW_CONTRIBUTION_OPTIONS);
    });
    this.activityIframeView_.on(
      AlreadySubscribedResponse,
      this.handleLinkRequest_.bind(this)
    );
    this.activityIframeView_.on(
      SkuSelectedResponse,
      this.startPayFlow_.bind(this)
    );

    return this.dialogManager_.openView(this.activityIframeView_);
  }
}

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

/**
 * The flow to initiate deferred account process.
 * See `Subscriptions.completeDeferredAccountCreation` API.
 */
class DeferredAccountFlow {
  /**
   * @param {!./deps.DepsDef} deps
   * @param {?../api/deferred-account-creation.DeferredAccountCreationRequest} options
   */
  constructor(deps, options) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {?ActivityIframeView} */
    this.activityIframeView_ = null;

    /** @private {?Promise} */
    this.openPromise_ = null;

    /** @type {!../api/deferred-account-creation.DeferredAccountCreationRequest} */
    const defaultOptions = {
      entitlements: null,
      consent: true,
    };
    /** @private @const {!../api/deferred-account-creation.DeferredAccountCreationRequest} */
    this.options_ = Object.assign(defaultOptions, options || {});
  }

  /**
   * Starts the deferred account flow.
   * @return {!Promise<!DeferredAccountCreationResponse>}
   */
  start() {
    const entitlements = this.options_.entitlements;

    // For now, entitlements are required to be present and have the Google
    // token. This is strictly not required for the implementation. But it's
    // preferrable API-wise at this time.
    if (!entitlements || !entitlements.getEntitlementForSource('google')) {
      throw new Error('No entitlements with "google" source');
    }

    // Start/cancel events.
    this.deps_
      .callbacks()
      .triggerFlowStarted(SubscriptionFlows.COMPLETE_DEFERRED_ACCOUNT_CREATION);

    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/recoveriframe'),
      feArgs({
        'publicationId': this.deps_.pageConfig().getPublicationId(),
        'productId': this.deps_.pageConfig().getProductId(),
        'entitlements': (entitlements && entitlements.raw) || null,
        'consent': this.options_.consent,
      }),
      /* shouldFadeBody */ true
    );

    this.openPromise_ = this.dialogManager_.openView(this.activityIframeView_);
    return this.activityIframeView_.acceptResult().then(
      (result) => {
        // The consent part is complete.
        return this.handleConsentResponse_(
          /** @type {!Object} */ (result.data)
        );
      },
      (reason) => {
        if (isCancelError(reason)) {
          this.deps_
            .callbacks()
            .triggerFlowCanceled(
              SubscriptionFlows.COMPLETE_DEFERRED_ACCOUNT_CREATION
            );
        } else {
          this.dialogManager_.completeView(this.activityIframeView_);
        }
        throw reason;
      }
    );
  }

  /**
   * @param {!Object} data
   * @return {!DeferredAccountCreationResponse}
   * @private
   */
  handleConsentResponse_(data) {
    this.deps_.entitlementsManager().blockNextNotification();

    // Parse the response.
    const entitlementsJwt = data['entitlements'];
    const idToken = data['idToken'];
    const productType = data['productType'];
    const entitlements = this.deps_
      .entitlementsManager()
      .parseEntitlements({'signedEntitlements': entitlementsJwt});
    const userData = new UserData(
      idToken,
      /** @type {!Object} */ (new JwtHelper().decode(idToken))
    );
    const purchaseDataList = data['purchaseDataList']
      ? data['purchaseDataList'].map(
          (pd) => new PurchaseData(pd['data'], pd['signature'])
        )
      : [
          // TODO(dvoytenko): cleanup/deprecate.
          new PurchaseData(
            data['purchaseData']['data'],
            data['purchaseData']['signature']
          ),
        ];

    // For now, we'll use the `PayCompleteFlow` as a "creating account" flow.
    // But this can be eventually implemented by the same iframe.
    const creatingFlow = new PayCompleteFlow(this.deps_);
    const completeHandler = creatingFlow.complete.bind(creatingFlow);

    const response = new DeferredAccountCreationResponse(
      entitlements,
      userData,
      purchaseDataList,
      completeHandler
    );

    this.deps_
      .eventManager()
      .logSwgEvent(AnalyticsEvent.ACTION_NEW_DEFERRED_ACCOUNT, true);

    // Start the "sync" flow.
    creatingFlow.start(
      new SubscribeResponse$1(
        '', // raw field doesn't matter in this case
        purchaseDataList[0],
        userData,
        entitlements,
        productType,
        () => Promise.resolve() // completeHandler doesn't matter in this case
      )
    );
    return response;
  }
}

const CSS = "body{padding:0;margin:0}swg-container,swg-loading,swg-loading-animate,swg-loading-image{display:block}swg-loading-container{width:100%!important;display:-ms-flexbox!important;display:flex!important;-ms-flex-align:center!important;align-items:center!important;-ms-flex-pack:center!important;justify-content:center!important;min-height:148px!important;height:100%!important;bottom:0!important;margin-top:5px!important;z-index:2147483647!important}@media (min-height:630px), (min-width:630px){swg-loading-container{width:560px!important;margin-left:35px!important;border-top-left-radius:8px!important;border-top-right-radius:8px!important;background-color:#fff!important;box-shadow:0 1px 1px rgba(60,64,67,.3),0 1px 4px 1px rgba(60,64,67,.15)!important}}swg-loading{z-index:2147483647!important;width:36px;height:36px;overflow:hidden;animation:mspin-rotate 1568.63ms linear infinite}swg-loading-animate{animation:mspin-revrot 5332ms steps(4) infinite}swg-loading-image{background-image:url(https://news.google.com/swg/js/v1/loader.svg);background-size:100%;width:11664px;height:36px;animation:swg-loading-film 5332ms steps(324) infinite}@keyframes swg-loading-film{0%{transform:translateX(0)}to{transform:translateX(-11664px)}}@keyframes mspin-rotate{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}@keyframes mspin-revrot{0%{transform:rotate(0deg)}to{transform:rotate(-1turn)}}\n/*# sourceURL=/./src/ui/ui.css*/";

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

/** @const {!Object<string|number>} */
const friendlyIframeAttributes = {
  'frameborder': 0,
  'scrolling': 'no',
  'src': 'about:blank',
};

/**
 * The class for building friendly iframe.
 */
class FriendlyIframe {
  /**
   * @param {!Document} doc
   * @param {!Object<string, string|number>=} attrs
   */
  constructor(doc, attrs = {}) {
    const mergedAttrs = Object.assign({}, friendlyIframeAttributes, attrs);

    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ = /** @type {!HTMLIFrameElement} */ (createElement(
      doc,
      'iframe',
      mergedAttrs
    ));

    // Ensure that the new iframe does not inherit any CSS styles.
    resetAllStyles(this.iframe_);

    /** @private @const {!Promise} */
    this.ready_ = new Promise((resolve) => {
      this.iframe_.onload = resolve;
    });
  }

  /**
   * When promise is resolved.
   * @return {!Promise}
   */
  whenReady() {
    return this.ready_;
  }

  /**
   * Gets the iframe element.
   * @return {!HTMLIFrameElement}
   */
  getElement() {
    return this.iframe_;
  }

  /**
   * Gets the document object of the iframe element.
   * @return {!Document}
   */
  getDocument() {
    const doc =
      this.getElement().contentDocument ||
      (this.getElement().contentWindow &&
        this.getElement().contentWindow.document);

    if (!doc) {
      throw new Error('not loaded');
    }
    return doc;
  }

  /**
   * Gets the body of the iframe.
   * @return {!Element}
   */
  getBody() {
    return /** @type {!Element} */ (this.getDocument().body);
  }

  /**
   * Whether the iframe is connected.
   * @return {boolean}
   */
  isConnected() {
    return isConnected(this.getElement());
  }
}

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

/**
 * Returns a promise which is resolved after the given duration of animation
 * @param {!Element} el - Element to be observed.
 * @param {!Object<string, string|number>} props - properties to be animated.
 * @param {number} durationMillis - duration of animation.
 * @param {string} curve - transition function for the animation.
 * @return {!Promise} Promise which resolves once the animation is done playing.
 */
function transition(el, props, durationMillis, curve) {
  const win = el.ownerDocument.defaultView;
  const previousTransitionValue = el.style.transition || '';
  return new Promise((resolve) => {
    win.setTimeout(() => {
      win.setTimeout(resolve, durationMillis);
      const tr = `${durationMillis}ms ${curve}`;
      setImportantStyles(
        el,
        Object.assign(
          {
            'transition': `transform ${tr}, opacity ${tr}`,
          },
          props
        )
      );
    });
  }).then(() => {
    setImportantStyles(el, {
      'transition': previousTransitionValue,
    });
  });
}

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

class Graypane {
  /**
   * @param {!../model/doc.Doc} doc
   * @param {number} zIndex
   */
  constructor(doc, zIndex) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = doc;

    /** @private @const {!Element} */
    this.fadeBackground_ = this.doc_
      .getWin()
      .document.createElement('swg-popup-background');
    setImportantStyles(this.fadeBackground_, {
      'z-index': zIndex,
      'display': 'none',
      'position': 'fixed',
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0,
      'background-color': 'rgba(32, 33, 36, .6)',
    });
  }

  /**
   * @return {!Element}
   */
  getElement() {
    return this.fadeBackground_;
  }

  /**
   * @return {boolean}
   */
  isAttached() {
    return !!this.fadeBackground_.parentNode;
  }

  /**
   * Attaches the graypane to the document.
   */
  attach() {
    this.doc_.getBody().appendChild(this.fadeBackground_);
  }

  /**
   * Detaches the graypane to the document.
   */
  destroy() {
    this.doc_.getBody().removeChild(this.fadeBackground_);
  }

  /**
   * Shows the graypane.
   * @param {boolean=} animated
   * @return {!Promise|undefined}
   */
  show(animated = true) {
    setImportantStyles(this.fadeBackground_, {
      'display': 'block',
      'opacity': animated ? 0 : 1,
    });
    if (animated) {
      return transition(
        this.fadeBackground_,
        {
          'opacity': 1,
        },
        300,
        'ease-out'
      );
    }
  }

  /**
   * Hides the graypane.
   * @param {boolean=} animated
   * @return {!Promise|undefined}
   */
  hide(animated = true) {
    if (animated) {
      return transition(
        this.fadeBackground_,
        {
          'opacity': 0,
        },
        300,
        'ease-out'
      ).then(() => {
        setImportantStyles(this.fadeBackground_, {'display': 'none'});
      });
    }
    setImportantStyles(this.fadeBackground_, {'display': 'none'});
  }
}

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

/**
 * Loading indicator class. Builds the loading indicator view to be injected in
 * parent element <iframe class="swg-dialog"> element. Provides methods to
 * show/hide loading indicator.
 */
class LoadingView {
  /**
   * @param {!Document} doc
   */
  constructor(doc) {
    /** @private @const {!Document} */
    this.doc_ = doc;

    /** @private @const {!Element} */
    this.loadingContainer_ = createElement(
      this.doc_,
      'swg-loading-container',
      {}
    );

    /** @private @const {!Element} */
    this.loading_ = createElement(this.doc_, 'swg-loading', {});
    this.loadingContainer_.appendChild(this.loading_);

    this.loadingContainer_.style.setProperty('display', 'none', 'important');

    // Build the animated loading indicator.
    this.buildLoadingIndicator_();
  }

  /**
   * Gets the populated loading container.
   * @return {!Element}
   */
  getElement() {
    return this.loadingContainer_;
  }

  /**
   * Shows the loading indicator within the container element.
   */
  show() {
    this.loadingContainer_.style.removeProperty('display');
  }

  /**
   * Hides the loading indicator within the container element.
   */
  hide() {
    this.loadingContainer_.style.setProperty('display', 'none', 'important');
  }

  /**
   * Populates the loading indivicator. The populated element
   * can be added in any view, when required.
   * @private
   */
  buildLoadingIndicator_() {
    const loadingContainer = this.loading_;

    const loadingIndicatorTopContainer = createElement(
      this.doc_,
      'swg-loading-animate',
      {}
    );
    loadingContainer.appendChild(loadingIndicatorTopContainer);

    const loadingIndicatorChildContainer = createElement(
      this.doc_,
      'swg-loading-image',
      {}
    );
    loadingIndicatorTopContainer.appendChild(loadingIndicatorChildContainer);
  }
}

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

/**
 * @param {!Document} doc
 * @return {string}
 */
function getReadyState(doc) {
  return /** @type {string} */ (doc['readyState']);
}

/**
 * Whether the document is ready.
 * @param {!Document} doc
 * @return {boolean}
 */
function isDocumentReady(doc) {
  const readyState = getReadyState(doc);
  return readyState != 'loading' && readyState != 'uninitialized';
}

/**
 * Calls the callback when document is ready.
 * @param {!Document} doc
 * @param {function(!Document)} callback
 */
function onDocumentReady(doc, callback) {
  onDocumentState(doc, isDocumentReady, callback);
}

/**
 * Calls the callback once when document's state satisfies the condition.
 * @param {!Document} doc
 * @param {function(!Document):boolean} condition
 * @param {function(!Document)} callback
 */
function onDocumentState(doc, condition, callback) {
  if (condition(doc)) {
    // Execute callback right now.
    callback(doc);
    return;
  }

  // Execute callback (once!) after condition is satisfied.
  let callbackHasExecuted = false;
  const readyListener = () => {
    if (condition(doc) && !callbackHasExecuted) {
      callback(doc);
      callbackHasExecuted = true;
      doc.removeEventListener('readystatechange', readyListener);
    }
  };
  doc.addEventListener('readystatechange', readyListener);
}

/**
 * Returns a promise that is resolved when document is ready.
 * @param {!Document} doc
 * @return {!Promise<!Document>}
 */
function whenDocumentReady(doc) {
  return new Promise((resolve) => {
    onDocumentReady(doc, resolve);
  });
}

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

/** @implements {Doc} */
class GlobalDoc {
  /**
   * @param {!Window|!Document} winOrDoc
   */
  constructor(winOrDoc) {
    const isWin = !!winOrDoc.document;
    /** @private @const {!Window} */
    this.win_ = /** @type {!Window} */ (isWin
      ? /** @type {!Window} */ (winOrDoc)
      : /** @type {!Document} */ (winOrDoc).defaultView);
    /** @private @const {!Document} */
    this.doc_ = isWin
      ? /** @type {!Window} */ (winOrDoc).document
      : /** @type {!Document} */ (winOrDoc);
  }

  /** @override */
  getWin() {
    return this.win_;
  }

  /** @override */
  getRootNode() {
    return this.doc_;
  }

  /** @override */
  getRootElement() {
    return this.doc_.documentElement;
  }

  /** @override */
  getHead() {
    // `document.head` always has a chance to be parsed, at least partially.
    return /** @type {!Element} */ (this.doc_.head);
  }

  /** @override */
  getBody() {
    return this.doc_.body;
  }

  /** @override */
  isReady() {
    return isDocumentReady(this.doc_);
  }

  /** @override */
  whenReady() {
    return whenDocumentReady(this.doc_);
  }

  /** @override */
  addToFixedLayer(unusedElement) {
    return Promise.resolve();
  }
}

/**
 * @param {!Document|!Window|!Doc} input
 * @return {!Doc}
 */
function resolveDoc(input) {
  // Is it a `Document`
  if (/** @type {!Document} */ (input).nodeType === /* DOCUMENT */ 9) {
    return new GlobalDoc(/** @type {!Document} */ (input));
  }
  // Is it a `Window`?
  if (/** @type {!Window} */ (input).document) {
    return new GlobalDoc(/** @type {!Window} */ (input));
  }
  return /** @type {!Doc} */ (input);
}

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

const Z_INDEX = 2147483647;

/**
 * Default iframe important styles.
 * Note: The iframe responsiveness media query style is injected in the
 * publisher's page since style attribute can not include media query.
 * @const {!Object<string, string|number>}
 */
const rootElementImportantStyles = {
  'min-height': '50px',
  'border': 'none',
  'display': 'block',
  'position': 'fixed',
  'z-index': Z_INDEX,
  'box-sizing': 'border-box',
};

/**
 * Reset view styles.
 * @const {!Object<string, string|number>}
 */
const resetViewStyles = {
  'position': 'absolute',
  'top': '0',
  'left': '0',
  'right': '0',
  'bottom': '0',
  'opacity': 0,
  /* These lines are a work around to this issue in iOS:     */
  /* https://bugs.webkit.org/show_bug.cgi?id=155198          */
  'height': 0,
  'max-height': '100%',
  'max-width': '100%',
  'min-height': '100%',
  'min-width': '100%',
  'width': 0,
};

/**
 * Position of the dialog.
 * @const @enum {string}
 */
const PositionAt = {
  BOTTOM: 'BOTTOM',
  TOP: 'TOP',
  FLOAT: 'FLOAT',
  FULL: 'FULL',
};

/**
 * The class for the top level dialog.
 * @final
 */
class Dialog {
  /**
   * Create a dialog for the provided doc.
   * @param {!../model/doc.Doc} doc
   * @param {!Object<string, string|number>=} importantStyles
   * @param {!Object<string, string|number>=} styles
   */
  constructor(doc, importantStyles = {}, styles = {}) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = doc;

    /** @private @const {!FriendlyIframe} */
    this.iframe_ = new FriendlyIframe(doc.getWin().document, {
      'class': 'swg-dialog',
    });

    /** @private @const {!Graypane} */
    this.graypane_ = new Graypane(doc, Z_INDEX - 1);

    const modifiedImportantStyles = Object.assign(
      {},
      rootElementImportantStyles,
      importantStyles
    );
    setImportantStyles(this.iframe_.getElement(), modifiedImportantStyles);

    setStyles(this.iframe_.getElement(), styles);

    /** @private {LoadingView} */
    this.loadingView_ = null;

    /** @private {?Element} */
    this.container_ = null; // Depends on constructed document inside iframe.

    /** @private {?./view.View} */
    this.view_ = null;

    /** @private {?Promise} */
    this.animating_ = null;

    /** @private {boolean} */
    this.hidden_ = false;

    /** @private {?./view.View} */
    this.previousProgressView_ = null;

    /** @private {boolean} */
    this.useFixedLayer_ = false;
  }

  /**
   * Opens the dialog and builds the iframe container.
   * @param {boolean=} hidden
   * @return {!Promise<!Dialog>}
   */
  open(hidden = false) {
    const iframe = this.iframe_;
    if (iframe.isConnected()) {
      throw new Error('already opened');
    }

    // Attach.
    this.doc_.getBody().appendChild(iframe.getElement()); // Fires onload.

    this.graypane_.attach();

    if (hidden) {
      setImportantStyles(iframe.getElement(), {
        'visibility': 'hidden',
        'opacity': 0,
      });
      this.hidden_ = hidden;
    } else {
      this.show_();
    }

    if (this.useFixedLayer_) {
      return this.doc_
        .addToFixedLayer(iframe.getElement())
        .then(() => iframe.whenReady())
        .then(() => {
          this.buildIframe_();
          return this;
        });
    } else {
      return iframe.whenReady().then(() => {
        this.buildIframe_();
        return this;
      });
    }
  }

  /**
   * Build the iframe with the styling after iframe is loaded.
   * @private
   */
  buildIframe_() {
    const iframe = this.iframe_;
    const iframeBody = iframe.getBody();
    const iframeDoc = /** @type {!HTMLDocument} */ (this.iframe_.getDocument());

    // Inject Google fonts in <HEAD> section of the iframe.
    injectStyleSheet(resolveDoc(iframeDoc), CSS);

    // Add Loading indicator.
    this.loadingView_ = new LoadingView(iframeDoc);
    iframeBody.appendChild(this.loadingView_.getElement());

    // Container for all dynamic content, including 3P iframe.
    this.container_ = createElement(iframeDoc, 'swg-container', {});
    iframeBody.appendChild(this.container_);
    this.setPosition_();
  }

  /**
   * Closes the dialog.
   * @param {boolean=} animated
   * @return {!Promise}
   */
  close(animated = true) {
    let animating;
    if (animated) {
      animating = this.animate_(() => {
        this.graypane_.hide(/* animate */ true);
        return transition(
          this.getElement(),
          {
            'transform': 'translateY(100%)',
          },
          300,
          'ease-out'
        );
      });
    } else {
      animating = Promise.resolve();
    }
    return animating.then(() => {
      const iframeEl = this.iframe_.getElement();
      iframeEl.parentNode.removeChild(iframeEl);

      this.removePaddingToHtml_();
      this.graypane_.destroy();
    });
  }

  /**
   * Gets the container within the dialog.
   * @return {!Element}
   */
  getContainer() {
    if (!this.container_) {
      throw new Error('not opened yet');
    }
    return this.container_;
  }

  /**
   * Gets the attached iframe instance.
   * @return {!FriendlyIframe}
   */
  getIframe() {
    return this.iframe_;
  }

  /**
   * Gets the Iframe element.
   * @return {!HTMLIFrameElement}
   */
  getElement() {
    return this.iframe_.getElement();
  }

  /**
   * Gets the LoadingView for this dialog.
   * @return {LoadingView}
   */
  getLoadingView() {
    return this.loadingView_;
  }

  /**
   * Transitions to the next view.
   * @private
   */
  entryTransitionToNextView_() {
    if (this.view_ && this.view_.hasLoadingIndicator()) {
      // Temporarily cache the old view.
      this.previousProgressView_ = this.view_;
    } else {
      // Since loading indicator will be shown, remove contents of old view.
      removeChildren(this.getContainer());
      // When loading indicator was not displayed in the previous view,
      // loading indicator must be displayed while transitioning to new view.
      this.loadingView_.show();
    }
  }

  /**
   * Transition out of an old view.
   * @private
   */
  exitTransitionFromOldView_() {
    // If previous view is still around, remove it.
    if (this.previousProgressView_) {
      removeElement(this.previousProgressView_.getElement());
      this.previousProgressView_ = null;
    } else {
      this.loadingView_.hide();
    }
  }

  /** @return {?./view.View} */
  getCurrentView() {
    return this.view_;
  }

  /**
   * Opens the given view and removes existing view from the DOM if any.
   * @param {!./view.View} view
   * @return {!Promise}
   */
  openView(view) {
    setImportantStyles(view.getElement(), resetViewStyles);
    this.entryTransitionToNextView_();

    this.view_ = view;
    this.getContainer().appendChild(view.getElement());

    // If the current view should fade the parent document.
    if (view.shouldFadeBody() && !this.hidden_) {
      this.graypane_.show(/* animate */ true);
    }

    return view.init(this).then(() => {
      setImportantStyles(view.getElement(), {
        'opacity': 1,
      });
      if (this.hidden_) {
        if (view.shouldFadeBody()) {
          this.graypane_.show(/* animated */ true);
        }
        this.show_();
      }
      this.exitTransitionFromOldView_();
    });
  }

  /**
   * Show the iframe.
   * @private
   */
  show_() {
    this.animate_(() => {
      setImportantStyles(this.getElement(), {
        'transform': 'translateY(100%)',
        'opactiy': 1,
        'visibility': 'visible',
      });
      return transition(
        this.getElement(),
        {
          'transform': 'translateY(0)',
          'opacity': 1,
          'visibility': 'visible',
        },
        300,
        'ease-out'
      );
    });
    this.hidden_ = false;
  }

  /**
   * Resizes the dialog container.
   * @param {!./view.View} view
   * @param {number} height
   * @param {boolean=} animated
   * @return {?Promise}
   */
  resizeView(view, height, animated = true) {
    if (this.view_ != view) {
      return null;
    }
    const newHeight = this.getMaxAllowedHeight_(height);

    let animating;
    if (animated) {
      const oldHeight = this.getElement().offsetHeight;
      if (newHeight >= oldHeight) {
        // Expand.
        animating = this.animate_(() => {
          setImportantStyles(this.getElement(), {
            'height': `${newHeight}px`,
            'transform': `translateY(${newHeight - oldHeight}px)`,
          });
          return transition(
            this.getElement(),
            {
              'transform': 'translateY(0)',
            },
            300,
            'ease-out'
          );
        });
      } else {
        // Collapse.
        animating = this.animate_(() => {
          return transition(
            this.getElement(),
            {
              'transform': `translateY(${oldHeight - newHeight}px)`,
            },
            300,
            'ease-out'
          ).then(() => {
            setImportantStyles(this.getElement(), {
              'height': `${newHeight}px`,
              'transform': 'translateY(0)',
            });
          });
        });
      }
    } else {
      setImportantStyles(this.getElement(), {
        'height': `${newHeight}px`,
      });
      animating = Promise.resolve();
    }
    return animating.then(() => {
      this.updatePaddingToHtml_(height);
      view.resized();
    });
  }

  /**
   * @param {function():!Promise} callback
   * @return {!Promise}
   * @private
   */
  animate_(callback) {
    const wait = this.animating_ || Promise.resolve();
    return (this.animating_ = wait
      .then(
        () => {
          return callback();
        },
        () => {
          // Ignore errors to make sure animations don't get stuck.
        }
      )
      .then(() => {
        this.animating_ = null;
      }));
  }

  /**
   * Returns maximum allowed height for current viewport.
   * @param {number} height
   * @return {number}
   * @private
   */
  getMaxAllowedHeight_(height) {
    return Math.min(height, this.doc_.getWin()./*OK*/ innerHeight * 0.9);
  }

  /**
   * Gets the element's height.
   * @return {number}
   * @private
   */
  getHeight_() {
    return this.getElement().offsetHeight;
  }

  /**
   * Sets the position of the dialog. Currently 'BOTTOM' is set by default.
   */
  setPosition_() {
    setImportantStyles(this.getElement(), this.getPositionStyle_());
  }

  /**
   * Add the padding to the containing page so as to not hide the content
   * behind the popup, if rendered at the bottom.
   * @param {number} newHeight
   * @private
   */
  updatePaddingToHtml_(newHeight) {
    if (this.inferPosition_() == PositionAt.BOTTOM) {
      const bottomPadding = newHeight + 20; // Add some extra padding.
      const htmlElement = this.doc_.getRootElement();
      setImportantStyles(htmlElement, {
        'padding-bottom': `${bottomPadding}px`,
      });
    }
  }

  /**
   * Removes previouly added bottom padding from the document.
   * @private
   */
  removePaddingToHtml_() {
    this.doc_.getRootElement().style.removeProperty('padding-bottom');
  }

  /**
   * Calculates the position of the dialog. Currently dialog is positioned at
   * the bottom only. This could change in future to adjust the dialog position
   * based on the screen size.
   * @return {string}
   * @private
   */
  inferPosition_() {
    return PositionAt.BOTTOM;
  }

  /**
   * Returns the styles required to postion the dialog.
   * @return {!Object<string, string|number>}
   * @private
   */
  getPositionStyle_() {
    const dialogPosition = this.inferPosition_();
    switch (dialogPosition) {
      case PositionAt.BOTTOM:
        return {'bottom': 0};
      case PositionAt.TOP:
        return {'top': 0};
      case PositionAt.FLOAT:
        return {
          'position': 'fixed',
          'top': '50%',
          'left': '50%',
          'transform': 'translate(-50%, -50%)',
        };
      case PositionAt.FULL:
        return {
          'position': 'fixed',
          'height': '100%',
          'top': 0,
          'bottom': 0,
        };
      default:
        return {'bottom': 0};
    }
  }
}

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

const POPUP_Z_INDEX = 2147483647;

/**
 * The class for the top level dialog.
 * @final
 */
class DialogManager {
  /**
   * @param {!../model/doc.Doc} doc
   */
  constructor(doc) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = doc;

    /** @private {?Dialog} */
    this.dialog_ = null;

    /** @private {?Promise<!Dialog>} */
    this.openPromise_ = null;

    /** @private @const {!Graypane} */
    this.popupGraypane_ = new Graypane(doc, POPUP_Z_INDEX);

    /** @private {?Window} */
    this.popupWin_ = null;

    this.popupGraypane_.getElement().addEventListener('click', () => {
      if (this.popupWin_) {
        try {
          this.popupWin_.focus();
        } catch (e) {
          // Ignore error.
        }
      }
    });
  }

  /**
   * @param {boolean=} hidden
   * @return {!Promise<!Dialog>}
   */
  openDialog(hidden = false) {
    if (!this.openPromise_) {
      this.dialog_ = new Dialog(this.doc_);
      this.openPromise_ = this.dialog_.open(hidden);
    }
    return this.openPromise_;
  }

  /**
   * @param {!./view.View} view
   * @param {boolean=} hidden
   * @return {!Promise}
   */
  openView(view, hidden = false) {
    this.handleCancellations(view);
    return this.openDialog(hidden).then((dialog) => dialog.openView(view));
  }

  /**
   * Handles cancellations (ex: user clicks close button on dialog).
   * @param {!./view.View} view
   * @return {!Promise}
   */
  handleCancellations(view) {
    return view.whenComplete().catch((reason) => {
      if (isCancelError(reason)) {
        this.completeView(view);
      }
      throw reason;
    });
  }

  /**
   * @param {?./view.View} view
   */
  completeView(view) {
    // Give a small amount of time for another view to take over the dialog.
    setTimeout(() => {
      if (this.dialog_ && this.dialog_.getCurrentView() == view) {
        this.close_();
      }
    }, 100);
  }

  /**
   */
  completeAll() {
    if (this.dialog_) {
      this.close_();
    }
    if (this.popupGraypane_.isAttached()) {
      this.popupGraypane_.destroy();
    }
  }

  /**
   * @returns {?Dialog}
   */
  getDialog() {
    return this.dialog_;
  }

  /** @private */
  close_() {
    this.dialog_.close();
    this.dialog_ = null;
    this.openPromise_ = null;
  }

  /**
   * @param {?Window|undefined} targetWin
   */
  popupOpened(targetWin) {
    this.popupWin_ = targetWin || null;
    if (!this.popupGraypane_.isAttached()) {
      this.popupGraypane_.attach();
    }
    this.popupGraypane_.show();
  }

  /**
   */
  popupClosed() {
    this.popupWin_ = null;
    try {
      this.popupGraypane_.hide();
    } catch (e) {
      // Ignore.
    }
  }
}

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

/** @enum {number}  */
const MeterClientTypes = {
  /** Meter client type for content licensed by Google. */
  LICENSED_BY_GOOGLE: 1,
};

/**
 * Copyright 2020 The Subscribe with Google Authors. All Rights Reserved.
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

const IFRAME_BOX_SHADOW =
  'rgba(60, 64, 67, 0.3) 0px -2px 5px, rgba(60, 64, 67, 0.15) 0px -5px 5px';
const MINIMIZED_IFRAME_SIZE = '420px';

class MeterToastApi {
  /**
   * @param {!./deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    const iframeArgs = this.activityPorts_.addDefaultArguments({
      isClosable: true,
      hasSubscriptionCallback: deps.callbacks().hasSubscribeRequestCallback(),
    });
    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/metertoastiframe'),
      iframeArgs,
      /* shouldFadeBody */ false
    );

    /**
     * Function this class calls when a user dismisses the toast to consume a free read.
     * @private {?function()}
     */
    this.onConsumeCallback_ = null;

    /** @private @const {!function()} */
    this.sendCloseRequestFunction_ = () => {
      this.deps_
        .eventManager()
        .logSwgEvent(
          AnalyticsEvent.ACTION_METER_TOAST_CLOSED_BY_ARTICLE_INTERACTION,
          true
        );
      const closeRequest = new ToastCloseRequest();
      closeRequest.setClose(true);
      this.activityIframeView_.execute(closeRequest);
      this.removeCloseEventListener();

      if (this.onConsumeCallback_) {
        this.onConsumeCallback_();
      }
    };
  }

  /**
   * Shows the user the metering toast.
   * @return {!Promise}
   */
  start() {
    this.deps_
      .callbacks()
      .triggerFlowStarted(SubscriptionFlows.SHOW_METER_TOAST);
    this.activityIframeView_.on(
      ViewSubscriptionsResponse,
      this.startNativeFlow_.bind(this)
    );
    if (!this.deps_.callbacks().hasSubscribeRequestCallback()) {
      const errorMessage =
        '[swg.js]: `setOnNativeSubscribeRequest` has not been ' +
        'set before starting the metering flow, so users will not be able to ' +
        'subscribe from the metering dialog directly. Please call ' +
        '`setOnNativeSubscribeRequest` with a subscription flow callback before ' +
        'starting metering.';
      log_4(errorMessage);
    }
    this.dialogManager_.handleCancellations(this.activityIframeView_);
    return this.dialogManager_.openDialog().then((dialog) => {
      this.setDialogBoxShadow_();
      this.setLoadingViewWidth_();
      return dialog.openView(this.activityIframeView_).then(() => {
        // Allow closing of the iframe with any scroll or click event.
        this.win_.addEventListener('click', this.sendCloseRequestFunction_);
        this.win_.addEventListener(
          'touchstart',
          this.sendCloseRequestFunction_
        );
        this.win_.addEventListener('mousedown', this.sendCloseRequestFunction_);
        this.win_.addEventListener('wheel', this.sendCloseRequestFunction_);
        // Making body's overflow property 'hidden' to prevent scrolling
        // while swiping on the iframe.
        const $body = this.win_.document.body;
        setStyle($body, 'overflow', 'hidden');
        this.deps_
          .eventManager()
          .logSwgEvent(AnalyticsEvent.IMPRESSION_METER_TOAST);
        this.deps_
          .eventManager()
          .logSwgEvent(AnalyticsEvent.EVENT_OFFERED_METER);
      });
    });
  }

  /**
   * Sets a callback function this class calls when a user dismisses the toast to consume a free read.
   * @param {function()} onConsumeCallback
   */
  setOnConsumeCallback(onConsumeCallback) {
    this.onConsumeCallback_ = onConsumeCallback;
  }

  /**
   * Removes the event listeners that close the iframe and make the body visible.
   */
  removeCloseEventListener() {
    this.win_.removeEventListener('click', this.sendCloseRequestFunction_);
    this.win_.removeEventListener('touchstart', this.sendCloseRequestFunction_);
    this.win_.removeEventListener('mousedown', this.sendCloseRequestFunction_);
    this.win_.removeEventListener('wheel', this.sendCloseRequestFunction_);
    const $body = this.win_.document.body;
    setStyle($body, 'overflow', 'visible');
  }

  /**
   * Changes the iframe box shadow to match desired specifications on mobile.
   */
  setDialogBoxShadow_() {
    const mobileMediaQuery = this.win_.matchMedia(
      '(max-width: 640px), (max-height: 640px)'
    );
    const element = this.dialogManager_.getDialog().getElement();
    if (mobileMediaQuery.matches) {
      setImportantStyles(element, {'box-shadow': IFRAME_BOX_SHADOW});
    }
    mobileMediaQuery.addListener((changed) => {
      if (changed.matches) {
        setImportantStyles(element, {'box-shadow': IFRAME_BOX_SHADOW});
      } else {
        setImportantStyles(element, {'box-shadow': ''});
      }
    });
  }

  /**
   * Changes the size of the loading iframe on desktop to match the size of
   * the meter toast iframe.
   */
  setLoadingViewWidth_() {
    const desktopMediaQuery = this.win_.matchMedia(
      '(min-width: 640px) and (min-height: 640px)'
    );
    if (desktopMediaQuery.matches) {
      const element = this.dialogManager_
        .getDialog()
        .getLoadingView()
        .getElement();
      setImportantStyles(element, {
        'width': MINIMIZED_IFRAME_SIZE,
        'margin': 'auto',
      });
    }
  }

  /**
   * @param {ViewSubscriptionsResponse} response
   * @private
   */
  startNativeFlow_(response) {
    if (response.getNative()) {
      this.removeCloseEventListener();
      this.deps_.callbacks().triggerSubscribeRequest();
    }
  }
}

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

/** @const {!Object<string, string|number>} */
const toastImportantStyles = {
  'height': 0,
};

/** @const {!Object<string, string>} */
const iframeAttributes$2 = {
  'frameborder': '0',
  'scrolling': 'no',
  'class': 'swg-toast',
};

/**
 * The class Notification toast.
 */
class Toast {
  /**
   * @param {!../runtime/deps.DepsDef} deps
   * @param {string} src
   * @param {!Object<string, ?>} args
   */
  constructor(deps, src, args) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = deps.doc();

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {string} */
    this.src_ = src;

    /** @private @const {!Object<string, ?>} */
    this.args_ = args;

    /** @private {?Promise} */
    this.animating_ = null;

    /** @private @const {!HTMLIFrameElement} */
    this.iframe_ = /** @type {!HTMLIFrameElement} */ (createElement(
      this.doc_.getWin().document,
      'iframe',
      iframeAttributes$2
    ));

    setImportantStyles(this.iframe_, toastImportantStyles);

    /** @private @const {!Promise} */
    this.ready_ = new Promise((resolve) => {
      this.iframe_.onload = resolve;
    });
  }

  /**
   * Returns the iframe element.
   * @return {!HTMLIFrameElement}
   */
  getElement() {
    return this.iframe_;
  }

  /**
   * Opens the notification toast.
   * @return {!Promise}
   */
  open() {
    this.doc_.getBody().appendChild(this.iframe_); // Fires onload.
    return this.buildToast_();
  }

  /**
   * Builds the content of the iframe. On load, animates the toast.
   */
  buildToast_() {
    const toastDurationSeconds = 7;
    return this.activityPorts_
      .openIframe(this.iframe_, this.src_, this.args_)
      .then((port) => {
        return port.whenReady();
      })
      .then(() => {
        resetStyles(this.iframe_, ['height']);

        this.animate_(() => {
          setImportantStyles(this.iframe_, {
            'transform': 'translateY(100%)',
            'opactiy': 1,
            'visibility': 'visible',
          });
          return transition(
            this.iframe_,
            {
              'transform': 'translateY(0)',
              'opacity': 1,
              'visibility': 'visible',
            },
            400,
            'ease-out'
          );
        });

        // Close the Toast after the specified duration.
        this.doc_.getWin().setTimeout(() => {
          this.close();
        }, (toastDurationSeconds + 1) * 1000);
      });
  }

  /**
   * @param {function():!Promise} callback
   * @return {!Promise}
   * @private
   */
  animate_(callback) {
    const wait = this.animating_ || Promise.resolve();
    return (this.animating_ = wait
      .then(
        () => {
          return callback();
        },
        () => {
          // Ignore errors to make sure animations don't get stuck.
        }
      )
      .then(() => {
        this.animating_ = null;
      }));
  }

  /**
   * Closes the toast.
   * @return {!Promise}
   */
  close() {
    return this.animate_(() => {
      // Remove the toast from the DOM after animation is complete.
      this.doc_.getWin().setTimeout(() => {
        this.doc_.getBody().removeChild(this.iframe_);
        return Promise.resolve();
      }, 500);

      return transition(
        this.iframe_,
        {
          'transform': 'translateY(100%)',
          'opacity': 1,
          'visibility': 'visible',
        },
        400,
        'ease-out'
      );
    });
  }
}

/**
 * Copyright 2020 The Subscribe with Google Authors. All Rights Reserved.
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

/**
 * @param {!number} millis
 * @return {!Timestamp}
 */
function toTimestamp(millis) {
  return new Timestamp(
    [Math.floor(millis / 1000), (millis % 1000) * 1000000],
    false
  );
}

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

const SERVICE_ID = 'subscribe.google.com';
const TOAST_STORAGE_KEY = 'toast';
const ENTS_STORAGE_KEY = 'ents';
const IS_READY_TO_PAY_STORAGE_KEY = 'isreadytopay';

/**
 */
class EntitlementsManager {
  /**
   * @param {!Window} win
   * @param {!../model/page-config.PageConfig} pageConfig
   * @param {!./fetcher.Fetcher} fetcher
   * @param {!./deps.DepsDef} deps
   */
  constructor(win, pageConfig, fetcher, deps) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!../model/page-config.PageConfig} */
    this.pageConfig_ = pageConfig;

    /** @private @const {string} */
    this.publicationId_ = this.pageConfig_.getPublicationId();

    /** @private @const {!./fetcher.Fetcher} */
    this.fetcher_ = fetcher;

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!JwtHelper} */
    this.jwtHelper_ = new JwtHelper();

    /** @private {?Promise<!Entitlements>} */
    this.responsePromise_ = null;

    /** @private {number} */
    this.positiveRetries_ = 0;

    /** @private {boolean} */
    this.blockNextNotification_ = false;

    /** @private @const {!./storage.Storage} */
    this.storage_ = deps.storage();

    /** @private @const {!../runtime/analytics-service.AnalyticsService} */
    this.analyticsService_ = deps.analytics();

    /** @private @const {!../api/subscriptions.Config} */
    this.config_ = deps.config();
  }

  /**
   * @param {boolean=} expectPositive
   */
  reset(expectPositive) {
    this.responsePromise_ = null;
    this.positiveRetries_ = Math.max(
      this.positiveRetries_,
      expectPositive ? 3 : 0
    );
    if (expectPositive) {
      this.storage_.remove(ENTS_STORAGE_KEY);
      this.storage_.remove(IS_READY_TO_PAY_STORAGE_KEY);
    }
  }

  /**
   * Clears all of the entitlements state and cache.
   */
  clear() {
    this.responsePromise_ = null;
    this.positiveRetries_ = 0;
    this.unblockNextNotification();
    this.storage_.remove(ENTS_STORAGE_KEY);
    this.storage_.remove(TOAST_STORAGE_KEY);
    this.storage_.remove(IS_READY_TO_PAY_STORAGE_KEY);
  }

  /**
   * @param {!GetEntitlementsParamsExternalDef=} params
   * @return {!Promise<!Entitlements>}
   */
  getEntitlements(params) {
    // Remain backwards compatible by accepting
    // `encryptedDocumentKey` string as a first param.
    if (typeof params === 'string') {
      // TODO: Delete the fallback if nobody needs it. Use a log to verify.
      if (Date.now() > 1600289016959) {
        // TODO: Remove the conditional check for this warning
        // after the AMP extension is updated to pass an object.
        log_4(
          `[swg.js:getEntitlements]: If present, the first param of getEntitlements() should be an object of type GetEntitlementsParamsExternalDef.`
        );
      }

      params = {
        encryption: {encryptedDocumentKey: /**@type {string} */ (params)},
      };
    }

    if (!this.responsePromise_) {
      this.responsePromise_ = this.getEntitlementsFlow_(params);
    }
    return this.responsePromise_.then((response) => {
      if (response.isReadyToPay != null) {
        this.analyticsService_.setReadyToPay(response.isReadyToPay);
      }
      return response;
    });
  }

  /**
   * @param {string} raw
   * @param {boolean=} isReadyToPay
   * @return {boolean}
   */
  pushNextEntitlements(raw, isReadyToPay) {
    const entitlements = this.getValidJwtEntitlements_(
      raw,
      /* requireNonExpired */ true,
      isReadyToPay
    );
    if (entitlements && entitlements.enablesThis()) {
      this.storage_.set(ENTS_STORAGE_KEY, raw);
      return true;
    }
    return false;
  }

  /**
   * Sends a pingback that marks a metering entitlement as used.
   * @param {!Entitlements} entitlements
   */
  sendPingback_(entitlements) {
    const entitlement = entitlements.getEntitlementForThis();
    if (!entitlement || entitlement.source !== GOOGLE_METERING_SOURCE) {
      return;
    }

    this.deps_
      .eventManager()
      .logSwgEvent(AnalyticsEvent.EVENT_UNLOCKED_BY_METER, false);

    const jwt = new EntitlementJwt();
    jwt.setSource(entitlement.source);
    jwt.setJwt(entitlement.subscriptionToken);

    const message = new EntitlementsRequest();
    message.setUsedEntitlement(jwt);
    message.setClientEventTime(toTimestamp(Date.now()));

    const url =
      '/publication/' +
      encodeURIComponent(this.publicationId_) +
      '/entitlements';

    this.fetcher_.sendPost(serviceUrl(url), message);
  }

  /**
   * @param {!GetEntitlementsParamsExternalDef=} params
   * @return {!Promise<!Entitlements>}
   * @private
   */
  getEntitlementsFlow_(params) {
    return this.fetchEntitlementsWithCaching_(params).then((entitlements) => {
      this.onEntitlementsFetched_(entitlements);
      return entitlements;
    });
  }

  /**
   * @param {!GetEntitlementsParamsExternalDef=} params
   * @return {!Promise<!Entitlements>}
   * @private
   */
  fetchEntitlementsWithCaching_(params) {
    return Promise.all([
      this.storage_.get(ENTS_STORAGE_KEY),
      this.storage_.get(IS_READY_TO_PAY_STORAGE_KEY),
    ]).then((cachedValues) => {
      const raw = cachedValues[0];
      const irtp = cachedValues[1];
      // Try cache first.
      const needsDecryption = !!(params && params.encryption);
      if (raw && !needsDecryption) {
        const cached = this.getValidJwtEntitlements_(
          raw,
          /* requireNonExpired */ true,
          irtpStringToBoolean(irtp)
        );
        if (cached && cached.enablesThis()) {
          // Already have a positive response.
          this.positiveRetries_ = 0;
          return cached;
        }
      }
      // If cache didn't match, perform fetch.
      return this.fetchEntitlements_(params).then((ents) => {
        // If the product is enabled by cacheable entitlements, store them in cache.
        if (ents && ents.enablesThisWithCacheableEntitlements() && ents.raw) {
          this.storage_.set(ENTS_STORAGE_KEY, ents.raw);
        }
        return ents;
      });
    });
  }

  /**
   * @param {!GetEntitlementsParamsExternalDef=} params
   * @return {!Promise<!Entitlements>}
   * @private
   */
  fetchEntitlements_(params) {
    // TODO(dvoytenko): Replace retries with consistent fetch.
    let positiveRetries = this.positiveRetries_;
    this.positiveRetries_ = 0;
    const attempt = () => {
      positiveRetries--;
      return this.fetch_(params).then((entitlements) => {
        if (entitlements.enablesThis() || positiveRetries <= 0) {
          return entitlements;
        }
        return new Promise((resolve) => {
          this.win_.setTimeout(() => {
            resolve(attempt());
          }, 550);
        });
      });
    };
    return attempt();
  }

  /**
   * @param {boolean} value
   */
  setToastShown(value) {
    this.storage_.set(TOAST_STORAGE_KEY, value ? '1' : '0');
  }

  /**
   */
  blockNextNotification() {
    this.blockNextNotification_ = true;
  }

  /**
   */
  unblockNextNotification() {
    this.blockNextNotification_ = false;
  }

  /**
   * The JSON must either contain a "signedEntitlements" with JWT, or
   * "entitlements" field with plain JSON object.
   * @param {!Object} json
   * @return {!Entitlements}
   */
  parseEntitlements(json) {
    const isReadyToPay = json['isReadyToPay'];
    if (isReadyToPay == null) {
      this.storage_.remove(IS_READY_TO_PAY_STORAGE_KEY);
    } else {
      this.storage_.set(IS_READY_TO_PAY_STORAGE_KEY, String(isReadyToPay));
    }
    const signedData = json['signedEntitlements'];
    const decryptedDocumentKey = json['decryptedDocumentKey'];
    if (signedData) {
      const entitlements = this.getValidJwtEntitlements_(
        signedData,
        /* requireNonExpired */ false,
        isReadyToPay,
        decryptedDocumentKey
      );
      if (entitlements) {
        return entitlements;
      }
    } else {
      const plainEntitlements = json['entitlements'];
      if (plainEntitlements) {
        return this.createEntitlements_(
          '',
          plainEntitlements,
          isReadyToPay,
          decryptedDocumentKey
        );
      }
    }
    // Empty response.
    return this.createEntitlements_('', [], isReadyToPay);
  }

  /**
   * @param {string} raw
   * @param {boolean} requireNonExpired
   * @param {boolean=} isReadyToPay
   * @param {?string=} decryptedDocumentKey
   * @return {?Entitlements}
   * @private
   */
  getValidJwtEntitlements_(
    raw,
    requireNonExpired,
    isReadyToPay,
    decryptedDocumentKey
  ) {
    try {
      const jwt = this.jwtHelper_.decode(raw);
      if (requireNonExpired) {
        const now = Date.now();
        const exp = jwt['exp'];
        if (parseFloat(exp) * 1000 < now) {
          return null;
        }
      }
      const entitlementsClaim = jwt['entitlements'];
      return (
        (entitlementsClaim &&
          this.createEntitlements_(
            raw,
            entitlementsClaim,
            isReadyToPay,
            decryptedDocumentKey
          )) ||
        null
      );
    } catch (e) {
      // Ignore the error.
      this.win_.setTimeout(() => {
        throw e;
      });
    }
    return null;
  }

  /**
   * @param {string} raw
   * @param {!Object|!Array<!Object>} json
   * @param {boolean=} isReadyToPay
   * @param {?string=} decryptedDocumentKey
   * @return {!Entitlements}
   * @private
   */
  createEntitlements_(raw, json, isReadyToPay, decryptedDocumentKey) {
    return new Entitlements(
      SERVICE_ID,
      raw,
      Entitlement.parseListFromJson(json),
      this.pageConfig_.getProductId(),
      this.ack_.bind(this),
      this.consume_.bind(this),
      isReadyToPay,
      decryptedDocumentKey
    );
  }

  /**
   * @param {!Entitlements} entitlements
   * @private
   */
  onEntitlementsFetched_(entitlements) {
    // Skip any notifications and toast if other flows are ongoing.
    // TODO(dvoytenko): what's the right action when pay flow was canceled?
    const blockNotification = this.blockNextNotification_;
    this.blockNextNotification_ = false;
    if (blockNotification) {
      return;
    }

    // Notify on the received entitlements.
    this.deps_
      .callbacks()
      .triggerEntitlementsResponse(Promise.resolve(entitlements));

    const entitlement = entitlements.getEntitlementForThis();
    if (!entitlement) {
      this.deps_
        .eventManager()
        .logSwgEvent(AnalyticsEvent.EVENT_NO_ENTITLEMENTS, false);
      return;
    }

    this.maybeShowToast_(entitlement);
  }

  /**
   * @param {!Entitlement} entitlement
   * @return {!Promise}
   * @private
   */
  maybeShowToast_(entitlement) {
    // Don't show toast for metering entitlements.
    if (entitlement.source === GOOGLE_METERING_SOURCE) {
      this.deps_
        .eventManager()
        .logSwgEvent(AnalyticsEvent.EVENT_HAS_METERING_ENTITLEMENTS, false);
      return Promise.resolve();
    }

    this.deps_
      .eventManager()
      .logSwgEvent(AnalyticsEvent.EVENT_UNLOCKED_BY_SUBSCRIPTION, false);
    // Check if storage bit is set. It's only set by the `Entitlements.ack` method.
    return this.storage_.get(TOAST_STORAGE_KEY).then((value) => {
      const toastWasShown = value === '1';
      if (toastWasShown) {
        return;
      }

      // Show toast.
      const source = entitlement.source || 'google';
      return new Toast(
        this.deps_,
        feUrl('/toastiframe'),
        feArgs({
          'publicationId': this.publicationId_,
          'source': source,
        })
      ).open();
    });
  }

  /**
   * @param {!Entitlements} entitlements
   * @private
   */
  ack_(entitlements) {
    if (entitlements.getEntitlementForThis()) {
      this.setToastShown(true);
    }
  }

  /**
   * @param {!Entitlements} entitlements
   * @param {?Function=} onCloseDialog Called after the user closes the dialog.
   * @private
   */
  consume_(entitlements, onCloseDialog) {
    if (entitlements.enablesThisWithGoogleMetering()) {
      const onConsumeCallback = () => {
        if (onCloseDialog) {
          onCloseDialog();
        }
        this.sendPingback_(entitlements);
      };
      const showToast = this.getShowToastFromEntitlements_(entitlements);
      if (showToast === false) {
        // If showToast is explicitly false, call onConsumeCallback directly.
        return onConsumeCallback();
      }
      const meterToastApi = new MeterToastApi(this.deps_);
      meterToastApi.setOnConsumeCallback(onConsumeCallback);
      return meterToastApi.start();
    }
  }

  /**
   * Gets the `showToast` value (or null/undefined if unavailable) from
   * the Google metering entitlement details in the input entitlements.
   * @param {!Entitlements} entitlements
   * @return {boolean|undefined}
   * @private
   */
  getShowToastFromEntitlements_(entitlements) {
    const entitlement = entitlements.getEntitlementForThis();
    if (!entitlement || entitlement.source !== GOOGLE_METERING_SOURCE) {
      return;
    }
    try {
      const meteringJwt = this.jwtHelper_.decode(entitlement.subscriptionToken);
      return meteringJwt['metering'] && meteringJwt['metering']['showToast'];
    } catch (e) {
      // Ignore decoding errors.
      return;
    }
  }

  /**
   * @param {!GetEntitlementsParamsExternalDef=} params
   * @return {!Promise<!Entitlements>}
   * @private
   */
  fetch_(params) {
    return hash(getCanonicalUrl(this.deps_.doc()))
      .then((hashedCanonicalUrl) => {
        const urlParams = [];

        // Add encryption param.
        if (params && params.encryption) {
          urlParams.push(
            'crypt=' +
              encodeURIComponent(params.encryption.encryptedDocumentKey)
          );
        }

        // Add metering params.
        if (
          this.publicationId_ &&
          params &&
          params.metering &&
          params.metering.state
        ) {
          /** @type {!GetEntitlementsParamsInternalDef} */
          const encodableParams = {
            metering: {
              clientTypes: [MeterClientTypes.LICENSED_BY_GOOGLE],
              owner: this.publicationId_,
              resource: {
                hashedCanonicalUrl,
              },
              state: {
                id: params.metering.state.id,
                attributes: [],
              },
            },
          };

          // Add attributes.
          const standardAttributes = params.metering.state.standardAttributes;
          if (standardAttributes) {
            Object.keys(standardAttributes).forEach((key) => {
              encodableParams.metering.state.attributes.push({
                name: 'standard_' + key,
                timestamp: standardAttributes[key].timestamp,
              });
            });
          }
          const customAttributes = params.metering.state.customAttributes;
          if (customAttributes) {
            Object.keys(customAttributes).forEach((key) => {
              encodableParams.metering.state.attributes.push({
                name: 'custom_' + key,
                timestamp: customAttributes[key].timestamp,
              });
            });
          }

          // Encode params.
          const encodedParams = btoa(JSON.stringify(encodableParams));
          urlParams.push('encodedParams=' + encodedParams);
        }

        // Build URL.
        let url =
          '/publication/' +
          encodeURIComponent(this.publicationId_) +
          '/entitlements';
        if (urlParams.length > 0) {
          url += '?' + urlParams.join('&');
        }
        return serviceUrl(url);
      })
      .then((url) => {
        this.deps_
          .eventManager()
          .logSwgEvent(AnalyticsEvent.ACTION_GET_ENTITLEMENTS, false);
        return this.fetcher_.fetchCredentialedJson(url);
      })
      .then((json) => {
        if (json.errorMessages && json.errorMessages.length > 0) {
          json.errorMessages.forEach((errorMessage) => {
            log_4('SwG Entitlements: ' + errorMessage);
          });
        }
        return this.parseEntitlements(json);
      });
  }
}

/**
 * Convert String value of isReadyToPay
 * (from JSON or Cache) to a boolean value.
 * @param {string} value
 * @return {boolean|undefined}
 * @private
 */
function irtpStringToBoolean(value) {
  switch (value) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return undefined;
  }
}

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

/** @private @const {!Array<string>} */
const allowedMethods_ = ['GET', 'POST'];

/** @private @enum {number} Allowed fetch responses. */
const allowedFetchTypes_ = {
  document: 1,
  text: 2,
};

/**
 * A class that polyfills Fetch API.
 */
class Xhr {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;
  }

  /**
   * We want to call `fetch_` unbound from any context since it could
   * be either the native fetch or our polyfill.
   *
   * @param {string} input
   * @param {!FetchInitDef} init
   * @return {!Promise<!FetchResponse>|!Promise<!Response>}
   * @private
   */
  fetch_(input, init) {
    // TODO(avimehta): Should the requests go through when page is not visible?
    log_2(typeof input == 'string', 'Only URL supported: %s', input);
    // In particular, Firefox does not tolerate `null` values for
    // `credentials`.
    const creds = init.credentials;
    log_2(
      creds === undefined || creds == 'include' || creds == 'omit',
      'Only credentials=include|omit support: %s',
      creds
    );
    // Fallback to xhr polyfill since `fetch` api does not support
    // responseType = 'document'. We do this so we don't have to do any parsing
    // and document construction on the UI thread which would be expensive.
    if (init.responseType == 'document') {
      return fetchPolyfill(input, init);
    }
    return (this.win.fetch || fetchPolyfill).apply(null, arguments);
  }

  /**
   * @param {string} input URL
   * @param {?FetchInitDef} init Fetch options object.
   * @return {!Promise<!FetchResponse>}
   */
  fetch(input, init) {
    // TODO (avimehta): Figure out if CORS needs be handled the way AMP does it.
    init = setupInit(init);
    return this.fetch_(input, init)
      .then(
        (response) => response,
        (reason) => {
          const targetOrigin = parseUrl$1(input).origin;
          throw new Error(
            `XHR Failed fetching (${targetOrigin}/...):`,
            reason && reason.message
          );
        }
      )
      .then((response) => assertSuccess(response));
  }
}

/**
 * Normalized method name by uppercasing.
 * @param {string|undefined} method
 * @return {string}
 * @private
 */
function normalizeMethod_(method) {
  if (method === undefined) {
    return 'GET';
  }
  method = method.toUpperCase();

  log_2(
    allowedMethods_.includes(method),
    'Only one of %s is currently allowed. Got %s',
    allowedMethods_.join(', '),
    method
  );

  return method;
}

/**
 * Sets up and normalizes the FetchInitDef
 *
 * @param {?FetchInitDef=} init Fetch options object.
 * @param {string=} accept The HTTP Accept header value.
 * @return {!FetchInitDef}
 */
function setupInit(init, accept) {
  init = init || /** @type {FetchInitDef} */ ({});
  init.method = normalizeMethod_(init.method);
  init.headers = init.headers || {};
  if (accept) {
    init.headers['Accept'] = accept;
  }
  return init;
}

/**
 * A minimal polyfill of Fetch API. It only polyfills what we currently use.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 *
 * Notice that the "fetch" method itself is not exported as that would require
 * us to immediately support a much wide API.
 *
 * @param {string} input
 * @param {!FetchInitDef} init
 * @return {!Promise<!FetchResponse>}
 * @private Visible for testing
 */
function fetchPolyfill(input, init) {
  return new Promise(function (resolve, reject) {
    const xhr = createXhrRequest(init.method || 'GET', input);

    if (init.credentials == 'include') {
      xhr.withCredentials = true;
    }

    if (init.responseType in allowedFetchTypes_) {
      xhr.responseType = init.responseType;
    }

    if (init.headers) {
      Object.keys(init.headers).forEach(function (header) {
        xhr.setRequestHeader(header, init.headers[header]);
      });
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState < /* STATUS_RECEIVED */ 2) {
        return;
      }
      if (xhr.status < 100 || xhr.status > 599) {
        xhr.onreadystatechange = null;
        reject(new Error(`Unknown HTTP status ${xhr.status}`));
        return;
      }

      // TODO(dvoytenko): This is currently simplified: we will wait for the
      // whole document loading to complete. This is fine for the use cases
      // we have now, but may need to be reimplemented later.
      if (xhr.readyState == /* COMPLETE */ 4) {
        resolve(new FetchResponse(xhr));
      }
    };
    xhr.onerror = () => {
      reject(new Error('Network failure'));
    };
    xhr.onabort = () => {
      reject(new Error('Request aborted'));
    };

    if (init.method == 'POST') {
      xhr.send(init.body);
    } else {
      xhr.send();
    }
  });
}

/**
 * @param {string} method
 * @param {string} url
 * @return {!XMLHttpRequest}
 * @private
 */
function createXhrRequest(method, url) {
  const xhr = new XMLHttpRequest();
  if ('withCredentials' in xhr) {
    xhr.open(method, url, true);
  } else {
    throw new Error('CORS is not supported');
  }
  return xhr;
}

/**
 * If 415 or in the 5xx range.
 * @param {number} status
 */
function isRetriable(status) {
  return status == 415 || (status >= 500 && status < 600);
}

/**
 * Returns the response if successful or otherwise throws an error.
 * @param {!FetchResponse} response
 * @return {!Promise<!FetchResponse>}
 * @private Visible for testing
 */
function assertSuccess(response) {
  return new Promise((resolve) => {
    if (response.ok) {
      return resolve(response);
    }

    const {status} = response;
    const err = new Error(`HTTP error ${status}`);
    err.retriable = isRetriable(status);
    // TODO(@jridgewell, #9448): Callers who need the response should
    // skip processing.
    err.response = response;
    throw err;
  });
}

/**
 * Response object in the Fetch API.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
 */
class FetchResponse {
  /**
   * @param {!XMLHttpRequest} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest} */
    this.xhr_ = xhr;

    /** @const {number} */
    this.status = this.xhr_.status;

    /** @const {boolean} */
    this.ok = this.status >= 200 && this.status < 300;

    /** @const {!FetchResponseHeaders} */
    this.headers = new FetchResponseHeaders(xhr);

    /** @type {boolean} */
    this.bodyUsed = false;

    /** @type {?ReadableStream} */
    this.body = null;
  }

  /**
   * Create a copy of the response and return it.
   * @return {!FetchResponse}
   */
  clone() {
    log_2(!this.bodyUsed, 'Body already used');
    return new FetchResponse(this.xhr_);
  }

  /**
   * Drains the response and returns the text.
   * @return {!Promise<string>}
   * @private
   */
  drainText_() {
    log_2(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    return Promise.resolve(this.xhr_.responseText);
  }

  /**
   * Drains the response and returns a promise that resolves with the response
   * text.
   * @return {!Promise<string>}
   */
  text() {
    return this.drainText_();
  }

  /**
   * Drains the response and returns the JSON object.
   * @return {!Promise<!JsonObject>}
   */
  json() {
    return /** @type {!Promise<!JsonObject>} */ (this.drainText_().then(
      parseJson
    ));
  }

  /**
   * Reads the xhr responseXML.
   * @return {!Promise<!Document>}
   * @private
   */
  document_() {
    log_2(!this.bodyUsed, 'Body already used');
    this.bodyUsed = true;
    log_2(
      this.xhr_.responseXML,
      'responseXML should exist. Make sure to return ' +
        'Content-Type: text/html header.'
    );
    return /** @type {!Promise<!Document>} */ (Promise.resolve(
      log_2(this.xhr_.responseXML)
    ));
  }

  /**
   * Drains the response and returns a promise that resolves with the response
   * ArrayBuffer.
   * @return {!Promise<!ArrayBuffer>}
   */
  arrayBuffer() {
    return /** @type {!Promise<!ArrayBuffer>} */ (this.drainText_().then(
      utf8EncodeSync
    ));
  }
}

/**
 * Provides access to the response headers as defined in the Fetch API.
 * @private Visible for testing.
 */
class FetchResponseHeaders {
  /**
   * @param {!XMLHttpRequest} xhr
   */
  constructor(xhr) {
    /** @private @const {!XMLHttpRequest} */
    this.xhr_ = xhr;
  }

  /**
   * @param {string} name
   * @return {string}
   */
  get(name) {
    return this.xhr_.getResponseHeader(name);
  }

  /**
   * @param {string} name
   * @return {boolean}
   */
  has(name) {
    return this.xhr_.getResponseHeader(name) != null;
  }
}

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

/**
 * @interface
 */
class Fetcher {
  /**
   * @param {string} unusedUrl
   * @return {!Promise<!Object>}
   */
  fetchCredentialedJson(unusedUrl) {}

  /**
   * @param {string} unusedUrl
   * @param {!../utils/xhr.FetchInitDef} unusedInit
   * @return {!Promise<!../utils/xhr.FetchResponse>}
   */
  fetch(unusedUrl, unusedInit) {}

  /**
   * POST data to a URL endpoint, do not wait for a response.
   * @param {!string} unusedUrl
   * @param {!string|!Object} unusedData
   */
  sendBeacon(unusedUrl, unusedData) {}

  /**
   * POST data to a URL endpoint, get a Promise for a response
   * @param {!string} unusedUrl
   * @param {!string|!Object} unusedMessage
   * @return {!Promise<!../utils/xhr.FetchResponse>}
   */
  sendPost(unusedUrl, unusedMessage) {}
}

/**
 * @implements {Fetcher}
 */
class XhrFetcher {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Xhr} */
    this.xhr_ = new Xhr(win);
  }

  /** @override */
  fetchCredentialedJson(url) {
    const init = /** @type {!../utils/xhr.FetchInitDef} */ ({
      method: 'GET',
      headers: {'Accept': 'text/plain, application/json'},
      credentials: 'include',
    });
    return this.fetch(url, init).then((response) => response.json());
  }

  sendPost(url, message) {
    const init = /** @type {!../utils/xhr.FetchInitDef} */ ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      credentials: 'include',
      body: 'f.req=' + serializeProtoMessageForUrl(message),
    });
    return this.fetch(url, init).then(
      (response) => (response && response.json()) || {}
    );
  }

  /** @override */
  fetch(url, init) {
    return this.xhr_.fetch(url, init);
  }

  /** @override */
  sendBeacon(url, data) {
    if (navigator.sendBeacon) {
      const headers = {type: 'application/x-www-form-urlencoded;charset=UTF-8'};
      const blob = new Blob(
        ['f.req=' + serializeProtoMessageForUrl(data)],
        headers
      );
      navigator.sendBeacon(url, blob);
      return;
    }
    // Only newer browsers support beacon.  Fallback to standard XHR POST.
    this.sendPost(url, data);
  }
}

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

/**
 */
class JsError {
  /**
   * @param {!../model/doc.Doc} doc
   */
  constructor(doc) {
    /** @private @const {!../model/doc.Doc} */
    this.doc_ = doc;

    /** @private @const {!Promise} */
    this.microTask_ = Promise.resolve();
  }

  /**
   * @param {...*} var_args
   * @return {!Promise}
   */
  error(var_args) {
    const args = Array.prototype.slice.call(arguments, 0);
    return this.microTask_.then(() => {
      const error = createErrorVargs.apply(null, args);
      if (error.reported) {
        return;
      }
      const img = this.doc_.getWin().document.createElement('img');
      img.src =
        'https://news.google.com/_/SubscribewithgoogleClientUi/jserror' +
        '?error=' +
        encodeURIComponent(String(error)) +
        '&script=' +
        encodeURIComponent('https://news.google.com/swg/js/v1/swg.js') +
        '&line=' +
        (error.lineNumber || 1) +
        '&trace=' +
        encodeURIComponent(error.stack);
      // Appending this image to DOM is not necessary.
      error.reported = true;
    });
  }
}

/**
 * @param {...*} var_args
 * @return {!Error}
 */
function createErrorVargs(var_args) {
  let error = null;
  let message = '';
  for (let i = 0; i < arguments.length; i++) {
    const arg = arguments[i];
    if (arg instanceof Error && !error) {
      error = duplicateErrorIfNecessary(arg);
    } else {
      if (message) {
        message += ' ';
      }
      message += arg;
    }
  }

  if (!error) {
    error = new Error(message);
  } else if (message) {
    error.message = message + ': ' + error.message;
  }
  return error;
}

/**
 * Some exceptions (DOMException, namely) have read-only message.
 * @param {!Error} error
 * @return {!Error}
 */
function duplicateErrorIfNecessary(error) {
  const messageProperty = Object.getOwnPropertyDescriptor(error, 'message');
  if (messageProperty && messageProperty.writable) {
    return error;
  }

  const {message, stack} = error;
  const e = new Error(message);
  // Copy all the extraneous things we attach.
  for (const prop in error) {
    e[prop] = error[prop];
  }
  // Ensure these are copied.
  e.stack = stack;
  return e;
}

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

const LINK_REQUEST_ID = 'swg-link';

/**
 * The flow to link an existing publisher account to an existing google account.
 */
class LinkbackFlow {
  /**
   * @param {!./deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../model/page-config.PageConfig} */
    this.pageConfig_ = deps.pageConfig();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();
  }

  /**
   * Starts the Link account flow.
   * @param {{ampReaderId: (string|undefined)}=} params
   * @return {!Promise}
   */
  start(params = {}) {
    this.deps_.callbacks().triggerFlowStarted(SubscriptionFlows.LINK_ACCOUNT);
    const forceRedirect =
      this.deps_.config().windowOpenMode == WindowOpenMode.REDIRECT;
    const args = params.ampReaderId
      ? feArgs({
          'publicationId': this.pageConfig_.getPublicationId(),
          'ampReaderId': params.ampReaderId,
        })
      : feArgs({
          'publicationId': this.pageConfig_.getPublicationId(),
        });
    const opener = this.activityPorts_.open(
      LINK_REQUEST_ID,
      feUrl('/linkbackstart'),
      forceRedirect ? '_top' : '_blank',
      args,
      {}
    );
    this.deps_.eventManager().logSwgEvent(AnalyticsEvent.IMPRESSION_LINK);
    this.dialogManager_.popupOpened(opener && opener.targetWin);
    return Promise.resolve();
  }
}

/**
 * The class for Link accounts flow.
 */
class LinkCompleteFlow {
  /**
   * @param {!./deps.DepsDef} deps
   */
  static configurePending(deps) {
    /**
     * Handler function.
     * @param {!../components/activities.ActivityPortDef} port
     */
    function handler(port) {
      deps.entitlementsManager().blockNextNotification();
      deps.callbacks().triggerLinkProgress();
      deps.dialogManager().popupClosed();
      const promise = acceptPortResultData(
        port,
        feOrigin(),
        /* requireOriginVerified */ false,
        /* requireSecureChannel */ false
      );
      return promise.then(
        (response) => {
          deps
            .eventManager()
            .logSwgEvent(AnalyticsEvent.ACTION_LINK_CONTINUE, true);
          const flow = new LinkCompleteFlow(deps, response);
          flow.start();
        },
        (reason) => {
          if (isCancelError(reason)) {
            deps
              .eventManager()
              .logSwgEvent(AnalyticsEvent.ACTION_LINK_CANCEL, true);
            deps
              .callbacks()
              .triggerFlowCanceled(SubscriptionFlows.LINK_ACCOUNT);
          } else {
            // The user chose to continue but there was an error.
            deps
              .eventManager()
              .logSwgEvent(AnalyticsEvent.ACTION_LINK_CONTINUE, true);
          }
        }
      );
    }
    deps.activities().onResult(LINK_REQUEST_ID, handler);
  }

  /**
   * @param {!./deps.DepsDef} deps
   * @param {?Object} response
   */
  constructor(deps, response) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!./entitlements-manager.EntitlementsManager} */
    this.entitlementsManager_ = deps.entitlementsManager();

    /** @private @const {!./callbacks.Callbacks} */
    this.callbacks_ = deps.callbacks();

    const index = (response && response['index']) || '0';
    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/linkconfirmiframe', '/u/' + index),
      feArgs({
        'productId': deps.pageConfig().getProductId(),
        'publicationId': deps.pageConfig().getPublicationId(),
      }),
      /* shouldFadeBody */ true
    );

    /** @private {?function()} */
    this.completeResolver_ = null;

    /** @private @const {!Promise} */
    this.completePromise_ = new Promise((resolve) => {
      this.completeResolver_ = resolve;
    });
  }

  /**
   * Starts the Link account flow.
   * @return {!Promise}
   */
  start() {
    const promise = this.activityIframeView_.acceptResultAndVerify(
      feOrigin(),
      /* requireOriginVerified */ true,
      /* requireSecureChannel */ true
    );
    promise
      .then((response) => {
        this.complete_(response);
      })
      .catch((reason) => {
        // Rethrow async.
        setTimeout(() => {
          throw reason;
        });
      })
      .then(() => {
        // The flow is complete.
        this.dialogManager_.completeView(this.activityIframeView_);
      });
    this.deps_
      .eventManager()
      .logSwgEvent(AnalyticsEvent.EVENT_GOOGLE_UPDATED, true);
    this.deps_
      .eventManager()
      .logSwgEvent(AnalyticsEvent.IMPRESSION_GOOGLE_UPDATED, true);
    return this.dialogManager_.openView(this.activityIframeView_);
  }

  /**
   * @param {?Object} response
   * @private
   */
  complete_(response) {
    this.deps_
      .eventManager()
      .logSwgEvent(AnalyticsEvent.ACTION_GOOGLE_UPDATED_CLOSE, true);
    this.callbacks_.triggerLinkComplete();
    this.callbacks_.resetLinkProgress();
    this.entitlementsManager_.setToastShown(true);
    this.entitlementsManager_.unblockNextNotification();
    this.entitlementsManager_.reset((response && response['success']) || false);
    if (response && response['entitlements']) {
      this.entitlementsManager_.pushNextEntitlements(response['entitlements']);
    }
    this.completeResolver_();
  }

  /** @return {!Promise} */
  whenComplete() {
    return this.completePromise_;
  }
}

/**
 * The flow to save subscription information from an existing publisher account
 * to an existing google account.  The accounts may or may not already be
 * linked.
 */
class LinkSaveFlow {
  /**
   * @param {!./deps.DepsDef} deps
   * @param {!../api/subscriptions.SaveSubscriptionRequestCallback} callback
   */
  constructor(deps, callback) {
    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {!../api/subscriptions.SaveSubscriptionRequestCallback} */
    this.callback_ = callback;

    /** @private {?Promise<!../api/subscriptions.SaveSubscriptionRequest>} */
    this.requestPromise_ = null;

    /** @private {?Promise} */
    this.openPromise_ = null;

    /** @private {?ActivityIframeView} */
    this.activityIframeView_ = null;
  }

  /**
   * @return {?Promise<!../api/subscriptions.SaveSubscriptionRequest>}
   * @package Visible for testing.
   */
  getRequestPromise() {
    return this.requestPromise_;
  }

  /**
   * @private
   */
  complete_() {
    this.dialogManager_.completeView(this.activityIframeView_);
  }

  /**
   * @param {!Object} result
   * @return {!Promise<boolean>}
   * @private
   */
  handleLinkSaveResponse_(result) {
    // This flow is complete
    this.complete_();
    let startPromise;
    let linkConfirm = null;
    if (result['linked']) {
      // When linking succeeds, start link confirmation flow
      this.dialogManager_.popupClosed();
      this.deps_.callbacks().triggerFlowStarted(SubscriptionFlows.LINK_ACCOUNT);
      linkConfirm = new LinkCompleteFlow(this.deps_, result);
      startPromise = linkConfirm.start();
    } else {
      startPromise = Promise.reject(createCancelError(this.win_, 'not linked'));
    }
    const completePromise = startPromise.then(() => {
      this.deps_.callbacks().triggerLinkProgress();
      return linkConfirm.whenComplete();
    });

    return completePromise.then(() => {
      return true;
    });
  }

  /**
   * @param {LinkingInfoResponse} response
   * @private
   */
  sendLinkSaveToken_(response) {
    if (!response || !response.getRequested()) {
      return;
    }
    this.requestPromise_ = new Promise((resolve) => {
      resolve(this.callback_());
    })
      .then((request) => {
        const saveRequest = new LinkSaveTokenRequest();
        if (request && request.token) {
          if (request.authCode) {
            throw new Error('Both authCode and token are available');
          } else {
            saveRequest.setToken(request.token);
          }
        } else if (request && request.authCode) {
          saveRequest.setAuthCode(request.authCode);
        } else {
          throw new Error('Neither token or authCode is available');
        }
        this.activityIframeView_.execute(saveRequest);
      })
      .catch((reason) => {
        // The flow is complete.
        this.complete_();
        throw reason;
      });
  }

  /**
   * @return {?Promise}
   */
  /**
   * Starts the save subscription
   * @return {!Promise}
   */
  start() {
    const iframeArgs = this.activityPorts_.addDefaultArguments({
      'isClosable': true,
    });
    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/linksaveiframe'),
      iframeArgs,
      /* shouldFadeBody */ false,
      /* hasLoadingIndicator */ true
    );
    this.activityIframeView_.on(
      LinkingInfoResponse,
      this.sendLinkSaveToken_.bind(this)
    );

    this.openPromise_ = this.dialogManager_.openView(
      this.activityIframeView_,
      /* hidden */ true
    );
    this.deps_
      .eventManager()
      .logSwgEvent(AnalyticsEvent.IMPRESSION_SAVE_SUBSCR_TO_GOOGLE);
    /** {!Promise<boolean>} */
    return this.activityIframeView_
      .acceptResultAndVerify(
        feOrigin(),
        /* requireOriginVerified */ true,
        /* requireSecureChannel */ true
      )
      .then((result) => {
        return this.handleLinkSaveResponse_(result);
      })
      .catch((reason) => {
        // In case this flow wasn't complete, complete it here
        this.complete_();
        // Handle cancellation from user, link confirm start or completion here
        if (isCancelError(reason)) {
          this.deps_
            .eventManager()
            .logSwgEvent(
              AnalyticsEvent.ACTION_SAVE_SUBSCR_TO_GOOGLE_CANCEL,
              true
            );
          this.deps_
            .callbacks()
            .triggerFlowCanceled(SubscriptionFlows.LINK_ACCOUNT);
          return false;
        }
        throw reason;
      });
  }
}

/**
 * Copyright 2019 The Subscribe with Google Authors. All Rights Reserved.
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

/** @const {!Object<string,AnalyticsEvent>} */
const PublisherEventToAnalyticsEvent = {
  [Event.IMPRESSION_PAYWALL]: AnalyticsEvent.IMPRESSION_PAYWALL,
  [Event.IMPRESSION_AD]: AnalyticsEvent.IMPRESSION_AD,
  [Event.IMPRESSION_OFFERS]: AnalyticsEvent.IMPRESSION_OFFERS,
  [Event.ACTION_SUBSCRIPTIONS_LANDING_PAGE]:
    AnalyticsEvent.ACTION_SUBSCRIPTIONS_LANDING_PAGE,
  [Event.ACTION_OFFER_SELECTED]: AnalyticsEvent.ACTION_OFFER_SELECTED,
  [Event.ACTION_PAYMENT_FLOW_STARTED]:
    AnalyticsEvent.ACTION_PAYMENT_FLOW_STARTED,
  [Event.ACTION_PAYMENT_COMPLETED]: AnalyticsEvent.ACTION_PAYMENT_COMPLETE,
  [Event.EVENT_CUSTOM]: AnalyticsEvent.EVENT_CUSTOM,
};

/** @const {!Object<number,?Event>} */
const AnalyticsEventToPublisherEvent = {
  [AnalyticsEvent.UNKNOWN]: null,
  [AnalyticsEvent.IMPRESSION_PAYWALL]: Event.IMPRESSION_PAYWALL,
  [AnalyticsEvent.IMPRESSION_AD]: Event.IMPRESSION_AD,
  [AnalyticsEvent.IMPRESSION_OFFERS]: Event.IMPRESSION_OFFERS,
  [AnalyticsEvent.IMPRESSION_SUBSCRIBE_BUTTON]: null,
  [AnalyticsEvent.IMPRESSION_SMARTBOX]: null,
  [AnalyticsEvent.ACTION_SUBSCRIBE]: null,
  [AnalyticsEvent.ACTION_PAYMENT_COMPLETE]: Event.ACTION_PAYMENT_COMPLETED,
  [AnalyticsEvent.ACTION_ACCOUNT_CREATED]: null,
  [AnalyticsEvent.ACTION_ACCOUNT_ACKNOWLEDGED]: null,
  [AnalyticsEvent.ACTION_SUBSCRIPTIONS_LANDING_PAGE]:
    Event.ACTION_SUBSCRIPTIONS_LANDING_PAGE,
  [AnalyticsEvent.ACTION_PAYMENT_FLOW_STARTED]:
    Event.ACTION_PAYMENT_FLOW_STARTED,
  [AnalyticsEvent.ACTION_OFFER_SELECTED]: Event.ACTION_OFFER_SELECTED,
  [AnalyticsEvent.EVENT_PAYMENT_FAILED]: null,
  [AnalyticsEvent.EVENT_CUSTOM]: Event.EVENT_CUSTOM,
};

/**
 * Converts a propensity event enum into an analytics event enum.
 * @param {!Event|string} propensityEvent
 * @returns {!AnalyticsEvent}
 */
function publisherEventToAnalyticsEvent(propensityEvent) {
  return PublisherEventToAnalyticsEvent[propensityEvent];
}

/**
 * Converts an analytics event enum into a propensity event enum.
 * @param {!AnalyticsEvent} analyticsEvent
 * @returns {?Event}
 */
function analyticsEventToPublisherEvent(analyticsEvent) {
  return AnalyticsEventToPublisherEvent[analyticsEvent];
}

/**
 * Copyright 2019 The Subscribe with Google Authors. All Rights Reserved.
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

/**
 * @implements {../api/logger-api.LoggerApi}
 */
class Logger {
  /**
   * @param {!./deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!../api/client-event-manager-api.ClientEventManagerApi} */
    this.eventManager_ = deps.eventManager();
  }

  /** @override */
  sendSubscriptionState(state, jsonProducts) {
    if (!isEnumValue(SubscriptionState, state)) {
      throw new Error('Invalid subscription state provided');
    }
    if (
      (SubscriptionState.SUBSCRIBER == state ||
        SubscriptionState.PAST_SUBSCRIBER == state) &&
      !jsonProducts
    ) {
      throw new Error(
        'Entitlements must be provided for users with' +
          ' active or expired subscriptions'
      );
    }
    if (jsonProducts && !isObject(jsonProducts)) {
      throw new Error('Entitlements must be an Object');
    }
    let productsOrSkus = null;
    if (jsonProducts) {
      productsOrSkus = JSON.stringify(jsonProducts);
    }
    this.eventManager_.logEvent({
      eventType: AnalyticsEvent.EVENT_SUBSCRIPTION_STATE,
      eventOriginator: EventOriginator.PUBLISHER_CLIENT,
      isFromUserAction: null,
      additionalParameters: {
        state,
        productsOrSkus,
      },
    });
  }

  /** @override */
  sendEvent(userEvent) {
    let data = null;
    if (
      !isEnumValue(Event, userEvent.name) ||
      !publisherEventToAnalyticsEvent(userEvent.name)
    ) {
      throw new Error('Invalid user event provided(' + userEvent.name + ')');
    }

    if (userEvent.data) {
      if (!isObject(userEvent.data)) {
        throw new Error('Event data must be an Object(' + userEvent.data + ')');
      } else {
        data = Object.assign({}, data, userEvent.data);
      }
    }

    if (isBoolean(userEvent.active)) {
      if (!data) {
        data = {};
      }
      Object.assign(data, {'is_active': userEvent.active});
    } else if (userEvent.active != null) {
      throw new Error('Event active must be a boolean');
    }
    this.eventManager_.logEvent({
      eventType: publisherEventToAnalyticsEvent(userEvent.name),
      eventOriginator: EventOriginator.PUBLISHER_CLIENT,
      isFromUserAction: userEvent.active,
      additionalParameters: data,
    });
  }
}

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

class LoginNotificationApi {
  /**
   * @param {!./deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {?Promise} */
    this.openViewPromise_ = null;

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/loginiframe'),
      feArgs({
        publicationId: deps.pageConfig().getPublicationId(),
        productId: deps.pageConfig().getProductId(),
        // No need to ask the user. Just tell them you're logging them in.
        userConsent: false,
      }),
      /* shouldFadeBody */ true
    );
  }

  /**
   * Continues the Login flow (after waiting).
   * @return {!Promise}
   */
  start() {
    this.deps_
      .callbacks()
      .triggerFlowStarted(SubscriptionFlows.SHOW_LOGIN_NOTIFICATION);

    this.openViewPromise_ = this.dialogManager_.openView(
      this.activityIframeView_
    );

    return this.activityIframeView_.acceptResult().then(
      () => {
        // The consent part is complete.
        this.dialogManager_.completeView(this.activityIframeView_);
      },
      (reason) => {
        this.dialogManager_.completeView(this.activityIframeView_);
        throw reason;
      }
    );
  }
}

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

class LoginPromptApi {
  /**
   * @param {!./deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {?Promise} */
    this.openViewPromise_ = null;

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/loginiframe'),
      feArgs({
        publicationId: deps.pageConfig().getPublicationId(),
        productId: deps.pageConfig().getProductId(),
        // First ask the user if they want us to log them in.
        userConsent: true,
      }),
      /* shouldFadeBody */ true
    );
  }

  /**
   * Prompts the user to login.
   * @return {!Promise}
   */
  start() {
    this.deps_
      .callbacks()
      .triggerFlowStarted(SubscriptionFlows.SHOW_LOGIN_PROMPT);

    this.openViewPromise_ = this.dialogManager_.openView(
      this.activityIframeView_
    );

    return this.activityIframeView_.acceptResult().then(
      () => {
        // The consent part is complete.
        this.dialogManager_.completeView(this.activityIframeView_);
      },
      (reason) => {
        if (isCancelError(reason)) {
          this.deps_
            .callbacks()
            .triggerFlowCanceled(SubscriptionFlows.SHOW_LOGIN_PROMPT);
        } else {
          this.dialogManager_.completeView(this.activityIframeView_);
        }
        throw reason;
      }
    );
  }
}

/**
 * Copyright 2020 The Subscribe with Google Authors. All Rights Reserved.
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

class MeterRegwallApi {
  /**
   * @param {!./deps.DepsDef} deps
   * @param {{ gsiUrl: string, alreadyRegisteredUrl: string}} params
   */
  constructor(deps, params) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/meterregwalliframe'),
      feArgs({
        publicationId: deps.pageConfig().getPublicationId(),
        productId: deps.pageConfig().getProductId(),
        gsiUrl: params.gsiUrl,
        alreadyRegisteredUrl: params.alreadyRegisteredUrl,
      }),
      /* shouldFadeBody */ true
    );
  }

  /**
   * Prompts the user to register to the meter.
   * @return {!Promise}
   */
  start() {
    this.deps_
      .callbacks()
      .triggerFlowStarted(SubscriptionFlows.SHOW_METER_REGWALL);
    return this.dialogManager_.openView(this.activityIframeView_).then(() => {
      // Log that we showed a regwall.
      this.deps_.eventManager().logSwgEvent(AnalyticsEvent.IMPRESSION_REGWALL);

      // Log that we showed a showcase regwall.
      this.deps_
        .eventManager()
        .logSwgEvent(AnalyticsEvent.IMPRESSION_SHOWCASE_REGWALL);
    });
  }
}

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

class OffersApi {
  /**
   * @param {!../model/page-config.PageConfig} config
   * @param {!./fetcher.Fetcher} fetcher
   */
  constructor(config, fetcher) {
    /** @private @const {!../model/page-config.PageConfig} */
    this.config_ = config;

    /** @private @const {!./fetcher.Fetcher} */
    this.fetcher_ = fetcher;
  }

  /**
   * @param {?string=} productId
   * @return {!Promise<!Array<!../api/offer.Offer>>}
   */
  getOffers(productId = this.config_.getProductId()) {
    if (!productId) {
      throw new Error('getOffers requires productId in config or arguments');
    }
    return this.fetch_(productId);
  }

  /**
   * @param {string} productId
   * @return {!Promise<!Array<!../api/offer.Offer>>}
   * @private
   */
  fetch_(productId) {
    const url = serviceUrl(
      '/publication/' +
        encodeURIComponent(this.config_.getPublicationId()) +
        '/offers' +
        '?label=' +
        encodeURIComponent(productId)
    );
    // TODO(dvoytenko): switch to a non-credentialed request after launch.
    return this.fetcher_.fetchCredentialedJson(url).then((json) => {
      return json['offers'] || [];
    });
  }
}

/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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

const MAX_Z_INDEX = 2147483647;

const Constants = {};

/**
 * Supported environments.
 *
 * @enum {string}
 */
Constants.Environment = {
  LOCAL: 'LOCAL',
  PREPROD: 'PREPROD',
  PRODUCTION: 'PRODUCTION',
  SANDBOX: 'SANDBOX',
  TEST: 'TEST',
  TIN: 'TIN',
};

/**
 * Supported payment methods.
 *
 * @enum {string}
 */
Constants.PaymentMethod = {
  CARD: 'CARD',
  TOKENIZED_CARD: 'TOKENIZED_CARD',
  UPI: 'UPI',
};

/**
 * Auth methods.
 *
 * @enum {string}
 */
Constants.AuthMethod = {
  CRYPTOGRAM_3DS: 'CRYPTOGRAM_3DS',
  PAN_ONLY: 'PAN_ONLY',
};

/**
 * Returned result status.
 *
 * @enum {string}
 */
Constants.ResponseStatus = {
  CANCELED: 'CANCELED',
  DEVELOPER_ERROR: 'DEVELOPER_ERROR',
};

/**
 * Supported total price status.
 *
 * @enum {string}
 */
Constants.TotalPriceStatus = {
  ESTIMATED: 'ESTIMATED',
  FINAL: 'FINAL',
  NOT_CURRENTLY_KNOWN: 'NOT_CURRENTLY_KNOWN',
};

/**
 * Supported Google Pay payment button type.
 *
 * @enum {string}
 */
Constants.ButtonType = {
  SHORT: 'short',
  LONG: 'long',
};

/**
 * Supported button colors.
 *
 * @enum {string}
 */
Constants.ButtonColor = {
  DEFAULT: 'default',  // Currently defaults to black.
  BLACK: 'black',
  WHITE: 'white',
};

/**
 * Id attributes.
 *
 * @enum {string}
 */
Constants.Id = {
  POPUP_WINDOW_CONTAINER: 'popup-window-container',
};

/** @const {string} */
Constants.STORAGE_KEY_PREFIX = 'google.payments.api.storage';

/** @const {string} */
Constants.IS_READY_TO_PAY_RESULT_KEY =
    Constants.STORAGE_KEY_PREFIX + '.isreadytopay.result';

/** @const {string} */
Constants.UPI_CAN_MAKE_PAYMENT_CACHE_KEY =
    Constants.STORAGE_KEY_PREFIX + '.upi.canMakePaymentCache';


Constants.CLASS_PREFIX = 'google-payments-';
Constants.IFRAME_ACTIVE_CONTAINER_CLASS =
    `${Constants.CLASS_PREFIX}activeContainer`;
Constants.IFRAME_CONTAINER_CLASS = `${Constants.CLASS_PREFIX}dialogContainer`;
Constants.IFRAME_STYLE_CENTER_CLASS = `${Constants.CLASS_PREFIX}dialogCenter`;
Constants.IFRAME_STYLE_CLASS = `${Constants.CLASS_PREFIX}dialog`;

Constants.IFRAME_STYLE = `
.${Constants.IFRAME_STYLE_CLASS} {
    animation: none 0s ease 0s 1 normal none running;
    background: none 0 0 / auto repeat scroll padding-box border-box #fff;
    background-blend-mode: normal;
    border: 0 none #333;
    border-radius: 8px 8px 0 0;
    border-collapse: separate;
    bottom: 0;
    box-shadow: #808080 0 3px 0 0, #808080 0 0 22px;
    box-sizing: border-box;
    letter-spacing: normal;
    max-height: 100%;
    overflow: visible;
    position: fixed;
    width: 100%;
    z-index: ${MAX_Z_INDEX};
    -webkit-appearance: none;
    left: 0;
}
@media (min-width: 480px) {
  .${Constants.IFRAME_STYLE_CLASS} {
    width: 480px !important;
    left: -240px !important;
    margin-left: calc(100vw - 100vw / 2) !important;
  }
}
.${Constants.IFRAME_CONTAINER_CLASS} {
  background-color: rgba(0,0,0,0.26);
  bottom: 0;
  height: 100%;
  left: 0;
  position: absolute;
  right: 0;
}
.iframeContainer {
  -webkit-overflow-scrolling: touch;
}
`;

Constants.IFRAME_STYLE_CENTER = `
.${Constants.IFRAME_STYLE_CENTER_CLASS} {
  animation: none 0s ease 0s 1 normal none running;
  background-blend-mode: normal;
  background: none 0 0 / auto repeat scroll padding-box border-box #fff;
  border-collapse: separate;
  border-radius: 8px;
  border: 0px none #333;
  bottom: auto;
  box-shadow: #808080 0 0 22px;
  box-sizing: border-box;
  left: -240px;
  letter-spacing: normal;
  margin-left: calc(100vw - 100vw / 2) !important;
  max-height: 90%;
  overflow: visible;
  position: absolute;
  top: 100%;
  transform: scale(0.8);
  width: 480px;
  z-index: ${MAX_Z_INDEX};
  -webkit-appearance: none;
}
@media (min-height: 667px) {
  .${Constants.IFRAME_STYLE_CENTER_CLASS} {
    max-height: 600px;
  }
}
.${Constants.IFRAME_ACTIVE_CONTAINER_CLASS} {
  top: 50%;
  transform: scale(1.0) translateY(-50%);
}
`;

Constants.GPAY_BUTTON_WITH_CARD_INFO_IMAGE =
    'background-image: url(https://pay.google.com/gp/p/generate_gpay_btn_img);';

Constants.BUTTON_LOCALE_TO_MIN_WIDTH = {
  'en': 152,
  'bg': 163,
  'cs': 192,
  'de': 183,
  'es': 183,
  'fr': 183,
  'hr': 157,
  'id': 186,
  'ja': 148,
  'ko': 137,
  'ms': 186,
  'nl': 167,
  'pl': 182,
  'pt': 193,
  'ru': 206,
  'sk': 157,
  'sl': 211,
  'sr': 146,
  'tr': 161,
  'uk': 207,
  'zh': 156,
};

/**
 * Name of the graypane.
 *
 * @const {string}
 */
Constants.GPAY_GRAYPANE = 'gpay-graypane';

/**
 * Class used for the gpay button.
 *
 * @const {string}
 */
Constants.GPAY_BUTTON_CLASS = 'gpay-button';

Constants.BUTTON_STYLE = `
.${Constants.GPAY_BUTTON_CLASS} {
  background-origin: content-box;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: contain;
  border: 0px;
  border-radius: 4px;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 1px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  cursor: pointer;
  height: 40px;
  min-height: 40px;
  padding: 11px 24px;
}

.${Constants.GPAY_BUTTON_CLASS}.black {
  background-color: #000;
  box-shadow: none;
  padding: 12px 24px 10px;
}

.${Constants.GPAY_BUTTON_CLASS}.white {
  background-color: #fff;
}

.${Constants.GPAY_BUTTON_CLASS}.short {
  min-width: 90px;
  width: 160px;
}

.${Constants.GPAY_BUTTON_CLASS}.black.short {
  background-image: url(https://www.gstatic.com/instantbuy/svg/dark_gpay.svg);
}

.${Constants.GPAY_BUTTON_CLASS}.white.short {
  background-image: url(https://www.gstatic.com/instantbuy/svg/light_gpay.svg);
}

.${Constants.GPAY_BUTTON_CLASS}.black.active {
  background-color: #5f6368;
}

.${Constants.GPAY_BUTTON_CLASS}.black.hover {
  background-color: #3c4043;
}

.${Constants.GPAY_BUTTON_CLASS}.white.active {
  background-color: #fff;
}

.${Constants.GPAY_BUTTON_CLASS}.white.focus {
  box-shadow: #e8e8e8 0 1px 1px 0, #e8e8e8 0 1px 3px;
}

.${Constants.GPAY_BUTTON_CLASS}.white.hover {
  background-color: #f8f8f8;
}
`;

Constants.GPAY_BUTTON_WITH_OFFER_ICON_ADDITIONAL_STYLE = 'position: relative;';

Constants.GPAY_OFFER_ICON_CLASS = 'gpay-offer-icon';

Constants.GPAY_OFFER_ICON_SVG =
    "<svg width=\"20px\" height=\"20px\" viewBox=\"0 0 20 20\" " +
    "version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=" +
    "\"http://www.w3.org/1999/xlink\" class=\"gpay-offer-icon\"><defs><path d=\"M19.41,9.58 L10.41,0.58 " +
    "C10.05,0.22 9.55,0 9,0 L2,0 C0.9,0 0,0.9 0,2 L0,9 C0,9.55 0.22,10.05 " +
    "0.59,10.42 L9.59,19.42 C9.95,19.78 10.45,20 11,20 C11.55,20 12.05,19.78 " +
    "12.41,19.41 L19.41,12.41 C19.78,12.05 20,11.55 20,11 C20,10.45 19.77," +
    "9.94 19.41,9.58 Z\" id=\"path-1\"></path></defs><g id=\"buttons_10.05\"" +
    " stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">" +
    "<g id=\"Artboard\" transform=\"translate(-40.000000, -43.000000)\">" +
    "<g id=\"Group-3\" transform=\"translate(40.000000, 43.000000)\">" +
    "<g id=\"Group-2-Copy-2\"><g id=\"Group-Copy\"><g id=\"ic_loyalty_24px\">" +
    "<mask id=\"mask-2\" fill=\"white\"><use xlink:href=\"#path-1\"></use>" +
    "</mask><use id=\"gpay-Shape\" fill=\"#FF6100\" fill-rule=\"nonzero\" " +
    "xlink:href=\"#path-1\"></use><path d=\"M3.5,5 C2.67,5 2,4.33 2,3.5 C2," +
    "2.67 2.67,2 3.5,2 C4.33,2 5,2.67 5,3.5 C5,4.33 4.33,5 3.5,5 Z\" " +
    "id=\"Path\" fill=\"#FFFFFF\" fill-rule=\"nonzero\" mask=\"url(#mask-2)\">" +
    "</path></g></g></g><g id=\"Group-13-Copy-7\" transform=\"translate" +
    "(6.000000, 6.000000)\" fill=\"#FFFFFF\" fill-rule=\"nonzero\">" +
    "<g id=\"Group-13-Copy-2\"><path d=\"M2.15217391,4.55172414 C0.963561082," +
    "4.55172414 1.99840144e-14,3.53278598 1.99840144e-14,2.27586207 " +
    "C1.99840144e-14,1.01893816 0.963561082,6.30606678e-14 2.15217391,6." +
    "30606678e-14 C3.34078674,6.30606678e-14 4.30434783,1.01893816 4.30434783," +
    "2.27586207 C4.30434783,3.53278598 3.34078674,4.55172414 2.15217391," +
    "4.55172414 Z M2.15217391,3.31034483 C2.69245247,3.31034483 3.13043478,2." +
    "84719112 3.13043478,2.27586207 C3.13043478,1.70453302 2.69245247," +
    "1.24137931 2.15217391,1.24137931 C1.61189535,1.24137931 1.17391304,1" +
    ".70453302 1.17391304,2.27586207 C1.17391304,2.84719112 1.61189535,3." +
    "31034483 2.15217391,3.31034483 Z\" id=\"Combined-Shape\"></path>" +
    "<path d=\"M6.84782609,9 C5.65921326,9 4.69565217,7.98106184 4.69565217," +
    "6.72413793 C4.69565217,5.46721402 5.65921326,4.44827586 6.84782609," +
    "4.44827586 C8.03643892,4.44827586 9,5.46721402 9,6.72413793 C9,7.98106184" +
    " 8.03643892,9 6.84782609,9 Z M6.84782609,7.75862069 C7.38810465," +
    "7.75862069 7.82608696,7.29546698 7.82608696,6.72413793 C7.82608696" +
    ",6.15280888 7.38810465,5.68965517 6.84782609,5.68965517 C6.30754753," +
    "5.68965517 5.86956522,6.15280888 5.86956522,6.72413793 C5.86956522," +
    "7.29546698 6.30754753,7.75862069 6.84782609,7.75862069 Z\" " +
    "id=\"Combined-Shape\"></path><polygon id=\"Rectangle\" " +
    "transform=\"translate(4.497720, 4.541938) rotate(34.000000) " +
    "translate(-4.497720, -4.541938) \" points=\"3.77901778 -0.202295978 " +
    "4.9740273 -0.171019161 5.21642263 9.28617278 4.02141311 9.25489596\">" +
    "</polygon></g></g></g></g></g></svg>";

Constants.GPAY_OFFER_ICON_STYLE = `
.${Constants.GPAY_OFFER_ICON_CLASS} {
  position: absolute;
  right: -5px;
  top: -5px;
}

#ic_loyalty_24px use.hover {
  fill: #FC853B;
}
`;

Constants.GPAY_OFFER_DESCRIPTION_CLASS = 'gpay-offer-description';

Constants.GPAY_OFFER_DESCRIPTION_STYLE = `
@import url(//fonts.googleapis.com/css?family=Google+Sans:500);
.${Constants.GPAY_OFFER_DESCRIPTION_CLASS} {
  text-align: center;
  font: 10px 'Google Sans';
  margin-top: 2px;
  margin-bottom: 0px;
}

.${Constants.GPAY_OFFER_DESCRIPTION_CLASS}.gpay-btn-clicked {
  color: #3C4043;
}

.${Constants.GPAY_OFFER_DESCRIPTION_CLASS}.short {
  min-width: 90px;
  width: 160px;
}

.${Constants.GPAY_OFFER_DESCRIPTION_CLASS}.long {
  min-width: 152px;
  width: 240px;
}
`;

/**
 * Class used for the new gpay button with card info (last 4 digits, card net).
 *
 * @const {string}
 */
Constants.GPAY_BUTTON_CARD_INFO_CLASS = 'gpay-card-info-btn';

Constants.GPAY_BUTTON_CARD_INFO_BUTTON_STYLE = `
  .${Constants.GPAY_BUTTON_CARD_INFO_CLASS} {
    background-origin: content-box;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: contain;
    border: 0px;
    border-radius: 4px;
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 1px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    cursor: pointer;
    height: 40px;
    min-height: 40px;
    padding: 11px 24px;
    background-color: #000;
    box-shadow: none;
    padding: 9px 24px 10px;
    min-width: 190px;
    width: 240px;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CLASS}.active {
    background-color: #5f6368;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CLASS}.hover {
    background-color: #3c4043;
  }
  `;


/**
 * Trusted domain for secure context validation
 *
 * @const {string}
 */
Constants.TRUSTED_DOMAIN = '.google.com';

/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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

/**
 * An implementation of PaymentsClientDelegateInterface that leverages payment
 * request.
 * @implements {PaymentsClientDelegateInterface}
 */
class PaymentsRequestDelegate {
  /**
   * @param {string} environment
   */
  constructor(environment) {
    this.environment_ = environment;

    /** @private {?function(!Promise<!PaymentData>)} */
    this.callback_ = null;
  }

  /** @override */
  onResult(callback) {
    this.callback_ = callback;
  }

  /** @override */
  isReadyToPay(isReadyToPayRequest) {
    /** @type{!PaymentRequest} */
    const paymentRequest = this.createPaymentRequest_(isReadyToPayRequest);
    return new Promise((resolve, reject) => {
      paymentRequest.canMakePayment()
          .then(result => {
            window.sessionStorage.setItem(
                Constants.IS_READY_TO_PAY_RESULT_KEY, result.toString());
            const response = {'result': result};
            if (isReadyToPayRequest.apiVersion >= 2 &&
                isReadyToPayRequest.existingPaymentMethodRequired) {
              // For apiVersion 2, we always use native to only check for
              // tokenized cards.
              // For tokenized cards native always does a presence check so
              // we can say that if canMakePayment is true for native for
              // tokenizedCards then the user has a payment method which is
              // present.
              response['paymentMethodPresent'] = result;
            }
            resolve(response);
          })
          .catch(function(err) {
            if (window.sessionStorage.getItem(
                    Constants.IS_READY_TO_PAY_RESULT_KEY)) {
              resolve({
                'result': window.sessionStorage.getItem(
                              Constants.IS_READY_TO_PAY_RESULT_KEY) == 'true'
              });
            } else {
              resolve({'result': false});
            }
          });
    });
  }

  /** @override */
  prefetchPaymentData(paymentDataRequest) {
    // Creating PaymentRequest instance will call
    // Gcore isReadyToPay internally which will prefetch tempaltes.
    this.createPaymentRequest_(
        paymentDataRequest, this.environment_,
        paymentDataRequest.transactionInfo.currencyCode,
        paymentDataRequest.transactionInfo.totalPrice);
  }

  /** @override */
  loadPaymentData(paymentDataRequest) {
    this.loadPaymentDataThroughPaymentRequest_(paymentDataRequest);
  }

  /**
   * Create PaymentRequest instance.
   *
   * @param {!IsReadyToPayRequest|!PaymentDataRequest} request The necessary information to check if user is
   *     ready to pay or to support a payment from merchants.
   * @param {?string=} environment (optional)
   * @param {?string=} currencyCode (optional)
   * @param {?string=} totalPrice (optional)
   * @return {!PaymentRequest} PaymentRequest instance.
   * @private
   */
  createPaymentRequest_(request, environment, currencyCode, totalPrice) {
    let data = {};
    if (request) {
      data = JSON.parse(JSON.stringify(request));
    }

    // Only set the apiVersion if the merchant doesn't set it.
    if (!data['apiVersion']) {
      data['apiVersion'] = 1;
    }

    // Add allowedPaymentMethods for swg to get through gms core validation.
    if (data['swg']) {
      data['allowedPaymentMethods'] = [Constants.PaymentMethod.CARD];
    }

    if (environment && environment == Constants.Environment.TEST) {
      data['environment'] = environment;
    }

    const supportedInstruments = [{
      'supportedMethods': ['https://google.com/pay'],
      'data': data,
    }];

    const details = {
      'total': {
        'label': 'Estimated Total Price',
        'amount': {
          // currency and value are required fields in PaymentRequest, but these
          // fields will never be used since PaymentRequest UI is skipped when
          // we're the only payment method, so default to some value to by pass
          // this requirement.
          'currency': currencyCode || 'USD',
          'value': totalPrice || '0',
        }
      }
    };

    return new PaymentRequest(supportedInstruments, details);
  }

  /**
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @private
   */
  loadPaymentDataThroughPaymentRequest_(paymentDataRequest) {
    const currencyCode = (paymentDataRequest.transactionInfo &&
                          paymentDataRequest.transactionInfo.currencyCode) ||
        undefined;
    const totalPrice = (paymentDataRequest.transactionInfo &&
                        paymentDataRequest.transactionInfo.totalPrice) ||
        undefined;
    const paymentRequest = this.createPaymentRequest_(
        paymentDataRequest, this.environment_, currencyCode, totalPrice);
    this.callback_(
        /** @type{!Promise<!PaymentData>} */
        (paymentRequest.show()
             .then(
                 /**
                  * @param {!PaymentResponse} paymentResponse
                  * @return {!PaymentData}
                  */
                 (paymentResponse) => {
                   // Should be called to dismiss any remaining UI
                   paymentResponse.complete('success');
                   return paymentResponse.details;
                 })
             .catch(function(err) {
               err['statusCode'] = Constants.ResponseStatus.CANCELED;
               throw err;
             })));
  }
}

/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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

const MAX_Z_INDEX$1 = 2147483647;


class Graypane$1 {

  /**
   * @param {!Document} doc
   */
  constructor(doc) {
    /** @private @const {!Document} */
    this.doc_ = doc;

    /** @private @const {!Element} */
    this.element_ = doc.createElement(Constants.GPAY_GRAYPANE);
    setImportantStyles$1(this.element_, {
      'z-index': MAX_Z_INDEX$1,
      'display': 'none',
      'position': 'fixed',
      'top': 0,
      'right': 0,
      'bottom': 0,
      'left': 0,
      'background-color': 'rgba(32, 33, 36, .6)',
    });

    /** @private {?Window} */
    this.popupWindow_ = null;

    this.element_.addEventListener('click', () => {
      if (this.popupWindow_) {
        try {
          this.popupWindow_.focus();
        } catch (e) {
          // Ignore error.
        }
      }
    });
  }

  /**
   * Shows the graypane.
   * @param {?Window|undefined} popupWindow
   * @return {!Promise}
   */
  show(popupWindow) {
    this.popupWindow_ = popupWindow || null;
    this.doc_.body.appendChild(this.element_);
    setImportantStyles$1(this.element_, {
      'display': 'block',
      'opacity': 0,
    });
    return transition$1(this.element_, {
      'opacity': 1,
    }, 300, 'ease-out');
  }

  /**
   * Hides the graypane.
   * @return {!Promise|undefined}
   */
  hide() {
    this.popupWindow_ = null;
    if (!this.element_.parentElement) {
      // Has already been removed or haven't been even added to DOM.
      // This could be possible after redirect.
      return;
    }
    return transition$1(this.element_, {
      'opacity': 0,
    }, 300, 'ease-out').then(() => {
      setImportantStyles$1(this.element_, {'display': 'none'});
      this.doc_.body.removeChild(this.element_);
    });
  }
}


/**
 * Sets the CSS styles of the specified element with !important. The styles
 * are specified as a map from CSS property names to their values.
 *
 * The `!important` styles are used to avoid accidental specificity overrides
 * from the 3p page's stylesheet.
 *
 * @param {!Element} element
 * @param {!Object<string, string|number>} styles
 */
function setImportantStyles$1(element, styles) {
  for (const k in styles) {
    element.style.setProperty(k, styles[k].toString(), 'important');
  }
}


/**
 * Returns a promise which is resolved after the given duration of animation
 * @param {!Element} el - Element to be observed.
 * @param {!Object<string, string|number>} props - properties to be animated.
 * @param {number} durationMillis - duration of animation.
 * @param {string} curve - transition function for the animation.
 * @return {!Promise} Promise which resolves once the animation is done playing.
 */
function transition$1(el, props, durationMillis, curve) {
  const win = el.ownerDocument.defaultView;
  const previousTransitionValue = el.style.transition || '';
  return new Promise(resolve => {
    win.setTimeout(() => {
      win.setTimeout(resolve, durationMillis);
      const tr = `${durationMillis}ms ${curve}`;
      setImportantStyles$1(el, Object.assign({
        'transition': `transform ${tr}, opacity ${tr}`,
      }, props));
    });
  }).then(() => {
    // Stop transition and make sure that the final properties get set.
    setImportantStyles$1(el, Object.assign({
      'transition': previousTransitionValue,
    }, props));
  });
}

/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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

/**
 * Service wrapping window.parent.postMessage. This enables
 * window.postMessage to be swapped out in unit tests.
 */
class PostMessageService {
  constructor(window) {
    /** @private @const {!Window} */
    this.window_ = window;
  }

  /**
   * Passthrough to Window#postMessage. See Window#postMessage DOM API
   * documentation for more information about arguments.
   *
   * @param {!Object} message
   * @param {string} targetOrigin
   */
  postMessage(message, targetOrigin) {
    this.window_.postMessage(message, targetOrigin);
  }
}

/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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

/**
 * Supported interactions between iframe and merchant page.
 *
 * @enum {number}
 */
// Next Id: 10
const PostMessageEventType = {
  IS_READY_TO_PAY: 6,
  LOG_BUTTON_CLICK: 5,
  LOG_IS_READY_TO_PAY_API: 0,
  LOG_LOAD_PAYMENT_DATA_API: 1,
  LOG_RENDER_BUTTON: 2,
  LOG_INITIALIZE_PAYMENTS_CLIENT: 9,
  LOG_PAY_FRAME_REQUESTED: 15,
  LOG_PAY_FRAME_LOADED: 16,
  LOG_PAY_FRAME_LOADED_WITH_ALL_JS: 17,
  LOG_INLINE_PAYMENT_WIDGET_INITIALIZE: 4,
  LOG_INLINE_PAYMENT_WIDGET_SUBMIT: 3,
  LOG_INLINE_PAYMENT_WIDGET_DISPLAYED: 7,
  LOG_INLINE_PAYMENT_WIDGET_HIDDEN: 8,
};

/**
 * Types of buy flow activity modes.
 *
 * @enum {number}
 */
const BuyFlowActivityMode = {
  UNKNOWN_MODE: 0,
  IFRAME: 1,
  POPUP: 2,
  REDIRECT: 3,
  ANDROID_NATIVE: 4,
  PAYMENT_HANDLER: 5,
};

/**
 * Types of buy flow activity modes.
 *
 * @enum {number}
 */
const PublicErrorCode = {
  UNKNOWN_ERROR_TYPE: 0,
  INTERNAL_ERROR: 1,
  DEVELOPER_ERROR: 2,
  BUYER_ACCOUNT_ERROR: 3,
  MERCHANT_ACCOUNT_ERROR: 4,
  UNSUPPORTED_API_VERSION: 5,
  BUYER_CANCEL: 6,
};

/**
 * The presentation mode of the buy flow
 *
 * @enum {number}
 */
const BuyFlowMode = {
  PAY_WITH_GOOGLE: 5,
  SUBSCRIBE_WITH_GOOGLE: 6,
};

/**
 * Iframe used for logging and prefetching.
 *
 * @type {?Element}
 */
let iframe = null;

/** @type {?PostMessageService} */
let postMessageService = null;

/** @type {?string} */
let environment = null;

/** @type {?string} */
let googleTransactionId = null;

/** @type {number} */
let originTimeMs = Date.now();

/** @type {?BuyFlowActivityMode} */
let buyFlowActivityMode = null;

/** @type {boolean} */
let iframeLoaded = false;

/** @type {!Array<!Object>} */
let buffer = [];

class PayFrameHelper {
  /**
   * Creates a hidden iframe for logging and appends it to the top level
   * document.
   */
  static load() {
    if (iframe) {
      return;
    }
    const initOptions =
        /** @type {!PaymentOptions} */ (window['gpayInitParams']) || {};
    environment = initOptions.environment || Constants.Environment.PRODUCTION;
    iframe = document.createElement('iframe');
    // Pass in origin because document.referrer inside iframe is empty in
    // certain cases
    // Can be replaced by iframe.src=... in non Google context.
    iframe.src = PayFrameHelper.getIframeUrl_(
            window.location.origin,
            initOptions.merchantInfo && initOptions.merchantInfo.merchantId);
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_PAY_FRAME_REQUESTED,
      'clientLatencyStartMs': Date.now(),
    });
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    iframe.onload = function() {
      PayFrameHelper.postMessage({
        'eventType': PostMessageEventType.LOG_PAY_FRAME_LOADED_WITH_ALL_JS,
        'clientLatencyStartMs': Date.now(),
      });
      PayFrameHelper.iframeLoaded();
    };
    // If the body is already loaded, just append the iframe. Otherwise, we wait
    // until the DOM has loaded to append the iframe, otherwise document.body is
    // null.
    if (document.body) {
      PayFrameHelper.initialize_();
    } else {
      document.addEventListener(
          'DOMContentLoaded', () => PayFrameHelper.initialize_());
    }
  }

  /**
   * Appends the iframe to the DOM and updates the post message service.
   * @private
   */
  static initialize_() {
    document.body.appendChild(iframe);
    postMessageService = new PostMessageService(iframe.contentWindow);
  }

  /**
   * Sends a message to the iframe and wait for a response.
   * Uses the responseHandler specified only if the responseType is a match.
   *
   * @param {!Object} data
   * @param {!PostMessageEventType} eventType
   * @param {string} responseType
   * @param {function(!Event)} responseHandler
   */
  static sendAndWaitForResponse(
      data, eventType, responseType, responseHandler) {
    function callback(event) {
      if (event.data[responseType]) {
        responseHandler(event);
        // We only want to process the response from the payframe once.
        // so stop listening to the event once processed.
        PayFrameHelper.removeMessageEventListener_(callback);
      }
    }

    PayFrameHelper.addMessageEventListener_(callback);

    const postMessageData = Object.assign({'eventType': eventType}, data);
    PayFrameHelper.postMessage(postMessageData);
  }

  /**
   * Add an event listener for listening to messages received.
   *
   * @param {function(!Event)} callback
   * @private
   */
  static addMessageEventListener_(callback) {
    window.addEventListener('message', callback);
  }

  /**
   * Remove the event listener for listening to messages.
   *
   * @param {function(!Event)} callback
   * @private
   */
  static removeMessageEventListener_(callback) {
    window.removeEventListener('message', callback);
  }

  /**
   * Posts a message to the iframe with the given data.
   *
   * @param {!Object} data
   */
  static postMessage(data) {
    if (!iframeLoaded) {
      buffer.push(data);
      return;
    }
    const postMessageData = Object.assign(
        {
          'buyFlowActivityMode': buyFlowActivityMode,
          'googleTransactionId': googleTransactionId,
          'originTimeMs': originTimeMs,
        },
        data);
    postMessageService.postMessage(
        postMessageData, PayFrameHelper.getIframeOrigin_());
  }

  /**
   * Sets the activity mode.
   *
   * @param {!BuyFlowActivityMode} mode
   */
  static setBuyFlowActivityMode(mode) {
    buyFlowActivityMode = mode;
  }

  /**
   * Sets the google transaction id.
   *
   * @param {string} txnId
   */
  static setGoogleTransactionId(txnId) {
    googleTransactionId = txnId;
  }

  /**
   * Sets the originTimeMs. To be used only for tests.
   *
   * @param {number} originTimeMsTemp
   */
  static setOriginTimeMs(originTimeMsTemp) {
    originTimeMs = originTimeMsTemp;
  }

  /**
   * Override postMessageService for testing.
   *
   * @param {!PostMessageService} messageService
   */
  static setPostMessageService(messageService) {
    postMessageService = messageService;
  }

  /**
   * Clears the singleton variables.
   */
  static reset() {
    iframe = null;
    buffer.length = 0;
    iframeLoaded = false;
    buyFlowActivityMode = null;
  }

  /**
   * Sets whether the iframe has been loaded or not.
   *
   * @param {boolean} loaded
   */
  static setIframeLoaded(loaded) {
    iframeLoaded = loaded;
  }

  /**
   * Called whenever the iframe is loaded.
   */
  static iframeLoaded() {
    iframeLoaded = true;
    buffer.forEach(function(data) {
      PayFrameHelper.postMessage(data);
    });
    buffer.length = 0;
  }

  /**
   * Returns the events that have been buffered.
   *
   * @return {!Array<!Object>}
   */
  static getBuffer() {
    return buffer;
  }

  /**
   * Mocks the iframe as an arbitrary html element instead of actually injecting
   * it for testing.
   */
  static injectIframeForTesting() {
    PayFrameHelper.reset();
    iframe = document.createElement('p');
    PayFrameHelper.iframeLoaded();
  }

  /**
   * Returns the payframe origin based on the environment.
   *
   * @return {string}
   * @private
   */
  static getIframeOrigin_() {
    let iframeUrl = 'https://pay';
    if (environment == Constants.Environment.SANDBOX) {
      iframeUrl += '.sandbox';
    } else if (environment == Constants.Environment.PREPROD) {
      iframeUrl += '-preprod.sandbox';
    }
    return iframeUrl + '.google.com';
  }

  /**
   * Returns the payframe URL based on the environment.
   *
   * @param {string} origin The origin that is opening the payframe.
   * @param {string|null=} merchantId The merchant id.
   * @return {string}
   * @private
   */
  static getIframeUrl_(origin, merchantId) {
    // TrustedResourceUrl header needs to start with https or '//'.
    const iframeUrl = `https://pay${environment == Constants.Environment.PREPROD ?
             '-preprod.sandbox' :
             environment == Constants.Environment.SANDBOX ? '.sandbox' : ''}.google.com/gp/p/ui/payframe?origin=${origin}&mid=%{merchantId}`;
    return iframeUrl;
  }
}

/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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

/**
 * @return {boolean} true if this version of Chrome supports PaymentHandler.
 */
function chromeSupportsPaymentHandler() {
  // Check if feature is enabled for user
  if (typeof google == 'undefined' ||
      !null) {
    return false;
  }

  // Payment handler isn't supported on mobile
  const mobilePlatform = window.navigator.userAgent.match(
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);
  if (mobilePlatform != null) {
    return false;
  }

  const chromeVersion = window.navigator.userAgent.match(/Chrome\/([0-9]+)\./i);
  return 'PaymentRequest' in window && chromeVersion != null &&
      Number(chromeVersion[1]) >= 68 &&
      window.navigator.vendor == 'Google Inc.';
}

/**
 * @return {boolean} true if this version of Chrome supports PaymentRequest.
 */
function chromeSupportsPaymentRequest() {
  // Opera uses chrome as rendering engine and sends almost the exact same
  // user agent as chrome thereby fooling us on android.
  const isOpera = window.navigator.userAgent.indexOf('OPR/') != -1;
  if (isOpera) {
    return false;
  }
  if (chromeSupportsPaymentHandler()) {
    return true;
  }

  const androidPlatform = window.navigator.userAgent.match(/Android/i);
  const chromeVersion = window.navigator.userAgent.match(/Chrome\/([0-9]+)\./i);
  return androidPlatform != null && 'PaymentRequest' in window &&
      // Make sure skipping PaymentRequest UI when only one PaymentMethod is
      // supported (starts on Google Chrome 59).
      window.navigator.vendor == 'Google Inc.' && chromeVersion != null &&
      Number(chromeVersion[1]) >= 59;
}

/**
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 *
 * @return {boolean} true if the merchant only supports tokenized cards.
 */
function doesMerchantSupportOnlyTokenizedCards(isReadyToPayRequest) {
  if (isReadyToPayRequest.apiVersion >= 2) {
    const allowedAuthMethods =
        extractAllowedAuthMethodsForCards_(isReadyToPayRequest);
    if (allowedAuthMethods && allowedAuthMethods.length == 1 &&
        allowedAuthMethods[0] == Constants.AuthMethod.CRYPTOGRAM_3DS) {
      return true;
    }
  }
  return isReadyToPayRequest.allowedPaymentMethods.length == 1 &&
      isReadyToPayRequest.allowedPaymentMethods[0] ==
      Constants.PaymentMethod.TOKENIZED_CARD;
}

/**
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 * @param {Constants.AuthMethod} apiV2AuthMethod
 *
 * @return {boolean} true if the merchant supports pan cards.
 */
function apiV2DoesMerchantSupportSpecifiedCardType(
    isReadyToPayRequest, apiV2AuthMethod) {
  if (isReadyToPayRequest.apiVersion >= 2) {
    const allowedAuthMethods =
        extractAllowedAuthMethodsForCards_(isReadyToPayRequest);
    if (allowedAuthMethods && allowedAuthMethods.includes(apiV2AuthMethod)) {
      return true;
    }
    return false;
  }
  return false;
}

/**
 * Validate if is secure context. Returns null if context is secure, otherwise
 * return error message.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
 *
 * @return {?string} null if current context is secure, otherwise return error
 * message.
 */
function validateSecureContext() {
  if (window.location.hostname.endsWith(Constants.TRUSTED_DOMAIN)) {
    // This is for local development.
    return null;
  }
  if (window.isSecureContext === undefined) {
    // Browser not support isSecureContext, figure out a way to validate this
    // for the unsupported browser.
    return null;
  }
  return window.isSecureContext ?
      null :
      'Google Pay APIs should be called in secure context!';
}

/**
 * Validate PaymentOptions.
 *
 * @param {!PaymentOptions} paymentOptions
 */
function validatePaymentOptions(paymentOptions) {
  if (paymentOptions.environment &&
      !Object.values(Constants.Environment)
           .includes(paymentOptions.environment)) {
    throw new Error(
        'Parameter environment in PaymentOptions can optionally be set to ' +
        'PRODUCTION, otherwise it defaults to TEST. ' + paymentOptions.environment);
  }
}

/**
 * Validate IsReadyToPayRequest.
 *
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 * @return {?string} errorMessage if the request is invalid.
 */
function validateIsReadyToPayRequest(isReadyToPayRequest) {
  if (!isReadyToPayRequest) {
    return 'isReadyToPayRequest must be set!';
  } else if (isReadyToPayRequest.apiVersion >= 2) {
    if (!('apiVersionMinor' in isReadyToPayRequest)) {
      return 'apiVersionMinor must be set!';
    }
    if (!isReadyToPayRequest.allowedPaymentMethods ||
        !Array.isArray(isReadyToPayRequest.allowedPaymentMethods) ||
        isReadyToPayRequest.allowedPaymentMethods.length == 0) {
      return 'for v2 allowedPaymentMethods must be set to an array containing a list of accepted payment methods';
    }
    for (var i = 0; i < isReadyToPayRequest.allowedPaymentMethods.length; i++) {
      let allowedPaymentMethod = isReadyToPayRequest.allowedPaymentMethods[i];
      if (allowedPaymentMethod['type'] == Constants.PaymentMethod.CARD) {
        if (!allowedPaymentMethod['parameters']) {
          return 'Field parameters must be setup in each allowedPaymentMethod';
        }
        var allowedCardNetworks =
            allowedPaymentMethod['parameters']['allowedCardNetworks'];
        if (!allowedCardNetworks || !Array.isArray(allowedCardNetworks) ||
            allowedCardNetworks.length == 0) {
          return 'allowedCardNetworks must be setup in parameters for type CARD';
        }
        var allowedAuthMethods =
            allowedPaymentMethod['parameters']['allowedAuthMethods'];
        if (!allowedAuthMethods || !Array.isArray(allowedAuthMethods) ||
            allowedAuthMethods.length == 0 ||
            !allowedAuthMethods.every(isAuthMethodValid)) {
          return 'allowedAuthMethods must be setup in parameters for type \'CARD\' ' +
              ' and must contain \'CRYPTOGRAM_3DS\' and/or \'PAN_ONLY\'';
        }
      }
    }
    return null;
  } else if (
      !isReadyToPayRequest.allowedPaymentMethods ||
      !Array.isArray(isReadyToPayRequest.allowedPaymentMethods) ||
      isReadyToPayRequest.allowedPaymentMethods.length == 0 ||
      !isReadyToPayRequest.allowedPaymentMethods.every(isPaymentMethodValid)) {
    return 'allowedPaymentMethods must be set to an array containing \'CARD\' ' +
        'and/or \'TOKENIZED_CARD\'!';
  }
  return null;
}

/**
 * Validate the payment method.
 *
 * @param {string} paymentMethod
 * @return {boolean} if the current payment method is valid.
 */
function isPaymentMethodValid(paymentMethod) {
  return Object.values(Constants.PaymentMethod).includes(paymentMethod);
}

/**
 * Validate the auth method.
 *
 * @param {string} authMethod
 * @return {boolean} if the current auth method is valid.
 */
function isAuthMethodValid(authMethod) {
  return Object.values(Constants.AuthMethod).includes(authMethod);
}

/**
 * Validate PaymentDataRequest.
 *
 * @param {!PaymentDataRequest} paymentDataRequest
 * @return {?string} errorMessage if the request is invalid.
 */
function validatePaymentDataRequest(paymentDataRequest) {
  if (!paymentDataRequest) {
    return 'paymentDataRequest must be set!';
  }
  if (paymentDataRequest.swg) {
    return validatePaymentDataRequestForSwg(paymentDataRequest.swg);
  } else if (!paymentDataRequest.transactionInfo) {
    return 'transactionInfo must be set!';
  } else if (!paymentDataRequest.transactionInfo.currencyCode) {
    return 'currencyCode in transactionInfo must be set!';
  } else if (
      !paymentDataRequest.transactionInfo.totalPriceStatus ||
      !Object.values(Constants.TotalPriceStatus)
           .includes(paymentDataRequest.transactionInfo.totalPriceStatus)) {
    return 'totalPriceStatus in transactionInfo must be set to one of' +
        ' NOT_CURRENTLY_KNOWN, ESTIMATED or FINAL!';
  } else if (
      paymentDataRequest.transactionInfo.totalPriceStatus !==
          'NOT_CURRENTLY_KNOWN' &&
      !paymentDataRequest.transactionInfo.totalPrice) {
    return 'totalPrice in transactionInfo must be set when' +
        ' totalPriceStatus is ESTIMATED or FINAL!';
  }

  // Validate payment data request for UPI payment method
  const allowedPaymentMethod = getUpiPaymentMethod(paymentDataRequest);
  if (allowedPaymentMethod) {
    if (!allowedPaymentMethod['parameters']) {
      return 'parameters must be set in allowedPaymentMethod!';
    }

    var parameters = allowedPaymentMethod['parameters'];
    if (!parameters['payeeVpa']) {
      return 'payeeVpa in allowedPaymentMethod parameters must be set!';
    } else if (!parameters['payeeName']) {
      return 'payeeName in allowedPaymentMethod parameters must be set!';
    } else if (!parameters['referenceUrl']) {
      return 'referenceUrl in allowedPaymentMethod parameters must be set!';
    } else if (!parameters['mcc']) {
      return 'mcc in allowedPaymentMethod parameters must be set!';
    } else if (!parameters['transactionReferenceId']) {
      return 'transactionReferenceId in allowedPaymentMethod parameters' +
          ' must be set!';
    }

    if (paymentDataRequest['transactionInfo']['currencyCode'] !== 'INR') {
      return 'currencyCode in transactionInfo must be set to INR!';
    } else if (
        paymentDataRequest['transactionInfo']['totalPriceStatus'] !== 'FINAL') {
      return 'totalPriceStatus in transactionInfo must be set to FINAL!';
    } else if (!paymentDataRequest['transactionInfo']['transactionNote']) {
      return 'transactionNote in transactionInfo must be set!';
    }
  }
  return null;
}

/**
 * Returns upi payment method object if it exists in allowed payment methods
 * or null if it doesn't
 *
 * @param {!IsReadyToPayRequest|!PaymentDataRequest} request
 * @return {?Object}
 */
function getUpiPaymentMethod(request) {
  if (!chromeSupportsPaymentRequest() || request.apiVersion < 2 ||
      !request.allowedPaymentMethods) {
    return null;
  }
  return getAllowedPaymentMethodForType_(request, Constants.PaymentMethod.UPI);
}

/**
 * Validate parameters for swg.
 *
 * @param {?SwgParameters} swgParameters
 * @return {?string} errorMessage if the request is invalid.
 */
function validatePaymentDataRequestForSwg(swgParameters) {
  if (!swgParameters) {
    return 'Swg parameters must be provided';
  }
  if (!swgParameters.skuId || !swgParameters.publicationId) {
    return 'Both skuId and publicationId must be provided';
  }
  return null;
}

/**
 * Returns the allowedAuthMethods for a card from the request.
 *
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 * @return {?Array<string>}
 * @private
 */
function extractAllowedAuthMethodsForCards_(isReadyToPayRequest) {
  if (isReadyToPayRequest.allowedPaymentMethods) {
    const allowedPaymentMethod = getAllowedPaymentMethodForType_(
        isReadyToPayRequest, Constants.PaymentMethod.CARD);
    if (allowedPaymentMethod && allowedPaymentMethod.parameters) {
      return allowedPaymentMethod.parameters['allowedAuthMethods'];
    }
  }
  return null;
}

/**
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 * @param {string} paymentMethodType
 * @return {?PaymentMethod} Return first payment method for the given type,
 *     return null if not found.
 * @private
 */
function getAllowedPaymentMethodForType_(
    isReadyToPayRequest, paymentMethodType) {
  for (var i = 0; i < isReadyToPayRequest.allowedPaymentMethods.length; i++) {
    const allowedPaymentMethod = isReadyToPayRequest.allowedPaymentMethods[i];
    if (allowedPaymentMethod.type == paymentMethodType) {
      return allowedPaymentMethod;
    }
  }
  return null;
}

/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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

/**
 * Injects the pay with google iframe.
 * @param {string} iframeClassName The classname of the iFrame wrapper.
 * @return {!{container: !Element, iframe:!HTMLIFrameElement}}
 */
function injectIframe(iframeClassName) {
  const container = document.createElement('div');
  container.classList.add(Constants.IFRAME_CONTAINER_CLASS);
  const iframeContainer = document.createElement('div');
  iframeContainer.classList.add('iframeContainer');
  /** @private @const {!HTMLIFrameElement} */
  const iframe =
      /** @type {!HTMLIFrameElement} */ (document.createElement('iframe'));
  iframe.classList.add(iframeClassName);
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframeContainer.appendChild(iframe);
  container.appendChild(iframeContainer);
  document.body.appendChild(container);
  return {'container': container, 'iframe': iframe};
}

/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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

const GPAY_ACTIVITY_REQUEST = 'GPAY';
const IFRAME_CLOSE_DURATION_IN_MS = 250;
const IFRAME_SHOW_UP_DURATION_IN_MS = 250;
const IFRAME_SMOOTH_HEIGHT_TRANSITION = `height ${IFRAME_SHOW_UP_DURATION_IN_MS}ms`;
const ERROR_PREFIX = 'Error: ';

/**
 * Supported browser user agent keys.
 *
 * @enum {string}
 */
const BrowserUserAgent = {
  CHROME: 'Chrome',
  FIREFOX: 'Firefox',
  SAFARI: 'Safari',
};

/**
 * An implementation of PaymentsClientDelegateInterface that uses the custom
 * hosting page along with web activities to actually get to the hosting page.
 * @implements {PaymentsClientDelegateInterface}
 */
class PaymentsWebActivityDelegate {
  /**
   * @param {string} environment
   * @param {string} googleTransactionId
   * @param {boolean=} useIframe
   * @param {!ActivityPorts=} activities Can be used to provide a shared
   *   activities manager. By default, the new manager is created.
   * @param {?string=} redirectKey The redirect key used for redirect mode.
   */
  constructor(
    environment,
    googleTransactionId,
    useIframe,
    activities,
    redirectKey
  ) {
    this.environment_ = environment;
    /** @private @const {boolean} */

    /** @const {!ActivityPorts} */
    this.activities = activities || new activityPorts_1(window);
    /** @const @private {!Graypane} */
    this.graypane_ = new Graypane$1(window.document);
    /** @private {?function(!Promise<!PaymentData>)} */
    this.callback_ = null;
    /**
     * @private {?{
     *             container: !Element,
     *             iframe:!HTMLIFrameElement,
     *             request:!PaymentDataRequest,
     *             dataPromise:?Promise<!PaymentData>}}
     */
    this.prefetchedObjects_ = null;
    /** @private {boolean} */
    this.shouldHandleResizing_ = false;
    /** @private {?ActivityIframePort} */
    this.port_ = null;
    /** @private {?function(!Promise<void>)} */
    this.dismissPromiseResolver_ = null;
    /** @const @private {string} */
    this.googleTransactionId_ = googleTransactionId;
    /** @const @private {?string} */
    this.redirectKey_ = redirectKey || null;

    /**
     * @private {?ResizePayload}
     */
    this.savedResizePayload_ = null;
  }

  /** @override */
  onResult(callback) {
    if (this.callback_) {
      return;
    }
    this.callback_ = callback;
    this.activities.onResult(
      GPAY_ACTIVITY_REQUEST,
      this.onActivityResult_.bind(this)
    );
  }

  /**
   * @param {!ActivityPort} port
   * @private
   */
  onActivityResult_(port) {
    // Hide the graypane.
    this.graypane_.hide();
    // Only verified origins are allowed.
    this.callback_(
      port.acceptResult().then(
        result => {
          // Origin must always match: popup, iframe or redirect.
          if (result.origin != this.getOrigin_()) {
            throw new Error('channel mismatch');
          }
          const data = /** @type {!PaymentData} */ (result.data);
          if (data['redirectEncryptedCallbackData']) {
            PayFrameHelper.setBuyFlowActivityMode(BuyFlowActivityMode.REDIRECT);
            return this.fetchRedirectResponse_(
              data['redirectEncryptedCallbackData']
            ).then(decrypedJson => {
              // Merge other non-encrypted fields into the final response.
              const clone = Object.assign({}, data);
              delete clone['redirectEncryptedCallbackData'];
              return Object.assign(clone, decrypedJson);
            });
          }
          // Unencrypted data supplied: must be a verified and secure channel.
          if (!result.originVerified || !result.secureChannel) {
            throw new Error('channel mismatch');
          }
          return data;
        },
        error => {
          // TODO: Log the original and the inferred error to eye3.
          const originalError = error['message'];
          let inferredError = error['message'];
          try {
            // Try to parse the error message to a structured error, if it's
            // not possible, fallback to use the error message string.
            inferredError = JSON.parse(
              originalError.substring(ERROR_PREFIX.length)
            );
          } catch (e) {}
          if (
            inferredError['statusCode'] &&
            ['DEVELOPER_ERROR', 'MERCHANT_ACCOUNT_ERROR'].indexOf(
              inferredError['statusCode']
            ) == -1
          ) {
            inferredError = {
              'statusCode': 'CANCELED',
            };
          }
          if (inferredError == 'AbortError') {
            inferredError = {
              'statusCode': 'CANCELED',
            };
          }
          return Promise.reject(inferredError);
        }
      )
    );
  }

  /**
   * @param {string} redirectEncryptedCallbackData
   * @return {!PaymentData}
   * @private
   */
  fetchRedirectResponse_(redirectEncryptedCallbackData) {
    // This method has to rely on the legacy XHR API because the redirect
    // functionality is, in part, aimed at older browsers.
    return new Promise((resolve, reject) => {
      const url = this.getDecryptionUrl_();
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      if ('withCredentials' in xhr) {
        // It's fine to proceed in a non-redirect mode because redirectVerifier
        // plays the part of CORS propagation.
        xhr.withCredentials = true;
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState < /* STATUS_RECEIVED */ 2) {
          return;
        }
        if (xhr.status < 100 || xhr.status > 599) {
          xhr.onreadystatechange = null;
          reject(new Error(`Unknown HTTP status ${xhr.status}`));
          return;
        }
        if (xhr.readyState == /* COMPLETE */ 4) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            // JSON parsing error is expected here.
            reject(e);
          }
        }
      };
      xhr.onerror = () => {
        reject(new Error('Network failure'));
      };
      xhr.onabort = () => {
        reject(new Error('Request aborted'));
      };

      // Send POST.
      xhr.send(redirectEncryptedCallbackData);
    });
  }

  /** @override */
  isReadyToPay(isReadyToPayRequest) {
    return new Promise((resolve, reject) => {
      if (doesMerchantSupportOnlyTokenizedCards(isReadyToPayRequest)) {
        resolve({'result': false});
        return;
      }
      const userAgent = window.navigator.userAgent;
      const isIosGsa =
        userAgent.indexOf('GSA/') > 0 &&
        userAgent.indexOf(BrowserUserAgent.SAFARI) > 0;
      // pop up in IGSA doesn't work.
      if (isIosGsa && !null) {
        resolve({'result': false});
        return;
      }
      const isFirefoxIos = userAgent.indexOf('FxiOS') > 0;
      if (isFirefoxIos) {
        resolve({'result': false});
        return;
      }
      const isSupported =
        userAgent.indexOf(BrowserUserAgent.CHROME) > 0 ||
        userAgent.indexOf(BrowserUserAgent.FIREFOX) > 0 ||
        userAgent.indexOf(BrowserUserAgent.SAFARI) > 0;
      if (
        isSupported &&
        isReadyToPayRequest.apiVersion >= 2 &&
        isReadyToPayRequest.existingPaymentMethodRequired
      ) {
        isReadyToPayRequest.environment = this.environment_;
        PayFrameHelper.sendAndWaitForResponse(
          isReadyToPayRequest,
          PostMessageEventType.IS_READY_TO_PAY,
          'isReadyToPayResponse',
          function(event) {
            const response = {
              'result': isSupported,
            };
            if (isReadyToPayRequest.existingPaymentMethodRequired) {
              response['paymentMethodPresent'] =
                event.data['isReadyToPayResponse'] == 'READY_TO_PAY';
            }
            resolve(response);
          }
        );
      } else {
        resolve({'result': isSupported});
      }
    });
  }

  /** @override */
  prefetchPaymentData(paymentDataRequest) {
    // Only handles prefetch for iframe for now.
    {
      return;
    }
  }

  /** @override */
  loadPaymentData(paymentDataRequest) {
    if (!paymentDataRequest.swg) {
      // Only set the apiVersion if the merchant is not setting it.
      if (!paymentDataRequest.apiVersion) {
        paymentDataRequest.apiVersion = 1;
      }
    }
    paymentDataRequest.environment = this.environment_;
    PayFrameHelper.setBuyFlowActivityMode(
      paymentDataRequest['forceRedirect']
        ? BuyFlowActivityMode.REDIRECT
        : BuyFlowActivityMode.POPUP
    );
    const opener = this.activities.open(
      GPAY_ACTIVITY_REQUEST,
      this.getHostingPageUrl_(),
      this.getRenderMode_(paymentDataRequest),
      paymentDataRequest,
      {'width': 600, 'height': 600}
    );
    this.graypane_.show(opener && opener.targetWin);
  }

  /**
   * Returns the render mode whether need to force redirect.
   *
   * @param {!PaymentDataRequest} paymentDataRequest
   * @return {string}
   * @private
   */
  getRenderMode_(paymentDataRequest) {
    return paymentDataRequest['forceRedirect'] ? '_top' : 'gp-js-popup';
  }

  /**
   * Returns the server origin based on the environment.
   *
   * @private
   * @return {string}
   */
  getOrigin_() {
    if (this.environment_ == Constants.Environment.LOCAL) {
      return '';
    }

    let baseDomain;
    if (this.environment_ == Constants.Environment.PREPROD) {
      baseDomain = 'pay-preprod.sandbox';
    } else if (this.environment_ == Constants.Environment.SANDBOX) {
      baseDomain = 'pay.sandbox';
    } else {
      baseDomain = 'pay';
    }
    return 'https://' + baseDomain + '.google.com';
  }

  /**
   * Returns the base path based on the environment.
   *
   * @private
   * @return {string} The base path
   */
  getBasePath_() {
    return this.getOrigin_() + '/gp/p';
  }

  /**
   * Returns the decryption url to be used to decrypt the encrypted payload.
   *
   * @private
   * @return {string} The decryption url
   */
  getDecryptionUrl_() {
    let url = this.getBasePath_() + '/apis/buyflow/process';
    if (this.redirectKey_) {
      url += '?rk=' + encodeURIComponent(this.redirectKey_);
    }
    return url;
  }

  /**
   * Returns the hosting page url.
   *
   * @private
   * @return {string} The hosting page url
   */
  getHostingPageUrl_() {
    // In Tin tests, the hosting page is requested from
    // /testing/buyflow/merchantdemo.html and is accessed relatively since the
    // base path is unknown ahead of time.
    if (this.environment_ == Constants.Environment.TIN) {
      // There is no /gp/p prefix since multilogin prefixes is broken in Tin:
      // http://yaqs/4912322941550592
      return '/ui/pay';
    }
    return this.getBasePath_() + '/ui/pay';
  }

  /**
   * Returns the iframe pwg url to be used to be used for amp.
   *
   * @param {string} environment
   * @param {string} origin
   * @return {string} The iframe url
   */
  getIframeUrl(environment, origin) {
    // TODO: These should be compile time constants and not dependent
    // on the environment.
    let iframeUrl = `https://pay.google.com/gp/p/ui/pay?origin=${origin}`;
    if (
      environment == Constants.Environment.SANDBOX ||
      environment == Constants.Environment.PREPROD
    ) {
      iframeUrl = `https://pay'+  (environment == Constants.Environment.PREPROD ? '-preprod' : '')+  '.sandbox.google.com/gp/p/ui/pay?origin=${origin}`;
    }
    return iframeUrl;
  }

  /**
   * Close iframe with animation.
   *
   * @param {!Element} container
   * @param {!HTMLIFrameElement} iframe
   * @private
   */
  removeIframeAndContainer_(container, iframe) {
    const transitionStyle = 'all ' + IFRAME_CLOSE_DURATION_IN_MS + 'ms ease 0s';
    this.setTransition_(iframe, transitionStyle);
    iframe.height = '0px';
    // TODO: This should be replaced by listening to TransitionEnd event
    setTimeout(() => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }, IFRAME_CLOSE_DURATION_IN_MS);
  }

  /**
   * @param {!PaymentDataRequest} paymentDataRequest
   * @return {{container: !Element, iframe:!HTMLIFrameElement}}
   * @private
   */
  injectIframe_(paymentDataRequest) {
    const containerAndFrame = injectIframe(
      this.isVerticalCenterExperimentEnabled_(paymentDataRequest)
        ? Constants.IFRAME_STYLE_CENTER_CLASS
        : Constants.IFRAME_STYLE_CLASS
    );
    const iframe = containerAndFrame['iframe'];
    const container = containerAndFrame['container'];
    container.addEventListener(
      'click',
      this.closeActionHandler_.bind(this, containerAndFrame)
    );
    // Hide iframe and disable resize at initialize.
    container.style.display = 'none';
    iframe.style.display = 'none';
    iframe.height = '0px';
    const transitionStyle =
      'all ' + IFRAME_SHOW_UP_DURATION_IN_MS + 'ms ease 0s';
    this.setTransition_(iframe, transitionStyle);
    this.shouldHandleResizing_ = false;
    return containerAndFrame;
  }

  /**
   * Handler when back button is triggered, should dismiss iframe if present.
   * @param {{container: !Element, iframe:!HTMLIFrameElement}} containerAndFrame
   * @private
   */
  backButtonHandler_(containerAndFrame) {
    this.dismissIframe_(containerAndFrame);
  }

  /**
   * Handler when close action is triggered, will pop history state to close
   * the iframe.
   * @param {{container: !Element, iframe:!HTMLIFrameElement}} containerAndFrame
   * @private
   */
  closeActionHandler_(containerAndFrame) {
    if (containerAndFrame['container'].parentNode) {
      // Close action only when container is still attached to the page.
      history.back();
    }
  }

  /**
   * @param {{container: !Element, iframe:!HTMLIFrameElement}} containerAndFrame
   * @private
   */
  dismissIframe_(containerAndFrame) {
    // Dismiss iframe only when container is still attached in the page.
    if (containerAndFrame['container'].parentNode) {
      // TODO: Think about whether this could be just hide instead of
      // disconnect and remove, the tricky part is how to handle the case where
      // payment data request is not the same.
      this.dismissPromiseResolver_(Promise.reject({'errorCode': 'CANCELED'}));
      this.removeIframeAndContainer_(
        containerAndFrame['container'],
        containerAndFrame['iframe']
      );
      this.port_ && this.port_.disconnect();
    }
  }

  /**
   * @param {!PaymentDataRequest} paymentDataRequest
   * @return {boolean}
   * @private
   */
  isVerticalCenterExperimentEnabled_(paymentDataRequest) {
    return (
      null  
    );
  }

  /**
   * @param {!Element} container
   * @param {!HTMLIFrameElement} iframe
   * @param {!PaymentDataRequest} paymentDataRequest
   * @private
   */
  showContainerAndIframeWithAnimation_(container, iframe, paymentDataRequest) {
    container.style.display = 'block';
    iframe.style.display = 'block';
    setTimeout(() => {
      // Hard code the apprx height here, it will be resize to expected height
      // later.
      iframe.height = '280px';
      if (this.isVerticalCenterExperimentEnabled_(paymentDataRequest)) {
        iframe.classList.add(Constants.IFRAME_ACTIVE_CONTAINER_CLASS);
      }
      // TODO: This should be handles properly by listening to
      // TransitionEnd event.
      setTimeout(() => {
        this.shouldHandleResizing_ = true;
        // TODO: Add browser test that catches this.
        if (this.savedResizePayload_) {
          this.setTransition_(iframe, this.savedResizePayload_['transition']);
          iframe.height = this.savedResizePayload_['height'];
          this.savedResizePayload_ = null;
        }
      }, IFRAME_SHOW_UP_DURATION_IN_MS);
    }, 1);
  }

  /**
   * @param {!HTMLIFrameElement} iframe
   * @param {string} transitionStyle
   * @private
   */
  setTransition_(iframe, transitionStyle) {
    iframe.style.setProperty('transition', transitionStyle);
    // For safari.
    iframe.style.setProperty('-webkit-transition', transitionStyle);
  }

  /**
   * Use WebActivitiy to open iframe that's in given container.
   *
   * @param {!Element} container
   * @param {!HTMLIFrameElement} iframe
   * @param {!PaymentDataRequest} paymentDataRequest
   * @return {!Promise<!PaymentData>}
   * @private
   */
  openIframe_(container, iframe, paymentDataRequest) {
    if (!paymentDataRequest.swg) {
      if (!paymentDataRequest.apiVersion) {
        paymentDataRequest.apiVersion = 1;
      }
    }
    paymentDataRequest.environment = this.environment_;
    let iframeLoadStartTime;
    const trustedUrl = this.getIframeUrl(
      this.environment_,
      window.location.origin
    );
    return this.activities
      .openIframe(iframe, trustedUrl, paymentDataRequest)
      .then(port => {
        // Handle custom resize message.
        this.port_ = port;
        port.onMessage(payload => {
          if (payload['type'] !== 'resize' || !this.shouldHandleResizing_) {
            // Save the resize event later after initial animation is finished
            this.savedResizePayload_ = {
              'height': payload['height'],
              'transition': payload['transition'],
            };
            return;
          }
          // b/111310899: Smooth out initial iFrame loading
          if (!iframeLoadStartTime) {
            iframeLoadStartTime = Date.now();
          }
          if (
            Date.now() <
            iframeLoadStartTime + IFRAME_SHOW_UP_DURATION_IN_MS
          ) {
            this.setTransition_(
              iframe,
              payload['transition'] + ', ' + IFRAME_SMOOTH_HEIGHT_TRANSITION
            );
          } else {
            this.setTransition_(iframe, payload['transition']);
          }
          iframe.height = payload['height'];
        });
        return /** @type {!Promise<!Object>} */ (port.acceptResult());
      })
      .then(
        /**
         * @param {!Object} result
         * @return {!PaymentData}
         */
        result => {
          this.removeIframeAndContainer_(container, iframe);
          // This is only for popping the state we pushed earlier.
          history.back();
          const data = /** @type {!PaymentData} */ (result['data']);
          return data;
        },
        error => {
          this.removeIframeAndContainer_(container, iframe);
          // This is only for popping the state we pushed earlier.
          history.back();
          return Promise.reject(error);
        }
      );
  }
}

/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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

class UpiHandler {
  constructor() {}

  /**
   * Returns upi payment method object if it exists in allowed payment methods
   * or null if it doesn't
   *
   * @param {!IsReadyToPayRequest|!PaymentDataRequest} request
   * @return {boolean}
   */
  isUpiRequest(request) {
    return !!getUpiPaymentMethod(request);
  }

  /**
   * Returns upi payment method object if it exists in allowed payment methods
   * or null if it doesn't
   *
   * @param {!IsReadyToPayRequest|!PaymentDataRequest} request
   * @return {!Promise} The promise will contain the boolean result and error
   *     message when possible.
   */
  isReadyToPay(request) {
    // Always return true for UPI if api version is 2 and chrome supports
    // payment request
    if (getUpiPaymentMethod(request)) {
      if (request.existingPaymentMethodRequired) {
        return Promise.resolve({'result': true, 'paymentMethodPresent': true});
      } else {
        return Promise.resolve({'result': true});
      }
    }
    throw new Error('No Upi payment method found in handler');
  }

  /**
   * Request payment data when payment method is UPI
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @param {!Object} upiPaymentMethod UPI paymentmethod in
   *     allowedPaymentMethods array.
   * @param {!Function} onResultCallback Function to call when everything is
   *     done.
   */
  loadPaymentData(paymentDataRequest, upiPaymentMethod, onResultCallback) {
    const parameters = upiPaymentMethod['parameters'];
    const transactionInfo = paymentDataRequest['transactionInfo'];
    const supportedInstruments = 
        [{
          'supportedMethods': ['https://tez.google.com/pay'],
          'data': {
            'pa': parameters['payeeVpa'],
            'pn': parameters['payeeName'],
            'tr': parameters['transactionReferenceId'],
            'url': parameters['referenceUrl'],
            'mc': parameters['mcc'],
            'tn': transactionInfo['transactionNote'],
          },
        }];

    if (parameters['transactionId']) {
      supportedInstruments[0]['data']['tid'] = parameters['transactionId'];
    }

    const details = {
      'total': {
        'label': 'Total',
        'amount': {
          'currency': transactionInfo['currencyCode'],
          'value': transactionInfo['totalPrice'],
        },
      },
      'displayItems': [{
        'label': 'Original Amount',
        'amount': {
          'currency': transactionInfo['currencyCode'],
          'value': transactionInfo['totalPrice'],
        },
      }],
    };

    let request = new PaymentRequest(supportedInstruments, details);

    onResultCallback(
        this.checkCanMakePayment_(request)
            .then(result => {
              if (result) {
                return this.showUi_(request);
              } else {
                return this.redirectToGooglePlay_();
              }
            })
            .then(paymentData => {
              return this.processData_(
                  paymentData, paymentDataRequest, upiPaymentMethod);
            })
            .catch(error => {
              error['statusCode'] = Constants.ResponseStatus.CANCELED;
              return Promise.reject(error);
            }));
  }

  /**
   * Show the Tez payment request UI.
   *
   * @private
   * @param {!PaymentRequest} request The payment request object.
   * @return {!Promise<!PaymentData>} A promise containing payment response.
   */
  showUi_(request) {
    return request.show().then(paymentResponse => {
      paymentResponse.complete('success');
      return paymentResponse.details;
    });
  }

  /**
   * Checks whether can make a payment with Tez on this device.
   *
   * @private
   * @param {!PaymentRequest} request The payment request object.
   * @return {!Promise<boolean>} a promise containing the result of whether can
   *     make payment.
   */
  checkCanMakePayment_(request) {
    // Checks canMakePayment cache, and use the cache result if it exists.
    const cacheResult =
        window.sessionStorage.getItem(Constants.UPI_CAN_MAKE_PAYMENT_CACHE_KEY);
    if (cacheResult) {
      return Promise.resolve(cacheResult === 'true');
    }

    // Feature detect canMakePayment().
    if (!request.canMakePayment) {
      return Promise.resolve(true);
    }

    let canMakePaymentPromise = request.canMakePayment();

    return canMakePaymentPromise.then(result => {
      // Store the result in cache if the result is true to avoid quota error
      // caused by querying multiple times with different data.
      // Doesn't store false because if we do so, user will be redirected to
      // Google Play again after installing Google Pay if Chrome is not closed.
      if (result) {
        window.sessionStorage.setItem(
            Constants.UPI_CAN_MAKE_PAYMENT_CACHE_KEY, result.toString());
      }
      return result;
    });
  }

  /**
   * Redirect user to Google Pay app in Google Play store
   *
   * @private
   * @returns {!Promise<!Object>} Rejected promise with error message
   */
  redirectToGooglePlay_() {
    window.location.replace(
          // NOLINT
            'https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user');  // NOLINT
    return Promise.reject(
        {'errorMessage': 'Cannot redirect to Tez page in Google Play.'});
  }

  /**
   * Convert Tez payment data to GPay payment data if payment succeeded, or
   * reject if payment failed
   *
   * @private
   * @param {!PaymentData} tezPaymentData The payment data object from Tez.
   * @param {!PaymentDataRequest} paymentDataRequest The payment data request.
   * @param {!Object} upiPaymentMethod UPI paymentmethod in
   * allowedPaymentMethods array
   * @returns {!Promise<PaymentData>} A promise containing payment data or
   *     error message.
   */
  processData_(tezPaymentData, paymentDataRequest, upiPaymentMethod) {
    const tezResponse = JSON.parse(tezPaymentData['tezResponse']);
    if (tezResponse['Status'] === 'FAILURE') {
      let error;
      switch (tezResponse['responseCode']) {
        case 'ZM':
          // payment failure due to invalid MPIN
          error = {
            'errorCode': PublicErrorCode.BUYER_ACCOUNT_ERROR,
            'errorMessage': 'Payment failure due to invalid MPIN.'
          };
          break;
        case 'Z9':
          // payment failure due to insufficient funds
          error = {
            'errorCode': PublicErrorCode.BUYER_ACCOUNT_ERROR,
            'errorMessage': 'Payment failure due to insufficient funds.'
          };
          break;
        case '91':
          // payment failure due to transaction timeout or connection issue
          error = {
            'errorCode': PublicErrorCode.INTERNAL_ERROR,
            'errorMessage':
                'Payment failure due to transaction timeout or connection' +
                ' issue.'
          };
          break;
        default:
          // payment failure due to user cancel or other issues
          error = {'errorMessage': 'Payment cancelled.'};
      }
      return Promise.reject(error);
    }

    const signedMessage = {
      'paymentMethodType': 'UPI',
      'payeeVpa': upiPaymentMethod['parameters']['payeeVpa'],
      'status': tezResponse['Status'],
      'transactionReferenceId':
          upiPaymentMethod['parameters']['transactionReferenceId'],
      'transactionId': upiPaymentMethod['parameters']['transactionId'] ?
          upiPaymentMethod['parameters']['transactionId'] :
          tezResponse['txnId'],
      'transactionInfo': paymentDataRequest['transactionInfo'],
    };

    let paymentData = {
      'apiVersion': paymentDataRequest['apiVersion'],
      'apiVersionMinor': paymentDataRequest['apiVersionMinor'],
      'paymentMethodData': {
        'type': upiPaymentMethod['type'],
        'tokenizationData': {
          'type': 'DIRECT',
          'token': {
            'protocolVersion': 'ECv1',
            // TODO: Verify that response comes from tez and
            // add signature and encrypt signed message here
            'signature': '',
            'signedMessage': signedMessage
          }
        }
      }
    };
    return Promise.resolve(paymentData);
  }
}

/** @license
Math.uuid.js (v1.4)
http://www.broofa.com
mailto:robert@broofa.com
Copyright (c) 2010 Robert Kieffer
Dual licensed under the MIT and GPL licenses.
*/

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *   length - the desired number of characters
 *   radix  - the number of allowable values for each character.
 *
 * EXAMPLES:
 *   // No arguments  - returns RFC4122, version 4 ID
 *   >>> Math.uuid()
 *   "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *   // One argument - returns ID of the specified length
 *   >>> Math.uuid(15)     // 15 character ID (default base=62)
 *   "VcydxgltxrVZSTV"
 *
 *   // Two arguments - returns ID of the specified length, and radix. (Radix must be <= 62)
 *   >>> Math.uuid(8, 2)  // 8 character ID (base=2)
 *   "01001010"
 *   >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *   "47473046"
 *   >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *   "098F4D35"
 */

class Random_uuid {}  // Private array of chars to use
  var CHARS$1 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  Random_uuid.uuid = function (len, radix) {
    var chars = CHARS$1, uuid = [], i;
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  };

  // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
  // by minimizing calls to random()
  Random_uuid.uuidFast = function() {
    var chars = CHARS$1, uuid = new Array(36), rnd=0, r;
    for (var i = 0; i < 36; i++) {
      if (i==8 || i==13 ||  i==18 || i==23) {
        uuid[i] = '-';
      } else if (i==14) {
        uuid[i] = '4';
      } else {
        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
        r = rnd & 0xf;
        rnd = rnd >> 4;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
    return uuid.join('');
  };

  // A more compact, but less performant, RFC4122v4 solution:
  Random_uuid.uuidCompact = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  };

/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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

/**
 * Returns a google transaction id.
 *
 * @param {string} environment
 * @return {string}
 */
function createGoogleTransactionId(environment) {
  return Random_uuid.uuidFast() + '.' + environment;
}

/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
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

const TRUSTED_DOMAINS = [
  'actions.google.com',
  'amp-actions.sandbox.google.com',
  'amp-actions-staging.sandbox.google.com',
  'amp-actions-autopush.sandbox.google.com',
  'payments.developers.google.com',
  'payments.google.com',
];

/**
 * The client for interacting with the Google Payment APIs.
 * <p>
 * The async refers to the fact that this client supports redirects
 * when using webactivties.
 * <p>
 * If you are using this be sure that this is what you want.
 * <p>
 * In almost all cases PaymentsClient is the better client to use because
 * it exposes a promises based api which is easier to deal with.
 * @final
 */
class PaymentsAsyncClient {
  /**
   * @param {!PaymentOptions} paymentOptions
   * @param {function(!Promise<!PaymentData>)} onPaymentResponse
   * @param {boolean=} useIframe
   * @param {!ActivityPorts=} activities Can be used to provide a shared
   *   activities manager. By default, the new manager is created.
   */
  constructor(paymentOptions, onPaymentResponse, useIframe, activities) {
    this.onPaymentResponse_ = onPaymentResponse;

    validatePaymentOptions(paymentOptions);

    /** @private {?number} */
    this.loadPaymentDataApiStartTimeMs_ = null;

    /** @private @const {string} */
    this.environment_ =
      paymentOptions.environment || Constants.Environment.TEST;
    if (!PaymentsAsyncClient.googleTransactionId_) {
      PaymentsAsyncClient.googleTransactionId_ =
        /** @type {string} */ (this.isInTrustedDomain_() &&
        paymentOptions['i'] &&
        paymentOptions['i']['googleTransactionId']
          ? paymentOptions['i']['googleTransactionId']
          : createGoogleTransactionId(this.environment_));
    }

    /** @private @const {!PaymentOptions} */
    this.paymentOptions_ = paymentOptions;

    /** @private @const {!PaymentsClientDelegateInterface} */
    this.webActivityDelegate_ = new PaymentsWebActivityDelegate(
      this.environment_,
      PaymentsAsyncClient.googleTransactionId_,
      useIframe,
      activities,
      paymentOptions['i'] && paymentOptions['i']['redirectKey']
    );

    /** @private {number} */
    this.buyFlowMode_ = BuyFlowMode.PAY_WITH_GOOGLE;

    const paymentRequestSupported = chromeSupportsPaymentRequest();
    // TODO: Remove the temporary hack that disable payments
    // request for inline flow.
    /** @private @const {?PaymentsClientDelegateInterface} */
    this.delegate_ =
      paymentRequestSupported && !useIframe
        ? new PaymentsRequestDelegate(this.environment_)
        : this.webActivityDelegate_;

    this.upiHandler_ = new UpiHandler();

    this.webActivityDelegate_.onResult(this.onResult_.bind(this));
    this.delegate_.onResult(this.onResult_.bind(this));

    // Load PayFrameHelper upon client construction.
    PayFrameHelper.load();

    // If web delegate is used anyway then this is overridden in the web
    // activity delegate when load payment data is called.
    if (chromeSupportsPaymentHandler()) {
      PayFrameHelper.setBuyFlowActivityMode(
        BuyFlowActivityMode.PAYMENT_HANDLER
      );
    } else if (paymentRequestSupported) {
      PayFrameHelper.setBuyFlowActivityMode(BuyFlowActivityMode.ANDROID_NATIVE);
    }

    PayFrameHelper.setGoogleTransactionId(
      PaymentsAsyncClient.googleTransactionId_
    );
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_INITIALIZE_PAYMENTS_CLIENT,
      'clientLatencyStartMs': Date.now(),
    });

    window.addEventListener('message', event =>
      this.handleMessageEvent_(event)
    );
  }

  /**
   * Check whether the user can make payments using the Payment API.
   *
   * @param {!IsReadyToPayRequest} isReadyToPayRequest
   * @return {!Promise} The promise will contain the boolean result and error
   *     message when possible.
   * @export
   */
  isReadyToPay(isReadyToPayRequest) {
    // Merge with paymentOptions, preferring values from isReadyToPayRequest
    if (isReadyToPayRequest) {
      isReadyToPayRequest = Object.assign(
        {},
        this.paymentOptions_,
        isReadyToPayRequest
      );
    }
    const startTimeMs = Date.now();
    /** @type {?string} */
    const errorMessage =
      validateSecureContext() ||
      validateIsReadyToPayRequest(isReadyToPayRequest);
    if (errorMessage) {
      return new Promise((resolve, reject) => {
        PaymentsAsyncClient.logDevErrorToConsole_('isReadyToPay', errorMessage);
        PayFrameHelper.postMessage({
          'eventType': PostMessageEventType.LOG_IS_READY_TO_PAY_API,
          'error': PublicErrorCode.DEVELOPER_ERROR,
        });
        reject({
          'statusCode': Constants.ResponseStatus.DEVELOPER_ERROR,
          'statusMessage': errorMessage,
        });
      });
    }

    const isReadyToPayPromise = this.isReadyToPay_(isReadyToPayRequest);

    isReadyToPayPromise.then(response => {
      PayFrameHelper.postMessage({
        'eventType': PostMessageEventType.LOG_IS_READY_TO_PAY_API,
        'clientLatencyStartMs': startTimeMs,
        'isReadyToPayApiResponse': response,
      });
      return response;
    });
    return isReadyToPayPromise;
  }

  /**
   * Actual implementation of isReadyToPay in a private method so that
   * we can add callbacks to the promise to measure latencies.
   *
   * @param {!IsReadyToPayRequest} isReadyToPayRequest
   * @return {!Promise} The promise will contain the boolean result and error
   *     message when possible.
   * @private
   */
  isReadyToPay_(isReadyToPayRequest) {
    if (this.upiHandler_.isUpiRequest(isReadyToPayRequest)) {
      return this.upiHandler_.isReadyToPay(isReadyToPayRequest);
    }
    if (
      chromeSupportsPaymentRequest() &&
      !isNativeDisabledInRequest(isReadyToPayRequest)
    ) {
      if (isReadyToPayRequest.apiVersion >= 2) {
        return this.isReadyToPayApiV2ForChromePaymentRequest_(
          isReadyToPayRequest
        );
      } else {
        // This is the apiVersion 1 branch.
        // If the merchant supports only Tokenized cards then just rely on
        // delegate to give us the result.
        // This will need to change once b/78519188 is fixed.
        const webPromise = this.webActivityDelegate_.isReadyToPay(
          isReadyToPayRequest
        );
        const nativePromise = this.delegate_.isReadyToPay(isReadyToPayRequest);
        if (
          doesMerchantSupportOnlyTokenizedCards(isReadyToPayRequest) &&
          !chromeSupportsPaymentHandler()
        ) {
          return nativePromise;
        }
        // Return webIsReadyToPay only if delegateIsReadyToPay has been
        // executed.
        return nativePromise.then(() => webPromise);
      }
    }
    const webPromise = this.webActivityDelegate_.isReadyToPay(
      isReadyToPayRequest
    );
    return webPromise;
  }

  /**
   * Handle is ready to pay for api v2.
   *
   * @param {!IsReadyToPayRequest} isReadyToPayRequest
   * @return {!Promise} The promise will contain the boolean result and error
   *     message when possible.
   * @private
   */
  isReadyToPayApiV2ForChromePaymentRequest_(isReadyToPayRequest) {
    let defaultPromise = Promise.resolve({'result': false});
    if (isReadyToPayRequest.existingPaymentMethodRequired) {
      defaultPromise = Promise.resolve({
        'result': false,
        'paymentMethodPresent': false,
      });
    }

    let nativePromise = defaultPromise;
    if (
      apiV2DoesMerchantSupportSpecifiedCardType(
        isReadyToPayRequest,
        Constants.AuthMethod.CRYPTOGRAM_3DS
      )
    ) {
      // If the merchant supports tokenized cards.
      // Make a separate call to gms core to check if the user isReadyToPay
      // with just tokenized cards. We can't pass in PAN_ONLY here
      // because gms core always returns true for PAN_ONLY.
      // Leave other payment methods as is.
      const nativeRtpRequest /** @type {!IsReadyToPayRequest} */ = JSON.parse(
        JSON.stringify(isReadyToPayRequest)
      );
      for (let i = 0; i < nativeRtpRequest.allowedPaymentMethods.length; i++) {
        if (
          nativeRtpRequest.allowedPaymentMethods[i].type ==
          Constants.PaymentMethod.CARD
        ) {
          nativeRtpRequest.allowedPaymentMethods[i].parameters[
            'allowedAuthMethods'
          ] = [Constants.AuthMethod.CRYPTOGRAM_3DS];
        }
      }

      nativePromise = this.delegate_.isReadyToPay(nativeRtpRequest);
    }

    let webPromise = defaultPromise;
    if (
      apiV2DoesMerchantSupportSpecifiedCardType(
        isReadyToPayRequest,
        Constants.AuthMethod.PAN_ONLY
      )
    ) {
      webPromise = this.webActivityDelegate_.isReadyToPay(isReadyToPayRequest);
    }

    // Update session storage with payment handler canMakePayment result but
    // rely on web delegate for actual response
    if (chromeSupportsPaymentHandler()) {
      return nativePromise.then(() => webPromise);
    }

    return nativePromise.then(nativeResult => {
      if ((nativeResult && nativeResult['result']) == true) {
        return nativeResult;
      }
      return webPromise;
    });
  }

  /**
   * Prefetch paymentData to speed up loadPaymentData call. Note the provided
   * paymentDataRequest should exactly be the same as provided in
   * loadPaymentData to make the loadPaymentData call fast since current
   * web flow prefetching is based on the full request parameters.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @export
   */
  prefetchPaymentData(paymentDataRequest) {
    /** @type {?string} */
    const errorMessage =
      validateSecureContext() || validatePaymentDataRequest(paymentDataRequest);
    if (errorMessage) {
      PaymentsAsyncClient.logDevErrorToConsole_(
        'prefetchPaymentData',
        errorMessage
      );
      return;
    }
    this.assignInternalParams_(paymentDataRequest);
    if (
      chromeSupportsPaymentRequest() &&
      !isNativeDisabledInRequest(paymentDataRequest)
    ) {
      this.delegate_.prefetchPaymentData(paymentDataRequest);
    } else {
      // For non chrome supports always use the hosting page.
      this.webActivityDelegate_.prefetchPaymentData(paymentDataRequest);
    }
  }

  /**
   * Request PaymentData, which contains necessary infomartion to complete a
   * payment.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @export
   */
  loadPaymentData(paymentDataRequest) {
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_BUTTON_CLICK,
    });
    const errorMessage =
      validateSecureContext() || validatePaymentDataRequest(paymentDataRequest);
    this.buyFlowMode_ =
      paymentDataRequest && paymentDataRequest.swg
        ? BuyFlowMode.SUBSCRIBE_WITH_GOOGLE
        : BuyFlowMode.PAY_WITH_GOOGLE;
    if (errorMessage) {
      this.onPaymentResponse_(
        new Promise((resolve, reject) => {
          PayFrameHelper.postMessage({
            'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
            'error': PublicErrorCode.DEVELOPER_ERROR,
            'buyFlowMode': this.buyFlowMode_,
          });
          PaymentsAsyncClient.logDevErrorToConsole_(
            'loadPaymentData',
            errorMessage
          );
          reject({
            'statusCode': Constants.ResponseStatus.DEVELOPER_ERROR,
            'statusMessage': errorMessage,
          });
        })
      );
      return;
    }

    // Handler for UPI PaymentMethod
    // Currently we don't support UPI along with other payment methods, if
    // UPI is in payment methods then we assume it is UPI only.
    const upiPaymentMethod = getUpiPaymentMethod(paymentDataRequest);
    if (upiPaymentMethod) {
      this.upiHandler_.loadPaymentData(
        paymentDataRequest,
        upiPaymentMethod,
        this.onResult_.bind(this)
      );
      return;
    }

    const isReadyToPayResult = window.sessionStorage.getItem(
      Constants.IS_READY_TO_PAY_RESULT_KEY
    );
    this.loadPaymentDataApiStartTimeMs_ = Date.now();
    this.assignInternalParams_(paymentDataRequest);
    // We want to fall back to the web delegate if payment handler is supported
    // and isReadyToPay bit is not explicitly set to true (fallback to web if
    // isReadyToPay wasn't called for PH)
    if (
      (chromeSupportsPaymentHandler() && isReadyToPayResult !== 'true') ||
      isNativeDisabledInRequest(paymentDataRequest)
    ) {
      this.webActivityDelegate_.loadPaymentData(paymentDataRequest);
    } else {
      this.delegate_.loadPaymentData(paymentDataRequest);
    }
  }

  /**
   * Log developer error to console.
   *
   * @param {string} apiName
   * @param {?string} errorMessage
   * @private
   */
  static logDevErrorToConsole_(apiName, errorMessage) {
    console.error('DEVELOPER_ERROR in ' + apiName + ' : ' + errorMessage);
  }

  /**
   * Return a <div> element containing a Google Pay payment button.
   *
   * @param {!ButtonOptions=} options
   * @return {!Element}
   * @export
   */
  createButton(options = {}) {
    const button = null;
    // Only log if button was created successfully
    const startTimeMs = Date.now();
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_RENDER_BUTTON,
      'clientLatencyStartMs': startTimeMs,
    });
    return button;
  }

  /**
   * @param {!Event} e postMessage event from the AMP page.
   * @private
   */
  handleMessageEvent_(e) {
    if (this.isInTrustedDomain_()) {
      // Only handles the event right now if loaded in trusted domain.
      if (e.data['name'] === 'logPaymentData') {
        PayFrameHelper.postMessage(e.data['data']);
      }
    }
  }

  /**
   * @private
   * @return {boolean}
   */
  isInTrustedDomain_() {
    return TRUSTED_DOMAINS.indexOf(window.location.hostname) != -1;
  }

  /**
   * Called when load payment data result is returned. This triggers the payment
   * response callback passed to the client.
   *
   * @private
   */
  onResult_(response) {
    response
      .then(result => {
        PayFrameHelper.postMessage({
          'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
          'clientLatencyStartMs': this.loadPaymentDataApiStartTimeMs_,
          'buyFlowMode': this.buyFlowMode_,
        });
      })
      .catch(result => {
        if (result['errorCode']) {
          PayFrameHelper.postMessage({
            'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
            'error': /** @type {!PublicErrorCode} */ (result['errorCode']),
            'buyFlowMode': this.buyFlowMode_,
          });
        } else {
          // If user closes window we don't get a error code
          PayFrameHelper.postMessage({
            'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
            'error': PublicErrorCode.BUYER_CANCEL,
            'buyFlowMode': this.buyFlowMode_,
          });
        }
      });
    this.onPaymentResponse_(response);
  }

  /**
   * @param {!PaymentDataRequest} paymentDataRequest
   * @return {!PaymentDataRequest}
   * @private
   */
  assignInternalParams_(paymentDataRequest) {
    const internalParam = {
      'startTimeMs': Date.now(),
      'googleTransactionId': PaymentsAsyncClient.googleTransactionId_,
    };
    paymentDataRequest['i'] = paymentDataRequest['i']
      ? Object.assign(internalParam, paymentDataRequest['i'])
      : internalParam;
    return paymentDataRequest;
  }
}

/**
 * Whether the request specifies that the native support has to be disabled.
 *
 * @param {!IsReadyToPayRequest|!PaymentDataRequest} request
 * @return {boolean}
 */
function isNativeDisabledInRequest(request) {
  return (request['i'] && request['i']['disableNative']) === true;
}

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

class Preconnect {
  /**
   * @param {!Document} doc
   */
  constructor(doc) {
    /** @private @const {!Document} */
    this.doc_ = doc;
  }

  /**
   * @param {string} url
   */
  preconnect(url) {
    this.pre_(url, 'preconnect');
  }

  /**
   * @param {string} url
   */
  dnsPrefetch(url) {
    this.pre_(url, 'dns-prefetch');
  }

  /**
   * @param {string} url
   */
  prefetch(url) {
    this.pre_(url, 'preconnect prefetch');
  }

  /**
   * @param {string} url
   * @param {string} as
   */
  preload(url, as) {
    this.pre_(url, 'preconnect preload', as);
  }

  /**
   * @param {string} url
   * @param {string} rel
   * @param {?string=} as
   * @private
   */
  pre_(url, rel, as) {
    // <link rel="prefetch" href="..." as="">
    const linkEl = createElement(this.doc_, 'link', {
      'rel': rel,
      'href': url,
    });
    if (as) {
      linkEl.setAttribute('as', as);
    }
    this.doc_.head.appendChild(linkEl);
  }
}

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

const REDIRECT_STORAGE_KEY = 'subscribe.google.com:rk';

/**
 * @const {!Object<string, string>}
 * @package Visible for testing only.
 */
const PAY_ORIGIN = {
  'PRODUCTION': 'https://pay.google.com',
  'SANDBOX': 'https://pay.sandbox.google.com',
};

/** @return {string} */
function payUrl() {
  return feCached(PAY_ORIGIN['PRODUCTION'] + '/gp/p/ui/pay');
}

/**
 */
class PayClient {
  /**
   * @param {!./deps.DepsDef} deps
   */
  constructor(deps) {
    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private {?function(!Promise<!PaymentData>)} */
    this.responseCallback_ = null;

    /** @private {?PaymentDataRequest} */
    this.request_ = null;

    /** @private {?Promise<!PaymentData>} */
    this.response_ = null;

    /** @private @const {!./analytics-service.AnalyticsService} */
    this.analytics_ = deps.analytics();

    /** @private @const {!RedirectVerifierHelper} */
    this.redirectVerifierHelper_ = new RedirectVerifierHelper(this.win_);

    /** @private {?PaymentsAsyncClient} */
    this.client_ = null;

    /** @private @const {!Preconnect} */
    this.preconnect_ = new Preconnect(this.win_.document);

    // Prepare new verifier pair.
    this.redirectVerifierHelper_.prepare();

    /** @private @const {!./client-event-manager.ClientEventManager} */
    this.eventManager_ = deps.eventManager();
  }

  /**
   * @param {!PaymentOptions} options
   * @param {string} googleTransactionId
   * @param {function(!Promise<!PaymentData>)} handler
   * @return {!PaymentsAsyncClient}
   * @private
   */
  createClient_(options, googleTransactionId, handler) {
    // Assign Google Transaction ID to PaymentsAsyncClient.googleTransactionId_
    // so it can be passed to gpay_async.js and stored in payment clearcut log.
    PaymentsAsyncClient.googleTransactionId_ = googleTransactionId;
    return new PaymentsAsyncClient(
      options,
      handler,
      /* useIframe */ false,
      this.activityPorts_.getOriginalWebActivityPorts()
    );
  }

  /**
   * @param {!../utils/preconnect.Preconnect} pre
   */
  preconnect(pre) {
    pre.prefetch(payUrl());
    pre.prefetch(
      'https://payments.google.com/payments/v4/js/integrator.js?ss=md'
    );
    pre.prefetch('https://clients2.google.com/gr/gr_full_2.0.6.js');
  }

  /**
   * @return {string}
   */
  getType() {
    // TODO(alin04): remove once all references removed.
    return 'PAYJS';
  }

  /**
   * @param {!PaymentDataRequest} paymentRequest
   * @param {!PayOptionsDef=} options
   */
  start(paymentRequest, options = {}) {
    this.request_ = paymentRequest;

    if (!this.client_) {
      this.preconnect(this.preconnect_);
      this.client_ = this.createClient_(
        /** @type {!PaymentOptions} */
        ({
          environment: 'PRODUCTION',
          'i': {
            'redirectKey': this.redirectVerifierHelper_.restoreKey(),
          },
        }),
        this.analytics_.getTransactionId(),
        this.handleResponse_.bind(this)
      );
    }
    if (options.forceRedirect) {
      paymentRequest = Object.assign(paymentRequest, {
        'forceRedirect': options.forceRedirect || false,
      });
    }
    setInternalParam(
      paymentRequest,
      'disableNative',
      // The page cannot be iframed at this time. May be relaxed later
      // for AMP and similar contexts.
      this.win_ != this.top_()
    );
    let resolver = null;
    const promise = new Promise((resolve) => (resolver = resolve));
    // Notice that the callback for verifier may execute asynchronously.
    this.redirectVerifierHelper_.useVerifier((verifier) => {
      if (verifier) {
        setInternalParam(paymentRequest, 'redirectVerifier', verifier);
      }
      if (options.forceRedirect) {
        const client = this.client_;
        this.eventManager_.getReadyPromise().then(() => {
          this.analytics_.getLoggingPromise().then(() => {
            client.loadPaymentData(paymentRequest);
            resolver(true);
          });
        });
      } else {
        this.client_.loadPaymentData(paymentRequest);
        resolver(true);
      }
    });
    return promise;
  }

  /**
   * @param {function(!Promise<!PaymentData>)} callback
   */
  onResponse(callback) {
    this.responseCallback_ = callback;
    const response = this.response_;
    if (response) {
      Promise.resolve().then(() => {
        if (response) {
          callback(this.convertResponse_(response, this.request_));
        }
      });
    }
  }

  /**
   * @param {!Promise<!PaymentData>} responsePromise
   * @private
   */
  handleResponse_(responsePromise) {
    this.response_ = responsePromise;
    if (this.responseCallback_) {
      this.responseCallback_(
        this.convertResponse_(this.response_, this.request_)
      );
    }
  }

  /**
   * @param {!Promise<!PaymentData>} response
   * @param {?PaymentDataRequest} request
   * @return {!Promise<!PaymentData>}
   * @private
   */
  convertResponse_(response, request) {
    return response
      .then(
        // Temporary client side solution to remember the
        // input params. TODO: Remove this once server-side
        // input preservation is done and is part of the response.
        (res) => {
          if (request) {
            res['paymentRequest'] = request;
          }
          return res;
        }
      )
      .catch((reason) => {
        if (typeof reason == 'object' && reason['statusCode'] == 'CANCELED') {
          const error = createCancelError(this.win_);
          if (request) {
            error['productType'] = /** @type {!PaymentDataRequest} */ (request)[
              'i'
            ]['productType'];
          } else {
            error['productType'] = null;
          }
          return Promise.reject(error);
        }
        return Promise.reject(reason);
      });
  }

  /**
   * @return {!Window}
   * @private
   */
  top_() {
    // Only exists for testing since it's not possible to override `window.top`.
    return this.win_.top;
  }
}

/**
 * This helper generates key/verifier pair for the redirect mode. When the
 * redirect mode is used, the encrypted payload is returned via nivigation URL.
 * This payload need to be decrypted and to avoid session fixation attacks, a
 * verifier has to be used. This redirect verifier is not the only session
 * verifier in use: we also use GAIA. However, we have to fallback to this
 * verifier when GAIA is not available.
 *
 * @package Visible for testing only.
 */
class RedirectVerifierHelper {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {boolean} */
    this.pairCreated_ = false;

    /** @private {?RedirectVerifierPairDef} */
    this.pair_ = null;

    /** @private {?Promise<?RedirectVerifierPairDef>} */
    this.pairPromise_ = null;
  }

  /**
   * To avoid popup blockers, the key/verifier pair is created as soon as
   * possible.
   * @return {?Promise}
   */
  prepare() {
    return this.getOrCreatePair_(() => {});
  }

  /**
   * Calls the provided callback with the generated redirect verifier. This
   * API is sync/async, which is a big anti-pattern. However, it's necessary
   * to reduce the risk of popup blockers. If the verifier is already available
   * (see `prepare` method), the callback will be called immediately and thus
   * in the same event loop as the user action.
   *
   * The return verifier could be `null`. This could mean either that its
   * generation failed, or if the platform doesn't support necessary APIs, such
   * as Web Crypto. The redirect can still proceed and try to fallback on GAIA
   * as a redirect verifier. The set of platforms where GAIA is not available
   * and the redirect verifier cannot be created is negligible.
   *
   * The key corresponding to the returned verifier is stored in the session
   * storage and can be later restored using `restoreKey` method.
   *
   * @param {function(?string)} callback
   */
  useVerifier(callback) {
    this.getOrCreatePair_((pair) => {
      if (pair) {
        try {
          this.win_.localStorage.setItem(REDIRECT_STORAGE_KEY, pair.key);
        } catch (e) {
          // If storage has failed, there's no point in using the verifer.
          // However, there are other ways to recover the redirect, so it's
          // not necessarily a fatal condition.
          pair = null;
        }
      }
      callback((pair && pair.verifier) || null);
    });
  }

  /**
   * Restores the redirect key from the session storage. The key may be null.
   * @return {?string}
   */
  restoreKey() {
    try {
      return (
        (this.win_.localStorage &&
          this.win_.localStorage.getItem(REDIRECT_STORAGE_KEY)) ||
        null
      );
    } catch (e) {
      return null;
    }
  }

  /**
   * @param {function(?RedirectVerifierPairDef)} callback
   * @return {?Promise}
   * @private
   */
  getOrCreatePair_(callback) {
    this.createPair_();
    if (this.pairCreated_) {
      // Already created.
      callback(this.pair_);
    } else if (this.pairPromise_) {
      // Otherwise wait for it to be created.
      this.pairPromise_.then((pair) => callback(pair));
    }
    return this.pairPromise_;
  }

  /**
   * @private
   */
  createPair_() {
    // Either already created or already started.
    if (this.pairCreated_ || this.pairPromise_) {
      return;
    }

    // Check that the platform can fully support verification. That means
    // that it's expected to implement the following APIs:
    // a. Local storage (localStorage);
    // b. WebCrypto (crypto.subtle);
    // c. Crypto random (crypto.getRandomValues);
    // d. SHA284 (crypto.subtle.digest).
    let supportsLocalStorage;
    try {
      supportsLocalStorage = !!this.win_.localStorage;
    } catch (e) {
      // Note: This can happen when cookies are disabled.
      supportsLocalStorage = false;
    }
    const crypto = this.win_.crypto;
    if (
      supportsLocalStorage &&
      crypto &&
      crypto.getRandomValues &&
      crypto.subtle &&
      crypto.subtle.digest
    ) {
      this.pairPromise_ = new Promise((resolve, reject) => {
        // 1. Use crypto random to create a 128-bit (16 byte) redirect key.
        const keyBytes = new Uint8Array(16);
        crypto.getRandomValues(keyBytes);

        // 2. Encode key as base64.
        const key = btoa(bytesToString(keyBytes));

        // 3. Create a hash.
        crypto.subtle.digest({name: 'SHA-384'}, stringToBytes(key)).then(
          (buffer) => {
            const verifier = btoa(
              bytesToString(
                new Uint8Array(/** @type {!ArrayBuffer} */ (buffer))
              )
            );
            resolve({key, verifier});
          },
          (reason) => {
            reject(reason);
          }
        );
      })
        .catch(() => {
          // Ignore failures. A failure to create a redirect verifier is often
          // recoverable.
          return null;
        })
        .then((pair) => {
          this.pairCreated_ = true;
          this.pair_ = pair;
          return pair;
        });
    } else {
      // Not supported.
      this.pairCreated_ = true;
      this.pair_ = null;
    }
  }
}

/**
 * @param {!PaymentDataRequest} paymentRequest
 * @param {string} param
 * @param {*} value
 */
function setInternalParam(paymentRequest, param, value) {
  paymentRequest['i'] = Object.assign(paymentRequest['i'] || {}, {
    [param]: value,
  });
}

/**
 * Copyright 2019 The Subscribe with Google Authors. All Rights Reserved.
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

/**
 * Implements interface to Propensity server
 */
class PropensityServer {
  /**
   * Page configuration is known when Propensity API
   * is available, publication ID is therefore used
   * in constructor for the server interface.
   * @param {!Window} win
   * @param {!./deps.DepsDef} deps
   * @param {!./fetcher.Fetcher} fetcher
   */
  constructor(win, deps, fetcher) {
    /** @private @const {!Window} */
    this.win_ = win;
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;
    /** @private @const {string} */
    this.publicationId_ = this.deps_.pageConfig().getPublicationId();
    /** @private {?string} */
    this.clientId_ = null;
    /** @private @const {!./fetcher.Fetcher} */
    this.fetcher_ = fetcher;
    /** @private @const {number} */
    this.version_ = 1;

    this.deps_
      .eventManager()
      .registerEventListener(this.handleClientEvent_.bind(this));
  }

  /**
   * @private
   * @return {string}
   */
  getDocumentCookie_() {
    return this.win_.document.cookie;
  }

  /**
   * Returns the client ID to be used.
   * @return {?string}
   * @private
   */
  getClientId_() {
    if (!this.clientId_) {
      // Match '__gads' (name of the cookie) dropped by Ads Tag.
      const gadsmatch = this.getDocumentCookie_().match(
        '(^|;)\\s*__gads\\s*=\\s*([^;]+)'
      );
      // Since the cookie will be consumed using decodeURIComponent(),
      // use encodeURIComponent() here to match.
      this.clientId_ = gadsmatch && encodeURIComponent(gadsmatch.pop());
    }
    return this.clientId_;
  }

  /**
   * @private
   * @param {string} url
   * @return {string}
   */
  propensityUrl_(url) {
    url = addQueryParam(url, 'u_tz', '240');
    url = addQueryParam(url, 'v', String(this.version_));
    const clientId = this.getClientId_();
    if (clientId) {
      url = addQueryParam(url, 'cookie', clientId);
    }
    url = addQueryParam(url, 'cdm', this.win_.location.hostname);
    return url;
  }

  /**
   * @param {string} state
   * @param {?string} productsOrSkus
   */
  sendSubscriptionState(state, productsOrSkus) {
    const init = /** @type {!../utils/xhr.FetchInitDef} */ ({
      method: 'GET',
      credentials: 'include',
    });
    let url = adsUrl('/subopt/data');
    url = addQueryParam(url, 'states', this.publicationId_ + ':' + state);
    if (productsOrSkus) {
      url = addQueryParam(url, 'extrainfo', productsOrSkus);
    }
    return this.fetcher_.fetch(this.propensityUrl_(url), init);
  }

  /**
   * @param {string} event
   * @param {?string} context
   * @private
   */
  sendEvent_(event, context) {
    const init = /** @type {!../utils/xhr.FetchInitDef} */ ({
      method: 'GET',
      credentials: 'include',
    });
    let url = adsUrl('/subopt/data');
    url = addQueryParam(url, 'events', this.publicationId_ + ':' + event);
    if (context) {
      url = addQueryParam(url, 'extrainfo', context);
    }
    return this.fetcher_.fetch(this.propensityUrl_(url), init);
  }

  /**
   *
   * @param {!../api/client-event-manager-api.ClientEvent} event
   */
  handleClientEvent_(event) {
    /**
     * Does a live check of the config because we don't know when publisher
     * called to enable (it may be after a consent dialog).
     */
    if (
      !this.deps_.config().enablePropensity &&
      event.eventOriginator !== EventOriginator.PROPENSITY_CLIENT
    ) {
      return;
    }

    if (event.eventType === AnalyticsEvent.EVENT_SUBSCRIPTION_STATE) {
      this.sendSubscriptionState(
        event.additionalParameters['state'],
        event.additionalParameters['productsOrSkus']
      );
      return;
    }
    const propEvent = analyticsEventToPublisherEvent(event.eventType);
    if (propEvent == null) {
      return;
    }
    let additionalParameters = event.additionalParameters;
    // The EventParams object is private to SwG analytics.  Do not send.
    if (additionalParameters instanceof EventParams) {
      additionalParameters = undefined;
    }
    if (isBoolean(event.isFromUserAction)) {
      if (!isObject(additionalParameters)) {
        additionalParameters = {};
      }
      additionalParameters['is_active'] = event.isFromUserAction;
    }
    this.sendEvent_(
      propEvent,
      JSON.stringify(/** @type {?JsonObject} */ (additionalParameters))
    );
  }

  /**
   * @param {JsonObject} response
   * @return {!../api/propensity-api.PropensityScore}
   */
  parsePropensityResponse_(response) {
    let defaultScore = /** @type {!../api/propensity-api.PropensityScore} */ ({});
    if (!response['header']) {
      defaultScore = /** @type {!../api/propensity-api.PropensityScore} */ ({
        header: {ok: false},
        body: {error: 'No valid response'},
      });
      return defaultScore;
    }
    const status = response['header'];
    let scoreDetails = undefined;
    if (status['ok']) {
      const scores = response['scores'];
      scoreDetails = [];
      for (let i = 0; i < scores.length; i++) {
        const result = scores[i];
        const scoreStatus = !!result['score'];
        let scoreDetail;
        if (scoreStatus) {
          const value = /** @type {!../api/propensity-api.Score} */ ({
            value: result['score'],
            bucketed: result['score_type'] == 2,
          });
          scoreDetail = /** @type {!../api/propensity-api.Body} */ ({
            product: result['product'],
            score: value,
          });
        } else {
          scoreDetail = /** @type {!../api/propensity-api.Body} */ ({
            product: result['product'],
            error: result['error_message'],
          });
        }
        scoreDetails.push(scoreDetail);
      }
      if (scoreDetails) {
        defaultScore = /** @type {!../api/propensity-api.PropensityScore} */ ({
          header: {ok: true},
          body: {scores: scoreDetails},
        });
      }
      return defaultScore;
    }
    defaultScore = /** @type {!../api/propensity-api.PropensityScore} */ ({
      header: {ok: false},
      body: {error: response['error']},
    });
    return defaultScore;
  }
  /**
   * @param {string} referrer
   * @param {string} type
   * @return {?Promise<../api/propensity-api.PropensityScore>}
   */
  getPropensity(referrer, type) {
    const init = /** @type {!../utils/xhr.FetchInitDef} */ ({
      method: 'GET',
      credentials: 'include',
    });
    const url =
      adsUrl('/subopt/pts?products=') +
      this.publicationId_ +
      '&type=' +
      type +
      '&ref=' +
      referrer;
    return this.fetcher_
      .fetch(this.propensityUrl_(url), init)
      .then((result) => result.json())
      .then((response) => {
        return this.parsePropensityResponse_(response);
      });
  }
}

/**
 * Copyright 2019 The Subscribe with Google Authors. All Rights Reserved.
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

/**
 * @implements {PropensityApi.PropensityApi}
 */
class Propensity {
  /**
   * @param {!Window} win
   * @param {!./deps.DepsDef} deps
   * @param {!./fetcher.Fetcher} fetcher
   *
   * IMPORTANT: deps may not be full initialized config and pageConfig are
   * available immediately, other function should be gated on a ready promise.
   * #TODO(jpettitt) switch refactor to take out the win and use deps to get win
   */
  constructor(win, deps, fetcher) {
    /** @private @const {!Window} */
    this.win_ = win;
    /** @private {PropensityServer} */
    this.propensityServer_ = new PropensityServer(win, deps, fetcher);

    /** @private @const {!../api/client-event-manager-api.ClientEventManagerApi} */
    this.eventManager_ = deps.eventManager();
  }

  /** @override */
  sendSubscriptionState(state, jsonProducts) {
    if (!Object.values(SubscriptionState).includes(state)) {
      throw new Error('Invalid subscription state provided');
    }
    if (
      (SubscriptionState.SUBSCRIBER == state ||
        SubscriptionState.PAST_SUBSCRIBER == state) &&
      !jsonProducts
    ) {
      throw new Error(
        'Entitlements must be provided for users with' +
          ' active or expired subscriptions'
      );
    }
    if (jsonProducts && !isObject(jsonProducts)) {
      throw new Error('Entitlements must be an Object');
    }
    let productsOrSkus = null;
    if (jsonProducts) {
      productsOrSkus = JSON.stringify(jsonProducts);
    }
    this.propensityServer_.sendSubscriptionState(state, productsOrSkus);
  }

  /** @override */
  getPropensity(type) {
    if (type && !Object.values(PropensityType).includes(type)) {
      throw new Error('Invalid propensity type requested');
    }
    if (!type) {
      type = PropensityType.GENERAL;
    }
    return this.propensityServer_.getPropensity(
      this.win_.document.referrer,
      type
    );
  }

  /** @override */
  sendEvent(userEvent) {
    const analyticsEvent = publisherEventToAnalyticsEvent(userEvent.name);
    let data = null;
    if (!isEnumValue(Event, userEvent.name) || !analyticsEvent) {
      throw new Error('Invalid user event provided(' + userEvent.name + ')');
    }

    if (userEvent.data) {
      if (!isObject(userEvent.data)) {
        throw new Error('Event data must be an Object(' + userEvent.data + ')');
      } else {
        data = {};
        Object.assign(data, userEvent.data);
      }
    }

    if (isBoolean(userEvent.active)) {
      if (!data) {
        data = {};
      }
      Object.assign(data, {'is_active': userEvent.active});
    } else if (userEvent.active != null) {
      throw new Error('Event active must be a boolean');
    }

    this.eventManager_.logEvent({
      eventType: analyticsEvent,
      eventOriginator: EventOriginator.PROPENSITY_CLIENT,
      isFromUserAction: userEvent.active,
      additionalParameters: data,
    });
  }
}

const CSS$1 = ".swg-dialog,.swg-toast{box-sizing:border-box;background-color:#fff!important}.swg-toast{position:fixed!important;bottom:0!important;max-height:46px!important;z-index:2147483647!important;border:none!important}@media (max-height:640px), (max-width:640px){.swg-dialog,.swg-toast{width:480px!important;left:-240px!important;margin-left:50vw!important;border-top-left-radius:8px!important;border-top-right-radius:8px!important;box-shadow:0 1px 1px rgba(60,64,67,.3),0 1px 4px 1px rgba(60,64,67,.15)!important}}@media (min-width:640px) and (min-height:640px){.swg-dialog{width:630px!important;left:-315px!important;margin-left:50vw!important;background-color:transparent!important;border:none!important}.swg-toast{left:0!important}}@media (max-width:480px){.swg-dialog,.swg-toast{width:100%!important;left:0!important;right:0!important;margin-left:0!important}}\n/*# sourceURL=/./src/components/dialog.css*/";

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

const PREFIX = 'subscribe.google.com';

class Storage {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!Object<string, !Promise<?string>>} */
    this.values_ = {};
  }

  /**
   * @param {string} key
   * @return {!Promise<?string>}
   */
  get(key) {
    if (!this.values_[key]) {
      this.values_[key] = new Promise((resolve) => {
        if (this.win_.sessionStorage) {
          try {
            resolve(this.win_.sessionStorage.getItem(storageKey(key)));
          } catch (e) {
            // Ignore error.
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    }
    return this.values_[key];
  }

  /**
   * @param {string} key
   * @param {string} value
   * @return {!Promise}
   */
  set(key, value) {
    this.values_[key] = Promise.resolve(value);
    return new Promise((resolve) => {
      if (this.win_.sessionStorage) {
        try {
          this.win_.sessionStorage.setItem(storageKey(key), value);
        } catch (e) {
          // Ignore error.
        }
      }
      resolve();
    });
  }

  /**
   * @param {string} key
   * @return {!Promise}
   */
  remove(key) {
    delete this.values_[key];
    return new Promise((resolve) => {
      if (this.win_.sessionStorage) {
        try {
          this.win_.sessionStorage.removeItem(storageKey(key));
        } catch (e) {
          // Ignore error.
        }
      }
      resolve();
    });
  }
}

/**
 * @param {string} key
 * @return {string}
 */
function storageKey(key) {
  return PREFIX + ':' + key;
}

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

const NO_PROMISE_ERR = 'No account promise provided';

class WaitForSubscriptionLookupApi {
  /**
   * @param {!./deps.DepsDef} deps
   * @param {?Promise} accountPromise
   */
  constructor(deps, accountPromise) {
    /** @private @const {!./deps.DepsDef} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {?Promise} */
    this.openViewPromise_ = null;

    /** @private {!Promise} */
    this.accountPromise_ = accountPromise || Promise.reject(NO_PROMISE_ERR);

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/waitforsubscriptionlookupiframe'),
      feArgs({
        publicationId: deps.pageConfig().getPublicationId(),
        productId: deps.pageConfig().getProductId(),
      }),
      /* shouldFadeBody */ true,
      /* hasLoadingIndicator */ true
    );
  }

  /**
   * Starts the Login Flow.
   * @return {!Promise}
   */
  start() {
    this.openViewPromise_ = this.dialogManager_.openView(
      this.activityIframeView_
    );

    return this.accountPromise_.then(
      (account) => {
        // Account was found.
        this.dialogManager_.completeView(this.activityIframeView_);
        return account;
      },
      (reason) => {
        this.dialogManager_.completeView(this.activityIframeView_);
        throw reason;
      }
    );
  }
}

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

/**
 * @implements {DepsDef}
 * @implements {Subscriptions}
 */
class ConfiguredRuntime {
  /**
   * @param {!Window|!Document|!Doc} winOrDoc
   * @param {!../model/page-config.PageConfig} pageConfig
   * @param {{
   *     fetcher: (!Fetcher|undefined),
   *     configPromise: (!Promise|undefined),
   *   }=} integr
   * @param {!../api/subscriptions.Config=} config
   */
  constructor(winOrDoc, pageConfig, integr, config) {
    integr = integr || {};
    integr.configPromise = integr.configPromise || Promise.resolve();

    /** @private @const {!ClientEventManager} */
    this.eventManager_ = new ClientEventManager(integr.configPromise);

    /** @private @const {!Doc} */
    this.doc_ = resolveDoc(winOrDoc);

    /** @private @const {!Window} */
    this.win_ = this.doc_.getWin();

    /** @private @const {!../api/subscriptions.Config} */
    this.config_ = defaultConfig();

    if (isLegacyEdgeBrowser(this.win_)) {
      // TODO(dvoytenko, b/120607343): Find a way to remove this restriction
      // or move it to Web Activities.
      this.config_.windowOpenMode = WindowOpenMode.REDIRECT;
    }
    if (config) {
      this.configure_(config);
    }

    /** @private @const {!../model/page-config.PageConfig} */
    this.pageConfig_ = pageConfig;

    /** @private @const {!Promise} */
    this.documentParsed_ = this.doc_.whenReady();

    /** @private @const {!JsError} */
    this.jserror_ = new JsError(this.doc_);

    /** @private @const {!Fetcher} */
    this.fetcher_ = integr.fetcher || new XhrFetcher(this.win_);

    /** @private @const {!Storage} */
    this.storage_ = new Storage(this.win_);

    /** @private @const {!DialogManager} */
    this.dialogManager_ = new DialogManager(this.doc_);

    /** @private @const {!Callbacks} */
    this.callbacks_ = new Callbacks();

    // WARNING: DepsDef ('this') is being progressively defined below.
    // Constructors will crash if they rely on something that doesn't exist yet.
    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = new ActivityPorts$1(this);

    /** @private @const {!AnalyticsService} */
    this.analyticsService_ = new AnalyticsService(this, this.fetcher_);
    this.analyticsService_.start();

    /** @private @const {!PayClient} */
    this.payClient_ = new PayClient(this);

    /** @private @const {!Logger} */
    this.logger_ = new Logger(this);

    /** @private @const {!EntitlementsManager} */
    this.entitlementsManager_ = new EntitlementsManager(
      this.win_,
      this.pageConfig_,
      this.fetcher_,
      this // See note about 'this' above
    );

    /** @private @const {!Propensity} */
    this.propensityModule_ = new Propensity(
      this.win_,
      this, // See note about 'this' above
      this.fetcher_
    );

    // ALL CLEAR: DepsDef definition now complete.
    this.eventManager_.logSwgEvent(AnalyticsEvent.IMPRESSION_PAGE_LOAD, false);

    /** @private @const {!OffersApi} */
    this.offersApi_ = new OffersApi(this.pageConfig_, this.fetcher_);

    /** @private @const {!ButtonApi} */
    this.buttonApi_ = new ButtonApi(this.doc_, Promise.resolve(this));

    const preconnect = new Preconnect(this.win_.document);

    preconnect.prefetch('https://news.google.com/swg/js/v1/loader.svg');
    preconnect.preconnect('https://www.gstatic.com/');
    preconnect.preconnect('https://fonts.googleapis.com/');
    preconnect.preconnect('https://www.google.com/');
    LinkCompleteFlow.configurePending(this);
    PayCompleteFlow.configurePending(this);

    injectStyleSheet(this.doc_, CSS$1);

    // Report redirect errors if any.
    this.activityPorts_.onRedirectError((error) => {
      this.analyticsService_.addLabels(['redirect']);
      this.eventManager_.logSwgEvent(
        AnalyticsEvent.EVENT_PAYMENT_FAILED,
        false
      );
      this.jserror_.error('Redirect error', error);
    });
  }

  /** @override */
  doc() {
    return this.doc_;
  }

  /** @override */
  win() {
    return this.win_;
  }

  /** @override */
  pageConfig() {
    return this.pageConfig_;
  }

  /** @override */
  jserror() {
    return this.jserror_;
  }

  /** @override */
  activities() {
    return this.activityPorts_;
  }

  /** @override */
  payClient() {
    return this.payClient_;
  }

  /** @override */
  dialogManager() {
    return this.dialogManager_;
  }

  /** @override */
  entitlementsManager() {
    return this.entitlementsManager_;
  }

  /** @override */
  callbacks() {
    return this.callbacks_;
  }

  /** @override */
  storage() {
    return this.storage_;
  }

  /** @override */
  analytics() {
    return this.analyticsService_;
  }

  /** @override */
  init() {
    // Implemented by the `Runtime` class.
  }

  /** @override */
  configure(config) {
    // Indirected for constructor testing.
    this.configure_(config);
  }

  /**
   * @param {!../api/subscriptions.Config} config
   * @private
   */
  configure_(config) {
    // Validate first.
    let error = '';
    for (const k in config) {
      const v = config[k];
      switch (k) {
        case 'windowOpenMode':
          if (v != WindowOpenMode.AUTO && v != WindowOpenMode.REDIRECT) {
            error = 'Unknown windowOpenMode: ' + v;
          }
          break;
        case 'experiments':
          v.forEach((experiment) => setExperiment(this.win_, experiment, true));
          if (this.analytics()) {
            // If analytics service isn't set up yet, then it will get the
            // experiments later.
            this.analytics().addLabels(v);
          }
          break;
        case 'analyticsMode':
          if (v != AnalyticsMode.DEFAULT && v != AnalyticsMode.IMPRESSIONS) {
            error = 'Unknown analytics mode: ' + v;
          }
          break;
        case 'enableSwgAnalytics':
          if (!isBoolean(v)) {
            error = 'Unknown enableSwgAnalytics value: ' + v;
          }
          break;
        case 'enablePropensity':
          if (!isBoolean(v)) {
            error = 'Unknown enablePropensity value: ' + v;
          }
          break;
        default:
          error = 'Unknown config property: ' + k;
      }
    }
    // Throw error string if it's not null
    log_2(!error, error || undefined);
    // Assign.
    Object.assign(this.config_, config);
  }

  /** @override */
  config() {
    return this.config_;
  }

  /** @override */
  reset() {
    this.entitlementsManager_.reset();
    this.dialogManager_.completeAll();
  }

  /** @override */
  clear() {
    this.entitlementsManager_.clear();
    this.dialogManager_.completeAll();
  }

  /** @override */
  start() {
    // No need to run entitlements without a product or for an unlocked page.
    if (!this.pageConfig_.getProductId() || !this.pageConfig_.isLocked()) {
      return Promise.resolve();
    }
    this.getEntitlements();
  }

  /** @override */
  getEntitlements(params) {
    return this.entitlementsManager_
      .getEntitlements(params)
      .then((entitlements) => {
        // Auto update internal things tracking the user's current SKU.
        if (entitlements) {
          try {
            const skus = entitlements.entitlements.map(
              (entitlement) =>
                entitlement.getSku() || 'unknown subscriptionToken'
            );
            if (skus.length > 0) {
              this.analyticsService_.setSku(skus.join(','));
            }
          } catch (ex) {}
        }
        return entitlements.clone();
      });
  }

  /** @override */
  setOnEntitlementsResponse(callback) {
    this.callbacks_.setOnEntitlementsResponse(callback);
  }

  /** @override */
  getOffers(options) {
    return this.offersApi_.getOffers(options && options.productId);
  }

  /** @override */
  showOffers(options) {
    return this.documentParsed_.then(() => {
      const errorMessage =
        'The showOffers() method cannot be used to update a subscription. ' +
        'Use the showUpdateOffers() method instead.';
      log_2(options ? !options['oldSku'] : true, errorMessage);
      const flow = new OffersFlow(this, options);
      return flow.start();
    });
  }

  /** @override */
  showUpdateOffers(options) {
    log_2(
      isExperimentOn(this.win_, ExperimentFlags.REPLACE_SUBSCRIPTION),
      'Not yet launched!'
    );
    return this.documentParsed_.then(() => {
      const errorMessage =
        'The showUpdateOffers() method cannot be used for new subscribers. ' +
        'Use the showOffers() method instead.';
      log_2(options ? !!options['oldSku'] : false, errorMessage);
      const flow = new OffersFlow(this, options);
      return flow.start();
    });
  }

  /** @override */
  showSubscribeOption(options) {
    return this.documentParsed_.then(() => {
      const flow = new SubscribeOptionFlow(this, options);
      return flow.start();
    });
  }

  /** @override */
  showAbbrvOffer(options) {
    return this.documentParsed_.then(() => {
      const flow = new AbbrvOfferFlow(this, options);
      return flow.start();
    });
  }

  /** @override */
  showContributionOptions(options) {
    return this.documentParsed_.then(() => {
      const flow = new ContributionsFlow(this, options);
      return flow.start();
    });
  }

  /** @override */
  waitForSubscriptionLookup(accountPromise) {
    return this.documentParsed_.then(() => {
      const wait = new WaitForSubscriptionLookupApi(this, accountPromise);
      return wait.start();
    });
  }

  /** @override */
  showMeterRegwall(meterRegwallArgs) {
    return this.documentParsed_.then(() => {
      const wait = new MeterRegwallApi(this, meterRegwallArgs);
      return wait.start();
    });
  }

  /** @override */
  setOnLoginRequest(callback) {
    this.callbacks_.setOnLoginRequest(callback);
  }

  /** @override */
  triggerLoginRequest(request) {
    this.callbacks_.triggerLoginRequest(request);
  }

  /** @override */
  setOnLinkComplete(callback) {
    this.callbacks_.setOnLinkComplete(callback);
  }

  /** @override */
  linkAccount(params = {}) {
    return this.documentParsed_.then(() => {
      return new LinkbackFlow(this).start(params);
    });
  }

  /** @override */
  saveSubscription(saveSubscriptionRequestCallback) {
    return this.documentParsed_.then(() => {
      return new LinkSaveFlow(this, saveSubscriptionRequestCallback).start();
    });
  }

  /** @override */
  showLoginPrompt() {
    return this.documentParsed_.then(() => {
      return new LoginPromptApi(this).start();
    });
  }

  /** @override */
  showLoginNotification() {
    return this.documentParsed_.then(() => {
      return new LoginNotificationApi(this).start();
    });
  }

  /** @override */
  setOnNativeSubscribeRequest(callback) {
    this.callbacks_.setOnSubscribeRequest(callback);
  }

  /** @override */
  setOnSubscribeResponse(callback) {
    this.callbacks_.setOnSubscribeResponse(callback);
  }

  /** @override */
  setOnPaymentResponse(callback) {
    this.callbacks_.setOnPaymentResponse(callback);
  }

  /** @override */
  subscribe(sku) {
    const errorMessage =
      'The subscribe() method can only take a sku as its parameter; ' +
      'for subscription updates please use the updateSubscription() method';
    log_2(typeof sku === 'string', errorMessage);
    return this.documentParsed_.then(() => {
      return new PayStartFlow(this, {'skuId': sku}).start();
    });
  }

  /** @override */
  updateSubscription(subscriptionRequest) {
    log_2(
      isExperimentOn(this.win_, ExperimentFlags.REPLACE_SUBSCRIPTION),
      'Not yet launched!'
    );
    const errorMessage =
      'The updateSubscription() method should be used for subscription ' +
      'updates; for new subscriptions please use the subscribe() method';
    log_2(
      subscriptionRequest ? subscriptionRequest['oldSku'] : false,
      errorMessage
    );
    return this.documentParsed_.then(() => {
      return new PayStartFlow(this, subscriptionRequest).start();
    });
  }

  /** @override */
  setOnContributionResponse(callback) {
    this.callbacks_.setOnContributionResponse(callback);
  }

  /** @override */
  contribute(skuOrSubscriptionRequest) {
    /** @type {!../api/subscriptions.SubscriptionRequest} */
    const request =
      typeof skuOrSubscriptionRequest == 'string'
        ? {'skuId': skuOrSubscriptionRequest}
        : skuOrSubscriptionRequest;
    return this.documentParsed_.then(() => {
      return new PayStartFlow(
        this,
        request,
        ProductType.UI_CONTRIBUTION
      ).start();
    });
  }

  /** @override */
  completeDeferredAccountCreation(options) {
    return this.documentParsed_.then(() => {
      return new DeferredAccountFlow(this, options || null).start();
    });
  }

  /** @override */
  setOnFlowStarted(callback) {
    this.callbacks_.setOnFlowStarted(callback);
  }

  /** @override */
  setOnFlowCanceled(callback) {
    this.callbacks_.setOnFlowCanceled(callback);
  }

  /** @override */
  createButton(optionsOrCallback, callback) {
    // This is a minor duplication to allow this code to be sync.
    return this.buttonApi_.create(optionsOrCallback, callback);
  }

  /** @override */
  attachButton(button, optionsOrCallback, callback) {
    // This is a minor duplication to allow this code to be sync.
    this.buttonApi_.attach(button, optionsOrCallback, callback);
  }

  /** @override */
  attachSmartButton(button, optionsOrCallback, callback) {
    log_2(
      isExperimentOn(this.win_, ExperimentFlags.SMARTBOX),
      'Not yet launched!'
    );
    this.buttonApi_.attachSmartButton(
      this,
      button,
      optionsOrCallback,
      callback
    );
  }

  /** @override */
  getPropensityModule() {
    return Promise.resolve(this.propensityModule_);
  }

  /**
   * This one exists as an internal helper so SwG logging doesn't require a promise.
   * @return {!ClientEventManager}
   */
  eventManager() {
    return this.eventManager_;
  }

  /**
   * This one exists as a public API so publishers can subscribe to SwG events.
   * @override */
  getEventManager() {
    return Promise.resolve(this.eventManager_);
  }

  /** @override */
  getLogger() {
    return Promise.resolve(this.logger_);
  }

  /** @override */
  setShowcaseEntitlement(unusedEntitlement) {
    // TODO
  }
}

export { AnalyticsEvent, ClientEvent, ClientEventManagerApi, ConfiguredRuntime, DeferredAccountCreationResponse, Entitlement, Entitlements, EventOriginator, Fetcher, FilterResult, PurchaseData, SubscribeResponse$1 as SubscribeResponse, UserData };
