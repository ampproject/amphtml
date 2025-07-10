import {Deferred} from '#core/data-structures/promise';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';

import {Core} from './core';
import {DoubleClickHelper} from './doubleclick-helper';
import {ExtensionCommunication} from './extension';
import {VisibilityTracker} from './visibility-tracking';
import {Waterfall} from './waterfall';

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
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
    this.adUnitId_ = 0;

    /** @private {?Object} */
    this.adResponseData_ = null;

    /** @private {number} */
    this.parentMawId_ = 0;

    /** @private {string} */
    this.code_ = Math.random().toString(36).substring(2, 15);
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

    /** @private {?Core} */
    this.core_ = Core.start(this.win, canonicalUrl, publicId);
    this.core_.registerAdUnit(this.code, this.handleReconnect_.bind(this), {
      appInitHandler: (message) => this.handleAppInit_(message),
      unitInitHandler: (message) => this.handleUnitInit_(message),
      unitWaterfallHandler: (message) => this.handleUnitWaterfall_(message),
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
          id: this.getAdUnitId_(),
          shortId: this.adUnitId_,
          creative: null,
          order: null,
          orderLine: null,
          impressionId: this.generateImpressionId_(),
          market: entry ? entry.provider : '',
          creativeWidth: this.adResponseData_.servedSize.width,
          creativeHeight: this.adResponseData_.servedSize.height,
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
      const url = new URL(doubleClickUrl);
      if (self.refreshCount_ > 0) {
        const entry = this.waterfall_.getCurrentEntry();

        const params = url.searchParams;

        if (entry.path) {
          params.set('iu', entry.path);
        }

        const keyValuesParam = params.get('scp') || '';
        let keyValues = keyValuesParam;

        const allKeyValues = [
          ...(entry.keyValues || []),
          ...(entry.commonKeyValues || []),
        ];

        if (allKeyValues.length > 0) {
          const merged = this.serializeKeyValueArray_(allKeyValues);
          keyValues += (keyValues ? '&' : '') + merged;
        }

        if (this.iabTaxonomy_ && entry.isHouseDemand) {
          const userSignals = this.convertToUserSignals_(this.iabTaxonomy_);

          const encodedSignals = encodeURIComponent(
            btoa(JSON.stringify(userSignals))
          );

          params.set('ppsj', encodedSignals);
        }

        params.set('scp', keyValues);

        const sizesString = params.get('sz');
        const sizesArray = sizesString
          .split('|')
          .map((size) => size.split('x').map(Number));
        this.sizes_ = sizesArray;
      }
      self.getAdUrlInsurAdsDeferred.resolve(url.toString());
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
    // TODO: REVIEW WITH ANDRE
    if (message.status !== undefined) {
      this.appEnabled_ = message.status > 0 ? true : false;

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
    this.adUnitId_ = message.adUnitId;
    this.element.setAttribute('tg-zone', this.getAdUnitId_());

    if (window.frames['TG-listener'] && !this.extension_) {
      this.extension_ = ExtensionCommunication.start(
        this.getAdUnitId_(),
        this.handlerExtensionMessages_.bind(this)
      );
    }

    const {height, width} = this.creativeSize_ || this.initialSize_;

    if (!this.extensionReadyDeferred_.isDone()) {
      if (this.extension_) {
        this.extension_.adUnitCreated({
          id: this.getAdUnitId_(),
          shortId: message.adUnitId,
          sizes: this.sizes_,
          configuration: null,
          customTargeting: null,
          rotation: message.rotation ? message.rotation : false,
          isFirstPrint: false,
          isTracking: false,
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
  handleUnitWaterfall_(message) {
    if (message.code !== this.code) {
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
    if (msg.data.adUnitId !== this.getAdUnitId_()) {
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
    if (this.isViewable_ !== visibilityData.isViewable && this.appEnabled) {
      this.core_.sendUnitSnapshot(this.code_, visibilityData.isViewable);
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
        code: this.code_,
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
   * Return the Full AdUnit Id with the slot index
   * @return {string}
   * @private
   */
  getAdUnitId_() {
    const adUnitId =
      this.adUnitId_ + '.' + this.element.getAttribute('data-amp-slot-index');
    return adUnitId;
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
      this.extension_.adUnitRemoved(this.getAdUnitId_());
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
   * Generates an impression id.
   * @return {string}
   * @private
   */
  generateImpressionId_() {
    return this.generate_(43).toLowerCase();
  }

  /**
   * Generates a random string.
   * @param {number} length
   * @return {string}
   * @private
   */
  generate_(length) {
    let text = '';
    const charSet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    return text;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdNetworkInsuradsImpl);
});
