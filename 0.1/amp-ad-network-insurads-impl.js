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

    // Always disable A4A Refresh, as we are using our own refresh mechanism
    this.element.setAttribute('data-enable-refresh', 'false');

    this.publicId = this.element.getAttribute('data-public-id');
    this.canonicalUrl = Services.documentInfoForDoc(this.element).canonicalUrl;

    // This exist to store the information that is received in ExtractSize
    /** @private {?Object} */
    this.adResponseData_ = null;
    /** @private {number} */
    this.parentMawId_ = 0;

    // Parameters that represent the AdUnit
    /** @private {string} */
    this.code_ = Math.random().toString(36).substring(2, 15);
    /** @private {string} */
    this.path_ = this.element.getAttribute('data-slot');
    /** @private {!Array<string>} */
    this.requiredKeys_ = [];
    /** @private {!Array<!Object<string, string>>} */
    this.requiredKeyValues_ = [];
    /** @private {?Object} */
    this.originalRtcConfig_ = tryParseJson(
      this.element.getAttribute('rtc-config')
    );

    // States of the AdUnit
    /** @private {boolean} */
    this.isViewable_ = false;

    // Parameteres that represent the Application
    /** @private {?Object} */
    this.iabTaxonomy_ = {};

    // States of the Application
    /** @private {boolean} */
    this.appEnabled_ = false;
    /** @private @const {!Deferred} */
    this.appReadyDeferred_ = new Deferred();

    /* DoubleClick & AMP */
    /** @public {?DoubleClickHelper} */
    this.dCHelper = new DoubleClickHelper(this);
    this.dCHelper.callMethod('constructor', element);
    /* DoubleClick& AMP */

    /* InsurAds Business  */
    /** @private {?Core} */
    this.core_ = Core.start(this.win, this.canonicalUrl, this.publicId);
    this.core_.registerAdUnit(this.code, this.handleReconnect_.bind(this), {
      appInitHandler: (message) => this.handleAppInit_(message),
      unitInitHandler: (message) => this.handleUnitInit_(message),
      unitWaterfallHandler: (message) => this.handleUnitWaterfall_(message),
    });

    if (window.frames['TG-listener']) {
      /** @private {?ExtensionCommunication} */
      this.extension_ = ExtensionCommunication.start(
        this.code,
        this.handlerExtensionMessages_.bind(this)
      );
    }
    /* InsurAds Business  */

    console /*OK*/
      .log('Canonical URL:', this.canonicalUrl);
  }

  /** @override */
  buildCallback() {
    // Call the AMP A4A buildCallback to set up base functionality
    this.dCHelper.callMethod('buildCallback');

    console /*OK*/
      .log('Build Callback');
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
    console /*Ok*/
      .log('Refresh', this.path, this.refreshCount_, this.element, this);
    // DON'T CALL DOUBLE CLICK REFRESH! NOT NEEDED.
    return super.refresh(refreshEndCallback);
  }

  /** @override */
  extractSize(responseHeaders) {
    // Store the data from the response.
    this.adResponseData_ = {
      lineItemId: responseHeaders.get('google-lineitem-id') || '-1',
      creativeId: responseHeaders.get('google-creative-id') || '-1',
      servedSize: responseHeaders.get('google-size') || '',
    };

    // After the ad is served and the app is ready, send our init message.
    this.appReadyDeferred_.promise.then(() => {
      // This will now correctly execute on the initial load AND every refresh.
      this.sendUnitInit_();
    });

    // if (this.extension_) {
    //   this.extension_.bannerChanged(this.unitInfo);
    // }

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
      3;
      const url = new URL(doubleClickUrl);
      if (self.refreshCount_ > 0) {
        console./*Ok*/ log('Refresh count:', self.refreshCount_);

        const nextRefresh = this.waterfall.getCurrentEntry();

        const params = url.searchParams;

        if (nextRefresh.path) {
          params.set('iu', nextRefresh.path);
        }

        const keyValuesParam = params.get('scp') || '';
        let keyValues = keyValuesParam;

        const allKeyValues = [
          ...(nextRefresh.keyValues || []),
          ...(nextRefresh.commonKeyValues || []),
        ];

        if (allKeyValues.length > 0) {
          const merged = this.serializeKeyValueArray_(allKeyValues);
          keyValues += (keyValues ? '&' : '') + merged;
        }

        if (this.iabTaxonomy_ && this.nextEntry.provider === 'hgam') {
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
    console /*OK*/
      .log('Tear Down Slot');

    // Cleanup moved to forceCollapse for now
  }

  /** @override */
  forceCollapse() {
    if (this.refreshCount_ === 0) {
      // Blank on first print, Insurads does nothing, so we will
      // call the super.forceCollapse to mantain the A4A flow
      super.forceCollapse();

      // Destroy the ad and all its components
      // TODO: This must be tested properly to see if there is a better place for destroy
      this.destroy_();
      console /*OK*/
        .log('Force Collapse');
    } else {
      // On blanks after first print, we refresh
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
      console /*OK*/
        .log('App not enabled, ignoring refresh trigger');
      // TODO: Validate this logic for destroy here
      this.destroy_();
      return false;
    }

    console /*OK*/
      .log('Triggering immediate ad refresh');
    // Don't refresh if we're already in the process of refreshing
    if (this.isRefreshing) {
      console /*OK*/
        .log('Already refreshing, ignoring refresh trigger');
      return false;
    }
    // Check if the ad is in a state where it can be refreshed
    if (!this.iframe) {
      console /*OK*/
        .log('Ad not ready for refresh yet');
      return false;
    }

    const nextRefresh = this.waterfall.getNextEntry();

    if (!nextRefresh) {
      return false;
    }

    this.updateRtcConfig_(nextRefresh);

    this.refresh(this.refreshEndCallback_);
  }

  /**
   * Handles reconnection to InsurAds
   * This is called when the WebSocket connection is lost and needs to be re-established.
   * @private
   * */
  handleReconnect_() {
    console /*OK*/
      .log('Reconnecting to InsurAds');

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
      this.requiredKeys_.push(...message.requiredKeys); // # TODO: Needs to handle the key values, like duplicates, accepted keys, etc

      if (this.requiredKeys_.length > 0) {
        const jsonTargeting =
          tryParseJson(this.element.getAttribute('json')) || {};
        this.requiredKeys_.forEach((key) => {
          const {targeting} = jsonTargeting;
          if (targeting && targeting[key]) {
            this.requiredKeyValues_.push({
              key,
              value: targeting[key],
            });
          }
        });
      }
    }

    if (message.iabTaxonomy !== undefined) {
      this.iabTaxonomy_ = message.iabTaxonomy;
    }

    if (!this.appReadyDeferred_.isDone()) {
      this.appReadyDeferred_.resolve();
    }

    console /*OK*/
      .log('App Init:', message);
  }

  /**
   * Handles unit initialization messages
   * @param {!Object} message - The unit initialization message
   * @private
   */
  handleUnitInit_(message) {
    //this.code = message.unitcode; ?????
    this.adUnitId = message.adUnitId; // unitId ???
    // other information from message ???
    this.element.setAttribute('tg-zone', this.getAdUnitId_());

    console /*OK*/
      .log('Unit Init:', message);

    if (!this.visibilityTracker) {
      this.visibilityTracker = new VisibilityTracker(
        this.win,
        this.element,
        this.onVisibilityChange_.bind(this)
      );
    }

    const {height, width} = this.creativeSize_ || this.initialSize_;

    this.extension_.adUnitChanged({
      id: this.getAdUnitId_(),
      shortId: message.adUnitId,
      sizes: this.sizes_,
      instance: this.element.getAttribute('data-amp-slot-index'),
      configuration: null,
      customTargeting: null,
      rotation: message.rotation ? message.rotation : false,
      isFirstPrint: this.refreshCount_ === 0,
      isTracking: false,
      visible: this.isViewable_,
      width,
      height,
      dfpMapping: null,
      isAmpSlot: true,
    });
  }

  /**
   * Handles unit waterfall messages
   * @param {!Object} message - The app initialization message
   * @private
   */
  handleUnitWaterfall_(message) {
    if (message.code !== this.code) {
      console /*OK*/
        .log('Wrong Unit Waterfall:', message);
      return;
    }

    this.waterfall = Waterfall.fromWaterfallMessage(message);
    this.triggerImmediateRefresh_();

    console /*OK*/
      .log('Unit Waterfall:', message);
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
      const entry = this.waterfall ? this.waterfall.getCurrentEntry() : null;

      // Maybe create a method to get the object parameters if this is going to be reused for extension?
      const unitInit = {
        // Unit
        code: this.code_,
        keyValues: this.requiredKeyValues_,
        path: entry ? entry.path : this.path_,
        // Ad Response
        lineItemId: this.adResponseData_.lineItemId,
        creativeId: this.adResponseData_.creativeId,
        servedSize: this.adResponseData_.servedSize,
        // Waterfall Entry
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
      this.adUnitId + '.' + this.element.getAttribute('data-amp-slot-index');
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
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdNetworkInsuradsImpl);
});
