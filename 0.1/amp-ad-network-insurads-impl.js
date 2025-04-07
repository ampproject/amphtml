import {Deferred} from '#core/data-structures/promise';

import {Services} from '#service';

import {ExtensionCommunicator} from './extension';
import {LockedIdGenerator} from './lockedid-generator';
import {MappingService} from './mapping';
import {RealtimeMessaging} from './realtime-messaging';
import {getCapitalizedMethodWithPrefix} from './utils';
import {VisibilityTracker} from './visibility-tracking';

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {AmpAdNetworkDoubleclickImpl} from '../../amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl';

/** @type {string} */
const TAG = 'amp-ad-network-insurads-impl';

/** @type {string} */
const DOUBLECLICK_PREFIX = 'doubleclick';

export class AmpAdNetworkInsuradsImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    // TODO: Confirm that this is working as expected
    // super(element);
    this.callDoubleClickMethod_('constructor', [element]);

    /* DoubleClick & AMP */
    this.element.setAttribute('data-enable-refresh', 'false');
    this.initDoubleClickHelper();
    /* DoubleClick& AMP */

    /* InsurAds Business  */
    this.lockedid = new LockedIdGenerator().getLockedIdData();
    this.realtimeMessaging_ = new RealtimeMessaging({
      appInitHandler: (message) => this.handleAppInit_(message),
      unitInitHandler: (message) => this.handleUnitInit_(message),
      unitWaterfallHandler: (message) => this.handleUnitWaterfall_(message),
    });
    this.mappingService = new MappingService(this.win);
    this.extension = new ExtensionCommunicator();
    // /** @private {?VisibilityTracker} */
    // this.visibilityTracker_ = null;

    // /** @private {number} */
    // this.visibilityPercentage_ = 0;

    // /** @private {boolean} */
    // this.isVisible_ = false;
    /* InsurAds Business  */

    this.canonicalUrl = Services.documentInfoForDoc(this.element).canonicalUrl;
    console /*OK*/
      .log('Canonical URL:', this.canonicalUrl);
  }

  /** @override */
  buildCallback() {
    this.callDoubleClickMethod_('buildCallback');

    console /*OK*/
      .log('Build Callback');

    this.visibilityTracker_ = new VisibilityTracker(
      this.win,
      this.element,
      (visibilityData) => this.onVisibilityChange_(visibilityData)
    );

    this.realtimeMessaging_.sendAppInit(null, 1, 1, this.canonicalUrl);

    this.extension.sendIframeMessage('cfg', {
      sessionId: 'XPTO',
      contextId: 'C3PO',
      appId: 1,
      section: 1,
      // eslint-disable-next-line local/camelcase
      g_country: 'PT',
    });
  }

  /** @override */
  onCreativeRender(creativeMetaData, opt_onLoadPromise) {
    this.callDoubleClickMethod_('onCreativeRender', [
      creativeMetaData,
      opt_onLoadPromise,
    ]);

    this.extension.sendIframeMessage('adUnitChanged', {
      id: this.element.getAttribute('data-slot'),
      shortId: this.element.getAttribute('data-amp-slot-index'),
      sizes: ['300x250'],
      instance: this.element.getAttribute('data-amp-slot-index'),
      configuration: null,
      customTargeting: null,
      rotation: 'Enabled',
      isFirstPrint: true,
      isTracking: false,
      visible: true,
      width: 300,
      height: 250,
      dfpMapping: null,
      isAmpSlot: true,
    });
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
      .log('responseHeaders', responseHeaders);

    return this.callDoubleClickMethod_('extractSize', [responseHeaders]);
  }

  /** @override */
  getAdUrl(opt_consentTuple, opt_rtcResponsesPromise, opt_serveNpaSignal) {
    this.getAdUrlDeferred = new Deferred();
    this.getAdUrlInsurAdsDeferred = new Deferred();

    const self = this;

    this.callDoubleClickMethod_('getAdUrl', [
      opt_consentTuple,
      opt_rtcResponsesPromise,
      opt_serveNpaSignal,
    ]);

    this.getAdUrlDeferred.promise.then((doubleClickUrl) => {
      const url = new URL(doubleClickUrl);

      if (self.refreshCount_ > 0) {
        console./*Ok*/ log('Refresh count:', self.refreshCount_);

        const adUrl =
          this.slot === '/134642692/amp-samples/amp-MREC'
            ? '/134642692/MREC'
            : '/134642692/MREC_JM';

        const params = url.searchParams;
        params.set('iu', adUrl);
        params.set('sz', '300x250');
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
   * Enables the use of the DoubleClick implementation.
   */
  initDoubleClickHelper() {
    this.getAdUrlInsurAdsDeferred = new Deferred();

    const exceptions = [
      'constructor',
      'buildCallback',
      'onCreativeRender',
      'refresh',
      'extractSize',
      'getAdUrl',
    ];

    // Ensure base DoubleClick implementation
    const iatImpl = AmpAdNetworkInsuradsImpl.prototype;
    const dblImpl = AmpAdNetworkDoubleclickImpl.prototype;
    for (const methodName in dblImpl) {
      if (exceptions.indexOf(methodName) >= 0) {
        iatImpl[
          getCapitalizedMethodWithPrefix(DOUBLECLICK_PREFIX, methodName)
        ] = dblImpl[methodName];
      } else {
        iatImpl[methodName] = dblImpl[methodName];
      }
    }

    AmpAdNetworkInsuradsImpl.prototype.doubleClickGetAdUrl =
      AmpAdNetworkDoubleclickImpl.prototype.getAdUrl;
  }

  /**
   * Calls a DoubleClick implementation method
   * @param {string} methodName - The name of the method to call
   * @param {...*} args - Arguments to pass to the method
   * @return {*} Result of the method call
   * @private
   */
  callDoubleClickMethod_(methodName, ...args) {
    const prefixedName = getCapitalizedMethodWithPrefix(
      DOUBLECLICK_PREFIX,
      methodName
    );
    if (typeof this[prefixedName] === 'function') {
      try {
        return this[prefixedName].apply(this, args);
      } catch (error) {
        console /*OK*/
          .error(`Error calling DoubleClick ${methodName}:`, error);
      }
    } else {
      console /*OK*/
        .warn(`DoubleClick ${methodName} not available`);
    }
    return null;
  }

  /**
   * Handles visibility changes
   * @param {!Object} visibilityData - Visibility data object
   * @private
   */
  onVisibilityChange_(visibilityData) {
    // Store visibility percentage and if is visible for other methods to access
    this.visibilityPercentage_ = visibilityData.visibilityPercentage;
    this.isVisible_ = visibilityData.isViewable;
  }

  /**
   * Handles app initialization messages
   * @param {!Object} message - The app initialization message
   * @private
   */
  handleAppInit_(message) {
    console /*OK*/
      .log('App Init:', message);
  }

  /**
   * Handles unit initialization messages
   * @param {!Object} message - The app initialization message
   * @private
   */
  handleUnitInit_(message) {
    console /*OK*/
      .log('Unit Init:', message);
  }

  /**
   * Handles unit waterfall messages
   * @param {!Object} message - The app initialization message
   * @private
   */
  handleUnitWaterfall_(message) {
    console /*OK*/
      .log('Unit Waterfall:', message);
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdNetworkInsuradsImpl);
});
