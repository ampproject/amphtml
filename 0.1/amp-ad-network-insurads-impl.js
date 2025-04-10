import {Deferred} from '#core/data-structures/promise';

import {Services} from '#service';

import {DoubleClickHelper} from './doubleclick-helper';
import {EngagementTracker} from './engagement-tracking';
import {ExtensionCommunicator} from './extension';
import {LockedId} from './lockedid';
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

    /* DoubleClick & AMP */
    this.dCHelper = new DoubleClickHelper(this);
    this.dCHelper.callMethod('constructor', element);
    /* DoubleClick& AMP */

    this.code = Math.random().toString(36).substring(2, 15);
    this.canonicalUrl = Services.documentInfoForDoc(this.element).canonicalUrl;
    this.slot = this.element.getAttribute('data-slot');
    this.sellerId = this.element.getAttribute('data-public-id');
    this.appEnabled = false;
    this.ivm = false;
    this.iabTaxonomy = {};
    this.sellerKeyValues = [];
    this.nextRefresh = {}; // TODO: Implement model for this
    this.isViewable_ = false;

    /* InsurAds Business  */
    this.lockedid = new LockedId().getLockedIdData();
    this.realtimeMessaging_ = new RealtimeMessaging(this.sellerId, {
      appInitHandler: (message) => this.handleAppInit_(message),
      unitInitHandler: (message) => this.handleUnitInit_(message),
      unitWaterfallHandler: (message) => this.handleUnitWaterfall_(message),
    });

    this.extension = new ExtensionCommunicator();
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
      true,
      this.canonicalUrl
    );

    // this.extension.sendIframeMessage('cfg', {
    //   sessionId: 'XPTO',
    //   contextId: 'C3PO',
    //   appId: 1,
    //   section: 1,
    //   // eslint-disable-next-line local/camelcase
    //   g_country: 'PT',
    // });
  }

  /** @override */
  onCreativeRender(creativeMetaData, opt_onLoadPromise) {
    this.isRefreshing = false;
    this.dCHelper.callMethod(
      'onCreativeRender',
      creativeMetaData,
      opt_onLoadPromise
    );

    // this.extension.sendIframeMessage('adUnitChanged', {
    //   id: this.element.getAttribute('data-slot'),
    //   shortId: this.element.getAttribute('data-amp-slot-index'),
    //   sizes: ['300x250'],
    //   instance: this.element.getAttribute('data-amp-slot-index'),
    //   configuration: null,
    //   customTargeting: null,
    //   rotation: 'Enabled',
    //   isFirstPrint: true,
    //   isTracking: false,
    //   visible: true,
    //   width: 300,
    //   height: 250,
    //   dfpMapping: null,
    //   isAmpSlot: true,
    // });
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
      'pgam',
      0
    );

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
        console./*Ok*/ log('Refresh count:', self.refreshCount_);
        // this.slot === '/134642692/AMPTestsV3'
        // ? '/30497360/a4a/a4a_native'
        // : '/134642692/AMPTestsV3';

        const params = url.searchParams;
        params.set('iu', this.nextRefresh.path);
        params.set('sz', this.nextRefresh.sizesString);
        console /*OK*/
          .log(url.toString());
      }
      self.getAdUrlInsurAdsDeferred.resolve(url.toString());
    });
    return this.getAdUrlInsurAdsDeferred.promise;
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
  }

  /**
   * Handles unit initialization messages
   * @param {!Object} message - The app initialization message
   * @private
   */
  handleUnitInit_(message) {
    this.adUnitId = message.adUnitId;
    console /*OK*/
      .log('Unit Init:', message);

    if (!this.visibilityTracker) {
      this.visibilityTracker = new VisibilityTracker(
        this.win,
        this.element,
        this.onVisibilityChange_.bind(this)
      );
    }

    if (!this.engagement_) {
      this.engagement_ = EngagementTracker.getInstance(this.win);
      this.engagement_
        .init()
        .onEngagementChange(this.onEngagementChange_.bind(this));
    }
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

    // TODO: Define the paramteters for the next refresh!!!
    this.nextRefresh = this.processWaterfallMessage_(message);
    this.triggerImmediateRefresh();

    console /*OK*/
      .log('Unit Waterfall:', message);
  }

  /**
   * Processes a waterfall message into a structured format for ad refresh
   * @param {!Object} message - The waterfall message to process
   * @return {!Object} Processed waterfall data
   * @private
   */
  processWaterfallMessage_(message) {
    const processed = {
      code: message.code,
      provider: message.provider,
      path: message.path,
      sizesArray: [],
      sizesString: '',
      keyValues: [],
      parameters: message.parametersMap,
    };

    if (Array.isArray(message.sizes) && message.sizes.length > 0) {
      processed.sizesArray = message.sizes
        .map((size) => {
          if (Array.isArray(size) && size.length >= 2) {
            return [parseInt(size[0], 10), parseInt(size[1], 10)];
          } else if (typeof size === 'string' && size.includes('x')) {
            const [width, height] = size
              .split('x')
              .map((dim) => parseInt(dim, 10));
            return [width, height];
          }
          return null;
        })
        .filter((size) => size !== null);

      processed.sizesString = processed.sizesArray
        .map((size) => `${size[0]}x${size[1]}`)
        .join('|');
    }

    // TODO: Process key-values for ad targeting

    // TODO: Process parametersMap

    return processed;
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
   * @param {boolean} isEngaged - Whether user is engaged
   * @private
   */
  onEngagementChange_(isEngaged) {
    const state = this.engagement_.getState();

    if (this.realtimeMessaging_) {
      this.realtimeMessaging_.sendPageStatus(isEngaged);
    }

    console /*OK*/
      .log('Engagement changed:', isEngaged, state);
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdNetworkInsuradsImpl);
});
