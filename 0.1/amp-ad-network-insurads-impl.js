import {Deferred} from '#core/data-structures/promise';

import {Services} from '#service';

import {devAssert} from '#utils/log';

import {ExtensionCommunicator} from './extension';
import {LockedIdGenerator} from './lockedid-generator';
import {MappingService} from './mapping';
import {RealtimeManager} from './realtime';
import {VisibilityTracker} from './visibility-tracking';

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {AmpAdNetworkDoubleclickImpl} from '../../amp-ad-network-doubleclick-impl/0.1/amp-ad-network-doubleclick-impl';

/** @type {string} */
const TAG = 'amp-ad-network-insurads-impl';

export class AmpAdNetworkInsuradsImpl extends AmpA4A {
  /**
   * @param {!Element} element
   */
  constructor(element) {
    super(element);

    /* DoubleClick & AMP */
    this.element.setAttribute('data-enable-refresh', 'false');
    this.initDoubleClickHelper();
    /* DoubleClick& AMP */

    /* InsurAds Business  */
    this.lockedid = new LockedIdGenerator().getLockedIdData();
    this.realtimeInstance = new RealtimeManager().start();
    this.mappingService = new MappingService(this.win);
    this.extension = new ExtensionCommunicator();
    /** @private {?VisibilityTracker} */
    this.visibilityTracker_ = null;

    /** @private {number} */
    this.visibilityPercentage_ = 0;

    /** @private {boolean} */
    this.isVisible_ = false;
    /* InsurAds Business  */

    this.canonicalUrl = Services.documentInfoForDoc(this.element).canonicalUrl;
    console /*OK*/
      .log('Canonical URL:', this.canonicalUrl);
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    console /*OK*/
      .log('Build Callback');

    this.visibilityTracker_ = new VisibilityTracker(
      this.win,
      this.element,
      (visibilityData) => this.onVisibilityChange_(visibilityData)
    );

    this.sendIframeMessage('cfg', {
      sessionId: 'XPTO',
      contextId: 'C3PO',
      appId: 1,
      section: 1,
      g_country: 'PT',
    });
  }

  /** @override */
  onCreativeRender(creativeMetaData, opt_onLoadPromise) {
    super.onCreativeRender(creativeMetaData, opt_onLoadPromise);

    this.sendIframeMessage('adUnitChanged', {
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
    return super.extractSize(responseHeaders);
  }

  /** @override */
  getAdUrl(opt_consentTuple, opt_rtcResponsesPromise, opt_serveNpaSignal) {
    this.getAdUrlDeferred = new Deferred();
    this.getAdUrlInsurAdsDeferred = new Deferred();

    const self = this;
    this.doubleClickGetAdUrl(
      opt_consentTuple,
      opt_rtcResponsesPromise,
      opt_serveNpaSignal
    );

    this.getAdUrlDeferred.promise.then((doubleClickUrl) => {
      const url = new URL(doubleClickUrl);

      if (self.refreshCount_ > 0) {
        console.log('Refresh count:', self.refreshCount_);

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

    const exceptions = ['constructor'];

    // Ensure base DoubleClick implementation
    const iatImpl = AmpAdNetworkInsuradsImpl.prototype;
    const dblImpl = AmpAdNetworkDoubleclickImpl.prototype;
    for (const methodName in dblImpl) {
      if (exceptions.indexOf(methodName) >= 0) {
        iatImpl['doubleClick' + methodName] = dblImpl[methodName];
      } else {
        iatImpl[methodName] = dblImpl[methodName];
      }
    }

    AmpAdNetworkInsuradsImpl.prototype.doubleClickGetAdUrl =
      AmpAdNetworkDoubleclickImpl.prototype.getAdUrl;
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
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAdNetworkInsuradsImpl);
});
