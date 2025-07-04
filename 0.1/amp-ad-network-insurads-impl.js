import {Deferred} from '#core/data-structures/promise';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';

import {Core} from './core';
import {DoubleClickHelper} from './doubleclick-helper';
import {ExtensionCommunication} from './extension';
import {UnitInfo} from './models';
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

    this.unitInfo = new UnitInfo(Math.random().toString(36).substring(2, 15));
    this.unitInfo.setPath(this.element.getAttribute('data-slot'));
    this.unitInfo.setLineItemId(this.element.getAttribute('data-line-item-id'));
    this.unitInfo.setCreativeId(this.element.getAttribute('data-creative-id'));

    this.unitInfo.setIsVisible(false);

    this.canonicalUrl = Services.documentInfoForDoc(this.element).canonicalUrl;
    this.publicId = this.element.getAttribute('data-public-id');

    this.appEnabled = false;
    this.iabTaxonomy = {};

    this.requiredKeys = [];
    this.requiredKeyValues = [];

    const jsonTargeting = tryParseJson(this.element.getAttribute('json')) || {};
    this.requiredKeys.forEach((key) => {
      const {targeting} = jsonTargeting;
      if (targeting && targeting[key]) {
        this.requiredKeyValues.push({
          key,
          value: targeting[key],
        });
      }
    });

    // TODO: To be changed
    this.nextRefresh = null;

    /* DoubleClick & AMP */
    this.dCHelper = new DoubleClickHelper(this);
    this.dCHelper.callMethod('constructor', element);
    /* DoubleClick& AMP */

    /* InsurAds Business  */
    this.core_ = Core.Start(
      this.publicId,
      this.canonicalUrl,
      this.code,
      this.handleReconnect_.bind(this),
      {
        appInitHandler: (message) => this.handleAppInit_(message),
        unitInitHandler: (message) => this.handleUnitInit_(message),
        unitWaterfallHandler: (message) => this.handleUnitWaterfall_(message),
      }
    );

    if (window.frames['TG-listener']) {
      this.extension_ = ExtensionCommunication.start(
        this.handlerExtensionMessages.bind(this)
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
    this.unitInfo.setLineItemId(
      responseHeaders.get('google-lineitem-id') || '-1'
    );
    this.unitInfo.setCreativeId(
      responseHeaders.get('google-creative-id') || '-1'
    );

    this.unitInfo.setServedSize(
      responseHeaders.get('google-size') || '' // TODO: Check if this is correct when the response is empty, unknown or ''
    );

    this.sendUnitInit_();

    this.extension_.bannerChanged(this.unitInfo);

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

        const params = url.searchParams;

        if (this.nextRefresh.path) {
          params.set('iu', this.nextRefresh.path);
        }

        const keyValuesParam = params.get('scp') || '';
        let keyValues = keyValuesParam;

        const allKeyValues = [
          ...(this.nextRefresh.keyValues || []),
          ...(this.nextRefresh.commonKeyValues || []),
        ];

        if (allKeyValues.length > 0) {
          const merged = this.serializeKeyValueArray_(allKeyValues);
          keyValues += (keyValues ? '&' : '') + merged;
        }

        if (this.iabTaxonomy && this.nextEntry.provider === 'hgam') {
          const userSignals = this.convertToUserSignals(this.iabTaxonomy);

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
        this.unitInfo.setSizes(sizesArray);
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
      this.triggerImmediateRefresh();
    }
  }

  /**
   * refreshEndCallback
   *
   */
  refreshEndCallback() {
    console /*OK*/
      .log('Refresh End Callback');
  }

  /**
   * Triggers an immediate refresh of the ad.
   * This can be called when receiving realtime messages that require a refresh
   * or an Extension Refresh message.
   * @return {boolean}
   */
  triggerImmediateRefresh() {
    if (!this.appEnabled) {
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

    this.nextRefresh = Waterfall.getNextEntry();

    // Update rtc-config with our vendors information
    //   - vendors (n)
    //     - "aps": {"PUB_ID": "600", "PUB_UUID": 'enter you UAM publisher ID', "PARAMS":{"amp":"1"}}
    //     - "openwrap": {"PUB_ID", "162930", "PROFILE_ID": "9578"}
    const rtcConfig = tryParseJson(this.element.getAttribute('rtc-config'));
    if (rtcConfig && rtcConfig.vendors) {
      Object.assign(rtcConfig.vendors, this.nextRefresh.vendors || {});
      this.element.setAttribute('rtc-config', JSON.stringify(rtcConfig));
    }

    if (!this.nextRefresh) {
      return false;
    }

    this.refresh(this.refreshEndCallback);
  }

  /**
   * Handles reconnection to InsurAds
   * This is called when the WebSocket connection is lost and needs to be re-established.
   * @private
   * */
  handleReconnect_() {
    console /*OK*/
      .log('Reconnecting to InsurAds');

    // TODO: send unit init with reconnect
    this.core_.sendUnitInit(
      this.code,
      this.slot,
      this.lineItemId,
      this.creativeId,
      this.creativeSize,
      this.sizes || [],
      this.requiredKeyValues,
      this.nextRefresh ? this.nextRefresh.provider : 'pgam',
      0, // Parent Maw Id ???
      0, //Passback ????
      true
    );
  }

  /**
   * Handles app initialization messages
   * @param {!Object} message - The app initialization message
   * @private
   */
  handleAppInit_(message) {
    this.appEnabled = message.status > 0 ? true : false;
    this.requiredKeys.push(...message.requiredKeys); // # TODO: Needs to handle the key values, like duplicates, accepted keys, etc
    this.iabTaxonomy = message.iabTaxonomy;

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
    this.element.setAttribute('tg-zone', this.getAdUnitId());

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
      id: this.getAdUnitId(),
      shortId: message.adUnitId,
      sizes: this.sizes,
      instance: this.element.getAttribute('data-amp-slot-index'),
      configuration: null,
      customTargeting: null,
      rotation: 'Enabled',
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
    this.triggerImmediateRefresh();

    console /*OK*/
      .log('Unit Waterfall:', message);
  }

  /**
   * Handle incoming messages from the extension
   * @param {MessageEvent} msg - The message event
   */
  handlerExtensionMessages(msg) {
    if (msg.data.adUnitId !== this.getAdUnitId()) {
      return;
    }

    switch (msg.data.action) {
      case 'changeBanner':
        this.refresh(this.refreshEndCallback);
        break;
    }
  }

  /**
   * Handles visibility changes
   * @param {!Object} visibilityData - Visibility data object
   * @private
   */
  onVisibilityChange_(visibilityData) {
    if (
      this.unitInfo.isVisible !== visibilityData.isViewable &&
      this.appEnabled
    ) {
      this.core_.sendUnitSnapshot(
        this.unitInfo.code,
        visibilityData.isViewable
      );

      this.unitInfo.setIsVisible(visibilityData.isViewable);
    }

    console /*OK*/
      .log('Visibility Change:', visibilityData.isViewable);
    console /*OK*/
      .log('Visibility Percentage:', visibilityData.visibilityPercentage);
  }

  /**
   * Sends the unit initialization message
   * @private
   */
  sendUnitInit_() {
    if (this.appEnabled) {
      // TODO: send message to Core manager
      this.core_.sendUnitInit(this.unitInfo);
    }
  }

  /**
   * Return the Full AdUnit Id with the slot index
   * @return {string}
   */
  getAdUnitId() {
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
   */
  convertToUserSignals(data) {
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
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdNetworkInsuradsImpl);
});
