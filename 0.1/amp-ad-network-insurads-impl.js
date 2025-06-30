import {Deferred} from '#core/data-structures/promise';

import {Services} from '#service';

import {DoubleClickHelper} from './doubleclick-helper';
import {EngagementTracker} from './engagement-tracking';
import {ExtensionCommunication} from './extension';
import {LockedId} from './lockedid';
import {NextRefresh} from './next-refresh';
import {RealtimeMessaging} from './realtime-messaging';
import {VisibilityTracker} from './visibility-tracking';

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
    this.sellerId = this.element.getAttribute('data-public-id');
    this.appEnabled = false;
    this.ivm = false;
    this.iabTaxonomy = {};
    this.sellerKeyValues = [];
    this.nextRefresh = new NextRefresh();
    this.isViewable_ = false;

    /* DoubleClick & AMP */
    this.dCHelper = new DoubleClickHelper(this);
    this.dCHelper.callMethod('constructor', element);
    /* DoubleClick& AMP */

    /* InsurAds Business  */
    this.lockedid = new LockedId().getLockedIdData();
    this.realtimeMessaging_ = new RealtimeMessaging(
      this.sellerId,
      this.canonicalUrl,
      this.handleReconnect_.bind(this),
      {
        appInitHandler: (message) => this.handleAppInit_(message),
        unitInitHandler: (message) => this.handleUnitInit_(message),
        unitWaterfallHandler: (message) => this.handleUnitWaterfall_(message),
      }
    );

    if (window.frames['TG-listener']) {
      this.extension_ = new ExtensionCommunication(
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

    this.realtimeMessaging_.sendAppInit(
      this.lockedid,
      true,
      !!this.extension_,
      this.canonicalUrl
    );

    // TODO: Get all the params
    this.extension_.setup(
      1, // applicationId
      'PT', // country
      1, // section
      'XPTO', // sessionId
      'C3PO', // contextId
      this.engagement_.isEngaged() ? 1 : 0 // state
    );
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

    this.realtimeMessaging_.sendUnitInit(
      this.code,
      this.slot,
      responseHeaders.get('google-lineitem-id') || '-1',
      responseHeaders.get('google-creative-id') || '-1',
      responseHeaders.get('google-size') || '',
      this.sizes || [],
      this.keyValues || [],
      this.nextRefresh ? this.nextRefresh.provider : 'pgam',
      0
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
        // Assume all the necessary and updated params (including the original parameters)
        // will come from the server
        if (this.nextRefresh.parameters.length > 0) {
          this.nextRefresh.parameters.forEach((param) => {
            params.set(param.key, param.value);
          });
        }
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
    super.forceCollapse();

    console /*OK*/
      .log('Force Collapse');

    // Should we refresh to our demand on first print blank?

    // Destroy the ad and all its components
    // TODO: This must be tested properly to see if there is a better place for destroy
    this.destroy_();
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
    this.realtimeMessaging_.sendAppInit(
      this.lockedid,
      true,
      true,
      this.canonicalUrl,
      true
    );
  }

  /**
   * Handles app initialization messages
   * @param {!Object} message - The app initialization message
   * @private
   */
  handleAppInit_(message) {
    this.appEnabled = message.status === 'ok' ? true : false;
    this.ivm = !!message.ivm;
    this.iabTaxonomy = message.iabTaxonomy;
    this.sellerKeyValues.push(...message.keyValues); // # TODO: Needs to handle the key values, like duplicates, accepted keys, etc
    console /*OK*/
      .log('App Init:', message);

    if (!this.engagement_) {
      const config = {
        ivm: this.ivm,
      };
      this.engagement_ = EngagementTracker.get(this.win, config);
      // TODO: Remove listeners on destroy
      this.unlistenEngagement_ = this.engagement_.registerListener(
        this.updateEngagementStatus_.bind(this)
      );
    }
  }

  /**
   * Handles unit initialization messages
   * @param {!Object} message - The app initialization message
   * @private
   */
  handleUnitInit_(message) {
    this.adUnitId = message.adUnitId;
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

    this.nextRefresh = NextRefresh.fromWaterfallMessage(message);
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
      this.realtimeMessaging_.sendUnitSnapshot(
        this.code,
        visibilityData.isViewable
      );

      this.isViewable_ = visibilityData.isViewable;
    }

    console /*OK*/
      .log('Visibility Change:', visibilityData.isViewable);
    console /*OK*/
      .log('Visibility Percentage:', visibilityData.visibilityPercentage);
  }

  /**
   * Handles user engagement changes
   * @param {!Object} state - Engagement state object
   * @private
   */
  updateEngagementStatus_(state) {
    if (this.realtimeMessaging_) {
      this.realtimeMessaging_.sendPageStatus(state);
    }

    if (this.extension_) {
      // TODO: Create BrowserStates and extend with Idle,etc
      this.extension_.engagementStatus({
        index: state.isEngaged ? 1 : 0,
        name: state.isEngaged ? 'Active' : 'Inactive',
      });
    }

    console /*OK*/
      .log('Engagement changed:', state.isEngaged, state);
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
    // Already Validated. is called when the ad is refreshed or unlayoutCallback
    // A: Does the teardown happen in every refresh?
    // B: OR Does the teardown happen when the ad is removed from the DOM // Slot Collapsed?
    // If A:
    // Don't destroy the extension, as it will be used in the next refresh
    // Don't destroy the realtime messaging, as it will be used in the next refresh
    // Don't destroy the engagement tracker, as it will be used in the next refresh
    // Don't destroy the visibility tracker, as it will be used in the next refresh
    // If B: - IT IS B: tearDownSlot is called when the ad is refreshed or unlayoutCallback
    // Don't destroy all the components, as they will be used in the next refresh
    // TODO: Find a proper place to proper cleanup of the components (commented bellow)
    if (this.visibilityTracker) {
      this.visibilityTracker.destroy();
      this.visibilityTracker = null;
    }

    if (this.engagement_) {
      this.engagement_.release();
    }

    if (this.realtimeMessaging_) {
      // TODO: Shall we disconnect/destroy the realtime messaging if no more instances present?
      this.realtimeMessaging_.disconnect();
      this.realtimeMessaging_ = null;
    }

    if (this.extension_) {
      this.extension_.adUnitRemoved(this.getAdUnitId());
      this.extension_.destroy();
      this.extension_ = null;
    }
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdNetworkInsuradsImpl);
});
