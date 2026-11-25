import {CONSENT_POLICY_STATE} from '#core/constants/consent-state';
import {Deferred} from '#core/data-structures/promise';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';

import {user} from '#utils/log';

import {
  getConsentMetadata,
  getConsentPolicyInfo,
  getConsentPolicySharedData,
  getConsentPolicyState,
} from 'src/consent';

import {Core} from './core';
import {DoubleClickHelper} from './doubleclick-helper';
import {ExtensionCommunication} from './extension';
import {CryptoUtils} from './utilities';
import {VisibilityTracker} from './visibility-tracking';
import {Waterfall} from './waterfall';

import {AmpA4A, hasStorageConsent} from '../../amp-a4a/0.1/amp-a4a';

/** @type {string} */
const TAG = 'amp-ad-network-insurads-impl';

export class AmpAdNetworkInsuradsImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    this.element.setAttribute('data-enable-refresh', 'false');

    /** @private {number} */
    this.unitId_ = 0;

    /** @private {?Object} */
    this.adResponseData_ = null;
    /** @private {?Array<!Array<number>>} */
    this.sizes_ = null;

    /** @private {number} */
    this.parentMawId_ = 0;

    /** @private {string} */
    this.unitCode_ = CryptoUtils.generateCode();
    /** @private {string} */
    this.path_ = this.element.getAttribute('data-slot');
    /** @private {!Object<string, *>} */
    this.requiredKeyValues_ = {};
    /** @private {?Object} */
    this.originalRtcConfig_ = tryParseJson(
      this.element.getAttribute('rtc-config')
    );

    /** @private {boolean} */
    this.isViewable_ = false;

    /** @private {?Object} */
    this.iabTaxonomy_ = {};

    /** @private {boolean} */
    this.appEnabled_ = false;
    /** @private @const {!Deferred} */
    this.appReadyDeferred_ = new Deferred();

    /** @private {?ExtensionCommunication} */
    this.extension_ = null;
    /** @private @const {!Deferred} */
    this.extensionReadyDeferred_ = new Deferred();

    /** @private {?Waterfall} */
    this.waterfall_ = null;

    /** @public {?DoubleClickHelper} */
    this.dCHelper = new DoubleClickHelper(this);
    this.dCHelper.callMethod('constructor', element);

    const publicId = this.element.getAttribute('data-public-id');
    const {canonicalUrl} = Services.documentInfoForDoc(this.element);

    this.getConsent_().then((consent) => {
      this.initializeWithConsent_(consent, canonicalUrl, publicId);
    });
  }

  /** @override */
  buildCallback() {
    this.dCHelper.callMethod('buildCallback');
  }

  /** @override */
  onCreativeRender(creativeMetaData, opt_onLoadPromise) {
    this.isRefreshing = false;
    this.dCHelper.callMethod(
      'onCreativeRender',
      creativeMetaData,
      opt_onLoadPromise
    );
  }

  /** @override */
  refresh(refreshEndCallback) {
    if (this.isRefreshing) {
      return;
    }
    this.refreshCount_++;

    return super.refresh(refreshEndCallback);
  }

  /** @override */
  extractSize(responseHeaders) {
    this.adResponseData_ = {
      lineItemId: responseHeaders.get('google-lineitem-id') || '-1',
      creativeId: responseHeaders.get('google-creative-id') || '-1',
      servedSize: responseHeaders.get('google-size') || '',
    };

    this.appReadyDeferred_.promise.then(() => {
      this.sendUnitInit_();
    });

    this.extensionReadyDeferred_.promise.then(() => {
      if (this.extension_) {
        const entry = this.waterfall_
          ? this.waterfall_.getCurrentEntry()
          : null;

        this.extension_.bannerChanged({
          unitId: this.getUnitId_(),
          shortId: this.unitId_,
          impressionId: CryptoUtils.generateImpressionId(),
          provider: entry ? entry.provider : '',
          width: this.adResponseData_.servedSize.width,
          height: this.adResponseData_.servedSize.height,
        });
      }
    });

    return this.dCHelper.callMethod('extractSize', responseHeaders);
  }

  /** @override */
  getAdUrl(opt_consentTuple, opt_rtcResponsesPromise, opt_serveNpaSignal) {
    this.getAdUrlDeferred = new Deferred();
    this.getAdUrlInsurAdsDeferred = new Deferred();
    const self = this;
    this.dCHelper.callMethod(
      'getAdUrl',
      opt_consentTuple,
      opt_rtcResponsesPromise,
      opt_serveNpaSignal
    );
    this.getAdUrlDeferred.promise.then((doubleClickUrl) => {
      const augmentedAdUrl = this.augmentAdUrl_(doubleClickUrl);
      self.getAdUrlInsurAdsDeferred.resolve(augmentedAdUrl);
    });
    return this.getAdUrlInsurAdsDeferred.promise;
  }

  /** @override */
  tearDownSlot() {
    this.dCHelper.callMethod('tearDownSlot');
  }

  /** @override */
  forceCollapse() {
    if (this.refreshCount_ === 0) {
      super.forceCollapse();
      this.destroy_();
    } else {
      this.triggerImmediateRefresh_();
    }
  }

  /**
   * Initializes the InsurAds instance with consent data.
   * @param {string=} consent - The consent data string
   * @param {string} canonicalUrl - The canonical URL of the document
   * @param {string} publicId - The public ID for the ad
   * @private
   */
  initializeWithConsent_(consent, canonicalUrl, publicId) {
    const consentTuple = consent ? this.parseConsent_(consent) : null;
    const storageConsent = hasStorageConsent(consentTuple);

    this.core_ = Core.start(this.win, canonicalUrl, publicId, storageConsent);
    this.core_.registerUnit(this.unitCode_, this.handleReconnect_.bind(this), {
      appInitHandler: (message) => this.handleAppInit_(message),
      unitInitHandler: (message) => this.handleUnitInit_(message),
      waterfallHandler: (message) => this.handleWaterfall_(message),
    });
  }

  /**
   * Appends InsurAds URL parameters for ad requests.
   * @param {string} adUrl
   * @return {string} The augmented URL with InsurAds parameters
   * @private
   */
  augmentAdUrl_(adUrl) {
    if (
      !this.appEnabled_ ||
      !this.waterfall_ ||
      this.api_.getRefreshCount() === 0
    ) {
      // If app is not enabled or no waterfall, return the original ad URL
      console /*OK*/
        .log(
          'InsurAds: App not enabled or no waterfall, returning original ad URL'
        );
      const url = new URL(adUrl); // TODO: return adUrl original
      const params = url.searchParams;
      params.set('iat', 'not-enabled');
      return url.toString();
    }

    const url = new URL(adUrl);
    const params = url.searchParams;
    const entry = this.waterfall_.getCurrentEntry();

    if (entry.path) {
      params.set('iu', entry.path);
    }

    this.mergeKeyValuesWithParams_(params, entry);
    this.addUserSignalsToParams_(params, entry);
    this.parseSizesFromParams_(params);

    return url.toString();
  }

  /**
   * Merges entry key values with existing URL parameters
   * @param {!URLSearchParams} params - The URL parameters
   * @param {!Object} entry - The waterfall entry
   * @private
   */
  mergeKeyValuesWithParams_(params, entry) {
    if (!params || !entry) {
      return;
    }
    const existingKeyValues = params.get('scp');
    const allKeyValues = [];

    if (entry.keyValues) {
      allKeyValues.push(...entry.keyValues);
    }
    if (entry.commonKeyValues) {
      allKeyValues.push(...entry.commonKeyValues);
    }

    if (allKeyValues.length === 0) {
      return;
    }

    const serializedKeyValues = this.serializeKeyValueArray_(allKeyValues);
    const mergedKeyValues = existingKeyValues
      ? `${existingKeyValues}&${serializedKeyValues}`
      : serializedKeyValues;

    params.set('scp', mergedKeyValues);
  }

  /**
   * Adds IAB taxonomy user signals to URL parameters if conditions are met
   * @param {!URLSearchParams} params - The URL parameters to modify
   * @param {!Object} entry - The waterfall entry
   * @private
   */
  addUserSignalsToParams_(params, entry) {
    if (!params || !entry) {
      return;
    }

    if (!this.iabTaxonomy_ || !entry.isHouseDemand) {
      return;
    }

    try {
      const userSignals = this.convertToUserSignals_(this.iabTaxonomy_);
      const encodedSignals = this.encodeUserSignals_(userSignals);
      params.set('ppsj', encodedSignals);
    } catch (error) {
      console /*Ok*/
        .error('Failed to encode user signals:', error);
    }
  }

  /**
   * Encodes user signals for URL transmission
   * @param {!Object} userSignals - The user signals object
   * @return {string} Base64 encoded and URI encoded signals
   * @private
   */
  encodeUserSignals_(userSignals) {
    const jsonString = JSON.stringify(userSignals);
    const base64Encoded = btoa(jsonString);
    return encodeURIComponent(base64Encoded);
  }

  /**
   * Parses and stores ad sizes from URL parameters
   * @param {!URLSearchParams} params - The URL parameters
   * @private
   */
  parseSizesFromParams_(params) {
    const sizesString = params.get('sz');

    if (!sizesString) {
      this.sizes_ = [];
      return;
    }

    try {
      this.sizes_ = this.parseSizeString_(sizesString);
    } catch (error) {
      this.sizes_ = [];
    }
  }

  /**
   * refreshEndCallback
   * @private
   */
  refreshEndCallback_() {
    console /*OK*/
      .log('Refresh End Callback');
  }

  /**
   * Triggers an immediate refresh of the ad.
   * This can be called when receiving realtime messages that require a refresh
   * or an Extension Refresh message.
   * @return {boolean}
   * @private
   */
  triggerImmediateRefresh_() {
    if (!this.appEnabled_) {
      this.destroy_();
      return false;
    }

    if (this.isRefreshing) {
      return false;
    }

    if (!this.iframe) {
      return false;
    }

    const nextEntry = this.waterfall_.getNextEntry();

    if (!nextEntry) {
      return false;
    }

    this.updateRtcConfig_(nextEntry);

    this.refresh(this.refreshEndCallback_);
  }

  /**
   * Handles reconnection to InsurAds
   * This is called when the WebSocket connection is lost and needs to be re-established.
   * @private
   * */
  handleReconnect_() {
    this.sendUnitInit_(true);
  }

  /**
   * Handles app initialization messages
   * @param {!Object} message - The app initialization message
   * @private
   */
  handleAppInit_(message) {
    if (message.status !== undefined) {
      this.appEnabled_ = message.status > 0 ? true : false;

      if (!this.appEnabled_) {
        this.destroy_();
        return;
      }

      if (!this.appReadyDeferred_.isDone()) {
        this.appReadyDeferred_.resolve();
      }

      this.populateRequiredKeysAndValues_(message.requiredKeys);
    }

    if (message.iabTaxonomy !== undefined) {
      this.iabTaxonomy_ = message.iabTaxonomy;
    }

    if (!this.visibilityTracker) {
      this.visibilityTracker = new VisibilityTracker(
        this.win,
        this.element,
        this.onVisibilityChange_.bind(this)
      );
    }
  }

  /**
   * Handles unit initialization messages
   * @param {!Object} message - The unit initialization message
   * @private
   */
  handleUnitInit_(message) {
    this.unitId_ = message.unitId;
    this.element.setAttribute('tg-zone', this.getUnitId_());

    if (window.frames['TG-listener'] && !this.extension_) {
      this.extension_ = ExtensionCommunication.start(
        this.getUnitId_(),
        this.handlerExtensionMessages_.bind(this)
      );
    }

    const {height, width} = this.creativeSize_ || this.initialSize_;

    if (!this.extensionReadyDeferred_.isDone()) {
      if (this.extension_) {
        this.extension_.unitCreated({
          unitId: this.getUnitId_(),
          shortId: message.unitId,
          sizes: this.sizes_,
          rotation: message.rotation ? message.rotation : false,
          visible: this.isViewable_,
          width,
          height,
        });
      }

      this.extensionReadyDeferred_.resolve();
    }
  }

  /**
   * Handles unit waterfall messages
   * @param {!Object} message - The app initialization message
   * @private
   */
  handleWaterfall_(message) {
    if (message.unitCode !== this.unitCode_) {
      return;
    }

    this.waterfall_ = Waterfall.fromWaterfallMessage(message);
    this.triggerImmediateRefresh_();
  }

  /**
   * Handle incoming messages from the extension
   * @param {MessageEvent} msg - The message event
   * @private
   */
  handlerExtensionMessages_(msg) {
    if (msg.data.unitId !== this.getUnitId_()) {
      return;
    }

    switch (msg.data.action) {
      case 'changeBanner':
        this.sendUnitInit_(false, true);
        break;
    }
  }

  /**
   * Handles visibility changes
   * @param {!Object} visibilityData - Visibility data object
   * @private
   */
  onVisibilityChange_(visibilityData) {
    if (this.isViewable_ !== visibilityData.isViewable && this.appEnabled_) {
      this.core_.sendUnitSnapshot(this.unitCode_, visibilityData.isViewable);
    }
    this.isViewable_ = visibilityData.isViewable;
  }

  /**
   * Sends the unit initialization message
   * @param {boolean=} reconnect - Whether this is a reconnect
   * @param {boolean=} passback - Whether this is a passback
   * @private
   */
  sendUnitInit_(reconnect = false, passback = false) {
    if (this.appEnabled_) {
      const entry = this.waterfall_ ? this.waterfall_.getCurrentEntry() : null;
      const unitInit = {
        unitCode: this.unitCode_,
        keyValues: this.requiredKeyValues_,
        path: entry ? entry.path : this.path_,
        lineItemId: this.adResponseData_.lineItemId,
        creativeId: this.adResponseData_.creativeId,
        servedSize: this.adResponseData_.servedSize,
        isHouseDemand: entry ? entry.isHouseDemand : false,
        position: entry ? entry.position : undefined,
        parentMawId: this.parentMawId_,
        sizes: this.sizes_,
      };

      this.core_.sendUnitInit(unitInit, reconnect, passback);
    }
  }

  /**
   * Return the Full Unit Id with the slot index
   * @return {string}
   * @private
   */
  getUnitId_() {
    const unitId =
      this.unitId_ + '.' + this.element.getAttribute('data-amp-slot-index');
    return unitId;
  }

  /**
   * Destroy implementation
   * This is called when the ad is removed from the DOM or refreshed
   * @private
   */
  destroy_() {
    if (this.visibilityTracker) {
      this.visibilityTracker.destroy();
      this.visibilityTracker = null;
    }

    if (this.extension_) {
      this.extension_.unitRemoved(this.getUnitId_());
      this.extension_ = null;
    }
  }

  /**
   * Serializes an array of [key, value] pairs into a query string.
   * @param {!Array<!Array<string, (!Array<string>|string)>>} pairs
   * @return {string}
   * @private
   */
  serializeKeyValueArray_(pairs) {
    return pairs
      .map(([key, value]) => this.serializeItem_(key, value))
      .join('&');
  }

  /**
   * @param {string} key
   * @param {(!Array<string>|string)} value
   * @return {string}
   * @private
   */
  serializeItem_(key, value) {
    const serializedValue = (Array.isArray(value) ? value : [value])
      .map(encodeURIComponent)
      .join();
    return `${encodeURIComponent(key)}=${serializedValue}`;
  }

  /**
   * Convert the IabTaxonomy to Google required format
   * @param {object} data - IabTaxonomy data.
   * @return {object} - Formatted signals
   * @private
   */
  convertToUserSignals_(data) {
    const taxonomyMap = {
      content: 'IAB_CONTENT',
      audience: 'IAB_AUDIENCE',
    };

    const PublisherProvidedTaxonomySignals = [];

    for (const [type, taxonomies] of Object.entries(data)) {
      const prefix = taxonomyMap[type];
      if (!prefix) {
        continue;
      }

      for (const [version, items] of Object.entries(taxonomies)) {
        const values = items
          .map((item) => item.id)
          .filter((id) => id !== undefined);

        if (values.length > 0) {
          PublisherProvidedTaxonomySignals.push({
            taxonomy: `${prefix}_${version.replace(/\./g, '_')}`,
            values,
          });
        }
      }
    }

    return {PublisherProvidedTaxonomySignals};
  }

  /**
   * Updates the rtc-config attribute based on the next entry / original rtc config.
   * @param {!Object} entry
   * @private
   */
  updateRtcConfig_(entry) {
    let rtcConfigStr = null;

    if (
      entry.isHouseDemand &&
      entry.vendors &&
      Object.keys(entry.vendors).length > 0
    ) {
      rtcConfigStr = JSON.stringify({
        vendors: entry.vendors,
        timeoutMillis: 750,
      });
    } else if (
      this.originalRtcConfig_ &&
      Object.keys(this.originalRtcConfig_).length > 0
    ) {
      rtcConfigStr = JSON.stringify(this.originalRtcConfig_);
    }

    if (rtcConfigStr) {
      const currentRtcConfig = this.element.getAttribute('rtc-config');
      if (currentRtcConfig !== rtcConfigStr) {
        this.element.setAttribute('rtc-config', rtcConfigStr);
      }
    } else {
      this.element.removeAttribute('rtc-config');
    }
  }

  /**
   * Populates requiredKeys_ and requiredKeyValues_ from requiredKeys and element targeting.
   * @param {!Array<string>} requiredKeys
   * @private
   */
  populateRequiredKeysAndValues_(requiredKeys) {
    if (!Array.isArray(requiredKeys) || requiredKeys.length === 0) {
      return;
    }

    const jsonTargeting = tryParseJson(this.element.getAttribute('json')) || {};
    const {targeting} = jsonTargeting;
    requiredKeys.forEach((key) => {
      if (targeting && targeting[key]) {
        this.requiredKeyValues_[key] = targeting[key];
      }
    });
  }

  /**
   * Get Consent
   * @return {!Promise<Array<Promise>>} - Resolves with consent state, string, metadata, and shared data, or undefined if no policy ID
   * @private
   */
  getConsent_() {
    const consentPolicyId = super.getConsentPolicy();

    if (consentPolicyId) {
      const consentStatePromise = getConsentPolicyState(
        this.element,
        consentPolicyId
      ).catch((err) => {
        user().error(TAG, 'Error determining consent state', err);
        return CONSENT_POLICY_STATE.UNKNOWN;
      });

      const consentStringPromise = getConsentPolicyInfo(
        this.element,
        consentPolicyId
      ).catch((err) => {
        user().error(TAG, 'Error determining consent string', err);
        return null;
      });

      const consentMetadataPromise = getConsentMetadata(
        this.element,
        consentPolicyId
      ).catch((err) => {
        user().error(TAG, 'Error determining consent metadata', err);
        return null;
      });

      const consentSharedDataPromise = getConsentPolicySharedData(
        this.element,
        consentPolicyId
      ).catch((err) => {
        user().error(TAG, 'Error determining consent shared data', err);
        return null;
      });

      return Promise.all([
        consentStatePromise,
        consentStringPromise,
        consentMetadataPromise,
        consentSharedDataPromise,
      ]);
    }

    return Promise.resolve(null);
  }

  /**
   * Parses the consent tuple into a structured object
   * @param {Array} consentResponse - The consent response array
   * @return {?ConsentTupleDef} The parsed consent object
   * @private
   */
  parseConsent_(consentResponse) {
    const consentState = consentResponse[0];
    const consentString = consentResponse[1];
    const consentMetadata = consentResponse[2];
    const consentSharedData = consentResponse[3];

    const gdprApplies = consentMetadata
      ? consentMetadata['gdprApplies']
      : consentMetadata;
    const additionalConsent = consentMetadata
      ? consentMetadata['additionalConsent']
      : consentMetadata;
    const consentStringType = consentMetadata
      ? consentMetadata['consentStringType']
      : consentMetadata;
    const purposeOne = consentMetadata
      ? consentMetadata['purposeOne']
      : consentMetadata;
    const gppSectionId = consentMetadata
      ? consentMetadata['gppSectionId']
      : consentMetadata;

    return {
      consentState,
      consentString,
      consentStringType,
      gdprApplies,
      additionalConsent,
      consentSharedData,
      purposeOne,
      gppSectionId,
    };
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdNetworkInsuradsImpl);
});
