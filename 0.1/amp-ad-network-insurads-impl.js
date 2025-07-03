import {Deferred} from '#core/data-structures/promise';

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
    // TODO: Confirm that this is working as expected
    super(element);
    // Always disable A4A Refresh, as we are using our own refresh mechanism
    this.element.setAttribute('data-enable-refresh', 'false');

    this.code = Math.random().toString(36).substring(2, 15);
    this.canonicalUrl = Services.documentInfoForDoc(this.element).canonicalUrl;
    this.slot = this.element.getAttribute('data-slot');
    this.publicId = this.element.getAttribute('data-public-id');
    this.appEnabled = false;
    this.iabTaxonomy = {};
    this.requiredKeys = [];
    this.isViewable_ = false;

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
      .log('Refresh', this.slot, this.refreshCount_, this.element, this);
    // DON'T CALL DOUBLE CLICK REFRESH! NOT NEEDED.
    return super.refresh(refreshEndCallback);
  }

  /** @override */
  extractSize(responseHeaders) {
    console /*Ok*/
      .log('CreativeId', responseHeaders.get('google-creative-id') || '-1');
    console /*Ok*/
      .log('lineItemId', responseHeaders.get('google-lineitem-id') || '-1');
    console /*Ok*/
      .log('size', responseHeaders.get('google-size') || '300x250');
    console /*Ok*/
      .log('slot', this.slot);

    this.lineItemId = responseHeaders.get('google-lineitem-id') || '-1';
    this.creativeId = responseHeaders.get('google-creative-id') || '-1';
    this.creativeSize = responseHeaders.get('google-size') || '';

    this.core_.sendUnitInit(
      this.code,
      this.slot,
      this.lineItemId,
      this.creativeId,
      this.creativeSize,
      this.sizes || [],
      this.keyValues || [],
      this.nextRefresh ? this.nextRefresh.provider : 'pgam',
      0, // Parent Maw Id ???
      0 //Passback ????
    );

    this.extension_.bannerChanged(this); // TODO: Update with correct adunit params

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

        // Test code
        // this.slot === '/134642692/AMPTestsV3'
        // ? '/30497360/a4a/a4a_native'
        // : '/134642692/AMPTestsV3';
        //
        // if (this.nextRefresh.path) {
        //   params.set('iu', this.nextRefresh.path);
        // }
        // if (this.nextRefresh.sizesString) {
        //   params.set('sz', this.nextRefresh.sizesString);
        // }
        // console /*OK*/
        //   .log(url.toString());

        // TODO: Discuss if we should support single parameters and mantain that logic here
        // OR do like we planned, keep the logic on the server side, and get only the processed parameters

        const params = url.searchParams;
        // params.set('key', 'value');

        // Entry
        //   - position (n)
        //   - provider (n)
        //   - path: "/123123123/cenas/cenas (y)
        //   - sizes (y)
        //   - keyValues (y)
        //     - "iat-iab-content": "1", "2"
        //     - "iat-fluffy": "10"
        //   - vendors (n)
        //     - "aps": {"PUB_ID": "600", "PUB_UUID": 'enter you UAM publisher ID', "PARAMS":{"amp":"1"}}
        //     - "openwrap": {"PUB_ID", "162930", "PROFILE_ID": "9578"}
        // - commonKeyValues (y)
        //     - "iat-imp-app": "1"

        if (this.nextRefresh.path) {
          params.set('iu', this.nextRefresh.path);
        }

        if (this.nextRefresh.sizesString) {
          params.set('sz', this.nextRefresh.sizesString);
        }

        const keyValues = params.get('scp') || '';
        if (this.nextRefresh.keyValues.length > 0) {
          const newValues = this.nextRefresh.keyValues
            .map((kv) => {
              let {value} = kv;
              if (Array.isArray(kv.value)) {
                value = kv.value.join(',');
              }
              return `${kv.key}=${value}`;
            })
            .join('&');
          keyValues += '&' + newValues;
        }
        if (this.nextRefresh.commonKeyValues.length > 0) {
          const newValues = this.nextRefresh.commonKeyValues
            .map((kv) => {
              let {value} = kv;
              if (Array.isArray(kv.value)) {
                value = kv.value.join(',');
              }
              return `${kv.key}=${value}`;
            })
            .join('&');
          keyValues += '&' + newValues;
        }
        params.set('scp', keyValues);
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
      this.keyValues || [],
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
      sizes: this.sizesArray,
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
    if (this.isViewable_ !== visibilityData.isViewable) {
      this.core_.sendUnitSnapshot(this.code, visibilityData.isViewable);

      this.isViewable_ = visibilityData.isViewable;
    }

    console /*OK*/
      .log('Visibility Change:', visibilityData.isViewable);
    console /*OK*/
      .log('Visibility Percentage:', visibilityData.visibilityPercentage);
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
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdNetworkInsuradsImpl);
});
